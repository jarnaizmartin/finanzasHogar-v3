import { useState, useMemo, useRef, useEffect } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { useTranslation } from 'react-i18next';
import { useCoachMark, CoachMark } from '../components/CoachMark';
import { AccountsSummary } from '../components/AccountsSummary';
import { CreditCardAccountCard } from '../components/CreditCardAccountCard';
import { LoanAccountCard } from '../components/LoanAccountCard';
import { RegularAccountCard } from '../components/RegularAccountCard';
import { useLoanAmortization } from '../hooks/useLoanAmortization';
import { Plus, Wallet } from 'lucide-react';
import { useApp } from '../AppContext';
import { useToast } from '../contexts/ToastContext';
import {
  Card,
  ConfirmModal,
  PrimaryBtn,
  SecondaryBtn,
  DangerBtn,
  PrintButton,
  PrintHeader,
  PrintFooter,
} from '../components/UI';
import { FirstWinToast } from '../components/FirstWinToast';
import { CreditCardDetailView } from '../components/CreditCardDetailView';
import { AccountFormModal, type AccountFormEntry } from '../components/AccountFormModal';
import { InstitutionLogo } from '../components/InstitutionLogo';
import { AmortizationFormModal } from '../components/AmortizationFormModal';
import { AmortizationHistory } from '../components/AmortizationHistory';
import { LoanDetailView } from '../components/LoanDetailView';

const uid = () => crypto.randomUUID();

export function Accounts() {
  const { t } = useTranslation();
  const {
    T,
    displayCurrency,
    baseCurrency,
    rates,
    fmtAccount,
    accounts,
    setAccounts,
    realBalanceMap,
    setRealAccountFilter,
    setRealReturnTo,
    setTab,
    realExpenses,
    setRealExpenses,
    projections,
    setProjections,
    goals,
    setGoals,
    dateFormat,
  } = useApp();

  const toast = useToast();
  const isMobile = useIsMobile();

  // ── Coach Mark ────────────────────────────────────────────────────────────
  const { seen: coachSeen, markSeen: coachMarkSeen } = useCoachMark('accounts');
  const coachRef = useRef<HTMLDivElement>(null);

  // ── Total saldo base (solo cuentas no crédito/préstamo) ──
  // Se usa en el PrintHeader/PrintButton del documento impreso.
  // El resto de totales y los KPIs viven dentro de <AccountsSummary />.
  const totalBase = accounts
    .filter((a) => a.accountType !== 'credit_card' && a.accountType !== 'loan')
    .reduce((s, a) => s + a.balance, 0);

  // ── UIContext: modal de pago global y peticiones del simulador ─────────────
  const {
    openPaymentModal,
    simulatorRequestAccountId,
    consumeSimulatorRequest,
  } = useApp();

  // ── Estado con tipos explícitos ────────────────────────────────────────────
  const [modal, setModal] = useState<null | 'add' | string>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showFirstWin, setShowFirstWin] = useState(false);
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);
  const [selectedCreditCardId, setSelectedCreditCardId] = useState<string | null>(null);
  // 🆕 Tab inicial al entrar al detalle. 'overview' por defecto, pero si la
  // entrada viene de una alerta (open_simulator), abrimos directamente en
  // el tab del simulador.
  const [creditCardInitialTab, setCreditCardInitialTab] = useState<
    'overview' | 'history' | 'metrics' | 'categories' | 'simulator'
  >('overview');
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  // Lógica de amortización (estado + handlers) en hook dedicado
  const {
    amortizingLoanId,
    setAmortizingLoanId,
    amortizingLoan,
    undoAmortization,
    setUndoAmortization,
    handleAmortization,
    handleUndoAmortization,
  } = useLoanAmortization();

  // Refs por tarjeta para hacer scroll cuando una alerta abre el simulador
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ── Procesar petición de "abrir simulador desde alerta" ────────────────────
  // Cuando AlertsBanner llama a requestOpenSimulator(id):
  //  1. UIContext cambia tab a 'accounts' y guarda el id
  //  2. Este efecto detecta el id, entra al detalle DIRECTAMENTE en el tab
  //     del simulador (no en el resumen) y hace scroll al inicio
  //  3. Consume la petición para que no se vuelva a disparar
  useEffect(() => {
    if (!simulatorRequestAccountId) return;
    setCreditCardInitialTab('simulator');
    setSelectedCreditCardId(simulatorRequestAccountId);
    consumeSimulatorRequest();
  }, [simulatorRequestAccountId, consumeSimulatorRequest]);

  // ── Handlers del modal (ahora delegado a AccountFormModal) ───────────────
  const openAdd = () => setModal('add');
  const openEdit = (acc: (typeof accounts)[number]) => setModal(acc.id);

  const handleSaveAccount = (entry: AccountFormEntry) => {
    const isFirstAccount = modal === 'add' && accounts.length === 0;

    if (modal === 'add') {
      const newAccountId = uid();
      let linkedProjectionId: string | undefined;

      // ── Auto-crear proyección vinculada para préstamos ──
      if (
        entry.accountType === 'loan' &&
        entry.monthlyPayment &&
        entry.monthlyPayment > 0 &&
        entry.paymentAccountId
      ) {
        linkedProjectionId = uid();
        const chargeDay = entry.paymentDay && entry.paymentDay >= 1 && entry.paymentDay <= 31
          ? entry.paymentDay
          : 1;
        // Fecha de inicio = primer día de cargo (este mes o el siguiente)
        const today = new Date();
        const startThisMonth = new Date(today.getFullYear(), today.getMonth(), chargeDay);
        const start = startThisMonth >= today
          ? startThisMonth
          : new Date(today.getFullYear(), today.getMonth() + 1, chargeDay);
        const startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;

        setProjections((prev) => [
          ...prev,
          {
            id: linkedProjectionId,
            name: t('accounts.loanQuotaName', { name: entry.name }),
            accountId: entry.paymentAccountId!,    // Cuenta origen (corriente)
            toAccountId: newAccountId,             // Préstamo (destino)
            categoryId: '__transfer__',
            type: 'transfer',
            amount: entry.monthlyPayment,
            frequency: 'monthly',
            startDate,
            endDate: '',
            isRecurring: true,
            recurringDay: chargeDay,
            linkedLoanId: newAccountId,             // Marca la proyección como vinculada
          },
        ]);
      }

      setAccounts((p) => [
        ...p,
        { ...entry, id: newAccountId, linkedProjectionId, acknowledgedExpenseIds: [] },
      ]);
      toast(
        entry.accountType === 'loan'
          ? t('accounts.toast.loanCreated')
          : t('accounts.toast.accountCreated'),
        'success'
      );
    } else {
      const existingAccount = accounts.find((a) => a.id === modal);
      const dateChanged =
        existingAccount && entry.date !== existingAccount.date;

      // ── Sincronizar proyección vinculada si es un préstamo ──
      if (
        existingAccount?.accountType === 'loan' &&
        existingAccount.linkedProjectionId
      ) {
        const cuotaCambio =
          entry.monthlyPayment !== undefined &&
          entry.monthlyPayment !== existingAccount.monthlyPayment;
        const diaCambio =
          entry.paymentDay !== undefined &&
          entry.paymentDay !== existingAccount.paymentDay;
        const cuentaCambio =
          entry.paymentAccountId !== undefined &&
          entry.paymentAccountId !== existingAccount.paymentAccountId;

        if (cuotaCambio || diaCambio || cuentaCambio) {
          setProjections((prev) =>
            prev.map((p) => {
              if (p.id !== existingAccount.linkedProjectionId) return p;
              return {
                ...p,
                amount: entry.monthlyPayment ?? p.amount,
                accountId: entry.paymentAccountId ?? p.accountId,
                recurringDay: entry.paymentDay ?? p.recurringDay,
                name: t('accounts.loanQuotaName', { name: entry.name }),
              };
            })
          );
        }
      }

      setAccounts((p) =>
        p.map((a) => {
          if (a.id !== modal) return a;
          let acknowledgedExpenseIds = a.acknowledgedExpenseIds ?? [];
          if (dateChanged) {
            const newlyAcknowledged = realExpenses
              .filter(
                (e) =>
                  e.accountId === a.id &&
                  e.valueDate <= entry.date &&
                  !acknowledgedExpenseIds.includes(e.id)
              )
              .map((e) => e.id);
            acknowledgedExpenseIds = [
              ...acknowledgedExpenseIds,
              ...newlyAcknowledged,
            ];
          }
          return { ...a, ...entry, acknowledgedExpenseIds };
        })
      );

      if (dateChanged) {
        toast(t('accounts.toast.accountUpdated'), 'info');
      } else {
        toast(t('accounts.toast.accountSaved'), 'success');
      }
    }
    setModal(null);
    if (isFirstAccount) setShowFirstWin(true);
  };

  // Cuenta que se está editando (si modal es un id de cuenta existente)
  const editingAccount =
    modal && modal !== 'add' ? accounts.find((a) => a.id === modal) : undefined;

  // ✅ FIX — impacto de eliminación calculado una sola vez con useMemo
  const deleteImpact = useMemo(() => {
    if (!confirmDelete) return null;
    const movCount = realExpenses.filter(
      (e) => e.accountId === confirmDelete
    ).length;
    const projCount = projections.filter(
      (p) => p.accountId === confirmDelete
    ).length;
    const goalCount = goals.filter(
      (g) => g.mode === 'auto' && g.accountId === confirmDelete
    ).length;
    const parts: string[] = [];
    if (movCount > 0)
      parts.push(t('accounts.deleteImpact.movements', { count: movCount }));
    if (projCount > 0)
      parts.push(t('accounts.deleteImpact.projections', { count: projCount }));
    if (goalCount > 0)
      parts.push(t('accounts.deleteImpact.goals', { count: goalCount }));
    return { movCount, projCount, goalCount, parts };
  }, [confirmDelete, realExpenses, projections, goals, t]);

  const confirmDel = () => {
    const deletedId = confirmDelete!;
    const deletedAccount = accounts.find((a) => a.id === deletedId);
    setAccounts((p) => p.filter((a) => a.id !== deletedId));
    // ✅ FIX — sin variable shadowing: prev/proj en lugar de p/p
    setRealExpenses((prev) => prev.filter((e) => e.accountId !== deletedId));
    setProjections((prev) =>
      prev.filter((proj) => {
        // Borra proyecciones cuya cuenta origen es la eliminada
        if (proj.accountId === deletedId) return false;
        // Borra también la proyección vinculada si la cuenta era un préstamo
        if (
          deletedAccount?.accountType === 'loan' &&
          proj.id === deletedAccount.linkedProjectionId
        ) {
          return false;
        }
        // Borra cualquier proyección tipo transfer cuyo destino era el préstamo
        if (proj.type === 'transfer' && proj.toAccountId === deletedId) {
          return false;
        }
        return true;
      })
    );
    setGoals((prev) =>
      prev.filter((g) => !(g.mode === 'auto' && g.accountId === deletedId))
    );

    toast(
      deleteImpact && deleteImpact.parts.length > 0
        ? t('accounts.toast.accountDeletedWithData', { items: deleteImpact.parts.join(', ') })
        : t('accounts.toast.accountDeleted'),
      'success'
    );
    setConfirmDelete(null);
  };

  const accToDelete = accounts.find((a) => a.id === confirmDelete);


  // ── Vista de detalle de tarjeta (modo "drill-down") ─────────────────────
  // Si hay una tarjeta seleccionada, renderizamos la vista detalle dedicada
  // en lugar de la lista de cuentas. Patrón fintech estándar.
  const selectedCreditCard = selectedCreditCardId
    ? accounts.find((a) => a.id === selectedCreditCardId && a.accountType === 'credit_card')
    : null;

    const selectedLoan = selectedLoanId
      ? accounts.find((a) => a.id === selectedLoanId && a.accountType === 'loan')
      : null;

    if (selectedLoan) {
      return (
        <>
          <LoanDetailView
            loan={selectedLoan}
            onBack={() => setSelectedLoanId(null)}
            onEdit={(l) => openEdit(l)}
            onDelete={(id) => setConfirmDelete(id)}
            onAmortize={(id) => setAmortizingLoanId(id)}
            onUndoAmortization={(amortId) => setUndoAmortization({ loanId: selectedLoan.id, amortizationId: amortId })}
          />

          {modal && (
            <AccountFormModal
              mode={modal === 'add' ? 'add' : 'edit'}
              account={editingAccount}
              onSave={handleSaveAccount}
              onClose={() => setModal(null)}
            />
          )}

          {amortizingLoan && (
            <AmortizationFormModal
              loan={amortizingLoan}
              onConfirm={(data) => handleAmortization(amortizingLoan, data)}
              onClose={() => setAmortizingLoanId(null)}
            />
          )}

{confirmDelete && deleteImpact && (
            <ConfirmModal
              T={T}
              title={t('accounts.confirm.deleteLoanTitle')}
              message={
                t('accounts.confirm.deleteMsgBase', { name: accToDelete?.name ?? '' }) +
                (deleteImpact.parts.length > 0
                  ? t('accounts.confirm.deleteMsgWithItems', { items: deleteImpact.parts.join(', ') })
                  : t('accounts.confirm.deleteMsgNoItems')) +
                t('accounts.confirm.irreversible')
              }
              onConfirm={() => {
                confirmDel();
                setSelectedLoanId(null);
              }}
              onCancel={() => setConfirmDelete(null)}
            />
          )}

          {/* Confirm deshacer amortización (también disponible desde vista detalle) */}
          {undoAmortization && (() => {
            const l = accounts.find((a) => a.id === undoAmortization.loanId);
            const am = l?.amortizations?.find((a) => a.id === undoAmortization.amortizationId);
            if (!l || !am) return null;
            const cur = l.currency ?? baseCurrency;
            return (
              <ConfirmModal
                T={T}
                title={t('accounts.confirm.undoAmortTitle')}
                message={t('accounts.confirm.undoAmortMsg', {
                  amount: fmtAccount(am.amount, cur),
                  date: am.date,
                  feeNote: am.fee > 0 ? t('accounts.confirm.undoAmortFeeNote') : '',
                  prevPayment: fmtAccount(am.prevMonthlyPayment ?? 0, cur),
                })}
                onConfirm={() => handleUndoAmortization(undoAmortization.loanId, undoAmortization.amortizationId)}
                onCancel={() => setUndoAmortization(null)}
              />
            );
          })()}
        </>
      );
    }

    if (selectedCreditCard) {
      return (
        <>
          <CreditCardDetailView
            account={selectedCreditCard}
            onBack={() => {
              setSelectedCreditCardId(null);
              setCreditCardInitialTab('overview'); // reset para próxima entrada manual
            }}
            onEdit={(acc) => openEdit(acc)}
            onDelete={(id) => setConfirmDelete(id)}
            initialTab={creditCardInitialTab}
          />
  
          {/* Modal de edición (reutilizable, también funciona desde el detalle) */}
          {modal && (
            <AccountFormModal
              mode={modal === 'add' ? 'add' : 'edit'}
              account={editingAccount}
              onSave={handleSaveAccount}
              onClose={() => setModal(null)}
            />
          )}
  
          {/* Confirm delete (también disponible en vista detalle) */}
          {confirmDelete && deleteImpact && (
            <ConfirmModal
              T={T}
              title={t('accounts.confirm.deleteAccountTitle')}
              message={
                t('accounts.confirm.deleteMsgBase', { name: accToDelete?.name ?? '' }) +
                (deleteImpact.parts.length > 0
                  ? t('accounts.confirm.deleteMsgWithItems', { items: deleteImpact.parts.join(', ') })
                  : t('accounts.confirm.deleteMsgNoItems')) +
                t('accounts.confirm.irreversible')
              }
              onConfirm={() => {
                confirmDel();
                setSelectedCreditCardId(null);
              }}
              onCancel={() => setConfirmDelete(null)}
            />
          )}
        </>
      );
    }
  
    return (
      <div className="fh-print-section">

      {/* ── Cabecera documento (solo impresión) ── */}
      <PrintHeader
        title={t('accounts.print.title')}
        subtitle={t('accounts.print.subtitleCount', { count: accounts.length, amount: fmtAccount(totalBase, baseCurrency) })}
      />

      {/* ── Cabecera ── */}
      <div
        style={{
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
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
              color: T.accent,
              textTransform: 'uppercase',
              marginBottom: '0.4rem',
            }}
          >
            {t('accounts.overline')}
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
            {t('accounts.print.title')}
          </h2>
          <p
            style={{ fontSize: '0.9rem', color: T.muted, marginTop: '0.4rem' }}
          >
            {t('accounts.subtitle')}
          </p>
        </div>
        <div
          className="fh-no-print"
          style={{ display: 'flex', gap: '0.75rem' }}
        >
          <PrintButton
            T={T}
            documentTitle={t('accounts.print.filename')}
            sectionTitle={t('accounts.print.title')}
            subtitle={t('accounts.print.subtitleCount', { count: accounts.length, amount: fmtAccount(totalBase, baseCurrency) })}
          />
          <div ref={coachRef} style={{ display: 'inline-flex' }}>
            <PrimaryBtn onClick={openAdd}>
              <Plus size={15} />
              {t('accounts.newAccount')}
            </PrimaryBtn>
          </div>
        </div>
      </div>
      {/* ── Resumen de patrimonio + sticky bar (componente dedicado) ── */}
      <AccountsSummary onAdd={openAdd} isMobile={isMobile} />

      {/* ── Grid de tarjetas ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(22rem,1fr))',
          gap: '1.25rem',
        }}
      >
        {accounts.map((acc) => {
          // ── Renderizado de tarjeta de crédito (componente dedicado) ──
          if (acc.accountType === 'credit_card' && realBalanceMap[acc.id]) {
            return (
              <CreditCardAccountCard
                key={acc.id}
                ref={(el) => { cardRefs.current[acc.id] = el; }}
                account={acc}
                isHighlighted={highlightedCardId === acc.id}
                onSelectDetail={(id) => setSelectedCreditCardId(id)}
                onEdit={(a) => openEdit(a)}
                onDelete={(id) => setConfirmDelete(id)}
                onViewMovements={(id) => {
                  setRealAccountFilter(id);
                  setRealReturnTo({ label: t('accounts.tab'), tab: 'accounts' });
                  setTab('real');
                }}
              />
            );
          }

          // ── Renderizado de cuenta tipo PRÉSTAMO (componente dedicado) ──
          if (acc.accountType === 'loan') {
            return (
              <LoanAccountCard
                key={acc.id}
                account={acc}
                onAmortize={(id) => setAmortizingLoanId(id)}
                onSelectDetail={(id) => setSelectedLoanId(id)}
                onEdit={(a) => openEdit(a)}
                onDelete={(id) => setConfirmDelete(id)}
                onViewMovements={(id) => {
                  setRealAccountFilter(id);
                  setRealReturnTo({ label: t('accounts.tab'), tab: 'accounts' });
                  setTab('real');
                }}
              />
            );
          }

          // ── Renderizado de cuenta normal (componente dedicado) ──
          return (
            <RegularAccountCard
              key={acc.id}
              account={acc}
              onEdit={(a) => openEdit(a)}
              onDelete={(id) => setConfirmDelete(id)}
              onViewMovements={(id) => {
                setRealAccountFilter(id);
                setRealReturnTo({ label: t('accounts.tab'), tab: 'accounts' });
                setTab('real');
              }}
            />
          );
        })}

        {/* Estado vacío */}
        {accounts.length === 0 && (
          <div
            style={{
              gridColumn: '1/-1',
              textAlign: 'center',
              padding: '5rem 2rem',
              color: T.muted,
            }}
          >
            <Wallet
              size={48}
              color={T.muted}
              style={{ margin: '0 auto 1rem', opacity: 0.3 }}
            />
            <p
              style={{
                fontSize: '1.125rem',
                fontWeight: 800,
                color: T.title,
                marginBottom: '0.5rem',
              }}
            >
              {t('accounts.empty.title')}
            </p>
            <p
              style={{
                fontSize: '0.875rem',
                color: T.muted,
                marginBottom: '1.5rem',
              }}
            >
              {t('accounts.empty.body')}
            </p>
            <PrimaryBtn onClick={openAdd}>
              <Plus size={15} />
              {t('accounts.empty.btn')}
            </PrimaryBtn>
          </div>
        )}
      </div>
      {/* ── Modal de creación / edición (componente reutilizable) ── */}
      {modal && (
        <AccountFormModal
          mode={modal === 'add' ? 'add' : 'edit'}
          account={editingAccount}
          onSave={handleSaveAccount}
          onClose={() => setModal(null)}
        />
      )}

      {/* ── Modal de amortización parcial (Fase 2.1) ── */}
      {amortizingLoan && (
        <AmortizationFormModal
          loan={amortizingLoan}
          onConfirm={(data) => handleAmortization(amortizingLoan, data)}
          onClose={() => setAmortizingLoanId(null)}
        />
      )}
      {/* ── Confirm deshacer amortización (Fase 2.1.4) ── */}
      {undoAmortization && (() => {
        const loan = accounts.find((a) => a.id === undoAmortization.loanId);
        const amort = loan?.amortizations?.find((a) => a.id === undoAmortization.amortizationId);
        if (!loan || !amort) return null;
        const currency = loan.currency ?? baseCurrency;
        return (
          <ConfirmModal
            T={T}
            title={t('accounts.confirm.undoAmortTitle')}
            message={t('accounts.confirm.undoAmortMsg', {
              amount: fmtAccount(amort.amount, currency),
              date: amort.date,
              feeNote: amort.fee > 0 ? t('accounts.confirm.undoAmortFeeNote') : '',
              prevPayment: fmtAccount(amort.prevMonthlyPayment ?? 0, currency),
            })}
            onConfirm={() => handleUndoAmortization(undoAmortization.loanId, undoAmortization.amortizationId)}
            onCancel={() => setUndoAmortization(null)}
          />
        );
      })()}

      {/* ── Confirm delete ── */}
      {confirmDelete && deleteImpact && (
        <ConfirmModal
          T={T}
          title={t('accounts.confirm.deleteAccountTitle')}
          message={
            t('accounts.confirm.deleteMsgBase', { name: accToDelete?.name ?? '' }) +
            (deleteImpact.parts.length > 0
              ? t('accounts.confirm.deleteMsgWithItems', { items: deleteImpact.parts.join(', ') })
              : t('accounts.confirm.deleteMsgNoItems')) +
            t('accounts.confirm.irreversibleBackup')
          }
          onConfirm={confirmDel}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* ── Coach Mark — primera visita ── */}
      {!coachSeen && (
        <CoachMark
          targetRef={coachRef}
          title={t('accounts.coach.title')}
          description={t('accounts.coach.description')}
          onDismiss={coachMarkSeen}
          accentColor="#3b82f6"
        />
      )}

{showFirstWin && (
        <FirstWinToast
          type="account"
          onDone={() => {
            setShowFirstWin(false);
            localStorage.setItem('fh_setup_highlight', 'true');
            setTab('dashboard');
          }}
        />
      )}

      {/* ── Footer documento (solo impresión) ── */}
      <PrintFooter section={t('accounts.print.title')} />

    </div>
  );
}
