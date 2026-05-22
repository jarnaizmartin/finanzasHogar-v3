// src/lib/bankFormats.ts
// 🏦 Constantes de formatos bancarios y reglas por defecto.
// Extraído de BankImportModal.tsx (Fase 1.2 — Paso A.1).

import type { BankColumnKey, BankFormat } from '../types';

// ─── Opciones de columnas para el editor de formatos ──────────────────────────
export const BANK_COLUMN_OPTIONS: { key: BankColumnKey; label: string }[] = [
  { key: 'date', label: 'Fecha apunte' },
  { key: 'valueDate', label: 'Fecha valor' },
  { key: 'description', label: 'Descripción' },
  { key: 'amount', label: 'Importe (+ / -)' },
  { key: 'amountIn', label: 'Importe entrada' },
  { key: 'amountOut', label: 'Importe salida' },
  { key: 'balance', label: 'Saldo (ignorar)' },
  { key: 'currency', label: 'Divisa' },
  { key: 'ignore', label: '— Ignorar —' },
];

// ─── Formatos bancarios predefinidos ──────────────────────────────────────────
// ⚠️ Nota: estos formatos NO tienen createdAt/updatedAt porque son constantes
// hardcodeadas, no entidades persistidas. Los formatos custom del usuario sí
// los llevan (se crean en runtime con Date.now()).
export const PREDEFINED_BANK_FORMATS: BankFormat[] = [
  {
    id: 'santander',
    name: 'Santander',
    isCustom: false,
    separator: ';',
    decimal: ',',
    encoding: 'latin1',
    skipRows: 4,
    dateFormat: 'dd/mm/yyyy',
    amountMode: 'single',
    columns: ['date', 'ignore', 'description', 'amount', 'ignore'],
    negativeIsExpense: true,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'bbva',
    name: 'BBVA',
    isCustom: false,
    separator: ';',
    decimal: ',',
    encoding: 'utf-8',
    skipRows: 1,
    dateFormat: 'dd/mm/yyyy',
    amountMode: 'single',
    columns: ['date', 'valueDate', 'description', 'amount', 'ignore'],
    negativeIsExpense: true,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'ing',
    name: 'ING',
    isCustom: false,
    separator: ';',
    decimal: ',',
    encoding: 'utf-8',
    skipRows: 1,
    dateFormat: 'dd/mm/yyyy',
    amountMode: 'single',
    columns: ['date', 'ignore', 'ignore', 'description', 'amount'],
    negativeIsExpense: true,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'caixabank',
    name: 'CaixaBank',
    isCustom: false,
    separator: ';',
    decimal: ',',
    encoding: 'latin1',
    skipRows: 2,
    dateFormat: 'dd/mm/yyyy',
    amountMode: 'single',
    columns: ['date', 'description', 'amount', 'ignore'],
    negativeIsExpense: true,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'revolut',
    name: 'Revolut',
    isCustom: false,
    separator: ',',
    decimal: '.',
    encoding: 'utf-8',
    skipRows: 1,
    dateFormat: 'yyyy-mm-dd',
    amountMode: 'single',
    columns: [
      'ignore',
      'ignore',
      'date',
      'valueDate',
      'description',
      'amount',
      'ignore',
      'currency',
      'ignore',
      'ignore',
    ],
    negativeIsExpense: true,
    note: 'En Revolut: ve a Perfil → Extractos → exportar como CSV.',
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'bankinter',
    name: 'Bankinter',
    isCustom: false,
    separator: ';',
    decimal: ',',
    encoding: 'latin1',
    skipRows: 5,
    dateFormat: 'dd/mm/yyyy',
    amountMode: 'single',
    columns: ['valueDate', 'date', 'description', 'amount', 'currency'],
    negativeIsExpense: true,
    note: 'Bankinter descarga en .xlsx. Ábrelo en Excel y guárdalo como CSV (separador ;) antes de importar.',
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 'bankinter_card',
    name: 'Bankinter — Tarjeta Visa/Mastercard',
    isCustom: false,
    separator: ';',
    decimal: ',',
    encoding: 'latin1',
    skipRows: 6,
    dateFormat: 'dd/mm/yyyy',
    amountMode: 'single',
    columns: ['date', 'description', 'amount'],
    negativeIsExpense: true,
    note: 'Descarga el detalle de movimientos de la tarjeta desde Bankinter → Tarjetas → Movimientos. Si llega en .xlsx, ábrelo en Excel y guárdalo como CSV (separador ;).',
    createdAt: 0,
    updatedAt: 0,
  },
];

// ─── Notas amigables por banco (instrucciones para descargar el extracto) ─────
export const BANK_FRIENDLY_NOTES: Record<string, string> = {
  santander:
    'Descarga el extracto desde Banca Online → Mis Cuentas → Exportar',
  bbva: 'Descarga el extracto desde BBVA.es → Cuentas → Descargar movimientos',
  ing: 'Descarga el extracto desde tu Cuenta Nómina → Ver todos los movimientos → Exportar',
  caixabank:
    'Descarga el extracto desde CaixaBankNow → Mis cuentas → Exportar',
  revolut: 'En la app Revolut: Perfil → Extractos → Exportar como CSV',
  bankinter:
    'En Bankinter: Mis cuentas → Exportar movimientos (guarda como CSV)',
  bankinter_card:
    'En Bankinter: Tarjetas → Movimientos → Exportar (si descarga en .xlsx, guárdalo como CSV con separador ;)',
};

// ─── Reglas de auto-categorización por defecto ────────────────────────────────
// Se usan cuando no hay reglas custom del usuario. Las claves son nombres de
// categorías (deben existir en `categories` para que la regla se aplique).
export const DEFAULT_CATEGORY_RULES_KEYWORDS: Record<string, string[]> = {
  Alimentación: [
    'mercadona', 'lidl', 'carrefour', 'alcampo', 'dia ', 'aldi',
    'eroski', 'hipercor', 'consum', 'supermercado',
  ],
  'Restaurantes / Bares': [
    'restaurante', 'cafeteria', 'bar ', 'mcdonalds', 'burger', 'kfc',
    'telepizza', 'just eat', 'glovo', 'uber eats',
  ],
  Transporte: [
    'renfe', 'metro', 'bus ', 'cabify', 'uber', 'gasolina', 'repsol',
    'bp ', 'cepsa', 'parking', 'autopista', 'peaje',
  ],
  'Salud / Farmacia': [
    'farmacia', 'doctor', 'clinica', 'hospital', 'medico', 'dentista',
    'optica', 'sanitas', 'adeslas',
  ],
  'Suscripciones digitales': [
    'netflix', 'spotify', 'amazon prime', 'hbo', 'disney', 'apple',
    'google', 'microsoft', 'adobe',
  ],
  'Vivienda / Alquiler': [
    'alquiler', 'comunidad', 'ibi ', 'hipoteca', 'seguro hogar',
  ],
  Seguros: [
    'seguro', 'axa', 'mapfre', 'mutua', 'generali', 'zurich', 'allianz',
  ],
  Educación: [
    'universidad', 'colegio', 'academia', 'curso', 'udemy', 'coursera',
    'libreria',
  ],
  'Ocio / Entretenimiento': [
    'cinema', 'cine', 'teatro', 'concierto', 'steam', 'playstation',
    'xbox', 'entradas',
  ],
  'Ropa / Moda': [
    'zara', 'mango', 'h&m', 'primark', 'pull', 'bershka', 'stradivarius',
  ],
  'Viajes / Vacaciones': [
    'ryanair', 'vueling', 'iberia', 'booking', 'airbnb', 'hotel', 'expedia',
  ],
  Salario: ['nomina', 'nómina', 'salario', 'sueldo', 'haberes'],
};
