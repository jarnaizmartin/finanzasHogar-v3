// ─── Generación y descarga de CSV para Reports ────────────────────────────────
// Extraído en Fase 2.2. Funciones puras para construir CSV + helper de descarga.

import { FREQUENCIES } from '../utils';
import type { Account, Category, Projection, RealExpense } from '../types';

// ─── Helpers internos ────────────────────────────────────────────────────────
function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((r) =>
      r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n');
}

// ─── Builders puros ──────────────────────────────────────────────────────────
export function buildProjectionsCsv(
  projections: Projection[],
  categories: Category[],
  accounts: Account[],
  baseCurrency: string
): string {
  const rows: (string | number)[][] = [
    [
      'Concepto',
      'Tipo',
      'Categoría',
      'Cuenta',
      'Importe',
      'Divisa',
      'Frecuencia',
      'Equiv./mes',
      'Fecha inicio',
      'Fecha fin',
    ],
    ...projections.map((p) => {
      const cat = categories.find((c) => c.id === p.categoryId);
      const acc = accounts.find((a) => a.id === p.accountId);
      const freq = FREQUENCIES.find((f) => f.value === p.frequency);
      const monthly = freq ? p.amount / freq.months : p.amount;
      return [
        p.name,
        p.type === 'income' ? 'Ingreso' : 'Gasto',
        cat?.name ?? '—',
        acc?.name ?? '—',
        p.amount,
        acc?.currency ?? baseCurrency,
        freq?.label ?? '—',
        monthly.toFixed(2),
        p.startDate,
        p.endDate || 'Sin fin',
      ];
    }),
  ];
  return toCsv(rows);
}

export function buildMovementsCsv(
  periodReals: RealExpense[],
  categories: Category[],
  accounts: Account[]
): string {
  const rows: (string | number)[][] = [
    [
      'Fecha apunte',
      'Fecha valor',
      'Descripción',
      'Tipo',
      'Categoría',
      'Cuenta',
      'Importe',
      'Divisa',
      'Notas',
    ],
    ...periodReals.map((e) => {
      const cat = categories.find((c) => c.id === e.categoryId);
      const acc = accounts.find((a) => a.id === e.accountId);
      return [
        e.entryDate,
        e.valueDate,
        e.description,
        e.type === 'income' ? 'Ingreso' : 'Gasto',
        cat?.name ?? '—',
        acc?.name ?? '—',
        e.type === 'income' ? e.amount : -e.amount,
        e.currency,
        e.notes ?? '',
      ];
    }),
  ];
  return toCsv(rows);
}

// ─── Helper de descarga (side-effect, no testeado a fondo) ───────────────────
export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + csv], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
