// ─── Modal de alta / edición de movimientos reales ───────────────────────────
// Extraído de RealExpenses.tsx (Fase 3, paso 1).

import { useState, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';
import { useApp } from '../../AppContext';
import { CURRENCIES, fmtDateDMY } from '../../utils';
import {
  Field, Input, Sel, PrimaryBtn, SecondaryBtn, QuickCategoryModal,
} from '../UI';

export type RealExpenseFormValues = {
  entryDate: string;
  valueDate: string;
  description: string;
  categoryId: string;
  amount: string;
  currency: string;
  type: 'income' | 'expense';
  accountId: string;
  notes: string;
};

type Props = {
  mode: 'add' | 'edit';
  initialValues: RealExpenseFormValues;
  onSave: (values: RealExpenseFormValues) => void;
  onClose: () => void;
};

export function RealExpenseFormModal({ mode, initialValues, onSave, onClose }: Props) {
  const { T, accounts, categories, baseCurrency, dateFormat } = useApp();
  const [form, setForm] = useState<RealExpenseFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showQuickCategory, setShowQuickCategory] = useState(false);

  const handleAccountChange = (accountId: string) => {
    const acc = accounts.find((a) => a.id === accountId);
    setForm((f) => ({
      ...f,
      accountId,
      currency: acc?.currency ?? baseCurrency,
    }));
    setErrors((e) => ({ ...e, accountId: undefined as any }));
  };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.description.trim()) e.description = 'La descripción es obligatoria';
    if (!form.accountId) e.accountId = 'Debes seleccionar una cuenta';
    if (!form.categoryId) e.categoryId = 'Debes seleccionar una categoría';
    if (!form.amount || +form.amount <= 0) e.amount = 'Introduce un importe válido';
    if (!form.entryDate) e.entryDate = 'La fecha de apunte es obligatoria';
    if (!form.valueDate) e.valueDate = 'La fecha de valor es obligatoria';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSave(form);
  };

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)', overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: T.cardBg, border: `1px solid ${T.cardBorder}`,
          borderRadius: '1.5rem', boxShadow: T.cardShadowLg,
          width: '100%', maxWidth: '34rem', maxHeight: '90vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'fadeSlideIn 0.2s ease both',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.5rem 0.75rem',
            borderBottom: `1px solid ${T.cardBorder}`,
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: '1rem', flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: T.title, letterSpacing: '-0.02em', margin: 0 }}>
              {mode === 'add' ? 'Nuevo movimiento' : 'Editar movimiento'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: T.muted, marginTop: '0.25rem' }}>
              Registra un ingreso o gasto real
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.4rem', borderRadius: '0.625rem', border: 'none',
              background: T.btnSecBg, color: T.muted, cursor: 'pointer',
              display: 'flex', alignItems: 'center', flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1rem 1.5rem 1.5rem', overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {/* Tipo */}
          <Field label="Tipo de movimiento">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
              {([
                ['income',  '📈', 'Ingreso', T.green, T.greenBg,           T.greenBorder],
                ['expense', '📉', 'Gasto',   T.red,   T.redBg ?? T.amberBg, T.redBorder ?? T.amberBorder],
              ] as const).map(([val, icon, label, color, bg]) => (
                <div
                  key={val}
                  onClick={() => setForm((f) => ({ ...f, type: val, categoryId: '' }))}
                  style={{
                    padding: '1rem', borderRadius: '0.875rem', cursor: 'pointer',
                    border: `2px solid ${form.type === val ? color : T.cardBorder}`,
                    background: form.type === val ? bg : T.pageBg,
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{icon}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: form.type === val ? color : T.muted }}>
                    {label}
                  </span>
                  {form.type === val && <Check size={14} color={color} style={{ marginLeft: 'auto' }} />}
                </div>
              ))}
            </div>
          </Field>

          <Field label="Descripción" error={errors.description}>
            <Input
              T={T}
              error={errors.description}
              placeholder="Ej: Compra supermercado"
              value={form.description}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setForm({ ...form, description: e.target.value });
                setErrors((er) => ({ ...er, description: undefined as any }));
              }}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Cuenta *" error={errors.accountId}>
              <Sel
                T={T}
                value={form.accountId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleAccountChange(e.target.value)}
              >
                <option value="">— Cuenta —</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </Sel>
            </Field>
            <Field label="Categoría *" error={errors.categoryId}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <Sel
                    T={T}
                    value={form.categoryId}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                      setForm({ ...form, categoryId: e.target.value });
                      setErrors((er) => ({ ...er, categoryId: undefined as any }));
                    }}
                  >
                    <option value="">— Categoría —</option>
                    {categories
                      .filter((c) => c.type === form.type)
                      .map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                  </Sel>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickCategory(true)}
                  style={{
                    padding: '0.65rem 0.75rem', borderRadius: '0.75rem',
                    border: `1.5px solid ${T.accent}44`, background: T.accentLight,
                    color: T.accent, fontSize: '1rem', fontWeight: 800,
                    cursor: 'pointer', flexShrink: 0, lineHeight: 1,
                  }}
                >
                  +
                </button>
              </div>
            </Field>
          </div>

          {showQuickCategory && (
            <QuickCategoryModal
              T={T}
              defaultType={form.type}
              onSave={(newCat) => {
                setForm((f) => ({ ...f, categoryId: newCat.id }));
                setShowQuickCategory(false);
              }}
              onClose={() => setShowQuickCategory(false)}
            />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Importe" error={errors.amount}>
              <Input
                T={T}
                error={errors.amount}
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setForm({ ...form, amount: e.target.value });
                  setErrors((er) => ({ ...er, amount: undefined as any }));
                }}
              />
            </Field>
            <Field label="Divisa">
              <Sel
                T={T}
                value={form.currency}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setForm({ ...form, currency: e.target.value })
                }
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                ))}
              </Sel>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Fecha de apunte" error={errors.entryDate}>
              <Input
                T={T}
                error={errors.entryDate}
                type="date"
                value={form.entryDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setForm({ ...form, entryDate: e.target.value });
                  setErrors((er) => ({ ...er, entryDate: undefined as any }));
                }}
              />
              {form.entryDate && (
                <p style={{ fontSize: '0.7rem', color: T.muted, marginTop: '0.3rem' }}>
                  📅 {fmtDateDMY(form.entryDate, dateFormat)}
                </p>
              )}
              <p style={{ fontSize: '0.68rem', color: T.muted, marginTop: '0.25rem' }}>
                📋 Cuándo lo registras tú
              </p>
            </Field>
            <Field label="Fecha de valor" error={errors.valueDate}>
              <Input
                T={T}
                error={errors.valueDate}
                type="date"
                value={form.valueDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setForm({ ...form, valueDate: e.target.value });
                  setErrors((er) => ({ ...er, valueDate: undefined as any }));
                }}
              />
              {form.valueDate && (
                <p style={{ fontSize: '0.7rem', color: T.muted, marginTop: '0.3rem' }}>
                  📅 {fmtDateDMY(form.valueDate, dateFormat)}
                </p>
              )}
              <p style={{ fontSize: '0.68rem', color: T.muted, marginTop: '0.25rem' }}>
                💸 Cuándo salió el dinero realmente
              </p>
            </Field>
          </div>

          <Field label="Notas (opcional)">
            <Input
              T={T}
              placeholder="Añade una nota..."
              value={form.notes}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, notes: e.target.value })
              }
            />
          </Field>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem', borderTop: `1px solid ${T.cardBorder}`,
            background: T.cardBg, display: 'flex', gap: '0.75rem', flexShrink: 0,
          }}
        >
          <PrimaryBtn onClick={handleSave} fullWidth>
            <Check size={15} /> Guardar movimiento
          </PrimaryBtn>
          <SecondaryBtn onClick={onClose} T={T}>
            Cancelar
          </SecondaryBtn>
        </div>
      </div>
    </div>,
    document.body
  );
}
