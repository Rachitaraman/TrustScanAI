import React from "react";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import AnimatedHero from "./AnimatedHero.jsx";

export default function Layout({ children, sidebarOpen=true }){
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-2xl card-glass p-6 mb-6 neon-outline header-shimmer">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold">Detect fake reviews — <span className="text-amber-300">instantly</span></h1>
                  <p className="text-sm text-muted mt-1">Upload a file or paste reviews. Our AI flags suspicious reviews and shows analytics.</p>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="chip" style={{background:"linear-gradient(90deg,#7C3AED,#06B6D4)", color:"white"}}>Realtime</div>
                  <div className="chip" style={{background:"rgba(255,255,255,0.03)", color:"var(--muted)"}}>Model: TF-IDF + LR</div>
                  <button className="btn-gradient px-4 py-2 rounded-full">Get started</button>
                </div>
              </div>

              <AnimatedHero className="mt-6" />
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
