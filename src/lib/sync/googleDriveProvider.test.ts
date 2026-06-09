import { describe, it, expect } from 'vitest';
import { googleDriveProvider, getActiveAccessToken } from './googleDriveProvider';

// En el entorno de test VITE_GOOGLE_CLIENT_ID no está definido, así que el
// proveedor está "no configurado": podemos verificar todo el contorno sin GIS real.
// El flujo OAuth contra Google lo valida el founder en navegador.
describe('googleDriveProvider (sin Client ID configurado)', () => {
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

  it('el I/O del vault aún no está implementado (bloque siguiente)', async () => {
    await expect(googleDriveProvider.readVault()).rejects.toMatchObject({
      code: 'NOT_IMPLEMENTED',
    });
    await expect(
      googleDriveProvider.writeVault('x', null)
    ).rejects.toMatchObject({ code: 'NOT_IMPLEMENTED' });
    await expect(googleDriveProvider.deleteVault()).rejects.toMatchObject({
      code: 'NOT_IMPLEMENTED',
    });
  });
});
