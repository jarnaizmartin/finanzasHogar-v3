import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../AppContext';
import { isDemoMode } from '../lib/appMode';

export function BackupReminderBanner({
  onOpenBackup,
}: {
  onOpenBackup: () => void;
}) {
  const {
    T,
    accounts,
    backupHistory,
    backupReminderDays,
    setBackupReminderDays,
    backupReminderDismissed,
    setBackupReminderDismissed,
    autoBackupDone,
    setAutoBackupDone,
    onboardedAt,
  } = useApp();
  // ⚠️ S.1 — Eliminado downloadBackup directo. La descarga se hace
  // desde BackupPanel (que pide contraseña con BackupPasswordModal).
  // useToast ya no se usa aquí porque no hay descarga directa.
  const { t } = useTranslation();
  const [showInfo] = useState(true);

  // 🧪 Modo Prueba: no molestar con copias del sandbox demo.
  if (isDemoMode()) return null;

  const lastBackupTimestamp = backupHistory[0]?.timestamp ?? 0;
  const daysSinceBackup =
    lastBackupTimestamp > 0
      ? Math.floor((Date.now() - lastBackupTimestamp) / (1000 * 60 * 60 * 24))
      : null;
  const daysSinceDismissed =
    backupReminderDismissed > 0
      ? Math.floor(
          (Date.now() - backupReminderDismissed) / (1000 * 60 * 60 * 24)
        )
      : null;
  const neverBackedUp = lastBackupTimestamp === 0;
  const backupIsOld =
    daysSinceBackup !== null && daysSinceBackup >= backupReminderDays;
  const recentlyDismissed =
    daysSinceDismissed !== null && daysSinceDismissed < backupReminderDays;

  // B2 — Gracia para usuarios nuevos: no avisar en ROJO de "nunca has hecho
  // copia" hasta pasados unos días desde el onboarding. Alineado con el
  // auto-backup de primera vez (AppProvider, `daysSinceOnboarding >= 3`).
  // Evita que un recién llegado reciba el aviso agresivo nada más crear la
  // primera cuenta. Los avisos por copia ANTIGUA sí se muestran siempre.
  const FIRST_BACKUP_GRACE_DAYS = 3;
  const daysSinceOnboarding =
    onboardedAt > 0
      ? Math.floor((Date.now() - onboardedAt) / (1000 * 60 * 60 * 24))
      : 999;
  const inFirstBackupGrace = daysSinceOnboarding < FIRST_BACKUP_GRACE_DAYS;

  if (accounts.length === 0) return null;

  const showPositive = autoBackupDone;
  const showAlert =
    !autoBackupDone &&
    !recentlyDismissed &&
    ((neverBackedUp && !inFirstBackupGrace) || backupIsOld);
  if (!showPositive && !showAlert) return null;

  const color = showPositive ? T.amber : T.red;
  const bgColor = showPositive ? T.amberBg : T.redBg;
  const border = showPositive ? T.amberBorder : T.redBorder;

  const title = showPositive
    ? t('misc.backupBanner.positiveTitle')
    : neverBackedUp
    ? t('misc.backupBanner.neverTitle')
    : t('misc.backupBanner.oldTitle', { days: daysSinceBackup });

  const subtitle = showPositive
    ? t('misc.backupBanner.positiveSub', {
        accounts: backupHistory[0]?.accountsCount ?? 0,
        projections: backupHistory[0]?.projectionsCount ?? 0,
        movements: backupHistory[0]?.realExpensesCount ?? 0,
        goals: backupHistory[0]?.goalsCount ?? 0,
      })
    : neverBackedUp
    ? t('misc.backupBanner.neverSub')
    : t('misc.backupBanner.oldSub');

  const handleClose = () => {
    if (showPositive) setAutoBackupDone(false);
    else setBackupReminderDismissed(Date.now());
  };

  return (
    <div
      style={{
        margin: '0 0 1.5rem',
        borderRadius: '1rem',
        background: bgColor,
        border: `1.5px solid ${border}`,
        overflow: 'hidden',
        animation: 'fadeSlideIn 0.4s ease both',
      }}
    >
      <div
        style={{
          padding: '0.875rem 1.125rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: '1.25rem',
            flexShrink: 0,
            display: 'inline-block',
            animation: !showPositive
              ? 'warnPulse 2s ease-in-out infinite'
              : 'none',
          }}
        >
          {showPositive ? '💾' : '🔴'}
        </span>
        <div style={{ flex: 1, minWidth: '12rem' }}>
          <div
            style={{
              fontSize: '0.825rem',
              fontWeight: 800,
              color,
              marginBottom: '0.15rem',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '0.775rem',
              color,
              opacity: 0.85,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </div>
        </div>
        {!showPositive && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: '0.68rem',
                color,
                opacity: 0.7,
                whiteSpace: 'nowrap',
              }}
            >
              {t('misc.backupBanner.remindEvery')}
            </span>
            <select
              value={backupReminderDays}
              onChange={(e) => setBackupReminderDays(Number(e.target.value))}
              style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '0.5rem',
                border: `1px solid ${border}`,
                background: bgColor,
                color,
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value={7}>{t('misc.backupBanner.days7')}</option>
              <option value={14}>{t('misc.backupBanner.days14')}</option>
              <option value={30}>{t('misc.backupBanner.days30')}</option>
            </select>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexShrink: 0,
            flexWrap: 'wrap',
          }}
        >
          {backupHistory.length > 0 && (
            <button
              onClick={() => {
                // ⚠️ S.1 — La descarga directa requiere contraseña.
                // Abrimos BackupPanel para que el usuario la introduzca con UX coherente.
                onOpenBackup();
                handleClose();
              }}
              style={{
                padding: '0.5rem 0.875rem',
                borderRadius: '0.625rem',
                border: 'none',
                background: color,
                color: '#ffffff',
                fontSize: '0.775rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {t('misc.backupBanner.downloadNow')}
            </button>
          )}
          <button
            onClick={() => {
              onOpenBackup();
              handleClose();
            }}
            style={{
              padding: '0.5rem 0.875rem',
              borderRadius: '0.625rem',
              border: `1.5px solid ${border}`,
              background: 'transparent',
              color,
              fontSize: '0.775rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {t('misc.backupBanner.viewHistory')}
          </button>
          <button
            onClick={handleClose}
            title={t('misc.backupBanner.closeTitle')}
            style={{
              padding: '0.5rem 0.625rem',
              borderRadius: '0.625rem',
              border: `1px solid ${border}`,
              background: 'transparent',
              color,
              fontSize: '0.8rem',
              cursor: 'pointer',
              opacity: 0.6,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {showInfo && (
        <div
          style={{
            padding: '0.875rem 1.25rem 1rem',
            borderTop: `1px solid ${border}`,
            background: showPositive
              ? 'rgba(217,119,6,0.06)'
              : 'rgba(220,38,38,0.06)',
            animation: 'fadeSlideIn 0.2s ease both',
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color,
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                animation: 'warnPulse 2s ease-in-out infinite',
              }}
            >
              ⚠️
            </span>
            {t('misc.backupBanner.whyTitle')}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              marginBottom: '0.875rem',
            }}
          >
            {[
              { icon: '🧹', titleKey: 'misc.backupBanner.reason1Title' as const, textKey: 'misc.backupBanner.reason1Text' as const },
              { icon: '💻', titleKey: 'misc.backupBanner.reason2Title' as const, textKey: 'misc.backupBanner.reason2Text' as const },
              { icon: '💥', titleKey: 'misc.backupBanner.reason3Title' as const, textKey: 'misc.backupBanner.reason3Text' as const },
              { icon: '🔄', titleKey: 'misc.backupBanner.reason4Title' as const, textKey: 'misc.backupBanner.reason4Text' as const },
            ].map((item) => (
              <div
                key={item.icon}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '0.75rem',
                  background: bgColor,
                  border: `1px solid ${border}`,
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                  {item.icon}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: '0.775rem',
                      fontWeight: 700,
                      color,
                      marginBottom: '0.1rem',
                    }}
                  >
                    {t(item.titleKey)}
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color,
                      opacity: 0.8,
                      lineHeight: 1.5,
                    }}
                  >
                    {t(item.textKey)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              padding: '0.625rem 0.875rem',
              borderRadius: '0.75rem',
              background: color,
              color: '#ffffff',
              fontSize: '0.775rem',
              fontWeight: 600,
              lineHeight: 1.5,
            }}
          >
            {t('misc.backupBanner.recommendation')}
          </div>
        </div>
      )}
    </div>
  );
}
