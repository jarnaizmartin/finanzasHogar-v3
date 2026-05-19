// ─────────────────────────────────────────────────────────────────────────────
// AccountFormModal.tsx
// Modal reutilizable para crear/editar una cuenta o tarjeta de crédito.
// Sigue el mismo patrón visual que el resto de modales (createPortal + overlay
// global) para no quedar encajonado en la pantalla que lo invoca.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, type ChangeEvent } from 'react';
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

const ACCOUNT_TYPES: Array<{
  value: AccountForm['accountType'];
  label: string;
  icon: typeof Wallet;
}> = [
  { value: 'checking', label: 'Corriente', icon: Wallet },
  { value: 'savings', label: 'Ahorro', icon: PiggyBank },
  { value: 'credit_card', label: 'Tarjeta', icon: CreditCard },
  { value: 'investment', label: 'Inversión', icon: TrendingUp },
  { value: 'loan', label: 'Préstamo', icon: Home },
];

export function AccountFormModal({ mode, account, onSave, onClose }: Props) {
  const { T, baseCurrency, dateFormat } = useApp();

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
        form.paymentAccountId !== ''));

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
        padding: '1rem',
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
          maxHeight: '90vh',
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
              {mode === 'add' ? 'Nueva cuenta' : 'Editar cuenta'}
            </h2>
            <p
              style={{
                fontSize: '0.8rem',
                color: T.muted,
                marginTop: '0.25rem',
              }}
            >
              Introduce los datos de tu cuenta
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
          <Field label="Tipo de cuenta">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '0.5rem',
              }}
            >
              {ACCOUNT_TYPES.map(({ value, label, icon: Icon }) => {
                const selected = form.accountType === value;
                return (
                  <div
                    key={value}
                    onClick={() => update('accountType', value)}
                    style={{
                      padding: '0.875rem 0.5rem',
                      borderRadius: '0.875rem',
                      cursor: 'pointer',
                      border: `2px solid ${selected ? T.accent : T.cardBorder}`,
                      background: selected ? T.accentLight : T.pageBg,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Icon size={18} color={selected ? T.accent : T.muted} />
                    <span
                      style={{
                        fontSize: '0.75rem',
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

          {/* Entidad financiera (opcional, después del tipo) */}
          <Field label="Entidad financiera (opcional)">
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
              💡 Te ayuda a identificar visualmente tus cuentas
            </p>
          </Field>

          {/* Nombre */}
          <Field label="Nombre de la cuenta">
            <Input
              T={T}
              type="text"
              placeholder="Ej: Cuenta nómina"
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
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}
          >
            <Field label="Divisa">
              <Sel
                T={T}
                value={form.currency}
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
                  ? 'Fecha del saldo'
                  : isLoan
                  ? 'Capital pendiente a fecha de'
                  : 'Saldo a fecha de'
              }
            >
              <Input
                T={T}
                type="date"
                value={form.date}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateDate(e.target.value)
                }
              />
              {form.date && (
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
                ? 'Deuda actual (0 si no debes nada)'
                : isLoan
                ? 'Capital pendiente HOY'
                : 'Saldo actual'
            }
          >
            <Input
              T={T}
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.balance}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                update('balance', e.target.value)
              }
            />
          </Field>

          {/* Saldo mínimo (solo cuentas normales — no aplica a tarjetas ni préstamos) */}
          {!isCreditCard && !isLoan && (
            <Field label="Saldo mínimo de aviso (opcional)">
              <Input
                T={T}
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.minBalance}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  update('minBalance', e.target.value)
                }
              />
            </Field>
          )}

          {/* Campos exclusivos de tarjeta de crédito */}
          {isCreditCard && (
            <>
              <Field label="Límite de crédito">
                <Input
                  T={T}
                  type="number"
                  step="0.01"
                  placeholder="Ej: 3000"
                  value={form.creditLimit}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    update('creditLimit', e.target.value)
                  }
                />
              </Field>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                }}
              >
                <Field label="Día de corte (1-31)">
                  <Input
                    T={T}
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Ej: 25"
                    value={form.billingDay}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      update('billingDay', e.target.value)
                    }
                  />
                </Field>
                <Field label="Día de pago (1-31)">
                  <Input
                    T={T}
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Ej: 5"
                    value={form.paymentDueDay}
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
                <Field label="TAE % (opcional)">
                  <Input
                    T={T}
                    type="number"
                    step="0.1"
                    placeholder="Ej: 24.9"
                    value={form.interestRate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      update('interestRate', e.target.value)
                    }
                  />
                </Field>
                <Field label="Pago mínimo % (opcional)">
                  <Input
                    T={T}
                    type="number"
                    step="0.1"
                    placeholder="Ej: 5"
                    value={form.minPaymentPct}
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
                💡 <strong>Introduce los datos que conoces HOY</strong> (los ves
                en tu última cuota o en la app del banco). No necesitas recordar
                el capital inicial ni la fecha de firma.
              </div>

              {/* Tipo de préstamo */}
              <Field label="Tipo de préstamo">
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                  }}
                >
                  {(
                    [
                      ['mortgage', '🏠', 'Hipoteca'],
                      ['personal', '💰', 'Préstamo personal'],
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
              <Field label="Cuota mensual *">
                <Input
                  T={T}
                  type="number"
                  step="0.01"
                  placeholder="Ej: 750.00"
                  value={form.monthlyPayment}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    update('monthlyPayment', e.target.value)
                  }
                />
              </Field>

              {/* B5 — Cuotas restantes ↔ Fecha fin (bidireccional) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                }}
              >
                <Field label="Cuotas restantes">
                  <Input
                    T={T}
                    type="number"
                    min="1"
                    placeholder="Ej: 240"
                    value={form.paymentsRemaining}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updatePaymentsRemaining(e.target.value)
                    }
                  />
                </Field>
                <Field label="Fecha fin del préstamo">
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
                🔄 Edita el campo que mejor conozcas: el otro se calcula
                automáticamente a partir de la fecha del capital pendiente.
                {form.endDate && form.paymentsRemaining && (
                  <span
                    style={{
                      display: 'block',
                      marginTop: '0.25rem',
                      color: T.accent,
                      fontWeight: 600,
                    }}
                  >
                    ✓ {form.paymentsRemaining} cuotas →{' '}
                    {fmtDateDMY(form.endDate, dateFormat)}
                  </span>
                )}
              </p>

              {/* Día de cargo (separado en su propia fila) */}
              <Field label="Día de cargo (1-31)">
                <Input
                  T={T}
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ej: 1"
                  value={form.paymentDay}
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
                <Field label="Tipo de interés">
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
                    <option value="fixed">Fijo</option>
                    <option value="variable">Variable</option>
                  </Sel>
                </Field>
                <Field label="% aplicable actual">
                  <Input
                    T={T}
                    type="number"
                    step="0.01"
                    placeholder="Ej: 2.50"
                    value={form.interestRate}
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
                        🚫 Cuota insuficiente
                      </div>
                      <p
                        style={{
                          fontSize: '0.775rem',
                          color: T.red,
                          lineHeight: 1.5,
                          margin: 0,
                        }}
                      >
                        La cuota ({(+form.monthlyPayment).toFixed(2)}) no cubre
                        ni los intereses mensuales (
                        {loanValidation.monthlyInterest.toFixed(2)}). El
                        préstamo <strong>nunca se amortizaría</strong>. Revisa
                        el capital pendiente, el tipo de interés o la cuota.
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
                        ⚠️ Los datos no encajan matemáticamente
                      </div>
                      <p
                        style={{
                          fontSize: '0.775rem',
                          color: T.amber,
                          lineHeight: 1.5,
                          margin: '0 0 0.625rem',
                        }}
                      >
                        Con estos datos, la cuota teórica debería ser{' '}
                        <strong>
                          {loanValidation.theoreticalPayment.toFixed(2)}
                        </strong>{' '}
                        o necesitarías{' '}
                        <strong>
                          {Math.round(loanValidation.theoreticalMonths)}
                        </strong>{' '}
                        cuotas. Revisa los valores que has introducido.
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
                          Aplicar cuota{' '}
                          {loanValidation.theoreticalPayment.toFixed(2)}
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
                          Aplicar {Math.round(loanValidation.theoreticalMonths)}{' '}
                          cuotas
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
                      💡 Pequeña diferencia con el cálculo teórico (cuota ideal:{' '}
                      <strong>
                        {loanValidation.theoreticalPayment.toFixed(2)}
                      </strong>
                      ). Es normal por redondeos, seguros vinculados o
                      comisiones del banco.
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
                      ✓ Los datos del préstamo son matemáticamente consistentes.
                    </p>
                  )}
                </div>
              )}

              {/* Cuenta de cargo (obligatorio) */}
              <Field label="Cuenta desde la que se paga la cuota *">
                <Sel
                  T={T}
                  value={form.paymentAccountId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    update('paymentAccountId', e.target.value)
                  }
                >
                  <option value="">— Selecciona una cuenta —</option>
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
                    ⚠️ Necesitas tener al menos una cuenta corriente o de ahorro
                    para poder asociar un préstamo.
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
            {mode === 'add' ? 'Crear cuenta' : 'Guardar cambios'}
          </PrimaryBtn>
          <SecondaryBtn onClick={onClose} T={T}>
            Cancelar
          </SecondaryBtn>
        </div>
      </div>
    </div>,
    document.body
  );
}
