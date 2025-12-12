import { useMemo, useState } from "react";
import "../styles/pages/inventory.css";

type Part = {
  id: number;
  name: string;
  partNumber: string;
  quantity: number;
  orderedQuantity: number;
  orderedStatus: "Not received" | "Pending" | "None";
};

export default function Inventory() {
  const initialParts: Part[] = useMemo(
    () => [
      { id: 1, name: "Valve, pressure", partNumber: "VLV-1001", quantity: 12, orderedQuantity: 0, orderedStatus: "None" },
      { id: 2, name: "Filter cartridge", partNumber: "FLT-2203", quantity: 5, orderedQuantity: 3, orderedStatus: "Pending" },
      { id: 3, name: "O-ring set", partNumber: "OR-330", quantity: 0, orderedQuantity: 10, orderedStatus: "Not received" },
      { id: 4, name: "Bearing 6204", partNumber: "BR-6204", quantity: 20, orderedQuantity: 0, orderedStatus: "None" },
    ],
    []
  );

  const [parts, setParts] = useState<Part[]>(initialParts);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", partNumber: "", quantity: 0 });

  function updatePart(updated: Part) {
    setParts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  function addNewPart() {
    if (!formData.name || !formData.partNumber) return;
    const newPart: Part = {
      id: Math.max(...parts.map((p) => p.id), 0) + 1,
      name: formData.name,
      partNumber: formData.partNumber,
      quantity: Math.max(0, formData.quantity),
      orderedQuantity: 0,
      orderedStatus: "None",
    };
    setParts((prev) => [...prev, newPart]);
    setFormData({ name: "", partNumber: "", quantity: 0 });
    setShowForm(false);
  }

  return (
    <div className="page">
      <h1 className="page-title">Склад запчастей</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        + Add New Part
      </button>

      {showForm && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Part name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-2 py-1 border rounded"
            />
            <input
              type="text"
              placeholder="Part number"
              value={formData.partNumber}
              onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
              className="px-2 py-1 border rounded"
            />
            <input
              type="number"
              placeholder="Initial quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              className="px-2 py-1 border rounded"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={addNewPart} className="px-3 py-1 bg-green-600 text-white rounded">
              Create
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Part Number
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity in Stock
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ordered Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ordered Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {parts.map((p) => (
              <PartRow key={`part-${p.id}`} part={p} onUpdate={updatePart} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PartRow({ part, onUpdate }: { part: Part; onUpdate: (p: Part) => void }) {
  const [qty, setQty] = useState<number>(1);

  function handleAdd() {
    const added = Math.max(0, Math.floor(qty || 0));
    if (added <= 0) return;
    const newQuantity = part.quantity + added;
    const currentOrdered = (part.orderedQuantity || 0);
    const reduceOrdered = Math.min(added, currentOrdered);
    const newOrderedQty = Math.max(0, currentOrdered - reduceOrdered);
    const newStatus = newOrderedQty === 0 ? "None" : part.orderedStatus;
    onUpdate({ ...part, quantity: newQuantity, orderedQuantity: newOrderedQty, orderedStatus: newStatus });
    setQty(1);
  }

  function handleOrder() {
    const ordered = Math.max(0, Math.floor(qty || 0));
    if (ordered <= 0) return;
    const currentOrdered = (part.orderedQuantity || 0);
    const newOrderedQty = currentOrdered + ordered;
    onUpdate({ ...part, orderedQuantity: newOrderedQty, orderedStatus: "Pending" });
    setQty(1);
  }

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.partNumber}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{part.quantity}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{part.orderedQuantity || 0}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {part.orderedStatus === "None" ? (
          <span className="text-green-600">—</span>
        ) : part.orderedStatus === "Pending" ? (
          <span className="text-yellow-600">Pending</span>
        ) : (
          <span className="text-red-600">Not received</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex items-center gap-2">
          <input
            aria-label="quantity"
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-20 px-2 py-1 border rounded"
          />
          <button onClick={handleAdd} className="px-3 py-1 bg-blue-600 text-white rounded">
            Add to warehouse
          </button>
          <button onClick={handleOrder} className="px-3 py-1 bg-yellow-500 text-white rounded">
            Order
          </button>
        </div>
      </td>
    </tr>
  );
}
