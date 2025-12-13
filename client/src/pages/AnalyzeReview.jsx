import { useState } from "react";
import api from "../utils/api.js";
import ReviewCard from "../components/ReviewCard.jsx";
import Loader from "../components/Loader.jsx";
import toast from "react-hot-toast";

export default function AnalyzeReview(){
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [uploadInfo, setUploadInfo] = useState(null);
  const [fileSummary, setFileSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSingleAnalyze = async () => {
    if (!text.trim()) return toast.error("Enter a review!");
    setLoading(true); setResult(null);
    try {
      const res = await api.post("/reviews/analyze", { reviews: [text] });
      setResult(res.data.results[0]);
      toast.success("Review analyzed ✔️");
    } catch (err) {
      console.error(err);
      toast.error("Analyze failed 😭");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return toast.error("Choose a file!");
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true); setUploadInfo(null); setFileSummary(null);

    try {
      const res = await api.post("/uploads/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadInfo({ s3Key: res.data.s3Key, message: res.data.message });
      setFileSummary(res.data.analysis?.summary ?? null);

      toast.success("File uploaded & analyzed 🎉 Dashboard updated!");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed 😭");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analyze Reviews</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* SINGLE REVIEW */}
        <div className="card-glass p-4 neon-outline">
          <h3 className="text-sm font-semibold">1. Single Review</h3>

          <textarea
            className="w-full mt-2 p-3 rounded-lg bg-transparent border border-white/6 text-sm"
            placeholder="Paste a review..."
            value={text}
            onChange={e => setText(e.target.value)}
          />

          <div className="mt-3 flex items-center gap-3">
            <button onClick={handleSingleAnalyze} className="btn-gradient px-4 py-2 rounded-full">Analyze</button>
            <button onClick={() => { setText(""); setResult(null); }} className="px-3 py-2 rounded-full bg-white/5">Clear</button>
          </div>

          {loading && <Loader />}
          {result && <div className="mt-4"><ReviewCard review={result} /></div>}
        </div>

        {/* FILE UPLOAD */}
        <div className="card-glass p-4 neon-outline">
          <h3 className="text-sm font-semibold">2. Upload File</h3>
          <p className="text-xs text-muted">CSV with review text (text/text_/reviewText)</p>

          <input type="file" className="mt-3" onChange={e => setFile(e.target.files[0])} />

          <div className="mt-3 flex gap-2">
            <button onClick={handleFileUpload} className="btn-gradient px-4 py-2 rounded-full">Upload & Analyze</button>
            <button onClick={() => setFile(null)} className="px-3 py-2 rounded-full bg-white/5">Cancel</button>
          </div>

          {uploadInfo && (
            <div className="mt-3 text-xs">
              <div className="text-muted">{uploadInfo.message}</div>
              <div className="text-amber-300">{uploadInfo.s3Key}</div>
            </div>
          )}

          {fileSummary && (
            <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-md bg-white/4 text-center">
                <div className="text-sm text-muted">Total</div>
                <div className="text-xl font-bold">{fileSummary.total_reviews}</div>
              </div>
              <div className="p-3 rounded-md bg-white/4 text-center">
                <div className="text-sm text-muted">Suspicious</div>
                <div className="text-xl font-bold text-rose-300">{fileSummary.suspicious}</div>
              </div>
              <div className="p-3 rounded-md bg-white/4 text-center">
                <div className="text-sm text-muted">Avg Sent</div>
                <div className="text-xl font-bold">{fileSummary.avg_sentiment.toFixed(2)}</div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
