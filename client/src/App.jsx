import { useState } from "react";
import axios from "axios";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/reviews/analyze", {
        reviews: [text],
      });
      setResult(res.data.results[0]);
    } catch (err) {
      console.error(err);
      alert("Error analyzing review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Review Guardian</h1>
      <textarea
        rows={4}
        cols={50}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste an Amazon review here..."
      />
      <br />
      <button onClick={analyze} disabled={loading || !text.trim()}>
        {loading ? "Analyzing..." : "Check Fake / Genuine"}
      </button>

      {result && (
        <div style={{ marginTop: 16 }}>
          <p><b>Label:</b> {result.label}</p>
          <p><b>Sentiment:</b> {result.sentiment.toFixed(3)}</p>
          <p><b>Keywords:</b> {result.keywords.join(", ")}</p>
        </div>
      )}
    </div>
  );
}

export default App;
