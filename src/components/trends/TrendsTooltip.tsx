import { useApp } from '../../AppContext';
import { fmtAmount } from '../../lib/i18nFormats';

interface RechartsEntry {
  color: string;
  name: string;
  value: number | undefined;
}

interface TrendsTooltipProps {
  active?: boolean;
  payload?: RechartsEntry[];
  label?: string;
}

export function TrendsTooltip({ active, payload, label }: TrendsTooltipProps) {
  const { T } = useApp();
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: T.cardBg,
        border: `1px solid ${T.cardBorder}`,
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem',
        boxShadow: T.cardShadowLg,
        fontSize: '0.8rem',
      }}
    >
      <div style={{ fontWeight: 800, color: T.title, marginBottom: '0.5rem' }}>{label}</div>
      {payload.map((entry, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: entry.color,
            fontWeight: 600,
            marginBottom: '0.2rem',
          }}
        >
          <span
            style={{
              width: '0.5rem',
              height: '0.5rem',
              borderRadius: '50%',
              background: entry.color,
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          {entry.name}:{' '}
          {entry.value != null ? fmtAmount(entry.value) : ''}
        </div>
      ))}
    </div>
  );
}
