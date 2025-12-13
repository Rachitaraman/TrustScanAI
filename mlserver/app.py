# mlserver/app.py
"""
Flask ML microservice for Review Guardian.

Endpoints:
 - POST /analyze
    body: { "reviews": ["text1", "text2", ...] }

 - POST /analyze-file
    body: { "s3_key": "uploads/xxx.csv" }

Notes:
 - Expects trained model at model/review_model.pkl (joblib pipeline)
 - Uses boto3 to read CSV from S3 in /analyze-file
 - Uses utils.* modules for preprocessing, sentiment, keywords
"""

import os
import io
from pathlib import Path
from typing import List, Optional

import joblib
import boto3
import pandas as pd
from flask import Flask, request, jsonify

from utils.preprocess import clean_text
from utils.sentiment import get_sentiment_score
from utils.keywords import extract_keywords

# Config via env
MODEL_PATH = Path("model/review_model.pkl")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
AWS_BUCKET = os.getenv("AWS_S3_BUCKET")  # required for analyze-file
# threshold for suspicious by probability (you can tweak)
SUSPICIOUS_THRESHOLD = float(os.getenv("SUSPICIOUS_THRESHOLD", 0.5))

app = Flask(__name__)

# Global model variable (pipeline)
model = None

def load_model() -> None:
    """Load the joblib pipeline if available."""
    global model
    if model is not None:
        return
    if MODEL_PATH.exists():
        try:
            model = joblib.load(MODEL_PATH)
            print("Loaded model from", MODEL_PATH)
        except Exception as e:
            print("Failed to load model:", e)
            model = None
    else:
        print("Model file not found at", MODEL_PATH, "- running in fallback/dummy mode")
        model = None

# Call once on startup
load_model()

def _detect_suspicious_index(pipeline) -> int:
    """
    Determine which index in predict_proba corresponds to the 'suspicious' class.
    Returns index (int). Fallback to 1.
    """
    try:
        # If pipeline is sklearn Pipeline, the classifier is usually at named_steps['clf']
        clf = None
        if hasattr(pipeline, "named_steps"):
            # try common names
            for name in ("clf", "classifier", "model"):
                if name in pipeline.named_steps:
                    clf = pipeline.named_steps[name]
                    break
            # fallback to last step
            if clf is None:
                # last step object
                clf = list(pipeline.named_steps.values())[-1]
        else:
            clf = pipeline

        classes = getattr(clf, "classes_", None)
        if classes is not None:
            suspicious_tokens = {"fake", "f", "deceptive", "spam", "fraud", "suspicious", "1"}
            for idx, cls in enumerate(classes):
                if any(tok in str(cls).lower() for tok in suspicious_tokens):
                    return idx
            # if classes are numeric [0,1], then suspicious is likely 1
            if all(str(c).isdigit() for c in classes) and set(classes) >= {"0","1"} or set(classes) >= {0,1}:
                return int(list(classes).index(1)) if 1 in list(classes) else 1
    except Exception as e:
        print("Warning: failed to detect suspicious index:", e)
    # default fallback
    return 1

def analyze_batch(texts: List[str]) -> List[dict]:
    """
    Analyze a list of raw review texts and return structured results.
    Each result contains: text, sentiment, label, probability, keywords
    """
    load_model()
    results = []

    # determine suspicious class index once per batch (if model present)
    suspicious_index = None
    if model is not None:
        try:
            suspicious_index = _detect_suspicious_index(model)
        except Exception:
            suspicious_index = 1
    else:
        suspicious_index = 1

    for text in texts:
        raw_text = str(text)
        cleaned = clean_text(raw_text)
        sentiment = get_sentiment_score(raw_text)

        if model is not None:
            try:
                proba_all = model.predict_proba([cleaned])[0]  # returns array like [p_class0, p_class1]
                # clamp index safety
                if suspicious_index < 0 or suspicious_index >= len(proba_all):
                    suspicious_index = 1 if len(proba_all) > 1 else 0
                prob_suspicious = float(proba_all[suspicious_index])
                label = "suspicious" if prob_suspicious >= SUSPICIOUS_THRESHOLD else "genuine"
                probability = prob_suspicious
            except Exception as e:
                # fallback if model fails at predict time
                print("Model prediction error:", e)
                probability = None
                label = "suspicious" if sentiment < -0.2 else "genuine"
        else:
            # fallback dummy rule if model missing
            probability = None
            label = "suspicious" if sentiment < -0.2 else "genuine"

        results.append({
            "text": raw_text,
            "sentiment": sentiment,
            "label": label,
            "probability": probability,
            "keywords": extract_keywords(raw_text)
        })

    return results

@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Direct analyze endpoint: expects JSON {"reviews": ["...","..."]}
    """
    data = request.get_json(force=True, silent=True) or {}
    reviews = data.get("reviews", [])
    if not isinstance(reviews, list) or len(reviews) == 0:
        return jsonify({"error": "Field 'reviews' must be a non-empty list"}), 400

    try:
        results = analyze_batch(reviews)
        return jsonify({"results": results})
    except Exception as e:
        print("Analyze error:", e)
        return jsonify({"error": "Internal analyze error", "details": str(e)}), 500

@app.route("/analyze-file", methods=["POST"])
def analyze_file():
    """
    Analyze a CSV file stored in S3.
    Expects JSON: { "s3_key": "uploads/xxx.csv" }
    CSV should contain a review text column (detected flexibly).
    """
    data = request.get_json(force=True, silent=True) or {}
    s3_key = data.get("s3_key", None)
    if not s3_key:
        return jsonify({"error": "Missing 's3_key' in request body"}), 400
    if not AWS_BUCKET:
        return jsonify({"error": "Server missing AWS_S3_BUCKET environment variable"}, 500)

    # setup boto3 client
    s3 = boto3.client("s3", region_name=AWS_REGION)

    try:
        obj = s3.get_object(Bucket=AWS_BUCKET, Key=s3_key)
        raw = obj["Body"].read()
        # read into pandas (flexibly)
        df = pd.read_csv(io.BytesIO(raw), low_memory=False)
    except Exception as e:
        print("S3 read error:", e)
        return jsonify({"error": "Failed to read file from S3", "details": str(e)}), 500

    # detect review text column
    possible_text_cols = ["text", "text_", "review", "review_text", "reviewText", "content", "body", "reviewBody"]
    text_col = next((c for c in possible_text_cols if c in df.columns), None)
    if text_col is None:
        # fallback: pick the object column with largest avg length
        obj_cols = [c for c in df.columns if df[c].dtype == object]
        if obj_cols:
            avg_len = {c: df[c].astype(str).map(len).mean() for c in obj_cols}
            text_col = max(avg_len, key=avg_len.get)
            print(f"Fallback chosen text column: {text_col}")
        else:
            return jsonify({"error": "CSV must contain a text-like column (e.g. 'text' or 'text_')"}), 400

    texts = df[text_col].astype(str).tolist()
    try:
        results = analyze_batch(texts)
    except Exception as e:
        print("Batch analyze error:", e)
        return jsonify({"error": "Failed during analysis", "details": str(e)}), 500

    # prepare summary
    total = len(results)
    suspicious = sum(1 for r in results if r["label"] == "suspicious")
    avg_sent = sum(r["sentiment"] for r in results) / total if total else 0.0

    summary = {
        "total_reviews": total,
        "suspicious": suspicious,
        "suspicious_rate": suspicious / total if total else 0.0,
        "avg_sentiment": avg_sent
    }

    # cap results to 500 items to avoid huge payloads
    return jsonify({"summary": summary, "results": results[:500]})

if __name__ == "__main__":
    # Optionally set debug to False for production
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5001)), debug=True)


