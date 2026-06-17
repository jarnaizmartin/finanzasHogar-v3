// ─── Cliente OAuth Authorization Code + PKCE (redirect) ──────────────────────
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §11.
//
// Reemplaza el modelo de token de GIS (sin refresh token, silencioso roto en iOS
// Safari por cookies de terceros) por el flujo Authorization Code + PKCE con
// REDIRECT — el único fiable en una PWA iOS (los popups no lo son en standalone).
//
// El canje del `code` y el refresh los hace la función serverless de solo-auth
// (`api/google-token.ts`), que custodia el `client_secret`. Aquí, en el navegador:
//   · beginAuth()           — inicia el redirect a Google (guarda verifier+state).
//   · consumeRedirectResult — al volver, valida el state y canjea el code.
//   · refreshAccessToken    — renueva el access_token en silencio (sin UI).
//
// Las funciones de RED (exchange/refresh/parse) son testeables con fetch mockeado;
// las de NAVEGACIÓN (beginAuth/consume) son finos envoltorios sobre location.
// ─────────────────────────────────────────────────────────────────────────────

import { SyncError } from './types';
import { makeAccessToken, type AccessToken } from './tokenState';
import { createPkcePair, buildAuthUrl } from './pkce';

/** Endpoint de la función serverless de solo-auth (§11.4). */
const TOKEN_FN = '/api/google-token';
/** Ruta de vuelta del consentimiento (registrada como redirect_uri en Google). */
export const OAUTH_CALLBACK_PATH = '/oauth-callback';
const DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
// El verifier y el state viven en sessionStorage solo durante el ida/vuelta del
// redirect (no son secretos persistentes): el code es de un solo uso y el verifier
// se descarta al canjear.
const SS_VERIFIER = 'fh_oauth_verifier';
const SS_STATE = 'fh_oauth_state';

const getClientId = (): string | undefined =>
  import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

/** redirect_uri canónico para este origen (debe estar registrado en Google). */
export function buildRedirectUri(origin: string): string {
  return `${origin}${OAUTH_CALLBACK_PATH}`;
}

/** Extrae `code`+`state` de la query de vuelta. null si no es una vuelta de OAuth. */
export function parseCallback(
  search: string
): { code: string; state: string } | null {
  const params = new URLSearchParams(search);
  const code = params.get('code');
  const state = params.get('state');
  if (!code || !state) return null;
  return { code, state };
}

type TokenFnResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  error?: string;
};

/** Llama a la función de solo-auth y normaliza errores a SyncError. */
async function callTokenFn(body: unknown): Promise<TokenFnResponse> {
  let res: Response;
  try {
    res = await fetch(TOKEN_FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new SyncError('NETWORK', 'fallo de red contra la función de auth');
  }
  let data: TokenFnResponse;
  try {
    data = (await res.json()) as TokenFnResponse;
  } catch {
    data = {};
  }
  if (!res.ok || !data.access_token) {
    // `invalid_grant` en refresh = refresh_token revocado/caducado → re-consentir.
    throw new SyncError('AUTH_FAILED', data.error || `auth fn respondió ${res.status}`);
  }
  return data;
}

/** Canjea el `code` (+ verifier) por access_token y refresh_token. */
export async function exchangeCode(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<{ token: AccessToken; refreshToken: string }> {
  const data = await callTokenFn({ action: 'exchange', code, codeVerifier, redirectUri });
  if (!data.refresh_token) {
    // Sin refresh_token no hay reconexión automática: tratar como fallo de auth.
    throw new SyncError('AUTH_FAILED', 'Google no devolvió refresh_token');
  }
  return {
    token: makeAccessToken(data.access_token!, data.expires_in ?? 3600),
    refreshToken: data.refresh_token,
  };
}

/**
 * Renueva el access_token con el refresh_token guardado. Google puede ROTAR el
 * refresh_token: si la respuesta trae uno nuevo, el llamante debe persistirlo.
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ token: AccessToken; refreshToken?: string }> {
  const data = await callTokenFn({ action: 'refresh', refreshToken });
  return {
    token: makeAccessToken(data.access_token!, data.expires_in ?? 3600),
    refreshToken: data.refresh_token,
  };
}

/**
 * Inicia el flujo: genera PKCE, guarda verifier+state y NAVEGA a Google. La
 * promesa no resuelve (la navegación detiene el contexto de la página).
 */
export async function beginAuth(): Promise<never> {
  const clientId = getClientId();
  if (!clientId) throw new SyncError('NOT_CONFIGURED');
  const { verifier, challenge, state } = await createPkcePair();
  sessionStorage.setItem(SS_VERIFIER, verifier);
  sessionStorage.setItem(SS_STATE, state);
  const url = buildAuthUrl({
    clientId,
    redirectUri: buildRedirectUri(window.location.origin),
    scope: DRIVE_APPDATA_SCOPE,
    codeChallenge: challenge,
    state,
  });
  window.location.assign(url);
  return new Promise<never>(() => {});
}

export type RedirectResult = { token: AccessToken; refreshToken: string };

/**
 * Si la URL actual es la vuelta del consentimiento (`/oauth-callback?code&state`),
 * valida el state contra el guardado, canjea el code y devuelve los tokens.
 * Siempre limpia la URL (no deja el code en la barra ni se reprocesa) y el
 * sessionStorage. Devuelve null si NO estamos en una vuelta de OAuth.
 */
export async function consumeRedirectResult(): Promise<RedirectResult | null> {
  if (typeof window === 'undefined') return null;
  if (window.location.pathname !== OAUTH_CALLBACK_PATH) return null;

  const parsed = parseCallback(window.location.search);
  const expectedState = sessionStorage.getItem(SS_STATE);
  const verifier = sessionStorage.getItem(SS_VERIFIER);
  sessionStorage.removeItem(SS_STATE);
  sessionStorage.removeItem(SS_VERIFIER);
  const cleanUrl = () => window.history.replaceState({}, '', '/');

  if (!parsed) {
    cleanUrl();
    return null;
  }
  if (!verifier || !expectedState || parsed.state !== expectedState) {
    cleanUrl();
    throw new SyncError('AUTH_FAILED', 'state de OAuth no coincide');
  }
  try {
    return await exchangeCode(
      parsed.code,
      verifier,
      buildRedirectUri(window.location.origin)
    );
  } finally {
    cleanUrl();
  }
}
