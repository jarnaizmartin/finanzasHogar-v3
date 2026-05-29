import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { useBankImport } from './hooks/useBankImport';
import { RulesEditorModal } from './components/bank-import/RulesEditorModal';
import { Step1BankSelection } from './components/bank-import/Step1BankSelection';
import { Step2Upload } from './components/bank-import/Step2Upload';
import { Step3Preview } from './components/bank-import/Step3Preview';

export function BankImportModal({
  onClose,
  defaultAccountId,
}: {
  onClose: () => void;
  defaultAccountId?: string;
}) {
  const {
    T,
    toast,
    accounts,
    categories,
    realExpenses,
    baseCurrency,
    setBankFormats,
    categoryRules,
    setCategoryRules,
    dateFormat,
    step,
    setStep,
    allFormats,
    selectedFormatId,
    setSelectedFormatId,
    selectedFormat,
    currentStepInfo,
    showCustomForm,
    setShowCustomForm,
    customForm,
    setCustomForm,
    editingCustomId,
    setEditingCustomId,
    confirmDeleteFormat,
    setConfirmDeleteFormat,
    emptyCustomFormat,
    rawCSV,
    setRawCSV,
    parseErrors,
    selectedAccountId,
    setSelectedAccountId,
    overrideSkipRows,
    setOverrideSkipRows,
    importRows,
    setImportRows,
    showRulesEditor,
    setShowRulesEditor,
    manuallyCategorized,
    setManuallyCategorized,
    editingRule,
    setEditingRule,
    ruleForm,
    setRuleForm,
    newCount,
    dupCount,
    discardedCount,
    btnPrimary,
    btnSec,
    handleSelectFormat,
    generatePreview,
    confirmImport,
    saveCustomFormat,
    saveRule,
  } = useBankImport({ onClose, defaultAccountId });

  return (
    <>
      {createPortal(
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
            // 🛡️ B2 — Sin click-outside: no podemos perder el progreso del wizard
            // (CSV cargado, columnas configuradas, reglas tocadas...).
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
              height: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'fadeSlideIn 0.2s ease both',
            }}
          >
            {/* Header fijo */}
            <div
              style={{
                padding: '1.25rem 1.5rem 1rem',
                borderBottom: `1px solid ${T.cardBorder}`,
                background: T.cardBg,
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.875rem' }}>
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    style={{
                      flex: 1,
                      height: '0.25rem',
                      borderRadius: '9999px',
                      background: s <= step ? T.accent : T.cardBorder,
                      transition: 'background 0.3s',
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 800,
                      color: T.title,
                      margin: 0,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {currentStepInfo.title}
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: T.muted, margin: '0.2rem 0 0' }}>
                    {currentStepInfo.sub}
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
            </div>

            {/* Body scrollable */}
            <div
              style={{
                padding: '1.25rem 1.5rem 1.5rem',
                overflowY: 'auto',
                flex: 1,
                minHeight: 0,
              }}
            >
              {step === 1 && (
                <Step1BankSelection
                  T={T}
                  allFormats={allFormats}
                  selectedFormatId={selectedFormatId}
                  showCustomForm={showCustomForm}
                  showRulesEditor={showRulesEditor}
                  customForm={customForm}
                  editingCustomId={editingCustomId}
                  confirmDeleteFormat={confirmDeleteFormat}
                  emptyCustomFormat={emptyCustomFormat}
                  onSelectFormat={handleSelectFormat}
                  setSelectedFormatId={setSelectedFormatId}
                  setShowCustomForm={setShowCustomForm}
                  setCustomForm={setCustomForm}
                  setEditingCustomId={setEditingCustomId}
                  setConfirmDeleteFormat={setConfirmDeleteFormat}
                  setBankFormats={setBankFormats}
                  toast={toast}
                />
              )}

              {step === 2 && (
                <Step2Upload
                  T={T}
                  selectedFormat={selectedFormat}
                  selectedFormatId={selectedFormatId}
                  accounts={accounts}
                  baseCurrency={baseCurrency}
                  selectedAccountId={selectedAccountId}
                  rawCSV={rawCSV}
                  overrideSkipRows={overrideSkipRows}
                  parseErrors={parseErrors}
                  setSelectedAccountId={setSelectedAccountId}
                  setRawCSV={setRawCSV}
                  setOverrideSkipRows={setOverrideSkipRows}
                  onGoBack={() => setStep(1)}
                />
              )}

              {step === 3 && (
                <Step3Preview
                  T={T}
                  importRows={importRows}
                  setImportRows={setImportRows}
                  setManuallyCategorized={setManuallyCategorized}
                  realExpenses={realExpenses}
                  categories={categories}
                  dateFormat={dateFormat}
                  newCount={newCount}
                  dupCount={dupCount}
                  discardedCount={discardedCount}
                  setShowRulesEditor={setShowRulesEditor}
                />
              )}
            </div>

            {/* Footer fijo */}
            <div
              style={{
                padding: '0.875rem 1.5rem',
                borderTop: `1px solid ${T.cardBorder}`,
                background: T.cardBg,
                flexShrink: 0,
                display: 'flex',
                gap: '0.625rem',
              }}
            >
              {step === 1 && !showCustomForm && (
                <button onClick={() => setStep(2)} style={{ ...btnPrimary, flex: 1 }}>
                  Continuar con {selectedFormat?.name} →
                </button>
              )}

              {step === 1 && showCustomForm && (
                <>
                  <button
                    onClick={saveCustomFormat}
                    disabled={!customForm.name.trim()}
                    style={{ ...btnPrimary, flex: 1, opacity: customForm.name.trim() ? 1 : 0.5 }}
                  >
                    ✅ Guardar formato
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomForm(false);
                      setEditingCustomId(null);
                      setCustomForm(emptyCustomFormat);
                    }}
                    style={btnSec}
                  >
                    Cancelar
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <button
                    onClick={generatePreview}
                    disabled={!rawCSV || !selectedAccountId}
                    style={{
                      ...btnPrimary,
                      flex: 1,
                      opacity: !rawCSV || !selectedAccountId ? 0.5 : 1,
                      cursor: !rawCSV || !selectedAccountId ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Vista previa →
                  </button>
                  <button onClick={() => setStep(1)} style={btnSec}>
                    ← Atrás
                  </button>
                </>
              )}

              {step === 3 && (
                <>
                  <button
                    onClick={confirmImport}
                    disabled={newCount === 0}
                    style={{
                      ...btnPrimary,
                      flex: 1,
                      background: T.green,
                      opacity: newCount === 0 ? 0.5 : 1,
                      cursor: newCount === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    ✅ Cargar {newCount} movimiento{newCount !== 1 ? 's' : ''}
                  </button>
                  <button onClick={() => setStep(2)} style={btnSec}>
                    ← Atrás
                  </button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {showRulesEditor && (
        <RulesEditorModal
          T={T}
          categories={categories}
          categoryRules={categoryRules}
          setCategoryRules={setCategoryRules}
          editingRule={editingRule}
          setEditingRule={setEditingRule}
          ruleForm={ruleForm}
          setRuleForm={setRuleForm}
          onSaveRule={saveRule}
          onClose={() => {
            setShowRulesEditor(false);
            setEditingRule(null);
            setRuleForm({ categoryId: '', keywords: '' });
          }}
          toast={toast}
        />
      )}
    </>
  );
}
