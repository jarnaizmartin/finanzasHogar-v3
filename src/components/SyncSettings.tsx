// ─── C3 — Toggle de sincronización en Ajustes ────────────────────────────────
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §6 (UX del toggle mono/multi)
// y §8.2 (desconexión: suave / borrar de la nube).
//
// Encapsula TODA la UI del sync (opt-in, conectar Drive, estado, desconectar,
// emparejamiento del 2º dispositivo) para no inflar AppShell. Consume el
// controlador `useApp().sync` (hook useSync) y SecurityContext (clave de sync).
//
// Flujo de "Conectar" unificado (cubre primario y 2º dispositivo):
//   1. OAuth de Drive (consentimiento).
//   2. Si YA hay vault remoto → emparejar: derivar la clave con el salt de su
//      cabecera (adoptSyncKey). Si NO hay → primario: verificar contraseña y
//      generar el salt (prepareSyncKey).
//   3. Activar el opt-in + primera pasada de sync.
//
// ⚠️ Requiere autenticación por contraseña (la clave de sync se deriva de ella).
// Se valida en navegador real con 2 dispositivos (sesión 50+).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Theme } from '../theme';
import { useApp } from '../AppContext';
import { useSecurityContext } from '../SecurityContext';
import { Field, Input, ConfirmModal } from './UI';
import { googleDriveProvider } from '../lib/sync/googleDriveProvider';
import { readVaultHeader } from '../lib/sync/vaultCodec';
import { SyncError, type SyncErrorCode } from '../lib/sync/types';

export function SyncSettings({ T }: { T: Theme }) {
  const { t } = useTranslation();
  const { sync } = useApp();
  const { security, prepareSyncKey, adoptSyncKey, clearSyncKey } = useSecurityContext();

  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmForgot, setConfirmForgot] = useState(false);

  const isPasswordAuth = security.authMethod === 'password';

  const errorMessage = (code: SyncErrorCode | null): string => {
    switch (code) {
      case 'TOKEN_EXPIRED': return t('appShell.sync.errorTokenExpired');
      case 'WRONG_PASSWORD': return t('appShell.sync.errorWrongPassword');
      case 'SCHEMA_TOO_NEW': return t('appShell.sync.errorSchemaTooNew');
      case 'NOT_CONFIGURED': return t('appShell.sync.errorNotConfigured');
      default: return t('appShell.sync.errorGeneric');
    }
  };

  // ── Activar multi-dispositivo: conectar Drive + (emparejar | primario) + sync ─
  const handleConnect = async () => {
    setLocalError(null);
    setNotice(null);
    if (!isPasswordAuth) { setLocalError(t('appShell.sync.needsPassword')); return; }
    if (!password) return;
    setBusy(true);
    try {
      await googleDriveProvider.connect(true);
      const remote = await googleDriveProvider.readVault();
      if (remote) {
        // 2º dispositivo / reinstalación: deriva la clave con el salt del vault.
        const header = readVaultHeader(remote.content);
        await adoptSyncKey(password, header.syncSalt, header.kdfIterations);
      } else {
        // Primario: verifica la contraseña y genera el salt de sync.
        const ok = await prepareSyncKey(password);
        if (!ok) { setLocalError(t('appShell.sync.errorWrongPassword')); return; }
      }
      sync.setEnabled(true);
      sync.refreshConnection();
      setPassword('');
      await sync.syncNow();
    } catch (e) {
      const code = e instanceof SyncError ? e.code : null;
      if (code === 'AUTH_CANCELLED') return; // el usuario cerró el consentimiento
      setLocalError(errorMessage(code));
    } finally {
      setBusy(false);
    }
  };

  // ── Reconectar (la clave ya está en memoria desde el unlock) ────────────────
  const handleReconnect = async () => {
    setLocalError(null);
    setBusy(true);
    try {
      await googleDriveProvider.connect(true);
      sync.refreshConnection();
      await sync.syncNow();
    } catch (e) {
      const code = e instanceof SyncError ? e.code : null;
      if (code !== 'AUTH_CANCELLED') setLocalError(errorMessage(code));
    } finally {
      setBusy(false);
    }
  };

  // ── Desconexión suave: para de sincronizar; vault y datos locales intactos ───
  const handleDisconnectSoft = () => {
    sync.setEnabled(false);
    googleDriveProvider.disconnect();
    sync.refreshConnection();
    setLocalError(null);
  };

  // ── Desconectar y borrar de la nube (§8.2) ──────────────────────────────────
  const handleDisconnectDelete = async () => {
    setBusy(true);
    setLocalError(null);
    try {
      if (!googleDriveProvider.isConnected()) await googleDriveProvider.connect(true);
      await googleDriveProvider.deleteVault();
      sync.setEnabled(false);
      googleDriveProvider.disconnect();
      sync.refreshConnection();
    } catch (e) {
      const code = e instanceof SyncError ? e.code : null;
      if (code !== 'AUTH_CANCELLED') setLocalError(errorMessage(code));
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  // ── "He olvidado la contraseña": borra el vault de la nube para empezar de cero.
  // El OAuth ya tuvo éxito al intentar emparejar, así que podemos borrar el blob
  // directamente; el siguiente "Conectar" no hallará vault → vía primario. ────────
  const handleForgotReset = async () => {
    setBusy(true);
    setLocalError(null);
    setNotice(null);
    try {
      if (!googleDriveProvider.isConnected()) await googleDriveProvider.connect(true);
      await googleDriveProvider.deleteVault();
      clearSyncKey();          // olvida la clave (incorrecta) en memoria
      sync.setEnabled(false);  // vuelve al estado no activado
      sync.clearError();       // limpia el WRONG_PASSWORD
      sync.refreshConnection();
      setPassword('');
      setNotice(t('appShell.sync.forgotResetDone'));
    } catch (e) {
      const code = e instanceof SyncError ? e.code : null;
      if (code !== 'AUTH_CANCELLED') setLocalError(errorMessage(code));
    } finally {
      setBusy(false);
      setConfirmForgot(false);
    }
  };

  // ── Estilos de botón (coherentes con el resto del modal) ────────────────────
  const btnBase: React.CSSProperties = {
    width: '100%',
    padding: '0.65rem',
    borderRadius: '0.75rem',
    fontSize: '0.825rem',
    fontWeight: 700,
    cursor: busy ? 'default' : 'pointer',
    opacity: busy ? 0.6 : 1,
  };
  const btnPrimary: React.CSSProperties = {
    ...btnBase,
    border: 'none',
    background: T.accent,
    color: '#fff',
  };
  const btnSecondary: React.CSSProperties = {
    ...btnBase,
    border: `1.5px solid ${T.cardBorder}`,
    background: T.btnSecBg,
    color: T.btnSecText,
  };
  const btnDanger: React.CSSProperties = {
    ...btnBase,
    border: `1.5px solid ${T.red}`,
    background: 'transparent',
    color: T.red,
  };
  const hint: React.CSSProperties = {
    fontSize: '0.72rem',
    color: T.muted,
    marginTop: '0.5rem',
    lineHeight: 1.5,
  };

  const shownError = localError ?? (sync.errorCode ? errorMessage(sync.errorCode) : null);

  return (
    <div>
      <Field label={t('appShell.sync.sectionTitle')}>
        <p style={{ ...hint, marginTop: 0, marginBottom: '0.875rem' }}>
          {t('appShell.sync.sectionHint')}
        </p>

        {/* ── No activado: ofrecer conectar ─────────────────────────────────── */}
        {!sync.enabled && (
          <>
            {!isPasswordAuth ? (
              <p style={{ ...hint, color: T.amber }}>{t('appShell.sync.needsPassword')}</p>
            ) : (
              <>
                <Input
                  T={T}
                  type="password"
                  value={password}
                  placeholder={t('appShell.sync.passwordPlaceholder')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  style={{ marginBottom: '0.625rem' }}
                />
                <button
                  style={btnPrimary}
                  disabled={busy || !password}
                  onClick={handleConnect}
                >
                  {busy ? t('appShell.sync.connecting') : t('appShell.sync.connectBtn')}
                </button>
                <p style={hint}>{t('appShell.sync.samePasswordHint')}</p>
              </>
            )}
          </>
        )}

        {/* ── Activado: estado + acciones ───────────────────────────────────── */}
        {sync.enabled && (
          <>
            <div
              style={{
                padding: '0.75rem 0.875rem',
                borderRadius: '0.75rem',
                background: T.pageBg,
                border: `1px solid ${T.cardBorder}`,
                marginBottom: '0.75rem',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: sync.connected ? T.green : T.amber }}>
                {sync.connected ? t('appShell.sync.connectedTo') : t('appShell.sync.notConnected')}
              </div>
              <div style={{ fontSize: '0.72rem', color: T.muted, marginTop: '0.35rem' }}>
                {sync.phase === 'syncing'
                  ? t('appShell.sync.syncing')
                  : sync.lastSyncAt
                    ? t('appShell.sync.lastSync', { when: new Date(sync.lastSyncAt).toLocaleString() })
                    : t('appShell.sync.neverSynced')}
              </div>
            </div>

            {!sync.connected && (
              <button style={{ ...btnSecondary, marginBottom: '0.625rem' }} disabled={busy} onClick={handleReconnect}>
                {t('appShell.sync.reconnectBtn')}
              </button>
            )}

            <button
              style={{ ...btnPrimary, marginBottom: '0.625rem' }}
              disabled={busy || !sync.connected || sync.phase === 'syncing'}
              onClick={() => void sync.syncNow()}
            >
              {sync.phase === 'syncing' ? t('appShell.sync.syncing') : t('appShell.sync.syncNowBtn')}
            </button>

            {sync.duplicateCount > 0 && (
              <div
                style={{
                  padding: '0.625rem 0.75rem',
                  borderRadius: '0.625rem',
                  background: T.amberBg,
                  border: `1px solid ${T.amber}`,
                  fontSize: '0.72rem',
                  color: T.body,
                  lineHeight: 1.5,
                  marginBottom: '0.625rem',
                }}
              >
                {t('appShell.sync.duplicatesWarning', { count: sync.duplicateCount })}
                <button
                  onClick={sync.clearDuplicates}
                  style={{ marginTop: '0.4rem', background: 'none', border: 'none', color: T.accent, fontWeight: 700, cursor: 'pointer', fontSize: '0.72rem', padding: 0 }}
                >
                  {t('appShell.sync.duplicatesReviewed')}
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ ...btnSecondary, flex: 1 }} disabled={busy} onClick={handleDisconnectSoft}>
                {t('appShell.sync.disconnectBtn')}
              </button>
              <button style={{ ...btnDanger, flex: 1 }} disabled={busy} onClick={() => setConfirmDelete(true)}>
                {t('appShell.sync.disconnectDeleteBtn')}
              </button>
            </div>
          </>
        )}

        {shownError && (
          <p style={{ ...hint, color: T.red, fontWeight: 600 }}>⚠ {shownError}</p>
        )}

        {/* ── Escape: vault remoto que no se deja descifrar (contraseña olvidada) ─ */}
        {sync.errorCode === 'WRONG_PASSWORD' && (
          <button
            style={{ ...btnDanger, marginTop: '0.625rem' }}
            disabled={busy}
            onClick={() => setConfirmForgot(true)}
          >
            {t('appShell.sync.forgotResetBtn')}
          </button>
        )}

        {notice && (
          <p style={{ ...hint, color: T.green, fontWeight: 600 }}>{notice}</p>
        )}
      </Field>

      {confirmDelete && (
        <ConfirmModal
          T={T}
          danger
          title={t('appShell.sync.disconnectDeleteTitle')}
          message={t('appShell.sync.disconnectDeleteMsg')}
          onConfirm={handleDisconnectDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      {confirmForgot && (
        <ConfirmModal
          T={T}
          danger
          title={t('appShell.sync.forgotResetTitle')}
          message={t('appShell.sync.forgotResetMsg')}
          onConfirm={handleForgotReset}
          onCancel={() => setConfirmForgot(false)}
        />
      )}
    </div>
  );
}
