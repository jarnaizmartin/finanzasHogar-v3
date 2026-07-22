// src/components/bank-import/RulesEditorModal.tsx
//
// Modal anidada del wizard de importación bancaria.
// Gestiona las reglas de auto-categorización (CRUD).
//
// Extraído de BankImportModal.tsx (refactor Fase 1 — commit 3/8).
// Estado controlado por el padre: facilita la migración a useBankImport (commit 8).

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CSSProperties } from 'react';
import { ConfirmModal } from '../UI';

import type { Category, CategoryRule } from '../../types';
import {
  bankInputStyle,
  bankSelectStyle,
  bankBtnPrimary,
  bankBtnSecondary,
} from '../../lib/bankImportStyles';
import type { Theme } from '../../theme';

// Theme tokens consumidos — subset de T.
type Props = {
  T: Theme;
  categories: Category[];
  categoryRules: CategoryRule[];
  setCategoryRules: React.Dispatch<React.SetStateAction<CategoryRule[]>>;
  deleteCategoryRule: (id: string) => void;
  editingRule: CategoryRule | null;
  setEditingRule: (rule: CategoryRule | null) => void;
  ruleForm: { categoryId: string; keywords: string };
  setRuleForm: React.Dispatch<
    React.SetStateAction<{ categoryId: string; keywords: string }>
  >;
  onSaveRule: () => void;
  onClose: () => void;
  toast: (message: string, type: 'success' | 'error' | 'info') => void;
};

export function RulesEditorModal({
  T,
  categories,
  categoryRules,
  deleteCategoryRule,
  editingRule,
  setEditingRule,
  ruleForm,
  setRuleForm,
  onSaveRule,
  onClose,
  toast,
}: Props) {
  const { t } = useTranslation();
  const [confirmDeleteRuleId, setConfirmDeleteRuleId] = useState<string | null>(null);
  const inputStyle: CSSProperties = bankInputStyle(T);
  const selStyle: CSSProperties = bankSelectStyle(T);
  const btnPrimary: CSSProperties = bankBtnPrimary(T);
  const btnSec: CSSProperties = bankBtnSecondary(T);

  return (
    <>
    {createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'max(1rem, env(safe-area-inset-top, 0px)) 1rem max(1rem, env(safe-area-inset-bottom, 0px))',
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
          maxWidth: '36rem',
          maxHeight: 'min(90svh, 90vh)',
          // 🆕 B2 — Layout flex: header fijo + body scroll
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeSlideIn 0.2s ease both',
        }}
      >
        <div
          style={{
            padding: '1rem 1.5rem 0.75rem',
            borderBottom: `1px solid ${T.cardBorder}`,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            background: T.cardBg,
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
              {t('categories.rules.btn')}
            </h2>
            <p
              style={{
                fontSize: '0.8rem',
                color: T.muted,
                marginTop: '0.25rem',
                lineHeight: 1.5,
                margin: '0.25rem 0 0',
              }}
            >
              {t('bankImport.step1.rulesSubtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
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
        <div
          style={{
            padding: '1rem 1.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
          }}
        >
          {categoryRules.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
              }}
            >
              {categoryRules.map((rule) => {
                const cat = categories.find((c) => c.id === rule.categoryId);
                return (
                  <div
                    key={rule.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.875rem',
                      background: T.pageBg,
                      border: `1px solid ${T.cardBorder}`,
                    }}
                  >
                    <span
                      style={{
                        width: '0.625rem',
                        height: '0.625rem',
                        borderRadius: '50%',
                        background: cat?.color ?? T.cardBorder,
                        display: 'inline-block',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: T.title,
                        }}
                      >
                        {cat?.name ?? t('alerts.content.noCategory')}
                      </div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: T.muted,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {rule.keywords.join(', ')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        onClick={() => {
                          setEditingRule(rule);
                          setRuleForm({
                            categoryId: rule.categoryId,
                            keywords: rule.keywords.join(', '),
                          });
                        }}
                        style={{
                          padding: '0.3rem 0.5rem',
                          borderRadius: '0.5rem',
                          border: `1px solid ${T.cardBorder}`,
                          background: T.btnSecBg,
                          color: T.btnSecText,
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setConfirmDeleteRuleId(rule.id)}
                        style={{
                          padding: '0.3rem 0.5rem',
                          borderRadius: '0.5rem',
                          border: `1px solid ${T.redBorder}`,
                          background: T.redBg,
                          color: T.red,
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '2.5rem 2rem',
                color: T.muted,
              }}
            >
              <div
                style={{
                  fontSize: '3rem',
                  marginBottom: '0.75rem',
                  opacity: 0.3,
                }}
              >
                ⚙️
              </div>
              <p
                style={{
                  fontWeight: 700,
                  color: T.title,
                  marginBottom: '0.25rem',
                  fontSize: '1rem',
                }}
              >
                {t('categories.rules.emptyTitle')}
              </p>
              <p style={{ fontSize: '0.825rem' }}>
                {t('categories.rules.emptyBody')}
              </p>
            </div>
          )}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '1rem',
              background: editingRule ? T.accentLight : T.pageBg,
              border: `1.5px solid ${
                editingRule ? T.accent : T.cardBorder
              }`,
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: editingRule ? T.accent : T.muted,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
                marginBottom: '0.75rem',
              }}
            >
              {editingRule ? t('categories.rules.editingTitle') : t('categories.rules.newTitle')}
            </div>
            <label
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: T.muted,
                display: 'block',
                marginBottom: '0.35rem',
              }}
            >
              {t('categories.form.category')}
            </label>
            <select
              style={selStyle}
              value={ruleForm.categoryId}
              onChange={(e) =>
                setRuleForm((r) => ({ ...r, categoryId: e.target.value }))
              }
            >
              <option value="">{t('categories.form.categorySelectPlaceholder')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({(c as any).type === 'income' ? t('categories.typeIncome') : t('categories.typeExpense')})
                </option>
              ))}
            </select>
            <label
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: T.muted,
                display: 'block',
                marginBottom: '0.35rem',
              }}
            >
              {t('categories.form.keywords')}
            </label>
            <input
              style={inputStyle}
              placeholder={t('categories.form.keywordsPlaceholder')}
              value={ruleForm.keywords}
              onChange={(e) =>
                setRuleForm((r) => ({ ...r, keywords: e.target.value }))
              }
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={onSaveRule}
                disabled={
                  !ruleForm.categoryId || !ruleForm.keywords.trim()
                }
                style={{
                  ...btnPrimary,
                  flex: 1,
                  opacity:
                    !ruleForm.categoryId || !ruleForm.keywords.trim()
                      ? 0.5
                      : 1,
                }}
              >
                ✅ {editingRule ? t('common.updateRule') : t('common.saveRule')}
              </button>
              {editingRule && (
                <button
                  onClick={() => {
                    setEditingRule(null);
                    setRuleForm({ categoryId: '', keywords: '' });
                  }}
                  style={btnSec}
                >
                  {t('common.cancel')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )}
  {confirmDeleteRuleId !== null && (
    <ConfirmModal
      T={T}
      title={t('categories.rules.confirmDeleteTitle')}
      message={t('categories.rules.confirmDeleteMsg')}
      onConfirm={() => {
        deleteCategoryRule(confirmDeleteRuleId);
        toast(t('categories.rules.toastDeleted'), 'success');
        setConfirmDeleteRuleId(null);
      }}
      onCancel={() => setConfirmDeleteRuleId(null)}
    />
  )}
  </>
  );
}
