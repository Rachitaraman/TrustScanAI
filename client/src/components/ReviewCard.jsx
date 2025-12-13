import { motion } from "framer-motion";

export default function ReviewCard({ review }) {
  return (
    <motion.div layout initial={{ opacity: 0.8 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-xl card-glass p-4 neon-outline hover-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm text-slate-100">{review.text}</p>
          <div className="mt-3 flex gap-2 items-center flex-wrap">
            {review.keywords?.slice(0,6).map(k => <span key={k} className="text-xs bg-white/3 px-2 py-1 rounded-md">{k}</span>)}
          </div>
        </div>
        <div className="text-right">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${review.label === "suspicious" ? "bg-rose-500/20 text-rose-300" : "bg-emerald-400/10 text-emerald-300"}`}>
            {review.label === "suspicious" ? "🚩 Suspicious" : "✅ Genuine"}
          </div>
          {typeof review.probability === "number" && (
            <div className="mt-2 text-xs text-muted">{(review.probability*100).toFixed(1)}%</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
