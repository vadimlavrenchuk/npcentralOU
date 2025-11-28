import { BrowserRouter, Route, Routes } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Equipment from "../pages/Equipment";
import Inventory from "../pages/Inventory";
import Maintenance from "../pages/Maintenance";
import WorkOrders from "../pages/WorkOrders";

import MainLayout from "../layout/MainLayout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Глобальный layout для всех страниц */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/workorders" element={<WorkOrders />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/inventory" element={<Inventory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
