import { useEffect, forwardRef } from 'react';
import { fmtDate } from '../lib/i18nFormats';
import { useTranslation } from 'react-i18next';
import { APP_NAME } from '../config/app';
import i18next from 'i18next';
import { createPortal } from 'react-dom';
import { X, ArrowUp, ArrowDown, AlertTriangle, ChevronDown } from 'lucide-react';
import { useState, useRef, useLayoutEffect, Children, isValidElement } from 'react';
import { Check } from 'lucide-react';
import { useApp } from '../AppContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { useToast } from '../contexts/ToastContext';
import type { Theme } from '../theme';

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({
  title,
  subtitle,
  onClose,
  T,
  children,
  preventClickOutside = false,
  zIndex = 50,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  T: Theme;
  children: React.ReactNode;
  preventClickOutside?: boolean;
  /** Override del z-index del overlay. Default 50. Súbelo cuando este Modal se
   *  abre ENCIMA de otro overlay con z-index alto (p. ej. QuickCategoryModal
   *  dentro del modal de movimiento real / proyección, que están a 99999). */
  zIndex?: number;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClickOutside) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, preventClickOutside]);

  // Portal a document.body: sin esto, un Modal anidado dentro de otro (p. ej. la
  // revisión de duplicados dentro de Ajustes) hereda el containing block que crea
  // el `backdrop-filter` del overlay padre → su `position: fixed` se posiciona
  // respecto al modal padre (fuera de pantalla en iOS), no respecto al viewport.
  return createPortal(
    <div
      onClick={preventClickOutside ? undefined : onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '1rem',
        paddingTop: '4.5rem',
        paddingBottom: '1rem',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.cardBg,
          border: `1px solid ${T.cardBorder}`,
          borderRadius: T.radiusLg,
          boxShadow: T.cardShadowLg,
          width: '100%',
          maxWidth: '34rem',
          maxHeight: 'calc(100vh - 5.5rem)',
          overflowY: 'auto',
          animation: 'fadeSlideIn 0.2s ease both',
        }}
      >
        <div
          style={{
            padding: '1rem 1.5rem 0.75rem',
            borderBottom: `1px solid ${T.cardBorder}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '1rem',
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
                {title}
              </h2>
              {subtitle && (
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: T.muted,
                    marginTop: '0.25rem',
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label={t('common.close')}
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
        </div>
        <div style={{ padding: '1rem 1.5rem 1.5rem' }}>{children}</div>
      </div>
    </div>,
    document.body
  );
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────
export function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  T,
  danger = true,
  confirmLabel,
  checkboxLabel = null,
  checkboxValue = false,
  onCheckboxChange = null,
}: {
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  T: Theme;
  danger?: boolean;
  confirmLabel?: string; // default: t('common.delete')
  checkboxLabel?: string | null;
  checkboxValue?: boolean;
  onCheckboxChange?: ((v: boolean) => void) | null;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

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
      }}
    >
      <div
        style={{
          background: T.cardBg,
          border: `1px solid ${T.cardBorder}`,
          borderRadius: T.radiusLg,
          boxShadow: T.cardShadowLg,
          width: '100%',
          maxWidth: '26rem',
          padding: '1.25rem',
        }}
      >
        <div
          style={{
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: '50%',
            background: danger ? T.redBg : T.amberBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
          }}
        >
          <AlertTriangle size={16} color={danger ? T.red : T.amber} />
        </div>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 800,
            color: T.title,
            margin: '0 0 0.4rem',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '0.825rem',
            color: T.muted,
            lineHeight: 1.5,
            margin: '0 0 1rem',
          }}
        >
          {message}
        </p>

        {checkboxLabel && (
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              marginBottom: '1rem',
              cursor: 'pointer',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              background: T.accentLight,
              border: `1px solid ${T.accent}33`,
            }}
          >
            <input
              type="checkbox"
              checked={checkboxValue}
              onChange={(e) => onCheckboxChange?.(e.target.checked)}
              style={{
                width: '1rem',
                height: '1rem',
                accentColor: T.accent,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '0.775rem',
                fontWeight: 600,
                color: T.accent,
                lineHeight: 1.4,
              }}
            >
              {checkboxLabel}
            </span>
          </label>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onConfirm}
            className="fh-btn-danger"
            style={{
              flex: 1,
              padding: '0.7rem',
              borderRadius: T.radiusBtn,
              border: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              background: danger ? T.red : T.amber,
              color: '#fff',
            }}
          >
            {confirmLabel ?? t('common.delete')}
          </button>
          <button
            onClick={onCancel}
            className="fh-btn-secondary"
            style={{
              flex: 1,
              padding: '0.7rem',
              borderRadius: T.radiusBtn,
              border: `1px solid ${T.btnSecBorder}`,
              background: T.btnSecBg,
              color: T.btnSecText,
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
export function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div style={{ marginBottom: '1.125rem' }}>
      <label
        style={{
          display: 'block',
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#64748b',
          marginBottom: '0.5rem',
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          style={{
            fontSize: '0.72rem',
            color: '#dc2626',
            marginTop: '0.35rem',
            fontWeight: 600,
          }}
        >
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ T, error, style: extraStyle, ...props }: { T: Theme; error?: boolean; style?: React.CSSProperties; [k: string]: unknown }) {
  return (
    <input
      {...props as React.InputHTMLAttributes<HTMLInputElement>}
      style={{
        width: '100%',
        background: T.inputBg,
        border: `1.5px solid ${error ? T.errorText : T.inputBorder}`,
        borderRadius: T.radiusInput,
        padding: '0.65rem 0.875rem',
        fontSize: '0.875rem',
        color: T.inputText,
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        fontFamily: T.fontFamily,
        // Fix iOS: los date inputs nativos ignoran width/height y se desbordan
        // del contenedor ("se pisan"). appearance:none + altura fija los normaliza.
        // Mismo patrón validado en AccountFormModal (Nueva Cuenta).
        ...(props.type === 'date'
          ? {
              WebkitAppearance: 'none' as React.CSSProperties['WebkitAppearance'],
              appearance: 'none' as React.CSSProperties['appearance'],
              maxWidth: '100%',
              height: '2.55rem',
            }
          : {}),
        ...extraStyle,
      }}
      onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = error ? T.errorText : T.accent;
        e.target.style.boxShadow = `0 0 0 3px ${error ? T.errorText : T.accent}22`;
      }}
      onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = error ? T.errorText : T.inputBorder;
        e.target.style.boxShadow = 'none';
      }}
    />
  );
}

// ─── MoneyInput ───────────────────────────────────────────────────────────────
// Importe numérico alineado a la derecha con el código de divisa superpuesto.
// Patrón validado en AccountFormModal. `currency` = código a mostrar (p.ej. EUR).
export function MoneyInput({ T, currency, error, style: extraStyle, ...props }: { T: Theme; currency: string; error?: boolean; style?: React.CSSProperties; [k: string]: unknown }) {
  return (
    <div style={{ position: 'relative' }}>
      <Input
        T={T}
        error={error}
        type="number"
        step="0.01"
        placeholder="0.00"
        {...props}
        style={{ textAlign: 'right', paddingRight: '3rem', ...extraStyle }}
      />
      <span style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', fontWeight: 700, color: T.muted, pointerEvents: 'none' }}>
        {currency}
      </span>
    </div>
  );
}

// ─── Sel ──────────────────────────────────────────────────────────────────────
// ─── Sel (desplegable propio) ─────────────────────────────────────────────────
// Sustituye el <select> nativo (que en móvil abre el picker del SO, totalmente
// distinto a los modales de la app) por un desplegable con la estética de la app:
// HOJA INFERIOR en móvil, dropdown anclado en escritorio. Mantiene la API del
// antiguo Sel (value, onChange con e.target.value, hijos <option> con value /
// label / disabled) para no tocar ningún call-site. Sin optgroup/multiple en el
// proyecto (verificado), así que basta con leer los <option>.
type SelOption = { value: string; label: React.ReactNode; disabled: boolean };

function extractSelOptions(children: React.ReactNode): SelOption[] {
  const out: SelOption[] = [];
  Children.toArray(children).forEach((child) => {
    if (!isValidElement(child) || child.type !== 'option') return;
    const p = child.props as { value?: unknown; children?: React.ReactNode; disabled?: boolean };
    out.push({ value: String(p.value ?? ''), label: p.children, disabled: !!p.disabled });
  });
  return out;
}

export function Sel({
  T,
  children,
  style: extraStyle,
  value,
  onChange,
  disabled,
  ...rest
}: {
  T: Theme;
  children: React.ReactNode;
  style?: React.CSSProperties;
  value?: unknown;
  onChange?: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  [k: string]: unknown;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<
    { left: number; top: number; bottom: number; width: number; openUp: boolean } | null
  >(null);

  const options = extractSelOptions(children);
  const current = String(value ?? '');
  const selected = options.find((o) => o.value === current);
  const isPlaceholder = !selected || selected.value === '';
  const triggerLabel = selected ? selected.label : options[0]?.label ?? '';

  // Posición del dropdown de escritorio (antes de pintar, para no parpadear).
  useLayoutEffect(() => {
    if (!open || isMobile) return;
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const spaceBelow = window.innerHeight - r.bottom;
    const openUp = spaceBelow < 260 && r.top > spaceBelow;
    setPos({
      left: r.left,
      top: r.bottom,
      bottom: window.innerHeight - r.top,
      width: r.width,
      openUp,
    });
  }, [open, isMobile]);

  // Escape cierra; un resize invalida la posición → cerrar.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onResize = () => setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const choose = (v: string) => {
    setOpen(false);
    onChange?.({ target: { value: v } });
  };

  const triggerStyle: React.CSSProperties = {
    width: '100%',
    background: T.inputBg,
    border: `1.5px solid ${focused || open ? T.accent : T.inputBorder}`,
    borderRadius: T.radiusInput,
    padding: '0.65rem 0.875rem',
    fontSize: '0.875rem',
    color: isPlaceholder ? T.muted : T.inputText,
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    textAlign: 'left',
    boxShadow: focused || open ? `0 0 0 3px ${T.accent}22` : 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    ...extraStyle,
    fontFamily: T.fontFamily,
  };

  const renderRow = (o: SelOption) => {
    const isSel = o.value === current;
    return (
      <button
        key={o.value || `__opt_${String(o.label)}`}
        type="button"
        disabled={o.disabled}
        onClick={() => !o.disabled && choose(o.value)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          width: '100%',
          padding: isMobile ? '0.875rem 1.25rem' : '0.6rem 0.875rem',
          background: isSel ? T.accentLight : 'transparent',
          color: o.disabled ? T.muted : T.inputText,
          border: 'none',
          borderRadius: isMobile ? 0 : '0.5rem',
          cursor: o.disabled ? 'not-allowed' : 'pointer',
          fontSize: '0.875rem',
          fontWeight: isSel ? 700 : 500,
          textAlign: 'left',
          opacity: o.disabled ? 0.45 : 1,
          fontFamily: T.fontFamily,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {o.label}
        </span>
        {isSel && <Check size={15} color={T.accent} style={{ flexShrink: 0 }} />}
      </button>
    );
  };

  return (
    <>
      <button
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={triggerStyle}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {triggerLabel}
        </span>
        <ChevronDown
          size={16}
          style={{
            flexShrink: 0,
            color: T.muted,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s',
          }}
        />
      </button>

      {/* Móvil: hoja inferior (sigue el patrón de los modales). z por encima de
          los modales de formulario (99999) y de QuickCategoryModal (100000). */}
      {open && isMobile &&
        createPortal(
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 100001,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'flex-end',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: T.cardBg,
                borderTopLeftRadius: '1.25rem',
                borderTopRightRadius: '1.25rem',
                borderTop: `1px solid ${T.cardBorder}`,
                width: '100%',
                maxHeight: '70vh',
                overflowY: 'auto',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                animation: 'fadeSlideIn 0.2s ease both',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', padding: '0.6rem 0 0.3rem' }}>
                <div style={{ width: '2.5rem', height: '0.25rem', borderRadius: '9999px', background: T.cardBorder }} />
              </div>
              {options.map(renderRow)}
            </div>
          </div>,
          document.body
        )}

      {/* Escritorio: dropdown anclado al trigger. */}
      {open && !isMobile && pos &&
        createPortal(
          <>
            <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100000 }} />
            <div
              role="listbox"
              style={{
                position: 'fixed',
                left: pos.left,
                top: pos.openUp ? undefined : pos.top + 4,
                bottom: pos.openUp ? pos.bottom + 4 : undefined,
                width: pos.width,
                maxHeight: 260,
                overflowY: 'auto',
                zIndex: 100001,
                background: T.cardBg,
                border: `1px solid ${T.cardBorder}`,
                borderRadius: '0.75rem',
                boxShadow: T.cardShadowLg,
                padding: '0.25rem',
                animation: 'fadeSlideIn 0.15s ease both',
              }}
            >
              {options.map(renderRow)}
            </div>
          </>,
          document.body
        )}
    </>
  );
}

// ─── PrimaryBtn ───────────────────────────────────────────────────────────────
export function PrimaryBtn({
  onClick,
  children,
  fullWidth,
  disabled,
  T,
  style: extra,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  T?: Theme;
  style?: React.CSSProperties;
}) {
  const accent      = T?.accent      ?? '#0891b2';
  const accentHover = T?.accentHover ?? '#0e7490';
  const radiusBtn   = T?.radiusBtn   ?? '0.75rem';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="fh-btn-primary"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.65rem 1.25rem',
        borderRadius: radiusBtn,
        border: 'none',
        background: `linear-gradient(135deg, ${accent} 0%, ${accentHover} 100%)`,
        color: '#fff',
        fontSize: '0.875rem',
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: '-0.01em',
        width: fullWidth ? '100%' : undefined,
        opacity: disabled ? 0.5 : 1,
        boxShadow: disabled ? 'none' : `0 1px 3px ${accent}50, 0 4px 12px ${accent}25`,
        ...extra,
      }}
    >
      {children}
    </button>
  );
}

// ─── SecondaryBtn ─────────────────────────────────────────────────────────────
export function SecondaryBtn({
  onClick,
  children,
  T,
  style: extra,
}: {
  onClick: () => void;
  children: React.ReactNode;
  T: Theme;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      className="fh-btn-secondary"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.65rem 1.125rem',
        borderRadius: T.radiusBtn,
        border: `1px solid ${T.btnSecBorder}`,
        background: T.btnSecBg,
        color: T.btnSecText,
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
        ...extra,
      }}
    >
      {children}
    </button>
  );
}

// ─── DangerBtn ────────────────────────────────────────────────────────────────
export function DangerBtn({
  onClick,
  children,
  T,
  style: extra,
}: {
  onClick: () => void;
  children: React.ReactNode;
  T: Theme;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      className="fh-btn-danger"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.65rem 1rem',
        borderRadius: T.radiusBtn,
        border: `1px solid ${T.redBorder}`,
        background: T.redBg,
        color: T.red,
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
        ...extra,
      }}
    >
      {children}
    </button>
  );
}

// ─── GhostBtn ─────────────────────────────────────────────────────────────────
export function GhostBtn({
  onClick,
  children,
  T,
  color,
  style: extra,
}: {
  onClick: () => void;
  children: React.ReactNode;
  T: Theme;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      className="fh-btn-ghost"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.375rem',
        padding: '0.4rem 0.6rem',
        borderRadius: T.radiusSm,
        border: 'none',
        background: 'transparent',
        color: color || T.muted,
        fontSize: '0.875rem',
        cursor: 'pointer',
        ...extra,
      }}
    >
      {children}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ type, T }: { type: string; T: Theme }) {
  const { t } = useTranslation();
  const inc = type === 'income';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        fontSize: '0.68rem',
        fontWeight: 700,
        padding: '0.2rem 0.625rem',
        borderRadius: T.radiusPill,
        background: inc ? T.greenBg : T.redBg,
        color: inc ? T.green : T.red,
        border: `1px solid ${inc ? T.greenBorder : T.redBorder}`,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      {inc ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
      {inc ? t('categories.typeIncome') : t('categories.typeExpense')}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    T: Theme;
    style?: React.CSSProperties;
  }
>(({ children, T, style: extra }, ref) => {
  return (
    <div
      ref={ref}
      className="fh-print-card"
      style={{
        background: T.cardBg,
        border: `1px solid ${T.cardBorder}`,
        borderRadius: T.radiusCard,
        boxShadow: T.cardShadow,
        overflow: 'hidden',
        transition: T.transition,
        ...extra,
      }}
    >
      {children}
    </div>
  );
});
Card.displayName = 'Card';

export function PrintButton({
  T,
  documentTitle,
  sectionTitle,
  subtitle,
}: {
  T: any;
  documentTitle?: string;
  sectionTitle?: string;
  subtitle?: string;
}) {
  const { t } = useTranslation();
  const handlePrint = () => {
    const section = document.querySelector('.fh-print-section') as HTMLElement;
    if (!section) { window.print(); return; }

    const clone = section.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.fh-no-print').forEach((el) => el.remove());
    clone.querySelectorAll('.fh-print-footer').forEach((el) => el.remove());
    clone.querySelectorAll<HTMLElement>('.recharts-legend-wrapper').forEach((el) => {
      el.style.position  = 'relative';
      el.style.left      = 'auto';
      el.style.bottom    = 'auto';
      el.style.top       = 'auto';
      el.style.width     = '100%';
      el.style.textAlign = 'center';
      el.style.marginTop = '0.5rem';
    });
    clone.querySelectorAll<HTMLElement>('.recharts-wrapper').forEach((el) => {
      el.style.height    = 'auto';
      el.style.minHeight = '0';
    });
    clone.querySelectorAll<HTMLElement>('.recharts-wrapper svg').forEach((el) => {
      el.style.height = 'auto';
      el.removeAttribute('height');
    });

    const now = new Date();
    const date = fmtDate(now, { day: 'numeric', month: 'long', year: 'numeric' });
    const dateFile = fmtDate(now, { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const title = documentTitle ? `${APP_NAME}_${documentTitle}_${dateFile}` : APP_NAME;
    const displayTitle = sectionTitle || documentTitle?.replace(/_/g, ' ') || 'Informe';
    const coverEyebrow = t('common.printCoverEyebrow');
    const coverGeneratedOn = t('common.printCoverGeneratedOn', { date });
    const coverConfidential = t('common.printCoverConfidential');
    const headerTopLeft = `${APP_NAME}  ·  ${displayTitle}`;
    const headerBottomLeft = t('common.printHeaderBottomLeft');

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:0;left:0;width:21cm;height:29.7cm;opacity:0;border:none;z-index:-9999;pointer-events:none;';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) { document.body.removeChild(iframe); window.print(); return; }

    iframeDoc.open();
    iframeDoc.write(`<!DOCTYPE html>
<html lang="${i18next.language}">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0; padding: 0;
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      font-size: 9pt; line-height: 1.5;
      color: #0f172a; background: #ffffff;
    }
    @page {
      size: A4 portrait;
      margin: 2.2cm 1.5cm 1.8cm;
      @top-left {
        content: "${headerTopLeft}";
        font-family: system-ui, sans-serif; font-size: 7pt;
        font-weight: 600; color: #64748b;
        vertical-align: bottom; padding-bottom: 0.3cm;
      }
      @top-right {
        content: "${date}";
        font-family: system-ui, sans-serif; font-size: 7pt;
        color: #94a3b8; vertical-align: bottom; padding-bottom: 0.3cm;
      }
      @bottom-left {
        content: "${headerBottomLeft}";
        font-family: system-ui, sans-serif; font-size: 6.5pt;
        color: #94a3b8; vertical-align: top; padding-top: 0.2cm;
      }
      @bottom-right {
        content: "Página " counter(page);
        font-family: system-ui, sans-serif; font-size: 6.5pt;
        font-weight: 700; color: #0f172a;
        vertical-align: top; padding-top: 0.2cm;
      }
    }
    @page cover {
      margin: 0;
      @top-left { content: none; } @top-right { content: none; }
      @bottom-left { content: none; } @bottom-right { content: none; }
    }
    .cover { page: cover; }
    .cover {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      min-height: 100vh; text-align: center;
      padding: 3cm 2.5cm; page-break-after: always; break-after: page;
      position: relative; background: #ffffff;
    }
    .cover__eyebrow {
      font-size: 6pt; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.18em; color: #2563eb;
      background: #eff6ff; border: 1px solid #bfdbfe;
      padding: 0.2rem 0.875rem; border-radius: 9999px; margin-bottom: 2.5rem;
      display: inline-block;
    }
    .cover__logo {
      width: 5rem; height: 5rem; border-radius: 1.25rem;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      display: flex; align-items: center; justify-content: center;
      font-size: 2.5rem; margin: 0 auto 1.25rem;
      box-shadow: 0 8px 32px rgba(37,99,235,0.2);
    }
    .cover__appname {
      font-size: 9pt; font-weight: 700; color: #64748b;
      letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 3rem;
    }
    .cover__rule { width: 100%; max-width: 22rem; height: 1px; background: #e2e8f0; margin: 0 auto 2.5rem; }
    .cover__title {
      font-size: 28pt; font-weight: 800; color: #0f172a;
      letter-spacing: -0.04em; line-height: 1.05; margin-bottom: 1.25rem;
    }
    .cover__subtitle {
      font-size: 8.5pt; color: #64748b; background: #f8fafc;
      border: 1px solid #e2e8f0; padding: 0.3rem 1rem;
      border-radius: 9999px; max-width: 30rem;
      margin: 0 auto 3rem; line-height: 1.6; display: inline-block;
    }
    .cover__rule2 { width: 100%; max-width: 22rem; height: 1px; background: #e2e8f0; margin: 0 auto 2rem; }
    .cover__date { font-size: 9pt; color: #64748b; font-weight: 500; }
    .cover__confidential {
      position: absolute; bottom: 1.75rem; left: 0; right: 0;
      font-size: 5.5pt; font-weight: 700; letter-spacing: 0.16em;
      text-transform: uppercase; color: #cbd5e1;
    }
    .fh-print-only { display: block !important; }
    * { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
    tr { page-break-inside: avoid; break-inside: avoid; }
    .fh-print-card { page-break-inside: avoid; break-inside: avoid; }
    .recharts-wrapper { width: 100% !important; height: auto !important; min-height: 0 !important; overflow: visible !important; }
    .recharts-wrapper > svg,
    .recharts-surface { width: 100% !important; height: auto !important; overflow: visible !important; }
    /* ── Recharts legend fix ── */
    .recharts-legend-wrapper {
      font-size: 7.5pt !important;
      line-height: 1.4 !important;
    }
    .recharts-legend-item {
      margin-right: 1rem !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 0.3rem !important;
    }
    .recharts-legend-item-text {
      font-size: 7.5pt !important;
      font-weight: 500 !important;
      color: #64748b !important;
    }
    .recharts-surface {
      width: 14px !important;
      height: 14px !important;
    }
    .recharts-symbols circle,
    .recharts-symbols path,
    .recharts-symbols rect {
      transform: scale(0.6) !important;
      transform-origin: center !important;
    }
    .recharts-legend-icon {
      width: 10px !important;
      height: 10px !important;
    }
</style>
</head>
<body>
  <div class="cover">
    <div class="cover__eyebrow">${coverEyebrow}</div>
    <div class="cover__logo">🏠</div>
    <div class="cover__appname">${APP_NAME}</div>
    <div class="cover__rule"></div>
    <div class="cover__title">${displayTitle}</div>
    ${subtitle ? `<div class="cover__subtitle">${subtitle}</div>` : ''}
    <div class="cover__rule2"></div>
    <div class="cover__date">${coverGeneratedOn}</div>
    <div class="cover__confidential">${coverConfidential}</div>
  </div>
  ${clone.outerHTML}
</body>
</html>`);
    iframeDoc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) document.body.removeChild(iframe);
        }, 1000);
      }
    }, 500);
  };

  return (
    <button
      onClick={handlePrint}
      className="fh-no-print"
      title={t('common.printTitle')}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.65rem 1.25rem',
        borderRadius: '0.75rem',
        border: `1.5px solid ${T.cardBorder}`,
        background: T.btnSecBg,
        color: T.btnSecText,
        fontSize: '0.875rem',
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      {t('common.print')}
    </button>
  );
}

// ─── PrintHeader ──────────────────────────────────────────────────────────────
export function PrintHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { t } = useTranslation();
  const date = fmtDate(new Date(), { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div
      className="fh-print-only"
      style={{
        width: '100%',
        marginBottom: '1rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '0.625rem',
          borderBottom: '2px solid #1e293b',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '1.75rem',
              height: '1.75rem',
              borderRadius: '0.375rem',
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              flexShrink: 0,
            }}
          >
            🏠
          </div>
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              {APP_NAME}
            </div>
            <div
              style={{
                fontSize: '0.55rem',
                fontWeight: 600,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {t('common.printFinancialDoc')}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '0.55rem',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {t('common.printGeneratedOn')}
          </div>
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#0f172a',
              marginTop: '0.1rem',
            }}
          >
            {date}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <div
          style={{
            fontSize: '1.125rem',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: '0.65rem',
              color: '#64748b',
              fontWeight: 500,
              padding: '0.2rem 0.5rem',
              borderRadius: '0.375rem',
              background: '#f1f5f9',
              display: 'inline-block',
              marginTop: '0.3rem',
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      <div
        style={{
          height: '1px',
          background: '#e2e8f0',
          marginBottom: '0.75rem',
        }}
      />
    </div>
  );
}

// ─── PrintFooter ──────────────────────────────────────────────────────────────
export function PrintFooter({ section }: { section: string }) {
  const { t } = useTranslation();
  return (
    <div
      className="fh-print-only fh-print-footer"
      style={{
        width: '100%',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          height: '1px',
          background: '#e2e8f0',
          marginBottom: '0.3rem',
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: '7pt',
            color: '#94a3b8',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          {t('common.printFooter', { appName: APP_NAME, section })}
        </span>
        <span
          className="fh-page-number"
          style={{
            fontSize: '7pt',
            color: '#94a3b8',
            fontWeight: 700,
          }}
        />
      </div>
    </div>
  );
}

// ─── WarnBanner ───────────────────────────────────────────────────────────────
export function WarnBanner({
  warnAccounts,
  T,
}: {
  warnAccounts: any[];
  T: any;
}) {
  const { t } = useTranslation();
  if (!warnAccounts.length) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.875rem',
        padding: '1rem 1.25rem',
        borderRadius: '1rem',
        background: T.amberBg,
        border: `1px solid ${T.amberBorder}`,
      }}
    >
      <AlertTriangle
        size={20}
        color={T.amber}
        style={{ flexShrink: 0, marginTop: '0.1rem' }}
      />
      <div>
        <div style={{ fontWeight: 700, color: T.amber, fontSize: '0.875rem' }}>
          {t('accounts.warnBannerTitle')}
        </div>
        <div
          style={{
            fontSize: '0.825rem',
            color: T.amber,
            opacity: 0.85,
            marginTop: '0.2rem',
          }}
        >
          <strong>{warnAccounts.map((a: any) => a.name).join(', ')}</strong>{' '}
          {t('accounts.warnBannerSuffix', { count: warnAccounts.length })}
        </div>
      </div>
    </div>
  );
}

// ─── QuickCategoryModal ───────────────────────────────────────────────────────
const CATEGORY_COLORS_UI = [
  '#1d4ed8',
  '#7c3aed',
  '#db2777',
  '#dc2626',
  '#ea580c',
  '#ca8a04',
  '#16a34a',
  '#0891b2',
  '#0d9488',
  '#4f46e5',
];

export function QuickCategoryModal({
  T,
  defaultType,
  onSave,
  onClose,
}: {
  T: any;
  defaultType: 'income' | 'expense';
  onSave: (cat: {
    id: string;
    name: string;
    type: string;
    color: string;
  }) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { categories, setCategories } = useApp();
  const toast = useToast();

  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>(defaultType);
  const [color, setColor] = useState(CATEGORY_COLORS_UI[0]);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError(t('categories.form.errorName'));
      return;
    }
    const newCat = { id: crypto.randomUUID(), name: name.trim(), type, color };
    setCategories((prev: any[]) => [...prev, newCat]);
    toast(t('categories.toastCreated'), 'success');
    onSave(newCat);
  };

  return (
    <Modal
      title={t('categories.form.newTitle')}
      subtitle={t('categories.form.modalSubtitle')}
      onClose={onClose}
      T={T}
      preventClickOutside={true}
      // Se abre ENCIMA del modal de movimiento real / proyección (z 99999) →
      // necesita un z-index mayor o queda oculto detrás (parecía "no hacer nada").
      zIndex={100000}
    >
      <Field label={t('categories.form.name')} error={error}>
        <Input
          T={T}
          placeholder={t('categories.form.namePlaceholder')}
          value={name}
          autoFocus
          onChange={(e: any) => {
            setName(e.target.value);
            setError('');
          }}
          onKeyDown={(e: any) => e.key === 'Enter' && handleSave()}
        />
      </Field>

      <Field label={t('categories.form.type')}>
        <Sel
          T={T}
          value={type}
          onChange={(e: any) => setType(e.target.value as any)}
        >
          <option value="income">{t('categories.typeIncome')}</option>
          <option value="expense">{t('categories.typeExpense')}</option>
        </Sel>
      </Field>

      <Field label={t('categories.form.color')}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.625rem',
            marginTop: '0.25rem',
          }}
        >
          {CATEGORY_COLORS_UI.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '50%',
                border:
                  color === c
                    ? `3px solid ${T.title}`
                    : '3px solid transparent',
                background: c,
                cursor: 'pointer',
                transform: color === c ? 'scale(1.2)' : 'scale(1)',
                transition: 'all 0.15s',
                boxShadow:
                  color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none',
              }}
            />
          ))}
        </div>
      </Field>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <PrimaryBtn onClick={handleSave} fullWidth>
          <Check size={15} />
          {t('common.save')}
        </PrimaryBtn>
        <SecondaryBtn onClick={onClose} T={T}>
          {t('common.cancel')}
        </SecondaryBtn>
      </div>
    </Modal>
  );
}
