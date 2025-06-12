import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from '../public/locales/en/common.json';
import arTranslation from '../public/locales/ar/common.json';

const resources = {
  en: { translation: enTranslation },
  ar: { translation: arTranslation },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Disable suspense for simplicity
    },
  });

export default i18n;
