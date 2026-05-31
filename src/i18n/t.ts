// ─── t() — translation wrapper ────────────────────────────────────────────────
//
// Thin wrapper over i18next.t(). All call sites in lib/ use this — never
// import i18next directly so the implementation can change without touching
// business logic.
//
// Usage:  t('loans.types.mortgage')          → 'Hipoteca' / 'Mortgage'
//         t('foo.bar', { n: 3 })             → replaces {{n}} in the string
// ─────────────────────────────────────────────────────────────────────────────

import './i18n'; // ensure i18next is initialized before first call
import { i18next } from './i18n';

export function t(key: string, params?: Record<string, string | number>): string {
  return i18next.t(key, params as Record<string, unknown>) as string;
}
