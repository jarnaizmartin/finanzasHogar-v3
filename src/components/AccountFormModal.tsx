// ─────────────────────────────────────────────────────────────────────────────
// AccountFormModal.tsx
// Modal reutilizable para crear/editar una cuenta o tarjeta de crédito.
// Sigue el mismo patrón visual que el resto de modales (createPortal + overlay
// global) para no quedar encajonado en la pantalla que lo invoca.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, type ChangeEvent } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { createPortal } from 'react-dom';
import {
  X,
  Check,
  Wallet,
  PiggyBank,
  CreditCard,
  TrendingUp,
  Home,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../AppContext';
import { Field, Input, Sel, PrimaryBtn, SecondaryBtn } from './UI';
import { InstitutionSelector } from './InstitutionSelector';
import { CURRENCIES, fmtDateDMY } from '../utils';
import type { Account } from '../types';

const today = () => new Date().toISOString().slice(0, 10);

// ─── B5 — Helpers bidireccionales para préstamos ──────────────────────────
// Calcula meses enteros entre dos fechas ISO. Si el día del mes destino es
// menor que el día origen, no se cuenta ese mes (es decir, hay que cumplir
// el mes completo). Ejemplo: 15/01 → 15/03 = 2; 15/01 → 14/03 = 1.
function monthsBetweenISO(fromISO: string, toISO: string): number {
  if (!fromISO || !toISO) return 0;
  const f = new Date(fromISO);
  const t = new Date(toISO);
  if (isNaN(f.getTime()) || isNaN(t.getTime())) return 0;
  let months =
    (t.getFullYear() - f.getFullYear()) * 12 + (t.getMonth() - f.getMonth());
  if (t.getDate() < f.getDate()) months -= 1;
  return Math.max(0, months);
}

// Devuelve la fecha ISO resultante de sumar N meses a una fecha base.
function addMonthsToISO(fromISO: string, months: number): string {
  if (!fromISO || !Number.isFinite(months) || months <= 0) return '';
  const d = new Date(fromISO);
  if (isNaN(d.getTime())) return '';
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

// ─── B5+ — Matemática del préstamo francés (cuota constante) ───────────────
// Calcula la cuota mensual teórica para un capital P, interés anual % y N
// cuotas. Devuelve null si los datos no son válidos.
function calcLoanPayment(
  capital: number,
  annualRatePct: number,
  months: number
): number | null {
  if (capital <= 0 || months <= 0) return null;
  const i = annualRatePct / 100 / 12;
  if (i === 0) return capital / months;
  const factor = Math.pow(1 + i, months);
  return (capital * i * factor) / (factor - 1);
}

// Calcula el número de cuotas teórico necesario para amortizar un capital P
// con una cuota M y un interés anual %. Devuelve null si la cuota no cubre
// ni los intereses (préstamo "infinito").
function calcLoanMonths(
  capital: number,
  annualRatePct: number,
  payment: number
): number | null {
  if (capital <= 0 || payment <= 0) return null;
  const i = annualRatePct / 100 / 12;
  if (i === 0) return capital / payment;
  if (payment <= capital * i) return null; // no amortiza nunca
  return -Math.log(1 - (capital * i) / payment) / Math.log(1 + i);
}

// ── Tipos exportados ────────────────────────────────────────────────────────
export type AccountForm = {
  name: string;
  institution: string;
  balance: string | number;
  date: string;
  minBalance: string | number;
  currency: string;
  accountType: 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan';
  creditLimit: string | number;
  billingDay: string | number;
  paymentDueDay: string | number;
  interestRate: string | number;
  minPaymentPct: string | number;
  // ── Préstamos ──
  loanType: 'mortgage' | 'personal';
  monthlyPayment: string | number;
  paymentsRemaining: string | number;
  interestType: 'fixed' | 'variable';
  paymentDay: string | number;
  paymentAccountId: string;
  // B5 — Campo UI bidireccional (NO se persiste; se deriva de date+paymentsRemaining)
  endDate: string;
};

export type AccountFormEntry = {
  name: string;
  institution?: string;
  balance: number;
  date: string;
  minBalance: number;
  currency: string;
  accountType: AccountForm['accountType'];
  creditLimit?: number;
  billingDay?: number;
  paymentDueDay?: number;
  interestRate?: number;
  minPaymentPct?: number;
  // ── Préstamos ──
  loanType?: 'mortgage' | 'personal';
  monthlyPayment?: number;
  paymentsRemaining?: number;
  interestType?: 'fixed' | 'variable';
  paymentDay?: number;
  paymentAccountId?: string;
};

type Props = {
  mode: 'add' | 'edit';
  account?: Account;
  onSave: (entry: AccountFormEntry) => void;
  onClose: () => void;
};

const ACCOUNT_TYPE_ICONS: Record<AccountForm['accountType'], typeof Wallet> = {
  checking: Wallet,
  savings: PiggyBank,
  credit_card: CreditCard,
  investment: TrendingUp,
  loan: Home,
};

export function AccountFormModal({ mode, account, onSave, onClose }: Props) {
  const { t } = useTranslation();
  const { T, baseCurrency, dateFormat } = useApp();
  const isMobile = useIsMobile();

  const [form, setForm] = useState<AccountForm>(() => {
    if (mode === 'edit' && account) {
      return {
        name: account.name,
        institution: account.institution ?? '',
        balance: account.balance.toFixed(2),
        date: account.date,
        minBalance: (account.minBalance ?? 0).toFixed(2),
        currency: account.currency ?? baseCurrency,
        accountType: account.accountType ?? 'checking',
        creditLimit:
          account.creditLimit != null ? account.creditLimit.toFixed(2) : '',
        billingDay: account.billingDay ?? '',
        paymentDueDay: account.paymentDueDay ?? '',
        interestRate: account.interestRate ?? '',
        minPaymentPct: account.minPaymentPct ?? '5',
        // ── Préstamos ──
        loanType: account.loanType ?? 'mortgage',
        monthlyPayment:
          account.monthlyPayment != null
            ? account.monthlyPayment.toFixed(2)
            : '',
        paymentsRemaining: account.paymentsRemaining ?? '',
        interestType: account.interestType ?? 'fixed',
        paymentDay: account.paymentDay ?? '',
        paymentAccountId: account.paymentAccountId ?? '',
        // B5 — Derivamos fecha fin del préstamo a partir de los datos guardados
        endDate:
          account.paymentsRemaining && account.date
            ? addMonthsToISO(account.date, account.paymentsRemaining)
            : '',
      };
    }
    return {
      name: '',
      institution: '',
      balance: '',
      date: today(),
      minBalance: '',
      currency: baseCurrency,
      accountType: 'checking',
      creditLimit: '',
      billingDay: '',
      paymentDueDay: '',
      interestRate: '',
      minPaymentPct: '5',
      // ── Préstamos (defaults) ──
      loanType: 'mortgage',
      monthlyPayment: '',
      paymentsRemaining: '',
      interestType: 'fixed',
      paymentDay: '',
      paymentAccountId: '',
      endDate: '', // B5
    };
  });

  const isCreditCard = form.accountType === 'credit_card';
  const isLoan = form.accountType === 'loan';

  // Cuentas no-préstamo y no-tarjeta para el selector de "cuenta de cargo"
  const { accounts: allAccounts } = useApp();
  const payerAccounts = allAccounts.filter(
    (a) =>
      a.accountType !== 'credit_card' &&
      a.accountType !== 'loan' &&
      a.id !== account?.id
  );

  const isValid =
    form.name.trim() !== '' &&
    form.balance !== '' &&
    !Number.isNaN(+form.balance) &&
    (!isCreditCard ||
      (form.creditLimit !== '' && !Number.isNaN(+form.creditLimit))) &&
    (!isLoan ||
      (form.monthlyPayment !== '' &&
        !Number.isNaN(+form.monthlyPayment) &&
        form.paymentAccountId !== '' &&
        loanValidation?.severity !== 'error'));

  const handleSubmit = () => {
    if (!isValid) return;

    const entry: AccountFormEntry = {
      name: form.name.trim(),
      institution:
        form.institution.trim() !== '' ? form.institution.trim() : undefined,
      balance: +form.balance,
      date: form.date,
      minBalance:
        isCreditCard || isLoan
          ? 0
          : form.minBalance === ''
          ? 0
          : +(form.minBalance || 0),
      currency: form.currency,
      accountType: form.accountType,
      creditLimit:
        isCreditCard && form.creditLimit !== '' ? +form.creditLimit : undefined,
      billingDay:
        isCreditCard && form.billingDay !== '' ? +form.billingDay : undefined,
      paymentDueDay:
        isCreditCard && form.paymentDueDay !== ''
          ? +form.paymentDueDay
          : undefined,
      // interestRate sirve tanto para tarjetas como para préstamos
      interestRate:
        (isCreditCard || isLoan) && form.interestRate !== ''
          ? +form.interestRate
          : undefined,
      minPaymentPct:
        isCreditCard && form.minPaymentPct !== ''
          ? +form.minPaymentPct
          : undefined,
      // ── Préstamos ──
      loanType: isLoan ? form.loanType : undefined,
      monthlyPayment:
        isLoan && form.monthlyPayment !== '' ? +form.monthlyPayment : undefined,
      paymentsRemaining:
        isLoan && form.paymentsRemaining !== ''
          ? +form.paymentsRemaining
          : undefined,
      interestType: isLoan ? form.interestType : undefined,
      paymentDay:
        isLoan && form.paymentDay !== '' ? +form.paymentDay : undefined,
      paymentAccountId:
        isLoan && form.paymentAccountId !== ''
          ? form.paymentAccountId
          : undefined,
    };

    onSave(entry);
  };

  const update = <K extends keyof AccountForm>(key: K, value: AccountForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // ─── B5 — Handlers bidireccionales para préstamos ───────────────────────
  // El usuario puede editar "Cuotas restantes" o "Fecha fin del préstamo".
  // Cualquiera de los dos recalcula el otro usando "form.date" como ancla
  // (fecha en la que el usuario conoce el capital pendiente).
  const updatePaymentsRemaining = (raw: string) => {
    setForm((f) => {
      if (raw === '') return { ...f, paymentsRemaining: '' };
      const n = parseInt(raw, 10);
      if (!Number.isFinite(n) || n <= 0)
        return { ...f, paymentsRemaining: raw };
      return {
        ...f,
        paymentsRemaining: raw,
        endDate: addMonthsToISO(f.date, n),
      };
    });
  };

  const updateEndDate = (raw: string) => {
    setForm((f) => {
      if (!raw) return { ...f, endDate: '' };
      const months = monthsBetweenISO(f.date, raw);
      if (months <= 0) return { ...f, endDate: raw };
      return { ...f, endDate: raw, paymentsRemaining: String(months) };
    });
  };

  // Cuando cambia la "Fecha del saldo" en un préstamo, recalculamos endDate
  // a partir de las cuotas restantes (consideradas la fuente de verdad).
  const updateDate = (raw: string) => {
    setForm((f) => {
      if (!isLoan || !f.paymentsRemaining) return { ...f, date: raw };
      const n = parseInt(String(f.paymentsRemaining), 10);
      if (!Number.isFinite(n) || n <= 0) return { ...f, date: raw };
      return { ...f, date: raw, endDate: addMonthsToISO(raw, n) };
    });
  };

  // ─── B5+ — Validación matemática del préstamo ──────────────────────────
  // Comprueba la consistencia entre capital pendiente, cuota, interés y
  // número de cuotas. Mostrará distintos niveles de aviso según la
  // diferencia entre los datos del usuario y el cálculo teórico.
  const loanValidation = useMemo(() => {
    if (!isLoan) return null;
    const P = +form.balance;
    const M = +form.monthlyPayment;
    const annualRate = +form.interestRate || 0;
    const n = parseInt(String(form.paymentsRemaining), 10);

    // Necesitamos los 3 datos clave (interés puede ser 0)
    if (!P || !M || !n) return null;
    if (![P, M, n].every(Number.isFinite)) return null;
    if (P <= 0 || M <= 0 || n <= 0) return null;

    const i = annualRate / 100 / 12;
    const monthlyInterest = P * i;

    // Caso 1: la cuota no cubre ni los intereses → préstamo imposible
    if (annualRate > 0 && M <= monthlyInterest) {
      return {
        severity: 'error' as const,
        monthlyInterest,
      };
    }

    const theoreticalPayment = calcLoanPayment(P, annualRate, n);
    const theoreticalMonths = calcLoanMonths(P, annualRate, M);
    if (theoreticalPayment == null || theoreticalMonths == null) return null;

    const diffPct =
      (Math.abs(M - theoreticalPayment) / theoreticalPayment) * 100;

    if (diffPct < 2) {
      return { severity: 'ok' as const, theoreticalPayment, theoreticalMonths };
    }
    if (diffPct < 10) {
      return {
        severity: 'info' as const,
        theoreticalPayment,
        theoreticalMonths,
        diffPct,
      };
    }
    return {
      severity: 'warning' as const,
      theoreticalPayment,
      theoreticalMonths,
      diffPct,
    };
  }, [
    isLoan,
    form.balance,
    form.monthlyPayment,
    form.interestRate,
    form.paymentsRemaining,
  ]);

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
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: T.cardBg,
          border: `1px solid ${T.cardBorder}`,
          borderRadius: '1.5rem',
          boxShadow: T.cardShadowLg,
          width: '100%',
          maxWidth: '34rem',
          maxHeight: 'min(90svh, 90vh)',
          // 🆕 Layout en columna: header fijo, body scroll, footer fijo
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeSlideIn 0.2s ease both',
        }}
      >
        {/* Header (sticky por flex-shrink: 0) */}
        <div
          style={{
            padding: '1rem 1.5rem 0.75rem',
            borderBottom: `1px solid ${T.cardBorder}`,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            flexShrink: 0,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: T.title,
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              {mode === 'add' ? t('accounts.form.titleAdd') : t('accounts.form.titleEdit')}
            </h2>
            <p
              style={{
                fontSize: '0.8rem',
                color: T.muted,
                marginTop: '0.25rem',
              }}
            >
              {t('accounts.form.subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
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

        {/* Body scrollable */}
        <div
          style={{
            padding: '1rem 1.5rem 1.5rem',
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Tipo de cuenta (PRIMER CAMPO — define el contexto del resto del formulario) */}
          <Field label={t('accounts.form.fieldType')}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '0.5rem',
              }}
            >
              {(['checking', 'savings', 'credit_card', 'investment', 'loan'] as const).map((value) => {
                const Icon = ACCOUNT_TYPE_ICONS[value];
                const typeLabels: Record<typeof value, string> = {
                  checking: t('accounts.form.typeChecking'),
                  savings: t('accounts.form.typeSavings'),
                  credit_card: t('accounts.form.typeCreditCard'),
                  investment: t('accounts.form.typeInvestment'),
                  loan: t('accounts.form.typeLoan'),
                };
                const label = typeLabels[value];
                const selected = form.accountType === value;
                return (
                  <div
                    key={value}
                    onClick={() => update('accountType', value)}
                    style={{
                      padding: 'clamp(0.5rem, 2vw, 0.875rem) clamp(0.25rem, 1vw, 0.5rem)',
                      borderRadius: '0.875rem',
                      cursor: 'pointer',
                      border: `2px solid ${selected ? T.accent : T.cardBorder}`,
                      background: selected ? T.accentLight : T.pageBg,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.3rem',
                      transition: 'all 0.15s',
                      minWidth: 0,
                      overflow: 'hidden',
                    }}
                  >
                    <Icon size={16} color={selected ? T.accent : T.muted} />
                    <span
                      style={{
                        fontSize: 'clamp(0.58rem, 2vw, 0.75rem)',
                        fontWeight: 700,
                        color: selected ? T.accent : T.muted,
                        textAlign: 'center',
                        lineHeight: 1.2,
                        wordBreak: 'break-word',
                      }}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Field>

          {/* Entidad financiera (opcional, después del tipo) */}
          <Field label={t('accounts.form.fieldInstitution')}>
            <InstitutionSelector
              T={T}
              value={form.institution}
              onChange={(newValue) => update('institution', newValue)}
            />
            <p
              style={{
                fontSize: '0.68rem',
                color: T.muted,
                marginTop: '0.25rem',
              }}
            >
              {t('accounts.form.hintInstitution')}
            </p>
          </Field>

          {/* Nombre */}
          <Field label={t('accounts.form.fieldName')}>
            <Input
              T={T}
              type="text"
              placeholder={t('accounts.form.placeholderName')}
              value={form.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                update('name', e.target.value)
              }
              autoFocus
            />
          </Field>

          {/* Divisa + Fecha */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '7rem 1fr',
              gap: '0.75rem',
            }}
          >
            <Field label={t('accounts.form.fieldCurrency')}>
              <Sel
                T={T}
                value={form.currency}
                style={{ fontSize: '0.8rem', padding: '0.55rem 0.5rem' }}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  update('currency', e.target.value)
                }
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </Sel>
            </Field>
            <Field
              label={
                isCreditCard
                  ? t('accounts.form.fieldDateCC')
                  : isLoan
                  ? t('accounts.form.fieldDateLoan')
                  : t('accounts.form.fieldDateDefault')
              }
            >
              <Input
                T={T}
                type="date"
                value={form.date}
                style={{ fontSize: '0.8rem', padding: '0.55rem 0.75rem' }}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateDate(e.target.value)
                }
              />
              {form.date && !isMobile && (
                <p
                  style={{
                    fontSize: '0.7rem',
                    color: T.muted,
                    marginTop: '0.3rem',
                  }}
                >
                  📅 {fmtDateDMY(form.date, dateFormat)}
                </p>
              )}
            </Field>
          </div>

          {/* Saldo */}
          <Field
            label={
              isCreditCard
                ? t('accounts.form.fieldBalanceCC')
                : isLoan
                ? t('accounts.form.fieldBalanceLoan')
                : t('accounts.form.fieldBalanceDefault')
            }
          >
            <div style={{ position: 'relative' }}>
              <Input
                T={T}
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.balance}
                style={{ textAlign: 'right', paddingRight: '3rem' }}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  update('balance', e.target.value)
                }
              />
              <span style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', fontWeight: 700, color: T.muted, pointerEvents: 'none' }}>
                {form.currency}
              </span>
            </div>
          </Field>

          {/* Saldo mínimo (solo cuentas normales — no aplica a tarjetas ni préstamos) */}
          {!isCreditCard && !isLoan && (
            <Field label={t('accounts.form.fieldMinBalance')}>
              <div style={{ position: 'relative' }}>
                <Input
                  T={T}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.minBalance}
                  style={{ textAlign: 'right', paddingRight: '3rem' }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    update('minBalance', e.target.value)
                  }
                />
                <span style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', fontWeight: 700, color: T.muted, pointerEvents: 'none' }}>
                  {form.currency}
                </span>
              </div>
            </Field>
          )}

          {/* Campos exclusivos de tarjeta de crédito */}
          {isCreditCard && (
            <>
              <Field label={t('accounts.form.fieldCreditLimit')}>
                <div style={{ position: 'relative' }}>
                  <Input
                    T={T}
                    type="number"
                    step="0.01"
                    placeholder={t('accounts.form.placeholderCreditLimit')}
                    value={form.creditLimit}
                    style={{ textAlign: 'right', paddingRight: '3rem' }}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      update('creditLimit', e.target.value)
                    }
                  />
                  <span style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', fontWeight: 700, color: T.muted, pointerEvents: 'none' }}>
                    {form.currency}
                  </span>
                </div>
              </Field>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                }}
              >
                <Field label={t('accounts.form.fieldBillingDay')}>
                  <Input
                    T={T}
                    type="number"
                    min="1"
                    max="31"
                    placeholder={t('accounts.form.placeholderBillingDay')}
                    value={form.billingDay}
                    style={{ textAlign: 'right' }}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      update('billingDay', e.target.value)
                    }
                  />
                </Field>
                <Field label={t('accounts.form.fieldPaymentDueDay')}>
                  <Input
                    T={T}
                    type="number"
                    min="1"
                    max="31"
                    placeholder={t('accounts.form.placeholderPaymentDueDay')}
                    value={form.paymentDueDay}
                    style={{ textAlign: 'right' }}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      update('paymentDueDay', e.target.value)
                    }
                  />
                </Field>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                }}
              >
                <Field label={t('accounts.form.fieldTAE')}>
                  <Input
                    T={T}
                    type="number"
                    step="0.1"
                    placeholder={t('accounts.form.placeholderTAE')}
                    value={form.interestRate}
                    style={{ textAlign: 'right' }}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      update('interestRate', e.target.value)
                    }
                  />
                </Field>
                <Field label={t('accounts.form.fieldMinPaymentPct')}>
                  <Input
                    T={T}
                    type="number"
                    step="0.1"
                    placeholder={t('accounts.form.placeholderMinPaymentPct')}
                    value={form.minPaymentPct}
                    style={{ textAlign: 'right' }}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      update('minPaymentPct', e.target.value)
                    }
                  />
                </Field>
              </div>
            </>
          )}

          {/* ── Campos exclusivos de préstamos/hipotecas ── */}
          {isLoan && (
            <>
              {/* Banner explicativo */}
              <div
                style={{
                  padding: '0.75rem 0.875rem',
                  borderRadius: '0.75rem',
                  background: T.accentLight,
                  border: `1px solid ${T.accent}33`,
                  fontSize: '0.75rem',
                  color: T.accent,
                  lineHeight: 1.5,
                  marginBottom: '1rem',
                }}
              >
                {t('accounts.form.loanBannerBefore')}<strong>{t('accounts.form.loanBannerBold')}</strong>{t('accounts.form.loanBannerAfter')}
              </div>

              {/* Tipo de préstamo */}
              <Field label={t('accounts.form.fieldLoanType')}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                  }}
                >
                  {(
                    [
                      ['mortgage', '🏠', t('accounts.form.loanTypeMortgage')],
                      ['personal', '💰', t('accounts.form.loanTypePersonal')],
                    ] as const
                  ).map(([val, icon, label]) => {
                    const selected = form.loanType === val;
                    return (
                      <div
                        key={val}
                        onClick={() => update('loanType', val)}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '0.75rem',
                          cursor: 'pointer',
                          border: `2px solid ${
                            selected ? T.accent : T.cardBorder
                          }`,
                          background: selected ? T.accentLight : T.pageBg,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ fontSize: '1.25rem' }}>{icon}</span>
                        <span
                          style={{
                            fontSize: '0.825rem',
                            fontWeight: 700,
                            color: selected ? T.accent : T.muted,
                          }}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Field>

              {/* Cuota mensual (obligatorio) */}
              <Field label={t('accounts.form.fieldMonthlyPayment')}>
                <div style={{ position: 'relative' }}>
                  <Input
                    T={T}
                    type="number"
                    step="0.01"
                    placeholder={t('accounts.form.placeholderMonthlyPayment')}
                    value={form.monthlyPayment}
                    style={{ textAlign: 'right', paddingRight: '3rem' }}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      update('monthlyPayment', e.target.value)
                    }
                  />
                  <span style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', fontWeight: 700, color: T.muted, pointerEvents: 'none' }}>
                    {form.currency}
                  </span>
                </div>
              </Field>

              {/* B5 — Cuotas restantes ↔ Fecha fin (bidireccional) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                }}
              >
                <Field label={t('accounts.form.fieldPaymentsRemaining')}>
                  <Input
                    T={T}
                    type="number"
                    min="1"
                    placeholder={t('accounts.form.placeholderPaymentsRemaining')}
                    value={form.paymentsRemaining}
                    style={{ textAlign: 'right' }}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updatePaymentsRemaining(e.target.value)
                    }
                  />
                </Field>
                <Field label={t('accounts.form.fieldEndDate')}>
                  <Input
                    T={T}
                    type="date"
                    value={form.endDate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateEndDate(e.target.value)
                    }
                  />
                  {/* B5 — Hint con el formato configurado por el usuario,
                     igual que en "Fecha del saldo". El input nativo siempre
                     usa el formato del navegador, así que mostramos abajo
                     cómo se interpreta en el formato elegido. */}
                  {form.endDate && !isMobile && (
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
              </div>

              {/* Hint bidireccional */}
              <p
                style={{
                  fontSize: '0.7rem',
                  color: T.muted,
                  margin: '-0.4rem 0 0.875rem',
                  lineHeight: 1.4,
                }}
              >
                {t('accounts.form.hintBidirectional')}
                {form.endDate && form.paymentsRemaining && (
                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.25rem',
                      color: T.accent,
                      fontWeight: 600,
                    }}
                  >
                    {t('accounts.form.bidirectionalSummary', {
                      payments: form.paymentsRemaining,
                      endDate: fmtDateDMY(form.endDate, dateFormat),
                    })}
                  </span>
                )}
              </p>

              {/* Día de cargo (separado en su propia fila) */}
              <Field label={t('accounts.form.fieldPaymentDay')}>
                <Input
                  T={T}
                  type="number"
                  min="1"
                  max="31"
                  placeholder={t('accounts.form.placeholderPaymentDay')}
                  value={form.paymentDay}
                  style={{ textAlign: 'right' }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    update('paymentDay', e.target.value)
                  }
                />
              </Field>

              {/* Tipo de interés + % aplicable */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                }}
              >
                <Field label={t('accounts.form.fieldInterestType')}>
                  <Sel
                    T={T}
                    value={form.interestType}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      update(
                        'interestType',
                        e.target.value as 'fixed' | 'variable'
                      )
                    }
                  >
                    <option value="fixed">{t('accounts.form.interestFixed')}</option>
                    <option value="variable">{t('accounts.form.interestVariable')}</option>
                  </Sel>
                </Field>
                <Field label={t('accounts.form.fieldInterestRate')}>
                  <Input
                    T={T}
                    type="number"
                    step="0.01"
                    placeholder={t('accounts.form.placeholderInterestRate')}
                    value={form.interestRate}
                    style={{ textAlign: 'right' }}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      update('interestRate', e.target.value)
                    }
                  />
                </Field>
              </div>

              {/* B5+ — Panel de validación matemática del préstamo */}
              {loanValidation && (
                <div
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: '0.875rem',
                    marginBottom: '1rem',
                    border: `1.5px solid ${
                      loanValidation.severity === 'error'
                        ? T.red
                        : loanValidation.severity === 'warning'
                        ? T.amber
                        : loanValidation.severity === 'info'
                        ? T.accent
                        : T.green
                    }44`,
                    background:
                      loanValidation.severity === 'error'
                        ? T.redBg
                        : loanValidation.severity === 'warning'
                        ? T.amberBg
                        : loanValidation.severity === 'info'
                        ? T.accentLight
                        : `${T.green}11`,
                  }}
                >
                  {loanValidation.severity === 'error' && (
                    <>
                      <div
                        style={{
                          fontSize: '0.825rem',
                          fontWeight: 800,
                          color: T.red,
                          marginBottom: '0.4rem',
                        }}
                      >
                        {t('accounts.form.loanValidErrorTitle')}
                      </div>
                      <p
                        style={{
                          fontSize: '0.775rem',
                          color: T.red,
                          lineHeight: 1.5,
                          margin: 0,
                        }}
                      >
                        {t('accounts.form.loanValidErrorMsg', {
                          payment: (+form.monthlyPayment).toFixed(2),
                          interest: loanValidation.monthlyInterest.toFixed(2),
                        })}
                      </p>
                    </>
                  )}

                  {loanValidation.severity === 'warning' && (
                    <>
                      <div
                        style={{
                          fontSize: '0.825rem',
                          fontWeight: 800,
                          color: T.amber,
                          marginBottom: '0.4rem',
                        }}
                      >
                        {t('accounts.form.loanValidWarnTitle')}
                      </div>
                      <p
                        style={{
                          fontSize: '0.775rem',
                          color: T.amber,
                          lineHeight: 1.5,
                          margin: '0 0 0.625rem',
                        }}
                      >
                        {t('accounts.form.loanValidWarnMsgBefore')}{' '}
                        <strong>
                          {loanValidation.theoreticalPayment.toFixed(2)}
                        </strong>{' '}
                        {t('accounts.form.loanValidWarnMsgMiddle')}{' '}
                        <strong>
                          {Math.round(loanValidation.theoreticalMonths)}
                        </strong>{' '}
                        {t('accounts.form.loanValidWarnMsgAfter')}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            update(
                              'monthlyPayment',
                              loanValidation.theoreticalPayment.toFixed(2)
                            )
                          }
                          style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${T.amber}66`,
                            background: 'transparent',
                            color: T.amber,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {t('accounts.form.loanApplyPayment', { amount: loanValidation.theoreticalPayment.toFixed(2) })}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updatePaymentsRemaining(
                              String(
                                Math.round(loanValidation.theoreticalMonths)
                              )
                            )
                          }
                          style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${T.amber}66`,
                            background: 'transparent',
                            color: T.amber,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {t('accounts.form.loanApplyMonths', { n: Math.round(loanValidation.theoreticalMonths) })}
                        </button>
                      </div>
                    </>
                  )}

                  {loanValidation.severity === 'info' && (
                    <p
                      style={{
                        fontSize: '0.775rem',
                        color: T.accent,
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {t('accounts.form.loanValidInfoBefore')}{' '}
                      <strong>
                        {loanValidation.theoreticalPayment.toFixed(2)}
                      </strong>
                      {t('accounts.form.loanValidInfoAfter')}
                    </p>
                  )}

                  {loanValidation.severity === 'ok' && (
                    <p
                      style={{
                        fontSize: '0.775rem',
                        color: T.green,
                        lineHeight: 1.5,
                        margin: 0,
                        fontWeight: 600,
                      }}
                    >
                      {t('accounts.form.loanValidOk')}
                    </p>
                  )}
                </div>
              )}

              {/* Cuenta de cargo (obligatorio) */}
              <Field label={t('accounts.form.fieldPaymentAccount')}>
                <Sel
                  T={T}
                  value={form.paymentAccountId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    update('paymentAccountId', e.target.value)
                  }
                >
                  <option value="">{t('accounts.form.paymentAccountPlaceholder')}</option>
                  {payerAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      🏦 {a.name} ({a.currency ?? baseCurrency})
                    </option>
                  ))}
                </Sel>
                {payerAccounts.length === 0 && (
                  <p
                    style={{
                      fontSize: '0.7rem',
                      color: T.amber,
                      marginTop: '0.35rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {t('accounts.form.noPayerAccountsWarning')}
                  </p>
                )}
              </Field>
            </>
          )}
        </div>

        {/* Footer fijo con acciones (siempre visible) */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: `1px solid ${T.cardBorder}`,
            background: T.cardBg,
            display: 'flex',
            gap: '0.75rem',
            flexShrink: 0,
          }}
        >
          <PrimaryBtn onClick={handleSubmit} fullWidth disabled={!isValid}>
            <Check size={15} />
            {mode === 'add' ? t('common.createAccount') : t('common.saveChanges')}
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
