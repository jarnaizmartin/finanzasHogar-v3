import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { googleDriveProvider, getActiveAccessToken } from './googleDriveProvider';

// Forzamos "no configurado" controlando el entorno (no dependemos del .env del
// desarrollador): así verificamos todo el contorno sin GIS real, de forma
// determinista. El flujo OAuth contra Google lo valida el founder en navegador.
describe('googleDriveProvider (sin Client ID configurado)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    googleDriveProvider.disconnect();
  });

  it('se identifica como proveedor google-drive', () => {
    expect(googleDriveProvider.id).toBe('google-drive');
  });

  it('isConfigured() es false sin Client ID', () => {
    expect(googleDriveProvider.isConfigured()).toBe(false);
  });

  it('isConnected() es false sin sesión', () => {
    expect(googleDriveProvider.isConnected()).toBe(false);
  });

  it('getActiveAccessToken() es null sin sesión', () => {
    expect(getActiveAccessToken()).toBeNull();
  });

  it('connect() rechaza con NOT_CONFIGURED cuando falta el Client ID', async () => {
    await expect(googleDriveProvider.connect(true)).rejects.toMatchObject({
      code: 'NOT_CONFIGURED',
    });
  });

  it('disconnect() no lanza y deja la sesión cerrada', () => {
    expect(() => googleDriveProvider.disconnect()).not.toThrow();
    expect(googleDriveProvider.isConnected()).toBe(false);
  });

  it('el I/O del vault exige sesión: sin token vivo lanza TOKEN_EXPIRED', async () => {
    await expect(googleDriveProvider.readVault()).rejects.toMatchObject({
      code: 'TOKEN_EXPIRED',
    });
    await expect(
      googleDriveProvider.writeVault('x', null)
    ).rejects.toMatchObject({ code: 'TOKEN_EXPIRED' });
    await expect(googleDriveProvider.deleteVault()).rejects.toMatchObject({
      code: 'TOKEN_EXPIRED',
    });
  });
});
