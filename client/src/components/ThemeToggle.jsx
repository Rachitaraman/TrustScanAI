import { useEffect, useState } from "react";

export default function ThemeToggle(){
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("rg_theme") || "dark"; } catch { return "dark"; }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "dark");
    try { localStorage.setItem("rg_theme", theme); } catch {}
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="px-3 py-2 rounded-full bg-white/3 text-sm backdrop-blur hover:opacity-90"
      title="Toggle theme"
    >
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
