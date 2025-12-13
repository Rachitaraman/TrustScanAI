import { useEffect, useState } from "react";
import MetricCard from "../components/MetricCard.jsx";
import SparklineChart from "../components/SparklineChart.jsx";
import api from "../utils/api.js";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchSummary = async () => {
    try {
      const res = await api.get("/summary/latest");

      if (res.data?.ok && res.data.summary) {
        const s = res.data.summary;
        setSummary(s);

        // update chart history
        setHistory(prev => [
          ...prev.slice(-9),
          {
            date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            suspicious: s.suspicious / s.total_reviews,
          }
        ]);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!summary) {
    return <div className="text-muted">Waiting for latest analysis… Upload a file.</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Total Reviews" value={summary.total_reviews} />
        <MetricCard label="Suspicious" value={summary.suspicious} sub={`${(summary.suspicious / summary.total_reviews * 100).toFixed(1)}%`} />
        <MetricCard label="Avg Sentiment" value={summary.avg_sentiment.toFixed(2)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SparklineChart data={history} />

        <div className="card-glass p-4 neon-outline">
          <h3 className="text-sm text-muted">Top flagged reviews</h3>
          <div className="mt-3 space-y-3">
            {(summary.top_flagged ?? []).slice(0, 4).map((r, i) => (
              <div key={i} className="rounded-lg p-3 bg-white/3">
                <div className="text-sm">{r.text}</div>
                <div className="text-xs text-muted mt-1">Score: {(r.probability * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
