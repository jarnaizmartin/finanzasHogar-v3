// ─── Proveedor de transporte: Google Drive (autenticación GIS) ───────────────
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §4–§5.
//
// Implementa SyncProvider usando el "token model" de Google Identity Services:
// pide un access_token de corta vida en el navegador, sin client_secret y sin
// backend (Google exige secreto para Authorization Code + PKCE en clientes web;
// GIS es el camino limpio sin backend — ver sesión 48).
//
// Este bloque cubre la AUTENTICACIÓN (connect/disconnect/isConnected). El I/O del
// vault contra Drive (readVault/writeVault/deleteVault) se implementa en el bloque
// siguiente y por ahora lanza NOT_IMPLEMENTED.
// ─────────────────────────────────────────────────────────────────────────────

import type { SyncProvider, SyncConnection, VaultBlob } from './types';
import { SyncError } from './types';
import { makeAccessToken, isTokenLive, type AccessToken } from './tokenState';
import { loadGoogleIdentityServices } from './googleScript';
import * as driveRest from './driveRest';

// Scope mínimo: solo la carpeta oculta por-app del usuario, no todo su Drive.
const DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';

// Se lee en tiempo de llamada (no como const al importar): así la config no queda
// congelada al cargar el módulo y los tests pueden controlarla con vi.stubEnv.
const getClientId = (): string | undefined =>
  import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

// ── Tipos mínimos de GIS (no hay @types oficiales en el proyecto) ────────────
interface GisTokenResponse {
  access_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
}
interface GisErrorResponse {
  type?: string;
  message?: string;
}
interface GisTokenClient {
  requestAccessToken(overrideConfig?: { prompt?: string }): void;
}
interface GisOAuth2 {
  initTokenClient(config: {
    client_id: string;
    scope: string;
    callback: (resp: GisTokenResponse) => void;
    error_callback?: (err: GisErrorResponse) => void;
  }): GisTokenClient;
}
declare global {
  interface Window {
    google?: { accounts?: { oauth2?: GisOAuth2 } };
  }
}

// ── Estado en memoria (no persiste: el token de sesión nunca toca disco) ──────
let tokenClient: GisTokenClient | null = null;
let currentToken: AccessToken | null = null;
// El callback de GIS es por-cliente; guardamos los handlers de la solicitud en
// curso para resolver/rechazar su Promise. Solo una solicitud a la vez.
let pending: {
  resolve: (t: AccessToken) => void;
  reject: (e: unknown) => void;
} | null = null;

async function ensureTokenClient(): Promise<GisTokenClient> {
  const clientId = getClientId();
  if (!clientId) throw new SyncError('NOT_CONFIGURED');
  await loadGoogleIdentityServices();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) throw new SyncError('AUTH_FAILED', 'GIS no disponible tras cargar');
  if (!tokenClient) {
    tokenClient = oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_APPDATA_SCOPE,
      callback: (resp) => {
        const p = pending;
        pending = null;
        if (!p) return;
        if (resp.error || !resp.access_token || !resp.expires_in) {
          p.reject(
            new SyncError(
              'AUTH_FAILED',
              resp.error_description || resp.error || 'respuesta sin token'
            )
          );
          return;
        }
        const tok = makeAccessToken(resp.access_token, resp.expires_in);
        currentToken = tok;
        p.resolve(tok);
      },
      error_callback: (err) => {
        const p = pending;
        pending = null;
        if (!p) return;
        // popup_closed = el usuario cerró el consentimiento → cancelación.
        const code =
          err.type === 'popup_closed' ? 'AUTH_CANCELLED' : 'AUTH_FAILED';
        p.reject(new SyncError(code, err.message || err.type));
      },
    });
  }
  return tokenClient;
}

function requestToken(interactive: boolean): Promise<AccessToken> {
  return new Promise<AccessToken>((resolve, reject) => {
    ensureTokenClient()
      .then((client) => {
        if (pending) {
          reject(new SyncError('AUTH_FAILED', 'ya hay una solicitud en curso'));
          return;
        }
        pending = { resolve, reject };
        try {
          // interactive → '' deja que Google muestre consentimiento si hace falta.
          // no interactive → 'none' intenta en silencio (sesión de Google viva).
          client.requestAccessToken({ prompt: interactive ? '' : 'none' });
        } catch (e) {
          pending = null;
          reject(new SyncError('AUTH_FAILED', String(e)));
        }
      })
      .catch(reject);
  });
}

export const googleDriveProvider: SyncProvider = {
  id: 'google-drive',

  isConfigured(): boolean {
    return Boolean(getClientId());
  },

  async connect(interactive: boolean): Promise<SyncConnection> {
    if (isTokenLive(currentToken)) {
      return { providerId: 'google-drive' };
    }
    await requestToken(interactive);
    return { providerId: 'google-drive' };
  },

  isConnected(): boolean {
    return isTokenLive(currentToken);
  },

  disconnect(): void {
    currentToken = null;
    pending = null;
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
