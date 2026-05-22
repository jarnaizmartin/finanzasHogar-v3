import { useState, useMemo, useEffect, useRef } from 'react';
import { RealExpenseFormModal, type RealExpenseFormValues } from '../components/real/RealExpenseFormModal';
import { RealExpenseFiltersBar } from '../components/real/RealExpenseFiltersBar';
import { RealExpensesList } from '../components/real/RealExpensesList';
import { RealExpensesAnalysis } from '../components/real/RealExpensesAnalysis';
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
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  Receipt,
} from 'lucide-react';
import { useApp } from '../AppContext';
import { useToast } from '../contexts/ToastContext';
import type { RealExpense } from '../types';
import { CURRENCIES, convertAmount, fmt, today, fmtDateShort, fmtDateDMY } from '../utils';
import {
  Card,
  ConfirmModal,
  Field,
  Input,
  Sel,
  PrimaryBtn,
  SecondaryBtn,
  GhostBtn,
  Badge,
  PrintButton,
  PrintHeader,
  PrintFooter,
  QuickCategoryModal,
} from '../components/UI';
import { BankImportModal } from '../BankImportModal';
import { FirstWinToast } from '../components/FirstWinToast';
import { ProjectedVsReal } from './ProjectedVsReal';

const uid = () => crypto.randomUUID();

export function RealExpenses() {
  const {
    T,
    accounts,
    setAccounts,
    categories,
    baseCurrency,
    displayCurrency,
    rates,
    realExpenses,
    setRealExpenses,
    realFilterType,
    setRealFilterType,
    realFilterAccount,
    setRealFilterAccount,
    realFilterCategory,
    setRealFilterCategory,
    realFilterDateMode,
    setRealFilterDateMode,
    realFilterPreset,
    setRealFilterPreset,
    realFilterDateFrom,
    setRealFilterDateFrom,
    realFilterDateTo,
    setRealFilterDateTo,
    realAccountFilter,
    setRealAccountFilter,
    realReturnTo,
    setRealReturnTo,
    dateFormat,
    setTab,
    realExpensePrefill,           // ✨ F2.10
    consumeRealExpensePrefill,    // ✨ F2.10
  } = useApp();

  const toast = useToast();

  // ── Coach Mark ────────────────────────────────────────────────────────────
  const { seen: coachSeen, markSeen: coachMarkSeen } = useCoachMark('real');
  const coachRef = useRef<HTMLButtonElement>(null);

  // ── Sticky compact bar ────────────────────────────────────────────────────
  // Cuando el usuario hace scroll y el bloque de totales sale de pantalla,
  // aparece una barra fija arriba con los mismos KPIs en compacto.
  const stickyBarSentinelRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // ── Estado ────────────────────────────────────────────────────────────────
  const [modal, setModal] = useState<null | 'add' | string>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [warningModal, setWarningModal] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showFirstWin, setShowFirstWin] = useState(false);
  const [analysisMonthOffset, setAnalysisMonthOffset] = useState(0);

  // ── Sub-tab view ──────────────────────────────────────────────────────────
  const [view, setView] = useState<'list' | 'analysis'>(
    () =>
      (localStorage.getItem('fh_view_real') as 'list' | 'analysis') ?? 'list'
  );

  // Aliases locales para los filtros persistidos en contexto
  const filterType = realFilterType;
  const setFilterType = setRealFilterType;
  const filterAccount = realFilterAccount;
  const setFilterAccount = setRealFilterAccount;
  const filterCategory = realFilterCategory;
  const setFilterCategory = setRealFilterCategory;
  const filterDateMode = realFilterDateMode;
  const setFilterDateMode = setRealFilterDateMode;
  const filterPreset = realFilterPreset;
  const setFilterPreset = setRealFilterPreset;
  const filterDateFrom = realFilterDateFrom;
  const setFilterDateFrom = setRealFilterDateFrom;
  const filterDateTo = realFilterDateTo;
  const setFilterDateTo = setRealFilterDateTo;

  // Cuando se navega a esta pestaña con una cuenta específica (desde Cuentas,
  // LoanDetailView, etc.) aplicamos el filtro de cuenta y reseteamos el resto
  // para garantizar que el usuario vea TODOS los movimientos de esa cuenta.
  useEffect(() => {
    if (realAccountFilter && realAccountFilter !== 'all') {
      setFilterAccount(realAccountFilter);
      setFilterType('all');
      setFilterCategory('all');
      setFilterPreset('all');
      setFilterDateMode('preset');
      setFilterDateFrom('');
      setFilterDateTo('');
      setRealAccountFilter('all');
    }
  }, [realAccountFilter]);

  // ✨ F2.10 — Si llega un prefill desde una alerta, abre el modal pre-rellenado
  useEffect(() => {
    if (!realExpensePrefill) return;
    const acc = accounts.find((a) => a.id === realExpensePrefill.accountId);
    setForm({
      entryDate: today(),
      valueDate: realExpensePrefill.valueDate,
      description: realExpensePrefill.description,
      categoryId: realExpensePrefill.categoryId,
      amount: realExpensePrefill.amount.toFixed(2),
      currency: acc?.currency ?? baseCurrency,
      type: realExpensePrefill.type,
      accountId: realExpensePrefill.accountId,
      notes: 'Generado desde alerta de vencimiento',
    });
    setErrors({});
    setModal('add');
    consumeRealExpensePrefill();
  }, [realExpensePrefill]);

  const buildEmptyForm = (): RealExpenseFormValues => {
    const firstAcc = accounts[0];
    return {
      entryDate: today(),
      valueDate: today(),
      description: '',
      categoryId: '',
      amount: '',
      currency: firstAcc?.currency ?? baseCurrency,
      type: 'expense',
      accountId: firstAcc?.id ?? '',
      notes: '',
    };
  };

  const [initialFormValues, setInitialFormValues] =
    useState<RealExpenseFormValues>(buildEmptyForm);

  const openAdd = () => {
    setInitialFormValues(buildEmptyForm());
    setModal('add');
  };

  const openEdit = (expense: RealExpense) => {
    setInitialFormValues({
      entryDate: expense.entryDate,
      valueDate: expense.valueDate,
      description: expense.description,
      categoryId: expense.categoryId,
      amount: expense.amount.toFixed(2),
      currency: expense.currency,
      type: expense.type,
      accountId: expense.accountId,
      notes: expense.notes ?? '',
    });
    setModal(expense.id);
  };

  const save = (form: RealExpenseFormValues) => {
    const entry = { ...form, amount: +form.amount };
    const linkedAccount = accounts.find((a) => a.id === form.accountId);
    const isBeforeBase = linkedAccount && form.valueDate <= linkedAccount.date;
    const isFirstExpense = modal === 'add' && realExpenses.length === 0;

    if (modal === 'add') {
      setRealExpenses((p) => [...p, { ...entry, id: uid() }]);
      if (isBeforeBase) {
        setWarningModal(
          `El movimiento se ha guardado correctamente, pero su fecha de valor (${form.valueDate}) es anterior o igual a la fecha del saldo base de la cuenta "${linkedAccount.name}" (${linkedAccount.date}).\n\nEste movimiento NO se aplicará al saldo real calculado, ya que se considera incluido en el saldo base que introdujiste.`
        );
      } else {
        toast('Movimiento registrado correctamente', 'success');
      }
    } else {
      setRealExpenses((p) =>
        p.map((x) => (x.id === modal ? { ...x, ...entry } : x))
      );
      if (isBeforeBase) {
        setWarningModal(
          `El movimiento se ha actualizado correctamente, pero su fecha de valor (${form.valueDate}) es anterior o igual a la fecha del saldo base de la cuenta "${linkedAccount.name}" (${linkedAccount.date}).\n\nEste movimiento NO se aplicará al saldo real calculado, ya que se considera incluido en el saldo base que introdujiste.`
        );
      } else {
        toast('Movimiento actualizado correctamente', 'success');
      }
    }
    setModal(null);
    if (isFirstExpense) setShowFirstWin(true);
  };

  const del = (id: string) => setConfirmDelete(id);

  const confirmDel = () => {
    const deletedId = confirmDelete!;
    setRealExpenses((p) => p.filter((x) => x.id !== deletedId));
    setAccounts((prev) =>
      prev.map((a) => ({
        ...a,
        acknowledgedExpenseIds: (a.acknowledgedExpenseIds ?? []).filter(
          (id) => id !== deletedId
        ),
      }))
    );
    toast('Movimiento eliminado', 'success');
    setConfirmDelete(null);
  };

  const expenseToDelete = realExpenses.find((e) => e.id === confirmDelete);

  const dismissDuplicateWarning = (id: string) => {
    setRealExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, isDuplicateWarning: false, duplicateReviewed: true }
          : e
      )
    );
  };

  // ── Rango de fechas ───────────────────────────────────────────────────────
  const activeDateRange = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const ymd = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (filterDateMode === 'range')
      return { from: filterDateFrom || null, to: filterDateTo || null };

    switch (filterPreset) {
      case 'this_month':
        return {
          from: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`,
          to: ymd(now),
        };
      case 'last_month': {
        const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const last = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          from: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`,
          to: ymd(last),
        };
      }
      case 'last_3': {
        const d = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        return {
          from: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`,
          to: ymd(now),
        };
      }
      case 'last_6': {
        const d = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        return {
          from: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`,
          to: ymd(now),
        };
      }
      case 'this_year':
        return { from: `${now.getFullYear()}-01-01`, to: ymd(now) };
      default:
        return { from: null, to: null };
    }
  }, [filterDateMode, filterPreset, filterDateFrom, filterDateTo]);

  const filtered = useMemo(
    () =>
      realExpenses
        .filter((e) => filterType === 'all' || e.type === filterType)
        .filter((e) => filterAccount === 'all' || e.accountId === filterAccount)
        .filter(
          (e) => filterCategory === 'all' || e.categoryId === filterCategory
        )
        .filter((e) => {
          if (!activeDateRange.from && !activeDateRange.to) return true;
          const d = e.entryDate;
          if (activeDateRange.from && d < activeDateRange.from) return false;
          if (activeDateRange.to && d > activeDateRange.to) return false;
          return true;
        })
        .sort((a, b) => b.entryDate.localeCompare(a.entryDate)),
        [realExpenses, filterType, filterAccount, filterCategory, activeDateRange]
        );
      
        const scrollPosition = useScrollPosition(listContainerRef, filtered.length);
      
        const totalIncome = useMemo(
          () =>
      filtered
        .filter((e) => e.type === 'income' && !e.isTransfer)
        .reduce(
          (s, e) =>
            s + convertAmount(e.amount, e.currency, displayCurrency, rates),
          0
        ),
    [filtered, displayCurrency, rates]
  );

  const totalExpense = useMemo(
    () =>
      filtered
        .filter((e) => e.type === 'expense' && !e.isTransfer)
        .reduce(
          (s, e) =>
            s + convertAmount(e.amount, e.currency, displayCurrency, rates),
          0
        ),
    [filtered, displayCurrency, rates]
  );

    const printSubtitle = useMemo(() => {
      const parts: string[] = [];
    
      if (filterType !== 'all')
        parts.push(filterType === 'income' ? 'Tipo: Ingresos' : 'Tipo: Gastos');
    
      if (filterAccount !== 'all') {
        const acc = accounts.find((a) => a.id === filterAccount);
        if (acc) parts.push(`Cuenta: ${acc.name}`);
      }
    
      if (filterCategory !== 'all') {
        const cat = categories.find((c) => c.id === filterCategory);
        if (cat) parts.push(`Categoría: ${cat.name}`);
      }
    
      if (filterDateMode === 'range' && (filterDateFrom || filterDateTo)) {
        parts.push(`Período: ${filterDateFrom || '…'} → ${filterDateTo || '…'}`);
      } else if (filterPreset !== 'all') {
        const labels: Record<string, string> = {
          this_month: 'Este mes',
          last_month: 'Mes anterior',
          last_3: 'Últimos 3 meses',
          last_6: 'Últimos 6 meses',
          this_year: 'Este año',
        };
        parts.push(`Período: ${labels[filterPreset] ?? filterPreset}`);
      }
    
      parts.push(`${filtered.length} movimiento${filtered.length !== 1 ? 's' : ''}`);
    
      return parts.join(' · ');
    }, [
      filterType,
      filterAccount,
      filterCategory,
      filterDateMode,
      filterPreset,
      filterDateFrom,
      filterDateTo,
      filtered.length,
      accounts,
      categories,
    ]);
    
  return (
    <div className="fh-print-section">

      {/* ── Botón "Volver a..." contextual ──────────────────────────────────
          Solo aparece si se llegó a esta vista desde otra pantalla (Cuentas,
          detalle de préstamo, detalle de tarjeta...). Si se accede directamente
          desde el menú principal, no se muestra. */}
      {realReturnTo && (
        <button
          className="fh-no-print"
          onClick={() => {
            const target = realReturnTo;
            setRealReturnTo(null);
            setTab(target.tab);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.85rem',
            borderRadius: '0.65rem',
            border: `1px solid ${T.cardBorder}`,
            background: T.cardBg,
            color: T.muted,
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          ← Volver a {realReturnTo.label}
        </button>
      )}

      {/* ── Cabecera documento (solo impresión) ── */}
      <PrintHeader
        title="Movimientos Reales"
        subtitle={printSubtitle}
      />
  
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
            Seguimiento
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
            Movimientos Reales
          </h2>
          <p
            style={{ fontSize: '0.9rem', color: T.muted, marginTop: '0.4rem' }}
          >
            Registra tus movimientos de ingresos y gastos
          </p>
        </div>
        <div
          ref={coachRef}
          className="fh-no-print"
          style={{ display: 'flex', gap: '0.75rem' }}
        >
<PrintButton
  T={T}
  documentTitle="Movimientos_Reales"
  sectionTitle="Movimientos Reales"
  subtitle={printSubtitle}
/>
          <button
            onClick={() => setShowImport(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.125rem',
              borderRadius: '0.75rem',
              border: `1.5px solid ${T.greenBorder}`,
              background: T.greenBg,
              color: T.green,
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            📥 Cargar extracto del banco
          </button>
          <PrimaryBtn onClick={openAdd}>
            <Plus size={15} /> Nuevo movimiento
          </PrimaryBtn>
        </div>
      </div>

      {/* ── Resumen de totales ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {[
          {
            label: 'Total ingresos',
            value: fmt(totalIncome, displayCurrency, displayCurrency, rates),
            color: T.green,
            bg: T.greenBg,
            border: T.greenBorder,
          },
          {
            label: 'Total gastos',
            value: fmt(totalExpense, displayCurrency, displayCurrency, rates),
            color: T.red,
            bg: T.redBg,
            border: T.redBorder,
          },
          {
            label: 'Balance real',
            value: fmt(
              totalIncome - totalExpense,
              displayCurrency,
              displayCurrency,
              rates
            ),
            color: totalIncome - totalExpense >= 0 ? T.green : T.red,
            bg: totalIncome - totalExpense >= 0 ? T.greenBg : T.redBg,
            border:
              totalIncome - totalExpense >= 0 ? T.greenBorder : T.redBorder,
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
                fontSize: '0.7rem',
                fontWeight: 700,
                color: item.color,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.4rem',
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: '1.375rem',
                fontWeight: 800,
                color: item.color,
                letterSpacing: '-0.03em',
                textAlign: 'right',
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
        </div>
  
        {/* 🎯 Sentinel — cuando este div sale del viewport, aparece la barra
           compacta sticky con los mismos KPIs y los subtabs. */}
        <div ref={stickyBarSentinelRef} style={{ height: 1 }} />
  
      {/* ── Barra compacta sticky (aparece al hacer scroll) ── */}
      <StickyCompactBar
        title="📋 Movimientos Reales - Totales"
        sentinelRef={stickyBarSentinelRef}
        filterInfo={{
          visible: filtered.length,
          total: realExpenses.length,
          itemLabel: 'movimientos',
          currentPosition: scrollPosition,
        }}
        kpis={[
            {
              label: 'Ingresos',
              icon: '↑',
              value: fmt(totalIncome, displayCurrency, displayCurrency, rates),
              color: T.green,
            },
            {
              label: 'Gastos',
              icon: '↓',
              value: fmt(totalExpense, displayCurrency, displayCurrency, rates),
              color: T.red,
            },
            {
              label: 'Balance',
              icon: '=',
              value: fmt(totalIncome - totalExpense, displayCurrency, displayCurrency, rates),
              color: totalIncome - totalExpense >= 0 ? T.green : T.red,
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
                      localStorage.setItem('fh_view_real', val);
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
              {/* Botón "+ Nuevo movimiento" compacto */}
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
                <Plus size={13} /> Nuevo
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
                localStorage.setItem('fh_view_real', val);
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
            Proyectado vs real por mes
          </span>
        )}
      </div>

      {/* ── Vista: Lista ── */}
      {view === 'list' && (
        <>
          {/* Filtros */}
          <RealExpenseFiltersBar filteredCount={filtered.length} />

          {/* Lista de movimientos */}
          <RealExpensesList
            ref={listContainerRef}
            filtered={filtered}
            totalCount={realExpenses.length}
            onEdit={openEdit}
            onDelete={del}
            onDismissDuplicate={dismissDuplicateWarning}
            onAddFirst={openAdd}
          />
        </>
      )}

      {/* ── Vista: Análisis ── */}
      {view === 'analysis' && (
        <RealExpensesAnalysis
          monthOffset={analysisMonthOffset}
          setMonthOffset={setAnalysisMonthOffset}
          onGoToList={() => setView('list')}
        />
      )}
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
                Aún no hay datos para analizar
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: T.muted,
                  marginBottom: '1.5rem',
                }}
              >
                Registra algunos movimientos primero y aquí verás el análisis
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
              {/* ── Navegador de mes ── */}
              {(() => {
                const d = new Date();
                d.setDate(1);
                d.setMonth(d.getMonth() + analysisMonthOffset);
                const label = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                const isCurrentMonth = analysisMonthOffset >= 0;
                return (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '0.625rem 1rem', borderRadius: '0.875rem', background: T.accentLight, border: `1px solid ${T.accent}33` }}>
                    <button
                      onClick={() => setAnalysisMonthOffset(o => o - 1)}
                      style={{ padding: '0.35rem 0.875rem', borderRadius: '0.625rem', border: `1px solid ${T.accent}44`, background: T.cardBg, color: T.accent, fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer' }}
                    >
                      ←
                    </button>
                    <span style={{ fontSize: '0.925rem', fontWeight: 800, color: T.accent, textTransform: 'capitalize', minWidth: '13rem', textAlign: 'center' }}>
                      {label}
                    </span>
                    <button
                      onClick={() => setAnalysisMonthOffset(o => Math.min(0, o + 1))}
                      disabled={isCurrentMonth}
                      style={{ padding: '0.35rem 0.875rem', borderRadius: '0.625rem', border: `1px solid ${T.accent}44`, background: T.cardBg, color: isCurrentMonth ? T.muted : T.accent, fontWeight: 800, fontSize: '1.1rem', cursor: isCurrentMonth ? 'default' : 'pointer', opacity: isCurrentMonth ? 0.35 : 1 }}
                    >
                      →
                    </button>
                  </div>
                );
              })()}
              <ProjectedVsReal monthOffset={analysisMonthOffset} />

              {topRealCategories.length > 0 && (
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
                      Desglose
                    </div>
                    <div
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: 800,
                        color: T.title,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      Gastos reales por categoría — Este mes
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
                    {topRealCategories.map(({ cat, val }) => {
                      const maxVal = Math.max(
                        ...topRealCategories.map((x) => x.val),
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
                              {fmt(
                                val,
                                displayCurrency,
                                displayCurrency,
                                rates
                              )}
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

      {/* ── Modal alta / edición ── */}
      {modal && (
        <RealExpenseFormModal
          mode={modal === 'add' ? 'add' : 'edit'}
          initialValues={initialFormValues}
          onSave={save}
          onClose={() => setModal(null)}
        />
      )}

      {/* ── Confirm delete ── */}
      {confirmDelete && (
        <ConfirmModal
          T={T}
          title="¿Eliminar movimiento?"
          message={`Vas a eliminar "${expenseToDelete?.description}". Esta acción no se puede deshacer.`}
          onConfirm={confirmDel}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* ── Warning modal ── */}
      {warningModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              background: T.cardBg,
              border: `1px solid ${T.amberBorder}`,
              borderRadius: '1.5rem',
              boxShadow: T.cardShadowLg,
              width: '100%',
              maxWidth: '28rem',
              padding: '1.75rem',
            }}
          >
            <div
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                background: T.amberBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <AlertTriangle size={20} color={T.amber} />
            </div>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 800,
                color: T.title,
                margin: '0 0 0.75rem',
                letterSpacing: '-0.02em',
              }}
            >
              ⚠️ Movimiento guardado — fuera del rango calculado
            </h3>
            <p
              style={{
                fontSize: '0.825rem',
                color: T.muted,
                lineHeight: 1.6,
                margin: '0 0 0.75rem',
                whiteSpace: 'pre-line',
              }}
            >
              {warningModal}
            </p>
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                background: T.amberBg,
                border: `1px solid ${T.amberBorder}`,
                fontSize: '0.775rem',
                color: T.amber,
                lineHeight: 1.5,
                marginBottom: '1.25rem',
              }}
            >
              💡 Si quieres que este movimiento afecte al saldo calculado, edita
              la <strong>Fecha del saldo base</strong> de la cuenta a una fecha
              anterior a la del movimiento.
            </div>
            <button
              onClick={() => setWarningModal(null)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.875rem',
                border: 'none',
                background: T.amber,
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ── Import ── */}
      {showImport && <BankImportModal onClose={() => setShowImport(false)} />}

      {/* ── Coach Mark ── */}
      {!coachSeen && (
        <CoachMark
          targetRef={coachRef}
          title="Registra tus movimientos"
          description="Añádelos uno a uno con '+ Nuevo movimiento', o importa todos de golpe desde el CSV de tu banco (Santander, BBVA, CaixaBank, ING, Revolut...)."
          ctaLabel="¡Entendido! →"
          onDismiss={coachMarkSeen}
          accentColor="#16a34a"
        />
      )}

{showFirstWin && (
        <FirstWinToast
          type="movement"
          onDone={() => {
            setShowFirstWin(false);
            localStorage.setItem('fh_setup_highlight', 'true');
            setTab('dashboard');
          }}
        />
      )}

      {/* ── Footer documento (solo impresión) ── */}
      <PrintFooter section="Movimientos Reales" />

    </div>
  );
}
