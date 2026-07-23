// ============================================================
// LICENSE CONTEXT — Finance Hub Beta
// Contexto + hook. El Provider vive en LicenseProvider.tsx.
// ============================================================

import { createContext, useContext } from 'react';
import type { LicenseState } from './licenseManager';

// ── Tipos del contexto ───────────────────────────────────────

export interface LicenseContextType {
  license: LicenseState;
  daysRemaining: number;
  isActivated: boolean;
  isTrial: boolean;
  isExpired: boolean;
  isGraceTrial: boolean;
  isReadOnly: boolean;
  activate: (code: string) => Promise<{ success: boolean; message: string }>;
  refreshLicense: () => void;
}

// ── Creación del contexto ────────────────────────────────────

export const LicenseContext = createContext<LicenseContextType | null>(null);

// ── Hook ─────────────────────────────────────────────────────

export function useLicense(): LicenseContextType {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense debe usarse dentro de LicenseProvider');
  }
  return context;
}
