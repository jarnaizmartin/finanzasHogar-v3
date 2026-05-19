import { useState, useMemo, useEffect, useDeferredValue } from 'react';
import { createPortal } from 'react-dom';
import { X, TrendingDown, Clock, Info, AlertCircle } from 'lucide-react';
import { useApp } from '../AppContext';
import {
  simulateAmortization,
  generateAmortizationSchedule,
  downsampleSchedule,
  type AmortizationMode,
} from '../lib/loanUtils';
import type { Account } from '../types';

interface Props {
  loan: Account;
  onConfirm: (data: {
    amount: number;
    fee: number;
    mode: AmortizationMode;
    fromAccountId: string;
  }) => void;
  onClose: () => void;
}

/**
 * Modal de amortización parcial de préstamos (Fase 2.1).
 *
 * Permite al usuario simular y aplicar una amortización parcial sobre el
 * capital pendiente de un préstamo, eligiendo entre:
 *   - Reducir cuota: mismo plazo, paga menos cada mes
 *   - Reducir plazo: misma cuota, termina antes (matemáticamente óptimo)
 *
 * Muestra preview comparativo en tiempo real + mini-gráfica SVG.
 */
export function AmortizationFormModal({ loan, onConfirm, onClose }: Props) {
  const { T, accounts, fmtAccount, baseCurrency, realBalanceMap } = useApp();

  const currency = loan.currency ?? baseCurrency;
  const currentDebt = realBalanceMap[loan.id]?.loanDebt ?? loan.balance;
  const currentPayment = loan.monthlyPayment ?? 0;
  const currentTerm = loan.paymentsRemaining ?? 0;
  const annualRate = loan.interestRate ?? 0;
  const defaultFeePct = loan.amortizationFeePct ?? 0;

  // Cuentas origen válidas (no la propia cuenta del préstamo, no otros préstamos/tarjetas)
  const validFromAccounts = useMemo(
    () => accounts.filter(
      (a) => a.id !== loan.id && a.accountType !== 'credit_card' && a.accountType !== 'loan'
    ),
    [accounts, loan.id]
  );

  // ── Estado del formulario ───────────────────────────────────────────────
  const [amount, setAmount] = useState<string>('');
  const [feePct, setFeePct] = useState<string>(defaultFeePct.toString());
  const [mode, setMode] = useState<AmortizationMode>('reduce_term');
  const [fromAccountId, setFromAccountId] = useState<string>(
    loan.paymentAccountId && validFromAccounts.some(a => a.id === loan.paymentAccountId)
      ? loan.paymentAccountId
      : (validFromAccounts[0]?.id ?? '')
  );

  // 🐢 PERF — Valores "debounced" que disparan los cálculos pesados.
  // Tecleamos en `amount`/`feePct` (rápido, controlado), pero la simulación y
  // sobre todo `generateAmortizationSchedule()` (que genera 1 fila por mes y
  // puede ser muy pesado en préstamos grandes) solo se recalculan 250ms
  // después de la última tecla. Sin esto, con préstamos de 6 dígitos, cada
  // pulsación congela la UI durante varios segundos.
  const [debouncedAmount, setDebouncedAmount] = useState<string>('');
  const [debouncedFeePct, setDebouncedFeePct] = useState<string>(defaultFeePct.toString());

  useEffect(() => {
    const t = setTimeout(() => setDebouncedAmount(amount), 250);
    return () => clearTimeout(t);
  }, [amount]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedFeePct(feePct), 250);
    return () => clearTimeout(t);
  }, [feePct]);

  // ── Simulación en tiempo real (con valores debounced) ───────────────────
  const numAmount = parseFloat(debouncedAmount.replace(',', '.')) || 0;
  const numFeePct = parseFloat(debouncedFeePct.replace(',', '.')) || 0;

  // Valor "vivo" del importe (sin debounce) — solo para el aviso instantáneo
  // de "supera el capital pendiente" mientras el usuario sigue tecleando.
  const liveAmount = parseFloat(amount.replace(',', '.')) || 0;

  const sim = useMemo(
    () => simulateAmortization({
      currentPrincipal: currentDebt,
      annualRatePct: annualRate,
      currentPayment,
      currentTerm,
      amortizationAmount: numAmount,
      mode,
      feePct: numFeePct,
    }),
    [currentDebt, annualRate, currentPayment, currentTerm, numAmount, mode, numFeePct]
  );

  // ── Calendarios para gráfica comparativa ────────────────────────────────
  // ✅ loanUtils.ts está blindado con MAX_LOAN_MONTHS y protección contra
  // bucles infinitos, así que esto ya es seguro incluso con préstamos
  // grandes o cuotas ajustadas.
  //
  // useDeferredValue: React 18 prioriza la respuesta del input sobre el
  // recálculo de estos arrays. Si el usuario teclea rápido, la gráfica se
  // actualiza con un pequeño delay automático y "stale", pero el input
  // sigue fluido en todo momento.
  const deferredSim = useDeferredValue(sim);
  const deferredAmount = useDeferredValue(numAmount);

  const scheduleBefore = useMemo(
    () => generateAmortizationSchedule(currentDebt, annualRate, currentTerm),
    [currentDebt, annualRate, currentTerm]
  );
  const scheduleAfter = useMemo(
    () =>
      deferredSim.isValid && deferredAmount > 0
        ? generateAmortizationSchedule(
            deferredSim.newPrincipal,
            annualRate,
            deferredSim.newTerm
          )
        : [],
    [deferredSim, deferredAmount, annualRate]
  );

  // Downsampling: limitamos a 120 puntos por serie para que el SVG
  // siempre se dibuje rápido aunque el préstamo tenga 30+ años.
  const chartBefore = useMemo(
    () => downsampleSchedule(scheduleBefore, 120),
    [scheduleBefore]
  );
  const chartAfter = useMemo(
    () => downsampleSchedule(scheduleAfter, 120),
    [scheduleAfter]
  );

  // ── Validaciones para habilitar botón ───────────────────────────────────
  const fromAcc = validFromAccounts.find(a => a.id === fromAccountId);
  const fromBalance = fromAcc ? (realBalanceMap[fromAcc.id]?.realBalance ?? fromAcc.balance) : 0;
  const insufficientFunds = fromAcc && sim.totalCashOut > fromBalance;

  const canSubmit =
    numAmount > 0 &&
    numAmount <= currentDebt &&
    fromAccountId !== '' &&
    !insufficientFunds &&
    sim.isValid;

  // Cierre con ESC
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [onClose]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onConfirm({
      amount: numAmount,
      fee: sim.feeAmount,
      mode,
      fromAccountId,
    });
  };

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)',
        backdropFilter: 'blur(4px)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        // 🛡️ Sin click-outside: el usuario puede haber ajustado importe y
        // modalidad durante varios minutos. Solo se cierra con X o Cancelar.
        // ✅ overflowY: 'auto' como red de seguridad si el modal supera la altura.
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: T.cardBg, borderRadius: '1.25rem', maxWidth: '40rem', width: '100%',
          // ✅ maxHeight (no height) — el modal se adapta al contenido pero nunca
          // supera 92vh. Mismo patrón que AccountFormModal que sí funciona bien.
          maxHeight: '92vh',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
          border: `1px solid ${T.cardBorder}`,
          // Layout flex: header fijo, body scroll, footer fijo
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ── Header fijo ─────────────────────────────────────────────── */}
        <div
          style={{
            flexShrink: 0,
            background: 'linear-gradient(135deg, #14532d 0%, #166534 60%, #14532d 100%)',
            padding: '1.25rem 1.5rem', borderRadius: '1.25rem 1.25rem 0 0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
              💸 Amortización parcial
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9' }}>
              {loan.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#86efac', marginTop: '0.15rem' }}>
              Capital pendiente: <strong>{fmtAccount(currentDebt, currency)}</strong>
              {annualRate > 0 && ` · TIN ${annualRate}%`}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ padding: '0.4rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body scrollable ─────────────────────────────────────────── */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* ── Importe ────────────────────────────────────────────── */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
              Importe a amortizar
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                autoFocus
                style={{
                  width: '100%', padding: '0.85rem 1rem', paddingRight: '3rem',
                  fontSize: '1.25rem', fontWeight: 800, color: T.title,
                  borderRadius: '0.75rem', border: `1.5px solid ${T.cardBorder}`,
                  background: T.pageBg, outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', fontWeight: 700, color: T.muted }}>
                {currency}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {[1000, 5000, 10000, currentDebt].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setAmount(preset.toFixed(2).replace('.', ','))}
                  disabled={preset > currentDebt && idx !== 3}
                  style={{
                    padding: '0.3rem 0.65rem', borderRadius: '0.5rem',
                    border: `1px solid ${T.cardBorder}`, background: T.pageBg,
                    color: T.muted, fontSize: '0.7rem', fontWeight: 700,
                    cursor: preset > currentDebt && idx !== 3 ? 'not-allowed' : 'pointer',
                    opacity: preset > currentDebt && idx !== 3 ? 0.4 : 1,
                  }}
                >
                  {idx === 3 ? `Liquidar todo (${fmtAccount(currentDebt, currency)})` : fmtAccount(preset, currency)}
                </button>
              ))}
            </div>
            {liveAmount > currentDebt && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: T.red, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertCircle size={12} /> El importe supera el capital pendiente
              </div>
            )}
            {/* 🛡️ Aviso si la simulación es matemáticamente imposible
               (típico: cuota actual < intereses del nuevo capital en modo "reducir plazo") */}
            {numAmount > 0 && !sim.isValid && sim.errorMsg && (
              <div
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem 0.7rem',
                  borderRadius: '0.5rem',
                  background: T.amberBg,
                  border: `1px solid ${T.amberBorder}`,
                  fontSize: '0.72rem',
                  color: T.amber,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.4rem',
                  lineHeight: 1.4,
                }}
              >
                <AlertCircle size={12} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                <span>{sim.errorMsg}</span>
              </div>
            )}
          </div>

          {/* ── Cuenta origen ──────────────────────────────────────── */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
              Pagar desde
            </label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              style={{
                width: '100%', padding: '0.7rem 1rem', fontSize: '0.9rem', fontWeight: 600,
                color: T.title, borderRadius: '0.75rem', border: `1.5px solid ${T.cardBorder}`,
                background: T.pageBg, outline: 'none', cursor: 'pointer',
              }}
            >
              {validFromAccounts.length === 0 && <option value="">Sin cuentas disponibles</option>}
              {validFromAccounts.map((a) => {
                const bal = realBalanceMap[a.id]?.realBalance ?? a.balance;
                return (
                  <option key={a.id} value={a.id}>
                    {a.name} — {fmtAccount(bal, a.currency ?? baseCurrency)}
                  </option>
                );
              })}
            </select>
            {insufficientFunds && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: T.amber, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertCircle size={12} /> Saldo insuficiente en la cuenta origen ({fmtAccount(fromBalance, currency)} disponibles)
              </div>
            )}
          </div>

          {/* ── Comisión ───────────────────────────────────────────── */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
              Comisión (%)
              <span title="Algunos bancos cobran una comisión sobre el importe amortizado. Típico: 0,25%-0,5% en hipotecas. Déjalo en 0 si tu préstamo no la tiene." style={{ cursor: 'help', display: 'flex' }}>
                <Info size={11} />
              </span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={feePct}
              onChange={(e) => setFeePct(e.target.value)}
              placeholder="0"
              style={{
                width: '100%', padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 600,
                color: T.title, borderRadius: '0.75rem', border: `1.5px solid ${T.cardBorder}`,
                background: T.pageBg, outline: 'none',
              }}
            />
            {sim.feeAmount > 0 && (
              <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: T.muted }}>
                Comisión a pagar: <strong style={{ color: T.amber }}>{fmtAccount(sim.feeAmount, currency)}</strong>
                {' · '}Total a desembolsar: <strong style={{ color: T.title }}>{fmtAccount(sim.totalCashOut, currency)}</strong>
              </div>
            )}
          </div>

          {/* ── Modalidad ──────────────────────────────────────────── */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
              ¿Qué prefieres?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {([
                { val: 'reduce_term' as const, icon: <Clock size={18} />, label: 'Reducir plazo', desc: 'Misma cuota, terminas antes', tag: 'Óptimo' },
                { val: 'reduce_payment' as const, icon: <TrendingDown size={18} />, label: 'Reducir cuota', desc: 'Mismo plazo, pagas menos al mes', tag: null },
              ]).map((opt) => {
                const selected = mode === opt.val;
                return (
                  <button
                    key={opt.val}
                    onClick={() => setMode(opt.val)}
                    style={{
                      position: 'relative', padding: '1rem 0.85rem', borderRadius: '0.875rem',
                      border: `2px solid ${selected ? T.green : T.cardBorder}`,
                      background: selected ? T.greenBg : T.pageBg,
                      color: selected ? T.green : T.title, cursor: 'pointer',
                      textAlign: 'left', transition: 'all 0.15s',
                    }}
                  >
                    {opt.tag && (
                      <span style={{
                        position: 'absolute', top: '0.4rem', right: '0.4rem',
                        fontSize: '0.55rem', fontWeight: 800, padding: '0.1rem 0.4rem',
                        borderRadius: '9999px', background: T.green, color: '#fff',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        ⭐ {opt.tag}
                      </span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      {opt.icon}
                      <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{opt.label}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: selected ? T.green : T.muted, opacity: 0.85, lineHeight: 1.35 }}>
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Preview "Antes vs Después" ─────────────────────────── */}
          {numAmount > 0 && sim.isValid && (
            <div style={{
              padding: '1.1rem 1.25rem', borderRadius: '1rem',
              background: T.greenBg, border: `1.5px solid ${T.greenBorder}`,
              marginBottom: '1.25rem',
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: T.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                ✨ Impacto de la amortización
              </div>

              {/* Tabla comparativa */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div></div>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Ahora</div>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: T.green, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Después</div>

                <div style={{ fontSize: '0.72rem', color: T.muted, fontWeight: 600 }}>Cuota mensual</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: T.title, textAlign: 'right' }}>{fmtAccount(sim.prevPayment, currency)}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: mode === 'reduce_payment' ? T.green : T.title, textAlign: 'right' }}>
                  {fmtAccount(sim.newPayment, currency)}
                </div>

                <div style={{ fontSize: '0.72rem', color: T.muted, fontWeight: 600 }}>Cuotas restantes</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: T.title, textAlign: 'right' }}>{sim.prevTerm}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: mode === 'reduce_term' ? T.green : T.title, textAlign: 'right' }}>
                  {sim.newTerm === 0 ? '—' : sim.newTerm}
                </div>

                <div style={{ fontSize: '0.72rem', color: T.muted, fontWeight: 600 }}>Intereses totales</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: T.title, textAlign: 'right' }}>{fmtAccount(sim.prevTotalInterest, currency)}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: T.green, textAlign: 'right' }}>{fmtAccount(sim.newTotalInterest, currency)}</div>
              </div>

              {/* Mini-gráfica SVG comparativa (datos downsampled) */}
              {chartBefore.length > 0 && (
                <ComparisonChart
                  before={chartBefore}
                  after={chartAfter}
                  T={T}
                  currency={currency}
                  fmt={fmtAccount}
                />
              )}

              {/* Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
                <div style={{ padding: '0.6rem 0.75rem', borderRadius: '0.625rem', background: '#ffffffcc', border: `1px solid ${T.greenBorder}`, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.55rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>💰 Ahorro intereses</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: T.green }}>{fmtAccount(sim.interestSaved, currency)}</div>
                </div>
                <div style={{ padding: '0.6rem 0.75rem', borderRadius: '0.625rem', background: '#ffffffcc', border: `1px solid ${T.greenBorder}`, textAlign: 'center' }}>
                  {mode === 'reduce_term' ? (
                    <>
                      <div style={{ fontSize: '0.55rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>⏱️ Tiempo ahorrado</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: T.green }}>
                        {sim.monthsSaved} {sim.monthsSaved === 1 ? 'mes' : 'meses'}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '0.55rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>📉 Cuota reducida</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: T.green }}>−{fmtAccount(sim.paymentReduction, currency)}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

</div>

{/* ── Footer fijo con acciones ─────────────────────────────── */}
<div
  style={{
    flexShrink: 0,
    padding: '0.875rem 1.5rem',
    borderTop: `1px solid ${T.cardBorder}`,
    background: T.cardBg,
    display: 'flex',
    gap: '0.6rem',
    justifyContent: 'flex-end',
    boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
  }}
>
  <button
    onClick={onClose}
    style={{
      padding: '0.7rem 1.1rem',
      borderRadius: '0.75rem',
      border: `1.5px solid ${T.cardBorder}`,
      background: T.btnSecBg ?? T.pageBg,
      color: T.btnSecText ?? T.title,
      fontSize: '0.85rem',
      fontWeight: 700,
      cursor: 'pointer',
    }}
  >
    Cancelar
  </button>
  <button
    onClick={handleSubmit}
    disabled={!canSubmit}
    style={{
      padding: '0.7rem 1.25rem',
      borderRadius: '0.75rem',
      border: 'none',
      background: canSubmit ? T.green : T.muted,
      color: '#fff',
      fontSize: '0.85rem',
      fontWeight: 800,
      cursor: canSubmit ? 'pointer' : 'not-allowed',
      opacity: canSubmit ? 1 : 0.5,
    }}
  >
    💸 Aplicar amortización
  </button>
</div>
</div>
</div>,
document.body
);
}

// ════════════════════════════════════════════════════════════════════════════
//  ComparisonChart — Mini-gráfica SVG comparativa "antes vs después"
//  Dibuja dos líneas: evolución del capital pendiente con y sin amortización
// ════════════════════════════════════════════════════════════════════════════

interface ChartProps {
  before: Array<{ month: number; balance: number }>;
  after: Array<{ month: number; balance: number }>;
  T: any;
  currency: string;
  fmt: (n: number, c: string) => string;
}

function ComparisonChart({ before, after, T, currency, fmt }: ChartProps) {
  const width = 500;
  const height = 140;
  const padX = 8;
  const padY = 12;

  // Escalas: usamos el máximo de ambas series y el plazo más largo
  const maxMonth = Math.max(before.length, after.length, 1);
  const maxBalance = Math.max(
    ...before.map((p) => p.balance),
    ...after.map((p) => p.balance),
    1
  );

  const xScale = (m: number) => padX + (m / maxMonth) * (width - padX * 2);
  const yScale = (b: number) => padY + (1 - b / maxBalance) * (height - padY * 2);

  const buildPath = (data: Array<{ month: number; balance: number }>) => {
    if (data.length === 0) return '';
    // Punto inicial = mes 0, balance inicial
    const initial = data[0].balance + (data[0].balance > 0 ? 0 : 0);
    let path = `M ${xScale(0)} ${yScale(maxBalance)}`;
    data.forEach((p) => {
      path += ` L ${xScale(p.month)} ${yScale(p.balance)}`;
    });
    return path;
  };

  const pathBefore = buildPath(before);
  const pathAfter = buildPath(after);

  // Área bajo la curva "antes" (gris)
  const areaBefore = before.length > 0
    ? `M ${xScale(0)} ${height - padY} ${before.map(p => `L ${xScale(p.month)} ${yScale(p.balance)}`).join(' ')} L ${xScale(before[before.length - 1].month)} ${height - padY} Z`
    : '';

  return (
    <div style={{
      padding: '0.85rem 0.85rem 0.6rem',
      borderRadius: '0.75rem',
      background: '#ffffffcc',
      border: `1px solid ${T.greenBorder}`,
      marginTop: '0.5rem',
    }}>
      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Evolución del capital pendiente</span>
        <span style={{ display: 'flex', gap: '0.6rem', textTransform: 'none', letterSpacing: 0 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6rem', color: T.muted }}>
            <span style={{ width: '0.7rem', height: '2px', background: '#94a3b8', borderRadius: '2px' }} /> Sin amortizar
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6rem', color: T.green, fontWeight: 700 }}>
            <span style={{ width: '0.7rem', height: '2px', background: T.green, borderRadius: '2px' }} /> Con amortización
          </span>
        </span>
      </div>

      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        {/* Líneas de cuadrícula horizontales */}
        {[0.25, 0.5, 0.75].map((p) => (
          <line
            key={p}
            x1={padX} x2={width - padX}
            y1={padY + p * (height - padY * 2)}
            y2={padY + p * (height - padY * 2)}
            stroke={T.cardBorder} strokeWidth="1" strokeDasharray="3 3"
          />
        ))}

        {/* Área "antes" gris suave */}
        {areaBefore && (
          <path d={areaBefore} fill="#94a3b822" />
        )}

        {/* Línea "antes" */}
        {pathBefore && (
          <path d={pathBefore} fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Línea "después" verde */}
        {pathAfter && (
          <path d={pathAfter} fill="none" stroke={T.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Punto final "después" */}
        {after.length > 0 && (
          <circle
            cx={xScale(after[after.length - 1].month)}
            cy={yScale(after[after.length - 1].balance)}
            r="3.5" fill={T.green}
          />
        )}
      </svg>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: T.muted, marginTop: '0.2rem' }}>
        <span>Mes 0</span>
        <span>Mes {maxMonth}</span>
      </div>
    </div>
  );
}
