import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
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
    <div className="page dashboard-page px-6 py-8">
      <h1 className="page-title mb-6">{t("pages.dashboard")}</h1>

      <div className="dashboard-tools mb-6">
        <Clock />
        <Calendar />
      </div>

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

