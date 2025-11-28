import Navbar from "../components/Navbar";
import "../styles/layout.css";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
