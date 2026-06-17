import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  parseCallback,
  buildRedirectUri,
  exchangeCode,
  refreshAccessToken,
  revokeToken,
  OAUTH_CALLBACK_PATH,
} from './googleAuth';
import { SyncError } from './types';
import { isTokenLive } from './tokenState';

function res(opts: { ok?: boolean; status?: number; json?: unknown }): Response {
  const status = opts.status ?? 200;
  return {
    ok: opts.ok ?? (status >= 200 && status < 300),
    status,
    json: async () => opts.json,
  } as unknown as Response;
}

function mockFetch(handler: (url: string, init?: RequestInit) => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(handler));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('buildRedirectUri', () => {
  it('compone <origin>/oauth-callback', () => {
    expect(buildRedirectUri('https://app.example')).toBe(
      `https://app.example${OAUTH_CALLBACK_PATH}`
    );
  });
});

describe('parseCallback', () => {
  it('extrae code+state', () => {
    expect(parseCallback('?code=abc&state=xyz')).toEqual({ code: 'abc', state: 'xyz' });
  });
  it('null si falta code o state', () => {
    expect(parseCallback('?code=abc')).toBeNull();
    expect(parseCallback('?state=xyz')).toBeNull();
    expect(parseCallback('')).toBeNull();
  });
});

describe('exchangeCode', () => {
  it('manda action=exchange con code+verifier+redirectUri y devuelve tokens', async () => {
    let sentBody: unknown;
    mockFetch(async (_url, init) => {
      sentBody = JSON.parse(String(init?.body));
      return res({ json: { access_token: 'AT', expires_in: 3600, refresh_token: 'RT' } });
    });
    const out = await exchangeCode('CODE', 'VERIFIER', 'https://app/oauth-callback');
    expect(sentBody).toEqual({
      action: 'exchange',
      code: 'CODE',
      codeVerifier: 'VERIFIER',
      redirectUri: 'https://app/oauth-callback',
    });
    expect(out.refreshToken).toBe('RT');
    expect(isTokenLive(out.token)).toBe(true);
  });

  it('AUTH_FAILED si Google no devuelve refresh_token', async () => {
    mockFetch(async () => res({ json: { access_token: 'AT', expires_in: 3600 } }));
    await expect(exchangeCode('C', 'V', 'R')).rejects.toMatchObject({ code: 'AUTH_FAILED' });
  });

  it('AUTH_FAILED si la función responde error', async () => {
    mockFetch(async () => res({ ok: false, status: 400, json: { error: 'invalid_grant' } }));
    await expect(exchangeCode('C', 'V', 'R')).rejects.toBeInstanceOf(SyncError);
  });

  it('NETWORK si fetch lanza', async () => {
    mockFetch(async () => {
      throw new Error('offline');
    });
    await expect(exchangeCode('C', 'V', 'R')).rejects.toMatchObject({ code: 'NETWORK' });
  });
});

describe('refreshAccessToken', () => {
  it('manda action=refresh y devuelve un token vivo', async () => {
    let sentBody: unknown;
    mockFetch(async (_url, init) => {
      sentBody = JSON.parse(String(init?.body));
      return res({ json: { access_token: 'AT2', expires_in: 3600 } });
    });
    const out = await refreshAccessToken('RT');
    expect(sentBody).toEqual({ action: 'refresh', refreshToken: 'RT' });
    expect(isTokenLive(out.token)).toBe(true);
    expect(out.refreshToken).toBeUndefined();
  });

  it('propaga el refresh_token rotado cuando Google lo devuelve', async () => {
    mockFetch(async () =>
      res({ json: { access_token: 'AT2', expires_in: 3600, refresh_token: 'RT-NEW' } })
    );
    const out = await refreshAccessToken('RT-OLD');
    expect(out.refreshToken).toBe('RT-NEW');
  });

  it('AUTH_FAILED si el refresh_token está revocado (invalid_grant)', async () => {
    mockFetch(async () => res({ ok: false, status: 400, json: { error: 'invalid_grant' } }));
    await expect(refreshAccessToken('RT')).rejects.toMatchObject({ code: 'AUTH_FAILED' });
  });
});

describe('revokeToken', () => {
  it('manda action=revoke con el token', async () => {
    let sentBody: unknown;
    mockFetch(async (_url, init) => {
      sentBody = JSON.parse(String(init?.body));
      return res({ json: { revoked: true } });
    });
    await revokeToken('RT');
    expect(sentBody).toEqual({ action: 'revoke', token: 'RT' });
  });

  it('es best-effort: no lanza si la red falla', async () => {
    mockFetch(async () => {
      throw new Error('offline');
    });
    await expect(revokeToken('RT')).resolves.toBeUndefined();
  });
});
