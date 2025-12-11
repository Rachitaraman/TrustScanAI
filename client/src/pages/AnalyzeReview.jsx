import { useState } from "react";
import api from "../utils/api.js";
import ReviewCard from "../components/ReviewCard.jsx";
import Loader from "../components/Loader.jsx";

function AnalyzeReview() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [uploadInfo, setUploadInfo] = useState(null);
  const [fileSummary, setFileSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSingleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await api.post("/reviews/analyze", { reviews: [text] });
      setResult(res.data.results[0]);
    } catch (err) { console.error(err); alert("Failed to analyze review"); }
    finally { setLoading(false); }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true); setUploadInfo(null); setFileSummary(null);
    try {
      const res = await api.post("/uploads/file", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setUploadInfo({ s3Key: res.data.s3Key, message: res.data.message });
      setFileSummary(res.data.analysis?.summary ?? null);
    } catch (err) { console.error(err); alert("File upload or analysis failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Analyze Reviews</h2>
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-slate-200">1. Single Review</h3>
        <textarea className="w-full h-28 rounded-lg bg-slate-900 border border-slate-700 p-3 text-sm" placeholder="Paste a review here..." value={text} onChange={(e)=>setText(e.target.value)} />
        <button onClick={handleSingleAnalyze} disabled={!text.trim() || loading} className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 text-sm font-medium disabled:opacity-50">
          Analyze Review
        </button>
        {loading && <Loader />}
        {result && <div className="mt-3"><ReviewCard review={result} /></div>}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-slate-200">2. Upload File (CSV / text)</h3>
        <input type="file" onChange={(e)=>setFile(e.target.files[0])} className="text-xs" />
        <button onClick={handleFileUpload} disabled={!file || loading} className="px-4 py-2 rounded-lg border border-slate-700 text-sm disabled:opacity-50">
          Upload to S3
        </button>

        {uploadInfo && (<div className="mt-3 space-y-1 text-xs text-slate-300"><p>{uploadInfo.message}</p><p className="text-slate-400">S3 key: <span className="text-emerald-300">{uploadInfo.s3Key}</span></p></div>)}

        {fileSummary && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3"><p className="text-slate-400">Total reviews</p><p className="text-lg font-semibold">{fileSummary.total_reviews}</p></div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3"><p className="text-slate-400">Suspicious reviews</p><p className="text-lg font-semibold">{fileSummary.suspicious}</p><p className="text-slate-400 mt-1">Rate: {(fileSummary.suspicious_rate * 100).toFixed(1)}%</p></div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3"><p className="text-slate-400">Average sentiment</p><p className="text-lg font-semibold">{fileSummary.avg_sentiment.toFixed(3)}</p></div>
          </div>
        )}
      </section>
    </div>
  );
}
export default AnalyzeReview;
