// ─── Controlador React del sync (C2) — enchufa el bucle puro a la app ─────────
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §6–§8.
//
// Toda la LÓGICA del sync ya es pura y está probada (runSync, syncOnce, codec,
// merge, snapshot). Este hook es solo el CONTROLADOR: decide cuándo sincronizar
// (gating + disparadores), arma las piezas locales, llama a `runSync` y aplica el
// resultado al estado preservando el LWW. Se valida en navegador real, no por
// unit tests (el transporte se validó en sesión 48).
//
// Gating (las tres a la vez):
//   1. multi-dispositivo activado (flag `fh_sync_enabled`, opt-in en Ajustes).
//   2. sesión de Drive viva (`googleDriveProvider.isConnected()`).
//   3. clave de sync en memoria (`getSyncKey()` != null) + salt persistido.
//
// Disparadores: al abrir (conexión silenciosa) · debounce ~3 s tras cambios en
// `raw` · botón manual "Sincronizar ahora".
//
// ⚠️ LWW: el merge se aplica SIEMPRE con `applySyncedData` (setters crudos), nunca
// con los setters envueltos — re-sellar `updatedAt` corrompería la próxima fusión.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import { googleDriveProvider } from '../lib/sync/googleDriveProvider';
import { runSync } from '../lib/sync/runSync';
import { encodeVault, decodeVault } from '../lib/sync/vaultCodec';
import { SyncError, type SyncErrorCode } from '../lib/sync/types';
import type { SyncStatus } from '../lib/sync/syncEngine';
import { getEncryptedItem, setEncryptedItem } from '../lib/encryptedStorage';
import { useData } from '../contexts/DataContext';
import { useSettings } from '../contexts/SettingsContext';
import { useSecurityContext } from '../SecurityContext';

// Flag de opt-in multi-dispositivo. NO secreto. Lo activa/desactiva el toggle de
// Ajustes (C3). Mientras esté ausente/false, el hook es inerte (app idéntica).
const SYNC_ENABLED_KEY = 'fh_sync_enabled';
const LICENSE_KEY = 'fh_license_state';
const DEBOUNCE_MS = 3000;

export type SyncPhase = 'idle' | 'syncing' | 'error';

/** Lo que el hook expone a la UI (Ajustes, indicadores). */
export type SyncController = {
  /** Opt-in multi-dispositivo (persistido en `fh_sync_enabled`). */
  enabled: boolean;
  /** ¿Hay sesión de Drive viva ahora mismo? */
  connected: boolean;
  phase: SyncPhase;
  lastSyncAt: number | null;
  lastStatus: SyncStatus | null;
  /** Código del último error (null si la última pasada fue bien). */
  errorCode: SyncErrorCode | null;
  /** Nº de movimientos que el último merge marcó como posible duplicado (§8.3). */
  duplicateCount: number;
  /** Ejecuta una pasada manual ("Sincronizar ahora"). */
  syncNow: () => Promise<void>;
  /** Activa/desactiva el opt-in multi-dispositivo (toggle de Ajustes). */
  setEnabled: (on: boolean) => void;
  /** Re-lee el estado de conexión de Drive a estado React (tras conectar/desconectar). */
  refreshConnection: () => void;
  /** Olvida el aviso de duplicados (cuando el usuario lo ha revisado). */
  clearDuplicates: () => void;
  /** Limpia el estado de error (tras una recuperación, p. ej. borrar el vault). */
  clearError: () => void;
};

function readEnabledFlag(): boolean {
  try {
    return localStorage.getItem(SYNC_ENABLED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Controlador del sync. Se monta UNA vez (AppCoreProvider). Inerte mientras el
 * opt-in esté desactivado.
 */
export function useSync(): SyncController {
  const data = useData();
  const settings = useSettings();
  const { getSyncKey, getSyncSalt } = useSecurityContext();

  const {
    raw,
    realExpenses, // lista VIVA — base para detectar duplicados del merge (§8.3)
    applySyncedData,
  } = data;
  const {
    baseCurrency, displayCurrency, dark,
    setBaseCurrency, setDisplayCurrency, setDark,
  } = settings;

  const [enabled, setEnabledState] = useState<boolean>(readEnabledFlag);
  const [connected, setConnected] = useState<boolean>(() => googleDriveProvider.isConnected());
  const [phase, setPhase] = useState<SyncPhase>('idle');
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const [lastStatus, setLastStatus] = useState<SyncStatus | null>(null);
  const [errorCode, setErrorCode] = useState<SyncErrorCode | null>(null);
  const [duplicateCount, setDuplicateCount] = useState<number>(0);

  // Guarda de concurrencia: una sola pasada a la vez; si llega otra, se encola una.
  const runningRef = useRef(false);
  const pendingRef = useRef(false);
  // Evita un debounce extra en el render de asentamiento tras aplicar un merge.
  const skipDebounceRef = useRef(false);

  // La pasada real vive en un ref reasignado en cada render → siempre ve los
  // valores frescos (raw, escalares, clave) sin recrear el `syncNow` estable ni
  // re-suscribir los efectos.
  const doSyncRef = useRef<() => Promise<void>>(async () => {});
  doSyncRef.current = async () => {
    // ── Gating ────────────────────────────────────────────────────────────────
    if (!enabled) return;
    if (!googleDriveProvider.isConnected()) return;
    const key = getSyncKey();
    const salt = getSyncSalt();
    if (!key || !salt) return;

    if (runningRef.current) {
      pendingRef.current = true; // ya hay una pasada → encolar una más
      return;
    }
    runningRef.current = true;
    setPhase('syncing');

    try {
      const codec = {
        encode: (snapshot: Parameters<typeof encodeVault>[0]) =>
          encodeVault(snapshot, key, salt),
        decode: (content: string) => decodeVault(content, key),
      };

      // La licencia se guarda cifrada como cadena JSON (whitelist de
      // encryptedStorage). El motor de merge la trata como escalar opaco.
      const licenseState: string | null = getEncryptedItem(LICENSE_KEY);

      const out = await runSync({
        transport: googleDriveProvider,
        codec,
        localParts: {
          accounts: raw.accounts,
          categories: raw.categories,
          projections: raw.projections,
          realExpenses: raw.realExpenses,
          goals: raw.goals,
          bankFormats: raw.bankFormats,
          categoryRules: raw.categoryRules,
          baseCurrency,
          displayCurrency,
          dark,
          licenseState,
          timestamp: Date.now(),
        },
        beforeLiveRealExpenses: realExpenses,
      });

      // ── Aplicar el resultado (solo si el merge trajo cambios remotos) ────────
      if (out.result.remoteChanged) {
        const snap = out.result.snapshot;
        // El próximo cambio de `raw` será el de este apply → no relanzar sync.
        skipDebounceRef.current = true;
        applySyncedData({
          accounts: snap.accounts,
          categories: snap.categories,
          projections: snap.projections,
          realExpenses: snap.realExpenses,
          goals: snap.goals,
          bankFormats: snap.bankFormats,
          categoryRules: snap.categoryRules,
        });
        if (snap.baseCurrency !== baseCurrency) setBaseCurrency(snap.baseCurrency);
        if (snap.displayCurrency !== displayCurrency) setDisplayCurrency(snap.displayCurrency);
        if (snap.dark !== dark) setDark(snap.dark);
        // licenseState nunca se degrada a null en el merge; solo escribir si hay.
        if (typeof snap.licenseState === 'string') {
          setEncryptedItem(LICENSE_KEY, snap.licenseState);
        }
      }

      setDuplicateCount(out.duplicates.length);
      setLastStatus(out.result.status);
      setLastSyncAt(Date.now());
      setErrorCode(null);
      setConnected(true);
      setPhase('idle');
    } catch (e) {
      const code: SyncErrorCode =
        e instanceof SyncError ? e.code : 'AUTH_FAILED';
      // NETWORK y caducidad de token son transitorios: no son "error" rojo, se
      // reintenta en el siguiente disparador. Token caducado → marca desconectado
      // (Ajustes ofrece reconectar). El resto sí es estado de error visible.
      if (code === 'NETWORK') {
        setPhase('idle');
      } else if (
        code === 'TOKEN_EXPIRED' ||
        code === 'AUTH_FAILED' ||
        code === 'AUTH_CANCELLED'
      ) {
        setConnected(false);
        setErrorCode(code);
        setPhase('idle');
      } else {
        // WRONG_PASSWORD · SCHEMA_TOO_NEW · INVALID_VAULT · NOT_CONFIGURED…
        setErrorCode(code);
        setPhase('error');
      }
    } finally {
      runningRef.current = false;
      if (pendingRef.current) {
        pendingRef.current = false;
        void doSyncRef.current();
      }
    }
  };

  const syncNow = useCallback(() => doSyncRef.current(), []);

  const refreshConnection = useCallback(() => {
    setConnected(googleDriveProvider.isConnected());
  }, []);

  const setEnabled = useCallback((on: boolean) => {
    try {
      localStorage.setItem(SYNC_ENABLED_KEY, on ? 'true' : 'false');
    } catch {
      /* ignore */
    }
    setEnabledState(on);
  }, []);

  const clearDuplicates = useCallback(() => setDuplicateCount(0), []);

  const clearError = useCallback(() => {
    setErrorCode(null);
    setPhase('idle');
  }, []);

  // ── Disparador: al abrir (multi-ON) → conexión silenciosa + primera pasada ──
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      try {
        if (!googleDriveProvider.isConnected()) {
          // 'none': intento silencioso si la sesión de Google sigue viva. Si no,
          // lanza → el usuario reconecta desde Ajustes (no es un error visible).
          await googleDriveProvider.connect(false);
        }
        if (cancelled) return;
        setConnected(true);
        void doSyncRef.current();
      } catch {
        if (!cancelled) setConnected(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  // ── Disparador: debounce ~3 s tras cambios en las colecciones (raw) ─────────
  useEffect(() => {
    if (!enabled) return;
    if (skipDebounceRef.current) {
      // Render de asentamiento tras aplicar un merge: no relanzar.
      skipDebounceRef.current = false;
      return;
    }
    const t = setTimeout(() => void doSyncRef.current(), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [
    enabled,
    raw.accounts, raw.categories, raw.projections, raw.realExpenses,
    raw.goals, raw.bankFormats, raw.categoryRules,
  ]);

  return {
    enabled,
    connected,
    phase,
    lastSyncAt,
    lastStatus,
    errorCode,
    duplicateCount,
    syncNow,
    setEnabled,
    refreshConnection,
    clearDuplicates,
    clearError,
  };
}
