from flask import Flask, request, jsonify
from textblob import TextBlob  # or use nltk/vader later

app = Flask(__name__)

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    reviews = data.get("reviews", [])

    results = []
    for text in reviews:
        sentiment = TextBlob(text).sentiment.polarity
        label = "genuine" if sentiment > -0.2 else "suspicious"  # dummy logic
        results.append({
            "text": text,
            "sentiment": sentiment,
            "label": label,
            "keywords": list(set(word.lower() for word in text.split() if len(word) > 4))
        })

    return jsonify({"results": results})

if __name__ == "__main__":
    app.run(port=5001, debug=True)
