import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { fmtDateTime } from './lib/i18nFormats';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from './AppContext';
import { useToast } from './contexts/ToastContext';
import { ConfirmModal } from './components/UI';
import { BackupPasswordModal } from './components/BackupPasswordModal';
import {
  detectBackupFormat,
  decryptBackupPayload,
  type EncryptionInfo,
} from './lib/backupCrypto';
import type { BackupEntry } from './types';

// ─── Tipo local para preview de import (incluye `data` materializado) ────────
type ImportPreview = {
  id: string;
  timestamp: number;
  label: string;
  accountsCount: number;
  categoriesCount: number;
  projectionsCount: number;
  realExpensesCount: number;
  goalsCount: number;
  data: NonNullable<BackupEntry['data']>;
};

// ─── Tipo para fichero cifrado pendiente de descifrar ────────────────────────
type PendingEncryptedFile = {
  parsed: {
    id: string;
    timestamp: number;
    label: string;
    accountsCount: number;
    categoriesCount: number;
    projectionsCount: number;
    realExpensesCount: number;
    goalsCount: number;
    encryption: EncryptionInfo;
    ciphertext: string;
  };
};

const uid = () => crypto.randomUUID();

export function BackupPanel({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const {
    T,
    backupHistory,
    createBackup,
    restoreBackup,
    deleteBackup,
    downloadBackup,
  } = useApp();

  const toast = useToast();

  const [confirmRestore, setConfirmRestore] = useState<ImportPreview | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [downloadPreRestore, setDownloadPreRestore] = useState(false);

  const [showImport, setShowImport] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importWarning, setImportWarning] = useState<string | null>(null);
  const [pendingEncryptedFile, setPendingEncryptedFile] =
    useState<PendingEncryptedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwordModal, setPasswordModal] = useState<'encrypt' | 'decrypt' | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [pendingDownloadEntry, setPendingDownloadEntry] = useState<BackupEntry | null>(null);

  useEffect(() => {
    if (confirmRestore || confirmDelete) {
      const allScrollables = document.querySelectorAll('[style*="overflow"]');
      allScrollables.forEach((el) => {
        if (el.scrollHeight > el.clientHeight) {
          (el as HTMLElement).scrollTop = 0;
        }
      });
    }
  }, [confirmRestore, confirmDelete]);

  const handleCreateBackup = () => {
    const entry = createBackup(t('misc.backupPanel.labelManual'));
    setPendingDownloadEntry(entry);
    setPasswordError(null);
    setPasswordModal('encrypt');
  };

  const handleCreateOnly = () => {
    createBackup(t('misc.backupPanel.labelManual'));
    toast(t('misc.backupPanel.toastSaved'), 'success');
  };

  const handleRequestDownloadEntry = (entry: BackupEntry) => {
    setPendingDownloadEntry(entry);
    setPasswordError(null);
    setPasswordModal('encrypt');
  };

  const handleConfirmDownloadPassword = async (password: string) => {
    setPasswordBusy(true);
    setPasswordError(null);
    try {
      await downloadBackup(pendingDownloadEntry ?? undefined, password);
      toast(t('misc.backupPanel.toastDownloaded'), 'success');
      setPasswordModal(null);
      setPendingDownloadEntry(null);
    } catch (err: any) {
      setPasswordError(err?.message ?? t('misc.backupPanel.errorEncrypt'));
    } finally {
      setPasswordBusy(false);
    }
  };

  const handleCancelPasswordModal = () => {
    if (passwordBusy) return;
    setPasswordModal(null);
    setPasswordError(null);
    setPendingDownloadEntry(null);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportWarning(null);
    setImportPreview(null);
    setPendingEncryptedFile(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      try {
        const parsed = JSON.parse(content);
        const format = detectBackupFormat(parsed);

        if (format === 'invalid') {
          setImportError(t('misc.backupPanel.errorInvalidFile'));
          return;
        }

        if (format === 'encrypted-v2') {
          setPendingEncryptedFile({ parsed });
          setPasswordError(null);
          setPasswordModal('decrypt');
          return;
        }

        if (!parsed.data || !parsed.data.accounts) {
          setImportError(t('misc.backupPanel.errorNoData'));
          return;
        }

        const preview: ImportPreview = {
          id: parsed.id ?? uid(),
          timestamp: parsed.timestamp ?? Date.now(),
          label: parsed.label ?? t('misc.backupPanel.labelImportedFromFile'),
          accountsCount: parsed.data.accounts?.length ?? 0,
          categoriesCount: parsed.data.categories?.length ?? 0,
          projectionsCount: parsed.data.projections?.length ?? 0,
          realExpensesCount: parsed.data.realExpenses?.length ?? 0,
          goalsCount: parsed.data.goals?.length ?? 0,
          data: {
            accounts: parsed.data.accounts ?? [],
            categories: parsed.data.categories ?? [],
            projections: parsed.data.projections ?? [],
            realExpenses: parsed.data.realExpenses ?? [],
            goals: parsed.data.goals ?? [],
            bankFormats: parsed.data.bankFormats ?? [],
            categoryRules: parsed.data.categoryRules ?? [],
            baseCurrency: parsed.data.baseCurrency ?? 'EUR',
            displayCurrency: parsed.data.displayCurrency ?? 'EUR',
            dark: parsed.data.dark ?? false,
            licenseState: parsed.data.licenseState,
          },
        };
        setImportPreview(preview);
        setImportWarning(t('misc.backupPanel.warningOldFormat'));
      } catch {
        setImportError(t('misc.backupPanel.errorUnreadable'));
      }
    };

    reader.onerror = () => setImportError(t('misc.backupPanel.errorRead'));
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImportPassword = async (password: string) => {
    if (!pendingEncryptedFile) return;
    setPasswordBusy(true);
    setPasswordError(null);
    try {
      const { parsed } = pendingEncryptedFile;
      const decryptedData = await decryptBackupPayload<NonNullable<BackupEntry['data']>>(
        parsed.encryption,
        parsed.ciphertext,
        password
      );

      const preview: ImportPreview = {
        id: parsed.id ?? uid(),
        timestamp: parsed.timestamp ?? Date.now(),
        label: parsed.label ?? t('misc.backupPanel.labelImportedFromEncryptedFile'),
        accountsCount: parsed.accountsCount ?? decryptedData.accounts?.length ?? 0,
        categoriesCount: parsed.categoriesCount ?? decryptedData.categories?.length ?? 0,
        projectionsCount: parsed.projectionsCount ?? decryptedData.projections?.length ?? 0,
        realExpensesCount: parsed.realExpensesCount ?? decryptedData.realExpenses?.length ?? 0,
        goalsCount: parsed.goalsCount ?? decryptedData.goals?.length ?? 0,
        data: {
          accounts: decryptedData.accounts ?? [],
          categories: decryptedData.categories ?? [],
          projections: decryptedData.projections ?? [],
          realExpenses: decryptedData.realExpenses ?? [],
          goals: decryptedData.goals ?? [],
          bankFormats: decryptedData.bankFormats ?? [],
          categoryRules: decryptedData.categoryRules ?? [],
          baseCurrency: decryptedData.baseCurrency ?? 'EUR',
          displayCurrency: decryptedData.displayCurrency ?? 'EUR',
          dark: decryptedData.dark ?? false,
          licenseState: decryptedData.licenseState,
        },
      };
      setImportPreview(preview);
      setPasswordModal(null);
      setPendingEncryptedFile(null);
      toast(t('misc.backupPanel.toastDecrypted'), 'success');
    } catch (err: any) {
      if (err?.message === 'PASSWORD_INCORRECT_OR_FILE_CORRUPT') {
        setPasswordError(t('misc.backupPanel.errorWrongPassword'));
      } else {
        setPasswordError(t('misc.backupPanel.errorDecrypt'));
      }
    } finally {
      setPasswordBusy(false);
    }
  };

  const handleCancelImportPassword = () => {
    if (passwordBusy) return;
    setPasswordModal(null);
    setPasswordError(null);
    setPendingEncryptedFile(null);
  };

  const fmtTimestamp = (ts: number) => fmtDateTime(new Date(ts));

  const timeSince = (ts: number) => {
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1) return t('misc.backupPanel.timeMomentAgo');
    if (mins < 60) return t('misc.backupPanel.timeMinutes', { n: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('misc.backupPanel.timeHours', { n: hours });
    const days = Math.floor(hours / 24);
    return t('misc.backupPanel.timeDays', { count: days });
  };

  const Modal = ({
    title,
    subtitle,
    children,
  }: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    // Portal a document.body: evita que un ancestro con transform/filter/
    // backdrop-filter/contain capture el `position: fixed` y mande la tarjeta
    // fuera de pantalla (pantalla en negro). Ver s.56 / RealExpenseWarningModal.
  }) => createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '1rem', paddingTop: '4.5rem', paddingBottom: '1rem',
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.cardBg,
          border: `1px solid ${T.cardBorder}`,
          borderRadius: '1.5rem',
          boxShadow: T.cardShadowLg,
          width: '100%', maxWidth: '34rem',
          maxHeight: 'calc(100vh - 5.5rem)', overflowY: 'auto',
          animation: 'fadeSlideIn 0.2s ease both',
        }}
      >
        <div style={{ padding: '1rem 1.5rem 0.75rem', borderBottom: `1px solid ${T.cardBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: T.title, letterSpacing: '-0.02em', margin: 0 }}>
                {title}
              </h2>
              <p style={{ fontSize: '0.8rem', color: T.muted, marginTop: '0.25rem' }}>{subtitle}</p>
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
        </div>
        <div style={{ padding: '1rem 1.5rem 1.5rem' }}>{children}</div>
      </div>
    </div>,
    document.body
  );

  return (
    <Modal
      title={t('misc.backupPanel.title')}
      subtitle={t('misc.backupPanel.subtitle')}
    >
      {/* ── Acciones principales ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          onClick={handleCreateBackup}
          style={{
            padding: '1rem', borderRadius: '1rem',
            border: `1.5px solid ${T.accent}33`,
            background: T.accentLight, color: T.accent,
            cursor: 'pointer', textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🔐</div>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: T.accent }}>
            {t('misc.backupPanel.encryptDownloadTitle')}
          </div>
          <div style={{ fontSize: '0.72rem', color: T.muted, marginTop: '0.2rem' }}>
            {t('misc.backupPanel.encryptDownloadDesc')}
          </div>
        </button>

        <button
          onClick={handleCreateOnly}
          style={{
            padding: '1rem', borderRadius: '1rem',
            border: `1.5px solid ${T.cardBorder}`,
            background: T.pageBg, color: T.body,
            cursor: 'pointer', textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🕐</div>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: T.title }}>
            {t('misc.backupPanel.snapshotTitle')}
          </div>
          <div style={{ fontSize: '0.72rem', color: T.muted, marginTop: '0.2rem' }}>
            {t('misc.backupPanel.snapshotDesc')}
          </div>
        </button>

        <button
          onClick={() => {
            setShowImport(true);
            setImportPreview(null);
            setImportError(null);
            setImportWarning(null);
          }}
          style={{
            padding: '1rem', borderRadius: '1rem',
            border: `1.5px solid ${T.greenBorder}`,
            background: T.greenBg, color: T.green,
            cursor: 'pointer', textAlign: 'left',
            gridColumn: '1 / -1',
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🔄</div>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: T.green }}>
            {t('misc.backupPanel.restoreFromFileTitle')}
          </div>
          <div style={{ fontSize: '0.72rem', color: T.muted, marginTop: '0.2rem' }}>
            {t('misc.backupPanel.restoreFromFileDesc')}
          </div>
        </button>
      </div>

      {/* ── Sección importar desde fichero ── */}
      {showImport && (
        <div
          style={{
            padding: '1rem', borderRadius: '1rem',
            background: T.pageBg, border: `1px solid ${T.cardBorder}`,
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: T.body, marginBottom: '0.75rem' }}>
            {t('misc.backupPanel.selectFileLabel')}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            style={{ display: 'none' }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '0.65rem 1.25rem', borderRadius: '0.75rem',
              border: `1.5px solid ${T.inputBorder}`,
              background: T.inputBg, color: T.inputText,
              fontSize: '0.825rem', fontWeight: 600,
              cursor: 'pointer', width: '100%', marginBottom: '0.75rem',
            }}
          >
            {t('misc.backupPanel.chooseFileBtn')}
          </button>

          {importError && (
            <div
              style={{
                padding: '0.75rem', borderRadius: '0.75rem',
                background: T.redBg, border: `1px solid ${T.redBorder}`,
                fontSize: '0.775rem', color: T.red, marginBottom: '0.75rem',
              }}
            >
              ⛔ {importError}
            </div>
          )}

          {importWarning && (
            <div
              style={{
                padding: '0.75rem', borderRadius: '0.75rem',
                background: T.amberBg, border: `1px solid ${T.amberBorder}`,
                fontSize: '0.775rem', color: T.amber, marginBottom: '0.75rem',
                lineHeight: 1.5,
              }}
            >
              ⚠️ {importWarning}
            </div>
          )}

          {importPreview && (
            <div>
              <div
                style={{
                  padding: '0.875rem', borderRadius: '0.875rem',
                  background: T.cardBg, border: `1px solid ${T.greenBorder}`,
                  marginBottom: '0.75rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.72rem', fontWeight: 700, color: T.green,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    marginBottom: '0.625rem',
                  }}
                >
                  {t('misc.backupPanel.validFileLabel')}
                </div>
                <div style={{ fontSize: '0.78rem', color: T.muted, marginBottom: '0.5rem' }}>
                  {t('misc.backupPanel.copyDateLabel')}{' '}
                  <strong style={{ color: T.body }}>{fmtTimestamp(importPreview.timestamp)}</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  {[
                    { label: t('misc.backupPanel.previewAccounts'), value: importPreview.accountsCount },
                    { label: t('misc.backupPanel.previewCategories'), value: importPreview.categoriesCount },
                    { label: t('misc.backupPanel.previewProjections'), value: importPreview.projectionsCount },
                    { label: t('misc.backupPanel.previewMovements'), value: importPreview.realExpensesCount },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        padding: '0.5rem 0.75rem', borderRadius: '0.625rem',
                        background: T.pageBg, border: `1px solid ${T.cardBorder}`,
                        fontSize: '0.78rem', fontWeight: 600, color: T.body,
                      }}
                    >
                      {item.label}: <strong style={{ color: T.title }}>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <label
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  marginBottom: '0.75rem', cursor: 'pointer',
                  padding: '0.75rem', borderRadius: '0.75rem',
                  background: T.accentLight, border: `1px solid ${T.accent}33`,
                }}
              >
                <input
                  type="checkbox"
                  checked={downloadPreRestore}
                  onChange={(e) => setDownloadPreRestore(e.target.checked)}
                  style={{
                    width: '1rem', height: '1rem', accentColor: T.accent,
                    cursor: 'pointer', flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '0.775rem', fontWeight: 600, color: T.accent, lineHeight: 1.4 }}>
                  {t('misc.backupPanel.downloadBeforeRestoreLabel')}
                </span>
              </label>

              <div
                style={{
                  padding: '0.65rem 0.875rem', borderRadius: '0.75rem',
                  background: T.amberBg, border: `1px solid ${T.amberBorder}`,
                  fontSize: '0.75rem', color: T.amber, marginBottom: '0.75rem',
                  lineHeight: 1.5,
                }}
              >
                {t('misc.backupPanel.restoreWarning')}
              </div>

              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button
                  onClick={() => {
                    if (downloadPreRestore) {
                      const preEntry = createBackup(t('misc.backupPanel.labelAutoPreRestore'));
                      setConfirmRestore(importPreview);
                      setPendingDownloadEntry(preEntry);
                      setPasswordError(null);
                      setPasswordModal('encrypt');
                      return;
                    }
                    createBackup(t('misc.backupPanel.labelAutoPreRestore'));
                    restoreBackup({
                      ...importPreview,
                      data: importPreview.data,
                    } as BackupEntry);
                    setShowImport(false);
                    setImportPreview(null);
                    setImportWarning(null);
                    setDownloadPreRestore(false);
                    toast(t('misc.backupPanel.toastRestored'), 'success');
                    onClose();
                  }}
                  style={{
                    flex: 1, padding: '0.7rem', borderRadius: '0.75rem',
                    border: 'none', background: T.green, color: '#fff',
                    fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                  }}
                >
                  {t('misc.backupPanel.restoreNowBtn')}
                </button>
                <button
                  onClick={() => {
                    setImportPreview(null);
                    setShowImport(false);
                    setImportWarning(null);
                  }}
                  style={{
                    padding: '0.7rem 1.25rem', borderRadius: '0.75rem',
                    border: `1.5px solid ${T.cardBorder}`,
                    background: T.btnSecBg, color: T.btnSecText,
                    fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                  }}
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Historial de copias ── */}
      <div>
        <div
          style={{
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
            color: T.muted, textTransform: 'uppercase', marginBottom: '0.75rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          <span>{t('misc.backupPanel.historyTitle', { count: backupHistory.length })}</span>
          {backupHistory.length > 0 && (
            <span style={{ fontSize: '0.68rem', color: T.muted, fontWeight: 400 }}>
              {t('misc.backupPanel.lastCopy', { time: timeSince(backupHistory[0]?.timestamp) })}
            </span>
          )}
        </div>

        {backupHistory.length === 0 ? (
          <div
            style={{
              textAlign: 'center', padding: '2.5rem 1rem',
              borderRadius: '1rem', background: T.pageBg,
              border: `1.5px dashed ${T.cardBorder}`, color: T.muted,
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗂️</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: T.title }}>
              {t('misc.backupPanel.emptyTitle')}
            </div>
            <div style={{ fontSize: '0.775rem', marginTop: '0.25rem' }}>
              {t('misc.backupPanel.emptyBody')}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[...backupHistory]
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((entry, index) => (
                <div
                  key={entry.id}
                  style={{
                    padding: '0.875rem 1rem', borderRadius: '0.875rem',
                    background: index === 0 ? T.accentLight : T.pageBg,
                    border: `1px solid ${index === 0 ? T.accent + '33' : T.cardBorder}`,
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                  }}
                >
                  <div
                    style={{
                      width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem',
                      background: index === 0 ? T.accentLight : T.cardBg,
                      border: `1px solid ${index === 0 ? T.accent + '44' : T.cardBorder}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', flexShrink: 0,
                    }}
                  >
                    {entry.label.includes('pre-restauración') || entry.label.includes('pre-restore') ? '🔄' : index === 0 ? '💾' : '🕐'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 700, color: T.title }}>
                        {entry.label}
                      </span>
                      {index === 0 && (
                        <span
                          style={{
                            fontSize: '0.62rem', fontWeight: 700,
                            padding: '0.1rem 0.45rem', borderRadius: '9999px',
                            background: T.accent, color: '#fff',
                          }}
                        >
                          {t('misc.backupPanel.mostRecentBadge')}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: T.muted }}>
                      {fmtTimestamp(entry.timestamp)} · {timeSince(entry.timestamp)}
                    </div>
                    <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                      {[
                        t('misc.backupPanel.countAccounts', { count: entry.accountsCount }),
                        t('misc.backupPanel.countProjections', { count: entry.projectionsCount }),
                        t('misc.backupPanel.countMovements', { count: entry.realExpensesCount }),
                        t('misc.backupPanel.countGoals', { count: entry.goalsCount ?? 0 }),
                      ].map((label) => (
                        <span
                          key={label}
                          style={{
                            fontSize: '0.68rem', fontWeight: 600,
                            padding: '0.1rem 0.45rem', borderRadius: '9999px',
                            background: T.cardBg, border: `1px solid ${T.cardBorder}`,
                            color: T.muted,
                          }}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flexShrink: 0 }}>
                    <button
                      onClick={() => handleRequestDownloadEntry(entry)}
                      style={{
                        padding: '0.35rem 0.65rem', borderRadius: '0.5rem',
                        border: `1px solid ${T.cardBorder}`,
                        background: T.btnSecBg, color: T.btnSecText,
                        fontSize: '0.72rem', fontWeight: 600,
                        cursor: 'pointer', whiteSpace: 'nowrap',
                      }}
                    >
                      {t('misc.backupPanel.downloadBtn')}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(entry.id)}
                      style={{
                        padding: '0.35rem 0.65rem', borderRadius: '0.5rem',
                        border: `1px solid ${T.redBorder}`,
                        background: T.redBg, color: T.red,
                        fontSize: '0.72rem', fontWeight: 600,
                        cursor: 'pointer', whiteSpace: 'nowrap',
                      }}
                    >
                      {t('misc.backupPanel.deleteBtn')}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* ── Aviso informativo ── */}
      <div
        style={{
          marginTop: '1.25rem', padding: '1rem 1.125rem',
          borderRadius: '1rem', background: T.redBg,
          border: `1.5px solid ${T.redBorder}`,
          lineHeight: 1.6, animation: 'warnGlow 2.5s ease-in-out infinite',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
          <span
            style={{
              fontSize: '1.1rem', display: 'inline-block',
              animation: 'warnPulse 2s ease-in-out infinite', flexShrink: 0,
            }}
          >
            ⚠️
          </span>
          <span
            style={{
              fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.1em',
              textTransform: 'uppercase', padding: '0.2rem 0.625rem',
              borderRadius: '9999px', background: T.red, color: '#ffffff',
            }}
          >
            {t('misc.backupPanel.importantBadge')}
          </span>
          <span style={{ fontSize: '0.825rem', fontWeight: 800, color: T.red }}>
            {t('misc.backupPanel.warningTitle')}
          </span>
        </div>
        <p style={{ fontSize: '0.775rem', color: T.red, margin: 0, lineHeight: 1.65, opacity: 0.9 }}>
          {t('misc.backupPanel.warningBody1')}
        </p>
        <div style={{ height: '1px', background: T.redBorder, margin: '0.625rem 0', opacity: 0.5 }} />
        <p style={{ fontSize: '0.775rem', color: T.red, margin: 0, lineHeight: 1.65, opacity: 0.9 }}>
          {t('misc.backupPanel.warningBody2')}
        </p>
      </div>

      {/* ── Modal confirmar eliminar ── */}
      {confirmDelete && (
        <ConfirmModal
          T={T}
          danger={true}
          title={t('misc.backupPanel.deleteTitle')}
          message={t('misc.backupPanel.deleteMsg')}
          onConfirm={() => {
            deleteBackup(confirmDelete);
            setConfirmDelete(null);
            toast(t('misc.backupPanel.toastDeleted'), 'success');
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* ── Modal de contraseña ── */}
      {passwordModal === 'encrypt' && (
        <BackupPasswordModal
          T={T}
          mode="encrypt"
          busy={passwordBusy}
          errorMessage={passwordError}
          onConfirm={handleConfirmDownloadPassword}
          onCancel={handleCancelPasswordModal}
        />
      )}
      {passwordModal === 'decrypt' && (
        <BackupPasswordModal
          T={T}
          mode="decrypt"
          busy={passwordBusy}
          errorMessage={passwordError}
          onConfirm={handleConfirmImportPassword}
          onCancel={handleCancelImportPassword}
        />
      )}
    </Modal>
  );
}
