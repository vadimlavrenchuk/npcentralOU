import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../components/Sidebar";
import "../styles/layout/MainLayout.scss";

export default function MainLayout() {
  return (
    <div className="layout-container">
      <Sidebar />

      <main className="layout-content">
        <Outlet />
        <ToastContainer position="top-right" hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </main>
    </div>
  );
}
