import { describe, it, expect } from 'vitest';
import {
  FINANCIAL_INSTITUTIONS,
  CATEGORY_LABELS,
  findInstitutionByName,
  getInstitutionEmoji,
  getInstitutionsByCategory,
  searchInstitutions,
  getInstitutionSlug,
  getInstitutionBrandColor,
  getInstitutionDomain,
} from '../financialInstitutions';

describe('FINANCIAL_INSTITUTIONS catalog', () => {
  it('contains entries', () => {
    expect(FINANCIAL_INSTITUTIONS.length).toBeGreaterThan(0);
  });

  it('all entries have required fields', () => {
    FINANCIAL_INSTITUTIONS.forEach((i) => {
      expect(i.id).toBeTruthy();
      expect(i.name).toBeTruthy();
      expect(i.emoji).toBeTruthy();
      expect(['bank', 'fintech', 'broker', 'other']).toContain(i.category);
    });
  });

  it('all ids are unique', () => {
    const ids = FINANCIAL_INSTITUTIONS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all names are unique', () => {
    const names = FINANCIAL_INSTITUTIONS.map((i) => i.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('CATEGORY_LABELS', () => {
  it('has a label for every category', () => {
    expect(CATEGORY_LABELS.bank).toBeTruthy();
    expect(CATEGORY_LABELS.fintech).toBeTruthy();
    expect(CATEGORY_LABELS.broker).toBeTruthy();
    expect(CATEGORY_LABELS.other).toBeTruthy();
  });
});

describe('findInstitutionByName', () => {
  it('returns undefined for empty/undefined name', () => {
    expect(findInstitutionByName(undefined)).toBeUndefined();
    expect(findInstitutionByName('')).toBeUndefined();
  });

  it('returns undefined for unknown name', () => {
    expect(findInstitutionByName('Banco Inventado')).toBeUndefined();
  });

  it('finds by exact name', () => {
    expect(findInstitutionByName('BBVA')?.id).toBe('bbva');
  });

  it('is case-insensitive', () => {
    expect(findInstitutionByName('bbva')?.id).toBe('bbva');
    expect(findInstitutionByName('BbVa')?.id).toBe('bbva');
  });

  it('trims whitespace', () => {
    expect(findInstitutionByName('  Revolut  ')?.id).toBe('revolut');
  });
});

describe('getInstitutionEmoji', () => {
  it('returns empty string for missing name', () => {
    expect(getInstitutionEmoji(undefined)).toBe('');
    expect(getInstitutionEmoji('')).toBe('');
  });

  it('returns catalog emoji for known institution', () => {
    expect(getInstitutionEmoji('PayPal')).toBe('💰');
    expect(getInstitutionEmoji('BBVA')).toBe('🏦');
  });

  it('returns default bank emoji for unknown institution', () => {
    expect(getInstitutionEmoji('Banco Inventado')).toBe('🏦');
  });
});

describe('getInstitutionsByCategory', () => {
  it('returns groups with all 4 categories', () => {
    const g = getInstitutionsByCategory();
    expect(g.bank.length).toBeGreaterThan(0);
    expect(g.fintech.length).toBeGreaterThan(0);
    expect(g.broker.length).toBeGreaterThan(0);
    expect(g.other.length).toBeGreaterThan(0);
  });

  it('total count matches catalog', () => {
    const g = getInstitutionsByCategory();
    const total = g.bank.length + g.fintech.length + g.broker.length + g.other.length;
    expect(total).toBe(FINANCIAL_INSTITUTIONS.length);
  });

  it('each group only contains its category', () => {
    const g = getInstitutionsByCategory();
    expect(g.bank.every((i) => i.category === 'bank')).toBe(true);
    expect(g.fintech.every((i) => i.category === 'fintech')).toBe(true);
    expect(g.broker.every((i) => i.category === 'broker')).toBe(true);
    expect(g.other.every((i) => i.category === 'other')).toBe(true);
  });
});

describe('searchInstitutions', () => {
  it('returns full catalog for empty query', () => {
    expect(searchInstitutions('')).toEqual(FINANCIAL_INSTITUTIONS);
    expect(searchInstitutions('   ')).toEqual(FINANCIAL_INSTITUTIONS);
  });

  it('filters case-insensitively by substring', () => {
    const r = searchInstitutions('bbva');
    expect(r.length).toBe(1);
    expect(r[0].id).toBe('bbva');
  });

  it('matches partial names', () => {
    const r = searchInstitutions('banco');
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((i) => i.name.toLowerCase().includes('banco'))).toBe(true);
  });

  it('returns empty array for no match', () => {
    expect(searchInstitutions('xyznotfound')).toEqual([]);
  });
});

describe('getInstitutionSlug', () => {
  it('returns undefined for missing name', () => {
    expect(getInstitutionSlug(undefined)).toBeUndefined();
    expect(getInstitutionSlug('')).toBeUndefined();
  });

  it('returns slug when defined', () => {
    expect(getInstitutionSlug('BBVA')).toBe('bbva');
    expect(getInstitutionSlug('Revolut')).toBe('revolut');
  });

  it('returns undefined when institution has no slug', () => {
    expect(getInstitutionSlug('Banco Sabadell')).toBeUndefined();
  });

  it('returns undefined for unknown institution', () => {
    expect(getInstitutionSlug('Banco Inventado')).toBeUndefined();
  });
});

describe('getInstitutionBrandColor', () => {
  it('returns undefined for missing name', () => {
    expect(getInstitutionBrandColor(undefined)).toBeUndefined();
    expect(getInstitutionBrandColor('')).toBeUndefined();
  });

  it('returns brandColor when defined', () => {
    expect(getInstitutionBrandColor('BBVA')).toBe('004481');
    expect(getInstitutionBrandColor('PayPal')).toBe('003087');
  });

  it('returns undefined when institution has no brandColor', () => {
    expect(getInstitutionBrandColor('Banco Sabadell')).toBeUndefined();
  });

  it('returns undefined for unknown institution', () => {
    expect(getInstitutionBrandColor('Banco Inventado')).toBeUndefined();
  });
});

describe('getInstitutionDomain', () => {
  it('returns undefined for missing name', () => {
    expect(getInstitutionDomain(undefined)).toBeUndefined();
    expect(getInstitutionDomain('')).toBeUndefined();
  });

  it('returns domain when defined', () => {
    expect(getInstitutionDomain('BBVA')).toBe('bbva.es');
    expect(getInstitutionDomain('PayPal')).toBe('paypal.com');
  });

  it('returns undefined for unknown institution', () => {
    expect(getInstitutionDomain('Banco Inventado')).toBeUndefined();
  });
});
