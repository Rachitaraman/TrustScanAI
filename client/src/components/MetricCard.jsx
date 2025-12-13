export default function MetricCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl card-glass p-4 neon-outline hover-lift">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted">{label}</div>
        <div className="text-xs px-2 py-1 rounded-md bg-white/3 text-white">{sub ?? "live"}</div>
      </div>
      <div className="mt-3 text-3xl font-extrabold grad-text">
        {value}
      </div>
    </div>
  );
}
