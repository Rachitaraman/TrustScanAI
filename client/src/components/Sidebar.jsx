import React from "react";
import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/analyze", label: "Analyze", icon: "🔍" },
];

export default function Sidebar({ open=true }){
  const loc = useLocation();
  return (
    <aside className={`h-screen sticky top-0 transition-all ${open ? "w-60" : "w-16"} border-r border-white/6 bg-transparent`}>
      <div className="p-4 space-y-4">
        <div className="rounded-xl card-glass p-3 neon-outline">
          <div className="text-xs text-muted">Hello,</div>
          <div className="font-semibold text-white">Roshita ✨</div>
          <div className="text-xs text-muted mt-1">Student • ML Lover</div>
        </div>

        <nav className="mt-4 flex flex-col gap-2">
          {links.map(l => {
            const active = loc.pathname === l.to;
            return (
              <Link key={l.to} to={l.to} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${active ? "bg-gradient-to-r from-[#7C3AED]/10 to-[#06B6D4]/8 neon-outline hover-lift" : "hover:bg-white/3"} text-sm`}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 text-xl">{l.icon}</div>
                <div>
                  <div className={`font-medium ${active ? "text-white" : "text-[#cbd5e1]"}`}>{l.label}</div>
                  {active && <div className="text-xs text-muted">Live</div>}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
