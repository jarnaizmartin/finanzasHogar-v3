import { useState, useMemo, useRef } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { useTranslation } from 'react-i18next';
import { CoachMark } from '../components/CoachMark';
import { useCoachMark } from '../components/useCoachMark';
import { StickyCompactBar } from '../components/StickyCompactBar';
import { useScrollPosition } from '../hooks/useScrollPosition';
import { Plus } from 'lucide-react';
import { useApp } from '../AppContext';
import { useToast } from '../contexts/ToastContext';
import type { Projection } from '../types';
import { FREQUENCIES, fmt, today, convertAmount } from '../utils';
import {
  ConfirmModal,
  PrimaryBtn,
  PrintButton,
  PrintHeader,
  PrintFooter,
} from '../components/UI';
import { FirstWinToast } from '../components/FirstWinToast';
import {
  buildEmptyProjectionForm,
  validateProjectionForm,
  buildProjectionEntry,
  projectionToForm,
  shouldOpenAdvancedOnEdit,
  type ProjectionForm,
} from '../lib/projectionsForm';
import {
  filterAndSortProjections,
  calcProjectionGlobalStats,
  calcTopProjectedExpenses,
} from '../lib/projectionsStats';
import { ProjectionListItem } from '../components/ProjectionListItem';
import { ProjectionFormModal } from '../components/ProjectionFormModal';
import { ProjectionAnalysisView } from '../components/ProjectionAnalysisView';

const uid = () => crypto.randomUUID();

export function Projections() {
  const { t } = useTranslation();
  const {
    T,
    projections,
    setProjections,
    categories,
    accounts,
    displayCurrency,
    baseCurrency,
    rates,
    dateFormat,
    setTab,
    forecastAll,
    projFilterType,
    setProjFilterType,
    projFilterAccount,
    setProjFilterAccount,
    projSortBy,
    setProjSortBy,
    deleteProjection,
  } = useApp();

  const toast = useToast();
  const isMobile = useIsMobile();

  // ── Coach Mark ────────────────────────────────────────────────────────────
  const { seen: coachSeen, markSeen: coachMarkSeen } =
    useCoachMark('projections');
  const coachRef = useRef<HTMLDivElement>(null);

  // ── Sticky compact bar ────────────────────────────────────────────────────
  const stickyBarSentinelRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // ── Estado ────────────────────────────────────────────────────────────────
  const [modal, setModal] = useState<null | 'add' | string>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFirstWin, setShowFirstWin] = useState(false);
  const [view, setView] = useState<'list' | 'analysis'>(
    () =>
      (localStorage.getItem('fh_view_projections') as 'list' | 'analysis') ??
      'list'
  );

  const filterType = projFilterType;
  const setFilterType = setProjFilterType;
  const filterAccount = projFilterAccount;
  const setFilterAccount = setProjFilterAccount;
  const sortBy = projSortBy;
  const setSortBy = setProjSortBy;

  // ── Form vacío con avisos por defecto ────────────────────────────────────
const buildEmptyForm = (): ProjectionForm =>
  buildEmptyProjectionForm({
    baseCurrency,
    defaultAccountId: accounts[0]?.id ?? '',
    todayStr: today(),
  });

  const [form, setForm] = useState<ProjectionForm>(buildEmptyForm);

  // ── Validación ───────────────────────────────────────────────────────────
  const validate = () => validateProjectionForm(form);

  // ── Guardar ──────────────────────────────────────────────────────────────
  const save = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const existingProj =
      modal !== 'add' ? projections.find((p) => p.id === modal) : undefined;
    const isFirstProjection = modal === 'add' && projections.length === 0;

    const entry = buildProjectionEntry({
      form,
      mode: modal!,
      existingProj,
      newId: uid(),
      now: new Date(),
    });

    if (modal === 'add') {
      setProjections((p) => [...p, entry]);
      toast(t('projections.toastCreated'), 'success');
    } else {
      setProjections((p) =>
        p.map((x) => (x.id === modal ? { ...x, ...entry } : x))
      );
      toast(t('projections.toastUpdated'), 'success');
    }
    setModal(null);
    setForm(buildEmptyForm());
    setErrors({});
    setShowAdvanced(false);
    if (isFirstProjection) setShowFirstWin(true);
  };

  // ── Abrir / Editar ───────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(buildEmptyForm());
    setErrors({});
    setShowAdvanced(false);
    setModal('add');
  };

  const openEdit = (proj: Projection) => {
    setForm(projectionToForm(proj, baseCurrency, accounts[0]?.id ?? ''));
    setErrors({});
    setShowAdvanced(shouldOpenAdvancedOnEdit(proj));
    setModal(proj.id);
  };

  const duplicate = (proj: Projection) => {
    const newProj = { ...proj, id: uid(), name: t('projections.duplicateSuffix', { name: proj.name }) };
    setProjections((p) => [...p, newProj]);
    toast(t('projections.toastDuplicated'), 'success');
  };

  const toggleActive = (id: string) => {
    setProjections((p) =>
      p.map((x) => (x.id === id ? { ...x, active: !(x.active ?? true) } : x))
    );
  };

  // ── Filtrado y stats (delegado a src/lib/projectionsStats) ───────────────
  const filtered = useMemo(
    () => filterAndSortProjections(projections, filterType, filterAccount, sortBy),
    [projections, filterType, filterAccount, sortBy]
  );

  const scrollPosition = useScrollPosition(listContainerRef, filtered.length);

  const globalStats = useMemo(
    () =>
      calcProjectionGlobalStats(projections, displayCurrency, rates, baseCurrency),
    [projections, displayCurrency, rates, baseCurrency]
  );

  const printSubtitle = useMemo(() => {
    const parts: string[] = [];
    if (filterType !== 'all')
      parts.push(filterType === 'income' ? t('projections.print.subtitleTypeIncome') : t('projections.print.subtitleTypeExpense'));
    if (filterAccount !== 'all') {
      const acc = accounts.find((a) => a.id === filterAccount);
      if (acc) parts.push(t('projections.print.subtitleAccount', { name: acc.name }));
    }
    parts.push(t('projections.print.subtitleCount', { active: globalStats.active, total: globalStats.total, count: globalStats.total }));
    return parts.join(' · ');
  }, [filterType, filterAccount, accounts, globalStats.active, globalStats.total, t]);

  const topProjectedExpenses = useMemo(
    () => calcTopProjectedExpenses(projections, categories),
    [projections, categories]
  );

  return (
    <div className="fh-print-section">
      <PrintHeader title={t('projections.print.title')} subtitle={printSubtitle} />

      {/* ── Cabecera ── */}
      <div
        className="fh-no-print"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '2rem',
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
            {t('projections.overline')}
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
            {t('projections.print.title')}
          </h2>
          <p
            style={{ fontSize: '0.9rem', color: T.muted, marginTop: '0.4rem' }}
          >
            {t('projections.subtitle')}
          </p>
        </div>
        <div
          className="fh-no-print"
          style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}
        >
          <PrintButton
            T={T}
            documentTitle={t('projections.print.title')}
            sectionTitle={t('projections.print.title')}
            subtitle={printSubtitle}
          />
          <PrimaryBtn onClick={openAdd}>
            <Plus size={15} />
            {t('projections.newBtn')}
          </PrimaryBtn>
        </div>
      </div>

      {/* ── Resumen global ── */}
      <div
        ref={coachRef}
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '0.5rem' : '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {([
          {
            label: t('projections.stats.total'),
            value: `${globalStats.total}`,
            sub: t('projections.stats.activeSub', { n: globalStats.active }),
            color: T.accent,
            bg: T.accentLight,
            border: `${T.accent}33`,
          },
          {
            label: t('projections.stats.incomePerMonth'),
            value: fmt(
              globalStats.monthlyIncome,
              displayCurrency,
              displayCurrency,
              rates
            ),
            color: T.green,
            bg: T.greenBg,
            border: T.greenBorder,
          },
          {
            label: t('projections.stats.expensePerMonth'),
            value: fmt(
              globalStats.monthlyExpense,
              displayCurrency,
              displayCurrency,
              rates
            ),
            color: T.red,
            bg: T.redBg ?? T.amberBg,
            border: T.redBorder ?? T.amberBorder,
          },
          {
            label: t('projections.stats.netPerMonth'),
            value: fmt(
              Math.abs(globalStats.monthlyNet),
              displayCurrency,
              displayCurrency,
              rates
            ),
            prefix: globalStats.monthlyNet >= 0 ? '+' : '-',
            color: globalStats.monthlyNet >= 0 ? T.green : T.red,
            bg: globalStats.monthlyNet >= 0 ? T.greenBg : T.redBg ?? T.amberBg,
            border:
              globalStats.monthlyNet >= 0
                ? T.greenBorder
                : T.redBorder ?? T.amberBorder,
          },
        ] as Array<{ label: string; value: string; color: string; bg: string; border: string; prefix?: string; sub?: string }>).map((item) => (
          <div
            key={item.label}
            style={{
              padding: isMobile ? '0.625rem 0.625rem' : '1rem 1.25rem',
              borderRadius: '1rem',
              background: item.bg,
              border: `1px solid ${item.border}`,
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: isMobile ? '0.55rem' : '0.68rem',
                fontWeight: 700,
                color: item.color,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.2rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: isMobile ? '0.875rem' : '1.1rem',
                fontWeight: 800,
                color: item.color,
                letterSpacing: '-0.02em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.prefix ?? ''}
              {item.value}
            </div>
            {item.sub && (
              <div
                style={{
                  fontSize: '0.62rem',
                  color: item.color,
                  opacity: 0.7,
                  marginTop: '0.2rem',
                }}
              >
                {item.sub}
              </div>
            )}
          </div>
        ))}
        </div>
  
        {/* 🎯 Sentinel — dispara la barra compacta sticky al hacer scroll */}
        <div ref={stickyBarSentinelRef} style={{ height: 1 }} />
  
        {/* ── Barra compacta sticky ── */}
        <StickyCompactBar
        title={t('projections.stickyTitle')}
        sentinelRef={stickyBarSentinelRef}
        spread
        twoRowsMobile
        filterInfo={{
          visible: filtered.length,
          total: projections.length,
          itemLabel: t('projections.itemLabel'),
          currentPosition: scrollPosition,
        }}
          kpis={[
            {
              label: t('projections.stats.total'),
              icon: '📋',
              value: t('projections.stats.activeCountLabel', { total: globalStats.total, active: globalStats.active }),
              color: T.accent,
            },
            {
              label: t('projections.stats.incomePerMonth'),
              icon: '↑',
              value: fmt(globalStats.monthlyIncome, displayCurrency, displayCurrency, rates),
              color: T.green,
            },
            {
              label: t('projections.stats.expensePerMonth'),
              icon: '↓',
              value: fmt(globalStats.monthlyExpense, displayCurrency, displayCurrency, rates),
              color: T.red,
            },
            {
              label: t('projections.stats.netPerMonth'),
              icon: '=',
              value: `${globalStats.monthlyNet >= 0 ? '+' : '-'}${fmt(
                Math.abs(globalStats.monthlyNet),
                displayCurrency,
                displayCurrency,
                rates
              )}`,
              color: globalStats.monthlyNet >= 0 ? T.green : T.red,
            },
          ]}
          rightSlot={
            <>
              {/* Subtabs Lista/Análisis compactos */}
              <div
                style={{
                  display: 'inline-flex',
                  borderRadius: '0.625rem',
                  border: `1px solid ${T.cardBorder}`,
                  padding: '0.15rem',
                  background: T.pageBg,
                }}
              >
                {([
                  ['list', '📋'],
                  ['analysis', '📊'],
                ] as const).map(([val, icon]) => (
                  <button
                    key={val}
                    onClick={() => {
                      setView(val);
                      localStorage.setItem('fh_view_projections', val);
                    }}
                    title={val === 'list' ? t('common.viewList') : t('common.viewAnalysis')}
                    style={{
                      padding: '0.3rem 0.55rem',
                      borderRadius: '0.4rem',
                      border: 'none',
                      background: view === val ? T.accent : 'transparent',
                      color: view === val ? '#fff' : T.muted,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      lineHeight: 1,
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              {/* Botón "+ Nueva proyección" compacto */}
              <button
                onClick={openAdd}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: T.accent,
                  color: '#fff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <Plus size={13} /> {t('common.new')}
              </button>
            </>
          }
        />
  
        {/* ── Sub-tabs ── */}
        <div
          className="fh-no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              borderRadius: '0.875rem',
              border: `1.5px solid ${T.cardBorder}`,
              padding: '0.25rem',
              background: T.pageBg,
            }}
          >
            {(
              [
                ['list', '📋', t('common.viewList')],
                ['analysis', '📊', t('common.viewAnalysis')],
              ] as const
            ).map(([val, icon, label]) => (
              <button
              key={val}
              onClick={() => {
                setView(val);
                localStorage.setItem('fh_view_projections', val);
              }}
              style={{
                padding: '0.5rem 1.125rem',
                borderRadius: '0.625rem',
                border: 'none',
                background: view === val ? T.accent : 'transparent',
                color: view === val ? '#fff' : T.muted,
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>
        {view === 'analysis' && (
          <span style={{ fontSize: '0.75rem', color: T.muted }}>
            {t('projections.analysisSubtitle')}
          </span>
        )}
      </div>

      {view === 'list' && (
        <>
          {/* Filtros */}
          {projections.length > 0 && (
            <div
              className="fh-no-print"
              style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                {(['all', 'income', 'expense'] as const).map((filterVal) => (
                  <button
                    key={filterVal}
                    onClick={() => setFilterType(filterVal)}
                    style={{
                      padding: '0.45rem 0.875rem',
                      borderRadius: '9999px',
                      border: `1.5px solid ${
                        filterType === filterVal ? T.accent : T.cardBorder
                      }`,
                      background: filterType === filterVal ? T.accentLight : T.pageBg,
                      color: filterType === filterVal ? T.accent : T.muted,
                      fontSize: '0.775rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {filterVal === 'all'
                      ? t('common.all')
                      : filterVal === 'income'
                      ? `📈 ${t('realExpenses.stats.income')}`
                      : `📉 ${t('realExpenses.stats.expense')}`}
                  </button>
                ))}
              </div>

              {accounts.length > 1 && (
                <select
                  value={filterAccount}
                  onChange={(e) => setFilterAccount(e.target.value)}
                  style={{
                    padding: '0.45rem 0.875rem',
                    borderRadius: '9999px',
                    border: `1.5px solid ${T.cardBorder}`,
                    background: T.pageBg,
                    color: T.muted,
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="all">{t('projections.filters.accountAll')}</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'date' | 'amount' | 'name')
                }
                style={{
                  padding: '0.45rem 0.875rem',
                  borderRadius: '9999px',
                  border: `1.5px solid ${T.cardBorder}`,
                  background: T.pageBg,
                  color: T.muted,
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  marginLeft: 'auto',
                }}
              >
                <option value="date">{t('projections.filters.sortByDate')}</option>
                <option value="amount">{t('projections.filters.sortByAmount')}</option>
                <option value="name">{t('projections.filters.sortByName')}</option>
              </select>
            </div>
          )}

          {/* Lista de proyecciones */}
          {filtered.length > 0 ? (
            <div
              ref={listContainerRef}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem',
              }}
            >
              {filtered.map((proj) => {
                const cat = categories.find((c) => c.id === proj.categoryId);
                const acc = accounts.find((a) => a.id === proj.accountId);
                const toAcc = proj.toAccountId
                  ? accounts.find((a) => a.id === proj.toAccountId) ?? null
                  : null;
                const freq = FREQUENCIES.find((f) => f.value === proj.frequency);
                const monthlyAmt = convertAmount(
                  proj.amount / (freq?.months ?? 1),
                  proj.currency ?? baseCurrency,
                  displayCurrency,
                  rates
                );
                const isExpanded = expandedId === proj.id;

                return (
                  <ProjectionListItem
                    key={proj.id}
                    proj={proj}
                    T={T}
                    cat={cat}
                    acc={acc}
                    toAcc={toAcc}
                    monthlyAmt={monthlyAmt}
                    isExpanded={isExpanded}
                    isMobile={isMobile}
                    baseCurrency={baseCurrency}
                    displayCurrency={displayCurrency}
                    rates={rates}
                    dateFormat={dateFormat}
                    onToggleExpand={() =>
                      setExpandedId(isExpanded ? null : proj.id)
                    }
                    onDuplicate={() => duplicate(proj)}
                    onEdit={() => openEdit(proj)}
                    onDelete={() => setConfirmDelete(proj.id)}
                    onToggleActive={() => toggleActive(proj.id)}
                  />
                );
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '6rem 2rem',
                color: T.muted,
              }}
            >
              <div
                style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.4 }}
              >
                📊
              </div>
              <p
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 800,
                  color: T.title,
                  marginBottom: '0.5rem',
                }}
              >
                {projections.length === 0
                  ? t('projections.empty.noProjections')
                  : t('projections.empty.noResults')}
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: T.muted,
                  marginBottom: '1.5rem',
                  maxWidth: '28rem',
                  margin: '0 auto 1.5rem',
                }}
              >
                {projections.length === 0
                  ? t('projections.empty.bodyDefault')
                  : t('projections.empty.bodyFiltered')}
              </p>
              {/* Empty state que enseña: filas de ejemplo de un plan.
                  Ver 12_ONBOARDING_REDESIGN.md §5.E. */}
              {projections.length === 0 && (
                <div
                  style={{
                    maxWidth: '22rem',
                    margin: '0 auto 1.75rem',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: T.muted,
                      marginBottom: '0.75rem',
                    }}
                  >
                    {t('projections.empty.exampleTitle')}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      opacity: 0.6,
                    }}
                  >
                    {([
                      { key: 'salary', emoji: '💼', amount: 2500, income: true },
                      { key: 'housing', emoji: '🏠', amount: -900, income: false },
                      { key: 'subscriptions', emoji: '📺', amount: -45, income: false },
                    ] as const).map((row) => (
                      <div
                        key={row.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.625rem 0.875rem',
                          borderRadius: '0.75rem',
                          background: T.cardBg,
                          border: `1px dashed ${T.cardBorder}`,
                        }}
                      >
                        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>
                          {row.emoji}
                        </span>
                        <span
                          style={{
                            flex: 1,
                            fontSize: '0.825rem',
                            fontWeight: 600,
                            color: T.title,
                            textAlign: 'left',
                          }}
                        >
                          {t(`onboarding.defaultCategories.${row.key}`)}
                        </span>
                        <span
                          style={{
                            fontSize: '0.825rem',
                            fontWeight: 800,
                            color: row.income ? T.green : T.red,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.income ? '+' : ''}
                          {fmt(row.amount, displayCurrency, baseCurrency, rates)}
                          <span style={{ color: T.muted, fontWeight: 600 }}>
                            {t('projections.empty.perMonth')}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {projections.length === 0 && (
                <PrimaryBtn onClick={openAdd}>
                  <Plus size={15} />
                  {t('projections.empty.addFirstBtn')}
                </PrimaryBtn>
              )}
            </div>
          )}
        </>
      )}

      {view === 'analysis' && (
        <ProjectionAnalysisView
          T={T}
          hasProjections={projections.length > 0}
          forecastAll={forecastAll}
          topProjectedExpenses={topProjectedExpenses}
          displayCurrency={displayCurrency}
          baseCurrency={baseCurrency}
          rates={rates}
          onGoToList={() => setView('list')}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ✨ MODAL REDISEÑADO — Smart Form en 3 zonas                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Modal crear / editar proyección */}
      {modal && (
        <ProjectionFormModal
          mode={modal}
          T={T}
          form={form}
          setForm={setForm}
          errors={errors}
          setErrors={setErrors}
          showAdvanced={showAdvanced}
          setShowAdvanced={setShowAdvanced}
          accounts={accounts}
          categories={categories}
          dateFormat={dateFormat}
          onSave={save}
          onClose={() => {
            setModal(null);
            setErrors({});
            setShowAdvanced(false);
          }}
        />
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <ConfirmModal
          T={T}
          title={t('projections.confirm.deleteTitle')}
          message={t('projections.confirm.deleteMsg', { name: projections.find((p) => p.id === confirmDelete)?.name ?? '' })}
          onConfirm={() => {
            deleteProjection(confirmDelete);
            toast(t('projections.toastDeleted'), 'success');
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Coach Mark */}
      {!coachSeen && (
        <CoachMark
          targetRef={coachRef}
          title={t('projections.coach.title')}
          description={t('projections.coach.description')}
          onDismiss={coachMarkSeen}
          accentColor="#7c3aed"
        />
      )}

      {showFirstWin && (
        <FirstWinToast
          type="projection"
          onDone={() => {
            setShowFirstWin(false);
            localStorage.setItem('fh_setup_highlight', 'true');
            setTab('dashboard');
          }}
        />
      )}

      <PrintFooter section={t('projections.print.title')} />
    </div>
  );
}
