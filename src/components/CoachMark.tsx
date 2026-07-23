// ─── CoachMark.tsx ────────────────────────────────────────────────────────────
// 💡 Spotlights contextuales — primera visita a cada pantalla
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useTour } from './TourContext';

// ─── Constantes ───────────────────────────────────────────────────────────────
const LS_KEY = 'fh_coach_seen';
const TOOLTIP_W = 288;
const SPOT_PAD = 10;
const TIP_OFFSET = 16;
const ARROW_SIZE = 9;

// ─── Estilos (inyectados una sola vez) ────────────────────────────────────────
const CM_STYLES = `
  @keyframes cmFadeIn {
    from { opacity: 0; transform: translateY(8px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)   scale(1);    }
  }
  @keyframes cmPulse {
    0%, 100% {
      box-shadow:
        0 0 0 3px rgba(59,130,246,0.35),
        0 0 0 9999px rgba(0,0,0,0.65);
    }
    50% {
      box-shadow:
        0 0 0 7px rgba(59,130,246,0.55),
        0 0 0 9999px rgba(0,0,0,0.65);
    }
  }
  @keyframes cmArrow {
    0%, 100% { transform: translateY(0px);  }
    50%       { transform: translateY(4px); }
  }
`;

// ─── Hook — gestiona el estado "visto" en localStorage ───────────────────────
export function useCoachMark(key: string): {
  seen: boolean;
  markSeen: () => void;
} {
  const get = (): Record<string, boolean> => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    } catch {
      return {};
    }
  };

  const [seen, setSeen] = useState(() => get()[key] === true);

  // 🎬 Si el tour guiado del header está activo, "ocultamos" temporalmente
  // este coachmark contextual devolviendo seen=true. NO lo marcamos como
  // visto en localStorage: cuando el tour termine, volverá a aparecer
  // normalmente la próxima vez que el usuario visite la pantalla.
  const { isTourActive } = useTour();

  const markSeen = useCallback(() => {
    const current = get();
    current[key] = true;
    localStorage.setItem(LS_KEY, JSON.stringify(current));
    setSeen(true);
  }, [key]);

  return { seen: seen || isTourActive, markSeen };
}

// ─── Tipos ───────────────────────────────────────────────────────────────────
type CoachMarkProps = {
  targetRef: React.RefObject<HTMLElement>;
  title: string;
  description: string;
  ctaLabel?: string;
  accentColor?: string;
  onDismiss: () => void;
};

// ─── Componente principal ─────────────────────────────────────────────────────
export function CoachMark({
  targetRef,
  title,
  description,
  ctaLabel,
  accentColor = '#3b82f6',
  onDismiss,
}: CoachMarkProps) {
  const { t } = useTranslation();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const [tipH, setTipH] = useState(0);
  const [insets, setInsets] = useState({ top: 0, bottom: 0 });

  // Leer safe-area insets una vez (notch / Dynamic Island en iOS)
  useEffect(() => {
    const probe = document.createElement('div');
    probe.style.cssText =
      'position:fixed;top:0;left:0;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);';
    document.body.appendChild(probe);
    const cs = getComputedStyle(probe);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mide safe-area insets del DOM al montar (notch/Dynamic Island); una medición no es derivable en render.
    setInsets({
      top: parseFloat(cs.paddingTop) || 0,
      bottom: parseFloat(cs.paddingBottom) || 0,
    });
    probe.remove();
  }, []);

  // Inyectar estilos una única vez
  useEffect(() => {
    if (document.getElementById('cm-styles')) return;
    const el = document.createElement('style');
    el.id = 'cm-styles';
    el.textContent = CM_STYLES;
    document.head.appendChild(el);
  }, []);

  // Calcular y actualizar posición del target
  useEffect(() => {
    // Trae el target a la vista: con el overlay puesto el usuario no puede
    // scrollear, así que si estaba fuera de pantalla nunca lo vería.
    const el = targetRef.current;
    if (el) {
      try {
        el.scrollIntoView({ block: 'center', inline: 'nearest' });
      } catch {
        /* noop */
      }
    }
    const update = () => {
      if (targetRef.current) {
        setRect(targetRef.current.getBoundingClientRect());
      }
    };
    update();
    const t1 = setTimeout(update, 80); // delay para asegurar pintado
    const t2 = setTimeout(update, 360); // tras asentarse el scroll (por si es smooth)
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, [targetRef]);

  // Medir la altura real del tooltip para poder clamparlo al viewport
  useLayoutEffect(() => {
    if (tipRef.current) setTipH(tipRef.current.offsetHeight);
  }, [rect, title, description, ctaLabel]);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onDismiss]);

  if (!rect || rect.width === 0) return null;

  // ── Posición del spotlight ─────────────────────────────────────────────────
  const sL = rect.left - SPOT_PAD;
  const sT = rect.top - SPOT_PAD;
  const sW = rect.width + SPOT_PAD * 2;
  const sH = rect.height + SPOT_PAD * 2;

  // ── Posición del tooltip (numérica + clamp a viewport y safe-area) ────────
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const safeTop = insets.top + 12;
  const safeBottom = insets.bottom + 12;
  const centerX = rect.left + rect.width / 2;

  // Horizontal — clampado para no salir de pantalla
  let tLeft = centerX - TOOLTIP_W / 2;
  tLeft = Math.max(12, Math.min(tLeft, vw - TOOLTIP_W - 12));

  // Vertical — preferimos el lado con más hueco; si no cabe, se clampa.
  const spaceBelow = vh - (sT + sH);
  const spaceAbove = sT;
  const preferBelow = spaceBelow >= tipH + TIP_OFFSET + safeBottom || spaceBelow >= spaceAbove;

  // Si el tooltip es más alto que la pantalla disponible, se limita su altura.
  const availH = vh - safeTop - safeBottom;
  const capH = tipH > availH ? availH : undefined;
  const effH = capH ?? tipH;

  let tTop = preferBelow ? sT + sH + TIP_OFFSET : sT - TIP_OFFSET - effH;
  const maxTop = vh - safeBottom - effH;
  let clamped = false;
  if (tTop < safeTop) {
    tTop = safeTop;
    clamped = true;
  } else if (tTop > maxTop) {
    tTop = Math.max(safeTop, maxTop);
    clamped = true;
  }

  // ── Flecha — solo si el tooltip quedó pegado al target (si se despegó, se oculta) ──
  const showArrow = tipH > 0 && !clamped;
  const arrowCX = Math.min(Math.max(centerX, tLeft + 20), tLeft + TOOLTIP_W - 20);
  const arrowTop = preferBelow ? tTop - ARROW_SIZE : tTop + effH;

  return createPortal(
    <>
      {/* Toca cualquier parte para cerrar */}
      <div
        onClick={onDismiss}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99996,
          cursor: 'pointer',
        }}
      />

      {/* Spotlight — box-shadow crea el overlay oscuro */}
      <div
        style={{
          position: 'fixed',
          left: sL,
          top: sT,
          width: sW,
          height: sH,
          borderRadius: '0.75rem',
          animation: 'cmPulse 2.5s ease-in-out infinite',
          zIndex: 99997,
          pointerEvents: 'none',
        }}
      />

      {/* Flecha CSS apuntando al spotlight */}
      {showArrow && (
        <div
          style={{
            position: 'fixed',
            left: arrowCX - ARROW_SIZE,
            top: arrowTop,
            width: 0,
            height: 0,
            zIndex: 99999,
            pointerEvents: 'none',
            animation: 'cmArrow 1.4s ease-in-out infinite',
            borderLeft: `${ARROW_SIZE}px solid transparent`,
            borderRight: `${ARROW_SIZE}px solid transparent`,
            ...(preferBelow
              ? { borderBottom: `${ARROW_SIZE}px solid #ffffff` }
              : { borderTop: `${ARROW_SIZE}px solid #ffffff` }),
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tipRef}
        style={{
          position: 'fixed',
          left: tLeft,
          top: tTop,
          width: TOOLTIP_W,
          maxHeight: capH,
          overflowY: capH ? 'auto' : undefined,
          zIndex: 99999,
          background: '#ffffff',
          borderRadius: '1.125rem',
          boxShadow:
            '0 24px 64px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.08)',
          padding: '1.25rem',
          animation: 'cmFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both',
        }}
      >
        {/* Línea de acento superior */}
        <div
          style={{
            height: '3px',
            borderRadius: '9999px',
            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}66)`,
            marginBottom: '1rem',
          }}
        />

        <div
          style={{
            fontSize: '0.925rem',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
            marginBottom: '0.5rem',
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: '0.8rem',
            color: '#475569',
            lineHeight: 1.55,
            marginBottom: '1rem',
          }}
        >
          {description}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          style={{
            width: '100%',
            padding: '0.65rem',
            borderRadius: '0.75rem',
            border: 'none',
            background: accentColor,
            color: '#ffffff',
            fontSize: '0.825rem',
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '-0.01em',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.85';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          {ctaLabel ?? t('common.coachCta')}
        </button>

        <div
          onClick={onDismiss}
          style={{
            textAlign: 'center',
            fontSize: '0.67rem',
            color: '#94a3b8',
            marginTop: '0.625rem',
            cursor: 'pointer',
          }}
        >
          {t('common.coachDismissHint')}
        </div>
      </div>
    </>,
    document.body
  );
}
