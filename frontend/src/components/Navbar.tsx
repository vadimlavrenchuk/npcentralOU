import { Link } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <h1 className="navbar-title">NP-Central</h1>

      <ul className="navbar-links">
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/equipment">Equipment</Link></li>
        <li><Link to="/workorders">Work Orders</Link></li>
        <li><Link to="/maintenance">Maintenance</Link></li>
        <li><Link to="/inventory">Inventory</Link></li>
      </ul>
    </nav>
  );
}
