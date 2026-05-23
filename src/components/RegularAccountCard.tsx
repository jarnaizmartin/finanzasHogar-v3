// src/components/RegularAccountCard.tsx
//
// Card de cuenta "normal" (corriente / ahorro / efectivo / otros) en la vista
// Cuentas. Diseño unificado con banda superior de 3 filas (entidad+acciones,
// icono+nombre, saldo real), previsión mensual y acciones.
//
// Extraído de src/views/Accounts.tsx el 24/05/2026 (refactor/accounts, commit 6).

import { Pencil, Trash2, Wallet, AlertTriangle, Receipt } from 'lucide-react';
import { useApp } from '../AppContext';
import { fmtDateDMY } from '../utils';
import { getAccountStyle } from '../lib/accountsConstants';
import { Card } from './UI';
import { InstitutionLogo } from './InstitutionLogo';
import type { Account } from '../types';

interface RegularAccountCardProps {
  account: Account;
  /** Abrir modal de edición. */
  onEdit: (account: Account) => void;
  /** Pedir confirmación de borrado. */
  onDelete: (id: string) => void;
  /** Navegar a la lista de movimientos filtrada por esta cuenta. */
  onViewMovements: (id: string) => void;
}

export function RegularAccountCard({
  account: acc,
  onEdit,
  onDelete,
  onViewMovements,
}: RegularAccountCardProps) {
  const {
    T,
    baseCurrency,
    fmtAccount,
    dateFormat,
    forecastByAccount,
    accountWarnings,
    realBalanceMap,
  } = useApp();

  const warn = accountWarnings[acc.id];
  const fc = forecastByAccount[acc.id] || [];
  const next = fc[0];
  const projectedEnd = acc.balance + fc.reduce((s, m) => s + m.net, 0);

  const accStyle = getAccountStyle(acc.accountType, T);
  const headerAccent = warn ? T.amber : accStyle.accent;
  const headerBg = warn ? T.amberBg : accStyle.tintBg;
  const headerBorder = warn ? T.amberBorder : accStyle.tintBorder;

  const rbInfo = realBalanceMap[acc.id];
  const appliedCount = rbInfo?.appliedCount ?? 0;
  const ignoredCount = rbInfo?.ignoredCount ?? 0;

  return (
    <Card
      T={T}
      style={{
        border: `2px solid ${warn ? T.amberBorder : T.cardBorder}`,
        overflow: 'hidden',
      }}
    >
      {/* ─────────────────────────────────────────────────────────
           BANDA SUPERIOR — diseño unificado tipo fintech
           Estructura fija (3 filas) para todas las cuentas:
             1. Entidad bancaria (top-left) + Acciones (top-right)
             2. Icono + Nombre cuenta + Subtítulo
             3. Saldo real (label izq · valor der)
          ───────────────────────────────────────────────────────── */}
      <div
        style={{
          background: headerBg,
          borderBottom: `1px solid ${headerBorder}`,
          padding: '1.25rem 1.5rem 1.1rem',
        }}
      >
        {/* Fila 1 — Entidad + Acciones */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '1rem',
            minHeight: '1.75rem',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '1rem',
              fontWeight: 800,
              color: headerAccent,
              letterSpacing: '-0.01em',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {acc.institution ? (
              <>
                <InstitutionLogo name={acc.institution} size={16} />
                {acc.institution}
              </>
            ) : (
              <span style={{ opacity: 0.6, fontWeight: 700 }}>Sin entidad</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            {warn && <AlertTriangle size={16} color={T.amber} />}
            <button
              onClick={() => onEdit(acc)}
              title="Editar"
              style={{
                padding: '0.3rem',
                borderRadius: '0.5rem',
                border: `1px solid ${headerBorder}`,
                background: '#ffffff99',
                color: T.muted,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={() => onDelete(acc.id)}
              title="Eliminar"
              style={{
                padding: '0.3rem',
                borderRadius: '0.5rem',
                border: `1px solid ${T.redBorder ?? T.amberBorder}`,
                background: '#ffffff99',
                color: T.red,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Fila 2 — Icono + Nombre cuenta + Subtítulo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.1rem',
          }}
        >
          <div
            style={{
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '0.75rem',
              background: '#ffffffcc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${headerBorder}`,
              flexShrink: 0,
            }}
          >
            <Wallet size={16} color={headerAccent} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: T.title,
                letterSpacing: '-0.01em',
                wordBreak: 'break-word',
                lineHeight: 1.2,
              }}
            >
              {acc.name}
            </div>
            <div
              style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                color: headerAccent,
                opacity: 0.75,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginTop: '0.15rem',
              }}
            >
              {accStyle.label} · {acc.currency ?? baseCurrency}
            </div>
          </div>
        </div>

        {/* Fila 3 — Saldo real (label izq · valor der) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '0.75rem',
            paddingTop: '0.85rem',
            borderTop: `1px dashed ${headerBorder}`,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.07em',
                color: headerAccent,
                opacity: 0.85,
                textTransform: 'uppercase',
                marginBottom: '0.25rem',
              }}
            >
              Saldo real
            </div>
            <div style={{ fontSize: '0.68rem', color: T.muted, lineHeight: 1.4 }}>
              Base {fmtAccount(acc.balance, acc.currency ?? baseCurrency)} · {fmtDateDMY(acc.date, dateFormat)}
            </div>
            <div style={{ fontSize: '0.68rem', color: T.muted, lineHeight: 1.4 }}>
              Mínimo: {fmtAccount(acc.minBalance, acc.currency ?? baseCurrency)}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div
              style={{
                fontSize: 'clamp(1.5rem, 4.5vw, 2rem)',
                fontWeight: 800,
                color: warn ? T.amber : headerAccent,
                letterSpacing: '-0.03em',
                whiteSpace: 'nowrap',
                lineHeight: 1,
              }}
            >
              {fmtAccount(
                rbInfo?.realBalance ?? acc.balance,
                acc.currency ?? baseCurrency
              )}
            </div>
            {(appliedCount > 0 || ignoredCount > 0) && (
              <div
                style={{
                  marginTop: '0.4rem',
                  display: 'flex',
                  gap: '0.35rem',
                  justifyContent: 'flex-end',
                  flexWrap: 'wrap',
                }}
              >
                {appliedCount > 0 && (
                  <span
                    title={`${appliedCount} movimiento${appliedCount !== 1 ? 's' : ''} real${appliedCount !== 1 ? 'es' : ''} aplicado${appliedCount !== 1 ? 's' : ''}`}
                    style={{
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      padding: '0.1rem 0.4rem',
                      borderRadius: '9999px',
                      background: '#ffffffcc',
                      color: T.green,
                      border: `1px solid ${T.greenBorder}`,
                    }}
                  >
                    ✓ {appliedCount}
                  </span>
                )}
                {ignoredCount > 0 && (
                  <span
                    title={`${ignoredCount} movimiento${ignoredCount !== 1 ? 's' : ''} ignorado${ignoredCount !== 1 ? 's' : ''} (anterior${ignoredCount !== 1 ? 'es' : ''} al saldo base)`}
                    style={{
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      padding: '0.1rem 0.4rem',
                      borderRadius: '9999px',
                      background: '#ffffffcc',
                      color: T.amber,
                      border: `1px solid ${T.amberBorder}`,
                    }}
                  >
                    ⚠ {ignoredCount}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body (fondo normal, debajo de la banda de color) */}
      <div style={{ padding: '1.25rem 1.75rem 1.5rem' }}>
        {/* Previsión mensual */}
        {next && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '0.875rem',
              background: T.pageBg,
              marginBottom: '1rem',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.65rem',
                  color: T.muted,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.2rem',
                }}
              >
                Ingresos/mes
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: T.green,
                }}
              >
                {fmtAccount(next.income, acc.currency ?? baseCurrency)}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.65rem',
                  color: T.muted,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.2rem',
                }}
              >
                Gastos/mes
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: T.red,
                }}
              >
                {fmtAccount(next.expense, acc.currency ?? baseCurrency)}
              </div>
            </div>
            <div
              style={{
                gridColumn: '1/-1',
                paddingTop: '0.75rem',
                borderTop: `1px solid ${T.cardBorder}`,
              }}
            >
              <div
                style={{
                  fontSize: '0.65rem',
                  color: T.muted,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.2rem',
                }}
              >
                Saldo proyectado a 12 meses
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  color:
                    projectedEnd >= (acc.minBalance ?? 0)
                      ? T.accent
                      : T.amber,
                }}
              >
                {fmtAccount(projectedEnd, acc.currency ?? baseCurrency)}
              </div>
            </div>
          </div>
        )}

        {/* Aviso saldo mínimo */}
        {warn && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 0.875rem',
              borderRadius: '0.75rem',
              background: T.amberBg,
              border: `1px solid ${T.amberBorder}`,
              marginBottom: '1rem',
            }}
          >
            <AlertTriangle size={14} color={T.amber} />
            <span
              style={{
                fontSize: '0.775rem',
                color: T.amber,
                fontWeight: 600,
              }}
            >
              El saldo proyectado caerá bajo el mínimo
            </span>
          </div>
        )}

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button
            onClick={() => onViewMovements(acc.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.65rem 0.875rem',
              borderRadius: '0.75rem',
              border: `1.5px solid ${T.cardBorder}`,
              background: T.btnSecBg,
              color: T.btnSecText,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <Receipt size={14} />
            Movimientos
          </button>
        </div>
      </div>
    </Card>
  );
}
