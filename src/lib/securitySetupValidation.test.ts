import { describe, it, expect } from 'vitest';
import {
  getPasswordStrength,
  getPasswordStrengthLabel,
  STRENGTH_COLORS,
} from './securitySetupValidation';

describe('getPasswordStrength', () => {
  it('returns 1 for passwords shorter than 8 chars', () => {
    expect(getPasswordStrength('')).toBe(1);
    expect(getPasswordStrength('abc')).toBe(1);
    expect(getPasswordStrength('1234567')).toBe(1);
  });

  it('returns 2 for passwords >= 8 chars without uppercase+digit', () => {
    expect(getPasswordStrength('abcdefgh')).toBe(2);
    expect(getPasswordStrength('password')).toBe(2);
  });

  it('returns 3 for passwords >= 10 chars with uppercase and digit', () => {
    expect(getPasswordStrength('Password12')).toBe(3);
    expect(getPasswordStrength('MyPassword1')).toBe(3);
  });

  it('returns 4 for passwords >= 12 chars with uppercase, digit and special char', () => {
    expect(getPasswordStrength('Password12!!')).toBe(4);
    expect(getPasswordStrength('MyP@ssword123')).toBe(4);
  });

  it('does not return 4 without special char', () => {
    expect(getPasswordStrength('MyPassword123')).toBe(3);
  });

  it('does not return 3 without uppercase', () => {
    expect(getPasswordStrength('mypassword1')).toBe(2);
  });

  it('does not return 3 without digit', () => {
    expect(getPasswordStrength('MyPasswordAbc')).toBe(2);
  });
});

describe('getPasswordStrengthLabel', () => {
  it('returns warning for passwords shorter than 8', () => {
    expect(getPasswordStrengthLabel('abc')).toBe('⚠️ Muy corta');
    expect(getPasswordStrengthLabel('')).toBe('⚠️ Muy corta');
    expect(getPasswordStrengthLabel('1234567')).toBe('⚠️ Muy corta');
  });

  it('returns aceptable for passwords 8-9 chars', () => {
    expect(getPasswordStrengthLabel('abcdefgh')).toBe('✅ Aceptable');
    expect(getPasswordStrengthLabel('abcdefghi')).toBe('✅ Aceptable');
  });

  it('returns buena for passwords >= 10 chars without special char', () => {
    expect(getPasswordStrengthLabel('abcdefghij')).toBe('✅ Buena');
    expect(getPasswordStrengthLabel('MyPassword12')).toBe('✅ Buena');
  });

  it('returns muy fuerte for passwords >= 12 chars with special char', () => {
    expect(getPasswordStrengthLabel('Password12!!')).toBe('💪 Muy fuerte');
    expect(getPasswordStrengthLabel('my-long-pass!!')).toBe('💪 Muy fuerte');
  });

  it('does not return muy fuerte for < 12 chars even with special char', () => {
    expect(getPasswordStrengthLabel('Pass1!')).toBe('⚠️ Muy corta');   // 6 chars
    expect(getPasswordStrengthLabel('Pass123!')).toBe('✅ Aceptable');  // 8 chars
    expect(getPasswordStrengthLabel('Password1!')).toBe('✅ Buena');    // 10 chars, no llega a 12
  });
});

describe('STRENGTH_COLORS', () => {
  it('has a color for each strength level', () => {
    expect(STRENGTH_COLORS[1]).toBeDefined();
    expect(STRENGTH_COLORS[2]).toBeDefined();
    expect(STRENGTH_COLORS[3]).toBeDefined();
    expect(STRENGTH_COLORS[4]).toBeDefined();
  });
});
