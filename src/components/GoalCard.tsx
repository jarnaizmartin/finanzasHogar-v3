import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../AppContext';
import { useToast } from '../contexts/ToastContext';
import type { SavingsGoal } from '../types';
import { calcGoalProgress, fmt } from '../utils';
import { Card, GhostBtn } from './UI';

export function GoalCard({
  goal,
  onEdit,
  onDelete,
}: {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (id: string) => void;
}) {
  const { T, accounts, categories, realExpenses, rates, setGoals } = useApp();
  const toast = useToast();
  const prog = calcGoalProgress(goal, realExpenses, accounts, rates);
  const cat = categories.find((c) => c.id === goal.categoryId);
  const acc = accounts.find((a) => a.id === goal.accountId);
  const [editingAmount, setEditingAmount] = useState(false);
  const [editingAmountValue, setEditingAmountValue] = useState('');

  const saveAmount = () => {
    const parsed = parseFloat(editingAmountValue);
    if (isNaN(parsed) || parsed < 0) {
      toast('Importe no válido', 'error');
      return;
    }
    setGoals((prev) =>
      prev.map((g) => (g.id === goal.id ? { ...g, currentAmount: parsed } : g))
    );
    toast('Importe actualizado correctamente', 'success');
    setEditingAmount(false);
    setEditingAmountValue('');
  };

  // ⬇️⬇️⬇️ AQUÍ pega EXACTAMENTE el bloque JSX original del GoalCard ⬇️⬇️⬇️
  // Copia desde `const catLabel =` (línea ~74) hasta el `);` final del return (línea ~528 aprox.)
  // SIN incluir la llave de cierre `}` de la función.

  const catLabel =
    goal.categoryId === '__transfer__' ? (
      <span>↔ Traspasos</span>
    ) : cat ? (
      <span>{cat.name}</span>
    ) : null;

  const accLabel =
    goal.accountId !== 'all' && acc ? <span>· {acc.name}</span> : null;

  return (
    <Card
      T={T}
      style={{
        position: 'relative',
        overflow: 'hidden',
        border: prog.completed
          ? `2px solid ${T.green}`
          : `1px solid ${T.cardBorder}`,
      }}
    >
      {/* … TODO el JSX original de GoalCard sin cambios … */}
    </Card>
  );
}

// ─── GoalCard ─────────────────────────────────────────────────────────────────
function GoalCard({
  goal,
  onEdit,
  onDelete,
}: {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (id: string) => void;
}) {
  const { T, accounts, categories, realExpenses, rates, setGoals } = useApp();
  const toast = useToast();
  const prog = calcGoalProgress(goal, realExpenses, accounts, rates);
  const cat = categories.find((c) => c.id === goal.categoryId);
  const acc = accounts.find((a) => a.id === goal.accountId);
  const [editingAmount, setEditingAmount] = useState(false);
  const [editingAmountValue, setEditingAmountValue] = useState('');

  const saveAmount = () => {
    const parsed = parseFloat(editingAmountValue);
    if (isNaN(parsed) || parsed < 0) {
      toast('Importe no válido', 'error');
      return;
    }
    setGoals((prev) =>
      prev.map((g) => (g.id === goal.id ? { ...g, currentAmount: parsed } : g))
    );
    toast('Importe actualizado correctamente', 'success');
    setEditingAmount(false);
    setEditingAmountValue('');
  };

  const catLabel =
    goal.categoryId === '__transfer__' ? (
      <span>↔ Traspasos</span>
    ) : cat ? (
      <span>{cat.name}</span>
    ) : null;

  const accLabel =
    goal.accountId !== 'all' && acc ? <span>· {acc.name}</span> : null;

  return (
    <Card
      T={T}
      style={{
        position: 'relative',
        overflow: 'hidden',
        border: prog.completed
          ? `2px solid ${T.green}`
          : `1px solid ${T.cardBorder}`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '0.375rem',
          background: goal.color,
        }}
      />
      <div style={{ padding: '1.5rem 1.5rem 1.5rem 1.875rem' }}>
        {/* Cabecera */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '1.125rem',
          }}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}
          >
            <span style={{ fontSize: '2rem' }}>{goal.emoji}</span>
            <div>
              <div
                style={{ fontSize: '1rem', fontWeight: 800, color: T.title }}
              >
                {goal.name}
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: T.muted,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  marginTop: '0.1rem',
                }}
              >
                {goal.mode === 'auto' ? (
                  <>
                    <span
                      style={{
                        padding: '0.1rem 0.4rem',
                        borderRadius: '9999px',
                        background: T.accentLight,
                        color: T.accent,
                        fontWeight: 700,
                      }}
                    >
                      ⚡ Auto
                    </span>
                    {catLabel}
                    {accLabel}
                  </>
                ) : (
                  <span
                    style={{
                      padding: '0.1rem 0.4rem',
                      borderRadius: '9999px',
                      background: T.pageBg,
                      color: T.muted,
                      fontWeight: 700,
                    }}
                  >
                    ✍️ Manual
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
            <GhostBtn onClick={() => onEdit(goal)} T={T}>
              <Pencil size={14} />
            </GhostBtn>
            <GhostBtn onClick={() => onDelete(goal.id)} T={T} color={T.red}>
              <Trash2 size={14} />
            </GhostBtn>
          </div>
        </div>

        {/* Barra de progreso */}
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: goal.color,
                  letterSpacing: '-0.02em',
                }}
              >
                {fmt(prog.saved, goal.currency, goal.currency, rates)}
              </span>
              <span
                style={{
                  fontSize: '0.875rem',
                  color: T.muted,
                  marginLeft: '0.375rem',
                }}
              >
                de {fmt(goal.targetAmount, goal.currency, goal.currency, rates)}
              </span>
            </div>
            <div
              style={{
                padding: '0.35rem 0.875rem',
                borderRadius: '9999px',
                background: prog.completed ? T.greenBg : goal.color + '15',
                color: prog.completed ? T.green : goal.color,
                fontSize: '0.875rem',
                fontWeight: 800,
                border: `1px solid ${
                  prog.completed ? T.greenBorder : goal.color + '33'
                }`,
              }}
            >
              {Math.round(prog.pct)}%
            </div>
          </div>
          <div
            style={{
              height: '0.75rem',
              borderRadius: '9999px',
              background: T.pageBg,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: '9999px',
                background: prog.completed
                  ? T.green
                  : `linear-gradient(90deg, ${goal.color}cc, ${goal.color})`,
                width: `${Math.min(prog.pct, 100)}%`,
                transition: 'width 0.6s ease',
                position: 'relative',
              }}
            >
              {prog.pct > 10 && (
                <div
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.5rem',
                    fontWeight: 800,
                    color: '#fff',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {Math.round(prog.pct)}%
                </div>
              )}
            </div>
          </div>
          {prog.completed && (
            <div
              style={{
                textAlign: 'center',
                marginTop: '0.5rem',
                fontSize: '0.825rem',
                fontWeight: 700,
                color: T.green,
              }}
            >
              🎉 ¡Objetivo alcanzado!
            </div>
          )}
        </div>

        {/* Métricas */}
        {!prog.completed && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.625rem',
              marginBottom: '1rem',
            }}
          >
            {[
              {
                label: 'Falta',
                value: fmt(prog.remaining, goal.currency, goal.currency, rates),
                color: T.red,
              },
              {
                label: goal.deadline ? 'Meses restantes' : 'Sin límite',
                value:
                  goal.deadline && prog.monthsLeft !== null
                    ? `${prog.monthsLeft} mes${
                        prog.monthsLeft !== 1 ? 'es' : ''
                      }`
                    : '—',
                color: T.muted,
              },
              {
                label: 'Necesitas/mes',
                value:
                  prog.monthlyNeeded !== null
                    ? fmt(
                        prog.monthlyNeeded,
                        goal.currency,
                        goal.currency,
                        rates
                      )
                    : '—',
                color: T.amber,
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: '0.625rem 0.75rem',
                  borderRadius: '0.75rem',
                  background: T.pageBg,
                  border: `1px solid ${T.cardBorder}`,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    color: T.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '0.2rem',
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 800,
                    color: item.color,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ritmo auto */}
        {goal.mode === 'auto' && prog.monthlyRate > 0 && !prog.completed && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.875rem',
              marginBottom: '1rem',
              background: prog.onTrack ? T.greenBg : T.amberBg,
              border: `1px solid ${
                prog.onTrack ? T.greenBorder : T.amberBorder
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: prog.onTrack ? T.green : T.amber,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {prog.onTrack
                  ? '✅ Vas por buen camino'
                  : '⚠️ Necesitas acelerar'}
              </div>
              <div
                style={{
                  fontSize: '0.775rem',
                  color: prog.onTrack ? T.green : T.amber,
                  marginTop: '0.1rem',
                }}
              >
                Ritmo actual:{' '}
                <strong>
                  {fmt(prog.monthlyRate, goal.currency, goal.currency, rates)}
                  /mes
                </strong>
                {prog.monthlyNeeded !== null && (
                  <>
                    {' '}
                    · Necesitas:{' '}
                    <strong>
                      {fmt(
                        prog.monthlyNeeded,
                        goal.currency,
                        goal.currency,
                        rates
                      )}
                      /mes
                    </strong>
                  </>
                )}
              </div>
            </div>
            {prog.estimatedDate && (
              <div
                style={{
                  fontSize: '0.72rem',
                  color: prog.onTrack ? T.green : T.amber,
                  fontWeight: 600,
                  textAlign: 'right',
                }}
              >
                Estimado: {prog.estimatedDate}
              </div>
            )}
          </div>
        )}

        {/* Proyección manual */}
        {goal.mode === 'manual' &&
          goal.deadline &&
          prog.monthlyNeeded !== null &&
          !prog.completed && (
            <div
              style={{
                padding: '0.625rem 0.875rem',
                borderRadius: '0.75rem',
                marginBottom: '1rem',
                background: T.accentLight,
                border: `1px solid ${T.accent}33`,
                fontSize: '0.775rem',
                color: T.accent,
              }}
            >
              💡 Para llegar a tiempo necesitas ahorrar{' '}
              <strong>
                {fmt(prog.monthlyNeeded, goal.currency, goal.currency, rates)}
                /mes
              </strong>
              {prog.monthsLeft !== null &&
                ` en los próximos ${prog.monthsLeft} meses`}
            </div>
          )}

        {/* Botón actualizar manual */}
        {goal.mode === 'manual' && !prog.completed && (
          <button
            onClick={() => setEditingAmount(true)}
            style={{
              width: '100%',
              padding: '0.65rem',
              borderRadius: '0.75rem',
              border: `1.5px solid ${goal.color}44`,
              background: goal.color + '10',
              color: goal.color,
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            ✏️ Actualizar importe ahorrado
          </button>
        )}

        {/* Panel inline actualizar */}
        {editingAmount && (
          <div
            style={{
              marginTop: '0.75rem',
              padding: '1rem',
              borderRadius: '0.875rem',
              background: T.accentLight,
              border: `1.5px solid ${T.accent}44`,
              animation: 'fadeSlideIn 0.2s ease both',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: T.accent,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.625rem',
              }}
            >
              ✏️ Actualizar importe ahorrado
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: T.muted,
                marginBottom: '0.625rem',
              }}
            >
              Importe actual:{' '}
              <strong style={{ color: T.title }}>
                {fmt(goal.currentAmount, goal.currency, goal.currency, rates)}
              </strong>
            </div>
            <input
              type="number"
              step="0.01"
              min={0}
              autoFocus
              placeholder={`Ej: ${goal.currentAmount || '0.00'}`}
              value={editingAmountValue}
              onChange={(e) => setEditingAmountValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveAmount();
                if (e.key === 'Escape') {
                  setEditingAmount(false);
                  setEditingAmountValue('');
                }
              }}
              style={{
                width: '100%',
                padding: '0.65rem 0.875rem',
                borderRadius: '0.75rem',
                border: `1.5px solid ${T.accent}44`,
                background: T.inputBg,
                color: T.inputText,
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '0.625rem',
              }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={saveAmount}
                disabled={!editingAmountValue.trim()}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  background: T.accent,
                  color: '#ffffff',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  cursor: editingAmountValue.trim() ? 'pointer' : 'not-allowed',
                  opacity: editingAmountValue.trim() ? 1 : 0.5,
                }}
              >
                ✅ Guardar
              </button>
              <button
                onClick={() => {
                  setEditingAmount(false);
                  setEditingAmountValue('');
                }}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '0.75rem',
                  border: `1.5px solid ${T.cardBorder}`,
                  background: T.btnSecBg,
                  color: T.btnSecText,
                  fontSize: '0.825rem',
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
    </Card>
  );
}
