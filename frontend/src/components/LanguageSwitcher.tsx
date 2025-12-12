import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleLanguageChange("en")}
        className={`px-3 py-1 rounded ${
          i18n.language === "en"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange("et")}
        className={`px-3 py-1 rounded ${
          i18n.language === "et"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
        }`}
      >
        ET
      </button>
      <button
        onClick={() => handleLanguageChange("ru")}
        className={`px-3 py-1 rounded ${
          i18n.language === "ru"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
        }`}
      >
        RU
      </button>
    </div>
  );
}
