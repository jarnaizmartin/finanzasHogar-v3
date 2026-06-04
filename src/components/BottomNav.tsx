import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Target,
  MoreHorizontal,
  ArrowLeftRight,
  BarChart2,
  CalendarRange,
  LineChart as LineChartIcon,
  TrendingUp,
  AlertTriangle,
  FileText,
  Tag,
} from 'lucide-react';

// ─── Config ───────────────────────────────────────────────────────────────────

const PRIMARY_TABS = [
  { id: 'dashboard',   icon: LayoutDashboard },
  { id: 'accounts',    icon: Wallet },
  { id: 'real',        icon: Receipt },
  { id: 'projections', icon: BarChart2 },
] as const;

const MORE_TABS = [
  { id: 'goals',       icon: Target },
  { id: 'transfers',   icon: ArrowLeftRight },
  { id: 'calendar',    icon: CalendarRange },
  { id: 'forecast',    icon: LineChartIcon },
  { id: 'trends',      icon: TrendingUp },
  { id: 'alerts',      icon: AlertTriangle },
  { id: 'reports',     icon: FileText },
  { id: 'categories',  icon: Tag },
] as const;

const MORE_IDS = new Set(MORE_TABS.map((t) => t.id));
const REQUIRES_ACCOUNT = new Set(['real', 'transfers', 'projections', 'goals']);

// ─── Types ────────────────────────────────────────────────────────────────────

interface Alert { severity: string }

interface BottomNavProps {
  tab: string;
  setTab: (id: string) => void;
  accounts: unknown[];
  projections: unknown[];
  realExpenses: unknown[];
  transferCount: number;
  goals: unknown[];
  computedAlerts: Alert[];
  T: Record<string, string>;
  toast: (msg: string, type: string) => void;
}

// ─── Helpers (funciones puras, no hooks) ──────────────────────────────────────

function getBadge(
  id: string,
  accounts: unknown[],
  projections: unknown[],
  realExpenses: unknown[],
  transferCount: number,
  goals: unknown[],
  computedAlerts: Alert[]
): { count: number; color?: string } | null {
  switch (id) {
    case 'accounts':    return accounts.length    ? { count: accounts.length }    : null;
    case 'projections': return projections.length ? { count: projections.length } : null;
    case 'real':        return realExpenses.length ? { count: realExpenses.length } : null;
    case 'transfers':   return transferCount       ? { count: transferCount }       : null;
    case 'goals':       return goals.length        ? { count: goals.length }        : null;
    case 'alerts': {
      if (!computedAlerts.length) return null;
      const color = computedAlerts.some((a) => a.severity === 'critical')
        ? '#dc2626'
        : computedAlerts.some((a) => a.severity === 'warning')
        ? '#d97706'
        : '#16a34a';
      return { count: computedAlerts.length, color };
    }
    default: return null;
  }
}

// ─── BadgeChip ────────────────────────────────────────────────────────────────

function BadgeChip({
  badge,
  corner = true,
}: {
  badge: { count: number; color?: string };
  corner?: boolean;
}) {
  return (
    <span
      style={{
        position: 'absolute',
        top: corner ? '-0.35rem' : '0.3rem',
        right: corner ? '-0.45rem' : '0.5rem',
        fontSize: '0.52rem',
        fontWeight: 700,
        padding: '0.1rem 0.28rem',
        borderRadius: '9999px',
        background: badge.color ?? '#bbf7d0',
        color: badge.color ? '#fff' : '#15803d',
        minWidth: '1rem',
        textAlign: 'center',
        lineHeight: 1.4,
        pointerEvents: 'none',
      }}
    >
      {badge.count}
    </span>
  );
}

// ─── Indicador activo (barra top) ─────────────────────────────────────────────

function ActiveBar({ accent }: { accent: string }) {
  return (
    <span
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '2rem',
        height: '2.5px',
        borderRadius: '0 0 3px 3px',
        background: accent,
      }}
    />
  );
}

// ─── BottomNav ────────────────────────────────────────────────────────────────

export function BottomNav({
  tab,
  setTab,
  accounts,
  projections,
  realExpenses,
  transferCount,
  goals,
  computedAlerts,
  T,
  toast,
}: BottomNavProps) {
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);

  const moreActive = MORE_IDS.has(tab as string);
  const alertsBadge = getBadge('alerts', accounts, projections, realExpenses, transferCount, goals, computedAlerts);

  function handlePrimary(id: string) {
    if (REQUIRES_ACCOUNT.has(id) && accounts.length === 0) {
      toast(t('appShell.header.blockedTabToast', { label: t(`appShell.tabs.${id}`) }), 'warning');
      return;
    }
    setTab(id);
  }

  function handleMore(id: string) {
    if (REQUIRES_ACCOUNT.has(id) && accounts.length === 0) {
      toast(t('appShell.header.blockedTabToast', { label: t(`appShell.tabs.${id}`) }), 'warning');
      return;
    }
    setTab(id);
    setShowMore(false);
  }

  return (
    <>
      {/* ── Panel "Más" ── */}
      {showMore && (
        <>
          <div
            onClick={() => setShowMore(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              zIndex: 59,
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
            }}
          />
          <div
            style={{
              position: 'fixed',
              bottom: 'calc(60px + env(safe-area-inset-bottom, 0px))',
              left: 0,
              right: 0,
              background: T.cardBg,
              borderTop: `1px solid ${T.cardBorder}`,
              borderRadius: '1.25rem 1.25rem 0 0',
              zIndex: 60,
              padding: '0.75rem 0.75rem 1rem',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '0.875rem' }}>
              <div
                style={{
                  width: '2.5rem',
                  height: '0.25rem',
                  background: T.cardBorder,
                  borderRadius: '9999px',
                  margin: '0 auto',
                }}
              />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.25rem',
              }}
            >
              {MORE_TABS.map(({ id, icon: Icon }) => {
                const active = tab === id;
                const blocked = REQUIRES_ACCOUNT.has(id) && accounts.length === 0;
                const badge = getBadge(id, accounts, projections, realExpenses, transferCount, goals, computedAlerts);
                const label = id === 'categories'
                  ? t('appShell.tabs.categories')
                  : t(`appShell.tabs.${id}`);
                return (
                  <button
                    key={id}
                    onClick={() => !blocked && handleMore(id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.875rem 0.5rem',
                      borderRadius: '0.875rem',
                      border: 'none',
                      background: active ? `${T.accent}1a` : 'transparent',
                      cursor: blocked ? 'not-allowed' : 'pointer',
                      position: 'relative',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <Icon
                        size={22}
                        color={blocked ? T.muted : active ? T.accent : T.title}
                        style={{ opacity: blocked ? 0.4 : 1, display: 'block' }}
                      />
                      {badge && !blocked && <BadgeChip badge={badge} />}
                    </div>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: active ? 700 : 500,
                        color: blocked ? T.muted : active ? T.accent : T.muted,
                        lineHeight: 1.2,
                        textAlign: 'center',
                      }}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Barra de navegación inferior ── */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          background: T.headerBg,
          borderTop: `1px solid ${T.headerBorder}`,
          display: 'flex',
          alignItems: 'stretch',
          zIndex: 50,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {PRIMARY_TABS.map(({ id, icon: Icon }) => {
          const active = tab === id;
          const blocked = REQUIRES_ACCOUNT.has(id) && accounts.length === 0;
          const badge = getBadge(id, accounts, projections, realExpenses, transferCount, goals, computedAlerts);
          return (
            <button
              key={id}
              onClick={() => handlePrimary(id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.2rem',
                padding: '0.5rem 0.25rem 0.4rem',
                border: 'none',
                background: 'transparent',
                cursor: blocked ? 'not-allowed' : 'pointer',
                flex: 1,
                position: 'relative',
                WebkitTapHighlightColor: 'transparent',
                minWidth: 0,
              }}
            >
              {active && <ActiveBar accent={T.accent} />}
              <div style={{ position: 'relative' }}>
                <Icon
                  size={22}
                  color={blocked ? T.muted : active ? T.accent : T.navInactive}
                  style={{ opacity: blocked ? 0.35 : 1, display: 'block' }}
                />
                {badge && !blocked && <BadgeChip badge={badge} />}
              </div>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: active ? 700 : 500,
                  color: blocked ? T.muted : active ? T.accent : T.navInactive,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {t(`appShell.tabs.${id}`)}
              </span>
            </button>
          );
        })}

        {/* Botón Más */}
        <button
          onClick={() => setShowMore((v) => !v)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.2rem',
            padding: '0.5rem 0.25rem 0.4rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            flex: 1,
            position: 'relative',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {moreActive && <ActiveBar accent={T.accent} />}
          <div style={{ position: 'relative' }}>
            <MoreHorizontal
              size={22}
              color={moreActive || showMore ? T.accent : T.navInactive}
              style={{ display: 'block' }}
            />
            {/* Badge de alertas visible en "Más" cuando alerts no es la tab activa */}
            {alertsBadge && tab !== 'alerts' && (
              <BadgeChip badge={alertsBadge} />
            )}
          </div>
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: moreActive ? 700 : 500,
              color: moreActive || showMore ? T.accent : T.navInactive,
              lineHeight: 1,
            }}
          >
            {t('appShell.tabs.more')}
          </span>
        </button>
      </nav>
    </>
  );
}
