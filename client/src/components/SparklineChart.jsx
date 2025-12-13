import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, defs } from "recharts";

export default function SparklineChart({ data = [] }) {
  const sample = data.length ? data : [
    { date: "W1", suspicious: 0.12 },
    { date: "W2", suspicious: 0.15 },
    { date: "W3", suspicious: 0.09 },
    { date: "W4", suspicious: 0.2 },
    { date: "W5", suspicious: 0.13 },
    { date: "W6", suspicious: 0.11 },
  ];

  return (
    <div className="card-glass p-3 neon-outline">
      <div className="text-xs text-muted">Suspicious rate over time</div>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sample}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="date" stroke="var(--muted)" />
            <YAxis tickFormatter={(v) => `${Math.round(v*100)}%`} stroke="var(--muted)" />
            <Tooltip formatter={(val) => `${(val*100).toFixed(1)}%`} />
            <Line type="monotone" dataKey="suspicious" stroke="#06B6D4" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
