import { useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import { useApp } from '../AppContext';
import { useToast } from '../contexts/ToastContext';
import {
  Card,
  ConfirmModal,
  Field,
  Input,
  Sel,
  PrimaryBtn,
  SecondaryBtn,
  GhostBtn,
  QuickCategoryModal,
} from '../components/UI';

const uid = () => crypto.randomUUID();

const CATEGORY_COLORS = [
  '#1d4ed8',
  '#7c3aed',
  '#db2777',
  '#dc2626',
  '#ea580c',
  '#ca8a04',
  '#16a34a',
  '#0891b2',
  '#0d9488',
  '#4f46e5',
];

// ─── Group ────────────────────────────────────────────────────────────────────
function Group({
  title,
  items,
  type,
  T,
  isMobile,
  projections,
  openEdit,
  del,
}: {
  title: string;
  items: any[];
  type: 'income' | 'expense';
  T: any;
  isMobile: boolean;
  projections: any[];
  openEdit: (cat: any) => void;
  del: (id: string) => void;
}) {
  const { t } = useTranslation();
  const { realExpenses, goals } = useApp();
  const px = isMobile ? '1rem' : '1.75rem';

  return (
    <Card T={T}>
      <div style={{ padding: `1.25rem ${px} 0.75rem` }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            marginBottom: '0.25rem',
          }}
        >
          {type === 'income' ? (
            <ArrowUpCircle size={18} color={T.green} />
          ) : (
            <ArrowDownCircle size={18} color={T.red} />
          )}
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: type === 'income' ? T.green : T.red,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            fontSize: '1.125rem',
            fontWeight: 800,
            color: T.title,
            letterSpacing: '-0.02em',
          }}
        >
          {t('categories.count', { count: items.length })}
        </div>
      </div>
      <div
        style={{
          padding: `0 ${px} ${px}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        {items.map((cat) => {
          const usedByProjections = projections.filter(
            (p) => p.categoryId === cat.id
          );
          const usedByReals = realExpenses.filter(
            (e) => e.categoryId === cat.id
          );
          const usedByGoals = goals.filter(
            (g) => g.mode === 'auto' && g.categoryId === cat.id
          );

          return (
            <div
              key={cat.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.875rem 1rem',
                borderRadius: '0.875rem',
                background: T.pageBg,
                border: `1px solid ${T.cardBorder}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: '0.75rem',
                    height: '0.75rem',
                    borderRadius: '50%',
                    background: cat.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: T.body,
                  }}
                >
                  {cat.name}
                </span>

                {usedByProjections.length > 0 && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      background: T.amberBg,
                      color: T.amber,
                      border: `1px solid ${T.amberBorder}`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {t('categories.usedByProjections', { count: usedByProjections.length })}
                  </span>
                )}

                {usedByReals.length > 0 && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      background: T.redBg,
                      color: T.red,
                      border: `1px solid ${T.redBorder}`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {t('categories.usedByReals', { count: usedByReals.length })}
                  </span>
                )}

                {usedByGoals.length > 0 && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      background: T.accentLight,
                      color: T.accent,
                      border: `1px solid ${T.accent}33`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {t('categories.usedByGoals', { count: usedByGoals.length })}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                <GhostBtn
                  onClick={() => openEdit(cat)}
                  T={T}
                  aria-label={`Editar ${cat.name}`}
                >
                  <Pencil size={14} />
                </GhostBtn>
                <GhostBtn
                  onClick={() => del(cat.id)}
                  T={T}
                  color={T.red}
                  aria-label={`Eliminar ${cat.name}`}
                >
                  <Trash2 size={14} />
                </GhostBtn>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '1.5rem',
              color: T.muted,
              fontSize: '0.875rem',
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
              {type === 'income' ? t('categories.noIncomeCategories') : t('categories.noExpenseCategories')}
            </p>
            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              {t('categories.empty')}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Categories ───────────────────────────────────────────────────────────────
export function Categories() {
  const { t } = useTranslation();
  const { T, categories, setCategories, deleteCategory, projections, realExpenses, goals, categoryRules, setCategoryRules } =
    useApp();
  const isMobile = useIsMobile();
  const toast = useToast();

  const [modal, setModal] = useState<null | 'add' | string>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [ruleForm, setRuleForm] = useState({ categoryId: '', keywords: '' });
  // 🗑️ B3 — Confirmación antes de borrar regla
  const [confirmDeleteRule, setConfirmDeleteRule] = useState<any>(null);
  // ➕ B4 — Crear categoría rápida desde el modal de reglas
  const [showRuleQuickCategory, setShowRuleQuickCategory] = useState(false);

  const saveRule = () => {
    if (!ruleForm.categoryId || !ruleForm.keywords.trim()) return;
    const keywords = ruleForm.keywords.split(',').map((k) => k.trim()).filter(Boolean);
    if (editingRule) {
      setCategoryRules((prev: any[]) =>
        prev.map((r: any) => r.id === editingRule.id ? { ...r, categoryId: ruleForm.categoryId, keywords } : r)
      );
    } else {
      setCategoryRules((prev: any[]) => [...prev, { id: uid(), categoryId: ruleForm.categoryId, keywords }]);
    }
    setEditingRule(null);
    setRuleForm({ categoryId: '', keywords: '' });
    toast(t('categories.rules.toastSaved'), 'success');
  };
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'expense',
    color: CATEGORY_COLORS[0],
  });

  const openAdd = () => {
    setForm({ name: '', type: 'expense', color: CATEGORY_COLORS[0] });
    setModal('add');
  };

  const openEdit = (cat: any) => {
    setForm({ ...cat });
    setModal(cat.id);
  };

  const save = () => {
    if (!form.name) return;
    if (modal === 'add') {
      setCategories((p: any[]) => [...p, { ...form, id: crypto.randomUUID() }]);
      toast(t('categories.toastCreated'), 'success');
    } else {
      setCategories((p: any[]) =>
        p.map((c) => (c.id === modal ? { ...c, ...form } : c))
      );
      toast(t('categories.toastUpdated'), 'success');
    }
    setModal(null);
  };

  const del = (id: string) => {
    const usedByProjections = projections.filter(
      (p: any) => p.categoryId === id
    );
    const usedByReals = realExpenses.filter((e: any) => e.categoryId === id);
    const usedByGoals = goals.filter(
      (g: any) => g.mode === 'auto' && g.categoryId === id
    );
    setConfirmDelete({ id, usedByProjections, usedByReals, usedByGoals });
  };

  const confirmDel = () => {
    deleteCategory(confirmDelete.id);
    toast(t('categories.toastDeleted'), 'success');
    setConfirmDelete(null);
  };

  const catToDelete = confirmDelete
    ? categories.find((c: any) => c.id === confirmDelete.id)
    : null;

  const hasImpact =
    confirmDelete &&
    (confirmDelete.usedByProjections.length > 0 ||
      confirmDelete.usedByReals.length > 0 ||
      confirmDelete.usedByGoals.length > 0);

  return (
    <div className="fh-print-section">
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
              color: T.muted,
              textTransform: 'uppercase',
              marginBottom: '0.4rem',
            }}
          >
            {t('categories.overline')}
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
            {t('categories.title')}
          </h2>
          <p
            style={{ fontSize: '0.9rem', color: T.muted, marginTop: '0.4rem' }}
          >
            {t('categories.subtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowRulesModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.125rem',
              borderRadius: '0.75rem',
              border: `1.5px solid ${T.cardBorder}`,
              background: T.pageBg,
              color: T.body,
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {t('categories.rules.btn')}
            {categoryRules.length > 0 && (
              <span style={{
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                background: T.accentLight,
                color: T.accent,
                fontSize: '0.65rem',
                fontWeight: 800,
              }}>
                {categoryRules.length}
              </span>
            )}
          </button>
          <PrimaryBtn onClick={openAdd}>
            <Plus size={15} />
            {t('categories.form.newTitle')}
          </PrimaryBtn>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '1.5rem',
        }}
      >
        <Group
          title={t('categories.tabs.income')}
          items={categories.filter((c: any) => c.type === 'income')}
          type="income"
          T={T}
          isMobile={isMobile}
          projections={projections}
          openEdit={openEdit}
          del={del}
        />
        <Group
          title={t('categories.tabs.expense')}
          items={categories.filter((c: any) => c.type === 'expense')}
          type="expense"
          T={T}
          isMobile={isMobile}
          projections={projections}
          openEdit={openEdit}
          del={del}
        />
      </div>

            {/* ── Modal reglas de auto-categorización ── */}
            {showRulesModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
        <div style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: '1.5rem', boxShadow: T.cardShadowLg, width: '100%', maxWidth: '36rem', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeSlideIn 0.2s ease both' }}>
          {/* Header fijo */}
          <div style={{ padding: '1rem 1.5rem 0.75rem', borderBottom: `1px solid ${T.cardBorder}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', background: T.cardBg, flexShrink: 0 }}>
          </div>

          <div style={{ padding: '1rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1, minHeight: 0 }}>
              {/* Lista de reglas existentes */}
              {categoryRules.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {categoryRules.map((rule: any) => {
                    const cat = categories.find((c: any) => c.id === rule.categoryId);
                    return (
                      <div key={rule.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.875rem', background: T.pageBg, border: `1px solid ${T.cardBorder}` }}>
                        <span style={{ width: '0.625rem', height: '0.625rem', borderRadius: '50%', background: cat?.color ?? T.cardBorder, display: 'inline-block', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: T.title }}>{cat?.name ?? t('categories.noCategory')}</div>
                          <div style={{ fontSize: '0.72rem', color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {rule.keywords.join(', ')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                          <GhostBtn onClick={() => { setEditingRule(rule); setRuleForm({ categoryId: rule.categoryId, keywords: rule.keywords.join(', ') }); }} T={T}>
                            <Pencil size={14} />
                          </GhostBtn>
                          <GhostBtn onClick={() => setConfirmDeleteRule(rule)} T={T} color={T.red}>
                            <Trash2 size={14} />
                          </GhostBtn>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2.5rem 2rem', color: T.muted }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem', opacity: 0.3 }}>⚙️</div>
                  <p style={{ fontWeight: 700, color: T.title, marginBottom: '0.25rem', fontSize: '1rem' }}>{t('categories.rules.emptyTitle')}</p>
                  <p style={{ fontSize: '0.825rem', lineHeight: 1.5 }}>
                    {t('categories.rules.emptyBody')}
                  </p>
                </div>
              )}

              {/* Formulario nueva / editar regla */}
              <div style={{ padding: '1.25rem', borderRadius: '1rem', background: editingRule ? T.accentLight : T.pageBg, border: `1.5px solid ${editingRule ? T.accent : T.cardBorder}`, transition: 'all 0.2s' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: editingRule ? T.accent : T.muted, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.875rem' }}>
                  {editingRule ? t('categories.rules.editingTitle') : t('categories.rules.newTitle')}
                </div>
                <Field label={t('categories.form.category')}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <Sel T={T} value={ruleForm.categoryId} onChange={(e: any) => setRuleForm((r) => ({ ...r, categoryId: e.target.value }))}>
                        <option value="">{t('categories.form.categorySelectPlaceholder')}</option>
                        {categories.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name} ({c.type === 'income' ? t('categories.typeIncome') : t('categories.typeExpense')})</option>
                        ))}
                      </Sel>
                    </div>
                    {/* ➕ B4 — Botón rápido para crear categoría sin salir del modal */}
                    <button
                      type="button"
                      onClick={() => setShowRuleQuickCategory(true)}
                      title={t('categories.form.newCategoryTooltip')}
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
                </Field>
                <Field label={t('categories.form.keywords')}>
                  <Input
                    T={T}
                    placeholder={t('categories.form.keywordsPlaceholder')}
                    value={ruleForm.keywords}
                    onChange={(e: any) => setRuleForm((r) => ({ ...r, keywords: e.target.value }))}
                  />
                </Field>
                <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.25rem' }}>
                  <PrimaryBtn
                    onClick={saveRule}
                    fullWidth
                    disabled={!ruleForm.categoryId || !ruleForm.keywords.trim()}
                  >
                    <Check size={15} />
                    {editingRule ? t('common.updateRule') : t('common.saveRule')}
                  </PrimaryBtn>
                  {editingRule && (
                    <SecondaryBtn onClick={() => { setEditingRule(null); setRuleForm({ categoryId: '', keywords: '' }); }} T={T}>
                      {t('common.cancel')}
                    </SecondaryBtn>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ➕ B4 — Modal rápido para crear categoría sin perder el contexto */}
          {showRuleQuickCategory && (
            <QuickCategoryModal
              T={T}
              defaultType="expense"
              onSave={(newCat: any) => {
                // Auto-seleccionamos la categoría recién creada en el formulario
                setRuleForm((r) => ({ ...r, categoryId: newCat.id }));
                setShowRuleQuickCategory(false);
              }}
              onClose={() => setShowRuleQuickCategory(false)}
            />
          )}
        </div>,
        document.body
      )}

{/* ── Modal de creación / edición ── */}
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
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                background: T.cardBg,
                border: `1px solid ${T.cardBorder}`,
                borderRadius: '1.5rem',
                boxShadow: T.cardShadowLg,
                width: '100%',
                maxWidth: '34rem',
                maxHeight: '90vh',
                // 🆕 B2 — Layout flex: header fijo, body scroll, footer fijo
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'fadeSlideIn 0.2s ease both',
              }}
            >
              {/* Header fijo */}
              <div
                style={{
                  padding: '1rem 1.5rem 0.75rem',
                  borderBottom: `1px solid ${T.cardBorder}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexShrink: 0,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: T.title,
                      letterSpacing: '-0.02em',
                      margin: 0,
                    }}
                  >
                    {modal === 'add' ? t('categories.form.newTitle') : t('categories.form.editTitle')}
                  </h2>
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: T.muted,
                      marginTop: '0.25rem',
                    }}
                  >
                    {t('categories.form.modalSubtitle')}
                  </p>
                </div>
                <button
                  onClick={() => setModal(null)}
                  style={{
                    padding: '0.4rem',
                    borderRadius: '0.625rem',
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

              {/* Body scrollable */}
              <div style={{ padding: '1rem 1.5rem 1.5rem', overflowY: 'auto', flex: 1, minHeight: 0 }}>
                <Field label={t('categories.form.name')}>
                  <Input
                    T={T}
                    placeholder={t('categories.form.namePlaceholder')}
                    value={form.name}
                    onChange={(e: any) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </Field>

                <Field label={t('categories.form.type')}>
                  <Sel
                    T={T}
                    value={form.type}
                    onChange={(e: any) =>
                      setForm({ ...form, type: e.target.value })
                    }
                  >
                    <option value="income">{t('categories.typeIncome')}</option>
                    <option value="expense">{t('categories.typeExpense')}</option>
                  </Sel>
                </Field>

                <Field label={t('categories.form.color')}>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.625rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    {CATEGORY_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setForm({ ...form, color: c })}
                        style={{
                          width: '2.25rem',
                          height: '2.25rem',
                          borderRadius: '50%',
                          border:
                            form.color === c
                              ? `3px solid ${T.title}`
                              : '3px solid transparent',
                          background: c,
                          cursor: 'pointer',
                          transform:
                            form.color === c ? 'scale(1.2)' : 'scale(1)',
                          transition: 'all 0.15s',
                          boxShadow:
                            form.color === c
                              ? `0 0 0 2px white, 0 0 0 4px ${c}`
                              : 'none',
                        }}
                      />
                    ))}
                  </div>
                </Field>

                </div>

{/* Footer fijo */}
<div
  style={{
    padding: '1rem 1.5rem',
    borderTop: `1px solid ${T.cardBorder}`,
    background: T.cardBg,
    display: 'flex',
    gap: '0.75rem',
    flexShrink: 0,
  }}
>
  <PrimaryBtn onClick={save} fullWidth>
    <Check size={15} />
    {t('common.save')}
  </PrimaryBtn>
  <SecondaryBtn onClick={() => setModal(null)} T={T}>
    {t('common.cancel')}
  </SecondaryBtn>
</div>
</div>
</div>,
document.body
)}

{/* ── Modal confirmar eliminar ── */}
{confirmDelete && (
        <ConfirmModal
          T={T}
          danger={true}
          title={t('categories.confirm.deleteTitle')}
          message={
            <>
              <span>
                {t('categories.confirm.deleteMsg', { name: catToDelete?.name ?? '' })}
              </span>

              {hasImpact && (
                <span
                  style={{
                    display: 'block',
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: '0.625rem',
                    background: T.amberBg,
                    border: `1px solid ${T.amberBorder}`,
                    fontSize: '0.775rem',
                    color: T.amber,
                    lineHeight: 1.6,
                  }}
                >
                  {t('categories.confirm.hasImpact')}
                  <span style={{ display: 'block', marginTop: '0.375rem' }}>
                    {confirmDelete.usedByReals.length > 0 && (
                      <span style={{ display: 'block' }}>
                        {t('categories.usedByReals', { count: confirmDelete.usedByReals.length })}
                      </span>
                    )}
                    {confirmDelete.usedByProjections.length > 0 && (
                      <span style={{ display: 'block' }}>
                        {t('categories.usedByProjections', { count: confirmDelete.usedByProjections.length })}
                      </span>
                    )}
                    {confirmDelete.usedByGoals.length > 0 && (
                      <span style={{ display: 'block' }}>
                        {t('categories.usedByGoals', { count: confirmDelete.usedByGoals.length })}
                      </span>
                    )}
                  </span>
                </span>
              )}

              {!hasImpact && (
                <span style={{ display: 'block', marginTop: '0.5rem' }}>
                  {t('categories.confirm.noImpact')}
                </span>
              )}
            </>
          }
          onConfirm={confirmDel}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
