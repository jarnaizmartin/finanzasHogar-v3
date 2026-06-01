import { useState, type ChangeEvent } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../AppContext';
import type { SavingsGoal } from '../types';
import {
  fmt,
  fmtDateShort,
  fmtDateDMY,
  CURRENCIES,
} from '../utils';
import {
  Field,
  Input,
  Sel,
  QuickCategoryModal,
} from './UI';
import { GOAL_EMOJIS, GOAL_COLORS } from '../lib/goalsConstants';
import { calcGoalDeadlineProjection } from '../lib/goalsCalc';

type FormState = Omit<SavingsGoal, 'id'>;
type ErrorsState = Record<string, string>;

export function GoalWizard({
  step,
  form,
  setForm,
  errors,
  setErrors,
}: {
  step: number;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  errors: ErrorsState;
  setErrors: React.Dispatch<React.SetStateAction<ErrorsState>>;
}) {
  const { t } = useTranslation();
  const { T, accounts, categories, rates, dateFormat } = useApp();
  const [showQuickCategory, setShowQuickCategory] = useState(false);

  // ── Paso 1 ────────────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Field label={t('goals.wizard.fieldIcon')}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {GOAL_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setForm((f) => ({ ...f, emoji: e }))}
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.625rem',
                border: `2px solid ${
                  form.emoji === e ? T.accent : T.cardBorder
                }`,
                background: form.emoji === e ? T.accentLight : T.pageBg,
                fontSize: '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </Field>

      <Field label={t('goals.wizard.fieldColor')}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {GOAL_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setForm((f) => ({ ...f, color: c }))}
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                border:
                  form.color === c
                    ? `3px solid ${T.title}`
                    : '3px solid transparent',
                background: c,
                cursor: 'pointer',
                transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
                transition: 'all 0.15s',
                boxShadow:
                  form.color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none',
              }}
            />
          ))}
        </div>
      </Field>

      <Field label={t('goals.wizard.fieldName')} error={errors.name}>
        <Input
          T={T}
          error={errors.name}
          placeholder={t('goals.wizard.namePlaceholder')}
          value={form.name}
          autoFocus
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setForm((f) => ({ ...f, name: e.target.value }));
            setErrors((er) => ({ ...er, name: undefined as any }));
          }}
        />
      </Field>

      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
      >
        <Field label={t('goals.wizard.fieldAmount')} error={errors.targetAmount}>
          <Input
            T={T}
            error={errors.targetAmount}
            type="number"
            step="0.01"
            placeholder="0.00"
            value={form.targetAmount || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setForm((f) => ({
                ...f,
                targetAmount: parseFloat(e.target.value) || 0,
              }));
              setErrors((er) => ({ ...er, targetAmount: undefined as any }));
            }}
          />
        </Field>
        <Field label={t('goals.wizard.fieldCurrency')}>
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

      <Field label={t('goals.wizard.fieldDeadline')}>
        <Input
          T={T}
          type="date"
          value={form.deadline}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setForm((f) => ({ ...f, deadline: e.target.value }))
          }
        />
        {form.deadline && (
          <p
            style={{
              fontSize: '0.7rem',
              color: T.muted,
              marginTop: '0.3rem',
            }}
          >
            📅 {fmtDateDMY(form.deadline, dateFormat)}
          </p>
        )}
      </Field>

      {form.name && form.targetAmount > 0 && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '1rem',
            background: T.accentLight,
            border: `1.5px solid ${form.color}33`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
          }}
        >
          <span style={{ fontSize: '2rem' }}>{form.emoji}</span>
          <div>
            <div
              style={{ fontSize: '0.95rem', fontWeight: 800, color: T.title }}
            >
              {form.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: T.muted }}>
              {t('goals.wizard.previewMeta')}{' '}
              {fmt(form.targetAmount, form.currency, form.currency, rates)}
              {form.deadline &&
                ` ${t('goals.wizard.previewLimit')} ${fmtDateShort(form.deadline, dateFormat)}`}
            </div>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              width: '0.75rem',
              height: '2.5rem',
              borderRadius: '9999px',
              background: form.color,
            }}
          />
        </div>
      )}
    </div>
  );

  // ── Paso 2 ────────────────────────────────────────────────────────────────
  const renderStep2 = () => {
    const availableCategories = categories.filter(
      (c) => c.type === form.autoType
    );
    const isTransfer = form.categoryId === '__transfer__';

    // Proyección mensual (calculada en lib/goalsCalc para que sea testeable).
    const { hasProjection, months: projMonths, monthly: projMonthly } =
      calcGoalDeadlineProjection(
        form.targetAmount,
        form.currentAmount ?? 0,
        form.deadline
      );

    const projectionBlock = hasProjection ? (
      <div
        style={{
          padding: '0.875rem 1rem',
          borderRadius: '0.875rem',
          background: T.accentLight,
          border: `1px solid ${T.accent}33`,
          fontSize: '0.775rem',
          color: T.accent,
          lineHeight: 1.6,
        }}
      >
        <strong>{t('goals.wizard.projectionTitle')}</strong> {t('goals.wizard.projectionToReach')}{' '}
        <strong>
          {fmt(form.targetAmount, form.currency, form.currency, rates)}
        </strong>{' '}
        {t('goals.wizard.projectionIn')}{' '}
        <strong>
          {projMonths} {projMonths !== 1 ? t('goals.wizard.projectionMonths') : t('goals.wizard.projectionMonth')}
        </strong>
        {t('goals.wizard.projectionNeedSave')}{' '}
        <strong>
          {fmt(projMonthly, form.currency, form.currency, rates)}{t('goals.wizard.projectionPerMonth')}
        </strong>
        .
        {!form.deadline &&
          ` ${t('goals.wizard.projectionAddDeadline')}`}
      </div>
    ) : (
      <div
        style={{
          padding: '0.875rem 1rem',
          borderRadius: '0.875rem',
          background: T.pageBg,
          border: `1px solid ${T.cardBorder}`,
          fontSize: '0.775rem',
          color: T.muted,
          lineHeight: 1.6,
        }}
      >
        {t('goals.wizard.projectionEmpty')}
      </div>
    );

    const categoryBlock = isTransfer ? null : (
      <Field label={t('goals.wizard.fieldCategory')} error={errors.categoryId}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <Sel
              T={T}
              value={form.categoryId}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                setForm((f) => ({ ...f, categoryId: e.target.value }));
                setErrors((er) => ({ ...er, categoryId: undefined as any }));
              }}
            >
              <option value="">{t('goals.wizard.categoryPlaceholder')}</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Sel>
          </div>
          <button
            type="button"
            onClick={() => setShowQuickCategory(true)}
            style={{
              padding: '0.65rem 0.75rem',
              borderRadius: '0.75rem',
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
      </Field>
    );

    const quickCatBlock =
      !isTransfer && showQuickCategory ? (
        <QuickCategoryModal
          T={T}
          defaultType={form.autoType as 'income' | 'expense'}
          onSave={(newCat) => {
            setForm((f) => ({ ...f, categoryId: newCat.id }));
            setShowQuickCategory(false);
          }}
          onClose={() => setShowQuickCategory(false)}
        />
      ) : null;

    const noCatsBlock =
      !isTransfer && availableCategories.length === 0 ? (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            background: T.amberBg,
            border: `1px solid ${T.amberBorder}`,
            fontSize: '0.775rem',
            color: T.amber,
            lineHeight: 1.5,
          }}
        >
          {t('goals.wizard.noCategoriesWarning', {
            type: form.autoType === 'income'
              ? t('goals.wizard.typeIncomeLower')
              : t('goals.wizard.typeExpenseLower'),
          })}
        </div>
      ) : null;

    const transferInfoBlock = isTransfer ? (
      <div
        style={{
          padding: '0.875rem 1rem',
          borderRadius: '0.875rem',
          background: T.accentLight,
          border: `1px solid ${T.accent}33`,
          fontSize: '0.775rem',
          color: T.accent,
          lineHeight: 1.5,
        }}
      >
        {t('goals.wizard.transferInfo')}
      </div>
    ) : null;

    const accountBlock = isTransfer ? (
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
      >
        <Field label={t('goals.wizard.fieldFromAccount')}>
          <Sel
            T={T}
            value={form.fromAccountId ?? ''}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setForm((f) => ({ ...f, fromAccountId: e.target.value }))
            }
          >
            <option value="">{t('goals.wizard.anyAccountPlaceholder')}</option>
            {accounts
              .filter((a) => a.id !== form.accountId)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </Sel>
          <div
            style={{
              marginTop: '0.375rem',
              fontSize: '0.68rem',
              color: T.muted,
              lineHeight: 1.5,
            }}
          >
            {t('goals.wizard.fromAccountHint')}
          </div>
        </Field>
        <Field
          label={t('goals.wizard.fieldToAccount')}
          error={errors.accountId}
        >
          <Sel
            T={T}
            value={form.accountId}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              setForm((f) => ({ ...f, accountId: e.target.value }));
              setErrors((er) => ({ ...er, accountId: undefined as any }));
            }}
          >
            <option value="">{t('goals.wizard.accountPlaceholder')}</option>
            {accounts
              .filter((a) => a.id !== (form.fromAccountId ?? ''))
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </Sel>
          <div
            style={{
              marginTop: '0.375rem',
              fontSize: '0.68rem',
              color: T.muted,
              lineHeight: 1.5,
            }}
          >
            {t('goals.wizard.toAccountHint')}
          </div>
        </Field>
      </div>
    ) : (
      <Field label={t('goals.wizard.fieldAccount')} error={errors.accountId}>
        <Sel
          T={T}
          value={form.accountId}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            setForm((f) => ({ ...f, accountId: e.target.value }));
            setErrors((er) => ({ ...er, accountId: undefined as any }));
          }}
        >
          <option value="">— Selecciona una cuenta —</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Sel>
      </Field>
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
          }}
        >
          {(
            [
              ['manual', '✍️', t('goals.wizard.modeManual'), t('goals.wizard.modeManualDesc')],
              ['auto', '⚡', t('goals.wizard.modeAuto'), t('goals.wizard.modeAutoDesc')],
            ] as ['manual' | 'auto', string, string, string][]
          ).map(([val, icon, label, sub]) => (
            <div
              key={val}
              onClick={() => setForm((f) => ({ ...f, mode: val }))}
              style={{
                padding: '1.25rem',
                borderRadius: '1rem',
                cursor: 'pointer',
                border: `2px solid ${
                  form.mode === val ? T.accent : T.cardBorder
                }`,
                background: form.mode === val ? T.accentLight : T.pageBg,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>
                {icon}
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  color: T.title,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: T.muted,
                  marginTop: '0.2rem',
                  lineHeight: 1.5,
                }}
              >
                {sub}
              </div>
              {form.mode === val && (
                <Check
                  size={14}
                  color={T.accent}
                  style={{ marginTop: '0.5rem' }}
                />
              )}
            </div>
          ))}
        </div>

        {form.mode === 'manual' && (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '1rem',
              background: T.pageBg,
              border: `1px solid ${T.cardBorder}`,
            }}
          >
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: T.body,
                marginBottom: '0.75rem',
              }}
            >
              {t('goals.wizard.savedSoFar')}
            </div>
            <Input
              T={T}
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.currentAmount || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm((f) => ({
                  ...f,
                  currentAmount: parseFloat(e.target.value) || 0,
                }))
              }
            />
            <div
              style={{
                fontSize: '0.72rem',
                color: T.muted,
                marginTop: '0.25rem',
              }}
            >
              {t('goals.wizard.savedHint')}
            </div>
          </div>
        )}

        {form.mode === 'auto' && (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '1rem',
              background: T.pageBg,
              border: `1px solid ${T.cardBorder}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: T.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '0.5rem',
                }}
              >
                {t('goals.wizard.movementTypeLabel')}
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.625rem',
                }}
              >
                {[
                  {
                    val: 'income' as const,
                    icon: '📈',
                    label: t('goals.wizard.typeIncome'),
                    color: T.green,
                    bg: T.greenBg,
                    isTr: false,
                  },
                  {
                    val: 'expense' as const,
                    icon: '📉',
                    label: t('goals.wizard.typeExpense'),
                    color: T.red,
                    bg: T.redBg ?? T.amberBg,
                    isTr: false,
                  },
                  {
                    val: 'transfer' as const,
                    icon: '↔',
                    label: t('goals.wizard.typeTransfer'),
                    color: T.accent,
                    bg: T.accentLight,
                    isTr: true,
                  },
                ].map(({ val, icon, label, color, bg, isTr }) => {
                  const isActive = isTr
                    ? form.categoryId === '__transfer__'
                    : form.autoType === val &&
                      form.categoryId !== '__transfer__';
                  return (
                    <div
                      key={val}
                      onClick={() => {
                        if (isTr) {
                          setForm((f) => ({
                            ...f,
                            autoType: 'income',
                            categoryId: '__transfer__',
                          }));
                        } else {
                          setForm((f) => ({
                            ...f,
                            autoType: val as 'income' | 'expense',
                            categoryId: '',
                          }));
                        }
                      }}
                      style={{
                        padding: '0.875rem 0.5rem',
                        borderRadius: '0.875rem',
                        cursor: 'pointer',
                        border: `2px solid ${isActive ? color : T.cardBorder}`,
                        background: isActive ? bg : T.pageBg,
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                        gap: '0.375rem',
                        transition: 'all 0.15s',
                        textAlign: 'center' as const,
                      }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>{icon}</span>
                      <span
                        style={{
                          fontSize: '0.775rem',
                          fontWeight: 700,
                          color: isActive ? color : T.muted,
                        }}
                      >
                        {label}
                      </span>
                      {isActive && <Check size={12} color={color} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {transferInfoBlock}
            {noCatsBlock}
            {categoryBlock}
            {quickCatBlock}
            {accountBlock}
            {projectionBlock}

            <Field label={t('goals.wizard.fieldStartDate')}>
              <Input
                T={T}
                type="date"
                value={form.autoStartDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, autoStartDate: e.target.value }))
                }
              />
              {form.autoStartDate && (
                <p
                  style={{
                    fontSize: '0.7rem',
                    color: T.muted,
                    marginTop: '0.3rem',
                  }}
                >
                  📅 {fmtDateDMY(form.autoStartDate, dateFormat)}
                </p>
              )}
            </Field>

            <div
              style={{
                padding: '0.75rem',
                borderRadius: '0.75rem',
                background: T.accentLight,
                border: `1px solid ${T.accent}33`,
                fontSize: '0.75rem',
                color: T.accent,
                lineHeight: 1.5,
              }}
            >
              {t('goals.wizard.autoHint')}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Paso 3 ────────────────────────────────────────────────────────────────
  const renderStep3 = () => {
    const acc = accounts.find((a) => a.id === form.accountId);
    const cat = categories.find((c) => c.id === form.categoryId);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '1rem',
            background: T.accentLight,
            border: `1.5px solid ${form.color}33`,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <span style={{ fontSize: '2.5rem' }}>{form.emoji}</span>
          <div style={{ flex: 1 }}>
            <div
              style={{ fontSize: '1.1rem', fontWeight: 800, color: T.title }}
            >
              {form.name}
            </div>
            <div
              style={{
                fontSize: '0.8rem',
                color: T.muted,
                marginTop: '0.2rem',
              }}
            >
              {t('goals.wizard.previewMeta')}{' '}
              <strong>
                {fmt(form.targetAmount, form.currency, form.currency, rates)}
              </strong>
              {form.deadline &&
                ` ${t('goals.wizard.previewLimit')} ${fmtDateShort(form.deadline, dateFormat)}`}
            </div>
          </div>
          <div
            style={{
              width: '0.75rem',
              height: '3rem',
              borderRadius: '9999px',
              background: form.color,
              flexShrink: 0,
            }}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
          }}
        >
          {[
            {
              label: t('goals.wizard.summaryMode'),
              value: form.mode === 'manual' ? t('goals.wizard.summaryModeManual') : t('goals.wizard.summaryModeAuto'),
            },
            { label: t('goals.wizard.summaryCurrency'), value: form.currency },
            {
              label: form.mode === 'auto' ? t('goals.wizard.summaryType') : t('goals.wizard.summarySaved'),
              value:
                form.mode === 'auto'
                  ? form.categoryId === '__transfer__'
                  ? t('goals.wizard.summaryTransferType')
                  : cat?.name ?? '—'
                  : fmt(
                      form.currentAmount,
                      form.currency,
                      form.currency,
                      rates
                    ),
            },
            {
              label: t('goals.wizard.summaryAccount'),
              value:
                acc?.name ??
                (form.categoryId === '__transfer__' ? t('goals.wizard.summaryTransferAccount') : '—'),
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: '0.875rem 1rem',
                borderRadius: '0.875rem',
                background: T.pageBg,
                border: `1px solid ${T.cardBorder}`,
              }}
            >
              <div
                style={{
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  color: T.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '0.25rem',
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: T.title,
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            padding: '0.875rem 1rem',
            borderRadius: '0.875rem',
            background: T.greenBg,
            border: `1px solid ${T.greenBorder}`,
            fontSize: '0.775rem',
            color: T.green,
            lineHeight: 1.5,
          }}
        >
          {t('goals.wizard.summaryReady')}
        </div>
      </div>
    );
  };

  return (
    <>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </>
  );
}
