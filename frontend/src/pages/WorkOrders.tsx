import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "../styles/pages/workorders.scss";

type WorkOrder = {
  id: number;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Completed";
  createdAt: string;
};

export default function WorkOrders() {
  const { t } = useTranslation();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    {
      id: 1,
      title: "Inspect pump #12",
      description: "Check for leaks and performance",
      priority: "High",
      status: "Pending",
      createdAt: "2025-12-15",
    },
    {
      id: 2,
      title: "Replace filter on unit 3",
      description: "Replace with new cartridge",
      priority: "Medium",
      status: "Completed",
      createdAt: "2025-12-14",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium" as const,
  });

  const handleAddWorkOrder = () => {
    if (!formData.title.trim()) return;

    const newOrder: WorkOrder = {
      id: Math.max(...workOrders.map((w) => w.id), 0) + 1,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: "Pending",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setWorkOrders([newOrder, ...workOrders]);
    setFormData({ title: "", description: "", priority: "Medium" });
    setShowForm(false);
  };

  const handleStatusChange = (id: number, newStatus: "Pending" | "Completed") => {
    setWorkOrders(
      workOrders.map((w) => (w.id === id ? { ...w, status: newStatus } : w))
    );
  };

  const handlePriorityChange = (id: number, newPriority: "High" | "Medium" | "Low") => {
    setWorkOrders(
      workOrders.map((w) => (w.id === id ? { ...w, priority: newPriority } : w))
    );
  };

  const handleDeleteWorkOrder = (id: number) => {
    setWorkOrders(workOrders.filter((w) => w.id !== id));
  };

  const priorityCounts = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0, Pending: 0, Completed: 0 };
    workOrders.forEach((w) => {
      counts[w.priority] = (counts[w.priority] || 0) + 1;
      counts[w.status] = (counts[w.status] || 0) + 1;
    });
    return counts;
  }, [workOrders]);

  return (
    <div className="page workorders-page px-6 py-8">
      <h1 className="page-title mb-6">{t("nav.workorders") || "Work Orders"}</h1>

      <div className="workorders-stats mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-label">Total</div>
          <div className="stat-value">{workOrders.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value text-orange-500">{priorityCounts.Pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value text-green-500">{priorityCounts.Completed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">High Priority</div>
          <div className="stat-value text-red-500">{priorityCounts.High}</div>
        </div>
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        + {t("common.addNewPart") || "New Work Order"}
      </button>

      {showForm && (
        <div className="form-container mb-6 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-4">Register New Work Order</h2>
          <div className="form-grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                placeholder="e.g., Inspect pump #12"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                placeholder="e.g., Check for leaks"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as "High" | "Medium" | "Low" })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddWorkOrder}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Priority</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {workOrders.map((wo) => (
              <tr key={wo.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{wo.id}</td>
                <td className="px-4 py-2 font-semibold">{wo.title}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{wo.description}</td>
                <td className="px-4 py-2">
                  <select
                    value={wo.priority}
                    onChange={(e) =>
                      handlePriorityChange(wo.id, e.target.value as "High" | "Medium" | "Low")
                    }
                    className={`px-2 py-1 rounded text-sm font-semibold ${
                      wo.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : wo.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <select
                    value={wo.status}
                    onChange={(e) =>
                      handleStatusChange(wo.id, e.target.value as "Pending" | "Completed")
                    }
                    className={`px-2 py-1 rounded text-sm font-semibold ${
                      wo.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-sm">{wo.createdAt}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDeleteWorkOrder(wo.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
