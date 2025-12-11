def extract_keywords(text: str, min_len: int = 4):
    words = set()
    for w in text.split():
        w = w.lower().strip(",.!?;:()[]{}\"'")
        if len(w) >= min_len:
            words.add(w)
    return list(words)
