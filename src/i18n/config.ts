import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import en from '../locales/en.json';
import ru from '../locales/ru.json';
import et from '../locales/et.json';
import fi from '../locales/fi.json';

// Get saved language from localStorage or use browser language
const savedLanguage = localStorage.getItem('language');
const browserLanguage = navigator.language.split('-')[0];
const defaultLanguage = savedLanguage || browserLanguage || 'en';

// Supported languages
const supportedLanguages = ['en', 'ru', 'et', 'fi'];
const initialLanguage = supportedLanguages.includes(defaultLanguage) 
  ? defaultLanguage 
  : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      et: { translation: et },
      fi: { translation: fi },
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
  document.documentElement.lang = lng;
});

export default i18n;
