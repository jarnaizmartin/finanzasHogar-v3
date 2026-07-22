// ─── Badge pill reutilizable para Reports ─────────────────────────────────────
// Reemplaza 4 spans casi idénticos en Reports.tsx (Fase 2.3b).

import type { ReactNode } from 'react';
import type { Theme } from '../../theme';

export type ReportBadgeVariant = 'success' | 'danger' | 'warning';

type Props = {
  T: Theme;
  variant: ReportBadgeVariant;
  children: ReactNode;
};

export function ReportBadge({ T, variant, children }: Props) {
  const colors = {
    success: { color: T.green, bg: T.greenBg, border: T.greenBorder },
    danger:  { color: T.red,   bg: T.redBg,   border: T.redBorder   },
    warning: { color: T.amber, bg: T.amberBg, border: T.amberBorder },
  }[variant];

  return (
    <span
      style={{
        fontSize: '0.68rem',
        fontWeight: 700,
        padding: '0.15rem 0.5rem',
        borderRadius: '9999px',
        background: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
      }}
    >
      {children}
    </span>
  );
}
