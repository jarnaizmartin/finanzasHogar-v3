import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock de las dependencias de auth/almacén: probamos la lógica del proveedor
// (gating, refresh silencioso, adopción de tokens) de forma determinista, sin
// red ni GIS. El flujo OAuth real lo valida el founder en navegador.
const refreshStore = new Map<string, string>();
vi.mock('./refreshTokenStore', () => ({
  loadRefreshToken: () => refreshStore.get('rt') ?? null,
  saveRefreshToken: (t: string) => void refreshStore.set('rt', t),
  clearRefreshToken: () => void refreshStore.delete('rt'),
}));

const beginAuth = vi.fn();
const refreshAccessToken = vi.fn();
const revokeToken = vi.fn();
vi.mock('./googleAuth', () => ({
  beginAuth: (...a: unknown[]) => beginAuth(...a),
  refreshAccessToken: (...a: unknown[]) => refreshAccessToken(...a),
  revokeToken: (...a: unknown[]) => revokeToken(...a),
}));

import {
  googleDriveProvider,
  getActiveAccessToken,
  adoptRedirectTokens,
  hasPendingRefreshToken,
  persistPendingRefreshToken,
  forgetRefreshToken,
  revokeRefreshToken,
} from './googleDriveProvider';
import { makeAccessToken } from './tokenState';

const liveToken = () => makeAccessToken('AT', 3600);

beforeEach(() => {
  refreshStore.clear();
  beginAuth.mockReset();
  refreshAccessToken.mockReset();
  revokeToken.mockReset();
  googleDriveProvider.disconnect();
});
afterEach(() => {
  vi.unstubAllEnvs();
  googleDriveProvider.disconnect();
});

describe('googleDriveProvider — identidad y estado base', () => {
  it('se identifica como proveedor google-drive', () => {
    expect(googleDriveProvider.id).toBe('google-drive');
  });

  it('isConfigured() refleja la presencia del Client ID', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');
    expect(googleDriveProvider.isConfigured()).toBe(false);
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'cid');
    expect(googleDriveProvider.isConfigured()).toBe(true);
  });

  it('isConnected()/getActiveAccessToken() sin sesión', () => {
    expect(googleDriveProvider.isConnected()).toBe(false);
    expect(getActiveAccessToken()).toBeNull();
  });

  it('el I/O del vault exige sesión: sin token vivo lanza TOKEN_EXPIRED', async () => {
    await expect(googleDriveProvider.readVault()).rejects.toMatchObject({ code: 'TOKEN_EXPIRED' });
    await expect(googleDriveProvider.writeVault('x', null)).rejects.toMatchObject({ code: 'TOKEN_EXPIRED' });
    await expect(googleDriveProvider.deleteVault()).rejects.toMatchObject({ code: 'TOKEN_EXPIRED' });
  });
});

describe('connect — reconexión silenciosa vía refresh_token', () => {
  it('refresca en silencio cuando hay refresh_token guardado (no navega)', async () => {
    refreshStore.set('rt', 'RT');
    refreshAccessToken.mockResolvedValue({ token: liveToken() });
    await googleDriveProvider.connect(false);
    expect(refreshAccessToken).toHaveBeenCalledWith('RT');
    expect(googleDriveProvider.isConnected()).toBe(true);
    expect(beginAuth).not.toHaveBeenCalled();
  });

  it('persiste el refresh_token si Google lo rota', async () => {
    refreshStore.set('rt', 'RT-OLD');
    refreshAccessToken.mockResolvedValue({ token: liveToken(), refreshToken: 'RT-NEW' });
    await googleDriveProvider.connect(false);
    expect(refreshStore.get('rt')).toBe('RT-NEW');
  });

  it('silencioso sin refresh_token → TOKEN_EXPIRED, sin navegar', async () => {
    await expect(googleDriveProvider.connect(false)).rejects.toMatchObject({ code: 'TOKEN_EXPIRED' });
    expect(beginAuth).not.toHaveBeenCalled();
  });

  it('silencioso con refresh revocado → propaga el error, sin navegar', async () => {
    refreshStore.set('rt', 'RT');
    refreshAccessToken.mockRejectedValue(new Error('invalid_grant'));
    await expect(googleDriveProvider.connect(false)).rejects.toBeTruthy();
    expect(beginAuth).not.toHaveBeenCalled();
  });

  it('interactivo sin token → navega a Google (beginAuth)', async () => {
    beginAuth.mockResolvedValue(undefined);
    await googleDriveProvider.connect(true);
    expect(beginAuth).toHaveBeenCalled();
  });

  it('interactivo cae al redirect si el refresh falla', async () => {
    refreshStore.set('rt', 'RT');
    refreshAccessToken.mockRejectedValue(new Error('revoked'));
    beginAuth.mockResolvedValue(undefined);
    await googleDriveProvider.connect(true);
    expect(beginAuth).toHaveBeenCalled();
  });

  it('no-op si ya hay token vivo', async () => {
    adoptRedirectTokens({ token: liveToken(), refreshToken: 'RT' });
    await googleDriveProvider.connect(false);
    expect(refreshAccessToken).not.toHaveBeenCalled();
  });
});

describe('adopción y persistencia de tokens del redirect', () => {
  it('adoptRedirectTokens deja la sesión viva y el refresh pendiente', () => {
    adoptRedirectTokens({ token: liveToken(), refreshToken: 'RT' });
    expect(googleDriveProvider.isConnected()).toBe(true);
    expect(getActiveAccessToken()).toBe('AT');
    expect(hasPendingRefreshToken()).toBe(true);
  });

  it('persistPendingRefreshToken guarda y deja de estar pendiente', () => {
    adoptRedirectTokens({ token: liveToken(), refreshToken: 'RT' });
    persistPendingRefreshToken();
    expect(refreshStore.get('rt')).toBe('RT');
    expect(hasPendingRefreshToken()).toBe(false);
  });

  it('disconnect conserva el refresh_token guardado (reconexión retoma)', () => {
    adoptRedirectTokens({ token: liveToken(), refreshToken: 'RT' });
    persistPendingRefreshToken();
    googleDriveProvider.disconnect();
    expect(googleDriveProvider.isConnected()).toBe(false);
    expect(refreshStore.get('rt')).toBe('RT');
  });

  it('forgetRefreshToken borra el guardado y el pendiente', () => {
    adoptRedirectTokens({ token: liveToken(), refreshToken: 'RT' });
    persistPendingRefreshToken();
    forgetRefreshToken();
    expect(refreshStore.get('rt')).toBeUndefined();
    expect(hasPendingRefreshToken()).toBe(false);
  });
});

describe('revokeRefreshToken', () => {
  it('revoca el refresh_token guardado', async () => {
    refreshStore.set('rt', 'RT');
    revokeToken.mockResolvedValue(undefined);
    await revokeRefreshToken();
    expect(revokeToken).toHaveBeenCalledWith('RT');
  });

  it('revoca el pendiente si aún no se persistió', async () => {
    adoptRedirectTokens({ token: liveToken(), refreshToken: 'RT-PEND' });
    revokeToken.mockResolvedValue(undefined);
    await revokeRefreshToken();
    expect(revokeToken).toHaveBeenCalledWith('RT-PEND');
  });

  it('no-op si no hay token que revocar', async () => {
    await revokeRefreshToken();
    expect(revokeToken).not.toHaveBeenCalled();
  });
});
