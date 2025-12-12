import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../styles/pages/dashboard.scss";

export default function Dashboard() {
  const { t } = useTranslation();

  const cards = [
    { to: "/maintenance", title: t("nav.maintenance"), color: "bg-yellow-400 text-black", icon: "🛠" },
    { to: "/equipment", title: t("nav.equipment"), color: "bg-green-500 text-white", icon: "⚙️" },
    { to: "/workorders", title: t("nav.workorders"), color: "bg-red-500 text-white", icon: "📋" },
    { to: "/inventory", title: t("nav.inventory"), color: "bg-white text-gray-900 border border-gray-200", icon: "📦" },
  ];

  return (
    <div className="page px-6 py-8">
      <h1 className="page-title mb-6">{t("pages.dashboard")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
  );
}

