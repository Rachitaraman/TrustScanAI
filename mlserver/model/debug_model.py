# mlserver/debug_model.py
from pathlib import Path
import joblib
import pandas as pd
from utils.preprocess import clean_text

MODEL_PATH = Path("model/review_model.pkl")
DATA_PATH = Path("data/reviews.csv")

if not MODEL_PATH.exists():
    print("Model not found at", MODEL_PATH)
    raise SystemExit(1)

pipe = joblib.load(MODEL_PATH)
print("Loaded pipeline:", pipe)

# show classifier classes order
clf = None
try:
    # if pipeline structure is Pipeline([...('clf', LogisticRegression())])
    clf = pipe.named_steps.get("clf", None) or pipe.named_steps.get("classifier", None)
except Exception:
    pass

if clf is not None:
    print("Classifier classes_:", getattr(clf, "classes_", "no classes_ attribute"))

# show a few sample predictions & probabilities from train data
if DATA_PATH.exists():
    df = pd.read_csv(DATA_PATH, low_memory=False)
    # detect text column heuristically
    text_col = next((c for c in ["text","text_","review","review_text","reviewText","content","body"] if c in df.columns), None)
    print("Using text column:", text_col)
    if text_col is None:
        print("No text column found in dataset.")
    else:
        sample = df[text_col].astype(str).head(10).tolist()
        cleaned = [clean_text(t) for t in sample]
        proba = pipe.predict_proba(cleaned) if hasattr(pipe, "predict_proba") else None
        preds = pipe.predict(cleaned)
        for i, t in enumerate(sample):
            ptxt = f"pred={preds[i]}"
            if proba is not None:
                ptxt += f", proba={proba[i].tolist()}"
            print(f"--- SAMPLE {i} ---")
            print(t[:200])
            print(ptxt)
else:
    print("No dataset found at", DATA_PATH)
