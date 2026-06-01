import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PrintButton, PrintHeader } from '../UI';
import type { Theme } from '../../theme';
import type { Account } from '../../types';

interface Props {
  T: Theme;
  rangeMonths: number | 'all';
  onRangeChange: (v: number | 'all') => void;
  accountFilter: string;
  onAccountFilterChange: (v: string) => void;
  accounts: Account[];
  printSubtitle: string;
}

export function TrendsHeader({
  T,
  rangeMonths,
  onRangeChange,
  accountFilter,
  onAccountFilterChange,
  accounts,
  printSubtitle,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
      <PrintHeader title={t('trends.title')} subtitle={printSubtitle} />

      <div
        className="fh-no-print"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: T.muted,
              textTransform: 'uppercase',
              marginBottom: '0.4rem',
            }}
          >
            {t('trends.headerOverline')}
          </div>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: T.title,
              letterSpacing: '-0.04em',
              margin: 0,
            }}
          >
            {t('trends.headerTitle')}
          </h2>
          <p style={{ fontSize: '0.9rem', color: T.muted, marginTop: '0.4rem' }}>
            {t('trends.headerSubtitle')}
          </p>
        </div>

        <div
          className="fh-no-print"
          style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}
        >
          <PrintButton
            T={T}
            documentTitle="Analisis_de_Tendencias"
            sectionTitle={t('trends.title')}
            subtitle={printSubtitle}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.875rem',
              borderRadius: '0.75rem',
              border: `1px solid ${T.cardBorder}`,
              background: T.cardBg,
            }}
          >
            <select
              value={rangeMonths}
              onChange={(e) =>
                onRangeChange(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              style={{
                border: 'none',
                background: 'transparent',
                color: T.body,
                fontSize: '0.8rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value={3}>{t('trends.last3m')}</option>
              <option value={6}>{t('trends.last6m')}</option>
              <option value={12}>{t('trends.last12m')}</option>
              <option value="all">{t('trends.allHistory')}</option>
            </select>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.875rem',
              borderRadius: '0.75rem',
              border: `1px solid ${T.cardBorder}`,
              background: T.cardBg,
            }}
          >
            <Filter size={14} color={T.muted} />
            <select
              value={accountFilter}
              onChange={(e) => onAccountFilterChange(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                color: T.body,
                fontSize: '0.8rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">{t('trends.allAccounts')}</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}
