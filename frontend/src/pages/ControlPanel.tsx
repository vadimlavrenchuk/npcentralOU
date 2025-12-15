import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "../styles/pages/controlpanel.scss";

type Part = { id: number; name: string; partNumber: string; quantity: number };

export default function ControlPanel() {
  const { t } = useTranslation();

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
  const [actionMsg, setActionMsg] = useState<string | null>(null);

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
    setActionMsg(null);
    try {
      const res = await fetch(`/api/inventory/decrement-low`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threshold, decrement }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await res.json();
      const msg = `Decremented low items by ${decrement}`;
      setActionMsg(msg);
      toast.success(msg);
      fetchInventory();
    } catch (err: Error | unknown) {
      const m = err instanceof Error ? `Failed: ${err.message}` : "Failed: Unknown error";
      setActionMsg(m);
      toast.error(m);
    }
  }

  return (
    <div className="page controlpanel-page px-6 py-8">
      <h1 className="page-title mb-6">{t("pages.controlPanel") || "Control Panel"}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2>Production Schedule</h2>
          <table className="schedule">
            <thead>
              <tr>
                <th>Line</th>
                <th>Order</th>
                <th>Due</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              {productionSchedule.map((s) => (
                <tr key={s.order}>
                  <td>{s.line}</td>
                  <td>{s.order}</td>
                  <td>{s.due}</td>
                  <td>{s.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2>Tasks by Priority</h2>
          <ul className="priority-list">
            <li><strong>High:</strong> {priorityCounts.High}</li>
            <li><strong>Medium:</strong> {priorityCounts.Medium}</li>
            <li><strong>Low:</strong> {priorityCounts.Low}</li>
          </ul>

          <h3 className="mt-4">Reminders</h3>
          <ul className="reminders">
            {reminders.map((r) => (
              <li key={r.id}>{r.text}</li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>New Tasks</h2>
          <ul className="new-tasks">
            {newTasks.map((n) => (
              <li key={n.id}>{n.text}</li>
            ))}
          </ul>

          <h3 className="mt-4">Warehouse Notifications</h3>
          {loading ? (
            <div>Loading inventory...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : lowParts.length === 0 ? (
            <div className="ok">All good — no low parts</div>
          ) : (
            <ul className="warehouse">
              {lowParts.map((p) => (
                <li key={p.id}>
                  <strong>{p.name}</strong> ({p.partNumber}): now {p.reduced} in stock (reduced by {decrement})
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3">
            <button onClick={applyServerDecrement} className="px-3 py-1 bg-blue-600 text-white rounded">
              Apply server decrement ({decrement})
            </button>
            {actionMsg && <div className="mt-2">{actionMsg}</div>}
          </div>
        </div>
      </div>

      <div className="bottom-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <a className="bottom-card" href="https://www.google.com" target="_blank" rel="noreferrer">
          <div className="title">Google</div>
          <div className="desc">Open Google</div>
        </a>
        <div className="bottom-card">Quick link 1</div>
        <div className="bottom-card">Quick link 2</div>
        <div className="bottom-card">Quick link 3</div>
      </div>
    </div>
  );
}
