import { useState, useMemo, useRef, useEffect, type ChangeEvent } from 'react';
import { useCoachMark, CoachMark } from '../components/CoachMark';
import { StickyCompactBar } from '../components/StickyCompactBar';
import { useScrollPosition } from '../hooks/useScrollPosition';
import { createPortal } from 'react-dom';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Bell,
  BellOff,
} from 'lucide-react';
import { useApp } from '../AppContext';
import { useToast } from '../contexts/ToastContext';
import type { Projection } from '../types';
import {
  CURRENCIES,
  FREQUENCIES,
  fmt,
  today,
  fmtDateShort,
  fmtDateDMY,
  syncEndDateDay,
  convertAmount,
} from '../utils';
import {
  Card,
  ConfirmModal,
  Field,
  Input,
  Sel,
  PrimaryBtn,
  SecondaryBtn,
  GhostBtn,
  PrintButton,
  PrintHeader,
  PrintFooter,
  QuickCategoryModal,
} from '../components/UI';
import { FirstWinToast } from '../components/FirstWinToast';
import { getDefaultAlertWindow } from '../lib/projectionAlerts';
import {
  buildEmptyProjectionForm,
  validateProjectionForm,
  buildProjectionEntry,
  projectionToForm,
  shouldOpenAdvancedOnEdit,
  ALERT_WINDOW_PRESETS,
  type ProjectionForm,
} from '../lib/projectionsForm';
import {
  filterAndSortProjections,
  calcProjectionGlobalStats,
  buildPrintSubtitle as buildProjectionsPrintSubtitle,
  calcTopProjectedExpenses,
} from '../lib/projectionsStats';
import { ProjectionListItem } from '../components/ProjectionListItem';

const uid = () => crypto.randomUUID();

const FREQ_LABELS: Record<string, string> = {
  monthly: 'Mensual',
  bimonthly: 'Bimestral',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  biannual: 'Semestral',
  annual: 'Anual',
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  once: 'Una vez',
};

// ✨ F2.10 — Opciones del select de ventana de aviso

export function Projections() {
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
  } = useApp();

  const toast = useToast();

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
  const [showQuickCategory, setShowQuickCategory] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFirstWin, setShowFirstWin] = useState(false);
  const [forecastMonthOffset, setForecastMonthOffset] = useState(0);
  const [view, setView] = useState<'list' | 'analysis'>(
    () =>
      (localStorage.getItem('fh_view_projections') as 'list' | 'analysis') ??
      'list'
  );

  useEffect(() => {
    if (projections.length === 0) setForecastMonthOffset(0);
  }, [projections.length, view]);

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
      toast('Proyección creada correctamente', 'success');
    } else {
      setProjections((p) =>
        p.map((x) => (x.id === modal ? { ...x, ...entry } : x))
      );
      toast('Proyección actualizada correctamente', 'success');
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
    const newProj = { ...proj, id: uid(), name: `${proj.name} (copia)` };
    setProjections((p) => [...p, newProj]);
    toast('Proyección duplicada', 'success');
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

  const printSubtitle = useMemo(
    () =>
      buildProjectionsPrintSubtitle(filterType, filterAccount, accounts, {
        active: globalStats.active,
        total: globalStats.total,
      }),
    [filterType, filterAccount, accounts, globalStats.active, globalStats.total]
  );

  const topProjectedExpenses = useMemo(
    () => calcTopProjectedExpenses(projections, categories),
    [projections, categories]
  );

  // ── Cuando cambia frecuencia, actualizamos default de ventana de aviso ──
  // (solo si el usuario no ha tocado custom)
  useEffect(() => {
    if (form.alertWindowDays !== 'custom') {
      const def = getDefaultAlertWindow(form.frequency);
      if (
        ALERT_WINDOW_PRESETS.includes(def as any) &&
        form.alertWindowDays !== def
      ) {
        // Solo auto-ajustamos si el usuario no estaba en un preset distinto explícito.
        // Para no ser invasivos: NO cambiamos si ya hay valor custom seleccionado.
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.frequency]);

  return (
    <div className="fh-print-section">
      <PrintHeader title="Proyecciones" subtitle={printSubtitle} />

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
            Planificación
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
            Proyecciones
          </h2>
          <p
            style={{ fontSize: '0.9rem', color: T.muted, marginTop: '0.4rem' }}
          >
            Ingresos y gastos recurrentes previstos
          </p>
        </div>
        <div
          className="fh-no-print"
          style={{ display: 'flex', gap: '0.75rem' }}
        >
          <PrintButton
            T={T}
            documentTitle="Proyecciones"
            sectionTitle="Proyecciones"
            subtitle={printSubtitle}
          />
          <PrimaryBtn onClick={openAdd}>
            <Plus size={15} />
            Nueva proyección
          </PrimaryBtn>
        </div>
      </div>

      {/* ── Resumen global ── */}
      <div
        ref={coachRef}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {[
          {
            label: 'Total proyecciones',
            value: `${globalStats.total}`,
            sub: `${globalStats.active} activas`,
            color: T.accent,
            bg: T.accentLight,
            border: `${T.accent}33`,
          },
          {
            label: 'Ingresos/mes',
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
            label: 'Gastos/mes',
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
            label: 'Neto/mes',
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
        ].map((item) => (
          <div
            key={item.label}
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '1rem',
              background: item.bg,
              border: `1px solid ${item.border}`,
            }}
          >
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: item.color,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.35rem',
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: item.color,
                letterSpacing: '-0.02em',
              }}
            >
              {(item as any).prefix ?? ''}
              {item.value}
            </div>
            {(item as any).sub && (
              <div
                style={{
                  fontSize: '0.68rem',
                  color: item.color,
                  opacity: 0.7,
                  marginTop: '0.2rem',
                }}
              >
                {(item as any).sub}
              </div>
            )}
          </div>
        ))}
        </div>
  
        {/* 🎯 Sentinel — dispara la barra compacta sticky al hacer scroll */}
        <div ref={stickyBarSentinelRef} style={{ height: 1 }} />
  
        {/* ── Barra compacta sticky ── */}
        <StickyCompactBar
        title="📊 Proyecciones - Resumen"
        sentinelRef={stickyBarSentinelRef}
        filterInfo={{
          visible: filtered.length,
          total: projections.length,
          itemLabel: 'proyecciones',
          currentPosition: scrollPosition,
        }}
          kpis={[
            {
              label: 'Total proyecciones',
              icon: '📋',
              value: `${globalStats.total} (${globalStats.active} activas)`,
              color: T.accent,
            },
            {
              label: 'Ingresos/mes',
              icon: '↑',
              value: fmt(globalStats.monthlyIncome, displayCurrency, displayCurrency, rates),
              color: T.green,
            },
            {
              label: 'Gastos/mes',
              icon: '↓',
              value: fmt(globalStats.monthlyExpense, displayCurrency, displayCurrency, rates),
              color: T.red,
            },
            {
              label: 'Neto/mes',
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
                    title={val === 'list' ? 'Lista' : 'Análisis'}
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
                <Plus size={13} /> Nueva
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
                ['list', '📋', 'Lista'],
                ['analysis', '📊', 'Análisis'],
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
            Previsión y distribución proyectada
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
                {(['all', 'income', 'expense'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    style={{
                      padding: '0.45rem 0.875rem',
                      borderRadius: '9999px',
                      border: `1.5px solid ${
                        filterType === t ? T.accent : T.cardBorder
                      }`,
                      background: filterType === t ? T.accentLight : T.pageBg,
                      color: filterType === t ? T.accent : T.muted,
                      fontSize: '0.775rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {t === 'all'
                      ? 'Todos'
                      : t === 'income'
                      ? '📈 Ingresos'
                      : '📉 Gastos'}
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
                  <option value="all">Todas las cuentas</option>
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
                <option value="date">Ordenar por fecha</option>
                <option value="amount">Ordenar por importe</option>
                <option value="name">Ordenar por nombre</option>
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
                  proj.amount * (freq?.factor ?? 1),
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
                  ? 'Todavía no tienes proyecciones'
                  : 'No hay proyecciones con estos filtros'}
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
                  ? 'Añade ingresos y gastos recurrentes para ver la proyección de tus finanzas.'
                  : 'Prueba a cambiar los filtros.'}
              </p>
              {projections.length === 0 && (
                <PrimaryBtn onClick={openAdd}>
                  <Plus size={15} />
                  Crear primera proyección
                </PrimaryBtn>
              )}
            </div>
          )}
        </>
      )}

      {/* Vista Análisis (sin cambios) */}
      {view === 'analysis' && (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          {projections.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '5rem 2rem',
                color: T.muted,
              }}
            >
              <div
                style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}
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
                Aún no hay proyecciones para analizar
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: T.muted,
                  marginBottom: '1.5rem',
                }}
              >
                Crea algunas proyecciones primero y aquí verás el análisis
                completo.
              </p>
              <button
                onClick={() => setView('list')}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: '0.875rem',
                  border: 'none',
                  background: T.accent,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Ir a la lista →
              </button>
            </div>
          ) : (
            <>
              {(() => {
                const d = new Date();
                d.setDate(1);
                d.setMonth(d.getMonth() + forecastMonthOffset);
                const raw = d.toLocaleDateString('es-ES', {
                  month: 'long',
                  year: 'numeric',
                });
                const label = raw.charAt(0).toUpperCase() + raw.slice(1);
                const maxOffset = Math.max(0, forecastAll.length - 6);
                return (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '1rem',
                      padding: '0.625rem 1rem',
                      borderRadius: '0.875rem',
                      background: T.accentLight,
                      border: `1px solid ${T.accent}33`,
                    }}
                  >
                    <button
                      onClick={() =>
                        setForecastMonthOffset((o) => Math.max(0, o - 1))
                      }
                      disabled={forecastMonthOffset <= 0}
                      style={{
                        padding: '0.35rem 0.875rem',
                        borderRadius: '0.625rem',
                        border: `1px solid ${T.accent}44`,
                        background: T.cardBg,
                        color: forecastMonthOffset <= 0 ? T.muted : T.accent,
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        cursor:
                          forecastMonthOffset <= 0 ? 'default' : 'pointer',
                        opacity: forecastMonthOffset <= 0 ? 0.35 : 1,
                      }}
                    >
                      ←
                    </button>
                    <span
                      style={{
                        fontSize: '0.925rem',
                        fontWeight: 800,
                        color: T.accent,
                        textTransform: 'capitalize',
                        minWidth: '13rem',
                        textAlign: 'center',
                      }}
                    >
                      {label}
                    </span>
                    <button
                      onClick={() =>
                        setForecastMonthOffset((o) =>
                          Math.min(maxOffset, o + 1)
                        )
                      }
                      disabled={forecastMonthOffset >= maxOffset}
                      style={{
                        padding: '0.35rem 0.875rem',
                        borderRadius: '0.625rem',
                        border: `1px solid ${T.accent}44`,
                        background: T.cardBg,
                        color:
                          forecastMonthOffset >= maxOffset ? T.muted : T.accent,
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        cursor:
                          forecastMonthOffset >= maxOffset
                            ? 'default'
                            : 'pointer',
                        opacity: forecastMonthOffset >= maxOffset ? 0.35 : 1,
                      }}
                    >
                      →
                    </button>
                  </div>
                );
              })()}

              <Card T={T} style={{ overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 1.75rem 1rem' }}>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: T.muted,
                      textTransform: 'uppercase',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Proyección global
                  </div>
                  <div
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 800,
                      color: T.title,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Previsión a 6 meses — Todas las cuentas
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '0.85rem',
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: T.tableHead,
                          borderBottom: `1px solid ${T.tableBorder}`,
                        }}
                      >
                        {[
                          'Mes',
                          'Ingresos',
                          'Gastos',
                          'Neto',
                          'Saldo est.',
                        ].map((h, i) => (
                          <th
                            key={h}
                            style={{
                              padding: '0.75rem 1.25rem',
                              textAlign: i === 0 ? 'left' : 'right',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              color: T.muted,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {forecastAll
                        .slice(forecastMonthOffset, forecastMonthOffset + 6)
                        .map((m, i) => (
                          <tr
                            key={m.key}
                            style={{
                              background:
                                i % 2 === 0 ? T.tableRow : T.tableRowAlt,
                              borderBottom: `1px solid ${T.tableBorder}`,
                            }}
                          >
                            <td
                              style={{
                                padding: '0.75rem 1.25rem',
                                fontWeight: 700,
                                color: T.title,
                                textTransform: 'capitalize',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {m.label}
                            </td>
                            <td
                              style={{
                                padding: '0.75rem 1.25rem',
                                textAlign: 'right',
                                fontWeight: 700,
                                color: T.green,
                              }}
                            >
                              {fmt(
                                m.income,
                                displayCurrency,
                                baseCurrency,
                                rates
                              )}
                            </td>
                            <td
                              style={{
                                padding: '0.75rem 1.25rem',
                                textAlign: 'right',
                                fontWeight: 700,
                                color: T.red,
                              }}
                            >
                              {fmt(
                                m.expense,
                                displayCurrency,
                                baseCurrency,
                                rates
                              )}
                            </td>
                            <td
                              style={{
                                padding: '0.75rem 1.25rem',
                                textAlign: 'right',
                                fontWeight: 700,
                                color: m.net >= 0 ? T.green : T.red,
                              }}
                            >
                              {m.net >= 0 ? '+' : ''}
                              {fmt(m.net, displayCurrency, baseCurrency, rates)}
                            </td>
                            <td
                              style={{
                                padding: '0.75rem 1.25rem',
                                textAlign: 'right',
                                fontWeight: 800,
                                color: T.accent,
                              }}
                            >
                              {fmt(
                                m.runningBalance,
                                displayCurrency,
                                baseCurrency,
                                rates
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {topProjectedExpenses.length > 0 && (
                <Card T={T}>
                  <div style={{ padding: '1.5rem 1.75rem 1rem' }}>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        color: T.muted,
                        textTransform: 'uppercase',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Distribución
                    </div>
                    <div
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: 800,
                        color: T.title,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      Gastos proyectados por categoría
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '0 1.75rem 1.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    {topProjectedExpenses.map(({ cat, val }) => {
                      const maxVal = Math.max(
                        ...topProjectedExpenses.map((x) => x.val),
                        1
                      );
                      return (
                        <div key={cat!.id}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '0.4rem',
                            }}
                          >
                            <span
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.825rem',
                                fontWeight: 600,
                                color: T.body,
                              }}
                            >
                              <span
                                style={{
                                  width: '0.625rem',
                                  height: '0.625rem',
                                  borderRadius: '50%',
                                  background: cat!.color,
                                  display: 'inline-block',
                                  flexShrink: 0,
                                }}
                              />
                              {cat!.name}
                            </span>
                            <span
                              style={{
                                fontSize: '0.825rem',
                                fontWeight: 700,
                                color: T.title,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {fmt(val, displayCurrency, baseCurrency, rates)}
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  color: T.muted,
                                  fontWeight: 400,
                                }}
                              >
                                /mes
                              </span>
                            </span>
                          </div>
                          <div
                            style={{
                              height: '0.375rem',
                              borderRadius: '9999px',
                              background: T.pageBg,
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                borderRadius: '9999px',
                                background: cat!.color,
                                width: `${(val / maxVal) * 100}%`,
                                transition: 'width 0.5s ease',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ✨ MODAL REDISEÑADO — Smart Form en 3 zonas                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {modal &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: T.cardBg,
                border: `1px solid ${T.cardBorder}`,
                borderRadius: '1.25rem',
                boxShadow: T.cardShadowLg,
                width: '100%',
                maxWidth: '32rem',
                maxHeight: '92vh',
                overflowY: 'auto',
                animation: 'fadeSlideIn 0.2s ease both',
              }}
            >
              {/* HEADER */}
              <div
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  padding: '1rem 1.25rem',
                  borderBottom: `1px solid ${T.cardBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  background: T.cardBg,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 800,
                      color: T.title,
                      letterSpacing: '-0.02em',
                      margin: 0,
                    }}
                  >
                    {modal === 'add' ? 'Nueva proyección' : 'Editar proyección'}
                  </h2>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: T.muted,
                      marginTop: '0.15rem',
                    }}
                  >
                    Planifica un ingreso, gasto o traspaso recurrente
                  </p>
                </div>
                <button
                  onClick={() => {
                    setModal(null);
                    setErrors({});
                    setShowAdvanced(false);
                  }}
                  style={{
                    padding: '0.4rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: T.btnSecBg,
                    color: T.muted,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* BODY */}
              <div
                style={{
                  padding: '1rem 1.25rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                }}
              >
                {/* TIPO */}
                <div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: T.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Tipo
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.4rem',
                    }}
                  >
                    {[
                      {
                        val: 'income' as const,
                        icon: <TrendingUp size={14} />,
                        label: 'Ingreso',
                        color: T.green,
                        bg: T.greenBg,
                      },
                      {
                        val: 'expense' as const,
                        icon: <TrendingDown size={14} />,
                        label: 'Gasto',
                        color: T.red,
                        bg: T.redBg ?? T.amberBg,
                      },
                      {
                        val: 'transfer' as const,
                        icon: <ArrowLeftRight size={14} />,
                        label: 'Traspaso',
                        color: T.accent,
                        bg: T.accentLight,
                      },
                    ].map(({ val, icon, label, color, bg }) => {
                      const selected = form.type === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              type: val,
                              categoryId: '',
                              toAccountId:
                                val !== 'transfer' ? '' : f.toAccountId,
                            }))
                          }
                          style={{
                            padding: '0.55rem 0.5rem',
                            borderRadius: '0.625rem',
                            cursor: 'pointer',
                            border: `1.5px solid ${
                              selected ? color : T.cardBorder
                            }`,
                            background: selected ? bg : T.pageBg,
                            color: selected ? color : T.muted,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            transition: 'all 0.15s',
                          }}
                        >
                          {icon}
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* NOMBRE */}
                <Field label="Nombre" error={errors.name}>
                  <Input
                    T={T}
                    error={errors.name}
                    placeholder="Ej: Alquiler mensual"
                    value={form.name}
                    autoFocus
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setForm((f) => ({ ...f, name: e.target.value }));
                      setErrors((er) => ({ ...er, name: undefined as any }));
                    }}
                  />
                </Field>

                {/* IMPORTE + DIVISA */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 7rem',
                    gap: '0.625rem',
                  }}
                >
                  <Field label="Importe" error={errors.amount}>
                    <Input
                      T={T}
                      error={errors.amount}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setForm((f) => ({ ...f, amount: e.target.value }));
                        setErrors((er) => ({
                          ...er,
                          amount: undefined as any,
                        }));
                      }}
                    />
                  </Field>
                  <Field label="Divisa">
                    <Sel
                      T={T}
                      value={form.currency}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        setForm((f) => ({ ...f, currency: e.target.value }))
                      }
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.symbol} {c.code}
                        </option>
                      ))}
                    </Sel>
                  </Field>
                </div>

                {/* CUENTA(S) */}
                {form.type === 'transfer' ? (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.625rem',
                    }}
                  >
                    <Field label="Desde" error={errors.accountId}>
                      <Sel
                        T={T}
                        value={form.accountId}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                          setForm((f) => ({ ...f, accountId: e.target.value }));
                          setErrors((er) => ({
                            ...er,
                            accountId: undefined as any,
                          }));
                        }}
                      >
                        <option value="">— Cuenta origen —</option>
                        {accounts.map((a) => (
                          <option
                            key={a.id}
                            value={a.id}
                            disabled={a.id === form.toAccountId}
                          >
                            {a.name}
                          </option>
                        ))}
                      </Sel>
                    </Field>
                    <Field label="Hasta" error={errors.toAccountId}>
                      <Sel
                        T={T}
                        value={form.toAccountId}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                          setForm((f) => ({
                            ...f,
                            toAccountId: e.target.value,
                          }));
                          setErrors((er) => ({
                            ...er,
                            toAccountId: undefined as any,
                          }));
                        }}
                      >
                        <option value="">— Cuenta destino —</option>
                        {accounts.map((a) => (
                          <option
                            key={a.id}
                            value={a.id}
                            disabled={a.id === form.accountId}
                          >
                            {a.name}
                          </option>
                        ))}
                      </Sel>
                    </Field>
                  </div>
                ) : (
                  <Field label="Cuenta" error={errors.accountId}>
                    <Sel
                      T={T}
                      value={form.accountId}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                        setForm((f) => ({ ...f, accountId: e.target.value }));
                        setErrors((er) => ({
                          ...er,
                          accountId: undefined as any,
                        }));
                      }}
                    >
                      <option value="">— Selecciona una cuenta —</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </Sel>
                  </Field>
                )}

                {/* CATEGORÍA */}
                {form.type !== 'transfer' && (
                  <Field label="Categoría" error={errors.categoryId}>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <Sel
                          T={T}
                          value={form.categoryId}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                            setForm((f) => ({
                              ...f,
                              categoryId: e.target.value,
                            }));
                            setErrors((er) => ({
                              ...er,
                              categoryId: undefined as any,
                            }));
                          }}
                        >
                          <option value="">— Selecciona —</option>
                          {categories
                            .filter((c) => c.type === form.type)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                        </Sel>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowQuickCategory(true)}
                        title="Crear nueva categoría"
                        style={{
                          padding: '0.55rem 0.7rem',
                          borderRadius: '0.625rem',
                          border: `1.5px solid ${T.accent}44`,
                          background: T.accentLight,
                          color: T.accent,
                          fontSize: '1rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          flexShrink: 0,
                          lineHeight: 1,
                        }}
                      >
                        +
                      </button>
                    </div>
                    {categories.filter((c) => c.type === form.type).length ===
                      0 && (
                      <div
                        style={{
                          marginTop: '0.4rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '0.5rem',
                          background: T.amberBg,
                          border: `1px solid ${T.amberBorder}`,
                          fontSize: '0.72rem',
                          color: T.amber,
                          lineHeight: 1.4,
                        }}
                      >
                        ⚠️ No tienes categorías de{' '}
                        {form.type === 'income' ? 'ingresos' : 'gastos'}{' '}
                        todavía. Créala con <strong>+</strong>.
                      </div>
                    )}
                  </Field>
                )}

                {form.type !== 'transfer' && showQuickCategory && (
                  <QuickCategoryModal
                    T={T}
                    defaultType={form.type as 'income' | 'expense'}
                    onSave={(newCat) => {
                      setForm((f) => ({ ...f, categoryId: newCat.id }));
                      setShowQuickCategory(false);
                    }}
                    onClose={() => setShowQuickCategory(false)}
                  />
                )}

                {/* ZONA 2: CUÁNDO OCURRE */}
                <div
                  style={{
                    padding: '0.875rem',
                    borderRadius: '0.875rem',
                    border: `1.5px solid ${T.cardBorder}`,
                    background: T.pageBg,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: T.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    🗓️ Cuándo ocurre
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.625rem',
                    }}
                  >
                    <Field label="Frecuencia">
                      <Sel
                        T={T}
                        value={form.frequency}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                          setForm((f) => ({
                            ...f,
                            frequency: e.target.value,
                            alertWindowDays:
                              f.alertWindowDays === 'custom'
                                ? 'custom'
                                : getDefaultAlertWindow(e.target.value),
                          }))
                        }
                      >
                        {FREQUENCIES.map((f) => (
                          <option key={f.value} value={f.value}>
                            {FREQ_LABELS[f.value] ?? f.value}
                          </option>
                        ))}
                      </Sel>
                    </Field>
                    <Field label="Empieza el">
                      <Input
                        T={T}
                        type="date"
                        value={form.startDate}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const newStart = e.target.value;
                          setForm((f) => ({
                            ...f,
                            startDate: newStart,
                            endDate: f.endDate
                              ? syncEndDateDay(newStart, f.endDate)
                              : f.endDate,
                            recurringDay: f.isRecurring
                              ? new Date(newStart + 'T00:00:00').getDate()
                              : f.recurringDay,
                          }));
                        }}
                      />
                      {form.startDate && (
                        <p
                          style={{
                            fontSize: '0.7rem',
                            color: T.muted,
                            marginTop: '0.3rem',
                          }}
                        >
                          📅 {fmtDateDMY(form.startDate, dateFormat)}
                        </p>
                      )}
                    </Field>
                  </div>

                  <Field label="Termina el (opcional)" error={errors.endDate}>
                    <Input
                      T={T}
                      error={errors.endDate}
                      type="date"
                      value={form.endDate}
                      min={form.startDate}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const val = e.target.value;
                        const synced = val
                          ? syncEndDateDay(form.startDate, val)
                          : val;
                        setForm((f) => ({ ...f, endDate: synced }));
                        setErrors((er) => ({
                          ...er,
                          endDate: undefined as any,
                        }));
                      }}
                    />
                    {form.endDate && (
                      <p
                        style={{
                          fontSize: '0.7rem',
                          color: T.muted,
                          marginTop: '0.3rem',
                        }}
                      >
                        📅 {fmtDateDMY(form.endDate, dateFormat)}
                      </p>
                    )}
                  </Field>

                  {form.startDate && (
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: T.muted,
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        background: T.cardBg,
                        border: `1px solid ${T.cardBorder}`,
                      }}
                    >
                      📅 Día de cobro/pago:{' '}
                      <strong style={{ color: T.body }}>
                        día {new Date(form.startDate + 'T00:00:00').getDate()}
                      </strong>{' '}
                      de cada período
                    </div>
                  )}

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.625rem',
                      padding: '0.75rem',
                      borderRadius: '0.625rem',
                      background: form.isRecurring ? T.accentLight : T.cardBg,
                      border: `1.5px solid ${
                        form.isRecurring ? T.accent : T.cardBorder
                      }`,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.isRecurring}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          isRecurring: e.target.checked,
                        }))
                      }
                      style={{
                        width: '1.05rem',
                        height: '1.05rem',
                        cursor: 'pointer',
                        accentColor: T.accent,
                        flexShrink: 0,
                        marginTop: '0.1rem',
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: '0.825rem',
                          fontWeight: 700,
                          color: form.isRecurring ? T.accent : T.title,
                        }}
                      >
                        🔄 Es un cargo automático confirmado
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: T.muted,
                          marginTop: '0.15rem',
                          lineHeight: 1.4,
                        }}
                      >
                        La app lo registrará como movimiento real al vencer
                      </div>
                    </div>
                  </label>
                </div>

                {/* ZONA 3: MÁS OPCIONES */}
                <div
                  style={{
                    borderRadius: '0.875rem',
                    border: `1.5px solid ${
                      showAdvanced ? T.accent : T.cardBorder
                    }`,
                    overflow: 'hidden',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: showAdvanced ? T.accentLight : T.pageBg,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.825rem',
                          fontWeight: 700,
                          color: showAdvanced ? T.accent : T.title,
                        }}
                      >
                        ⚙️ Más opciones
                      </span>
                      {(form.notes ||
                        form.nextOverrideAmount ||
                        !form.alertEnabled) && (
                        <span
                          style={{
                            padding: '0.1rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            background: T.accent,
                            color: '#fff',
                          }}
                        >
                          {[
                            form.notes && 'Notas',
                            form.nextOverrideAmount && 'Ajuste mes',
                            !form.alertEnabled && 'Sin avisos',
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      )}
                    </div>
                    {showAdvanced ? (
                      <ChevronUp size={15} color={T.accent} />
                    ) : (
                      <ChevronDown size={15} color={T.muted} />
                    )}
                  </button>

                  {showAdvanced && (
                    <div
                      style={{
                        padding: '0.875rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.875rem',
                        borderTop: `1px solid ${T.cardBorder}`,
                      }}
                    >
                      {/* Notas */}
                      <Field label="📝 Notas">
                        <textarea
                          placeholder="Descripción opcional..."
                          value={form.notes}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, notes: e.target.value }))
                          }
                          rows={2}
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '0.625rem',
                            border: `1.5px solid ${T.inputBorder}`,
                            background: T.inputBg,
                            color: T.inputText,
                            fontSize: '0.825rem',
                            resize: 'vertical',
                            outline: 'none',
                            boxSizing: 'border-box',
                            fontFamily: 'inherit',
                          }}
                        />
                      </Field>

                      {/* Avisos */}
                      <div
                        style={{
                          padding: '0.875rem',
                          borderRadius: '0.75rem',
                          background: form.alertEnabled
                            ? T.accentLight
                            : T.pageBg,
                          border: `1.5px solid ${
                            form.alertEnabled ? T.accent + '55' : T.cardBorder
                          }`,
                          transition: 'all 0.2s',
                        }}
                      >
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.625rem',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={form.alertEnabled}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                alertEnabled: e.target.checked,
                              }))
                            }
                            style={{
                              width: '1.05rem',
                              height: '1.05rem',
                              cursor: 'pointer',
                              accentColor: T.accent,
                              flexShrink: 0,
                              marginTop: '0.1rem',
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: '0.825rem',
                                fontWeight: 700,
                                color: form.alertEnabled ? T.accent : T.title,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}
                            >
                              <Bell size={13} /> Recibir aviso antes del
                              vencimiento
                            </div>
                            <div
                              style={{
                                fontSize: '0.7rem',
                                color: T.muted,
                                marginTop: '0.15rem',
                                lineHeight: 1.4,
                              }}
                            >
                              Te avisaremos en el banner del Dashboard cuando se
                              acerque la fecha
                            </div>
                          </div>
                        </label>

                        {form.alertEnabled && (
                          <div
                            style={{
                              marginTop: '0.75rem',
                              paddingTop: '0.75rem',
                              borderTop: `1px solid ${T.accent}33`,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: T.body,
                                fontWeight: 600,
                              }}
                            >
                              Avisarme con
                            </span>
                            <select
                              value={String(form.alertWindowDays)}
                              onChange={(e) => {
                                const v = e.target.value;
                                setForm((f) => ({
                                  ...f,
                                  alertWindowDays:
                                    v === 'custom' ? 'custom' : parseInt(v),
                                }));
                              }}
                              style={{
                                padding: '0.4rem 0.625rem',
                                borderRadius: '0.5rem',
                                border: `1.5px solid ${T.cardBorder}`,
                                background: T.cardBg,
                                color: T.title,
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                outline: 'none',
                              }}
                            >
                              {ALERT_WINDOW_PRESETS.map((d) => (
                                <option key={d} value={d}>
                                  {d} días
                                </option>
                              ))}
                              <option value="custom">Personalizado…</option>
                            </select>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: T.body,
                                fontWeight: 600,
                              }}
                            >
                              de antelación
                            </span>

                            {form.alertWindowDays === 'custom' && (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  width: '100%',
                                  marginTop: '0.4rem',
                                }}
                              >
                                <input
                                  type="number"
                                  min={1}
                                  max={365}
                                  placeholder="Nº de días"
                                  value={form.alertWindowCustom}
                                  onChange={(e) => {
                                    setForm((f) => ({
                                      ...f,
                                      alertWindowCustom: e.target.value,
                                    }));
                                    setErrors((er) => ({
                                      ...er,
                                      alertWindowCustom: undefined as any,
                                    }));
                                  }}
                                  style={{
                                    width: '8rem',
                                    padding: '0.4rem 0.625rem',
                                    borderRadius: '0.5rem',
                                    border: `1.5px solid ${
                                      errors.alertWindowCustom
                                        ? T.red
                                        : T.inputBorder
                                    }`,
                                    background: T.inputBg,
                                    color: T.inputText,
                                    fontSize: '0.78rem',
                                    outline: 'none',
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: '0.72rem',
                                    color: T.muted,
                                  }}
                                >
                                  días (1-365)
                                </span>
                              </div>
                            )}
                            {errors.alertWindowCustom && (
                              <div
                                style={{
                                  width: '100%',
                                  fontSize: '0.7rem',
                                  color: T.red,
                                  fontWeight: 600,
                                }}
                              >
                                {errors.alertWindowCustom}
                              </div>
                            )}
                          </div>
                        )}

                        {!form.alertEnabled && (
                          <div
                            style={{
                              marginTop: '0.625rem',
                              padding: '0.5rem 0.75rem',
                              borderRadius: '0.5rem',
                              background: T.amberBg,
                              border: `1px solid ${T.amberBorder}`,
                              fontSize: '0.72rem',
                              color: T.amber,
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              lineHeight: 1.4,
                            }}
                          >
                            <BellOff size={12} /> No recibirás avisos antes del
                            vencimiento de esta proyección.
                          </div>
                        )}
                      </div>

                      {/* Ajuste puntual */}
                      <div
                        style={{
                          padding: '0.875rem',
                          borderRadius: '0.75rem',
                          background: form.nextOverrideAmount
                            ? T.amberBg
                            : T.pageBg,
                          border: `1.5px solid ${
                            form.nextOverrideAmount
                              ? T.amberBorder
                              : T.cardBorder
                          }`,
                          transition: 'all 0.2s',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: form.nextOverrideAmount ? T.amber : T.title,
                            marginBottom: '0.2rem',
                          }}
                        >
                          💶 Ajuste puntual próximo mes
                        </div>
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: T.muted,
                            marginBottom: '0.5rem',
                            lineHeight: 1.4,
                          }}
                        >
                          Si este mes el importe será diferente al habitual.
                          Volverá al normal el siguiente.
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          placeholder={`Importe habitual: ${
                            form.amount || '0.00'
                          }`}
                          value={form.nextOverrideAmount ?? ''}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              nextOverrideAmount: e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            }))
                          }
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '0.625rem',
                            border: `1.5px solid ${
                              form.nextOverrideAmount
                                ? T.amberBorder
                                : T.inputBorder
                            }`,
                            background: T.inputBg,
                            color: T.inputText,
                            fontSize: '0.825rem',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                        {form.nextOverrideAmount && (
                          <button
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                nextOverrideAmount: null,
                              }))
                            }
                            style={{
                              marginTop: '0.4rem',
                              padding: '0.3rem 0.625rem',
                              borderRadius: '0.4rem',
                              border: `1px solid ${T.amberBorder}`,
                              background: 'transparent',
                              color: T.amber,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            ✕ Quitar ajuste
                          </button>
                        )}
                      </div>

                      {/* Pausar (solo EDIT) */}
                      {modal !== 'add' && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem 0.875rem',
                            borderRadius: '0.75rem',
                            background: T.pageBg,
                            border: `1px solid ${T.cardBorder}`,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: '0.825rem',
                                fontWeight: 700,
                                color: T.title,
                              }}
                            >
                              {form.active
                                ? '▶️ Proyección activa'
                                : '⏸ Proyección pausada'}
                            </div>
                            <div
                              style={{
                                fontSize: '0.7rem',
                                color: T.muted,
                                marginTop: '0.1rem',
                              }}
                            >
                              {form.active
                                ? 'Se incluye en cálculos y avisos'
                                : 'No se incluye en cálculos hasta reactivarla'}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setForm((f) => ({ ...f, active: !f.active }))
                            }
                            style={{
                              width: '2.75rem',
                              height: '1.5rem',
                              borderRadius: '9999px',
                              border: 'none',
                              background: form.active ? T.accent : T.cardBorder,
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'background 0.2s',
                              flexShrink: 0,
                            }}
                          >
                            <div
                              style={{
                                position: 'absolute',
                                top: '0.15rem',
                                left: form.active ? '1.35rem' : '0.15rem',
                                width: '1.2rem',
                                height: '1.2rem',
                                borderRadius: '50%',
                                background: '#fff',
                                transition: 'left 0.2s',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                              }}
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* FOOTER STICKY */}
              <div
                style={{
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 2,
                  padding: '0.875rem 1.25rem',
                  borderTop: `1px solid ${T.cardBorder}`,
                  background: T.cardBg,
                  display: 'flex',
                  gap: '0.625rem',
                }}
              >
                <PrimaryBtn onClick={save} fullWidth>
                  <Check size={15} />
                  {modal === 'add' ? 'Crear proyección' : 'Guardar cambios'}
                </PrimaryBtn>
                <SecondaryBtn
                  onClick={() => {
                    setModal(null);
                    setErrors({});
                    setShowAdvanced(false);
                  }}
                  T={T}
                >
                  Cancelar
                </SecondaryBtn>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Confirm delete */}
      {confirmDelete && (
        <ConfirmModal
          T={T}
          title="¿Eliminar proyección?"
          message={`Vas a eliminar "${
            projections.find((p) => p.id === confirmDelete)?.name
          }". Esta acción no se puede deshacer.`}
          onConfirm={() => {
            setProjections((p) => p.filter((x) => x.id !== confirmDelete));
            toast('Proyección eliminada', 'success');
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Coach Mark */}
      {!coachSeen && (
        <CoachMark
          targetRef={coachRef}
          title="Tu previsión financiera"
          description="Define aquí tu nómina y tus gastos fijos. La app calculará si llegas a fin de mes antes de que ocurra."
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

      <PrintFooter section="Proyecciones" />
    </div>
  );
}
