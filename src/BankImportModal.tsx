import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { useApp } from './AppContext';
import { useToast } from './contexts/ToastContext';

// ─── Tipos locales ────────────────────────────────────────────────────────────
import type {
  BankFormat,
  CategoryRule,
  ImportRow,
} from './types';
// 🧹 Quick-win 2.2a: usar helpers centralizados (fmtDateDMY) de utils.ts
import { fmtDateDMY } from './utils';

// 🆕 Fase 1.2 — Lógica de importación bancaria extraída a /lib
import {
  PREDEFINED_BANK_FORMATS,
  BANK_FRIENDLY_NOTES,
} from './lib/bankFormats';
import { parseBankCSV } from './lib/bankCSVParser';
// 🆕 Fase 1 — commit 1/8: estilos compartidos extraídos
import {
  bankSelectStyle,
  bankBtnPrimary,
  bankBtnSecondary,
} from './lib/bankImportStyles';
// 🆕 Fase 1 — commit 2/8: orquestación pura extraída + testeada
import {
  buildImportRows,
  reApplyRules as reApplyRulesPure,
  importRowsToRealExpenses,
} from './lib/bankImportOrchestrator';
// 🆕 Fase 1 — commit 3/8: modal de reglas extraída a componente propio
import { RulesEditorModal } from './components/bank-import/RulesEditorModal';
// 🆕 Fase 1 — commit 4/8: paso 1 del wizard extraído a componente propio
import { Step1BankSelection } from './components/bank-import/Step1BankSelection';

// ─── Helpers locales ──────────────────────────────────────────────────────────
const uid = () => crypto.randomUUID();

// ─── Componente principal ─────────────────────────────────────────────────────
export function BankImportModal({
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

  const toast = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const allFormats: BankFormat[] = [...PREDEFINED_BANK_FORMATS, ...bankFormats];
  const [selectedFormatId, setSelectedFormatId] = useState<string>(
    PREDEFINED_BANK_FORMATS[0].id
  );

  const handleSelectFormat = (id: string) => {
    setSelectedFormatId(id);
    setOverrideSkipRows(null);
    setRawCSV('');
  };

  const [showCustomForm, setShowCustomForm] = useState(false);
  const emptyCustomFormat: BankFormat = {
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
  };
  const [customForm, setCustomForm] = useState<BankFormat>(emptyCustomFormat);
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);
  const [confirmDeleteFormat, setConfirmDeleteFormat] = useState<string | null>(
    null
  );

  const fileRef = useRef<HTMLInputElement>(null);
  const [rawCSV, setRawCSV] = useState('');
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState(
    defaultAccountId ?? accounts[0]?.id ?? ''
  );
  const [overrideSkipRows, setOverrideSkipRows] = useState<number | null>(null);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [showRulesEditor, setShowRulesEditor] = useState(false);
  const [manuallyCategorized, setManuallyCategorized] = useState<Set<string>>(
    new Set()
  );
  const [editingRule, setEditingRule] = useState<CategoryRule | null>(null);
  const [ruleForm, setRuleForm] = useState<{
    categoryId: string;
    keywords: string;
  }>({
    categoryId: '',
    keywords: '',
  });

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
  // 🆕 Fase 1 — commit 2/8: delegado a lib pura testeada.
  const reApplyRules = (rows: ImportRow[]) =>
    reApplyRulesPure({
      rows,
      categories,
      categoryRules,
      manuallyCategorized,
    });

  useEffect(() => {
    if (importRows.length === 0) return;
    setImportRows((prev) => reApplyRules(prev));
  }, [categoryRules]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (showRulesEditor) return; // solo al cerrar
    if (importRows.length === 0) return;
    setImportRows((prev) => reApplyRules(prev));
  }, [showRulesEditor]); // eslint-disable-line react-hooks/exhaustive-deps

  // 🆕 Fase 1 — commit 1/8: estilos consumidos desde lib/bankImportStyles
  const selStyle = bankSelectStyle(T);
  const btnPrimary = bankBtnPrimary(T);
  const btnSec = bankBtnSecondary(T);

  const generatePreview = () => {
    const format = allFormats.find((f) => f.id === selectedFormatId);
    if (!format || !rawCSV) return;
    const effectiveFormat =
      overrideSkipRows !== null
        ? { ...format, skipRows: overrideSkipRows }
        : format;
    const { rows, errors } = parseBankCSV(rawCSV, effectiveFormat);
    setParseErrors(errors);
    const account = accounts.find((a) => a.id === selectedAccountId);
    const accountCurrency = account?.currency ?? baseCurrency;
    // 🆕 Fase 1 — commit 2/8: construcción delegada a lib pura testeada.
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
    // 🆕 Fase 1 — commit 2/8: conversión delegada a lib pura testeada.
    const newExpenses = importRowsToRealExpenses(importRows);
    setRealExpenses((prev) => [...prev, ...newExpenses]);
    toast(
      `${newExpenses.length} movimiento${
        newExpenses.length !== 1 ? 's' : ''
      } importado${newExpenses.length !== 1 ? 's' : ''} correctamente`,
      'success'
    );
    onClose();
  };

  const newCount = importRows.filter((r) => r.status === 'new').length;
  const dupCount = importRows.filter((r) => r.status === 'duplicate').length;
  const discardedCount = importRows.filter(
    (r) => r.status === 'discarded'
  ).length;

  const saveCustomFormat = () => {
    if (!customForm.name.trim()) return;
    const id = editingCustomId ?? uid();
    const saved: BankFormat = { ...customForm, id, isCustom: true };
    if (editingCustomId) {
      setBankFormats((prev) =>
        prev.map((f) => (f.id === editingCustomId ? saved : f))
      );
      toast('Formato actualizado', 'success');
    } else {
      setBankFormats((prev) => [...prev, saved]);
      toast('Formato guardado', 'success');
    }
    handleSelectFormat(id);
    setShowCustomForm(false);
    setEditingCustomId(null);
    setCustomForm(emptyCustomFormat);
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
    toast('Regla guardada', 'success');
  };

  const selectedFormat = allFormats.find((f) => f.id === selectedFormatId);
  const stepTitles = [
    {
      title: '📥 Cargar extracto del banco',
      sub: 'Paso 1 de 3 — Elige tu banco',
    },
    {
      title: '📂 Sube el fichero del extracto',
      sub: 'Paso 2 de 3 — Selecciona el archivo descargado',
    },
    {
      title: '✅ Revisa y confirma',
      sub: `Paso 3 de 3 — ${newCount} nuevos · ${dupCount} posibles duplicados`,
    },
  ];
  const currentStepInfo = stepTitles[step - 1];

  return (
    <>
      {createPortal(
        <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          // 🛡️ B2 — Sin click-outside: no podemos perder el progreso del wizard
          // (CSV cargado, columnas configuradas, reglas tocadas...).
        }}
      >
        <div
          style={{
            background: T.cardBg,
            border: `1px solid ${T.cardBorder}`,
            borderRadius: '1.5rem',
            boxShadow: T.cardShadowLg,
            width: '100%',
            maxWidth: '36rem',
            // 👇 height fijo en vez de maxHeight para que flex column funcione bien
            height: '90vh',
            // 🆕 B2 — Layout flex: header fijo, body scroll, footer fijo
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeSlideIn 0.2s ease both',
          }}
        >
          {/* Header fijo */}
          <div
            style={{
              padding: '1.25rem 1.5rem 1rem',
              borderBottom: `1px solid ${T.cardBorder}`,
              background: T.cardBg,
              flexShrink: 0,
            }}
          >
            <div
                style={{
                  display: 'flex',
                  gap: '0.375rem',
                  marginBottom: '0.875rem',
                }}
              >
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    style={{
                      flex: 1,
                      height: '0.25rem',
                      borderRadius: '9999px',
                      background: s <= step ? T.accent : T.cardBorder,
                      transition: 'background 0.3s',
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 800,
                      color: T.title,
                      margin: 0,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {currentStepInfo.title}
                  </h2>
                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: T.muted,
                      margin: '0.2rem 0 0',
                    }}
                  >
                    {currentStepInfo.sub}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    padding: '0.4rem',
                    borderRadius: '0.625rem',
                    border: 'none',
                    background: T.btnSecBg,
                    color: T.muted,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body scrollable */}
            <div
              style={{
                padding: '1.25rem 1.5rem 1.5rem',
                overflowY: 'auto',
                flex: 1,
                minHeight: 0,
              }}
            >
              {/* 🆕 Fase 1 — commit 4/8: paso 1 extraído */}
              {step === 1 && (
                <Step1BankSelection
                  T={T}
                  allFormats={allFormats}
                  selectedFormatId={selectedFormatId}
                  showCustomForm={showCustomForm}
                  showRulesEditor={showRulesEditor}
                  customForm={customForm}
                  editingCustomId={editingCustomId}
                  confirmDeleteFormat={confirmDeleteFormat}
                  emptyCustomFormat={emptyCustomFormat}
                  onSelectFormat={handleSelectFormat}
                  setSelectedFormatId={setSelectedFormatId}
                  setShowCustomForm={setShowCustomForm}
                  setCustomForm={setCustomForm}
                  setEditingCustomId={setEditingCustomId}
                  setConfirmDeleteFormat={setConfirmDeleteFormat}
                  setBankFormats={setBankFormats}
                  toast={toast}
                />
              )}

              {/* PASO 2 */}
              {step === 2 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem',
                      padding: '0.875rem 1rem',
                      borderRadius: '0.875rem',
                      background: T.accentLight,
                      border: `1px solid ${T.accent}33`,
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>🏦</span>
                    <div>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 800,
                          color: T.accent,
                        }}
                      >
                        {selectedFormat?.name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: T.muted,
                          marginTop: '0.1rem',
                        }}
                      >
                        {BANK_FRIENDLY_NOTES[selectedFormatId] ??
                          'Descarga el extracto en formato CSV desde tu banco'}
                      </div>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      style={{
                        marginLeft: 'auto',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '0.625rem',
                        border: `1px solid ${T.accent}44`,
                        background: 'transparent',
                        color: T.accent,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Cambiar
                    </button>
                  </div>

                  {selectedFormat?.note && (
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '0.875rem',
                        background: T.amberBg,
                        border: `1px solid ${T.amberBorder}`,
                        fontSize: '0.775rem',
                        color: T.amber,
                        lineHeight: 1.5,
                        display: 'flex',
                        gap: '0.625rem',
                        alignItems: 'flex-start',
                      }}
                    >
                      <span style={{ flexShrink: 0 }}>💡</span>
                      <span>{selectedFormat.note}</span>
                    </div>
                  )}

<div>
                    <label
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: T.muted,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        display: 'block',
                        marginBottom: '0.35rem',
                      }}
                    >
                      ¿En qué cuenta quieres cargar los movimientos?
                    </label>
                    <select
                      style={selStyle}
                      value={selectedAccountId}
                      onChange={(e) => setSelectedAccountId(e.target.value)}
                    >
                      {accounts.map((a) => {
                        const isCard = a.accountType === 'credit_card';
                        return (
                          <option key={a.id} value={a.id}>
                            {isCard ? '💳' : '🏦'} {a.name} (
                            {a.currency ?? baseCurrency})
                          </option>
                        );
                      })}
                    </select>

                    {/* Banner informativo cuando la cuenta destino es una tarjeta */}
                    {(() => {
                      const acc = accounts.find(
                        (a) => a.id === selectedAccountId
                      );
                      if (acc?.accountType !== 'credit_card') return null;
                      return (
                        <div
                          style={{
                            marginTop: '0.5rem',
                            padding: '0.625rem 0.875rem',
                            borderRadius: '0.75rem',
                            background: T.accentLight,
                            border: `1px solid ${T.accent}33`,
                            fontSize: '0.75rem',
                            color: T.accent,
                            lineHeight: 1.5,
                          }}
                        >
                          💳 <strong>Tarjeta de crédito seleccionada.</strong>{' '}
                          Los gastos aumentarán la deuda de la tarjeta y los
                          pagos/abonos la reducirán.
                        </div>
                      );
                    })()}
                  </div>

                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.txt"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) =>
                        setRawCSV((ev.target?.result as string) ?? '');
                      reader.readAsText(
                        file,
                        selectedFormat?.encoding === 'latin1'
                          ? 'ISO-8859-1'
                          : 'UTF-8'
                      );
                      e.target.value = '';
                    }}
                  />

                  <button
                    onClick={() => fileRef.current?.click()}
                    style={{
                      padding: '2rem 1.5rem',
                      borderRadius: '1rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      border: `2px dashed ${rawCSV ? T.accent : T.cardBorder}`,
                      background: rawCSV ? T.accentLight : T.pageBg,
                      color: rawCSV ? T.accent : T.muted,
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>
                      {rawCSV ? '✅' : '📂'}
                    </span>
                    {rawCSV
                      ? 'Fichero cargado — pulsa para cambiar'
                      : 'Pulsa aquí para seleccionar el fichero del extracto'}
                    {!rawCSV && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 400,
                          color: T.muted,
                        }}
                      >
                        Formatos aceptados: .csv · .txt
                      </span>
                    )}
                  </button>

                  {rawCSV && (
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginBottom: '0.625rem',
                          padding: '0.625rem 0.875rem',
                          borderRadius: '0.75rem',
                          background: T.accentLight,
                          border: `1px solid ${T.accent}33`,
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.775rem',
                            color: T.accent,
                            fontWeight: 600,
                            flex: 1,
                          }}
                        >
                          ⚙️ Filas de cabecera a saltar
                        </span>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          <button
                            onClick={() =>
                              setOverrideSkipRows((s) =>
                                Math.max(
                                  0,
                                  (s ?? selectedFormat?.skipRows ?? 0) - 1
                                )
                              )
                            }
                            style={{
                              padding: '0.25rem 0.625rem',
                              borderRadius: '0.5rem',
                              border: `1px solid ${T.cardBorder}`,
                              background: T.btnSecBg,
                              color: T.btnSecText,
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '1rem',
                            }}
                          >
                            −
                          </button>
                          <span
                            style={{
                              fontSize: '1rem',
                              fontWeight: 800,
                              color: T.accent,
                              minWidth: '1.5rem',
                              textAlign: 'center',
                            }}
                          >
                            {overrideSkipRows ?? selectedFormat?.skipRows ?? 0}
                          </span>
                          <button
                            onClick={() =>
                              setOverrideSkipRows(
                                (s) => (s ?? selectedFormat?.skipRows ?? 0) + 1
                              )
                            }
                            style={{
                              padding: '0.25rem 0.625rem',
                              borderRadius: '0.5rem',
                              border: `1px solid ${T.cardBorder}`,
                              background: T.btnSecBg,
                              color: T.btnSecText,
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '1rem',
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div
                        style={{
                          borderRadius: '0.75rem',
                          border: `1px solid ${T.cardBorder}`,
                          overflow: 'hidden',
                          fontSize: '0.68rem',
                          fontFamily: 'monospace',
                          maxHeight: '12rem',
                          overflowY: 'auto',
                        }}
                      >
                        {rawCSV
                          .split('\n')
                          .slice(0, 30)
                          .filter((l) => l.trim())
                          .map((line, i) => {
                            const skip =
                              overrideSkipRows ?? selectedFormat?.skipRows ?? 0;
                            const isHeader = i < skip;
                            const isFirstData = i === skip;
                            return (
                              <div
                                key={i}
                                style={{
                                  padding: '0.3rem 0.625rem',
                                  background: isFirstData
                                    ? T.greenBg
                                    : isHeader
                                    ? T.pageBg
                                    : T.cardBg,
                                  borderBottom: `1px solid ${T.cardBorder}`,
                                  color: isHeader ? T.muted : T.body,
                                  borderLeft: isFirstData
                                    ? `3px solid ${T.green}`
                                    : '3px solid transparent',
                                  display: 'flex',
                                  gap: '0.5rem',
                                  alignItems: 'center',
                                }}
                              >
                                <span
                                  style={{
                                    color: isFirstData ? T.green : T.muted,
                                    minWidth: '1.5rem',
                                    fontWeight: isFirstData ? 700 : 400,
                                    fontSize: '0.65rem',
                                  }}
                                >
                                  {isFirstData ? '▶' : i + 1}
                                </span>
                                <span
                                  style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: 1,
                                  }}
                                >
                                  {line.length > 90
                                    ? line.slice(0, 90) + '...'
                                    : line}
                                </span>
                                {isFirstData && (
                                  <span
                                    style={{
                                      fontSize: '0.6rem',
                                      background: T.green,
                                      color: '#fff',
                                      padding: '0.1rem 0.375rem',
                                      borderRadius: '9999px',
                                      flexShrink: 0,
                                    }}
                                  >
                                    INICIO
                                  </span>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {parseErrors.length > 0 && (
                    <div
                      style={{
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        background: T.amberBg,
                        border: `1px solid ${T.amberBorder}`,
                        fontSize: '0.775rem',
                        color: T.amber,
                      }}
                    >
                      ⚠️ {parseErrors.length} línea
                      {parseErrors.length !== 1 ? 's' : ''} con errores (se
                      ignorarán)
                    </div>
                  )}

</div>
              )}

              {/* PASO 3 */}
              {step === 3 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem',
                    }}
                  >
                    {[
                      {
                        label: 'Nuevos',
                        value: newCount,
                        color: T.green,
                        bg: T.greenBg,
                        border: T.greenBorder,
                      },
                      {
                        label: 'Duplicados',
                        value: dupCount,
                        color: T.amber,
                        bg: T.amberBg,
                        border: T.amberBorder,
                      },
                      {
                        label: 'Descartados',
                        value: discardedCount,
                        color: T.muted,
                        bg: T.pageBg,
                        border: T.cardBorder,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          padding: '0.5rem 0.625rem',
                          borderRadius: '0.75rem',
                          background: item.bg,
                          border: `1px solid ${item.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '1.125rem',
                            fontWeight: 800,
                            color: item.color,
                            lineHeight: 1,
                          }}
                        >
                          {item.value}
                        </div>
                        <div
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: item.color,
                            textTransform: 'uppercase' as const,
                            lineHeight: 1.2,
                          }}
                        >
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Banner de reglas automáticas — siempre visible en paso 3 */}
                  <div
                    style={{
                      padding: '0.875rem 1rem',
                      borderRadius: '0.875rem',
                      background: T.pageBg,
                      border: `1px solid ${T.cardBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.775rem',
                        color: T.muted,
                        lineHeight: 1.5,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <span style={{ fontWeight: 700, color: T.body }}>
                        ⚙️ Reglas de auto-categorización
                      </span>
                      <br />
                      {importRows.filter(
                        (r) => r.status === 'new' && !r.categoryId
                      ).length > 0 ? (
                        <span style={{ color: T.amber }}>
                          ⚠️{' '}
                          <strong>
                            {
                              importRows.filter(
                                (r) => r.status === 'new' && !r.categoryId
                              ).length
                            }{' '}
                            movimientos
                          </strong>{' '}
                          sin categoría. Crea reglas para automatizarlo la
                          próxima vez.
                        </span>
                      ) : (
                        <span>
                          ✅ Todos los movimientos han sido categorizados
                          automáticamente.
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowRulesEditor(true)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.75rem',
                        border: `1.5px solid ${T.accent}44`,
                        background: T.accentLight,
                        color: T.accent,
                        fontSize: '0.775rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      ⚙️ Gestionar reglas
                    </button>
                  </div>

                  {/* B2 — Lista sin maxHeight fijo: el body del modal ya hace
                     scroll (height:90vh + flex column). Si forzamos un
                     maxHeight aquí, queda hueco entre la última fila y el
                     footer cuando hay pocos movimientos visibles. */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.375rem',
                    }}
                  >
                    {importRows.map((row) => {
                      const dupRow = row.duplicateOf
                        ? realExpenses.find((e) => e.id === row.duplicateOf)
                        : null;
                      const statusColors = {
                        new: {
                          bg: T.greenBg,
                          border: T.greenBorder,
                          color: T.green,
                        },
                        duplicate: {
                          bg: T.amberBg,
                          border: T.amberBorder,
                          color: T.amber,
                        },
                        discarded: {
                          bg: T.pageBg,
                          border: T.cardBorder,
                          color: T.muted,
                        },
                      };
                      const sc = statusColors[row.status];
                      return (
                        <div
                          key={row.id}
                          style={{
                            padding: '0.75rem 0.875rem',
                            borderRadius: '0.75rem',
                            background: sc.bg,
                            border: `1.5px solid ${sc.border}`,
                            opacity: row.status === 'discarded' ? 0.5 : 1,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                            }}
                          >
                            <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                              {row.type === 'income' ? '📈' : '📉'}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: '0.825rem',
                                  fontWeight: 700,
                                  color: T.title,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {row.description}
                              </div>
                              <div
                                style={{ fontSize: '0.68rem', color: T.muted }}
                              >
                                {fmtDateDMY(row.valueDate, dateFormat)}
                              </div>
                            </div>
                            <div
                              style={{
                                fontSize: '0.9rem',
                                fontWeight: 800,
                                color: row.type === 'income' ? T.green : T.red,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                              }}
                            >
                              {row.type === 'income' ? '+' : '-'}
                              {row.amount.toLocaleString('es-ES', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{' '}
                              {row.currency}
                            </div>
                            <span
                              style={{
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                padding: '0.15rem 0.45rem',
                                borderRadius: '9999px',
                                background: sc.color,
                                color: '#fff',
                                flexShrink: 0,
                              }}
                            >
                              {row.status === 'new'
                                ? 'NUEVO'
                                : row.status === 'duplicate'
                                ? 'DUPLICADO'
                                : 'DESCARTADO'}
                            </span>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginTop: '0.375rem',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.68rem',
                                color: T.muted,
                                flexShrink: 0,
                              }}
                            >
                              Categoría:
                            </span>
                            <select
                              value={row.categoryId}
                              onChange={(e) => {
                                setManuallyCategorized(
                                  (prev) => new Set([...prev, row.id])
                                );
                                setImportRows((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id
                                      ? { ...r, categoryId: e.target.value }
                                      : r
                                  )
                                );
                              }}
                              style={{
                                fontSize: '0.72rem',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '0.5rem',
                                border: `1px solid ${T.cardBorder}`,
                                background: T.inputBg,
                                color: T.inputText,
                                cursor: 'pointer',
                                outline: 'none',
                              }}
                            >
                              <option value="">— Sin categoría —</option>
                              {categories
                                .filter((c) => c.type === row.type)
                                .map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                            </select>
                            {row.status !== 'discarded' && (
                              <button
                                onClick={() =>
                                  setImportRows((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id
                                        ? { ...r, status: 'discarded' }
                                        : r
                                    )
                                  )
                                }
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '0.5rem',
                                  border: `1px solid ${T.cardBorder}`,
                                  background: T.btnSecBg,
                                  color: T.muted,
                                  cursor: 'pointer',
                                }}
                              >
                                🗑️ Descartar
                              </button>
                            )}
                            {row.status === 'discarded' && (
                              <button
                                onClick={() =>
                                  setImportRows((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id
                                        ? {
                                            ...r,
                                            status: row.duplicateOf
                                              ? 'duplicate'
                                              : 'new',
                                          }
                                        : r
                                    )
                                  )
                                }
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '0.5rem',
                                  border: `1px solid ${T.greenBorder}`,
                                  background: T.greenBg,
                                  color: T.green,
                                  cursor: 'pointer',
                                }}
                              >
                                ↩️ Restaurar
                              </button>
                            )}
                            {row.status === 'duplicate' && (
                              <button
                                onClick={() =>
                                  setImportRows((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id
                                        ? { ...r, status: 'new' }
                                        : r
                                    )
                                  )
                                }
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '0.5rem',
                                  border: `1px solid ${T.accent}44`,
                                  background: T.accentLight,
                                  color: T.accent,
                                  cursor: 'pointer',
                                }}
                              >
                                ✅ Importar igualmente
                              </button>
                            )}
                          </div>
                          {row.status === 'duplicate' && dupRow && (
                            <div
                              style={{
                                marginTop: '0.375rem',
                                padding: '0.375rem 0.625rem',
                                borderRadius: '0.5rem',
                                background: T.amberBg,
                                border: `1px solid ${T.amberBorder}`,
                                fontSize: '0.68rem',
                                color: T.amber,
                              }}
                            >
                              ⚠️ Posible duplicado:{' '}
                              <strong>{dupRow.description}</strong> ·{' '}
                              {fmtDateDMY(dupRow.valueDate, dateFormat)} ·{' '}
                              {dupRow.amount.toLocaleString('es-ES', {
                                minimumFractionDigits: 2,
                              })}{' '}
                              {dupRow.currency}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {importRows.length === 0 && (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '2rem',
                          color: T.muted,
                          fontSize: '0.875rem',
                        }}
                      >
                        No se encontraron movimientos válidos. Comprueba el
                        banco seleccionado.
                      </div>
                    )}
                  </div>

                  </div>
              )}
            </div>

            {/* ═════ FOOTER FIJO — botones según paso ═════ */}
            <div
              style={{
                padding: '0.875rem 1.5rem',
                borderTop: `1px solid ${T.cardBorder}`,
                background: T.cardBg,
                flexShrink: 0,
                display: 'flex',
                gap: '0.625rem',
              }}
            >
              {step === 1 && !showCustomForm && (
                <button
                  onClick={() => setStep(2)}
                  style={{ ...btnPrimary, flex: 1 }}
                >
                  Continuar con {selectedFormat?.name} →
                </button>
              )}

              {step === 1 && showCustomForm && (
                <>
                  <button
                    onClick={saveCustomFormat}
                    disabled={!customForm.name.trim()}
                    style={{
                      ...btnPrimary,
                      flex: 1,
                      opacity: customForm.name.trim() ? 1 : 0.5,
                    }}
                  >
                    ✅ Guardar formato
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomForm(false);
                      setEditingCustomId(null);
                      setCustomForm(emptyCustomFormat);
                    }}
                    style={btnSec}
                  >
                    Cancelar
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <button
                    onClick={generatePreview}
                    disabled={!rawCSV || !selectedAccountId}
                    style={{
                      ...btnPrimary,
                      flex: 1,
                      opacity: !rawCSV || !selectedAccountId ? 0.5 : 1,
                      cursor:
                        !rawCSV || !selectedAccountId
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                  >
                    Vista previa →
                  </button>
                  <button onClick={() => setStep(1)} style={btnSec}>
                    ← Atrás
                  </button>
                </>
              )}

              {step === 3 && (
                <>
                  <button
                    onClick={confirmImport}
                    disabled={newCount === 0}
                    style={{
                      ...btnPrimary,
                      flex: 1,
                      background: T.green,
                      opacity: newCount === 0 ? 0.5 : 1,
                      cursor: newCount === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    ✅ Cargar {newCount} movimiento{newCount !== 1 ? 's' : ''}
                  </button>
                  <button onClick={() => setStep(2)} style={btnSec}>
                    ← Atrás
                  </button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* 🆕 Fase 1 — commit 3/8: editor de reglas extraído */}
      {showRulesEditor && (
        <RulesEditorModal
          T={T}
          categories={categories}
          categoryRules={categoryRules}
          setCategoryRules={setCategoryRules}
          editingRule={editingRule}
          setEditingRule={setEditingRule}
          ruleForm={ruleForm}
          setRuleForm={setRuleForm}
          onSaveRule={saveRule}
          onClose={() => {
            setShowRulesEditor(false);
            setEditingRule(null);
            setRuleForm({ categoryId: '', keywords: '' });
          }}
          toast={toast}
        />
      )}
    </>
  );
}
