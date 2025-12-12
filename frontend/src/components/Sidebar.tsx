import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "../styles/components/Sidebar.scss";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">NP-Central</div>

      <nav className="sidebar-menu">
        <Link to="/">{t("nav.dashboard")}</Link>
        <Link to="/equipment">{t("nav.equipment")}</Link>
        <Link to="/workorders">{t("nav.workorders")}</Link>
        <Link to="/maintenance">{t("nav.maintenance")}</Link>
        <Link to="/inventory">{t("nav.inventory")}</Link>
      </nav>

      <div className="sidebar-languages mt-4 px-4 pb-4">
        <p className="text-xs text-gray-400 mb-2 uppercase">Language</p>
        <LanguageSwitcher />
      </div>
    </aside>
  );
}
