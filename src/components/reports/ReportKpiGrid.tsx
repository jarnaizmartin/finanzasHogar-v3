// ─── Grid de tarjetas KPI reutilizable para Reports ──────────────────────────
// Reemplaza 5 bloques casi idénticos en Reports.tsx (Fase 2.3a).

import type { CSSProperties } from 'react';

export type ReportKpiItem = {
  label: string;
  value: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
};

type Props = {
  items: ReportKpiItem[];
};

export function ReportKpiGrid({ items }: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))',
        gap: '1rem',
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '1rem',
            background: item.bg,
            border: `1px solid ${item.border}`,
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '0.4rem',
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: item.color,
                textTransform: 'uppercase' as CSSProperties['textTransform'],
                letterSpacing: '0.06em',
              }}
            >
              {item.label}
            </div>
          </div>
          <div
            style={{
              fontSize: '1.125rem',
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
  );
}
