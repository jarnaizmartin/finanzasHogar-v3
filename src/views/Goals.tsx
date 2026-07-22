import { useState, useMemo, useRef, type ChangeEvent } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { useTranslation } from 'react-i18next';
import { useCoachMark, CoachMark } from '../components/CoachMark';
import { StickyCompactBar } from '../components/StickyCompactBar';
import { createPortal } from 'react-dom';
import { Plus, X, Check } from 'lucide-react';
import { useApp } from '../AppContext';
import { useToast } from '../contexts/ToastContext';
import type { SavingsGoal } from '../types';
import { GoalCard } from '../components/GoalCard';
import { GoalWizard, type FormState as GoalFormState } from '../components/GoalWizard';
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
  const { t } = useTranslation();
  const {
    T,
    goals,
    setGoals,
    deleteGoal,
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
  const isMobile = useIsMobile();
  const { seen: coachSeen, markSeen: coachMarkSeen } = useCoachMark('goals');
  const coachRef = useRef<HTMLDivElement>(null);

  // ── Sticky compact bar ────────────────────────────────────────────────────
  const stickyBarSentinelRef = useRef<HTMLDivElement>(null);

  const [modal, setModal] = useState<null | 'add' | string>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [showFirstWin, setShowFirstWin] = useState(false);
  const TOTAL_STEPS = 3;

  // Formulario de objetivo NUEVO: sin id (lo pone el guardado) y sin
  // timestamps (los sella el setter de DataContext).
  const emptyForm: GoalFormState = {
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

  const [form, setForm] = useState<GoalFormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!form.name.trim()) e.name = t('goals.errors.nameRequired');
      if (!form.targetAmount || form.targetAmount <= 0)
        e.targetAmount = t('goals.errors.amountRequired');
    }
    if (s === 2 && form.mode === 'auto') {
      if (!form.categoryId) e.categoryId = t('goals.errors.categoryRequired');
      if (!form.accountId) e.accountId = t('goals.errors.accountRequired');
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
      toast(t('goals.toastCreated'), 'success');
    } else {
      setGoals((prev) =>
        prev.map((g) => (g.id === modal ? { ...g, ...form } : g))
      );
      toast(t('goals.toastUpdated'), 'success');
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
    parts.push(t('goals.print.subtitleGoals', { count: globalStats.total }));
    if (globalStats.completed > 0)
      parts.push(t('goals.print.subtitleCompleted', { count: globalStats.completed }));
    parts.push(t('goals.print.subtitleSaved', { amount: fmt(globalStats.totalSaved, displayCurrency, displayCurrency, rates) }));
    return parts.join(' · ');
  }, [globalStats, displayCurrency, rates, t]);

  // ── Render principal ───────────────────────────────────────────────────────
  return (
    <div className="fh-print-section" style={{ padding: '1.5rem 1rem' }}>
      <PrintHeader title={t('goals.print.title')} subtitle={printSubtitle} />

      <div className="fh-no-print" style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: T.accent, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            {t('goals.header.section')}
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: T.title, margin: 0 }}>{t('goals.header.title')}</h1>
          <p
            style={{
              fontSize: '0.825rem',
              color: T.muted,
              margin: '0.25rem 0 0',
            }}
          >
            {globalStats.total === 0
              ? t('goals.header.emptySubtitle')
              : `${t('goals.print.subtitleGoals', { count: globalStats.total })} · ${t('goals.print.subtitleCompleted', { count: globalStats.completed })}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
        <PrintButton T={T} documentTitle={t('goals.print.title')} sectionTitle={t('goals.print.title')} subtitle={printSubtitle} />
        <div ref={coachRef} style={{ display: 'inline-block' }}>
            <PrimaryBtn onClick={openAdd} T={T}>
              <Plus size={16} /> {t('goals.header.newGoal')}
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
              label: t('goals.stats.total'),
              value: String(globalStats.total),
              color: T.accent,
            },
            {
              label: t('goals.stats.completed'),
              value: String(globalStats.completed),
              color: T.green,
            },
            {
              label: t('goals.stats.totalSaved'),
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
                padding: isMobile ? '0.625rem 0.5rem' : '1rem',
                borderRadius: '1rem',
                background: T.cardBg,
                border: `1px solid ${T.cardBorder}`,
                textAlign: 'center',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? '0.52rem' : '0.6rem',
                  fontWeight: 700,
                  color: T.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '0.25rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: isMobile ? '0.875rem' : '1.1rem',
                  fontWeight: 800,
                  color: item.color,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
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
          title={t('goals.header.stickyTitle')}
          sentinelRef={stickyBarSentinelRef}
          spread
          kpis={[
            {
              label: t('goals.stats.total'),
              icon: '🎯',
              value: `${globalStats.total}`,
              color: T.accent,
            },
            {
              label: t('goals.stats.completed'),
              icon: '✅',
              value: `${globalStats.completed}`,
              color: T.green,
            },
            {
              label: t('goals.stats.totalSaved'),
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
              <Plus size={13} /> {t('goals.header.new')}
            </button>
          }
        />
      )}

{!coachSeen && goals.length === 0 && (
        <CoachMark
          targetRef={coachRef}
          title={t('goals.coach.title')}
          description={t('goals.coach.description')}
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
            {t('goals.empty.title')}
          </div>
          <div style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {t('goals.empty.body')}
          </div>
          <PrimaryBtn onClick={openAdd} T={T}>
            <Plus size={16} /> {t('goals.empty.createBtn')}
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

<PrintFooter section={t('goals.print.title')} />

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
                height: 'min(92svh, 92vh)',
                background: T.cardBg,
                borderRadius: '1.5rem 1.5rem 0 0',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
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
                        ? t('goals.modal.newTitle')
                        : t('goals.modal.editTitle')}
                    </div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: T.muted,
                        marginTop: '0.1rem',
                      }}
                    >
                      {t('goals.modal.step', { step, total: TOTAL_STEPS })}
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
                    {t('common.back')}
                  </SecondaryBtn>
                )}
                {step < TOTAL_STEPS ? (
                  <PrimaryBtn onClick={handleNext} T={T} style={{ flex: 2 }}>
                    {t('common.next')}
                  </PrimaryBtn>
                ) : (
                  <PrimaryBtn onClick={save} T={T} style={{ flex: 2 }}>
                    <Check size={16} /> {t('common.saveGoal')}
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
          title={t('goals.confirm.deleteTitle')}
          message={t('common.irreversible')}
          onConfirm={() => {
            deleteGoal(confirmDelete);
            toast(t('goals.toastDeleted'), 'success');
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
