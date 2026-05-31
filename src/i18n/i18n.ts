import i18next from 'i18next';
import { en } from './en';
import { es } from './es';

i18next.init({
  lng: 'es',
  fallbackLng: 'es',
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  interpolation: {
    // i18next escapes by default — not needed in a React app (React handles XSS)
    escapeValue: false,
  },
});

export { i18next };
