// ─── Wrapper de sección tipo "card con header" para Reports ──────────────────
// Reemplaza 5 bloques repetidos en Reports.tsx (Fase 2.3c).

import type { CSSProperties, ReactNode } from 'react';

type Theme = {
  cardBg: string;
  cardBorder: string;
  muted: string;
};

type Props = {
  T: Theme;
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Si true, envuelve children en un div con overflowX:auto (para tablas) */
  scrollX?: boolean;
};

const titleStyle: CSSProperties = {
  fontSize: '0.68rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: '0.75rem',
};

export function ReportSection({
  T,
  title,
  subtitle,
  children,
  scrollX = false,
}: Props) {
  return (
    <div
      style={{
        borderRadius: '1rem',
        background: T.cardBg,
        border: `1px solid ${T.cardBorder}`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '1rem 1.5rem',
          borderBottom: `1px solid ${T.cardBorder}`,
        }}
      >
        <div style={{ ...titleStyle, color: T.muted, marginBottom: subtitle ? '0.4rem' : 0 }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.8rem', color: T.muted }}>{subtitle}</div>
        )}
      </div>
      {scrollX ? <div style={{ overflowX: 'auto' }}>{children}</div> : children}
    </div>
  );
}
