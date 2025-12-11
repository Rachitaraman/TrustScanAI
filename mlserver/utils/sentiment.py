from textblob import TextBlob
def get_sentiment_score(text: str) -> float:
    try:
        return float(TextBlob(text).sentiment.polarity)
    except Exception:
        return 0.0
