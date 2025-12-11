function ReviewCard({ review }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm space-y-1">
      <p className="text-slate-200">{review.text}</p>
      <p className="text-xs text-slate-400">
        Sentiment: {typeof review.sentiment === "number" ? review.sentiment.toFixed(3) : review.sentiment} • Label:{" "}
        <span className={review.label === "suspicious" ? "text-rose-400" : "text-emerald-400"}>{review.label}</span>
      </p>
      {review.keywords?.length > 0 && (<p className="text-xs text-slate-400">Keywords: {review.keywords.join(", ")}</p>)}
    </div>
  );
}
export default ReviewCard;
