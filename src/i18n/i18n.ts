import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { ptBr } from './pt-br';

export const SUPPORTED_LANGS = ['es', 'en', 'pt-BR', 'fr'] as const;
export type SupportedLang = typeof SUPPORTED_LANGS[number];

const STORAGE_KEY = 'fh-lang';

const savedLang = localStorage.getItem(STORAGE_KEY) as SupportedLang | null;
const initialLang: SupportedLang =
  savedLang && (SUPPORTED_LANGS as readonly string[]).includes(savedLang) ? savedLang : 'es';

i18next
  .use(initReactI18next)
  .init({
    lng: initialLang,
    fallbackLng: 'es',
    resources: {
      es:    { translation: es },
      en:    { translation: en },
      'pt-BR': { translation: ptBr },
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
