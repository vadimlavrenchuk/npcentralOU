import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "../styles/pages/maintenance.css";

type MaintenanceItem = {
  id: number;
  module: string;
  hoursInterval: number;
  description: string;
};

type Equipment = {
  id: number;
  brand: string;
  name: string;
  operatingHours: number;
  maintenanceItems: MaintenanceItem[];
};

export default function Maintenance() {
  const { t } = useTranslation();
  const initialEquipment: Equipment[] = useMemo(
    () => [
      {
        id: 1,
        brand: "Siemens",
        name: "Compressor A",
        operatingHours: 2500,
        maintenanceItems: [
          { id: 1, module: "Filter", hoursInterval: 500, description: "Replace air filter" },
          { id: 2, module: "Oil", hoursInterval: 1000, description: "Change oil and filter" },
          { id: 3, module: "Belt", hoursInterval: 2000, description: "Inspect and adjust belt tension" },
        ],
      },
      {
        id: 2,
        brand: "Bosch",
        name: "Pump B",
        operatingHours: 1800,
        maintenanceItems: [
          { id: 1, module: "Seal", hoursInterval: 1000, description: "Replace mechanical seal" },
          { id: 2, module: "Bearing", hoursInterval: 2000, description: "Inspect bearings" },
        ],
      },
    ],
    []
  );

  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);
  const [showForm, setShowForm] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [formData, setFormData] = useState({ brand: "", name: "", operatingHours: 0 });

  function updateEquipment(updated: Equipment) {
    setEquipment((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }

  function addNewEquipment() {
    if (!formData.brand || !formData.name) return;
    const newEquipment: Equipment = {
      id: Math.max(...equipment.map((e) => e.id), 0) + 1,
      brand: formData.brand,
      name: formData.name,
      operatingHours: Math.max(0, formData.operatingHours),
      maintenanceItems: [],
    };
    setEquipment((prev) => [...prev, newEquipment]);
    setFormData({ brand: "", name: "", operatingHours: 0 });
    setShowForm(false);
  }

  function openMaintenanceModal(equip: Equipment) {
    setSelectedEquipment(equip);
    setShowMaintModal(true);
  }

  return (
    <div className="page">
      <h1 className="page-title">{t("pages.maintenance")}</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        + {t("common.addNewEquipment")}
      </button>

      {showForm && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder={t("common.brand")}
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="px-2 py-1 border rounded"
            />
            <input
              type="text"
              placeholder={t("common.name")}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-2 py-1 border rounded"
            />
            <input
              type="number"
              placeholder={t("common.operatingHours")}
              value={formData.operatingHours}
              onChange={(e) => setFormData({ ...formData, operatingHours: Number(e.target.value) })}
              className="px-2 py-1 border rounded"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={addNewEquipment} className="px-3 py-1 bg-green-600 text-white rounded">
              {t("common.create")}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1 bg-gray-400 text-white rounded"
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("common.brand")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("common.name")}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("common.operatingHours")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("common.action")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {equipment.map((e) => (
              <EquipmentRow
                key={`equipment-${e.id}`}
                equipment={e}
                onUpdate={updateEquipment}
                onViewMaintenance={openMaintenanceModal}
              />
            ))}
          </tbody>
        </table>
      </div>

      {showMaintModal && selectedEquipment && (
        <MaintenanceModal
          equipment={selectedEquipment}
          onClose={() => setShowMaintModal(false)}
        />
      )}
    </div>
  );
}

function EquipmentRow({
  equipment,
  onUpdate,
  onViewMaintenance,
}: {
  equipment: Equipment;
  onUpdate: (e: Equipment) => void;
  onViewMaintenance: (e: Equipment) => void;
}) {
  const { t } = useTranslation();
  const [hours, setHours] = useState<number>(equipment.operatingHours);

  function handleHoursChange(value: number) {
    const newHours = Math.max(0, value);
    setHours(newHours);
    onUpdate({ ...equipment, operatingHours: newHours });
  }

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{equipment.brand}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{equipment.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
        <input
          type="number"
          value={hours}
          onChange={(e) => handleHoursChange(Number(e.target.value))}
          className="w-28 px-2 py-1 border rounded text-right"
          min={0}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <button
          onClick={() => onViewMaintenance(equipment)}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t("common.viewMaintenance")}
        </button>
      </td>
    </tr>
  );
}

function MaintenanceModal({
  equipment,
  onClose,
}: {
  equipment: Equipment;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {equipment.brand} - {equipment.name}
        </h2>
        <p className="mb-4 text-gray-600">
          {t("common.operatingHours")}: <span className="font-semibold">{equipment.operatingHours}</span>
        </p>

        {equipment.maintenanceItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    {t("maintenance.module")}
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    {t("maintenance.hoursInterval")}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    {t("maintenance.description")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {equipment.maintenanceItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {item.module}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                      {item.hoursInterval}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">{t("maintenance.noMaintenance")}</p>
        )}

        <div className="mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}

