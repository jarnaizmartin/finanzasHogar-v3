// ─── Barra de filtros de Movimientos Reales ─────────────────────────────────
// Extraído de RealExpenses.tsx (Fase 3, paso 2).
// Lee/escribe filtros directamente del AppContext.

import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../AppContext';
import type { Theme } from '../../theme';

type Props = {
  filteredCount: number;
};

export function RealExpenseFiltersBar({ filteredCount }: Props) {
  const { t } = useTranslation();
  const {
    T, accounts, categories,
    realFilterType: filterType, setRealFilterType: setFilterType,
    realFilterAccount: filterAccount, setRealFilterAccount: setFilterAccount,
    realFilterCategory: filterCategory, setRealFilterCategory: setFilterCategory,
    realFilterDateMode: filterDateMode, setRealFilterDateMode: setFilterDateMode,
    realFilterPreset: filterPreset, setRealFilterPreset: setFilterPreset,
    realFilterDateFrom: filterDateFrom, setRealFilterDateFrom: setFilterDateFrom,
    realFilterDateTo: filterDateTo, setRealFilterDateTo: setFilterDateTo,
  } = useApp();

  const hasActiveFilters =
    filterType !== 'all' ||
    filterAccount !== 'all' ||
    filterCategory !== 'all' ||
    filterPreset !== 'all' ||
    filterDateFrom !== '' ||
    filterDateTo !== '';

  const clearAllFilters = () => {
    setFilterType('all');
    setFilterAccount('all');
    setFilterCategory('all');
    setFilterPreset('all');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterDateMode('preset');
  };

  return (
    <div className="fh-no-print" style={{ marginBottom: '1.5rem' }}>
      <div
        style={{
          display: 'flex', gap: '0.5rem', alignItems: 'center',
          padding: '0.5rem', borderRadius: '1rem',
          background: T.accentLight, border: `1px solid ${T.accent}33`,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.375rem', color: T.muted, flexShrink: 0 }}>
          <Filter size={14} />
        </div>
        <div style={{ width: '1px', height: '1.25rem', background: T.cardBorder, flexShrink: 0 }} />

        {/* Tipo */}
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {(['all', 'income', 'expense'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilterType(v)}
              style={{
                padding: '0.35rem 0.75rem', borderRadius: '0.5rem',
                fontSize: '0.775rem', fontWeight: 700, border: 'none',
                background: filterType === v ? T.accent : 'transparent',
                color: filterType === v ? '#fff' : T.muted,
                cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
            >
              {v === 'all' ? t('realExpenses.filters.typeAll') : v === 'income' ? t('realExpenses.filters.btnIncome') : t('realExpenses.filters.btnExpense')}
            </button>
          ))}
        </div>
        <div style={{ width: '1px', height: '1.25rem', background: T.cardBorder, flexShrink: 0 }} />

        {/* Cuenta */}
        <select
          value={filterAccount}
          onChange={(e) => setFilterAccount(e.target.value)}
          style={{
            padding: '0.35rem 0.625rem', borderRadius: '0.5rem',
            border: `1px solid ${filterAccount !== 'all' ? T.accent : 'transparent'}`,
            background: filterAccount !== 'all' ? T.accentLight : 'transparent',
            color: filterAccount !== 'all' ? T.accent : T.muted,
            fontSize: '0.775rem', fontWeight: 600, outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="all">{t('realExpenses.filters.accountAll')}</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <div style={{ width: '1px', height: '1.25rem', background: T.cardBorder, flexShrink: 0 }} />

        {/* Categoría */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: '0.35rem 0.625rem', borderRadius: '0.5rem',
            border: `1px solid ${filterCategory !== 'all' ? T.accent : 'transparent'}`,
            background: filterCategory !== 'all' ? T.accentLight : 'transparent',
            color: filterCategory !== 'all' ? T.accent : T.muted,
            fontSize: '0.775rem', fontWeight: 600, outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="all">{t('realExpenses.filters.categoryAll')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div style={{ width: '1px', height: '1.25rem', background: T.cardBorder, flexShrink: 0 }} />

        {/* Fechas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <select
            value={filterDateMode === 'range' ? '__range__' : filterPreset}
            onChange={(e) => {
              if (e.target.value === '__range__') {
                setFilterDateMode('range');
              } else {
                setFilterDateMode('preset');
                setFilterPreset(e.target.value);
                setFilterDateFrom('');
                setFilterDateTo('');
              }
            }}
            style={{
              padding: '0.35rem 0.625rem', borderRadius: '0.5rem',
              border: `1px solid ${
                filterPreset !== 'all' || filterDateMode === 'range' ? T.accent : 'transparent'
              }`,
              background:
                filterPreset !== 'all' || filterDateMode === 'range' ? T.accentLight : 'transparent',
              color:
                filterPreset !== 'all' || filterDateMode === 'range' ? T.accent : T.muted,
              fontSize: '0.775rem', fontWeight: 600, outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="all">{t('realExpenses.filters.dateAll')}</option>
            <option value="this_month">{t('realExpenses.filters.dateThisMonth')}</option>
            <option value="last_month">{t('realExpenses.filters.dateLastMonth')}</option>
            <option value="last_3">{t('realExpenses.filters.dateLast3')}</option>
            <option value="last_6">{t('realExpenses.filters.dateLast6')}</option>
            <option value="this_year">{t('realExpenses.filters.dateThisYear')}</option>
            <option value="__range__">{t('realExpenses.filters.dateCustomRange')}</option>
          </select>
          {filterDateMode === 'range' && (
            <>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                style={{
                  padding: '0.35rem 0.5rem', borderRadius: '0.5rem',
                  border: `1px solid ${T.cardBorder}`, background: T.inputBg,
                  color: T.inputText, fontSize: '0.72rem', outline: 'none',
                }}
              />
              <span style={{ fontSize: '0.7rem', color: T.muted }}>→</span>
              <input
                type="date"
                value={filterDateTo}
                min={filterDateFrom}
                onChange={(e) => setFilterDateTo(e.target.value)}
                style={{
                  padding: '0.35rem 0.5rem', borderRadius: '0.5rem',
                  border: `1px solid ${T.cardBorder}`, background: T.inputBg,
                  color: T.inputText, fontSize: '0.72rem', outline: 'none',
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Chips filtros activos */}
      {hasActiveFilters && (
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: '0.625rem', padding: '0.5rem 0.75rem', borderRadius: '0.75rem',
            background: T.accent + '22', border: `1px solid ${T.accent}55`,
            gap: '0.75rem', flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: T.accent, marginRight: '0.125rem' }}>
              {t('realExpenses.filters.activeLabel')}
            </span>
            {filterType !== 'all' && (
              <Chip T={T} onRemove={() => setFilterType('all')}>
                {filterType === 'income' ? t('realExpenses.filters.chipIncome') : t('realExpenses.filters.chipExpense')}
              </Chip>
            )}
            {filterAccount !== 'all' && (
              <Chip T={T} onRemove={() => setFilterAccount('all')}>
                🏦 {accounts.find((a) => a.id === filterAccount)?.name ?? filterAccount}
              </Chip>
            )}
            {filterCategory !== 'all' && (
              <Chip T={T} onRemove={() => setFilterCategory('all')}>
                🏷️ {categories.find((c) => c.id === filterCategory)?.name ?? filterCategory}
              </Chip>
            )}
            {(filterPreset !== 'all' || filterDateMode === 'range') && (
              <Chip
                T={T}
                onRemove={() => {
                  setFilterPreset('all');
                  setFilterDateMode('preset');
                  setFilterDateFrom('');
                  setFilterDateTo('');
                }}
              >
                📅{' '}
                {filterDateMode === 'range'
                  ? `${filterDateFrom || '…'} → ${filterDateTo || '…'}`
                  : (
                      {
                        this_month: t('realExpenses.filters.dateThisMonth'),
                        last_month: t('realExpenses.filters.dateLastMonth'),
                        last_3: t('realExpenses.filters.dateLast3'),
                        last_6: t('realExpenses.filters.dateLast6'),
                        this_year: t('realExpenses.filters.dateThisYear'),
                      } as Record<string, string>
                    )[filterPreset]}
              </Chip>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: T.accent }}>
              {filteredCount === 1
                ? t('realExpenses.filters.resultsOne')
                : t('realExpenses.filters.resultsMany', { n: filteredCount })}
            </span>
            <button
              onClick={clearAllFilters}
              style={{
                padding: '0.25rem 0.625rem', borderRadius: '0.5rem',
                border: `1px solid ${T.accent}44`, background: T.cardBg,
                color: T.accent, fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer',
              }}
            >
              {t('realExpenses.filters.clearAll')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Chip reutilizable interno
function Chip({
  T, children, onRemove,
}: {
  T: Theme;
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
        padding: '0.2rem 0.5rem', borderRadius: '9999px',
        background: T.cardBg, border: `1px solid ${T.accent}44`,
        fontSize: '0.68rem', fontWeight: 700, color: T.accent,
      }}
    >
      {children}
      <button
        onClick={onRemove}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: T.accent, padding: 0, lineHeight: 1, fontSize: '0.7rem',
        }}
      >
        ✕
      </button>
    </span>
  );
}
