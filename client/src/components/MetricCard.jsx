function MetricCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs uppercase text-slate-400">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      {sub && <p className="text-xs mt-1 text-slate-400">{sub}</p>}
    </div>
  );
}
export default MetricCard;
