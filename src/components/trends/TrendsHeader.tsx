import { Filter } from 'lucide-react';
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
  return (
    <>
      <PrintHeader title="Análisis de Tendencias" subtitle={printSubtitle} />

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
            Análisis
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
            Análisis de tendencias
          </h2>
          <p style={{ fontSize: '0.9rem', color: T.muted, marginTop: '0.4rem' }}>
            Evolución real de tus finanzas
          </p>
        </div>

        <div
          className="fh-no-print"
          style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}
        >
          <PrintButton
            T={T}
            documentTitle="Analisis_de_Tendencias"
            sectionTitle="Análisis de Tendencias"
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
              <option value={3}>Últimos 3 meses</option>
              <option value={6}>Últimos 6 meses</option>
              <option value={12}>Últimos 12 meses</option>
              <option value="all">Todo el histórico</option>
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
              <option value="all">Todas las cuentas</option>
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
