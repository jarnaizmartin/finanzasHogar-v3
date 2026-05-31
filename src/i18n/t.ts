// ─── t() — wrapper de traducción simple ──────────────────────────────────────
//
// Fase 0.5 B4: wrapper mínimo sobre el objeto `es`.
// Fase 3: se reemplazará por i18next.t() sin cambiar las llamadas del código.
//
// Uso básico:        t('loans.types.mortgage')        → 'Hipoteca'
// Con parámetros:    t('foo.bar', { n: 3 })           → reemplaza {{n}} en el string
// ─────────────────────────────────────────────────────────────────────────────

import { es } from './es';

export function t(key: string, params?: Record<string, string | number>): string {
  const parts = key.split('.');
  let current: unknown = es;
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return key;
    current = (current as Record<string, unknown>)[part];
  }
  if (typeof current !== 'string') return key;
  if (!params) return current;
  return current.replace(/\{\{(\w+)\}\}/g, (_, k) => String(params[k] ?? k));
}
