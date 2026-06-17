// ─── Función serverless de SOLO-AUTH — intercambio/refresh/revoke de token OAuth ─
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §11.4.
//
// Único backend del proyecto. STATELESS: no tiene BD, no guarda nada, NUNCA ve el
// vault ni dato alguno del usuario (la app habla con Drive directamente con el
// access_token). Su única razón de existir es custodiar el `client_secret` de
// Google —que un cliente público no puede tener— para canjear el `code` de
// Authorization Code + PKCE por un refresh_token y, después, refrescar el
// access_token en silencio (la base de la reconexión automática, §11.2).
//
// El cero-conocimiento frente a la nube y el compromiso GDPR (no custodiar datos)
// se mantienen intactos: aquí solo viajan credenciales OAuth, no datos.
//
// ⚠️ Firma NODE clásica `(req, res)`: en un proyecto Vite (no-Next) Vercel invoca
// las funciones de `/api` con esta firma, NO con la web `(Request)=>Response`.
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

// Subconjunto estructural de VercelRequest/VercelResponse que usamos (evita la
// dependencia @vercel/node; Vercel pasa objetos compatibles con Node http).
type Req = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};
type Res = {
  setHeader(name: string, value: string): void;
  status(code: number): Res;
  json(body: unknown): void;
  end(): void;
};

type Body = {
  action?: 'exchange' | 'refresh' | 'revoke';
  code?: string;
  codeVerifier?: string;
  redirectUri?: string;
  refreshToken?: string;
  token?: string;
};

function allowedOrigins(): string[] {
  const csv = process.env.OAUTH_ALLOWED_ORIGINS;
  if (!csv) return DEFAULT_ALLOWED_ORIGINS;
  return csv.split(',').map((o) => o.trim()).filter(Boolean);
}

function setCors(res: Res, origin: string | null): void {
  res.setHeader(
    'Access-Control-Allow-Origin',
    origin && allowedOrigins().includes(origin) ? origin : ''
  );
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
}

/** Llama al token endpoint de Google y normaliza a {status, body}. No registra secretos. */
async function callGoogleToken(
  params: Record<string, string>
): Promise<{ status: number; body: unknown }> {
  const r = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  });
  const data = (await r.json()) as {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
    error?: string;
  };
  if (!r.ok || !data.access_token) {
    return {
      status: r.status === 200 ? 502 : r.status,
      body: { error: data.error || 'token_request_failed' },
    };
  }
  return {
    status: 200,
    body: {
      access_token: data.access_token,
      expires_in: data.expires_in ?? 3600,
      // Solo en exchange o si Google rota el refresh; el cliente conserva el
      // anterior si aquí no llega ninguno (§11.6).
      refresh_token: data.refresh_token,
    },
  };
}

export default async function handler(req: Req, res: Res): Promise<void> {
  const rawOrigin = req.headers.origin;
  const origin = typeof rawOrigin === 'string' ? rawOrigin : null;
  setCors(res, origin);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  if (!origin || !allowedOrigins().includes(origin)) {
    res.status(403).json({ error: 'origin_not_allowed' });
    return;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.status(500).json({ error: 'server_not_configured' });
    return;
  }

  // @vercel/node parsea el JSON cuando el Content-Type es application/json; por
  // robustez aceptamos también string.
  let body: Body;
  try {
    body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {}) as Body;
  } catch {
    res.status(400).json({ error: 'invalid_json' });
    return;
  }

  if (body.action === 'exchange') {
    if (!body.code || !body.codeVerifier || !body.redirectUri) {
      res.status(400).json({ error: 'missing_exchange_params' });
      return;
    }
    const out = await callGoogleToken({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code: body.code,
      code_verifier: body.codeVerifier,
      redirect_uri: body.redirectUri,
    });
    res.status(out.status).json(out.body);
    return;
  }

  if (body.action === 'refresh') {
    if (!body.refreshToken) {
      res.status(400).json({ error: 'missing_refresh_token' });
      return;
    }
    const out = await callGoogleToken({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: body.refreshToken,
    });
    res.status(out.status).json(out.body);
    return;
  }

  if (body.action === 'revoke') {
    // Revoca el grant (§11.6). No necesita secret. Idempotente: Google devuelve
    // 400 si el token ya era inválido → lo tratamos como éxito.
    if (!body.token) {
      res.status(400).json({ error: 'missing_token' });
      return;
    }
    try {
      const r = await fetch(GOOGLE_REVOKE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: body.token }).toString(),
      });
      res.status(200).json({ revoked: r.ok || r.status === 400 });
    } catch {
      res.status(502).json({ error: 'revoke_network' });
    }
    return;
  }

  res.status(400).json({ error: 'unknown_action' });
}
