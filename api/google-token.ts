// ─── Función serverless de SOLO-AUTH — intercambio/refresh de token OAuth ─────
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §11.4.
//
// Único backend del proyecto. STATELESS: no tiene BD, no guarda nada, NUNCA ve el
// vault ni dato alguno del usuario (la app habla con Drive directamente con el
// access_token). Su única razón de existir es custodiar el `client_secret` de
// Google —que un cliente público no puede tener— para poder canjear el `code` de
// Authorization Code + PKCE por un refresh_token y, después, refrescar el
// access_token en silencio (la base de la reconexión automática, §11.2).
//
// El cero-conocimiento frente a la nube y el compromiso GDPR (no custodiar datos)
// se mantienen intactos: aquí solo viajan credenciales OAuth, no datos.
//
// Variables de entorno requeridas (Vercel, proyecto `finanzas-hogar`):
//   · GOOGLE_CLIENT_ID       — el mismo client_id de VITE_GOOGLE_CLIENT_ID.
//   · GOOGLE_CLIENT_SECRET   — el secret del client OAuth (NUNCA en el cliente).
//   · OAUTH_ALLOWED_ORIGINS  — orígenes permitidos (CSV). Opcional; por defecto
//                              la URL de producción + localhost de dev.
// ─────────────────────────────────────────────────────────────────────────────

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE_ENDPOINT = 'https://oauth2.googleapis.com/revoke';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://finanzas-hogar-eta.vercel.app',
  'http://localhost:5173',
];

type ExchangeBody = {
  action: 'exchange';
  code: string;
  codeVerifier: string;
  redirectUri: string;
};
type RefreshBody = {
  action: 'refresh';
  refreshToken: string;
};
type RevokeBody = {
  action: 'revoke';
  token: string;
};
type RequestBody = ExchangeBody | RefreshBody | RevokeBody;

function allowedOrigins(): string[] {
  const csv = process.env.OAUTH_ALLOWED_ORIGINS;
  if (!csv) return DEFAULT_ALLOWED_ORIGINS;
  return csv.split(',').map((o) => o.trim()).filter(Boolean);
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && allowedOrigins().includes(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function json(
  body: unknown,
  status: number,
  origin: string | null
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

/**
 * Llama al token endpoint de Google con el client_secret y normaliza la salida a
 * lo mínimo que el cliente necesita. No registra ni reenvía secretos.
 */
async function callGoogleToken(
  params: Record<string, string>
): Promise<Response> {
  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  });
  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !data.access_token) {
    // Reenviamos solo el código de error de Google (sin detalles sensibles).
    return Response.json(
      { error: data.error || 'token_request_failed' },
      { status: res.status === 200 ? 502 : res.status }
    );
  }
  return Response.json({
    access_token: data.access_token,
    expires_in: data.expires_in ?? 3600,
    // Solo presente en `exchange` o si Google rota el refresh. El cliente debe
    // conservar el anterior si aquí no llega ninguno (§11.6, rotación).
    refresh_token: data.refresh_token,
  });
}

export default async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405, origin);
  }
  // Rechaza orígenes no permitidos (la cabecera CORS vendría vacía).
  if (!origin || !allowedOrigins().includes(origin)) {
    return json({ error: 'origin_not_allowed' }, 403, origin);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return json({ error: 'server_not_configured' }, 500, origin);
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return json({ error: 'invalid_json' }, 400, origin);
  }

  let googleRes: Response;
  if (body.action === 'exchange') {
    if (!body.code || !body.codeVerifier || !body.redirectUri) {
      return json({ error: 'missing_exchange_params' }, 400, origin);
    }
    googleRes = await callGoogleToken({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code: body.code,
      code_verifier: body.codeVerifier,
      redirect_uri: body.redirectUri,
    });
  } else if (body.action === 'refresh') {
    if (!body.refreshToken) {
      return json({ error: 'missing_refresh_token' }, 400, origin);
    }
    googleRes = await callGoogleToken({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: body.refreshToken,
    });
  } else if (body.action === 'revoke') {
    // Revoca el grant (desconectar y borrar de la nube, §11.6). No necesita
    // secret. Idempotente: Google devuelve 400 si el token ya era inválido —
    // lo tratamos como éxito (el objetivo es que deje de valer).
    if (!body.token) return json({ error: 'missing_token' }, 400, origin);
    let r: Response;
    try {
      r = await fetch(GOOGLE_REVOKE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: body.token }).toString(),
      });
    } catch {
      return json({ error: 'revoke_network' }, 502, origin);
    }
    return json({ revoked: r.ok || r.status === 400 }, 200, origin);
  } else {
    return json({ error: 'unknown_action' }, 400, origin);
  }

  // Propaga la respuesta de Google añadiendo las cabeceras CORS.
  const out = await googleRes.json();
  return json(out, googleRes.status, origin);
}
