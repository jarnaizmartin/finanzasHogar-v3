// src/lib/bankCSVParser.ts
// 📄 Parser de extractos bancarios en formato CSV.
// Extraído de BankImportModal.tsx (Fase 1.2 — Paso A.2).
//
// Helpers puros (sin dependencias de React) para:
//   - parseDate:     normaliza fechas a ISO YYYY-MM-DD
//   - parseAmount:   normaliza importes a number (maneja , o . como decimal)
//   - splitCSVLine:  divide una línea CSV respetando comillas
//   - parseBankCSV:  pipeline completo: lee CSV crudo + formato → filas tipadas

import type { BankColumnKey, BankFormat, ImportRow } from '../types';

// Patrones de filas a descartar (resúmenes, totales, subtotales que aparecen
// al final de muchos extractos: "Total Crédito;;-309,00", "TOTAL;...", etc.)
const SKIP_ROW_PATTERNS = /^(total|subtotal|saldo\s+(final|inicial)|resumen)/i;

const today = () => new Date().toISOString().split('T')[0];

// ─── Parseo de fecha ──────────────────────────────────────────────────────────
export function parseDate(raw: string, fmt: BankFormat['dateFormat']): string {
  const s = raw.trim().replace(/\s+/g, '');
  if (!s) return '';
  let iso = '';
  try {
    if (fmt === 'dd/mm/yyyy' || fmt === 'dd-mm-yyyy') {
      const sep = s.includes('/') ? '/' : '-';
      const [d, m, y] = s.split(sep);
      if (d && m && y) iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    } else if (fmt === 'dd/mm/yy') {
      const [d, m, y] = s.split('/');
      if (d && m && y) iso = `20${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    } else if (fmt === 'yyyy-mm-dd') {
      iso = s.slice(0, 10);
    }
  } catch {
    return '';
  }
  // Validamos que sea una fecha REAL. `new Date(iso)` no basta: V8 "rueda"
  // 2024-02-30 a marzo en vez de dar NaN. Hacemos round-trip y comprobamos que
  // año/mes/día no se hayan desbordado (descarta mes 13, día 32, 30-feb, splits
  // fallidos…). Si no es válida → '' para que el pipeline use today(): la fila
  // se importa con fecha de hoy (visible y corregible) en vez de propagar un
  // Invalid Date que la haría desaparecer en silencio de forecast/calendario.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const [yy, mm, dd] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(yy, mm - 1, dd));
  if (
    dt.getUTCFullYear() !== yy ||
    dt.getUTCMonth() !== mm - 1 ||
    dt.getUTCDate() !== dd
  ) {
    return '';
  }
  return iso;
}

// ─── Parseo de importe ────────────────────────────────────────────────────────
export function parseAmount(raw: string, decimalSep: ',' | '.'): number {
  if (!raw) return 0;
  let s = raw.trim().replace(/\s/g, '').replace(/[€$£]/g, '');
  if (decimalSep === ',') {
    s = s.replace(/\./g, '').replace(',', '.');
  } else {
    s = s.replace(/,/g, '');
  }
  const n = parseFloat(s);
  // Number.isFinite descarta NaN e Infinity: un "1e999" o un overflow
  // colaría como Infinity (isNaN(Infinity) === false) y envenenaría
  // saldos/proyecciones con €Infinity/NaN. Lo tratamos como 0.
  return Number.isFinite(n) ? n : 0;
}

// ─── Split de línea CSV (respeta comillas) ────────────────────────────────────
export function splitCSVLine(line: string, sep: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === sep && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

// ─── Tipo de fila intermedia (antes de añadir id/status/cuenta/categoría) ─────
export type ParsedBankRow = Omit<
  ImportRow,
  | 'id'
  | 'status'
  | 'duplicateOf'
  | 'categoryId'
  | 'accountId'
  | 'currency'
  | 'notes'
> & { detectedCurrency?: string };

export type ParseBankCSVResult = {
  rows: ParsedBankRow[];
  errors: string[];
};

// ─── Pipeline principal ───────────────────────────────────────────────────────
export function parseBankCSV(
  raw: string,
  format: BankFormat
): ParseBankCSVResult {
  const errors: string[] = [];
  const rows: ParsedBankRow[] = [];

  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  const dataLines = lines.slice(format.skipRows).filter((l) => {
    const trimmed = l.trim();
    if (trimmed.length === 0) return false;
    if (SKIP_ROW_PATTERNS.test(trimmed)) return false;
    return true;
  });

  dataLines.forEach((line, idx) => {
    try {
      const cols = splitCSVLine(line, format.separator);
      if (cols.length < 2) return;

      const get = (key: BankColumnKey): string => {
        const i = format.columns.indexOf(key);
        return i >= 0 ? (cols[i] ?? '').trim() : '';
      };

      const rawDate = get('date') || get('valueDate');
      const rawValDate = get('valueDate') || get('date');
      const rawDesc = get('description');

      let amount = 0;
      if (format.amountMode === 'single') {
        amount = parseAmount(get('amount'), format.decimal);
      } else {
        const amtIn = parseAmount(get('amountIn'), format.decimal);
        const amtOut = parseAmount(get('amountOut'), format.decimal);
        amount = amtIn > 0 ? amtIn : -amtOut;
      }

      if (!rawDate && !rawDesc && amount === 0) return;

      const entryDate = parseDate(rawDate, format.dateFormat) || today();
      const valueDate = parseDate(rawValDate, format.dateFormat) || entryDate;
      const description = rawDesc || `Movimiento ${idx + 1}`;
      const type: 'income' | 'expense' = format.negativeIsExpense
        ? amount >= 0
          ? 'income'
          : 'expense'
        : amount < 0
        ? 'income'
        : 'expense';
      const absAmount = Math.abs(amount);

      if (absAmount === 0) return;

      rows.push({
        entryDate,
        valueDate,
        description,
        amount: absAmount,
        type,
        detectedCurrency: get('currency') || '',
      });
    } catch (e) {
      errors.push(`Línea ${idx + format.skipRows + 1}: ${String(e)}`);
    }
  });

  return { rows, errors };
}
