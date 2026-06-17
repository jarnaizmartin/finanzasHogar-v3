// ─── Proveedor de transporte: Google Drive (OAuth Authorization Code + PKCE) ──
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §4–§5 y §11.
//
// Migrado del modelo de token de GIS (§11.1: sin refresh token, silencioso roto
// en iOS Safari) al flujo Authorization Code + PKCE con REDIRECT y refresh token,
// canjeado/refrescado por la función serverless de solo-auth (`api/google-token`).
//
// Sesión: el access_token vive solo en memoria (`currentToken`). El refresh_token
// se guarda cifrado con la VMK (`refreshTokenStore`) y permite la reconexión
// AUTOMÁTICA: `connect(false)` refresca en silencio sin UI ni cookies de terceros.
//
// El I/O del vault (readVault/writeVault/deleteVault) no cambia: usa el token vivo.
// ─────────────────────────────────────────────────────────────────────────────

import type { SyncProvider, SyncConnection, VaultBlob } from './types';
import { SyncError } from './types';
import { isTokenLive, type AccessToken } from './tokenState';
import {
  beginAuth,
  refreshAccessToken,
  type RedirectResult,
} from './googleAuth';
import {
  loadRefreshToken,
  saveRefreshToken,
  clearRefreshToken,
} from './refreshTokenStore';
import * as driveRest from './driveRest';

// Se lee en tiempo de llamada (no como const al importar): así la config no queda
// congelada al cargar el módulo y los tests pueden controlarla con vi.stubEnv.
const getClientId = (): string | undefined =>
  import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

// ── Estado en memoria (no persiste: el access_token nunca toca disco) ──────────
let currentToken: AccessToken | null = null;
// refresh_token recién canjeado en el redirect, aún SIN persistir: la VMK no está
// disponible hasta el unlock (§11.4). Se persiste con persistPendingRefreshToken().
let pendingRefreshToken: string | null = null;

export const googleDriveProvider: SyncProvider = {
  id: 'google-drive',

  isConfigured(): boolean {
    return Boolean(getClientId());
  },

  /**
   * Asegura una sesión con access_token vivo.
   *  · Si ya hay token vivo → no-op.
   *  · Si hay refresh_token guardado → lo refresca EN SILENCIO (reconexión
   *    automática, §11.2). Funciona sin cookies de terceros → también en iOS.
   *  · Si el refresh falla o no hay token:
   *      - interactive=false → lanza (la UI ofrece reconectar).
   *      - interactive=true  → NAVEGA a Google (la promesa no resuelve).
   */
  async connect(interactive: boolean): Promise<SyncConnection> {
    if (isTokenLive(currentToken)) return { providerId: 'google-drive' };

    const refresh = loadRefreshToken();
    if (refresh) {
      try {
        const { token, refreshToken } = await refreshAccessToken(refresh);
        currentToken = token;
        if (refreshToken) saveRefreshToken(refreshToken); // Google rotó el refresh
        return { providerId: 'google-drive' };
      } catch (e) {
        // refresh_token revocado/caducado. Silencioso → propagar; interactivo →
        // caer al consentimiento por redirect.
        if (!interactive) throw e;
      }
    }

    if (!interactive) throw new SyncError('TOKEN_EXPIRED');

    await beginAuth(); // navega a Google; lanza NOT_CONFIGURED si falta el client_id
    return { providerId: 'google-drive' }; // inalcanzable (la página se va)
  },

  isConnected(): boolean {
    return isTokenLive(currentToken);
  },

  /** Desconexión suave: olvida el token de sesión. CONSERVA el refresh_token
   *  guardado para poder reconectar sin UI (ADR §8.2 "reconectar retoma"). */
  disconnect(): void {
    currentToken = null;
    pendingRefreshToken = null;
  },

  // ── Vault I/O contra Drive (appDataFolder) ──────────────────────────────────
  async readVault(): Promise<VaultBlob | null> {
    return driveRest.readVault(requireToken());
  },
  async writeVault(
    content: string,
    expectedRevision: string | null
  ): Promise<VaultBlob> {
    return driveRest.writeVault(requireToken(), content, expectedRevision);
  },
  async deleteVault(): Promise<void> {
    return driveRest.deleteVault(requireToken());
  },
};

/**
 * Adopta los tokens recién canjeados en la vuelta del redirect (§11.4). El
 * access_token queda vivo en memoria; el refresh_token queda PENDIENTE de
 * persistir hasta que haya VMK (persistPendingRefreshToken, tras el unlock).
 */
export function adoptRedirectTokens(result: RedirectResult): void {
  currentToken = result.token;
  pendingRefreshToken = result.refreshToken;
}

/** ¿Hay un refresh_token recién canjeado aún sin persistir (conexión a medias)? */
export function hasPendingRefreshToken(): boolean {
  return pendingRefreshToken !== null;
}

/** Persiste el refresh_token pendiente (cifrado con la VMK). Requiere unlock. */
export function persistPendingRefreshToken(): void {
  if (pendingRefreshToken) {
    saveRefreshToken(pendingRefreshToken);
    pendingRefreshToken = null;
  }
}

/** Olvida el refresh_token (desconectar y borrar / olvido de contraseña). */
export function forgetRefreshToken(): void {
  pendingRefreshToken = null;
  clearRefreshToken();
}

/** Devuelve el token vivo o lanza TOKEN_EXPIRED si no hay sesión usable. */
function requireToken(): string {
  const token = getActiveAccessToken();
  if (!token) throw new SyncError('TOKEN_EXPIRED');
  return token;
}

/**
 * Token de acceso vivo para el bloque de I/O del vault (no forma parte del
 * contrato SyncProvider). Devuelve null si no hay sesión o el token caducó.
 */
export function getActiveAccessToken(): string | null {
  return isTokenLive(currentToken) ? currentToken!.token : null;
}
