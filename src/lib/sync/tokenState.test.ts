import { describe, it, expect } from 'vitest';
import {
  makeAccessToken,
  isTokenLive,
  TOKEN_EXPIRY_MARGIN_MS,
} from './tokenState';

describe('makeAccessToken', () => {
  it('calcula expiresAt a partir de expires_in (segundos) y now', () => {
    const now = 1_000_000;
    const tok = makeAccessToken('abc', 3600, now);
    expect(tok.token).toBe('abc');
    expect(tok.expiresAt).toBe(now + 3600 * 1000);
  });

  it('usa Date.now() por defecto cuando no se inyecta now', () => {
    const before = Date.now();
    const tok = makeAccessToken('abc', 60);
    expect(tok.expiresAt).toBeGreaterThanOrEqual(before + 60_000);
  });
});

describe('isTokenLive', () => {
  const now = 1_000_000;

  it('es false para token nulo', () => {
    expect(isTokenLive(null, now)).toBe(false);
  });

  it('es false para token con cadena vacía', () => {
    expect(isTokenLive({ token: '', expiresAt: now + 10_000_000 }, now)).toBe(
      false
    );
  });

  it('es true para un token fresco (lejos de caducar)', () => {
    const tok = makeAccessToken('abc', 3600, now);
    expect(isTokenLive(tok, now)).toBe(true);
  });

  it('es false para un token ya caducado', () => {
    const tok = makeAccessToken('abc', 3600, now);
    expect(isTokenLive(tok, tok.expiresAt + 1)).toBe(false);
  });

  it('es false dentro de la ventana de margen (a punto de caducar)', () => {
    const tok = makeAccessToken('abc', 3600, now);
    // Justo dentro del margen: faltan menos de TOKEN_EXPIRY_MARGIN_MS para caducar.
    const insideMargin = tok.expiresAt - TOKEN_EXPIRY_MARGIN_MS + 1;
    expect(isTokenLive(tok, insideMargin)).toBe(false);
  });

  it('es true justo en el límite del margen', () => {
    const tok = makeAccessToken('abc', 3600, now);
    const atEdge = tok.expiresAt - TOKEN_EXPIRY_MARGIN_MS - 1;
    expect(isTokenLive(tok, atEdge)).toBe(true);
  });
});
