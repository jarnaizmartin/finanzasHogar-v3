// Guardia de la whitelist de encryptedStorage.
//
// Contexto (s.73): `fh_license_state` está en la whitelist —va en claro porque
// se lee antes del unlock— y aun así el backup y el sync la leían con
// getEncryptedItem, que devuelve SIEMPRE null para esas claves. Resultado: la
// licencia no se guardaba en los backups ni viajaba entre dispositivos, y el
// bug vivió dos meses porque la única defensa era una frase en un docstring.
//
// Estos tests fijan la barrera que lo hace imposible de repetir.

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getEncryptedItem,
  setEncryptedItem,
  removeEncryptedItem,
  shouldEncrypt,
} from '../encryptedStorage';

// Clave EN la whitelist (nunca se cifra) y clave fuera (sí se cifra).
const WHITELISTED = 'fh_license_state';
const ENCRYPTABLE = 'fh_accounts';

describe('encryptedStorage — guardia de la whitelist', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('la premisa: fh_license_state NO se cifra, fh_accounts sí', () => {
    expect(shouldEncrypt(WHITELISTED)).toBe(false);
    expect(shouldEncrypt(ENCRYPTABLE)).toBe(true);
  });

  it('getEncryptedItem sobre una clave de la whitelist revienta en desarrollo', () => {
    expect(() => getEncryptedItem(WHITELISTED)).toThrow(/WHITELIST/);
  });

  it('setEncryptedItem sobre una clave de la whitelist revienta en desarrollo', () => {
    expect(() => setEncryptedItem(WHITELISTED, '{"mode":"activated"}')).toThrow(/WHITELIST/);
  });

  it('removeEncryptedItem sobre una clave de la whitelist revienta en desarrollo', () => {
    expect(() => removeEncryptedItem(WHITELISTED)).toThrow(/WHITELIST/);
  });

  it('el sandbox del Modo Prueba hereda el estatus: fh_demo_license_state también está protegida', () => {
    expect(() => getEncryptedItem('fh_demo_license_state')).toThrow(/WHITELIST/);
  });

  it('con una clave normal NO molesta (cache vacía → null, sin excepción)', () => {
    expect(() => getEncryptedItem(ENCRYPTABLE)).not.toThrow();
    expect(getEncryptedItem(ENCRYPTABLE)).toBeNull();
  });

  it('el mensaje dice qué hacer en su lugar', () => {
    expect(() => getEncryptedItem(WHITELISTED)).toThrow(/localStorage/);
  });
});
