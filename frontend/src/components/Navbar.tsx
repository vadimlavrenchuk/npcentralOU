import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 shadow-md flex items-center justify-between">
      <h1 className="text-2xl font-bold">NP-Central</h1>

      <ul className="flex space-x-6 text-lg">
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/equipment">Equipment</Link></li>
        <li><Link to="/workorders">Work Orders</Link></li>
        <li><Link to="/maintenance">Maintenance</Link></li>
        <li><Link to="/inventory">Inventory</Link></li>
      </ul>
    </nav>
  );
}
