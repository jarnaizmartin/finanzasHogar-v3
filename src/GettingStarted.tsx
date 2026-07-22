// ============================================================
// GETTING STARTED — FinNort
// Guía de primeros pasos para nuevos usuarios
// ============================================================

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from './AppContext';
import type { Theme } from './theme';

// ─── Tipos ───────────────────────────────────────────────────

interface Step {
  id: string;
  emoji: string;
  title: string;
  timeEstimate: string;
  color: string;
  description: string;
  tip: string;
  tipType: 'info' | 'warning' | 'success';
  substeps: string[];
  actionLabel: string;
  actionTab?: string;
  actionCallback?: 'security' | 'backup';
}

// ─── Metadatos estáticos (colores, callbacks, tabs) ───────────

// 🔄 El bucle núcleo (spec 12 §5.I), en su orden: Cuentas → Planificación →
// Movimientos → Previsión. El resto es profundidad opcional.
const ESSENTIAL_META = [
  { id: 'accounts',    emoji: '🏦', color: '#2563eb', tipType: 'warning'  as const, actionTab: 'accounts',    substepCount: 7 },
  { id: 'projections', emoji: '📈', color: '#7c3aed', tipType: 'success'  as const, actionTab: 'projections', substepCount: 6 },
  { id: 'real',        emoji: '🧾', color: '#dc2626', tipType: 'info'     as const, actionTab: 'real',        substepCount: 5 },
  { id: 'forecast',    emoji: '🔮', color: '#0891b2', tipType: 'success'  as const, actionTab: 'forecast',    substepCount: 4 },
];

const RECOMMENDED_META = [
  { id: 'goals',      emoji: '🎯', color: '#16a34a', tipType: 'success' as const, actionTab: 'goals'      as string | undefined, substepCount: 6 },
  { id: 'categories', emoji: '🏷️', color: '#0d9488', tipType: 'info'    as const, actionTab: 'categories' as string | undefined, substepCount: 5 },
  { id: 'security',   emoji: '🔐', color: '#f59e0b', tipType: 'warning' as const, actionCallback: 'security' as 'security' | 'backup' | undefined, substepCount: 5 },
  { id: 'backup',     emoji: '💾', color: '#8b5cf6', tipType: 'warning' as const, actionCallback: 'backup'   as 'security' | 'backup' | undefined, substepCount: 4 },
  { id: 'explore',    emoji: '📊', color: '#0891b2', tipType: 'success' as const, actionTab: 'dashboard'  as string | undefined, substepCount: 5 },
];

// ─── Props ────────────────────────────────────────────────────

interface GettingStartedProps {
  T: Theme;
  securityEnabled: boolean;
  onNavigate: (tab: string) => void;
  onNavigateKeepOpen: (tab: string) => void;
  onOpenSecurity: () => void;
  onOpenBackup: () => void;
  onClose: () => void;
}

// ─── Componente principal ─────────────────────────────────────

export function GettingStarted({
  T,
  securityEnabled,
  onNavigateKeepOpen,
  onOpenSecurity,
  onOpenBackup,
  onClose,
}: GettingStartedProps) {
  const { t } = useTranslation();
  const { accounts, realExpenses, projections, goals, backupHistory } =
    useApp();

  const buildStep = (
    meta: typeof ESSENTIAL_META[0] & { actionTab?: string; actionCallback?: 'security' | 'backup'; substepCount: number },
    keyBase: string
  ): Step => {
    const substeps: string[] = [];
    for (let i = 0; i < meta.substepCount; i++) {
      substeps.push(t(`${keyBase}.s${i}` as Parameters<typeof t>[0]));
    }
    return {
      id: meta.id,
      emoji: meta.emoji,
      color: meta.color,
      tipType: meta.tipType,
      title: t(`${keyBase}.title` as Parameters<typeof t>[0]),
      timeEstimate: t(`${keyBase}.timeEstimate` as Parameters<typeof t>[0]),
      description: t(`${keyBase}.description` as Parameters<typeof t>[0]),
      tip: t(`${keyBase}.tip` as Parameters<typeof t>[0]),
      substeps,
      actionLabel: t(`${keyBase}.actionLabel` as Parameters<typeof t>[0]),
      actionTab: (meta as any).actionTab,
      actionCallback: (meta as any).actionCallback,
    };
  };

  const ESSENTIAL_STEPS = useMemo(() => [
    buildStep(ESSENTIAL_META[0], 'onboarding.guide.stepAccounts'),
    buildStep(ESSENTIAL_META[1], 'onboarding.guide.stepProjections'),
    buildStep(ESSENTIAL_META[2], 'onboarding.guide.stepReal'),
    buildStep(ESSENTIAL_META[3], 'onboarding.guide.stepForecast'),
  ], [t]);

  const RECOMMENDED_STEPS = useMemo(() => [
    buildStep(RECOMMENDED_META[0] as any, 'onboarding.guide.stepGoals'),
    buildStep(RECOMMENDED_META[1] as any, 'onboarding.guide.stepCategories'),
    buildStep(RECOMMENDED_META[2] as any, 'onboarding.guide.stepSecurity'),
    buildStep(RECOMMENDED_META[3] as any, 'onboarding.guide.stepBackup'),
    buildStep(RECOMMENDED_META[4] as any, 'onboarding.guide.stepExplore'),
  ], [t]);

  const [expandedStep, setExpandedStep] = useState<string | null>('accounts');
  const [visitedSteps, setVisitedSteps] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fh_gs_visited') ?? '[]');
    } catch {
      return [];
    }
  });
  

  // ── Detección automática de pasos completados ──────────────────
  const completed: Record<string, boolean> = {
    accounts:    accounts.length > 0,
    real:        realExpenses.length > 0,
    projections: projections.length > 0,
    forecast:    accounts.length > 0 && projections.length > 0, // hay Previsión cuando hay plan
    goals:       goals.length > 0,
    categories:  visitedSteps.includes('categories'), // ✅ completado al visitar
    security:    securityEnabled || visitedSteps.includes('security'),
    backup:      backupHistory.length > 0,
    explore:     accounts.length > 0 && realExpenses.length > 0,
  };
  
  const essentialDone = ESSENTIAL_STEPS.filter((s) => completed[s.id]).length;
  const recommendedDone = RECOMMENDED_STEPS.filter(
    (s) => completed[s.id]
  ).length;
  const totalDone = essentialDone + recommendedDone;
  const totalSteps = ESSENTIAL_STEPS.length + RECOMMENDED_STEPS.length;

  const handleAction = (step: Step) => {
    // ✅ Marcar como visitado al pulsar la acción
    if (!visitedSteps.includes(step.id)) {
      const updated = [...visitedSteps, step.id];
      setVisitedSteps(updated);
      localStorage.setItem('fh_gs_visited', JSON.stringify(updated));
    }
  
    if (step.actionTab) {
      onNavigateKeepOpen(step.actionTab);
    } else if (step.actionCallback === 'security') {
      onOpenSecurity();
      onClose();
    } else if (step.actionCallback === 'backup') {
      onOpenBackup();
      onClose();
    }
  };
  
  const tipColors = {
    info: { bg: T.accentLight, border: `${T.accent}33`, color: T.accent },
    warning: { bg: T.amberBg, border: T.amberBorder, color: T.amber },
    success: { bg: T.greenBg, border: T.greenBorder, color: T.green },
  };
  const tipIcons = { info: '💡', warning: '⚠️', success: '✅' };

  // ── Render de un paso individual ────────────────────────────────
  const renderStep = (step: Step, globalIndex: number) => {
    const isDone = completed[step.id];
    const isExpanded = expandedStep === step.id;
    const tipCfg = tipColors[step.tipType];

    return (
      <div
        key={step.id}
        style={{
          borderRadius: '1rem',
          border: `1.5px solid ${
            isDone
              ? T.greenBorder
              : isExpanded
              ? step.color + '66'
              : T.cardBorder
          }`,
          background: isDone
            ? T.greenBg
            : isExpanded
            ? step.color + '08'
            : T.pageBg,
          overflow: 'hidden',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Cabecera del paso */}
        <button
          onClick={() => setExpandedStep(isExpanded ? null : step.id)}
          style={{
            width: '100%',
            padding: '1rem 1.125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          {/* Icono */}
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.75rem',
              background: isDone
                ? T.green + '22'
                : isExpanded
                ? step.color + '22'
                : T.cardBg,
              border: `1.5px solid ${
                isDone
                  ? T.greenBorder
                  : isExpanded
                  ? step.color + '44'
                  : T.cardBorder
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isDone ? '1rem' : '1.25rem',
              fontWeight: 800,
              color: isDone ? T.green : undefined,
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
          >
            {isDone ? '✓' : step.emoji}
          </div>

          {/* Texto */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.15rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: isDone ? T.green : step.color,
                  opacity: 0.8,
                }}
              >
                {t('onboarding.guide.stepLabel', { n: globalIndex + 1 })}
              </span>
              {isDone ? (
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.5rem',
                    borderRadius: '9999px',
                    background: T.green + '22',
                    border: `1px solid ${T.greenBorder}`,
                    color: T.green,
                  }}
                >
                  {t('onboarding.guide.completedBadge')}
                </span>
              ) : (
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.5rem',
                    borderRadius: '9999px',
                    background: T.pageBg,
                    border: `1px solid ${T.cardBorder}`,
                    color: T.muted,
                  }}
                >
                  {step.timeEstimate}
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 800,
                color: isDone ? T.green : isExpanded ? step.color : T.title,
                textDecoration: isDone ? 'line-through' : 'none',
                opacity: isDone ? 0.7 : 1,
                transition: 'color 0.2s',
              }}
            >
              {step.title}
            </div>
          </div>

          {/* Chevron */}
          <div
            style={{
              fontSize: '0.75rem',
              color: isDone ? T.green : T.muted,
              transition: 'transform 0.2s',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              flexShrink: 0,
              opacity: isDone ? 0.5 : 1,
            }}
          >
            ▼
          </div>
        </button>

        {/* Contenido expandido */}
        {isExpanded && (
          <div
            style={{
              padding: '0 1.125rem 1.125rem',
              animation: 'fadeSlideIn 0.2s ease both',
            }}
          >
            <div
              style={{
                height: '1px',
                background: isDone ? T.greenBorder : step.color + '22',
                marginBottom: '1rem',
              }}
            />

            {/* Descripción */}
            <p
              style={{
                fontSize: '0.825rem',
                color: T.body,
                lineHeight: 1.7,
                margin: '0 0 1rem',
              }}
            >
              {step.description}
            </p>

            {/* Tip */}
            <div
              style={{
                padding: '0.875rem 1rem',
                borderRadius: '0.875rem',
                background: tipCfg.bg,
                border: `1px solid ${tipCfg.border}`,
                marginBottom: '1rem',
                display: 'flex',
                gap: '0.625rem',
                alignItems: 'flex-start',
              }}
            >
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                {tipIcons[step.tipType]}
              </span>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: tipCfg.color,
                  lineHeight: 1.6,
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                {step.tip}
              </p>
            </div>

            {/* Cómo hacerlo */}
            <div
              style={{
                padding: '1rem',
                borderRadius: '0.875rem',
                background: T.pageBg,
                border: `1px solid ${T.cardBorder}`,
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: T.muted,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.08em',
                  marginBottom: '0.75rem',
                }}
              >
                {t('onboarding.guide.howToSection')}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {step.substeps.map((substep, si) => (
                  <div
                    key={si}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.625rem',
                    }}
                  >
                    <div
                      style={{
                        width: '1.375rem',
                        height: '1.375rem',
                        borderRadius: '50%',
                        background: isDone ? T.green + '18' : step.color + '18',
                        border: `1.5px solid ${
                          isDone ? T.greenBorder : step.color + '44'
                        }`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        color: isDone ? T.green : step.color,
                        flexShrink: 0,
                        marginTop: '0.1rem',
                      }}
                    >
                      {si + 1}
                    </div>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: T.body,
                        lineHeight: 1.5,
                        flex: 1,
                      }}
                    >
                      {substep}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón de acción */}
            {!isDone ? (
              <button
                onClick={() => handleAction(step)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.875rem',
                  border: 'none',
                  background: step.color,
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {step.actionLabel}
              </button>
            ) : (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.875rem',
                  background: T.greenBg,
                  border: `1px solid ${T.greenBorder}`,
                  textAlign: 'center',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  color: T.green,
                }}
              >
                {t('onboarding.guide.stepDone')}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── Render de una sección (Esenciales / Recomendados) ──────────
  const renderSection = (
    label: string,
    badge: string,
    steps: Step[],
    startIndex: number,
    doneCount: number
  ) => (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: T.muted,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              background: T.accentLight,
              color: T.accent,
              border: `1px solid ${T.accent}33`,
            }}
          >
            {badge}
          </span>
        </div>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: doneCount === steps.length ? T.green : T.muted,
          }}
        >
          {t('onboarding.guide.sectionCount', { done: doneCount, total: steps.length })}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {steps.map((step, i) => renderStep(step, startIndex + i))}
      </div>
    </div>
  );

  // ── Render principal ───────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Hero con barra de progreso global */}
      <div
        style={{
          padding: '1.5rem',
          borderRadius: '1.25rem',
          background:
            'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚀</div>
        <div
          style={{
            fontSize: '1.125rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            marginBottom: '0.375rem',
          }}
        >
          {t('onboarding.guide.heroTitle')}
        </div>
        <div
          style={{
            fontSize: '0.825rem',
            color: '#93c5fd',
            lineHeight: 1.5,
            marginBottom: '0.875rem',
          }}
        >
          {t('onboarding.guide.heroSubtitle')}
        </div>

        {/* Barra de progreso */}
        <div
          style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '0.875rem',
            padding: '0.875rem 1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{ fontSize: '0.72rem', fontWeight: 700, color: '#93c5fd' }}
            >
              {t('onboarding.guide.progressLabel')}
            </span>
            <span
              style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ffffff' }}
            >
              {t('onboarding.guide.progressOf', { done: totalDone, total: totalSteps })}
            </span>
          </div>
          <div
            style={{
              height: '0.375rem',
              borderRadius: '9999px',
              background: 'rgba(255,255,255,0.15)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(totalDone / totalSteps) * 100}%`,
                borderRadius: '9999px',
                background: 'linear-gradient(90deg, #60a5fa, #34d399)',
                transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Sección Esenciales */}
      {renderSection(
        t('onboarding.guide.sectionEssentials'),
        t('onboarding.guide.sectionEssentialsBadge'),
        ESSENTIAL_STEPS,
        0,
        essentialDone
      )}

      {/* Divisor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ flex: 1, height: '1px', background: T.cardBorder }} />
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: T.muted }}>
          {t('onboarding.guide.sectionDivider')}
        </span>
        <div style={{ flex: 1, height: '1px', background: T.cardBorder }} />
      </div>

      {/* Sección Recomendados */}
      {renderSection(
        t('onboarding.guide.sectionRecommended'),
        t('onboarding.guide.sectionRecommendedBadge'),
        RECOMMENDED_STEPS,
        ESSENTIAL_STEPS.length,
        recommendedDone
      )}

      {/* Footer motivacional */}
      <div
        style={{
          padding: '1.25rem',
          borderRadius: '1rem',
          background: totalDone === totalSteps ? T.greenBg : T.pageBg,
          border: `1px solid ${
            totalDone === totalSteps ? T.greenBorder : T.cardBorder
          }`,
          textAlign: 'center',
        }}
      >
        {totalDone === totalSteps ? (
          <>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎉</div>
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 800,
                color: T.green,
                marginBottom: '0.25rem',
              }}
            >
              {t('onboarding.guide.footerAllDoneTitle')}
            </div>
            <div style={{ fontSize: '0.775rem', color: T.green, opacity: 0.8 }}>
              {t('onboarding.guide.footerAllDoneSub')}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💪</div>
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 800,
                color: T.title,
                marginBottom: '0.25rem',
              }}
            >
              {t('onboarding.guide.footerPendingTitle')}
            </div>
            <div style={{ fontSize: '0.775rem', color: T.muted }}>
              {t('onboarding.guide.footerPendingSub')}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
