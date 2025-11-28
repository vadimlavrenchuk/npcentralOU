import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import "../styles/layout/MainLayout.css";

export default function MainLayout() {
  return (
    <div className="layout-container">
      <Sidebar />

      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
}
