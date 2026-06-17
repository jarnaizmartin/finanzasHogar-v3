// ─── PKCE (RFC 7636) — helpers para OAuth Authorization Code flow ─────────────
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §11 (reconexión automática).
//
// El §11 sustituye el modelo de token de GIS (sin refresh token) por el flujo
// OAuth 2.0 Authorization Code + PKCE. PKCE evita que un atacante que intercepte
// el `code` de autorización pueda canjearlo: el cliente genera un `code_verifier`
// aleatorio, manda su hash (`code_challenge`, S256) al abrir el consentimiento, y
// presenta el verifier original al canjear el code. Sin el verifier, el code es
// inútil → no hace falta client_secret en el navegador (vive en la función de
// solo-auth, §11.4).
//
// Módulo PURO (solo Web Crypto + URL): sin estado, sin red, sin DOM. Testeable
// con el vector canónico del RFC 7636 (Apéndice B).
// ─────────────────────────────────────────────────────────────────────────────

// 32 bytes → 43 chars base64url, dentro del rango legal del verifier (43..128).
const VERIFIER_BYTES = 32;
const STATE_BYTES = 16;

// Endpoint de autorización de Google (el canje del code lo hace la función de
// solo-auth, no el navegador — ver §11.4).
const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';

/** Codifica bytes a base64url SIN padding (alfabeto URL-safe, RFC 4648 §5). */
export function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Genera un `code_verifier` aleatorio (43 chars base64url, alta entropía). */
export function generateCodeVerifier(): string {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(VERIFIER_BYTES)));
}

/** Genera un `state` opaco anti-CSRF para correlacionar la vuelta del redirect. */
export function generateState(): string {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(STATE_BYTES)));
}

/** Deriva el `code_challenge` (S256) = base64url(SHA-256(verifier)). */
export async function deriveCodeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier)
  );
  return base64UrlEncode(new Uint8Array(digest));
}

/** Par PKCE + state listos para iniciar el flujo. */
export type PkcePair = {
  verifier: string;
  challenge: string;
  state: string;
};

/** Crea un par PKCE completo (verifier + challenge S256 + state). */
export async function createPkcePair(): Promise<PkcePair> {
  const verifier = generateCodeVerifier();
  const challenge = await deriveCodeChallenge(verifier);
  return { verifier, challenge, state: generateState() };
}

/**
 * Construye la URL de consentimiento de Google para el flujo Authorization Code.
 *
 * `access_type=offline` + `prompt=consent` son lo que hace que Google devuelva un
 * refresh_token (la clave de la reconexión automática, §11.2). Sin `prompt=consent`
 * Google omite el refresh en re-autorizaciones de un usuario que ya consintió.
 */
export function buildAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  scope: string;
  codeChallenge: string;
  state: string;
}): string {
  const url = new URL(GOOGLE_AUTH_ENDPOINT);
  url.searchParams.set('client_id', params.clientId);
  url.searchParams.set('redirect_uri', params.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', params.scope);
  url.searchParams.set('code_challenge', params.codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('state', params.state);
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  return url.toString();
}
