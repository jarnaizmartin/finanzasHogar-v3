import { CalendarRange } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '../UI';
import { convertAmount, fmt } from '../../utils';
import type { Theme } from '../../theme';
import type { Projection, RealExpense, Account, Category } from '../../types';

interface Props {
  T: Theme;
  selectedDay: number | null;
  selectedMonthName: string;
  selectedReals: RealExpense[];
  selectedProjections: Projection[];
  totalIncomeReal: number;
  totalExpenseReal: number;
  totalIncomeProj: number;
  totalExpenseProj: number;
  categories: Category[];
  accounts: Account[];
  displayCurrency: string;
  baseCurrency: string;
  rates: Record<string, number>;
}

export function CalendarDayPanel({
  T,
  selectedDay,
  selectedMonthName,
  selectedReals,
  selectedProjections,
  totalIncomeReal,
  totalExpenseReal,
  totalIncomeProj,
  totalExpenseProj,
  categories,
  accounts,
  displayCurrency,
  baseCurrency,
  rates,
}: Props) {
  const { t } = useTranslation();
  if (selectedDay === null) {
    return (
      <Card T={T}>
        <div style={{ padding: '2rem 1.25rem', textAlign: 'center', color: T.muted }}>
          <CalendarRange size={36} color={T.muted} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: T.title, marginBottom: '0.25rem' }}>{t('calendar.dayPanelSelectTitle')}</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{t('calendar.dayPanelSelectHint')}</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div style={{ padding: '0.875rem 1.125rem', borderRadius: '0.875rem', background: T.accentLight, border: `1px solid ${T.accent}33` }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
          {t('calendar.dayPanelLabel')}
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: T.accent, letterSpacing: '-0.03em', textTransform: 'capitalize' }}>
          {t('calendar.dayPanelValue', { day: selectedDay, month: selectedMonthName })}
        </div>
      </div>

      {selectedReals.length > 0 && (
        <Card T={T}>
          <div style={{ padding: '0.875rem 1rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: T.accent, display: 'inline-block' }} />
              {t('calendar.dayRealMovements')}
            </div>

            {(totalIncomeReal > 0 || totalExpenseReal > 0) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {totalIncomeReal > 0 && (
                  <div style={{ padding: '0.5rem 0.625rem', borderRadius: '0.625rem', background: T.greenBg, border: `1px solid ${T.greenBorder}` }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: T.green, textTransform: 'uppercase' }}>{t('calendar.dayIncome')}</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: T.green }}>{fmt(totalIncomeReal, displayCurrency, displayCurrency, rates)}</div>
                  </div>
                )}
                {totalExpenseReal > 0 && (
                  <div style={{ padding: '0.5rem 0.625rem', borderRadius: '0.625rem', background: T.redBg, border: `1px solid ${T.redBorder}` }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: T.red, textTransform: 'uppercase' }}>{t('calendar.dayExpense')}</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: T.red }}>{fmt(totalExpenseReal, displayCurrency, displayCurrency, rates)}</div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {selectedReals.map((e) => {
                const cat = categories.find((c) => c.id === e.categoryId);
                const acc = accounts.find((a) => a.id === e.accountId);
                const amountConverted = convertAmount(e.amount, e.currency, displayCurrency, rates);
                return (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.75rem', borderRadius: '0.625rem', background: T.pageBg, border: `1px solid ${T.cardBorder}` }}>
                    <div style={{ width: '0.2rem', alignSelf: 'stretch', borderRadius: '9999px', background: cat?.color || T.cardBorder, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: T.title, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.description}</div>
                      <div style={{ fontSize: '0.68rem', color: T.muted }}>{cat?.name ?? '—'} · {acc?.name ?? '—'}</div>
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: e.type === 'income' ? T.green : T.red, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {e.type === 'income' ? '+' : '-'}{fmt(amountConverted, displayCurrency, displayCurrency, rates)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {selectedProjections.length > 0 && (
        <Card T={T}>
          <div style={{ padding: '0.875rem 1rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: 'transparent', border: `1.5px solid ${T.muted}`, display: 'inline-block' }} />
              {t('calendar.dayProjections')}
            </div>

            {(totalIncomeProj > 0 || totalExpenseProj > 0) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {totalIncomeProj > 0 && (
                  <div style={{ padding: '0.5rem 0.625rem', borderRadius: '0.625rem', background: T.greenBg, border: `1px solid ${T.greenBorder}`, opacity: 0.7 }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: T.green, textTransform: 'uppercase' }}>{t('calendar.dayIncome')}</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: T.green }}>{fmt(totalIncomeProj, displayCurrency, baseCurrency, rates)}</div>
                  </div>
                )}
                {totalExpenseProj > 0 && (
                  <div style={{ padding: '0.5rem 0.625rem', borderRadius: '0.625rem', background: T.redBg, border: `1px solid ${T.redBorder}`, opacity: 0.7 }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: T.red, textTransform: 'uppercase' }}>{t('calendar.dayExpense')}</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: T.red }}>{fmt(totalExpenseProj, displayCurrency, baseCurrency, rates)}</div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {selectedProjections.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId);
                const acc = accounts.find((a) => a.id === p.accountId);
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.75rem', borderRadius: '0.625rem', background: T.pageBg, border: `1px solid ${T.cardBorder}`, opacity: 0.85 }}>
                    <div style={{ width: '0.2rem', alignSelf: 'stretch', borderRadius: '9999px', background: cat?.color || T.cardBorder, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: T.title, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize: '0.68rem', color: T.muted }}>{cat?.name ?? '—'} · {acc?.name ?? '—'}</div>
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: p.type === 'income' ? T.green : T.red, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {p.type === 'income' ? '+' : '-'}{fmt(p.amount, displayCurrency, baseCurrency, rates)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {selectedReals.length === 0 && selectedProjections.length === 0 && (
        <Card T={T}>
          <div style={{ padding: '1.5rem', textAlign: 'center', color: T.muted, fontSize: '0.875rem' }}>
            {t('calendar.dayEmpty')}
          </div>
        </Card>
      )}
    </>
  );
}
