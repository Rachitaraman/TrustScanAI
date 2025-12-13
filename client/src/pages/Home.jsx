import React from "react";
import { Link } from "react-router-dom";

export default function Home(){
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold">Welcome to <span className="grad-text">Review Guardian</span></h1>
      <p className="text-muted max-w-xl">Paste a review, upload a CSV, or explore the dashboard to find suspicious reviews powered by TF-IDF + Logistic Regression.</p>

      <div className="flex gap-3">
        <Link to="/analyze" className="btn-gradient px-4 py-2 rounded-full">Analyze a Review</Link>
        <Link to="/dashboard" className="px-4 py-2 rounded-full bg-white/5">View Dashboard</Link>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-glass p-4 neon-outline hover-lift">
          <div className="text-xs text-muted">How it works</div>
          <h3 className="font-semibold mt-2">Upload & Analyze</h3>
          <p className="text-sm text-muted mt-2">Upload a CSV with reviews and we analyze them in batches.</p>
        </div>
        <div className="card-glass p-4 neon-outline hover-lift">
          <div className="text-xs text-muted">Model</div>
          <h3 className="font-semibold mt-2">TF-IDF + LR</h3>
          <p className="text-sm text-muted mt-2">Lightweight and explainable — perfect for demo and prototyping.</p>
        </div>
        <div className="card-glass p-4 neon-outline hover-lift">
          <div className="text-xs text-muted">Export</div>
          <h3 className="font-semibold mt-2">CSV & JSON</h3>
          <p className="text-sm text-muted mt-2">Download flagged reviews or summaries for reports.</p>
        </div>
      </div>
    </div>
  );
}
