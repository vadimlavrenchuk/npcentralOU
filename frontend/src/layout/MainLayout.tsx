import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/layout/MainLayout.scss";

export default function MainLayout() {
  const location = useLocation();
  const hideSidebar = location.pathname === "/" || location.pathname.startsWith("/dashboard");

  return (
    <div className="layout-container">
      {!hideSidebar && <Sidebar />}

      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
}
