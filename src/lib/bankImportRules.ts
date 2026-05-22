// src/lib/bankImportRules.ts
// 🏷️ Auto-categorización y detección de duplicados al importar extractos.
// Extraído de BankImportModal.tsx (Fase 1.2 — Paso A.3).
//
// 🔧 Cambios respecto al original:
//   - Renombrado autoCategorizRow → autoCategorizeRow (corrige typo).
//   - Tipado: categories ahora es Category[] en vez de any[].

import type { Category, CategoryRule, RealExpense } from '../types';
import { DEFAULT_CATEGORY_RULES_KEYWORDS } from './bankFormats';

/**
 * Determina la categoría de un movimiento a partir de su descripción.
 *
 * Orden de prioridad:
 *   1. Reglas custom del usuario (categoryRules).
 *   2. Reglas por defecto (DEFAULT_CATEGORY_RULES_KEYWORDS), si existe la
 *      categoría con ese nombre y tipo en `categories`.
 *
 * @returns id de categoría, o '' si no se encuentra match.
 */
export function autoCategorizeRow(
  description: string,
  type: 'income' | 'expense',
  categories: Category[],
  categoryRules: CategoryRule[]
): string {
  const desc = description.toLowerCase();

  // 1) Reglas custom del usuario
  for (const rule of categoryRules) {
    const cat = categories.find((c) => c.id === rule.categoryId);
    if (!cat) continue;
    // NOTA: Las categorías no tienen `type` en el modelo actual; la versión
    // original comprobaba cat.type !== type, pero `Category` no tiene ese
    // campo. Mantenemos el comportamiento permisivo (sin filtro por tipo en
    // reglas custom — el usuario define la regla y asume responsabilidad).
    if (rule.keywords.some((kw) => desc.includes(kw.toLowerCase()))) {
      return rule.categoryId;
    }
  }

  // 2) Reglas por defecto (búsqueda por NOMBRE de categoría)
  for (const [catName, keywords] of Object.entries(
    DEFAULT_CATEGORY_RULES_KEYWORDS
  )) {
    const cat = categories.find((c) => c.name === catName);
    if (!cat) continue;
    if (keywords.some((kw) => desc.includes(kw.toLowerCase()))) {
      return cat.id;
    }
  }

  return '';
}

/**
 * Detecta si un movimiento parseado es probable duplicado de un gasto real
 * existente.
 *
 * Criterios de coincidencia:
 *   - Mismo tipo (income/expense).
 *   - Mismo importe (tolerancia 0,01).
 *   - Fecha valor dentro de ±2 días.
 *
 * @returns id del gasto duplicado, o undefined si no hay coincidencia.
 */
export function findDuplicate(
  row: { amount: number; valueDate: string; type: 'income' | 'expense' },
  existingExpenses: RealExpense[]
): string | undefined {
  const rowDate = new Date(row.valueDate);
  const match = existingExpenses.find((e) => {
    if (e.type !== row.type) return false;
    if (Math.abs(e.amount - row.amount) > 0.01) return false;
    const eDate = new Date(e.valueDate);
    const diffMs = Math.abs(eDate.getTime() - rowDate.getTime());
    return diffMs / (1000 * 60 * 60 * 24) <= 2;
  });
  return match?.id;
}
