import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/pages/dashboard.scss";

type Part = { id: number; name: string; partNumber: string; quantity: number };

export default function Dashboard() {
  const { t } = useTranslation();

  const cards = [
    { to: "/maintenance", title: t("nav.maintenance"), color: "bg-yellow-400 text-black", icon: "🛠" },
    { to: "/equipment", title: t("nav.equipment"), color: "bg-green-500 text-white", icon: "⚙️" },
    { to: "/workorders", title: t("nav.workorders"), color: "bg-red-500 text-white", icon: "📋" },
    { to: "/inventory", title: t("nav.inventory"), color: "bg-white text-gray-900 border border-gray-200", icon: "📦" },
  ];

  const productionSchedule = useMemo(
    () => [
      { line: "A", order: "ORD-1001", due: "2025-12-16", qty: 120 },
      { line: "B", order: "ORD-1002", due: "2025-12-17", qty: 80 },
      { line: "C", order: "ORD-1003", due: "2025-12-18", qty: 45 },
    ],
    []
  );

  const tasks = useMemo(
    () => [
      { id: 1, title: "Inspect pump #12", priority: "High" },
      { id: 2, title: "Replace filter on unit 3", priority: "Medium" },
      { id: 3, title: "Calibration check", priority: "Low" },
      { id: 4, title: "Emergency leak repair", priority: "High" },
    ],
    []
  );

  const reminders = useMemo(
    () => [
      { id: 1, text: "Compressor service due 2025-12-20" },
      { id: 2, text: "Safety inspection 2026-01-05" },
    ],
    []
  );

  const newTasks = useMemo(
    () => [
      { id: 101, text: "New task: check conveyor belt" },
      { id: 102, text: "New task: update firmware on sensor" },
    ],
    []
  );

  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/inventory`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setParts(data || []);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const priorityCounts = useMemo(() => {
    const counts: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    tasks.forEach((t) => (counts[t.priority] = (counts[t.priority] || 0) + 1));
    return counts;
  }, [tasks]);

  const threshold = 5;
  const decrement = 2;

  const lowParts = parts
    .map((p) => ({ ...p, reduced: Math.max(0, (p.quantity ?? 0) - decrement) }))
    .filter((p) => (p.quantity ?? 0) <= threshold);

  async function applyServerDecrement() {
    try {
      const res = await fetch(`/api/inventory/decrement-low`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threshold, decrement }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await res.json();
      const msg = `Decremented low items by ${decrement}`;
      toast.success(msg);
      fetchInventory();
    } catch (err: Error | unknown) {
      const m = err instanceof Error ? `Failed: ${err.message}` : "Failed: Unknown error";
      toast.error(m);
    }
  }

  return (
    <div className="page dashboard-page px-6 py-8">
      <h1 className="page-title mb-6">{t("pages.dashboard")}</h1>

      <div className="dashboard-tools mb-6">
        <Clock />
        <Calendar />
      </div>

      <div className="dashboard-content-wrapper">
        <div className="dashboard-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cards.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className={`${c.color} dashboard-card rounded-2xl shadow-lg p-6 hover:shadow-2xl transform hover:-translate-y-1 transition flex flex-col justify-between`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{c.icon}</div>
                  <div className="text-xl font-semibold">{c.title}</div>
                </div>

                <div className="mt-4 text-sm opacity-90">{c.title}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="dashboard-right">
          <h2 className="text-2xl font-bold mb-6">Control Panel</h2>

          <div className="grid grid-cols-1 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-4">Production Schedule</h3>
              <table className="schedule w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left px-2 py-1">Line</th>
                    <th className="text-left px-2 py-1">Order</th>
                    <th className="text-left px-2 py-1">Due</th>
                    <th className="text-right px-2 py-1">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {productionSchedule.map((s) => (
                    <tr key={s.order}>
                      <td className="px-2 py-1">{s.line}</td>
                      <td className="px-2 py-1">{s.order}</td>
                      <td className="px-2 py-1">{s.due}</td>
                      <td className="px-2 py-1 text-right">{s.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-4">Tasks by Priority</h3>
              <ul className="priority-list space-y-2">
                <li><strong>High:</strong> {priorityCounts.High}</li>
                <li><strong>Medium:</strong> {priorityCounts.Medium}</li>
                <li><strong>Low:</strong> {priorityCounts.Low}</li>
              </ul>

              <h4 className="font-semibold mt-4 mb-2">Reminders</h4>
              <ul className="reminders space-y-1 text-sm">
                {reminders.map((r) => (
                  <li key={r.id}>⏰ {r.text}</li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-4">New Tasks</h3>
              <ul className="new-tasks space-y-1 text-sm mb-4">
                {newTasks.map((n) => (
                  <li key={n.id}>✨ {n.text}</li>
                ))}
              </ul>

              <h4 className="font-semibold mb-2">Warehouse Notifications</h4>
              {loading ? (
                <div className="text-sm">Loading inventory...</div>
              ) : error ? (
                <div className="text-red-600 text-sm">{error}</div>
              ) : lowParts.length === 0 ? (
                <div className="ok text-green-600 text-sm">✓ All good — no low parts</div>
              ) : (
                <ul className="warehouse space-y-1 text-sm mb-3">
                  {lowParts.map((p) => (
                    <li key={p.id} className="text-orange-600">
                      <strong>{p.name}</strong> ({p.partNumber}): {p.reduced} in stock
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={applyServerDecrement}
                className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Reduce Low Stock by {decrement}
              </button>
            </div>

            <div className="bottom-cards grid grid-cols-1 gap-2">
              <a className="bottom-card" href="https://www.google.com" target="_blank" rel="noreferrer">
                <div className="font-semibold">Google</div>
                <div className="text-sm mt-1">Open Google Search</div>
              </a>
              <div className="bottom-card flex items-center justify-center text-center font-semibold text-sm">Quick Link 1</div>
              <div className="bottom-card flex items-center justify-center text-center font-semibold text-sm">Quick Link 2</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString();
  const date = now.toLocaleDateString();

  return (
    <div className="clock-box">
      <div className="clock-time">{time}</div>
      <div className="clock-date">{date}</div>
    </div>
  );
}

function Calendar() {
  const today = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const monthYear = useMemo(() => current.toLocaleString(undefined, { month: "long", year: "numeric" }), [current]);

  const weeks = useMemo(() => {
    const firstDay = new Date(current.getFullYear(), current.getMonth(), 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    // pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null);
    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [current]);

  function prevMonth() {
    setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="calendar-box">
      <div className="calendar-header">
        <button className="nav" onClick={prevMonth}>&lsaquo;</button>
        <div className="month">{monthYear}</div>
        <button className="nav" onClick={nextMonth}>&rsaquo;</button>
      </div>
      <div className="calendar-grid">
        <div className="weekday-row">
          {weekdays.map((w) => (
            <div key={w} className="weekday">{w}</div>
          ))}
        </div>
        {weeks.map((row, i) => (
          <div key={i} className="week-row">
            {row.map((cell, j) => (
              <div key={j} className={`day-cell ${cell === null ? "empty" : ""}`}>
                {cell ?? ""}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

