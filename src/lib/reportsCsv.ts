// ─── Generación y descarga de CSV para Reports ────────────────────────────────
// Extraído en Fase 2.2. Funciones puras para construir CSV + helper de descarga.

import i18next from 'i18next';
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

const t = (key: string) => i18next.t(key);

// ─── Builders puros ──────────────────────────────────────────────────────────
export function buildProjectionsCsv(
  projections: Projection[],
  categories: Category[],
  accounts: Account[],
  baseCurrency: string
): string {
  const rows: (string | number)[][] = [
    [
      t('reports.colConcept'),
      t('reports.colType'),
      t('reports.colCategory'),
      t('reports.colAccount'),
      t('reports.colAmount'),
      t('reports.colCurrency'),
      t('reports.colFrequency'),
      t('reports.colEquivMonth'),
      t('reports.colStartDate'),
      t('reports.colEndDate'),
    ],
    ...projections.map((p) => {
      const cat = categories.find((c) => c.id === p.categoryId);
      const acc = accounts.find((a) => a.id === p.accountId);
      const freq = FREQUENCIES.find((f) => f.value === p.frequency);
      const monthly = freq ? p.amount / freq.months : p.amount;
      return [
        p.name,
        p.type === 'income' ? t('reports.typeIncome') : t('reports.typeExpense'),
        cat?.name ?? '—',
        acc?.name ?? '—',
        p.amount,
        acc?.currency ?? baseCurrency,
        freq?.label ?? '—',
        monthly.toFixed(2),
        p.startDate,
        p.endDate || t('reports.noEndDate'),
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
      t('reports.colEntryDate'),
      t('reports.colValueDate'),
      t('reports.colDescription'),
      t('reports.colType'),
      t('reports.colCategory'),
      t('reports.colAccount'),
      t('reports.colAmount'),
      t('reports.colCurrency'),
      t('reports.colNotes'),
    ],
    ...periodReals.map((e) => {
      const cat = categories.find((c) => c.id === e.categoryId);
      const acc = accounts.find((a) => a.id === e.accountId);
      return [
        e.entryDate,
        e.valueDate,
        e.description,
        e.type === 'income' ? t('reports.typeIncome') : t('reports.typeExpense'),
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
  const blob = new Blob(['﻿' + csv], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
