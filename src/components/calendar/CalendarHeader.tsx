import { useTranslation } from 'react-i18next';
import { PrintButton, PrintHeader } from '../UI';
import type { Theme } from '../../theme';

interface Props {
  T: Theme;
  calendarView: 'monthly' | 'annual';
  monthName: string;
  printSubtitle: string;
  onViewChange: (v: 'monthly' | 'annual') => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarHeader({
  T,
  calendarView,
  monthName,
  printSubtitle,
  onViewChange,
  onPrevMonth,
  onNextMonth,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
      <PrintHeader title={t('calendar.footerSection')} subtitle={printSubtitle} />

      <div className="fh-no-print" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: T.accent, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            {t('calendar.headerOverline')}
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: T.title, letterSpacing: '-0.04em', margin: 0 }}>
            {t('calendar.headerTitle')}
          </h2>
          <p style={{ fontSize: '0.9rem', color: T.muted, marginTop: '0.4rem' }}>
            {t('calendar.headerSubtitle')}
          </p>
        </div>

        <div className="fh-no-print" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <PrintButton T={T} documentTitle="Calendario_Financiero" sectionTitle={t('calendar.footerSection')} subtitle={printSubtitle} />
          <div style={{ display: 'flex', gap: '0.375rem', padding: '0.25rem', borderRadius: '0.75rem', background: T.pageBg, border: `1px solid ${T.cardBorder}` }}>
            {(['monthly', 'annual'] as const).map((v) => (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                style={{
                  padding: '0.45rem 0.875rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: calendarView === v ? T.accent : 'transparent',
                  color: calendarView === v ? '#ffffff' : T.muted,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {v === 'monthly' ? t('calendar.viewMonthly') : t('calendar.viewAnnual')}
              </button>
            ))}
          </div>
        </div>

        <div className="fh-no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onPrevMonth}
            style={{ padding: '0.5rem 0.875rem', borderRadius: '0.75rem', border: `1px solid ${T.cardBorder}`, background: T.cardBg, color: T.body, cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}
          >
            ‹
          </button>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: T.title, minWidth: 'max(8rem, 10ch)', textAlign: 'center' }}>
            {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
          </span>
          <button
            onClick={onNextMonth}
            style={{ padding: '0.5rem 0.875rem', borderRadius: '0.75rem', border: `1px solid ${T.cardBorder}`, background: T.cardBg, color: T.body, cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}
          >
            ›
          </button>
        </div>
      </div>
    </>
  );
}
