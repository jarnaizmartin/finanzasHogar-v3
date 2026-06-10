import { describe, it, expect } from 'vitest';
import { pickInitialLang } from './detectLanguage';

const SUPPORTED = ['es', 'en', 'pt-BR', 'fr'] as const;
const pick = (saved: string | null, browser: string[]) =>
  pickInitialLang(saved, browser, SUPPORTED, 'es');

describe('pickInitialLang', () => {
  it('respeta el idioma guardado válido aunque el navegador difiera', () => {
    expect(pick('fr', ['en-US', 'en'])).toBe('fr');
    expect(pick('pt-BR', ['es-ES'])).toBe('pt-BR');
  });

  it('ignora un guardado no soportado y detecta del navegador', () => {
    expect(pick('de', ['fr-FR'])).toBe('fr');
  });

  it('mapea por base de idioma: región distinta, mismo idioma', () => {
    expect(pick(null, ['en-US'])).toBe('en');
    expect(pick(null, ['en-GB'])).toBe('en');
    expect(pick(null, ['fr-CA'])).toBe('fr');
    expect(pick(null, ['es-MX'])).toBe('es');
  });

  it('mapea cualquier portugués al pt-BR soportado', () => {
    expect(pick(null, ['pt-BR'])).toBe('pt-BR');
    expect(pick(null, ['pt-PT'])).toBe('pt-BR');
    expect(pick(null, ['pt'])).toBe('pt-BR');
  });

  it('distingue región cuando hay varias variantes del mismo idioma', () => {
    const SUP = ['es', 'en', 'pt-PT', 'pt-BR', 'fr'] as const;
    const p = (browser: string[]) => pickInitialLang(null, browser, SUP, 'es');
    expect(p(['pt-BR'])).toBe('pt-BR');     // región exacta gana
    expect(p(['pt-PT'])).toBe('pt-PT');     // región exacta gana
    expect(p(['pt-br'])).toBe('pt-BR');     // case-insensitive
    expect(p(['pt'])).toBe('pt-PT');        // 'pt' a secas → primera variante soportada
    expect(p(['pt-BR', 'es'])).toBe('pt-BR'); // respeta orden del navegador
  });

  it('elige el primer idioma del navegador que esté soportado', () => {
    expect(pick(null, ['de-DE', 'fr-FR', 'en-US'])).toBe('fr');
    expect(pick(null, ['ja', 'zh', 'pt-BR'])).toBe('pt-BR');
  });

  it('cae al fallback si nada coincide', () => {
    expect(pick(null, ['de-DE', 'ja', 'zh'])).toBe('es');
    expect(pick(null, [])).toBe('es');
  });

  it('tolera entradas vacías o nulas en la lista del navegador', () => {
    expect(pick(null, ['', 'fr-FR'])).toBe('fr');
  });

  it('sin guardado y sin navegador → fallback', () => {
    expect(pick(null, [])).toBe('es');
    expect(pick(undefined, [])).toBe('es');
  });
});
