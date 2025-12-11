# mlserver/model/train_model.py

from pathlib import Path
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Import project utils (this assumes you run this as a module: `python -m model.train_model`)
from utils.preprocess import clean_text

# Paths
DATA_PATH = Path("data/reviews.csv")
MODEL_DIR = Path("model")
MODEL_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = MODEL_DIR / "review_model.pkl"


def detect_text_label_columns(df: pd.DataFrame):
    """Auto-detect text and label columns. Returns (text_col, label_col)."""
    # common candidates (order matters)
    text_candidates = [
        "text", "text_", "review", "review_text", "reviewText", "content", "body", "reviewBody"
    ]
    label_candidates = ["label", "is_fake", "fake", "target", "class", "y"]

    text_col = next((c for c in text_candidates if c in df.columns), None)
    if text_col is None:
        # fallback: choose the object column with largest avg length
        obj_cols = [c for c in df.columns if df[c].dtype == object]
        if not obj_cols:
            raise ValueError("No text-like column found in dataset. Add a 'text' column.")
        avg_len = {c: df[c].astype(str).map(len).mean() for c in obj_cols}
        text_col = max(avg_len, key=avg_len.get)
        print(f"WARNING: Falling back to guessed text column: '{text_col}'")

    label_col = next((c for c in label_candidates if c in df.columns), None)
    if label_col is None:
        # fallback: take a short categorical column (not the text)
        other_obj = [c for c in df.columns if c != text_col and df[c].dtype == object]
        if other_obj:
            label_col = other_obj[0]
            print(f"WARNING: Falling back to guessed label column: '{label_col}'")
        else:
            numeric_cols = [c for c in df.columns if c != text_col and pd.api.types.is_numeric_dtype(df[c].dtype)]
            if numeric_cols:
                label_col = numeric_cols[0]
                print(f"WARNING: Falling back to numeric label column: '{label_col}'")
            else:
                raise ValueError("No label column found. Add a 'label' column (0/1) or similar.")

    return text_col, label_col


def map_labels_to_binary(series: pd.Series) -> pd.Series:
    """
    Convert various label encodings into binary 0 (genuine) / 1 (fake).
    Tries sensible heuristics and prints mapping for review.
    """
    # Drop NA for detection
    sample_vals = [str(x).strip() for x in pd.Series(series).dropna().unique().tolist()]
    print("DEBUG: Raw label unique sample:", sample_vals[:20])

    # If numeric, try coercion and binary check
    if pd.api.types.is_numeric_dtype(series.dtype):
        vals = sorted(pd.Series(series).dropna().unique().tolist())
        if set(vals) <= {0, 1}:
            print("DEBUG: Numeric binary labels detected:", vals)
            return series.astype(int)
        else:
            # map smallest -> 0, rest -> 1
            smallest = vals[0]
            print(f"WARNING: Numeric labels not binary. Mapping {smallest} -> 0, others -> 1.")
            return series.apply(lambda x: 0 if x == smallest else 1).astype(int)

    # handle string labels
    lowered = [v.lower() for v in sample_vals]
    mapping = {}
    genuine_tokens = ["g", "good", "true", "truthful", "real", "credible", "authentic", "genuine", "cg"]
    fake_tokens = ["f", "fake", "deceptive", "spam", "fraud", "bot", "suspicious"]

    # try token-based detection
    for orig, low in zip(sample_vals, lowered):
        if any(tok in low for tok in genuine_tokens):
            mapping[orig] = 0
        elif any(tok in low for tok in fake_tokens):
            mapping[orig] = 1

    # If mapping empty and two unique values, map first->0, second->1
    if not mapping:
        if len(sample_vals) == 2:
            mapping[sample_vals[0]] = 0
            mapping[sample_vals[1]] = 1
            print(f"DEBUG: Two-class string labels detected. Mapping: {sample_vals[0]}->0, {sample_vals[1]}->1")
        else:
            # fallback: most frequent -> 0, others -> 1
            freq = series.astype(str).value_counts().to_dict()
            most_freq = max(freq, key=freq.get)
            mapping = {k: (0 if k == most_freq else 1) for k in freq.keys()}
            print("WARNING: Complex string labels detected. Mapping most frequent -> 0, others -> 1.")
            print("DEBUG mapping preview:", dict(list(mapping.items())[:10]))

    # apply mapping (unknowns -> 1)
    mapped = series.astype(str).map(lambda x: mapping.get(str(x), 1)).astype(int)
    uniq = sorted(mapped.unique().tolist())
    if set(uniq) - {0, 1}:
        raise ValueError("Label mapping failed to produce binary labels (0/1). Inspect input labels.")
    print("DEBUG: Final label distribution:", mapped.value_counts().to_dict())
    return mapped


def load_data():
    """Load CSV and return DataFrame with columns: text, label, text_clean"""
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Training CSV not found at {DATA_PATH.resolve()}")

    print("Loading data from:", DATA_PATH)
    df = pd.read_csv(DATA_PATH, low_memory=False)

    print("DEBUG: Original columns:", list(df.columns))

    text_col, label_col = detect_text_label_columns(df)
    print(f"Using text column: '{text_col}', label column: '{label_col}'")

    df["text"] = df[text_col].astype(str)
    df["label"] = map_labels_to_binary(df[label_col])

    # Basic stats
    print("DEBUG: Loaded rows:", len(df))
    print("DEBUG: Label counts:", df["label"].value_counts().to_dict())

    # Clean text for training
    df["text_clean"] = df["text"].apply(clean_text)

    return df


def build_pipeline(max_features=5000):
    pipe = Pipeline(
        [
            ("tfidf", TfidfVectorizer(max_features=max_features, ngram_range=(1, 2))),
            ("clf", LogisticRegression(max_iter=400, solver="liblinear")),
        ]
    )
    return pipe


def train(test_size=0.2, random_state=42):
    df = load_data()

    X = df["text_clean"].astype(str)
    y = df["label"].astype(int)

    # ensure stratify if possible
    stratify = y if len(y.unique()) > 1 else None

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=stratify
    )

    print(f"Training on {len(X_train)} samples, validating on {len(X_test)} samples...")

    pipe = build_pipeline()
    pipe.fit(X_train, y_train)

    # evaluate
    y_pred = pipe.predict(X_test)
    y_proba = pipe.predict_proba(X_test)[:, 1] if hasattr(pipe, "predict_proba") else None

    acc = accuracy_score(y_test, y_pred)
    print(f"Validation Accuracy: {acc:.4f}")
    print("Classification Report:\n", classification_report(y_test, y_pred))
    print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))

    # Save model
    joblib.dump(pipe, MODEL_PATH)
    print(f"Saved trained pipeline to: {MODEL_PATH.resolve()}")

    return pipe, (X_test, y_test, y_pred, y_proba)


if __name__ == "__main__":
    print("=== Review Guardian: Training script ===")
    try:
        pipeline, _ = train()
        print("Training finished successfully 🎉")
    except Exception as e:
        print("Training failed:", str(e))
        raise
