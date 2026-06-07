// ─────────────────────────────────────────────────────────────────────────────
// StickyCompactBar.tsx
// Barra compacta que se pega arriba del contenedor scrollable cuando el
// bloque resumen sale del viewport.
//
// ✨ Implementación CORRECTA para apps con scroll container interno:
//  - Se renderiza DENTRO del flujo de la página (no es position:fixed)
//  - Usa position:sticky con top:0 → el navegador la pega arriba del
//    contenedor scrollable real (sea window o un div interno)
//  - IntersectionObserver detecta cuándo el sentinel sale de vista para
//    animar entrada/salida (slide + fade)
//
// Ancho en móvil: width:100vw + marginLeft:-1rem (viewport units, fiable en
// iOS Safari — las técnicas de negative margin doble fallan en algunos casos)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, type RefObject, type ReactNode } from 'react';
import { useApp } from '../AppContext';
import { useIsMobile } from '../hooks/useIsMobile';

export interface CompactKPI {
  label?: string;
  icon?: string;
  value: string;
  color?: string;
}

interface Props {
  title: string;
  /** Subtítulo descriptivo: aparece tras el título separado por "—". */
  subtitle?: string;
  sentinelRef: RefObject<HTMLDivElement>;
  kpis: CompactKPI[];
  rightSlot?: ReactNode;
  /** Info de filtrado: aparece solo cuando hay filtros activos (visible < total). */
  filterInfo?: { visible: number; total: number; itemLabel?: string; currentPosition?: number };
  /** Distribuye los KPIs a lo ancho con etiqueta visible encima del valor. */
  spread?: boolean;
  /** En móvil: layout 2 filas — KPIs en fila 1, controles en fila 2. */
  twoRowsMobile?: boolean;
  /**
   * Con twoRowsMobile: cuántos KPIs van en la fila 1.
   * Los KPIs restantes se muestran en la fila 2 junto a filterInfo y rightSlot.
   * Por defecto: todos los KPIs en fila 1.
   */
  mobileRow1Count?: number;
}

function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node: HTMLElement | null = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    if (
      (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

export function StickyCompactBar({
  title,
  subtitle,
  sentinelRef,
  kpis,
  rightSlot,
  filterInfo,
  spread,
  twoRowsMobile,
  mobileRow1Count,
}: Props) {
  const { T } = useApp();
  const isMobile = useIsMobile();
  const [visible, setVisible] = useState(false);

  const isTwoRow = isMobile && twoRowsMobile;
  const splitAt = mobileRow1Count ?? kpis.length;
  const row1Kpis = isTwoRow ? kpis.slice(0, splitAt) : kpis;
  const row2Kpis = isTwoRow ? kpis.slice(splitAt) : [];
  const hasRow2 = isTwoRow && (row2Kpis.length > 0 || !!filterInfo || !!rightSlot);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const scrollParent = findScrollParent(el);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { root: scrollParent, threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sentinelRef]);

  // Altura máxima según modo
  const mobileMaxH = isTwoRow ? '76px' : '48px';

  return (
    <div
      className="fh-no-print"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        // Ancho borde a borde: maxWidth:'none' es OBLIGATORIO para anular la
        // regla global `* { max-width: 100% }` de index.css (si falta, el ancho
        // queda capado al contenedor y la barra no llega al borde derecho).
        ...(isMobile
          ? { width: '100vw', maxWidth: 'none', marginLeft: '-1rem' }
          : { maxWidth: 'none', marginLeft: '-2rem', marginRight: '-2rem' }),
        marginBottom: visible ? '1rem' : 0,
        background: T.stickyBg,
        borderBottom: `2px solid ${T.accent}`,
        boxShadow: visible
          ? `0 8px 24px -4px ${T.accent}55, 0 4px 8px rgba(0,0,0,0.08)`
          : 'none',
        backdropFilter: 'saturate(150%)',
        maxHeight: visible ? (isMobile ? mobileMaxH : '56px') : '0px',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transition:
          'max-height 0.25s ease, opacity 0.2s ease, box-shadow 0.2s ease, margin-bottom 0.25s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >

      {/* ── Layout una fila (desktop + móvil sin twoRowsMobile) ── */}
      {!isTwoRow && (
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: isMobile ? '0 1rem' : '0 2rem',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '0.625rem' : '1.25rem',
            height: isMobile ? '44px' : '52px',
            boxSizing: 'border-box',
          }}
        >
          {/* Título — solo desktop */}
          {!isMobile && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: '0.4rem',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: T.title,
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </span>
              {subtitle && (
                <>
                  <span style={{ color: T.muted, fontWeight: 400, opacity: 0.6 }}>—</span>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: T.muted,
                      letterSpacing: 0,
                    }}
                  >
                    {subtitle}
                  </span>
                </>
              )}
            </span>
          )}

          {/* Badge filtro (una fila) */}
          {filterInfo && filterInfo.total > 0 && (() => {
            const isFiltered = filterInfo.visible < filterInfo.total;
            const pos = filterInfo.currentPosition;
            const showPos = !!(pos && pos > 0);
            return (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: T.radiusPill,
                  background: isFiltered ? `${T.accent}1A` : T.pageBg,
                  color: isFiltered ? T.accent : T.muted,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: `1px solid ${isFiltered ? T.accent + '40' : T.cardBorder}`,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
                title={
                  isFiltered
                    ? `Filtro activo — viendo ~${pos ?? '?'} de ${filterInfo.visible} (de ${filterInfo.total} totales)`
                    : `Viendo ~${pos ?? '?'} de ${filterInfo.total} ${filterInfo.itemLabel ?? ''}`
                }
              >
                {isFiltered
                  ? `🔍 ${showPos ? `${pos} de ` : ''}${filterInfo.visible} / ${filterInfo.total}`
                  : `📊 ${showPos ? `${pos} / ` : ''}${filterInfo.total}`}{' '}
                {filterInfo.itemLabel ?? ''}
              </span>
            );
          })()}

          {!isMobile && (
            <div
              style={{
                height: '1.5rem',
                width: 1,
                background: T.cardBorder,
                flexShrink: 0,
              }}
            />
          )}

          {/* KPIs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spread ? 0 : '1.1rem',
              justifyContent: spread ? 'space-evenly' : undefined,
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            {row1Kpis.map((k, i) =>
              spread ? (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.1rem',
                    minWidth: 0,
                  }}
                >
                  {k.label && (
                    <span
                      style={{
                        fontSize: '0.575rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.09em',
                        color: T.muted,
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {k.label}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: isMobile ? '0.82rem' : '1rem',
                      fontWeight: 800,
                      color: k.color ?? T.body,
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {k.icon && <span style={{ fontSize: '0.8rem', opacity: 0.75 }}>{k.icon}</span>}
                    {k.value}
                  </span>
                </div>
              ) : (
                <span
                  key={i}
                  title={k.label}
                  style={{
                    fontSize: isMobile ? '0.72rem' : '0.85rem',
                    fontWeight: 700,
                    color: k.color ?? T.body,
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  {k.icon && <span style={{ fontSize: isMobile ? '0.8rem' : '0.95rem' }}>{k.icon}</span>}
                  {k.value}
                </span>
              )
            )}
          </div>

          {rightSlot && (
            <div
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {rightSlot}
            </div>
          )}
        </div>
      )}

      {/* ── Layout dos filas (móvil con twoRowsMobile) ── */}
      {isTwoRow && (
        <div
          style={{
            padding: '0.4rem 1rem 0.45rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.3rem',
            boxSizing: 'border-box',
          }}
        >
          {/* Fila 1: KPIs principales */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-evenly',
              alignItems: 'center',
            }}
          >
            {row1Kpis.map((k, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.08rem',
                  minWidth: 0,
                }}
              >
                {k.label && (
                  <span
                    style={{
                      fontSize: '0.525rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.09em',
                      color: T.muted,
                      lineHeight: 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {k.label}
                  </span>
                )}
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    color: k.color ?? T.body,
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {k.icon && <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>{k.icon}</span>}
                  {k.value}
                </span>
              </div>
            ))}
          </div>

          {/* Fila 2: KPIs secundarios (si hay split) + badge filtro + rightSlot */}
          {hasRow2 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {/* KPIs de la fila 2 (cuando mobileRow1Count divide los KPIs) */}
              {row2Kpis.length > 0 &&
                row2Kpis.map((k, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.08rem',
                      minWidth: 0,
                    }}
                  >
                    {k.label && (
                      <span
                        style={{
                          fontSize: '0.525rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.09em',
                          color: T.muted,
                          lineHeight: 1,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {k.label}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: k.color ?? T.body,
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {k.icon && <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>{k.icon}</span>}
                      {k.value}
                    </span>
                  </div>
                ))}

              {/* Badge de filtro */}
              {filterInfo && filterInfo.total > 0 && (() => {
                const isFiltered = filterInfo.visible < filterInfo.total;
                const pos = filterInfo.currentPosition;
                const showPos = !!(pos && pos > 0);
                return (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: T.radiusPill,
                      background: isFiltered ? `${T.accent}1A` : T.pageBg,
                      color: isFiltered ? T.accent : T.muted,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      border: `1px solid ${isFiltered ? T.accent + '40' : T.cardBorder}`,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {isFiltered
                      ? `🔍 ${showPos ? `${pos} de ` : ''}${filterInfo.visible}/${filterInfo.total}`
                      : `📊 ${showPos ? `${pos}/` : ''}${filterInfo.total}`}{' '}
                    {filterInfo.itemLabel ?? ''}
                  </span>
                );
              })()}

              {/* rightSlot (subtabs, botón restaurar, etc.) */}
              {rightSlot && (
                <div
                  style={{
                    marginLeft: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  {rightSlot}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
