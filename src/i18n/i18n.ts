import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { ptPt } from './pt-pt';
import { pickInitialLang } from '../lib/detectLanguage';

export const SUPPORTED_LANGS = ['es', 'en', 'pt-PT', 'fr'] as const;
export type SupportedLang = typeof SUPPORTED_LANGS[number];

const STORAGE_KEY = 'fh-lang';

// Idioma inicial: la elección guardada del usuario manda; si no hay, se detecta
// del navegador (navigator.languages) y se mapea al soportado más cercano;
// si nada coincide, 'es'. Ver `src/lib/detectLanguage.ts`.
const browserLangs: readonly string[] =
  typeof navigator !== 'undefined'
    ? navigator.languages?.length
      ? navigator.languages
      : navigator.language
        ? [navigator.language]
        : []
    : [];

const initialLang = pickInitialLang(
  localStorage.getItem(STORAGE_KEY),
  browserLangs,
  SUPPORTED_LANGS,
  'es',
) as SupportedLang;

i18next
  .use(initReactI18next)
  .init({
    lng: initialLang,
    fallbackLng: 'es',
    resources: {
      es:    { translation: es },
      en:    { translation: en },
      'pt-PT': { translation: ptPt },
      fr:    { translation: fr },
    },
    interpolation: {
      // i18next escapes by default — not needed in a React app (React handles XSS)
      escapeValue: false,
    },
  });

export function setLanguage(lang: SupportedLang): Promise<void> {
  localStorage.setItem(STORAGE_KEY, lang);
  return i18next.changeLanguage(lang).then(() => undefined);
}

export { i18next };
