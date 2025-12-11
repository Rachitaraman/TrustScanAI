from flask import Flask, request, jsonify
import joblib
from pathlib import Path
import os
import io
import pandas as pd
import boto3

from utils.preprocess import clean_text
from utils.sentiment import get_sentiment_score
from utils.keywords import extract_keywords

app = Flask(__name__)

MODEL_PATH = Path("model/review_model.pkl")
model = None

AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
AWS_BUCKET = os.getenv("AWS_S3_BUCKET")

def load_model():
    global model
    if model is None:
        if not MODEL_PATH.exists():
            print("WARNING: model file not found, using dummy logic.")
            model = None
        else:
            model = joblib.load(MODEL_PATH)
            print("Loaded model from", MODEL_PATH)

load_model()

def analyze_batch(texts):
    results = []
    for text in texts:
        text = str(text)
        cleaned = clean_text(text)
        sentiment = get_sentiment_score(text)

        if model is not None:
            proba = float(model.predict_proba([cleaned])[0][1])
            label = "suspicious" if proba >= 0.5 else "genuine"
        else:
            label = "suspicious" if sentiment < -0.2 else "genuine"
            proba = None

        results.append({
            "text": text,
            "sentiment": sentiment,
            "label": label,
            "probability": proba,
            "keywords": extract_keywords(text),
        })
    return results

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json(force=True)
    reviews = data.get("reviews", [])
    if not isinstance(reviews, list) or len(reviews) == 0:
        return jsonify({"error": "Field 'reviews' must be a non-empty list"}), 400
    results = analyze_batch(reviews)
    return jsonify({"results": results})

@app.route("/analyze-file", methods=["POST"])
def analyze_file():
    data = request.get_json(force=True)
    s3_key = data.get("s3_key")
    if not s3_key:
        return jsonify({"error": "Missing 's3_key'"}), 400
    if not AWS_BUCKET:
        return jsonify({"error": "Server missing AWS_S3_BUCKET env"}), 500

    s3 = boto3.client("s3", region_name=AWS_REGION)
    try:
        obj = s3.get_object(Bucket=AWS_BUCKET, Key=s3_key)
        raw = obj["Body"].read()
        df = pd.read_csv(io.BytesIO(raw))
    except Exception as e:
        print("S3 read error:", e)
        return jsonify({"error": "Failed to read file from S3"}), 500

    # flexible column selection
    text_col = None
    for col in ["text", "text_", "review", "review_text", "reviewText", "content", "body"]:
        if col in df.columns:
            text_col = col
            break
    if text_col is None:
        return jsonify({"error": "CSV must contain a 'text' or similar column"}), 400

    texts = df[text_col].astype(str).tolist()
    results = analyze_batch(texts)

    total = len(results)
    suspicious = sum(1 for r in results if r["label"] == "suspicious")
    avg_sentiment = sum(r["sentiment"] for r in results) / total if total else 0.0

    resp = {
        "summary": {
            "total_reviews": total,
            "suspicious": suspicious,
            "suspicious_rate": suspicious / total if total else 0.0,
            "avg_sentiment": avg_sentiment,
        },
        "results": results[:100],
    }
    return jsonify(resp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
