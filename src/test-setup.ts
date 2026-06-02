import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import i18next from 'i18next';
import { es } from './i18n/es';

// Resolves dot-notation i18n keys against the ES dictionary so tests verify
// user-visible Spanish strings, not internal key names. Supports {{param}} interpolation.
function resolveKey(key: string, options?: Record<string, unknown>): string {
  const raw = key
    .split('.')
    .reduce((obj: unknown, k) => (obj as Record<string, unknown>)?.[k], es as unknown) as string ?? key;
  if (!options) return raw;
  return raw.replace(/\{\{(\w+)\}\}/g, (_, k) => String(options[k] ?? `{{${k}}}`));
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: resolveKey, i18n: { changeLanguage: vi.fn(), language: 'es' } }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
  Trans: ({ children }: { children: unknown }) => children,
}));

// Initialize i18next with ES so lib files that call i18next.t() directly work in tests.
if (!i18next.isInitialized) {
  i18next.init({
    lng: 'es',
    resources: { es: { translation: es as unknown as Record<string, string> } },
    interpolation: { escapeValue: false },
  });
}


