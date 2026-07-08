import { useState, useMemo, useEffect, useRef } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { useTranslation } from 'react-i18next';
import { RealExpenseFormModal, type RealExpenseFormValues } from '../components/real/RealExpenseFormModal';
import { RealExpenseFiltersBar } from '../components/real/RealExpenseFiltersBar';
import { RealExpensesList } from '../components/real/RealExpensesList';
import { RealExpensesAnalysis } from '../components/real/RealExpensesAnalysis';
import { RealExpenseWarningModal } from '../components/real/RealExpenseWarningModal';
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
  const { t } = useTranslation();
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
    deleteRealExpense,
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
  const isMobile = useIsMobile();

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
    setInitialFormValues({
      entryDate: today(),
      valueDate: realExpensePrefill.valueDate,
      description: realExpensePrefill.description,
      categoryId: realExpensePrefill.categoryId,
      amount: realExpensePrefill.amount.toFixed(2),
      currency: acc?.currency ?? baseCurrency,
      type: realExpensePrefill.type,
      accountId: realExpensePrefill.accountId,
      notes: t('realExpenses.notes.fromAlert'),
    });
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
        setWarningModal(t('realExpenses.warning.msgSaved', {
          valueDate: form.valueDate,
          accountName: linkedAccount.name,
          baseDate: linkedAccount.date,
        }));
      } else {
        toast(t('realExpenses.toastSaved'), 'success');
      }
    } else {
      setRealExpenses((p) =>
        p.map((x) => (x.id === modal ? { ...x, ...entry } : x))
      );
      if (isBeforeBase) {
        setWarningModal(t('realExpenses.warning.msgUpdated', {
          valueDate: form.valueDate,
          accountName: linkedAccount.name,
          baseDate: linkedAccount.date,
        }));
      } else {
        toast(t('realExpenses.toastUpdated'), 'success');
      }
    }
    setModal(null);
    if (isFirstExpense) setShowFirstWin(true);
  };

  const del = (id: string) => setConfirmDelete(id);

  const confirmDel = () => {
    const deletedId = confirmDelete!;
    deleteRealExpense(deletedId);
    setAccounts((prev) =>
      prev.map((a) => ({
        ...a,
        acknowledgedExpenseIds: (a.acknowledgedExpenseIds ?? []).filter(
          (id) => id !== deletedId
        ),
      }))
    );
    toast(t('realExpenses.toastDeleted'), 'success');
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
        parts.push(filterType === 'income' ? t('realExpenses.filters.typeIncome') : t('realExpenses.filters.typeExpense'));
    
      if (filterAccount !== 'all') {
        const acc = accounts.find((a) => a.id === filterAccount);
        if (acc) parts.push(t('realExpenses.print.subtitleAccount', { name: acc.name }));
      }

      if (filterCategory !== 'all') {
        const cat = categories.find((c) => c.id === filterCategory);
        if (cat) parts.push(t('realExpenses.print.subtitleCategory', { name: cat.name }));
      }

      if (filterDateMode === 'range' && (filterDateFrom || filterDateTo)) {
        parts.push(t('realExpenses.print.subtitlePeriod', { value: `${filterDateFrom || '…'} → ${filterDateTo || '…'}` }));
      } else if (filterPreset !== 'all') {
        const labels: Record<string, string> = {
          this_month: t('realExpenses.periods.thisMonth'),
          last_month: t('realExpenses.periods.lastMonth'),
          last_3: t('realExpenses.periods.last3'),
          last_6: t('realExpenses.periods.last6'),
          this_year: t('realExpenses.periods.thisYear'),
        };
        parts.push(t('realExpenses.print.subtitlePeriod', { value: labels[filterPreset] ?? filterPreset }));
      }

      parts.push(t('realExpenses.print.subtitleCount', { count: filtered.length }));
    
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
          {t('realExpenses.backTo', { label: realReturnTo.label })}
        </button>
      )}

      {/* ── Cabecera documento (solo impresión) ── */}
      <PrintHeader
        title={t('realExpenses.print.title')}
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
            {t('realExpenses.overline')}
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
            {t('realExpenses.print.title')}
          </h2>
          <p
            style={{ fontSize: '0.9rem', color: T.muted, marginTop: '0.4rem' }}
          >
            {t('realExpenses.subtitle')}
          </p>
        </div>
        <div
          ref={coachRef}
          className="fh-no-print"
          style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}
        >
<PrintButton
  T={T}
  documentTitle={t('realExpenses.print.filename')}
  sectionTitle={t('realExpenses.print.title')}
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
            {t('realExpenses.importBtn')}
          </button>
          <PrimaryBtn onClick={openAdd}>
            <Plus size={15} /> {t('realExpenses.newBtn')}
          </PrimaryBtn>
        </div>
      </div>

      {/* ── Resumen de totales ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: isMobile ? '0.5rem' : '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {[
          {
            label: t('realExpenses.stats.totalIncome'),
            value: fmt(totalIncome, displayCurrency, displayCurrency, rates),
            color: T.green,
            bg: T.greenBg,
            border: T.greenBorder,
          },
          {
            label: t('realExpenses.stats.totalExpense'),
            value: fmt(totalExpense, displayCurrency, displayCurrency, rates),
            color: T.red,
            bg: T.redBg,
            border: T.redBorder,
          },
          {
            label: t('realExpenses.stats.realBalance'),
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
              padding: isMobile ? '0.625rem 0.5rem' : '1rem 1.25rem',
              borderRadius: '1rem',
              background: item.bg,
              border: `1px solid ${item.border}`,
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: isMobile ? '0.52rem' : '0.7rem',
                fontWeight: 700,
                color: item.color,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.25rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: isMobile ? '0.9rem' : '1.375rem',
                fontWeight: 800,
                color: item.color,
                letterSpacing: '-0.03em',
                textAlign: 'right',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
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
        title={t('realExpenses.stickyTitle')}
        sentinelRef={stickyBarSentinelRef}
        spread
        twoRowsMobile
        filterInfo={{
          visible: filtered.length,
          total: realExpenses.length,
          itemLabel: t('realExpenses.itemLabel'),
          currentPosition: scrollPosition,
        }}
        kpis={[
            {
              label: t('realExpenses.stats.income'),
              icon: '↑',
              value: fmt(totalIncome, displayCurrency, displayCurrency, rates),
              color: T.green,
            },
            {
              label: t('realExpenses.stats.expense'),
              icon: '↓',
              value: fmt(totalExpense, displayCurrency, displayCurrency, rates),
              color: T.red,
            },
            {
              label: t('realExpenses.stats.balance'),
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
            {t('realExpenses.analysisSubtitle')}
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
            onImport={() => setShowImport(true)}
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
          title={t('realExpenses.deleteTitle')}
          message={t('realExpenses.deleteMsg', { desc: expenseToDelete?.description ?? '' })}
          onConfirm={confirmDel}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* ── Warning modal ── */}
      {warningModal && (
        <RealExpenseWarningModal
          message={warningModal}
          onClose={() => setWarningModal(null)}
        />
      )}

      {/* ── Import ── */}
      {showImport && <BankImportModal onClose={() => setShowImport(false)} />}

      {/* ── Coach Mark ── */}
      {!coachSeen && (
        <CoachMark
          targetRef={coachRef}
          title={t('realExpenses.coach.title')}
          description={t('realExpenses.coach.description')}
          ctaLabel={t('common.coachCta')}
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
      <PrintFooter section={t('realExpenses.print.title')} />

    </div>
  );
}
