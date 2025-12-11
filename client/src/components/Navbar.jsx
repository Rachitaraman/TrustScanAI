function Navbar() {
  return (
    <header className="w-full border-b border-slate-800 bg-slate-900/70 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-wide">
          Review<span className="text-emerald-400">Guardian</span>
        </span>
        <span className="text-xs text-slate-400">AI review intelligence</span>
      </div>
    </header>
  );
}
export default Navbar;
