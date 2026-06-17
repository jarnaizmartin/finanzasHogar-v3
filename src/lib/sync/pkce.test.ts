import { describe, it, expect } from 'vitest';
import {
  base64UrlEncode,
  generateCodeVerifier,
  generateState,
  deriveCodeChallenge,
  createPkcePair,
  buildAuthUrl,
} from './pkce';

describe('pkce', () => {
  describe('base64UrlEncode', () => {
    it('usa el alfabeto URL-safe y sin padding', () => {
      // 0xFB 0xFF → base64 "+/8=" → base64url "-_8"
      const out = base64UrlEncode(new Uint8Array([0xfb, 0xff]));
      expect(out).toBe('-_8');
      expect(out).not.toMatch(/[+/=]/);
    });

    it('cadena vacía para input vacío', () => {
      expect(base64UrlEncode(new Uint8Array([]))).toBe('');
    });
  });

  describe('deriveCodeChallenge', () => {
    it('coincide con el vector canónico del RFC 7636 (Apéndice B)', async () => {
      const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
      const challenge = await deriveCodeChallenge(verifier);
      expect(challenge).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
    });

    it('es determinista', async () => {
      const a = await deriveCodeChallenge('verificador-de-prueba');
      const b = await deriveCodeChallenge('verificador-de-prueba');
      expect(a).toBe(b);
    });

    it('verifiers distintos dan challenges distintos', async () => {
      const a = await deriveCodeChallenge('uno');
      const b = await deriveCodeChallenge('dos');
      expect(a).not.toBe(b);
    });
  });

  describe('generateCodeVerifier', () => {
    it('produce 43 chars base64url (256 bits), en el rango legal 43..128', () => {
      const v = generateCodeVerifier();
      expect(v).toHaveLength(43);
      expect(v).toMatch(/^[A-Za-z0-9\-_]+$/);
    });

    it('es aleatorio (dos llamadas difieren)', () => {
      expect(generateCodeVerifier()).not.toBe(generateCodeVerifier());
    });
  });

  describe('generateState', () => {
    it('produce un token base64url no vacío y aleatorio', () => {
      const a = generateState();
      const b = generateState();
      expect(a).toMatch(/^[A-Za-z0-9\-_]+$/);
      expect(a).not.toBe(b);
    });
  });

  describe('createPkcePair', () => {
    it('el challenge corresponde al verifier del par', async () => {
      const pair = await createPkcePair();
      expect(pair.challenge).toBe(await deriveCodeChallenge(pair.verifier));
      expect(pair.state).toMatch(/^[A-Za-z0-9\-_]+$/);
    });
  });

  describe('buildAuthUrl', () => {
    const base = {
      clientId: 'cid.apps.googleusercontent.com',
      redirectUri: 'https://app.example/oauth-callback',
      scope: 'https://www.googleapis.com/auth/drive.appdata',
      codeChallenge: 'CHALLENGE',
      state: 'STATE',
    };

    it('apunta al endpoint de autorización de Google', () => {
      const u = new URL(buildAuthUrl(base));
      expect(u.origin + u.pathname).toBe(
        'https://accounts.google.com/o/oauth2/v2/auth'
      );
    });

    it('incluye los parámetros PKCE y de refresh token', () => {
      const u = new URL(buildAuthUrl(base));
      const p = u.searchParams;
      expect(p.get('client_id')).toBe(base.clientId);
      expect(p.get('redirect_uri')).toBe(base.redirectUri);
      expect(p.get('response_type')).toBe('code');
      expect(p.get('scope')).toBe(base.scope);
      expect(p.get('code_challenge')).toBe('CHALLENGE');
      expect(p.get('code_challenge_method')).toBe('S256');
      expect(p.get('state')).toBe('STATE');
      // Sin estos dos, Google NO devuelve refresh_token (§11.2).
      expect(p.get('access_type')).toBe('offline');
      expect(p.get('prompt')).toBe('consent');
    });
  });
});
