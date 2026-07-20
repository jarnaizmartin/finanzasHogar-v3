import { describe, it, expect, beforeEach } from 'vitest';
import {
  getMode, isDemoMode, keyFor, enterDemo, exitDemo, resetDemo,
} from '../appMode';

beforeEach(() => localStorage.clear());

describe('appMode — modo y prefijo', () => {
  it('por defecto es modo real y keyFor no prefija', () => {
    expect(getMode()).toBe('real');
    expect(isDemoMode()).toBe(false);
    expect(keyFor('fh_accounts')).toBe('fh_accounts');
    expect(keyFor('fh_dark')).toBe('fh_dark');
  });

  it('en modo demo prefija SOLO las claves de datos', () => {
    localStorage.setItem('fh_mode', 'demo');
    localStorage.setItem('fh_demo_onboarded', 'true'); // sandbox sembrado → demo válido
    expect(getMode()).toBe('demo');
    // Datos → sandbox
    expect(keyFor('fh_accounts')).toBe('fh_demo_accounts');
    expect(keyFor('fh_projections')).toBe('fh_demo_projections');
    expect(keyFor('fh_onboarded')).toBe('fh_demo_onboarded');
    // Preferencias compartidas → sin prefijo
    expect(keyFor('fh_dark')).toBe('fh_dark');
    expect(keyFor('fh_base_currency')).toBe('fh_base_currency');
    expect(keyFor('fh_security')).toBe('fh_security');
  });

  it('🩹 fh_mode=demo con sandbox SIN sembrar cae a real (estado roto de iOS)', () => {
    // Reproduce el bug del founder (s.72): el reload de iOS perdió la siembra
    // (`fh_demo_onboarded`) pero conservó el flag. Sin auto-curación, la app
    // arrancaría en demo y mostraría el onboarding dentro del sandbox → trampa.
    localStorage.setItem('fh_mode', 'demo');
    // (no hay fh_demo_onboarded)
    expect(getMode()).toBe('real');
    expect(isDemoMode()).toBe(false);
    expect(keyFor('fh_accounts')).toBe('fh_accounts'); // escribe en REAL, no en el sandbox
  });

  it('🩹 fh_mode=demo con fh_demo_onboarded=false residual también cae a real', () => {
    localStorage.setItem('fh_mode', 'demo');
    localStorage.setItem('fh_demo_onboarded', 'false'); // marca residual, no navegable
    expect(getMode()).toBe('real');
    expect(keyFor('fh_onboarded')).toBe('fh_onboarded');
  });
});

describe('appMode — entrar / salir / reset', () => {
  it('enterDemo siembra el sandbox y activa el modo, sin tocar datos reales', () => {
    localStorage.setItem('fh_accounts', JSON.stringify([{ id: 'real' }]));
    enterDemo();
    expect(getMode()).toBe('demo');
    // Sandbox sembrado
    const demoAccounts = JSON.parse(localStorage.getItem('fh_demo_accounts')!);
    expect(demoAccounts.length).toBeGreaterThan(0);
    expect(localStorage.getItem('fh_demo_onboarded')).toBe('true');
    // Datos reales intactos
    expect(JSON.parse(localStorage.getItem('fh_accounts')!)).toEqual([{ id: 'real' }]);
  });

  it('exitDemo vuelve a real y conserva el sandbox', () => {
    enterDemo();
    exitDemo();
    expect(getMode()).toBe('real');
    expect(localStorage.getItem('fh_demo_accounts')).not.toBeNull();
  });

  it('resetDemo regenera el sandbox (sin datos reales) y permanece en demo', () => {
    enterDemo();
    localStorage.setItem('fh_real_only', 'x'); // clave no-demo cualquiera
    localStorage.setItem('fh_demo_accounts', JSON.stringify([])); // "usuario borró todo"
    resetDemo();
    expect(getMode()).toBe('demo');
    expect(JSON.parse(localStorage.getItem('fh_demo_accounts')!).length).toBeGreaterThan(0);
    expect(localStorage.getItem('fh_real_only')).toBe('x');
  });
});
