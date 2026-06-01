// src/lib/i18nFormats.ts
//
// Formatters locale-aware centralizados.
// Fase 3 F4-P: sustituir 'es-ES' hardcodeado por locale dinámico según i18next.
//
// Uso en libs puras: importar directamente (mismo patrón que helpCenterData.ts).
// Uso en componentes React: también importar directamente — i18next.language se
// actualiza en tiempo real y los componentes re-renderizan al cambiar idioma.

import i18next from 'i18next';

const LOCALE_MAP: Record<string, string> = {
  es: 'es-ES',
  en: 'en-US',
  fr: 'fr-FR',
  'pt-br': 'pt-BR',
};

export const getLocale = (): string => LOCALE_MAP[i18next.language] ?? 'es-ES';

// ─── Números / divisas ────────────────────────────────────────────────────────

export const fmtAmount = (
  amount: number,
  opts?: Intl.NumberFormatOptions,
): string =>
  amount.toLocaleString(getLocale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...opts,
  });

export const fmtAmount0 = (amount: number): string =>
  amount.toLocaleString(getLocale(), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

// Para etiquetas de ejes en gráficos (valores grandes → "1,2k" / "1.2k")
export const fmtCompact = (val: number): string => {
  if (Math.abs(val) >= 1000) {
    const k = val / 1000;
    return (
      k.toLocaleString(getLocale(), {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }) + 'k'
    );
  }
  return val.toLocaleString(getLocale(), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// ─── Fechas ───────────────────────────────────────────────────────────────────

export const fmtDate = (
  date: Date,
  opts: Intl.DateTimeFormatOptions,
): string => date.toLocaleDateString(getLocale(), opts);

export const fmtMonthYear = (date: Date): string =>
  date.toLocaleString(getLocale(), { month: 'long', year: 'numeric' });

export const fmtMonth = (date: Date): string =>
  date.toLocaleString(getLocale(), { month: 'long' });

export const fmtDateTime = (
  date: Date,
  opts?: Intl.DateTimeFormatOptions,
): string =>
  date.toLocaleString(getLocale(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...opts,
  });
