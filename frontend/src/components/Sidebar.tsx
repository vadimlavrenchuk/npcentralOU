import { Link } from "react-router-dom";
import "../styles/components/Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">NP-Central</div>

      <nav className="sidebar-menu">
        <Link to="/">Dashboard</Link>
        <Link to="/equipment">Equipment</Link>
        <Link to="/workorders">Work Orders</Link>
        <Link to="/maintenance">Maintenance</Link>
        <Link to="/inventory">Inventory</Link>
      </nav>
    </aside>
  );
}
