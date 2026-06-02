// src/hooks/useBankImport.ts
//
// Hook que encapsula todo el estado, efectos y handlers del wizard de
// importación bancaria (BankImportModal).
//
// Responsabilidades:
//   - Gestionar el estado del wizard (paso activo, formato, CSV, filas).
//   - generatePreview: parsea el CSV y construye las ImportRow con categorías.
//   - confirmImport: convierte las filas aceptadas en RealExpenses y cierra.
//   - saveCustomFormat: guarda/edita un BankFormat personalizado.
//   - saveRule: guarda/edita una CategoryRule y re-aplica reglas.
//   - Sincronización automática de reglas: re-categoriza filas al cambiar
//     categoryRules o al cerrar el RulesEditorModal.
//
// Extraído de src/BankImportModal.tsx (refactor/bank-import-modal, commit 8/8).

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useApp } from '../AppContext';
import { useToast } from '../contexts/ToastContext';
import { PREDEFINED_BANK_FORMATS } from '../lib/bankFormats';
import { parseBankCSV } from '../lib/bankCSVParser';
import { bankBtnPrimary, bankBtnSecondary } from '../lib/bankImportStyles';
import {
  buildImportRows,
  reApplyRules as reApplyRulesPure,
  importRowsToRealExpenses,
} from '../lib/bankImportOrchestrator';

import { CURRENCIES } from '../utils';
import type { BankFormat, CategoryRule, ImportRow } from '../types';

const uid = () => crypto.randomUUID();

const EMPTY_CUSTOM_FORMAT: BankFormat = {
  id: '',
  name: '',
  isCustom: true,
  separator: ';',
  decimal: ',',
  encoding: 'latin1',
  skipRows: 1,
  dateFormat: 'dd/mm/yyyy',
  amountMode: 'single',
  columns: ['date', 'description', 'amount'],
  negativeIsExpense: true,
} as BankFormat;

export function useBankImport({
  onClose,
  defaultAccountId,
}: {
  onClose: () => void;
  defaultAccountId?: string;
}) {
  const {
    T,
    accounts,
    categories,
    realExpenses,
    setRealExpenses,
    baseCurrency,
    bankFormats,
    setBankFormats,
    categoryRules,
    setCategoryRules,
    dateFormat,
  } = useApp();

  const { t } = useTranslation();
  const toast = useToast();

  // ── Wizard ────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const allFormats: BankFormat[] = [...PREDEFINED_BANK_FORMATS, ...bankFormats];
  const [selectedFormatId, setSelectedFormatId] = useState<string>(
    PREDEFINED_BANK_FORMATS[0].id
  );

  // ── Paso 1: selección de formato ─────────────────────────────────────────
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customForm, setCustomForm] = useState<BankFormat>(EMPTY_CUSTOM_FORMAT);
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);
  const [confirmDeleteFormat, setConfirmDeleteFormat] = useState<string | null>(null);

  // ── Paso 2: subida de CSV ────────────────────────────────────────────────
  const [rawCSV, setRawCSV] = useState('');
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState(
    defaultAccountId ?? accounts[0]?.id ?? ''
  );
  const [overrideSkipRows, setOverrideSkipRows] = useState<number | null>(null);

  // ── Paso 3: preview y reglas ─────────────────────────────────────────────
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [showRulesEditor, setShowRulesEditor] = useState(false);
  const [manuallyCategorized, setManuallyCategorized] = useState<Set<string>>(new Set());
  const [editingRule, setEditingRule] = useState<CategoryRule | null>(null);
  const [ruleForm, setRuleForm] = useState<{ categoryId: string; keywords: string }>({
    categoryId: '',
    keywords: '',
  });

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Cuando categoryRules cambia, React ejecuta este efecto YA con el valor nuevo.
  // A diferencia de vigilar showRulesEditor, aquí categoryRules nunca es un closure obsoleto.
  // Re-categoriza al cambiar reglas O al cerrar el modal de reglas.
  useEffect(() => {
    if (importRows.length === 0) return;
    setImportRows((prev) =>
      reApplyRulesPure({ rows: prev, categories, categoryRules, manuallyCategorized })
    );
  }, [categoryRules]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (showRulesEditor) return; // solo al cerrar
    if (importRows.length === 0) return;
    setImportRows((prev) =>
      reApplyRulesPure({ rows: prev, categories, categoryRules, manuallyCategorized })
    );
  }, [showRulesEditor]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectFormat = (id: string) => {
    setSelectedFormatId(id);
    setOverrideSkipRows(null);
    setRawCSV('');
  };

  const generatePreview = () => {
    const format = allFormats.find((f) => f.id === selectedFormatId);
    if (!format || !rawCSV) return;
    const effectiveFormat =
      overrideSkipRows !== null ? { ...format, skipRows: overrideSkipRows } : format;
    const { rows, errors } = parseBankCSV(rawCSV, effectiveFormat);
    const account = accounts.find((a) => a.id === selectedAccountId);
    const accountCurrency = account?.currency ?? baseCurrency;

    // M6 — detectar divisas desconocidas en el CSV antes de construir las filas.
    // buildImportRows hace fallback silencioso a accountCurrency; aquí avisamos al usuario.
    const unknownCurrencies = new Set(
      rows
        .map((r) => r.detectedCurrency?.toUpperCase())
        .filter((c): c is string => !!c && !CURRENCIES.find((cc) => cc.code === c))
    );
    const allErrors =
      unknownCurrencies.size > 0
        ? [...errors, t('bankImport.preview.unknownCurrencyWarning', {
            currencies: [...unknownCurrencies].join(', '),
            fallback: accountCurrency,
          })]
        : errors;
    setParseErrors(allErrors);

    const importRowsList = buildImportRows({
      parsedRows: rows,
      accountId: selectedAccountId,
      accountCurrency,
      categories,
      categoryRules,
      realExpenses,
    });
    setImportRows(importRowsList);
    setManuallyCategorized(new Set());
    setStep(3);
  };

  const confirmImport = () => {
    const newExpenses = importRowsToRealExpenses(importRows);
    setRealExpenses((prev) => [...prev, ...newExpenses]);
    toast(t('bankImport.preview.toastImported', { count: newExpenses.length }), 'success');
    onClose();
  };

  const saveCustomFormat = () => {
    if (!customForm.name.trim()) return;
    const id = editingCustomId ?? uid();
    const saved: BankFormat = { ...customForm, id, isCustom: true };
    if (editingCustomId) {
      setBankFormats((prev) => prev.map((f) => (f.id === editingCustomId ? saved : f)));
      toast(t('bankImport.step1.formatUpdated'), 'success');
    } else {
      setBankFormats((prev) => [...prev, saved]);
      toast(t('bankImport.step1.formatSaved'), 'success');
    }
    handleSelectFormat(id);
    setShowCustomForm(false);
    setEditingCustomId(null);
    setCustomForm(EMPTY_CUSTOM_FORMAT);
  };

  const saveRule = () => {
    if (!ruleForm.categoryId || !ruleForm.keywords.trim()) return;
    const keywords = ruleForm.keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    if (editingRule) {
      setCategoryRules((prev) =>
        prev.map((r) =>
          r.id === editingRule.id
            ? { ...r, categoryId: ruleForm.categoryId, keywords }
            : r
        )
      );
    } else {
      setCategoryRules((prev) => [
        ...prev,
        { id: uid(), categoryId: ruleForm.categoryId, keywords },
      ]);
    }
    setEditingRule(null);
    setRuleForm({ categoryId: '', keywords: '' });
    toast(t('categories.rules.toastSaved'), 'success');
  };

  // ── Valores derivados ─────────────────────────────────────────────────────
  const newCount = importRows.filter((r) => r.status === 'new').length;
  const dupCount = importRows.filter((r) => r.status === 'duplicate').length;
  const discardedCount = importRows.filter((r) => r.status === 'discarded').length;

  const selectedFormat = allFormats.find((f) => f.id === selectedFormatId);

  const stepTitles = [
    { title: t('bankImport.step1.wizardTitle'), sub: t('bankImport.step1.wizardSub') },
    { title: t('bankImport.upload.wizardTitle'), sub: t('bankImport.upload.wizardSub') },
    { title: t('bankImport.preview.wizardTitle'), sub: t('bankImport.preview.wizardStep', { new: newCount, dup: dupCount }) },
  ];
  const currentStepInfo = stepTitles[step - 1];

  const btnPrimary = bankBtnPrimary(T);
  const btnSec = bankBtnSecondary(T);

  return {
    // Contexto (necesario para props de los steps)
    T,
    toast,
    accounts,
    categories,
    realExpenses,
    baseCurrency,
    setBankFormats,
    categoryRules,
    setCategoryRules,
    dateFormat,

    // Wizard
    step,
    setStep,
    allFormats,
    selectedFormatId,
    setSelectedFormatId,
    selectedFormat,
    currentStepInfo,

    // Paso 1
    showCustomForm,
    setShowCustomForm,
    customForm,
    setCustomForm,
    editingCustomId,
    setEditingCustomId,
    confirmDeleteFormat,
    setConfirmDeleteFormat,
    emptyCustomFormat: EMPTY_CUSTOM_FORMAT,

    // Paso 2
    rawCSV,
    setRawCSV,
    parseErrors,
    selectedAccountId,
    setSelectedAccountId,
    overrideSkipRows,
    setOverrideSkipRows,

    // Paso 3
    importRows,
    setImportRows,
    showRulesEditor,
    setShowRulesEditor,
    manuallyCategorized,
    setManuallyCategorized,
    editingRule,
    setEditingRule,
    ruleForm,
    setRuleForm,
    newCount,
    dupCount,
    discardedCount,

    // Estilos derivados
    btnPrimary,
    btnSec,

    // Handlers
    handleSelectFormat,
    generatePreview,
    confirmImport,
    saveCustomFormat,
    saveRule,
  };
}
