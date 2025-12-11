import { Link } from "react-router-dom";
function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Welcome to <span className="text-emerald-400">Review Guardian</span></h1>
      <p className="text-slate-300 max-w-xl text-sm">Paste a review, upload a file, or explore analytics to spot suspicious reviews.</p>
      <div className="flex gap-3">
        <Link to="/analyze" className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 text-sm font-medium">Analyze a Review</Link>
        <Link to="/dashboard" className="px-4 py-2 rounded-lg border border-slate-700 text-sm">View Dashboard</Link>
      </div>
    </div>
  );
}
export default Home;
