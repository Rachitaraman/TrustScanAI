import React from "react";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar(){
  return (
    <header className="w-full sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white font-extrabold shadow-lg">
            RG
          </div>
          <div>
            <div className="text-sm font-semibold">Review <span className="text-amber-300">Guardian</span></div>
            <div className="text-xs text-muted">AI review detector • v1.0</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-white/3 border border-white/5 rounded-full px-3 py-1 text-sm text-muted">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2 text-[#7C3AED]" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4a6 6 0 100 12 6 6 0 000-12z"/><path d="M21 21l-4.35-4.35"/></svg>
            Search reviews...
          </div>

          <ThemeToggle />

          <button className="btn-gradient px-3 py-2 rounded-full text-sm hover:opacity-95">Analyze</button>
        </div>
      </div>
    </header>
  );
}
