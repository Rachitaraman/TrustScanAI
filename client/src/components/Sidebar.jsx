import { Link, useLocation } from "react-router-dom";
const links = [{ to: "/", label: "Home" }, { to: "/dashboard", label: "Dashboard" }, { to: "/analyze", label: "Analyze Review" }];

function Sidebar({ open }) {
  const location = useLocation();
  return (
    <aside className={`border-r border-slate-800 bg-slate-900/80 h-screen sticky top-0 ${open ? "w-56" : "w-16"} overflow-hidden`}>
      <nav className="mt-16 flex flex-col gap-1">
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link key={link.to} to={link.to} className={`px-4 py-2 text-sm ${active ? "bg-emerald-500/10 text-emerald-300" : "text-slate-300 hover:bg-slate-800"}`}>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
export default Sidebar;
