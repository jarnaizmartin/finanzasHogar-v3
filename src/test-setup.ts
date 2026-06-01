import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
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
