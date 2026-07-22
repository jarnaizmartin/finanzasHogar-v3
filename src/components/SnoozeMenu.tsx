import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { Theme } from '../theme';

type SnoozeOption = { label: string; snoozeUntil: number };

type Props = {
  T: Theme;
  dueDate: string; // YYYY-MM-DD
  onSnooze: (snoozeUntil: number) => void;
  trigger?: 'compact' | 'full';
};

/**
 * F2.10 — Menu de snooze con opciones inteligentes calculadas segun
 * la fecha de vencimiento. Usa createPortal para escapar de cualquier
 * overflow:hidden del contenedor padre (problema tipico en banners).
 */
export function SnoozeMenu({
  T,
  dueDate,
  onSnooze,
  trigger = 'compact',
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calcula la posicion del menu cuando se abre, anclado al boton
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const menuWidth = 280; // minWidth aprox del menu
    // Por defecto bajo el boton, alineado a la derecha
    let left = rect.right - menuWidth;
    // Si se sale por la izquierda, alinear a la izquierda
    if (left < 8) left = rect.left;
    // Si se sale por la derecha (menu muy ancho), pegar a 8px del borde
    if (left + menuWidth > window.innerWidth - 8) {
      left = window.innerWidth - menuWidth - 8;
    }
    setPos({ top: rect.bottom + 4, left });
  }, [open]);

  // Cierra al hacer click fuera (boton o menu)
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        btnRef.current &&
        !btnRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Cierra con ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Calcula opciones segun la distancia al vencimiento
  const options: SnoozeOption[] = (() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate + 'T00:00:00');
    const MS = 1000 * 60 * 60 * 24;
    const daysUntil = Math.round((due.getTime() - now.getTime()) / MS);

    const opts: SnoozeOption[] = [];

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    opts.push({ label: t('misc.snooze.tomorrow'), snoozeUntil: tomorrow.getTime() });

    if (daysUntil > 3) {
      const in3 = new Date(now);
      in3.setDate(in3.getDate() + 3);
      opts.push({ label: t('misc.snooze.in3Days'), snoozeUntil: in3.getTime() });
    }

    if (daysUntil > 1) {
      const dayBefore = new Date(due);
      dayBefore.setDate(dayBefore.getDate() - 1);
      opts.push({
        label: t('misc.snooze.dayBefore'),
        snoozeUntil: dayBefore.getTime(),
      });
    }

    if (daysUntil > 0) {
      opts.push({
        label: t('misc.snooze.dueDay'),
        snoozeUntil: due.getTime(),
      });
    }

    const dayAfter = new Date(due);
    dayAfter.setDate(dayAfter.getDate() + 1);
    opts.push({
      label: t('misc.snooze.dayAfter'),
      snoozeUntil: dayAfter.getTime(),
    });

    return opts;
  })();

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        title={t('misc.snooze.btnTitle')}
        style={{
          padding: trigger === 'compact' ? '0.4rem 0.5rem' : '0.4rem 0.875rem',
          borderRadius: '0.625rem',
          border: `1px solid ${T.cardBorder}`,
          background: 'transparent',
          color: T.muted,
          fontSize: '0.72rem',
          fontWeight: 700,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        ⏰{trigger === 'full' ? t('misc.snooze.btnLabel') : ''}
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              background: T.cardBg,
              border: `1px solid ${T.cardBorder}`,
              borderRadius: '0.625rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              minWidth: '18rem',
              maxWidth: 'calc(100vw - 16px)',
              zIndex: 9999,
              padding: '0.25rem',
            }}
          >
            {options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => {
                  onSnooze(opt.snoozeUntil);
                  setOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.55rem 0.75rem',
                  border: 'none',
                  background: 'transparent',
                  color: T.title,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderRadius: '0.4rem',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = T.pageBg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                {opt.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
