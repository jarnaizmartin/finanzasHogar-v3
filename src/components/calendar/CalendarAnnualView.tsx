import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../hooks/useIsMobile';
import type { Theme } from '../../theme';
import type { AnnualMonthStats } from '../../lib/calendarCalc';
import { fmtAmount0 } from '../../lib/i18nFormats';

interface Props {
  annualData: AnnualMonthStats[];
  annualYear: number;
  T: Theme;
  onSelectMonth: (monthIdx: number) => void;
  onChangeYear: (delta: number) => void;
  coachRef?: React.RefObject<HTMLDivElement>;
}

export function CalendarAnnualView({
  annualData,
  annualYear,
  T,
  onSelectMonth,
  onChangeYear,
  coachRef,
}: Props) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── Navegación del año ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <button
          onClick={() => onChangeYear(-1)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.75rem',
            border: `1px solid ${T.cardBorder}`,
            background: T.cardBg,
            color: T.body,
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '1rem',
          }}
        >
          ‹
        </button>
        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: T.title }}>{annualYear}</span>
        <button
          onClick={() => onChangeYear(1)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.75rem',
            border: `1px solid ${T.cardBorder}`,
            background: T.cardBg,
            color: T.body,
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '1rem',
          }}
        >
          ›
        </button>
      </div>

      {/* ── Leyenda ── */}
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.75rem', color: T.muted }}>
        {[
          { color: T.green, label: t('calendar.legendPositive') },
          { color: T.red, label: t('calendar.legendNegative') },
          { color: T.amber, label: t('calendar.legendAdjusted') },
          { color: T.cardBorder, label: t('calendar.legendNoData') },
        ].map((item) => (
          <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: '0.75rem', height: '0.75rem', borderRadius: '0.2rem', background: item.color, display: 'inline-block' }} />
            {item.label}
          </span>
        ))}
      </div>

      {/* ── Grid de 12 meses ── */}
      <div ref={coachRef} style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '0.5rem' : '1rem' }}>
        {annualData.map((m) => {
          const isCurrentMonth = m.isCurrent;
          const borderColor = isCurrentMonth ? T.accent : T.cardBorder;
          const indicatorColor = resolveIndicatorColor(m, T);
          return (
            <div
              key={m.monthIdx}
              onClick={() => onSelectMonth(m.monthIdx)}
              style={{
                borderRadius: '1rem',
                background: T.cardBg,
                border: `2px solid ${borderColor}`,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: isCurrentMonth ? `0 0 0 2px ${T.accent}33` : T.cardShadow,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = T.cardShadowLg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = isCurrentMonth ? `0 0 0 2px ${T.accent}33` : T.cardShadow;
              }}
            >
              <div style={{ height: '0.3rem', background: indicatorColor }} />
              <div style={{ padding: isMobile ? '0.625rem 0.625rem' : '0.875rem 1rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: isCurrentMonth ? 800 : 700, color: isCurrentMonth ? T.accent : T.title, marginBottom: '0.625rem', textTransform: 'capitalize' }}>
                  {m.label}
                  {isCurrentMonth && (
                    <span style={{ marginLeft: '0.375rem', fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '9999px', background: T.accent, color: '#fff', verticalAlign: 'middle' }}>
                      {t('calendar.todayBadge')}
                    </span>
                  )}
                </div>

                {m.hasRealMovements ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                      <span style={{ color: T.muted }}>{t('calendar.annualIncome')}</span>
                      <span style={{ color: T.green, fontWeight: 700 }}>
                        +{fmtAmount0(m.realIncome)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                      <span style={{ color: T.muted }}>{t('calendar.annualExpense')}</span>
                      <span style={{ color: T.red, fontWeight: 700 }}>
                        -{fmtAmount0(m.realExpense)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', fontWeight: 800, paddingTop: '0.25rem', borderTop: `1px solid ${T.cardBorder}`, marginTop: '0.1rem' }}>
                      <span style={{ color: T.muted }}>{t('calendar.annualNet')}</span>
                      <span style={{ color: indicatorColor }}>
                        {m.realNet >= 0 ? '+' : ''}{fmtAmount0(m.realNet)}
                      </span>
                    </div>
                  </div>
                ) : m.isPast ? (
                  <div style={{ fontSize: '0.72rem', color: T.muted, fontStyle: 'italic' }}>{t('calendar.annualNoMovements')}</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ fontSize: '0.68rem', color: T.muted }}>{t('calendar.annualProjected')}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: m.netBalance >= 0 ? T.green : T.red }}>
                      {m.netBalance >= 0 ? '+' : ''}{fmtAmount0(m.netBalance)}
                    </div>
                  </div>
                )}

                {(m.expiringGoals.length > 0 || m.hasAlert) && (
                  <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {m.expiringGoals.length > 0 && (
                      <span
                        title={`${m.expiringGoals.length} objetivo${m.expiringGoals.length !== 1 ? 's' : ''} que vence${m.expiringGoals.length !== 1 ? 'n' : ''} este mes`}
                        style={{ fontSize: '0.65rem', padding: '0.1rem 0.375rem', borderRadius: '9999px', background: T.amberBg, color: T.amber, border: `1px solid ${T.amberBorder}`, fontWeight: 700 }}
                      >
                        🎯 {m.expiringGoals.length}
                      </span>
                    )}
                    {m.hasAlert && !m.isPast && (
                      <span
                        title={t('calendar.annualNegativeTooltip')}
                        style={{ fontSize: '0.65rem', padding: '0.1rem 0.375rem', borderRadius: '9999px', background: T.redBg, color: T.red, border: `1px solid ${T.redBorder}`, fontWeight: 700 }}
                      >
                        ⚠️
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Nota ── */}
      <div style={{ padding: '0.75rem 1rem', borderRadius: '0.875rem', background: T.pageBg, border: `1px solid ${T.cardBorder}`, fontSize: '0.75rem', color: T.muted, lineHeight: 1.5, textAlign: 'center' }}>
        {t('calendar.annualClickHint')}
      </div>
    </div>
  );
}

function resolveIndicatorColor(m: AnnualMonthStats, T: Theme): string {
  if (m.isPast || m.isCurrent) {
    if (!m.hasRealMovements) return T.cardBorder;
    if (m.realNet > 0) return T.green;
    if (m.realNet < -50) return T.red;
    return T.amber;
  }
  if (m.netBalance > 0) return T.green;
  if (m.netBalance < -50) return T.red;
  return T.amber;
}
