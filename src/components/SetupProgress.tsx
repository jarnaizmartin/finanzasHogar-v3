// ─── SetupProgress.tsx ────────────────────────────────────────────────────────
// 🚀 Barra de progreso de setup — aparece en Dashboard hasta completar los 5 pasos
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../AppContext';
import type { Theme } from '../theme';

const LS_KEY_DISMISSED = 'fh_setup_dismissed';
const LS_KEY_CELEBRATED = 'fh_setup_celebrated';
const LS_KEY_FIRST_SEEN = 'fh_setup_first_seen';
const EXPIRY_DAYS = 7;

function isExpired(): boolean {
  const raw = localStorage.getItem(LS_KEY_FIRST_SEEN);
  if (!raw) return false;
  const diffMs = Date.now() - parseInt(raw, 10);
  return diffMs > EXPIRY_DAYS * 24 * 60 * 60 * 1000;
}

type Step = {
  id: string;
  emoji: string;
  label: string;
  hint: string;
  tab: string;
  done: boolean;
};

export function SetupProgress() {
  const { t } = useTranslation();
  const { T, accounts, projections, realExpenses, setTab, onboarded } =
    useApp();

    const [dismissed, setDismissed] = useState(() => {
      if (localStorage.getItem(LS_KEY_DISMISSED) === 'true' || isExpired()) return true;
      // Si ya celebramos en sesión anterior → ocultar definitivamente
      if (localStorage.getItem(LS_KEY_CELEBRATED) === 'true') {
        localStorage.setItem(LS_KEY_DISMISSED, 'true');
        return true;
      }
      return false;
    });
    const [celebrated, setCelebrated] = useState(
    () => localStorage.getItem(LS_KEY_CELEBRATED) === 'true'
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [highlightNext, setHighlightNext] = useState(() => {
    const val = localStorage.getItem('fh_setup_highlight');
    if (val === 'true') {
      localStorage.removeItem('fh_setup_highlight');
      return true;
    }
    return false;
  });

  // ── Pasos de setup ─────────────────────────────────────────────────────────
  // Orden = el bucle núcleo. Objetivo fuera del arranque (se crea después,
  // desde su sección). Ver 12_ONBOARDING_REDESIGN.md §5.C.
  const steps: Step[] = useMemo(
    () => [
      {
        id: 'account',
        emoji: '🏦',
        label: t('onboarding.setup.accountLabel'),
        hint: t('onboarding.setup.accountHint'),
        tab: 'accounts',
        done: accounts.length > 0,
      },
      {
        id: 'projection',
        emoji: '📈',
        label: t('onboarding.setup.projectionLabel'),
        hint: t('onboarding.setup.projectionHint'),
        tab: 'projections',
        done: projections.length > 0,
      },
      {
        id: 'movement',
        emoji: '🧾',
        label: t('onboarding.setup.movementLabel'),
        hint: t('onboarding.setup.movementHint'),
        tab: 'real',
        done: realExpenses.length > 0,
      },
    ],
    [accounts, realExpenses, projections, t]
  );

  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;
  const pct = (completedCount / steps.length) * 100;

  // Capturamos si allDone era true en el mount inicial.
  // Si ya estaba completo al montar (ej. localStorage limpiado, entorno nuevo),
  // no es una "primera vez" real → descartamos sin mostrar celebración.
  const allDoneAtMount = useRef(allDone);

  // ── Celebración al completar todos los pasos ───────────────────────────────
  useEffect(() => {
    if (allDone && !celebrated) {
      if (allDoneAtMount.current) {
        // Setup ya estaba completo al arrancar — descartar silenciosamente
        setCelebrated(true);
        setDismissed(true);
        localStorage.setItem(LS_KEY_CELEBRATED, 'true');
        localStorage.setItem(LS_KEY_DISMISSED, 'true');
        return;
      }
      // El usuario acaba de completar el último paso en esta sesión
      setShowConfetti(true);
      setCelebrated(true);
      localStorage.setItem(LS_KEY_CELEBRATED, 'true');
      const timerId = setTimeout(() => {
        setShowConfetti(false);
        setDismissed(true);
        localStorage.setItem(LS_KEY_DISMISSED, 'true');
      }, 4000);
      return () => clearTimeout(timerId);
    }
  }, [allDone, celebrated]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(LS_KEY_DISMISSED, 'true');
  };

  // ── Registrar primera visita ───────────────────────────────────────────────
  useEffect(() => {
    if (!localStorage.getItem(LS_KEY_FIRST_SEEN)) {
      localStorage.setItem(LS_KEY_FIRST_SEEN, Date.now().toString());
    }
  }, []);

  // No mostrar si está descartado, ya celebrado, o el onboarding no está completo
  if (!onboarded || dismissed || (allDone && celebrated && !showConfetti)) return null;

  // ── Render celebración ─────────────────────────────────────────────────────
  if (showConfetti) {
    return (
      <div
        style={{
          borderRadius: '1.25rem',
          background: T.greenBg,
          border: `2px solid ${T.greenBorder}`,
          padding: '2rem',
          textAlign: 'center',
          animation: 'fadeSlideIn 0.3s ease both',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <ConfettiParticles color={T.green} />
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎊</div>
        <div
          style={{
            fontSize: '1.25rem',
            fontWeight: 900,
            color: T.green,
            letterSpacing: '-0.03em',
            marginBottom: '0.375rem',
          }}
        >
          {t('onboarding.setup.allDoneTitle')}
        </div>
        <div style={{ fontSize: '0.875rem', color: T.green, opacity: 0.8 }}>
          {t('onboarding.setup.allDoneSub')}
        </div>
      </div>
    );
  }

  // ── Render normal ──────────────────────────────────────────────────────────
  return (
    <div
      style={{
        borderRadius: '1.25rem',
        background: T.cardBg,
        border: `1px solid ${T.cardBorder}`,
        boxShadow: T.cardShadow,
        overflow: 'hidden',
        animation: 'fadeSlideIn 0.3s ease both',
      }}
    >
      {/* Cabecera */}
      <div
        style={{
          padding: '1.125rem 1.5rem 1rem',
          borderBottom: `1px solid ${T.cardBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
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
          {/* Icono animado */}
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.75rem',
              background: `linear-gradient(135deg, #3b82f6, #1d4ed8)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.125rem',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
            }}
          >
            🚀
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 800,
                color: T.title,
                letterSpacing: '-0.02em',
                marginBottom: '0.3rem',
              }}
            >
              {t('onboarding.setup.title')}
            </div>

            {/* Barra de progreso */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}
            >
              <div
                style={{
                  flex: 1,
                  height: '0.375rem',
                  borderRadius: '9999px',
                  background: T.pageBg,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    borderRadius: '9999px',
                    background: `linear-gradient(90deg, #3b82f6, #1d4ed8)`,
                    transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                    boxShadow: '0 0 6px rgba(59,130,246,0.4)',
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: T.accent,
                  flexShrink: 0,
                  minWidth: '3rem',
                }}
              >
                {t('onboarding.setup.progressOf', { done: completedCount, total: steps.length })}
              </span>
            </div>
          </div>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={handleDismiss}
          title={t('onboarding.setup.hideBtn')}
          style={{
            padding: '0.35rem',
            borderRadius: '0.5rem',
            border: `1px solid ${T.cardBorder}`,
            background: T.btnSecBg,
            color: T.muted,
            fontSize: '0.75rem',
            cursor: 'pointer',
            flexShrink: 0,
            lineHeight: 1,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.pageBg;
            e.currentTarget.style.color = T.title;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = T.btnSecBg;
            e.currentTarget.style.color = T.muted;
          }}
        >
          ✕
        </button>
      </div>

      {/* Lista de pasos */}
      <div style={{ padding: '0.75rem 1rem' }}>
      {steps.map((step, i) => {
          const isNext      = !step.done && steps.slice(0, i).every((s) => s.done);
          const isLocked    = !step.done && !isNext;
          const highlighted = isNext && highlightNext;
          return (
            <StepRow
              key={step.id}
              step={step}
              index={i}
              isNext={isNext}
              isLocked={isLocked}
              highlighted={highlighted}
              T={T}
              onAction={() => {
                setHighlightNext(false);
                setTab(step.tab);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Fila de paso ─────────────────────────────────────────────────────────────
function StepRow({
  step,
  index,
  isNext,
  isLocked,
  highlighted,
  T,
  onAction,
}: {
  step: Step;
  index: number;
  isNext: boolean;
  isLocked: boolean;
  highlighted: boolean;
  T: Theme;
  onAction: () => void;
}) {
  const { t } = useTranslation();
  const clickable = !step.done && !isLocked;
  const [flash, setFlash] = useState(highlighted);

  useEffect(() => {
    if (!highlighted) return;
    const timerId = setTimeout(() => setFlash(false), 3000);
    return () => clearTimeout(timerId);
  }, []);

  return (
    <div
      onClick={clickable ? onAction : undefined}
      title={isLocked ? t('onboarding.setup.completePreviousHint') : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
        padding: '0.625rem 0.75rem',
        borderRadius: '0.875rem',
        cursor: step.done ? 'default' : isLocked ? 'not-allowed' : 'pointer',
        marginBottom: index < 3 ? '0.25rem' : 0,
        background: flash ? T.accent + '18' : isNext ? T.accentLight : 'transparent',
        border: `1px solid ${flash ? T.accent : isNext ? T.accent + '44' : 'transparent'}`,
        boxShadow: flash ? `0 0 0 3px ${T.accent}33` : 'none',
        transition: 'all 0.6s ease',
        opacity: step.done ? 0.55 : isLocked ? 0.38 : 1,
      }}
      onMouseEnter={(e) => {
        if (clickable) {
          e.currentTarget.style.background = isNext ? T.accentLight : T.pageBg;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isNext
          ? T.accentLight
          : 'transparent';
      }}
    >
      {/* Indicador */}
      <div
        style={{
          width: '1.875rem',
          height: '1.875rem',
          borderRadius: '50%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: step.done ? T.greenBg : isNext ? T.accentLight : T.pageBg,
          border: `2px solid ${
            step.done ? T.greenBorder : isNext ? T.accent : T.cardBorder
          }`,
          fontSize: step.done ? '0.875rem' : isLocked ? '0.7rem' : '0.75rem',
          fontWeight: 800,
          color: step.done ? T.green : isNext ? T.accent : T.muted,
          transition: 'all 0.3s',
        }}
      >
        {step.done ? '✓' : isLocked ? '🔒' : index + 1}
      </div>

      {/* Emoji */}
      <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>{step.emoji}</span>

      {/* Texto */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '0.825rem',
            fontWeight: step.done ? 600 : 700,
            color: step.done ? T.muted : T.title,
            textDecoration: step.done ? 'line-through' : 'none',
            letterSpacing: '-0.01em',
          }}
        >
          {step.label}
        </div>
        {!step.done && (
          <div
            style={{
              fontSize: '0.7rem',
              color: T.muted,
              marginTop: '0.1rem',
              lineHeight: 1.4,
            }}
          >
            {step.hint}
          </div>
        )}
      </div>

      {/* Flecha — solo siguiente paso pendiente */}
      {isNext && (
        <div
          style={{
            fontSize: '0.875rem',
            color: T.accent,
            fontWeight: 700,
            flexShrink: 0,
            animation: 'twFloat 2s ease-in-out infinite',
          }}
        >
          →
        </div>
      )}
    </div>
  );
}

// ─── Confetti minimalista ─────────────────────────────────────────────────────
const CONFETTI = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: (i * 31 + 5) % 100,
  delay: (i % 5) * 0.15,
  size: (i % 3) + 0.5,
}));

function ConfettiParticles({ color }: { color: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {CONFETTI.map((c) => (
        <div
          key={c.id}
          style={{
            position: 'absolute',
            left: `${c.x}%`,
            top: '-10%',
            width: `${c.size * 6}px`,
            height: `${c.size * 6}px`,
            borderRadius: c.id % 2 === 0 ? '50%' : '2px',
            background:
              c.id % 3 === 0 ? color : c.id % 3 === 1 ? '#60a5fa' : '#fbbf24',
            opacity: 0.7,
            animation: `twFloat ${2 + c.delay}s ease-in-out ${
              c.delay
            }s infinite`,
          }}
        />
      ))}
    </div>
  );
}
