import { useState, useMemo, useRef, type ChangeEvent } from 'react';
import { useCoachMark, CoachMark } from '../components/CoachMark';
import { StickyCompactBar } from '../components/StickyCompactBar';
import { createPortal } from 'react-dom';
import { Plus, X, Check } from 'lucide-react';
import { useApp } from '../AppContext';
import { useToast } from '../contexts/ToastContext';
import type { SavingsGoal } from '../types';
import { GoalCard } from '../components/GoalCard';
import { GoalWizard } from '../components/GoalWizard';
import {
  calcGoalProgress,
  convertAmount,
  fmt,
  today,
  fmtDateShort,
  fmtDateDMY,
  CURRENCIES,
} from '../utils';
import {
  Card,
  ConfirmModal,
  Field,
  Input,
  Sel,
  PrimaryBtn,
  SecondaryBtn,
  GhostBtn,
  PrintButton,
  PrintHeader,
  PrintFooter,
  QuickCategoryModal,
} from '../components/UI';
import { FirstWinToast } from '../components/FirstWinToast';
import { GOAL_EMOJIS, GOAL_COLORS } from '../lib/goalsConstants';
import {
  calcGoalsGlobalStats,
  calcGoalDeadlineProjection,
} from '../lib/goalsCalc';

const uid = () => crypto.randomUUID();

// ─── Goals ────────────────────────────────────────────────────────────────────
export function Goals() {
  const {
    T,
    goals,
    setGoals,
    accounts,
    categories,
    realExpenses,
    displayCurrency,
    baseCurrency,
    rates,
    dateFormat,
    setTab,
  } = useApp();
  const toast = useToast();
  const { seen: coachSeen, markSeen: coachMarkSeen } = useCoachMark('goals');
  const coachRef = useRef<HTMLDivElement>(null);

  // ── Sticky compact bar ────────────────────────────────────────────────────
  const stickyBarSentinelRef = useRef<HTMLDivElement>(null);

  const [modal, setModal] = useState<null | 'add' | string>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [showFirstWin, setShowFirstWin] = useState(false);
  const TOTAL_STEPS = 3;

  const emptyForm: Omit<SavingsGoal, 'id'> = {
    name: '',
    emoji: '🎯',
    color: '#2563eb',
    targetAmount: 0,
    currency: baseCurrency,
    deadline: '',
    mode: 'manual',
    currentAmount: 0,
    categoryId: '',
    accountId: '',
    autoType: 'income',
    autoStartDate: today(),
  };

  const [form, setForm] = useState<Omit<SavingsGoal, 'id'>>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!form.name.trim()) e.name = 'El nombre es obligatorio';
      if (!form.targetAmount || form.targetAmount <= 0)
        e.targetAmount = 'Introduce un importe válido';
    }
    if (s === 2 && form.mode === 'auto') {
      if (!form.categoryId) e.categoryId = 'Selecciona una categoría';
      if (!form.accountId) e.accountId = 'Selecciona una cuenta';
    }
    return e;
  };

  const save = () => {
    const e = validateStep(step);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const isFirstGoal = modal === 'add' && goals.length === 0;
    if (modal === 'add') {
      setGoals((prev) => [...prev, { ...form, id: uid() }]);
      toast('Objetivo creado correctamente', 'success');
    } else {
      setGoals((prev) =>
        prev.map((g) => (g.id === modal ? { ...g, ...form } : g))
      );
      toast('Objetivo actualizado correctamente', 'success');
    }
    setModal(null);
    setStep(1);
    setForm(emptyForm);
    setErrors({});
    if (isFirstGoal) setShowFirstWin(true);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setErrors({});
    setStep(1);
    setModal('add');
  };

  const openEdit = (goal: SavingsGoal) => {
    setForm({
      ...goal,
      targetAmount: parseFloat(goal.targetAmount.toFixed(2)),
      currentAmount: parseFloat((goal.currentAmount ?? 0).toFixed(2)),
    });
    setErrors({});
    setStep(1);
    setModal(goal.id);
  };

  const handleNext = () => {
    const e = validateStep(step);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  };

  const closeModal = () => {
    setModal(null);
    setStep(1);
    setForm(emptyForm);
    setErrors({});
  };

  const globalStats = useMemo(
    () =>
      calcGoalsGlobalStats(goals, realExpenses, accounts, rates, displayCurrency),
    [goals, realExpenses, rates, displayCurrency, accounts]
  );

  const printSubtitle = useMemo(() => {
    const parts: string[] = [];
    parts.push(
      `${globalStats.total} objetivo${globalStats.total !== 1 ? 's' : ''}`
    );
    if (globalStats.completed > 0)
      parts.push(
        `${globalStats.completed} completado${
          globalStats.completed !== 1 ? 's' : ''
        }`
      );
    parts.push(
      fmt(globalStats.totalSaved, displayCurrency, displayCurrency, rates) +
        ' ahorrado'
    );
    return parts.join(' · ');
  }, [globalStats, displayCurrency, rates]);

  // ── Render principal ───────────────────────────────────────────────────────
  return (
    <div className="fh-print-section" style={{ padding: '1.5rem 1rem' }}>
      <PrintHeader title="Objetivos de ahorro" subtitle={printSubtitle} />

      <div className="fh-no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: T.accent, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Ahorro
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: T.title, margin: 0 }}>🎯 Objetivos</h1>
          <p
            style={{
              fontSize: '0.825rem',
              color: T.muted,
              margin: '0.25rem 0 0',
            }}
          >
            {globalStats.total === 0
              ? 'Crea tu primer objetivo de ahorro'
              : `${globalStats.total} objetivo${
                  globalStats.total !== 1 ? 's' : ''
                } · ${globalStats.completed} completado${
                  globalStats.completed !== 1 ? 's' : ''
                }`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
        <PrintButton T={T} documentTitle="Objetivos de ahorro" sectionTitle="Objetivos de ahorro" subtitle={printSubtitle} />
        <div ref={coachRef} style={{ display: 'inline-block' }}>
            <PrimaryBtn onClick={openAdd} T={T}>
              <Plus size={16} /> Nuevo objetivo
            </PrimaryBtn>
          </div>
        </div>
      </div>

      {goals.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          {[
            {
              label: 'Total objetivos',
              value: String(globalStats.total),
              color: T.accent,
            },
            {
              label: 'Completados',
              value: String(globalStats.completed),
              color: T.green,
            },
            {
              label: 'Total ahorrado',
              value: fmt(
                globalStats.totalSaved,
                displayCurrency,
                displayCurrency,
                rates
              ),
              color: T.title,
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: '1rem',
                borderRadius: '1rem',
                background: T.cardBg,
                border: `1px solid ${T.cardBorder}`,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  color: T.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '0.375rem',
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: item.color,
                }}
                >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🎯 Sentinel — dispara la barra compacta sticky al hacer scroll */}
      {goals.length > 0 && <div ref={stickyBarSentinelRef} style={{ height: 1 }} />}

      {/* ── Barra compacta sticky ── */}
      {goals.length > 0 && (
        <StickyCompactBar
          title="🎯 Objetivos — Progreso"
          sentinelRef={stickyBarSentinelRef}
          kpis={[
            {
              label: 'Total objetivos',
              icon: '🎯',
              value: `${globalStats.total}`,
              color: T.accent,
            },
            {
              label: 'Completados',
              icon: '✅',
              value: `${globalStats.completed}`,
              color: T.green,
            },
            {
              label: 'Total ahorrado',
              icon: '💰',
              value: fmt(globalStats.totalSaved, displayCurrency, displayCurrency, rates),
              color: T.title,
            },
          ]}
          rightSlot={
            <button
              onClick={openAdd}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: T.accent,
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Plus size={13} /> Nuevo
            </button>
          }
        />
      )}

{!coachSeen && goals.length === 0 && (
        <CoachMark
          targetRef={coachRef}
          title="¡Empieza a ahorrar!"
          description="Pulsa aquí para crear tu primer objetivo. La app calculará automáticamente cuánto necesitas ahorrar cada mes para llegar a tiempo."
          onDismiss={coachMarkSeen}
        />
      )}

      {goals.length === 0 ? (
        <div
          style={{ textAlign: 'center', padding: '4rem 2rem', color: T.muted }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: T.title,
              marginBottom: '0.5rem',
            }}
          >
            Sin objetivos todavía
          </div>
          <div style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Crea tu primer objetivo para empezar a ahorrar con propósito.
          </div>
          <PrimaryBtn onClick={openAdd} T={T}>
            <Plus size={16} /> Crear objetivo
          </PrimaryBtn>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(22rem, 1fr))',
            gap: '1rem',
          }}
        >
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={openEdit}
              onDelete={(id) => setConfirmDelete(id)}
            />
          ))}
        </div>
      )}

<PrintFooter section="Objetivos de ahorro" />

      {modal !== null &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              // 🛡️ B2 — No cerramos al hacer click fuera para no perder el progreso
              // del wizard. El usuario debe usar la X o "Cancelar" explícitamente.
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '32rem',
                // 👇 height fijo en vez de maxHeight — clave para que flex column funcione
                height: '92vh',
                background: T.cardBg,
                borderRadius: '1.5rem 1.5rem 0 0',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* ═════ HEADER FIJO ═════ */}
              <div
                style={{
                  flex: '0 0 auto',
                  padding: '1.5rem 1.5rem 1rem',
                  borderBottom: `1px solid ${T.cardBorder}`,
                  background: T.cardBg,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: T.title,
                      }}
                    >
                      {modal === 'add'
                        ? '🎯 Nuevo objetivo'
                        : '✏️ Editar objetivo'}
                    </div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: T.muted,
                        marginTop: '0.1rem',
                      }}
                    >
                      Paso {step} de {TOTAL_STEPS}
                    </div>
                  </div>
                  <GhostBtn onClick={closeModal} T={T}>
                    <X size={18} />
                  </GhostBtn>
                </div>

                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: '0.25rem',
                        borderRadius: '9999px',
                        background: i < step ? T.accent : T.cardBorder,
                        transition: 'background 0.3s',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* ═════ BODY SCROLLABLE ═════ */}
              <div
                style={{
                  flex: '1 1 auto',
                  overflowY: 'auto',
                  minHeight: 0,
                  padding: '1.25rem 1.5rem',
                }}
              >
                <GoalWizard
                  step={step}
                  form={form}
                  setForm={setForm}
                  errors={errors}
                  setErrors={setErrors}
                />
              </div>

              {/* ═════ FOOTER FIJO ═════ */}
              <div
                style={{
                  flex: '0 0 auto',
                  padding: '1rem 1.5rem',
                  borderTop: `1px solid ${T.cardBorder}`,
                  background: T.cardBg,
                  display: 'flex',
                  gap: '0.75rem',
                  boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
                }}
              >
                {step > 1 && (
                  <SecondaryBtn
                    onClick={() => setStep((s) => s - 1)}
                    T={T}
                    style={{ flex: 1 }}
                  >
                    ← Atrás
                  </SecondaryBtn>
                )}
                {step < TOTAL_STEPS ? (
                  <PrimaryBtn onClick={handleNext} T={T} style={{ flex: 2 }}>
                    Siguiente →
                  </PrimaryBtn>
                ) : (
                  <PrimaryBtn onClick={save} T={T} style={{ flex: 2 }}>
                    <Check size={16} /> Guardar objetivo
                  </PrimaryBtn>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {confirmDelete && (
        <ConfirmModal
          T={T}
          title="¿Eliminar objetivo?"
          message="Esta acción no se puede deshacer."
          onConfirm={() => {
            setGoals((prev) => prev.filter((g) => g.id !== confirmDelete));
            toast('Objetivo eliminado', 'success');
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

{showFirstWin && (
        <FirstWinToast
          type="goal"
          onDone={() => {
            setShowFirstWin(false);
            localStorage.setItem('fh_setup_highlight', 'true');
            setTab('dashboard');
          }}
        />
      )}
    </div>
  );
}
