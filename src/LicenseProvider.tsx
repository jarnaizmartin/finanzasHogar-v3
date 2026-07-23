// ============================================================
// LICENSE PROVIDER
// Vive aparte de LicenseContext.tsx para que ese fichero no mezcle
// componente y hook (react-refresh: Fast Refresh en desarrollo).
// ============================================================

import React, { useEffect, useState } from 'react';
import type { LicenseState } from './licenseManager';
import {
  initLicense,
  checkAndUpdateExpiry,
  getTrialDaysRemaining,
  validateAndActivate,
} from './licenseManager';
import { LicenseContext } from './LicenseContext';

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const [license, setLicense] = useState<LicenseState>(() => {
    const initial = initLicense();
    return checkAndUpdateExpiry(initial);
  });

  // Comprueba expiración cada vez que la app se enfoca
  useEffect(() => {
    const handleFocus = () => {
      setLicense(prev => checkAndUpdateExpiry(prev));
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Comprueba expiración cada hora automáticamente
  useEffect(() => {
    const interval = setInterval(() => {
      setLicense(prev => checkAndUpdateExpiry(prev));
    }, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  // ── Valores derivados ──────────────────────────────────────

  const daysRemaining = getTrialDaysRemaining(license);
  const isActivated = license.mode === 'activated';
  const isTrial = license.mode === 'trial';
  const isExpired = license.mode === 'expired';
  const isGraceTrial = license.mode === 'grace_trial';
  const isReadOnly = isExpired; // Solo lectura cuando expira

  // ── Activar licencia ───────────────────────────────────────

  const activate = async (code: string) => {
    const result = await validateAndActivate(code, license);

    if (result.success && result.newState) {
      setLicense(result.newState);
    }
    return { success: result.success, message: result.message };
  };

  // ── Refrescar manualmente ──────────────────────────────────

  const refreshLicense = () => {
    setLicense(prev => checkAndUpdateExpiry(prev));
  };

  return (
    <LicenseContext.Provider
      value={{
        license,
        daysRemaining,
        isActivated,
        isTrial,
        isExpired,
        isGraceTrial,
        isReadOnly,
        activate,
        refreshLicense,
      }}
    >
      {children}
    </LicenseContext.Provider>
  );
}
