import { useState, useMemo, useRef } from 'react';
import { useApp } from '../AppContext';
import { useToast } from '../contexts/ToastContext';
import { PrintButton, PrintHeader, PrintFooter, ConfirmModal } from '../components/UI';
import { SnoozeMenu } from '../components/SnoozeMenu';
import { StickyCompactBar } from '../components/StickyCompactBar';

export function AlertsPanel() {
  const {
    T,
    computedAlerts,
    ignoredAlerts,
    setIgnoredAlerts,
    setTab,
    openPaymentModal,
    requestOpenSimulator,
    requestOpenRealExpenseModal,  // ✨ F2.10
    projections,                  // ✨ F2.10
    setProjections,               // ✨ F2.10
    accounts,                     // ✨ F2.10
  } = useApp();

  // ✨ F2.10 — Snooze 7 días + desactivar avisos permanentes
  const snoozeProjectionAlert = (projectionId: string, until: number) => {
    setProjections((prev) =>
      prev.map((p) => (p.id === projectionId ? { ...p, alertSnoozeUntil: until } : p))
    );
    const fecha = new Date(until).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
    toast(`Alerta pospuesta hasta el ${fecha}`, "success");
  };

  const disableProjectionAlerts = (projectionId: string) => {
    setProjections((prev) =>
      prev.map((p) =>
        p.id === projectionId ? { ...p, alertDisabled: true } : p
      )
    );
    toast('Avisos desactivados para esta proyección', 'success');
  };

  // Ejecuta la acción primaria de una alerta según su actionType.
  const runAlertAction = (alert: typeof computedAlerts[number]) => {
    const accountId = alert.data?.accountId as string | undefined;
    switch (alert.actionType) {
      case 'open_payment_modal':
        if (accountId) openPaymentModal(accountId);
        break;
      case 'open_simulator':
        if (accountId) requestOpenSimulator(accountId);
        break;
      // ✨ F2.10
      case 'open_real_expense_modal': {
        const projectionId = alert.data?.projectionId as string | undefined;
        if (!projectionId) break;
        const proj = projections.find((p) => p.id === projectionId);
        if (!proj) break;
        const realType: 'income' | 'expense' =
          proj.type === 'income' ? 'income' : 'expense';
        requestOpenRealExpenseModal({
          projectionId: proj.id,
          accountId: proj.accountId,
          categoryId: proj.categoryId,
          amount: proj.nextOverrideAmount ?? proj.amount,
          type: realType,
          description: proj.name,
          valueDate: (alert.data?.dueDate as string) ?? new Date().toISOString().split('T')[0],
        });
        if (!accounts.find((a) => a.id === proj.accountId)) {
          console.warn('[F2.10] Cuenta no encontrada para proyección', proj.id);
        }
        break;
      }
      case 'navigate':
      default:
        if (alert.actionTab) setTab(alert.actionTab);
        break;
    }
  };

  const [filter, setFilter] = useState<
    'all' | 'critical' | 'warning' | 'positive' | 'info'
  >('all');
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [confirmIgnore, setConfirmIgnore] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Sticky compact bar ────────────────────────────────────────────────────
  const stickyBarSentinelRef = useRef<HTMLDivElement>(null);

  const toast = useToast();

  const dismiss = (id: string) => {
    setDismissed((prev) => [...prev, id]);
  };

  const ignoreAlways = (id: string) => {
    setIgnoredAlerts((prev) => [...prev, id]);
    setDismissed((prev) => [...prev, id]);
    setConfirmIgnore(null);
    toast('Alerta ignorada permanentemente', 'success');
  };

  const restoreAll = () => {
    setIgnoredAlerts([]);
    toast('Alertas restauradas', 'success');
  };

  const allAlerts = computedAlerts;
  const filtered = allAlerts.filter((a) =>
    filter === 'all' ? true : a.severity === filter
  );

  // ✨ F2.10 — Añadido infoCount (calculado; tarjeta visual pendiente FASE 4)
  const { criticalCount, warningCount, positiveCount, infoCount } = useMemo(
    () => ({
      criticalCount: allAlerts.filter((a) => a.severity === 'critical').length,
      warningCount:  allAlerts.filter((a) => a.severity === 'warning').length,
      positiveCount: allAlerts.filter((a) => a.severity === 'positive').length,
      infoCount:     allAlerts.filter((a) => a.severity === 'info').length,
    }),
    [allAlerts]
  );

  const severityConfig = {
    critical: {
      bg: T.redBg,
      border: T.redBorder,
      color: T.red,
      icon: '🔴',
      label: 'Crítica',
      badgeBg: T.red,
    },
    warning: {
      bg: T.amberBg,
      border: T.amberBorder,
      color: T.amber,
      icon: '🟠',
      label: 'Advertencia',
      badgeBg: T.amber,
    },
    positive: {
      bg: T.greenBg,
      border: T.greenBorder,
      color: T.green,
      icon: '✅',
      label: 'Positiva',
      badgeBg: T.green,
    },
    info: {
      bg: T.infoBg,
      border: T.infoBorder,
      color: T.info,
      icon: '🔵',
      label: 'Aviso',
      badgeBg: T.info,
    },
  };

  const typeIcon: Record<string, string> = {
    balance_critical: '🏦',
    balance_risk: '⚠️',
    budget_exceeded: '📉',
    goal_at_risk: '🎯',
    month_negative: '💸',
    goal_overdue: '📅',
    goal_completed: '🎉',
    duplicate_projection: '🔄',
    credit_utilization_high: '💳',
    credit_payment_due: '⏰',
    credit_interest_warning: '💰',
    projection_due_soon: '📅', // ✨ F2.10
  };

  return (
    <div className="fh-print-section">

      {/* ── Cabecera documento (solo impresión) ── */}
      <PrintHeader
        title="Alertas inteligentes"
        subtitle={`${allAlerts.length} alerta${allAlerts.length !== 1 ? 's' : ''} · ${criticalCount} crítica${criticalCount !== 1 ? 's' : ''} · ${warningCount} advertencia${warningCount !== 1 ? 's' : ''} · ${positiveCount} positiva${positiveCount !== 1 ? 's' : ''}`}
      />

      {/* ── Cabecera ── */}
      <div
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
            Centro de notificaciones
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
            Alertas inteligentes
          </h2>
          <p
            style={{ fontSize: '0.9rem', color: T.muted, marginTop: '0.4rem' }}
          >
            Situaciones que requieren tu atención
          </p>
        </div>
        <div
          className="fh-no-print"
          style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
        >
          <PrintButton
            T={T}
            documentTitle="Alertas"
            sectionTitle="Alertas inteligentes"
            subtitle={`${allAlerts.length} alerta${allAlerts.length !== 1 ? 's' : ''} · ${criticalCount} crítica${criticalCount !== 1 ? 's' : ''} · ${warningCount} advertencia${warningCount !== 1 ? 's' : ''}`}
          />
          {ignoredAlerts.length > 0 && (
            <button
              onClick={restoreAll}
              style={{
                padding: '0.55rem 1.125rem',
                borderRadius: '0.75rem',
                border: `1.5px solid ${T.cardBorder}`,
                background: T.btnSecBg,
                color: T.btnSecText,
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🔄 Restaurar {ignoredAlerts.length} ignorada
              {ignoredAlerts.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>

      {/* ── Resumen de contadores ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {[
          {
            label: 'Total alertas',
            value: allAlerts.length,
            color: T.accent,
            bg: T.accentLight,
            border: `${T.accent}33`,
          },
          {
            label: 'Críticas',
            value: criticalCount,
            color: T.red,
            bg: T.redBg,
            border: T.redBorder,
          },
          {
            label: 'Advertencias',
            value: warningCount,
            color: T.amber,
            bg: T.amberBg,
            border: T.amberBorder,
          },
          {
            label: 'Avisos',
            value: infoCount,
            color: T.info,
            bg: T.infoBg,
            border: T.infoBorder,
          },
          {
            label: 'Positivas',
            value: positiveCount,
            color: T.green,
            bg: T.greenBg,
            border: T.greenBorder,
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
                fontSize: '1.75rem',
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

      {/* 🎯 Sentinel — dispara la barra compacta sticky al hacer scroll */}
      <div ref={stickyBarSentinelRef} style={{ height: 1 }} />

      {/* ── Barra compacta sticky ── */}
      <StickyCompactBar
        title="🔔 Alertas — Resumen"
        sentinelRef={stickyBarSentinelRef}
        kpis={[
          {
            label: 'Total',
            icon: '📋',
            value: `${allAlerts.length}`,
            color: T.accent,
          },
          {
            label: 'Críticas',
            icon: '🔴',
            value: `${criticalCount}`,
            color: T.red,
          },
          {
            label: 'Advertencias',
            icon: '🟠',
            value: `${warningCount}`,
            color: T.amber,
          },
          {
            label: 'Avisos',
            icon: '🔵',
            value: `${infoCount}`,
            color: T.info,
          },
          {
            label: 'Positivas',
            icon: '✅',
            value: `${positiveCount}`,
            color: T.green,
          },
        ]}
        rightSlot={
          ignoredAlerts.length > 0 ? (
            <button
              onClick={restoreAll}
              title={`Restaurar ${ignoredAlerts.length} ignorada${ignoredAlerts.length !== 1 ? 's' : ''}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '0.5rem',
                border: `1.5px solid ${T.cardBorder}`,
                background: T.btnSecBg,
                color: T.btnSecText,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              🔄 {ignoredAlerts.length}
            </button>
          ) : undefined
        }
      />

      {/* ── Filtros ── */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        {(
          [
            ['all', 'Todas'],
            ['critical', '🔴 Críticas'],
            ['warning', '🟠 Advertencias'],
            ['info', '🔵 Avisos'],            // ✨ F2.10
            ['positive', '✅ Positivas'],
          ] as const
        ).map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            style={{
              padding: '0.5rem 1.125rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: filter === v ? 'none' : `1px solid ${T.cardBorder}`,
              background: filter === v ? T.accent : T.cardBg,
              color: filter === v ? '#fff' : T.muted,
              cursor: 'pointer',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ── Lista de alertas ── */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '6rem 2rem',
            borderRadius: '1.5rem',
            background: T.cardBg,
            border: `1.5px dashed ${T.cardBorder}`,
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.4 }}>
            🎉
          </div>
          <p
            style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              color: T.title,
              marginBottom: '0.5rem',
            }}
          >
            {filter === 'all'
              ? '¡Todo en orden!'
              : 'Sin alertas en esta categoría'}
          </p>
          <p style={{ fontSize: '0.875rem', color: T.muted }}>
            {filter === 'all'
              ? 'No hay situaciones que requieran tu atención en este momento.'
              : 'Prueba a cambiar el filtro para ver otras alertas.'}
          </p>
        </div>
      ) : (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
        >
          {filtered.map((alert) => {
            const cfg = severityConfig[alert.severity];
            const isDismissed = dismissed.includes(alert.id);
            const isExpanded = expandedId === alert.id;

            return (
              <div
                key={alert.id}
                style={{
                  borderRadius: '1.25rem',
                  background: isDismissed ? T.pageBg : cfg.bg,
                  border: `1.5px solid ${
                    isDismissed ? T.cardBorder : cfg.border
                  }`,
                  overflow: 'hidden',
                  opacity: isDismissed ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {/* ── Cabecera de la alerta ── */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1.125rem 1.25rem',
                  }}
                >
                  {/* Icono tipo */}
                  <div
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '0.75rem',
                      background: isDismissed
                        ? T.cardBorder + '33'
                        : cfg.color + '22',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      flexShrink: 0,
                    }}
                  >
                    {typeIcon[alert.type] ?? cfg.icon}
                  </div>

                  {/* Contenido */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.3rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 800,
                          color: isDismissed ? T.muted : T.title,
                        }}
                      >
                        {alert.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          background: isDismissed ? T.cardBorder : cfg.badgeBg,
                          color: '#ffffff',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {isDismissed ? 'DESCARTADA' : cfg.label}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '0.825rem',
                        color: isDismissed ? T.muted : cfg.color,
                        margin: 0,
                        lineHeight: 1.5,
                        opacity: isDismissed ? 0.7 : 1,
                      }}
                    >
                      {alert.message}
                    </p>
                  </div>

                  {/* Acciones rápidas */}
                  <div
                    style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}
                  >
                    {!isDismissed && (alert.actionTab || alert.actionType) && (
                      <button
                        onClick={() => runAlertAction(alert)}
                        style={{
                          padding: '0.45rem 0.875rem',
                          borderRadius: '0.625rem',
                          border: 'none',
                          background: isDismissed ? T.cardBorder : cfg.color,
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {alert.actionLabel ?? 'Ver →'}
                      </button>
                    )}
                    {!isDismissed && (
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : alert.id)
                        }
                        title="Opciones"
                        style={{
                          padding: '0.45rem 0.625rem',
                          borderRadius: '0.625rem',
                          border: `1px solid ${cfg.border}`,
                          background: 'transparent',
                          color: cfg.color,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>
                    )}
                    <button
                      onClick={() =>
                        isDismissed
                          ? setDismissed((p) =>
                              p.filter((id) => id !== alert.id)
                            )
                          : dismiss(alert.id)
                      }
                      title={isDismissed ? 'Restaurar' : 'Descartar'}
                      style={{
                        padding: '0.45rem 0.625rem',
                        borderRadius: '0.625rem',
                        border: `1px solid ${
                          isDismissed ? T.cardBorder : cfg.border
                        }`,
                        background: 'transparent',
                        color: isDismissed ? T.muted : cfg.color,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      {isDismissed ? '↩' : '✕'}
                    </button>
                  </div>
                </div>

                {/* ── Panel expandido ── */}
                {isExpanded && !isDismissed && (
                  <div
                    style={{
                      borderTop: `1px solid ${cfg.border}`,
                      padding: '0.875rem 1.25rem',
                      background: cfg.color + '08',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      animation: 'fadeSlideIn 0.15s ease both',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.775rem',
                        color: cfg.color,
                        fontWeight: 600,
                      }}
                    >
                      ¿Quieres dejar de ver esta alerta permanentemente?
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {/* ✨ F2.10 — Acciones extras solo para alertas de vencimiento de proyección */}
                      {alert.type === 'projection_due_soon' && alert.data?.projectionId && (
                        <>
                          {alert.data?.dueDate && (
                            <SnoozeMenu
                              T={T}
                              dueDate={alert.data.dueDate as string}
                              onSnooze={(until) => {
                                snoozeProjectionAlert(alert.data!.projectionId as string, until);
                                setExpandedId(null);
                              }}
                              trigger="full"
                            />
                          )}
                          <button
                            onClick={() => {
                              disableProjectionAlerts(alert.data!.projectionId as string);
                              setExpandedId(null);
                            }}
                            style={{
                              padding: '0.4rem 0.875rem',
                              borderRadius: '0.625rem',
                              border: `1px solid ${cfg.border}`,
                              background: 'transparent',
                              color: cfg.color,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            🔕 Desactivar avisos de esta proyección
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setConfirmIgnore(alert.id)}
                        style={{
                          padding: '0.4rem 0.875rem',
                          borderRadius: '0.625rem',
                          border: `1px solid ${cfg.border}`,
                          background: 'transparent',
                          color: cfg.color,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        🚫 Ignorar siempre
                      </button>
                      <button
                        onClick={() => setExpandedId(null)}
                        style={{
                          padding: '0.4rem 0.875rem',
                          borderRadius: '0.625rem',
                          border: `1px solid ${T.cardBorder}`,
                          background: 'transparent',
                          color: T.muted,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Nota informativa ── */}
      {allAlerts.length > 0 && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '0.875rem 1.125rem',
            borderRadius: '0.875rem',
            background: T.pageBg,
            border: `1px solid ${T.cardBorder}`,
            fontSize: '0.775rem',
            color: T.muted,
            lineHeight: 1.6,
          }}
        >
          💡 Las alertas se recalculan automáticamente cada vez que cambian tus
          datos. Las alertas descartadas reaparecen en la próxima sesión. Las
          ignoradas permanentemente se pueden restaurar con el botón de arriba.
        </div>
      )}

      {/* ── Modal confirmar ignorar siempre ── */}
      {confirmIgnore && (
        <ConfirmModal
          T={T}
          title="¿Ignorar esta alerta siempre?"
          message="Esta alerta no volverá a aparecer aunque la condición persista. Puedes restaurarla desde el botón de la cabecera de esta sección."
          onConfirm={() => ignoreAlways(confirmIgnore)}
          onCancel={() => setConfirmIgnore(null)}
        />
      )}

      {/* ── Footer documento (solo impresión) ── */}
      <PrintFooter section="Alertas" />

    </div>
  );
}
