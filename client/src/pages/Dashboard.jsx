import MetricCard from "../components/MetricCard.jsx";
function Dashboard() {
  const totalReviews = 120;
  const suspicious = 18;
  const suspiciousRate = ((suspicious / totalReviews) * 100).toFixed(1);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Total Reviews" value={totalReviews} />
        <MetricCard label="Suspicious Reviews" value={suspicious} />
        <MetricCard label="Suspicious Rate" value={`${suspiciousRate}%`} sub="based on last batch analyzed" />
      </div>
    </div>
  );
}
export default Dashboard;
