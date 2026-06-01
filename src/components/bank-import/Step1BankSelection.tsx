// src/components/bank-import/Step1BankSelection.tsx
//
// Paso 1 del wizard de importación bancaria.
// Muestra la lista de bancos/formatos y el editor de formato personalizado.
//
// Extraído de BankImportModal.tsx (refactor Fase 1 — commit 4/8).
// Estado controlado por el padre: facilita la migración a useBankImport (commit 8).

import { Check } from 'lucide-react';
import type { CSSProperties, Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

import type { BankColumnKey, BankFormat } from '../../types';
import {
  BANK_COLUMN_OPTIONS,
  PREDEFINED_BANK_FORMATS,
  BANK_FRIENDLY_NOTES,
} from '../../lib/bankFormats';
import {
  bankInputStyle,
  bankSelectStyle,
  bankBtnPrimary,
  bankBtnSecondary,
} from '../../lib/bankImportStyles';

// Theme tokens consumidos — subset de T.
type ThemeTokens = {
  accentLight: string;
  accent: string;
  cardBorder: string;
  muted: string;
  title: string;
  pageBg: string;
  btnSecBg: string;
  btnSecText: string;
  redBorder: string;
  redBg: string;
  red: string;
  inputBorder: string;
  inputBg: string;
  inputText: string;
};

type Props = {
  T: ThemeTokens;
  allFormats: BankFormat[];
  selectedFormatId: string;
  showCustomForm: boolean;
  showRulesEditor: boolean;
  customForm: BankFormat;
  editingCustomId: string | null;
  confirmDeleteFormat: string | null;
  emptyCustomFormat: BankFormat;
  onSelectFormat: (id: string) => void;
  setSelectedFormatId: Dispatch<SetStateAction<string>>;
  setShowCustomForm: Dispatch<SetStateAction<boolean>>;
  setCustomForm: Dispatch<SetStateAction<BankFormat>>;
  setEditingCustomId: Dispatch<SetStateAction<string | null>>;
  setConfirmDeleteFormat: Dispatch<SetStateAction<string | null>>;
  setBankFormats: Dispatch<SetStateAction<BankFormat[]>>;
  toast: (message: string, type: 'success' | 'error' | 'info') => void;
};

export function Step1BankSelection({
  T,
  allFormats,
  selectedFormatId,
  showCustomForm,
  showRulesEditor,
  customForm,
  editingCustomId,
  confirmDeleteFormat,
  emptyCustomFormat,
  onSelectFormat,
  setSelectedFormatId,
  setShowCustomForm,
  setCustomForm,
  setEditingCustomId,
  setConfirmDeleteFormat,
  setBankFormats,
  toast,
}: Props) {
  const { t } = useTranslation();
  const inputStyle: CSSProperties = bankInputStyle(T);
  const selStyle: CSSProperties = bankSelectStyle(T);
  const btnPrimary: CSSProperties = bankBtnPrimary(T);
  const btnSec: CSSProperties = bankBtnSecondary(T);

  return (
    <>
      {!showCustomForm && !showRulesEditor && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div
            style={{
              padding: '0.875rem 1rem',
              borderRadius: '0.875rem',
              background: T.accentLight,
              border: `1px solid ${T.accent}33`,
              fontSize: '0.825rem',
              color: T.accent,
              lineHeight: 1.6,
            }}
          >
            💡 <strong>{t('bankImport.step1.howItWorksTitle')}</strong>
            <br />
            {t('bankImport.step1.howItWorksBody')}
          </div>

          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: T.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {t('bankImport.step1.selectBank')}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {allFormats.map((f) => {
              const isSelected = selectedFormatId === f.id;
              const friendlyNote =
                BANK_FRIENDLY_NOTES[f.id] ??
                (f.isCustom ? t('bankImport.step1.customFormatNote') : null);
              return (
                <div
                  key={f.id}
                  onClick={() => onSelectFormat(f.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.875rem',
                    cursor: 'pointer',
                    border: `2px solid ${
                      isSelected ? T.accent : T.cardBorder
                    }`,
                    background: isSelected ? T.accentLight : T.pageBg,
                    transition: 'all 0.15s',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                      {f.isCustom ? '⚙️' : '🏦'}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.925rem',
                          fontWeight: 700,
                          color: T.title,
                        }}
                      >
                        {f.name}
                      </div>
                      {friendlyNote && (
                        <div
                          style={{
                            fontSize: '0.72rem',
                            color: T.muted,
                            marginTop: '0.15rem',
                            lineHeight: 1.4,
                          }}
                        >
                          {friendlyNote}
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.375rem',
                      alignItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {f.isCustom && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomForm(f);
                            setEditingCustomId(f.id);
                            setShowCustomForm(true);
                          }}
                          style={{
                            padding: '0.3rem 0.5rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${T.cardBorder}`,
                            background: T.btnSecBg,
                            color: T.btnSecText,
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteFormat(f.id);
                          }}
                          style={{
                            padding: '0.3rem 0.5rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${T.redBorder}`,
                            background: T.redBg,
                            color: T.red,
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                          }}
                        >
                          🗑️
                        </button>
                      </>
                    )}
                    {isSelected && <Check size={18} color={T.accent} />}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              padding: '0.875rem 1rem',
              borderRadius: '0.875rem',
              background: T.pageBg,
              border: `1px solid ${T.cardBorder}`,
              fontSize: '0.8rem',
              color: T.muted,
              lineHeight: 1.5,
            }}
          >
            {t('bankImport.step1.notYourBank')}{' '}
            <button
              onClick={() => {
                setCustomForm(emptyCustomFormat);
                setEditingCustomId(null);
                setShowCustomForm(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: T.accent,
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
                fontSize: '0.8rem',
              }}
            >
              {t('bankImport.step1.configureOwn')}
            </button>
          </div>

          {confirmDeleteFormat && (
            <div
              style={{
                padding: '0.875rem 1rem',
                borderRadius: '0.875rem',
                background: T.redBg,
                border: `1px solid ${T.redBorder}`,
              }}
            >
              <div
                style={{
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  color: T.red,
                  marginBottom: '0.625rem',
                }}
              >
                {t('bankImport.step1.confirmDeleteTitle')}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setBankFormats((prev) =>
                      prev.filter((f) => f.id !== confirmDeleteFormat)
                    );
                    if (selectedFormatId === confirmDeleteFormat)
                      setSelectedFormatId(
                        PREDEFINED_BANK_FORMATS[0].id
                      );
                    setConfirmDeleteFormat(null);
                    toast(t('bankImport.step1.formatDeleted'), 'success');
                  }}
                  style={{
                    ...btnPrimary,
                    background: T.red,
                    fontSize: '0.8rem',
                    padding: '0.5rem 1rem',
                  }}
                >
                  {t('bankImport.step1.confirmDeleteBtn')}
                </button>
                <button
                  onClick={() => setConfirmDeleteFormat(null)}
                  style={{
                    ...btnSec,
                    fontSize: '0.8rem',
                    padding: '0.5rem 1rem',
                  }}
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showCustomForm && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
          }}
        >
          <div
            style={{
              fontSize: '0.875rem',
              fontWeight: 800,
              color: T.title,
            }}
          >
            {editingCustomId
              ? t('bankImport.step1.editFormatTitle')
              : t('bankImport.step1.newFormatTitle')}
          </div>
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
              {t('bankImport.step1.bankName')}
            </label>
            <input
              style={inputStyle}
              placeholder={t('bankImport.step1.bankNamePlaceholder')}
              value={customForm.name}
              onChange={(e) =>
                setCustomForm((f) => ({ ...f, name: e.target.value }))
              }
            />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
            }}
          >
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
                {t('bankImport.step1.separator')}
              </label>
              <select
                style={selStyle}
                value={customForm.separator}
                onChange={(e) =>
                  setCustomForm((f) => ({
                    ...f,
                    separator: e.target.value as any,
                  }))
                }
              >
                <option value=";">{t('bankImport.step1.separatorSemicolon')}</option>
                <option value=",">{t('bankImport.step1.separatorComma')}</option>
                <option value={'\t'}>{t('bankImport.step1.separatorTab')}</option>
              </select>
            </div>
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
                {t('bankImport.step1.decimal')}
              </label>
              <select
                style={selStyle}
                value={customForm.decimal}
                onChange={(e) =>
                  setCustomForm((f) => ({
                    ...f,
                    decimal: e.target.value as any,
                  }))
                }
              >
                <option value=",">{t('bankImport.step1.decimalComma')}</option>
                <option value=".">{t('bankImport.step1.decimalDot')}</option>
              </select>
            </div>
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
                {t('bankImport.step1.dateFormat')}
              </label>
              <select
                style={selStyle}
                value={customForm.dateFormat}
                onChange={(e) =>
                  setCustomForm((f) => ({
                    ...f,
                    dateFormat: e.target.value as any,
                  }))
                }
              >
                <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                <option value="dd-mm-yyyy">DD-MM-YYYY</option>
                <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                <option value="dd/mm/yy">DD/MM/YY</option>
              </select>
            </div>
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
                {t('bankImport.step1.skipRows')}
              </label>
              <input
                style={inputStyle}
                type="number"
                min={0}
                max={20}
                value={customForm.skipRows}
                onChange={(e) =>
                  setCustomForm((f) => ({
                    ...f,
                    skipRows: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
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
              {t('bankImport.step1.amountMode')}
            </label>
            <select
              style={selStyle}
              value={customForm.amountMode}
              onChange={(e) =>
                setCustomForm((f) => ({
                  ...f,
                  amountMode: e.target.value as any,
                }))
              }
            >
              <option value="single">{t('bankImport.step1.amountModeSingle')}</option>
              <option value="split">{t('bankImport.step1.amountModeSplit')}</option>
            </select>
          </div>
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
              {t('bankImport.step1.columns')}
            </label>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
              }}
            >
              {customForm.columns.map((col, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: T.muted,
                      minWidth: '3rem',
                    }}
                  >
                    {t('bankImport.step1.colLabel', { n: i + 1 })}
                  </span>
                  <select
                    value={col}
                    onChange={(e) =>
                      setCustomForm((f) => {
                        const cols = [...f.columns];
                        cols[i] = e.target.value as BankColumnKey;
                        return { ...f, columns: cols };
                      })
                    }
                    style={{ ...selStyle, marginBottom: 0, flex: 1 }}
                  >
                    {BANK_COLUMN_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      setCustomForm((f) => ({
                        ...f,
                        columns: f.columns.filter((_, j) => j !== i),
                      }))
                    }
                    style={{
                      padding: '0.4rem 0.5rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${T.redBorder}`,
                      background: T.redBg,
                      color: T.red,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setCustomForm((f) => ({
                    ...f,
                    columns: [...f.columns, 'ignore'],
                  }))
                }
                style={{
                  ...btnSec,
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.75rem',
                  alignSelf: 'flex-start',
                }}
              >
                {t('bankImport.step1.addColumn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
