import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de la capa de cifrado at-rest: el store es solo un envoltorio tipado que
// debe pasar por la clave correcta. Verificamos el cableado, no el cifrado.
const store = new Map<string, string>();
vi.mock('../encryptedStorage', () => ({
  getEncryptedItem: (k: string) => store.get(k) ?? null,
  setEncryptedItem: (k: string, v: string) => void store.set(k, v),
  removeEncryptedItem: (k: string) => void store.delete(k),
}));

import {
  saveRefreshToken,
  loadRefreshToken,
  clearRefreshToken,
} from './refreshTokenStore';

beforeEach(() => store.clear());

describe('refreshTokenStore', () => {
  it('null cuando no hay token guardado', () => {
    expect(loadRefreshToken()).toBeNull();
  });

  it('round-trip save → load bajo la clave fh_sync_refresh', () => {
    saveRefreshToken('RT-123');
    expect(loadRefreshToken()).toBe('RT-123');
    expect(store.get('fh_sync_refresh')).toBe('RT-123');
  });

  it('clear elimina el token', () => {
    saveRefreshToken('RT-123');
    clearRefreshToken();
    expect(loadRefreshToken()).toBeNull();
  });
});
