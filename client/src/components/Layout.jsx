import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

function Layout({ children, sidebarOpen }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
export default Layout;
