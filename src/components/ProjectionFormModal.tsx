// ════════════════════════════════════════════════════════════════════════════
// ProjectionFormModal.tsx
//
// Modal de crear / editar una proyección.
// Extraído de src/views/Projections.tsx (Bloque 1.1.4 del refactor Fase 1.1).
//
// Componente "presentacional": recibe estado y handlers por props.
// El estado del formulario sigue viviendo en el padre (Projections) porque
// es compartido con validación y persistencia.
// ════════════════════════════════════════════════════════════════════════════

import { useState, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  X,
  Check,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Bell,
  BellOff,
} from 'lucide-react';
import type { Account, Category } from '../types';
import {
  CURRENCIES,
  FREQUENCIES,
  fmtDateDMY,
  syncEndDateDay,
} from '../utils';
import {
  Field,
  Input,
  MoneyInput,
  Sel,
  PrimaryBtn,
  SecondaryBtn,
  QuickCategoryModal,
} from './UI';
import {
  ALERT_WINDOW_PRESETS,
  type ProjectionForm,
} from '../lib/projectionsForm';
import { getDefaultAlertWindow } from '../lib/projectionAlerts';


export type ProjectionFormModalProps = {
  mode: 'add' | string; // 'add' o id de la proyección a editar
  T: any;
  form: ProjectionForm;
  setForm: React.Dispatch<React.SetStateAction<ProjectionForm>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  showAdvanced: boolean;
  setShowAdvanced: React.Dispatch<React.SetStateAction<boolean>>;
  accounts: Account[];
  categories: Category[];
  dateFormat: string;
  onSave: () => void;
  onClose: () => void;
};

export function ProjectionFormModal({
  mode,
  T,
  form,
  setForm,
  errors,
  setErrors,
  showAdvanced,
  setShowAdvanced,
  accounts,
  categories,
  dateFormat,
  onSave,
  onClose,
}: ProjectionFormModalProps) {
  const { t } = useTranslation();
  const [showQuickCategory, setShowQuickCategory] = useState(false);

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'max(1rem, env(safe-area-inset-top, 0px)) 1rem max(1rem, env(safe-area-inset-bottom, 0px))',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          background: T.cardBg,
          border: `1px solid ${T.cardBorder}`,
          borderRadius: '1.25rem',
          boxShadow: T.cardShadowLg,
          width: '100%',
          maxWidth: '32rem',
          maxHeight: 'min(92svh, 92vh)',
          overflowY: 'auto',
          animation: 'fadeSlideIn 0.2s ease both',
        }}
      >
        {/* HEADER */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            padding: '1rem 1.25rem',
            borderBottom: `1px solid ${T.cardBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            background: T.cardBg,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.125rem',
                fontWeight: 800,
                color: T.title,
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              {mode === 'add' ? t('projections.form.titleAdd') : t('projections.form.titleEdit')}
            </h2>
            <p
              style={{
                fontSize: '0.75rem',
                color: T.muted,
                marginTop: '0.15rem',
              }}
            >
              {t('projections.form.subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.4rem',
              borderRadius: '0.5rem',
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

        {/* BODY */}
        <div
          style={{
            padding: '1rem 1.25rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
          }}
        >
          {/* TIPO */}
          <div>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: T.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.4rem',
              }}
            >
              {t('projections.form.fieldType')}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.4rem',
              }}
            >
              {[
                {
                  val: 'income' as const,
                  icon: <TrendingUp size={14} />,
                  label: t('categories.typeIncome'),
                  color: T.green,
                  bg: T.greenBg,
                },
                {
                  val: 'expense' as const,
                  icon: <TrendingDown size={14} />,
                  label: t('categories.typeExpense'),
                  color: T.red,
                  bg: T.redBg ?? T.amberBg,
                },
                {
                  val: 'transfer' as const,
                  icon: <ArrowLeftRight size={14} />,
                  label: t('projections.form.typeTransfer'),
                  color: T.accent,
                  bg: T.accentLight,
                },
              ].map(({ val, icon, label, color, bg }) => {
                const selected = form.type === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        type: val,
                        categoryId: '',
                        toAccountId: val !== 'transfer' ? '' : f.toAccountId,
                      }))
                    }
                    style={{
                      padding: '0.55rem 0.5rem',
                      borderRadius: '0.625rem',
                      cursor: 'pointer',
                      border: `1.5px solid ${selected ? color : T.cardBorder}`,
                      background: selected ? bg : T.pageBg,
                      color: selected ? color : T.muted,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      transition: 'all 0.15s',
                    }}
                  >
                    {icon}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* NOMBRE */}
          <Field label={t('projections.form.fieldName')} error={errors.name}>
            <Input
              T={T}
              error={errors.name}
              placeholder={t('projections.form.placeholderName')}
              value={form.name}
              autoFocus
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                setErrors((er) => ({ ...er, name: undefined as any }));
              }}
            />
          </Field>

          {/* IMPORTE + DIVISA */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 7rem',
              gap: '0.625rem',
            }}
          >
            <Field label={t('projections.form.fieldAmount')} error={errors.amount}>
              <MoneyInput
                T={T}
                currency={form.currency}
                error={errors.amount}
                value={form.amount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setForm((f) => ({ ...f, amount: e.target.value }));
                  setErrors((er) => ({ ...er, amount: undefined as any }));
                }}
              />
            </Field>
            <Field label={t('projections.form.fieldCurrency')}>
              <Sel
                T={T}
                value={form.currency}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setForm((f) => ({ ...f, currency: e.target.value }))
                }
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </Sel>
            </Field>
          </div>

          {/* CUENTA(S) */}
          {form.type === 'transfer' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.625rem',
              }}
            >
              <Field label={t('projections.form.fieldFrom')} error={errors.accountId}>
                <Sel
                  T={T}
                  value={form.accountId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    setForm((f) => ({ ...f, accountId: e.target.value }));
                    setErrors((er) => ({
                      ...er,
                      accountId: undefined as any,
                    }));
                  }}
                >
                  <option value="">{t('projections.form.accountFromPlaceholder')}</option>
                  {accounts.map((a) => (
                    <option
                      key={a.id}
                      value={a.id}
                      disabled={a.id === form.toAccountId}
                    >
                      {a.name}
                    </option>
                  ))}
                </Sel>
              </Field>
              <Field label={t('projections.form.fieldTo')} error={errors.toAccountId}>
                <Sel
                  T={T}
                  value={form.toAccountId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    setForm((f) => ({ ...f, toAccountId: e.target.value }));
                    setErrors((er) => ({
                      ...er,
                      toAccountId: undefined as any,
                    }));
                  }}
                >
                  <option value="">{t('projections.form.accountToPlaceholder')}</option>
                  {accounts.map((a) => (
                    <option
                      key={a.id}
                      value={a.id}
                      disabled={a.id === form.accountId}
                    >
                      {a.name}
                    </option>
                  ))}
                </Sel>
              </Field>
            </div>
          ) : (
            <Field label={t('projections.form.fieldAccount')} error={errors.accountId}>
              <Sel
                T={T}
                value={form.accountId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  setForm((f) => ({ ...f, accountId: e.target.value }));
                  setErrors((er) => ({ ...er, accountId: undefined as any }));
                }}
              >
                <option value="">{t('projections.form.accountPlaceholder')}</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Sel>
            </Field>
          )}

          {/* CATEGORÍA */}
          {form.type !== 'transfer' && (
            <Field label={t('projections.form.fieldCategory')} error={errors.categoryId}>
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <Sel
                    T={T}
                    value={form.categoryId}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                      setForm((f) => ({ ...f, categoryId: e.target.value }));
                      setErrors((er) => ({
                        ...er,
                        categoryId: undefined as any,
                      }));
                    }}
                  >
                    <option value="">{t('projections.form.categoryPlaceholder')}</option>
                    {categories
                      .filter((c) => c.type === form.type)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </Sel>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickCategory(true)}
                  title={t('categories.form.newCategoryTooltip')}
                  style={{
                    padding: '0.55rem 0.7rem',
                    borderRadius: '0.625rem',
                    border: `1.5px solid ${T.accent}44`,
                    background: T.accentLight,
                    color: T.accent,
                    fontSize: '1rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  +
                </button>
              </div>
              {categories.filter((c) => c.type === form.type).length === 0 && (
                <div
                  style={{
                    marginTop: '0.4rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    background: T.amberBg,
                    border: `1px solid ${T.amberBorder}`,
                    fontSize: '0.72rem',
                    color: T.amber,
                    lineHeight: 1.4,
                  }}
                >
                  {form.type === 'income'
                    ? t('projections.form.noCategoriesIncomeWarning')
                    : t('projections.form.noCategoriesExpenseWarning')}{' '}
                  {t('projections.form.noCategoriesCreate')} <strong>+</strong>.
                </div>
              )}
            </Field>
          )}

          {form.type !== 'transfer' && showQuickCategory && (
            <QuickCategoryModal
              T={T}
              defaultType={form.type as 'income' | 'expense'}
              onSave={(newCat) => {
                setForm((f) => ({ ...f, categoryId: newCat.id }));
                setShowQuickCategory(false);
              }}
              onClose={() => setShowQuickCategory(false)}
            />
          )}

          {/* ZONA 2: CUÁNDO OCURRE */}
          <div
            style={{
              padding: '0.875rem',
              borderRadius: '0.875rem',
              border: `1.5px solid ${T.cardBorder}`,
              background: T.pageBg,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: T.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {t('projections.form.whenSection')}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.625rem',
              }}
            >
              <Field label={t('projections.form.fieldFrequency')}>
                <Sel
                  T={T}
                  value={form.frequency}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setForm((f) => ({
                      ...f,
                      frequency: e.target.value,
                      alertWindowDays:
                        f.alertWindowDays === 'custom'
                          ? 'custom'
                          : getDefaultAlertWindow(e.target.value),
                    }))
                  }
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {t(`projections.frequencies.${f.value}` as any)}
                    </option>
                  ))}
                </Sel>
              </Field>
              <Field label={t('projections.form.fieldStartDate')}>
                <Input
                  T={T}
                  type="date"
                  value={form.startDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const newStart = e.target.value;
                    setForm((f) => ({
                      ...f,
                      startDate: newStart,
                      endDate: f.endDate
                        ? syncEndDateDay(newStart, f.endDate)
                        : f.endDate,
                      recurringDay: f.isRecurring
                        ? new Date(newStart + 'T00:00:00').getDate()
                        : f.recurringDay,
                    }));
                  }}
                />
                {form.startDate && (
                  <p
                    style={{
                      fontSize: '0.7rem',
                      color: T.muted,
                      marginTop: '0.3rem',
                    }}
                  >
                    📅 {fmtDateDMY(form.startDate, dateFormat)}
                  </p>
                )}
              </Field>
            </div>

            <Field label={t('projections.form.fieldEndDate')} error={errors.endDate}>
              <Input
                T={T}
                error={errors.endDate}
                type="date"
                value={form.endDate}
                min={form.startDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value;
                  const synced = val
                    ? syncEndDateDay(form.startDate, val)
                    : val;
                  setForm((f) => ({ ...f, endDate: synced }));
                  setErrors((er) => ({ ...er, endDate: undefined as any }));
                }}
              />
              {form.endDate && (
                <p
                  style={{
                    fontSize: '0.7rem',
                    color: T.muted,
                    marginTop: '0.3rem',
                  }}
                >
                  📅 {fmtDateDMY(form.endDate, dateFormat)}
                </p>
              )}
            </Field>

            {form.startDate && (
              <div
                style={{
                  fontSize: '0.72rem',
                  color: T.muted,
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  background: T.cardBg,
                  border: `1px solid ${T.cardBorder}`,
                }}
              >
                {t('projections.form.paymentDayHint', { day: new Date(form.startDate + 'T00:00:00').getDate() })}
              </div>
            )}

            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem',
                padding: '0.75rem',
                borderRadius: '0.625rem',
                background: form.isRecurring ? T.accentLight : T.cardBg,
                border: `1.5px solid ${
                  form.isRecurring ? T.accent : T.cardBorder
                }`,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <input
                type="checkbox"
                checked={form.isRecurring}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isRecurring: e.target.checked }))
                }
                style={{
                  width: '1.05rem',
                  height: '1.05rem',
                  cursor: 'pointer',
                  accentColor: T.accent,
                  flexShrink: 0,
                  marginTop: '0.1rem',
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    color: form.isRecurring ? T.accent : T.title,
                  }}
                >
                  {t('projections.form.recurringLabel')}
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: T.muted,
                    marginTop: '0.15rem',
                    lineHeight: 1.4,
                  }}
                >
                  {t('projections.form.recurringDesc')}
                </div>
              </div>
            </label>
          </div>

          {/* ZONA 3: MÁS OPCIONES */}
          <div
            style={{
              borderRadius: '0.875rem',
              border: `1.5px solid ${showAdvanced ? T.accent : T.cardBorder}`,
              overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}
          >
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              style={{
                width: '100%',
                padding: '0.75rem 0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: showAdvanced ? T.accentLight : T.pageBg,
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    color: showAdvanced ? T.accent : T.title,
                  }}
                >
                  {t('projections.form.moreOptions')}
                </span>
                {(form.notes ||
                  form.nextOverrideAmount ||
                  !form.alertEnabled) && (
                  <span
                    style={{
                      padding: '0.1rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      background: T.accent,
                      color: '#fff',
                    }}
                  >
                    {[
                      form.notes && t('projections.form.badgeNotes'),
                      form.nextOverrideAmount && t('projections.form.badgeMonthAdj'),
                      !form.alertEnabled && t('projections.form.badgeNoAlerts'),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                )}
              </div>
              {showAdvanced ? (
                <ChevronUp size={15} color={T.accent} />
              ) : (
                <ChevronDown size={15} color={T.muted} />
              )}
            </button>

            {showAdvanced && (
              <div
                style={{
                  padding: '0.875rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                  borderTop: `1px solid ${T.cardBorder}`,
                }}
              >
                {/* Notas */}
                <Field label={t('projections.form.fieldNotes')}>
                  <textarea
                    placeholder={t('projections.form.placeholderNotes')}
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '0.625rem',
                      border: `1.5px solid ${T.inputBorder}`,
                      background: T.inputBg,
                      color: T.inputText,
                      fontSize: '0.825rem',
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                  />
                </Field>

                {/* Avisos */}
                <div
                  style={{
                    padding: '0.875rem',
                    borderRadius: '0.75rem',
                    background: form.alertEnabled ? T.accentLight : T.pageBg,
                    border: `1.5px solid ${
                      form.alertEnabled ? T.accent + '55' : T.cardBorder
                    }`,
                    transition: 'all 0.2s',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.625rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.alertEnabled}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          alertEnabled: e.target.checked,
                        }))
                      }
                      style={{
                        width: '1.05rem',
                        height: '1.05rem',
                        cursor: 'pointer',
                        accentColor: T.accent,
                        flexShrink: 0,
                        marginTop: '0.1rem',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.825rem',
                          fontWeight: 700,
                          color: form.alertEnabled ? T.accent : T.title,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Bell size={13} /> {t('projections.form.alertLabel')}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: T.muted,
                          marginTop: '0.15rem',
                          lineHeight: 1.4,
                        }}
                      >
                        {t('projections.form.alertDesc')}
                      </div>
                    </div>
                  </label>

                  {form.alertEnabled && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        paddingTop: '0.75rem',
                        borderTop: `1px solid ${T.accent}33`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: T.body,
                          fontWeight: 600,
                        }}
                      >
                        {t('projections.form.alertBefore')}
                      </span>
                      <select
                        value={String(form.alertWindowDays)}
                        onChange={(e) => {
                          const v = e.target.value;
                          setForm((f) => ({
                            ...f,
                            alertWindowDays:
                              v === 'custom' ? 'custom' : parseInt(v),
                          }));
                        }}
                        style={{
                          padding: '0.4rem 0.625rem',
                          borderRadius: '0.5rem',
                          border: `1.5px solid ${T.cardBorder}`,
                          background: T.cardBg,
                          color: T.title,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        {ALERT_WINDOW_PRESETS.map((d) => (
                          <option key={d} value={d}>
                            {t('projections.form.alertDays', { n: d })}
                          </option>
                        ))}
                        <option value="custom">{t('projections.form.alertCustom')}</option>
                      </select>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: T.body,
                          fontWeight: 600,
                        }}
                      >
                        {t('projections.form.alertAfter')}
                      </span>

                      {form.alertWindowDays === 'custom' && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            width: '100%',
                            marginTop: '0.4rem',
                          }}
                        >
                          <input
                            type="number"
                            min={1}
                            max={365}
                            placeholder={t('projections.form.alertDaysPlaceholder')}
                            value={form.alertWindowCustom}
                            onChange={(e) => {
                              setForm((f) => ({
                                ...f,
                                alertWindowCustom: e.target.value,
                              }));
                              setErrors((er) => ({
                                ...er,
                                alertWindowCustom: undefined as any,
                              }));
                            }}
                            style={{
                              width: '8rem',
                              padding: '0.4rem 0.625rem',
                              borderRadius: '0.5rem',
                              border: `1.5px solid ${
                                errors.alertWindowCustom
                                  ? T.red
                                  : T.inputBorder
                              }`,
                              background: T.inputBg,
                              color: T.inputText,
                              fontSize: '0.78rem',
                              outline: 'none',
                            }}
                          />
                          <span
                            style={{ fontSize: '0.72rem', color: T.muted }}
                          >
                            {t('projections.form.alertDaysRange')}
                          </span>
                        </div>
                      )}
                      {errors.alertWindowCustom && (
                        <div
                          style={{
                            width: '100%',
                            fontSize: '0.7rem',
                            color: T.red,
                            fontWeight: 600,
                          }}
                        >
                          {errors.alertWindowCustom}
                        </div>
                      )}
                    </div>
                  )}

                  {!form.alertEnabled && (
                    <div
                      style={{
                        marginTop: '0.625rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        background: T.amberBg,
                        border: `1px solid ${T.amberBorder}`,
                        fontSize: '0.72rem',
                        color: T.amber,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        lineHeight: 1.4,
                      }}
                    >
                      <BellOff size={12} /> {t('projections.form.alertDisabledMsg')}
                    </div>
                  )}
                </div>

                {/* Ajuste puntual */}
                <div
                  style={{
                    padding: '0.875rem',
                    borderRadius: '0.75rem',
                    background: form.nextOverrideAmount
                      ? T.amberBg
                      : T.pageBg,
                    border: `1.5px solid ${
                      form.nextOverrideAmount ? T.amberBorder : T.cardBorder
                    }`,
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: form.nextOverrideAmount ? T.amber : T.title,
                      marginBottom: '0.2rem',
                    }}
                  >
                    {t('projections.form.overrideTitle')}
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: T.muted,
                      marginBottom: '0.5rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {t('projections.form.overrideDesc')}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder={t('projections.form.overridePlaceholder', { amount: form.amount || '0.00' })}
                    value={form.nextOverrideAmount ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        nextOverrideAmount: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      }))
                    }
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '0.625rem',
                      border: `1.5px solid ${
                        form.nextOverrideAmount
                          ? T.amberBorder
                          : T.inputBorder
                      }`,
                      background: T.inputBg,
                      color: T.inputText,
                      fontSize: '0.825rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {form.nextOverrideAmount && (
                    <button
                      onClick={() =>
                        setForm((f) => ({ ...f, nextOverrideAmount: null }))
                      }
                      style={{
                        marginTop: '0.4rem',
                        padding: '0.3rem 0.625rem',
                        borderRadius: '0.4rem',
                        border: `1px solid ${T.amberBorder}`,
                        background: 'transparent',
                        color: T.amber,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {t('projections.form.overrideRemove')}
                    </button>
                  )}
                </div>

                {/* Pausar (solo EDIT) */}
                {mode !== 'add' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0.875rem',
                      borderRadius: '0.75rem',
                      background: T.pageBg,
                      border: `1px solid ${T.cardBorder}`,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '0.825rem',
                          fontWeight: 700,
                          color: T.title,
                        }}
                      >
                        {form.active
                          ? t('projections.form.pauseActiveLabel')
                          : t('projections.form.pausedLabel')}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: T.muted,
                          marginTop: '0.1rem',
                        }}
                      >
                        {form.active
                          ? t('projections.form.pauseActiveDesc')
                          : t('projections.form.pausedDesc')}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setForm((f) => ({ ...f, active: !f.active }))
                      }
                      style={{
                        width: '2.75rem',
                        height: '1.5rem',
                        borderRadius: '9999px',
                        border: 'none',
                        background: form.active ? T.accent : T.cardBorder,
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background 0.2s',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: '0.15rem',
                          left: form.active ? '1.35rem' : '0.15rem',
                          width: '1.2rem',
                          height: '1.2rem',
                          borderRadius: '50%',
                          background: '#fff',
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }}
                      />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER STICKY */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            zIndex: 2,
            padding: '0.875rem 1.25rem',
            borderTop: `1px solid ${T.cardBorder}`,
            background: T.cardBg,
            display: 'flex',
            gap: '0.625rem',
          }}
        >
          <PrimaryBtn onClick={onSave} fullWidth>
            <Check size={15} />
            {mode === 'add' ? t('common.createProjection') : t('common.saveChanges')}
          </PrimaryBtn>
          <SecondaryBtn onClick={onClose} T={T}>
            {t('common.cancel')}
          </SecondaryBtn>
        </div>
      </div>
    </div>,
    document.body
  );
}
