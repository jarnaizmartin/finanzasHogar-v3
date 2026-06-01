import { useTranslation } from 'react-i18next';
import { fmt } from '../../utils';
import type { Theme } from '../../theme';

interface Props {
  T: Theme;
  monthIncomeProj: number;
  monthExpenseProj: number;
  monthIncomeReal: number;
  monthExpenseReal: number;
  displayCurrency: string;
  baseCurrency: string;
  rates: Record<string, number>;
}

export function CalendarMonthlySummary({
  T,
  monthIncomeProj,
  monthExpenseProj,
  monthIncomeReal,
  monthExpenseReal,
  displayCurrency,
  baseCurrency,
  rates,
}: Props) {
  const { t } = useTranslation();
  const netProj = monthIncomeProj - monthExpenseProj;
  const netReal = monthIncomeReal - monthExpenseReal;
  const netColor = netReal >= 0 ? T.green : T.red;
  const netBg = netReal >= 0 ? T.greenBg : T.redBg;
  const netBorder = netReal >= 0 ? T.greenBorder : T.redBorder;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
      <SummaryCard
        label={t('calendar.monthlyIncome')}
        projLabel={t('calendar.projected')}
        realLabel={t('calendar.real')}
        color={T.green}
        bg={T.greenBg}
        border={T.greenBorder}
        proj={fmt(monthIncomeProj, displayCurrency, baseCurrency, rates)}
        real={fmt(monthIncomeReal, displayCurrency, displayCurrency, rates)}
      />
      <SummaryCard
        label={t('calendar.monthlyExpense')}
        projLabel={t('calendar.projected')}
        realLabel={t('calendar.real')}
        color={T.red}
        bg={T.redBg}
        border={T.redBorder}
        proj={fmt(monthExpenseProj, displayCurrency, baseCurrency, rates)}
        real={fmt(monthExpenseReal, displayCurrency, displayCurrency, rates)}
      />
      <div style={{ borderRadius: '1rem', background: netBg, border: `1px solid ${netBorder}`, overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1.25rem 0.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: netColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            {t('calendar.netBalance')}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${netBorder}` }}>
          <div style={{ padding: '0.625rem 1.25rem', borderRight: `1px solid ${netBorder}`, opacity: 0.7 }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: netColor, textTransform: 'uppercase', marginBottom: '0.2rem' }}>{t('calendar.projected')}</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: netColor }}>
              {netProj >= 0 ? '+' : ''}{fmt(netProj, displayCurrency, baseCurrency, rates)}
            </div>
          </div>
          <div style={{ padding: '0.625rem 1.25rem' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: netColor, textTransform: 'uppercase', marginBottom: '0.2rem' }}>{t('calendar.real')}</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: netColor }}>
              {netReal >= 0 ? '+' : ''}{fmt(netReal, displayCurrency, displayCurrency, rates)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, projLabel, realLabel, color, bg, border, proj, real }: {
  label: string; projLabel: string; realLabel: string; color: string; bg: string; border: string; proj: string; real: string;
}) {
  return (
    <div style={{ borderRadius: '1rem', background: bg, border: `1px solid ${border}`, overflow: 'hidden' }}>
      <div style={{ padding: '0.75rem 1.25rem 0.5rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
          {label}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${border}` }}>
        <div style={{ padding: '0.625rem 1.25rem', borderRight: `1px solid ${border}`, opacity: 0.7 }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, color, textTransform: 'uppercase', marginBottom: '0.2rem' }}>{projLabel}</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color }}>{proj}</div>
        </div>
        <div style={{ padding: '0.625rem 1.25rem' }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, color, textTransform: 'uppercase', marginBottom: '0.2rem' }}>{realLabel}</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color }}>{real}</div>
        </div>
      </div>
    </div>
  );
}
