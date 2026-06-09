// ─── Estado del token de acceso OAuth — lógica pura ──────────────────────────
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §4 / §7.
//
// El modelo de token de GIS (Google Identity Services) entrega un access_token
// de corta vida (~1 h) acompañado de su `expires_in` en segundos, y NO entrega
// refresh token (por diseño de seguridad del navegador). Aquí modelamos solo la
// parte PURA y testeable: guardar token + caducidad y decidir si sigue siendo
// usable, con un margen de seguridad para no usar uno que expira a mitad de una
// operación de red. El efecto (pedir el token a GIS) vive en el proveedor.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Margen de seguridad: tratamos el token como "muerto" este tiempo ANTES de su
 * caducidad real de Google, para que nunca expire en medio de una subida/bajada
 * del vault.
 */
export const TOKEN_EXPIRY_MARGIN_MS = 60_000; // 60 s

export type AccessToken = {
  token: string;
  /** ms epoch en que el token deja de ser válido (caducidad real de Google). */
  expiresAt: number;
};

/**
 * Construye el estado del token a partir de la respuesta de GIS.
 *
 * @param token            access_token devuelto por GIS.
 * @param expiresInSeconds `expires_in` de GIS (segundos hasta la caducidad).
 * @param now              ms epoch de referencia (inyectable para tests).
 */
export function makeAccessToken(
  token: string,
  expiresInSeconds: number,
  now: number = Date.now()
): AccessToken {
  return { token, expiresAt: now + expiresInSeconds * 1000 };
}

/**
 * ¿El token es usable ahora mismo, con margen de seguridad?
 *
 * Devuelve false para token nulo, vacío, caducado, o dentro de la ventana de
 * margen (a punto de caducar). En esos casos el proveedor debe re-pedir token.
 */
export function isTokenLive(
  token: AccessToken | null,
  now: number = Date.now()
): boolean {
  if (!token || !token.token) return false;
  return token.expiresAt - TOKEN_EXPIRY_MARGIN_MS > now;
}
