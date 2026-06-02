import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface ExitModalProps {
  T: any;
  backupHistory: any[];
  createBackup: (label: string) => any;
  // ⚠️ S.1 — Eliminado downloadBackup. La descarga ahora exige contraseña
  // y se delega al BackupPanel para tener UX coherente.
  onOpenBackup: () => void;
  onClose: () => void;
  onLock: () => void;
}

export function ExitModal({
  T,
  backupHistory,
  createBackup,
  onOpenBackup,
  onClose,
  onLock,
}: ExitModalProps) {
  const { t } = useTranslation();
  const lastDownload = backupHistory[0]?.timestamp ?? 0;
  const daysSince =
    lastDownload > 0
      ? Math.floor((Date.now() - lastDownload) / (1000 * 60 * 60 * 24))
      : null;
  const hasRecentDownload = daysSince !== null && daysSince < 1;

  const handleExitWithoutDownload = () => {
    // ✅ Siempre crea backup interno al salir, aunque no descargue fichero
    createBackup(t('misc.exitModal.autoBackupLabel'));
    // window.close() solo funciona si la ventana fue abierta por script (PWA).
    // Como fallback inmediato, bloqueamos el vault: si la pestaña no se cierra,
    // el usuario ve la lock screen y sus datos quedan protegidos.
    window.close();
    onLock();
  };

  return createPortal(
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
      }}
    >
      <div
        style={{
          background: T.cardBg,
          border: `1px solid ${T.cardBorder}`,
          borderRadius: '1.5rem',
          boxShadow: T.cardShadowLg,
          width: '100%',
          maxWidth: '28rem',
          padding: '1.75rem',
          animation: 'fadeSlideIn 0.2s ease both',
        }}
      >
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            background: T.pageBg,
            border: `1px solid ${T.cardBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            fontSize: '1.5rem',
          }}
        >
          👋
        </div>
        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: 800,
            color: T.title,
            margin: '0 0 0.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          {t('misc.exitModal.title')}
        </h3>

        {!hasRecentDownload && (
          <div
            style={{
              padding: '0.875rem 1rem',
              borderRadius: '0.875rem',
              background:
                daysSince === null || daysSince >= 7 ? T.redBg : T.amberBg,
              border: `1px solid ${
                daysSince === null || daysSince >= 7
                  ? T.redBorder
                  : T.amberBorder
              }`,
              fontSize: '0.825rem',
              color: daysSince === null || daysSince >= 7 ? T.red : T.amber,
              lineHeight: 1.5,
              marginBottom: '1rem',
            }}
          >
            {daysSince === null
              ? t('misc.exitModal.neverBackedUp')
              : daysSince >= 7
              ? t('misc.exitModal.oldBackupWarning', { days: daysSince })
              : daysSince === 1
              ? t('misc.exitModal.recentBackup1', { days: daysSince })
              : t('misc.exitModal.recentBackupN', { days: daysSince })}
          </div>
        )}
        {hasRecentDownload && (
          <p
            style={{
              fontSize: '0.825rem',
              color: T.muted,
              lineHeight: 1.5,
              marginBottom: '1rem',
            }}
          >
            {t('misc.exitModal.upToDate')}
          </p>
        )}

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}
        >
          {!hasRecentDownload && (
            <button
              onClick={() => {
                // ⚠️ S.1 — La descarga ahora requiere contraseña (cifrado AES-GCM).
                // Abrimos BackupPanel para que el usuario complete el proceso.
                // Tras descargar, podrá cerrar la app desde el navegador.
                onClose();
                onOpenBackup();
              }}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.875rem',
                border: 'none',
                background: T.accent,
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t('misc.exitModal.downloadBtn')}
            </button>
          )}
          <button
            onClick={handleExitWithoutDownload}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.875rem',
              border: `1.5px solid ${T.cardBorder}`,
              background: T.btnSecBg,
              color: T.btnSecText,
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {t('misc.exitModal.exitBtn')}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '0.875rem',
              border: 'none',
              background: 'transparent',
              color: T.muted,
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('misc.exitModal.cancelBtn')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
