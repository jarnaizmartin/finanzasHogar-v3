import { describe, it, expect, afterEach } from 'vitest';
import { i18next } from '../i18n';
import { t } from '../t';
import { es } from '../es';
import { en } from '../en';
import { ptBr } from '../pt-br';
import { fr } from '../fr';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function collectLeafKeys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return typeof v === 'object' && v !== null ? collectLeafKeys(v as object, path) : [path];
  });
}

// ─── ES (default language) ───────────────────────────────────────────────────

describe('t() — ES (default)', () => {
  it('resolves a top-level nested key', () => {
    expect(t('loans.types.mortgage')).toBe('Hipoteca');
  });

  it('resolves all loan type keys', () => {
    expect(t('loans.types.personal')).toBe('Préstamo personal');
    expect(t('loans.types.default')).toBe('Préstamo');
  });

  it('resolves loan error keys', () => {
    expect(t('loans.errors.amountPositive')).toBe('El importe debe ser mayor que 0');
    expect(t('loans.errors.insufficientPayment')).toContain('cuota actual no cubre');
  });

  it('resolves credit card health score level keys', () => {
    expect(t('creditCards.healthScore.levels.critical')).toBe('Crítico');
    expect(t('creditCards.healthScore.levels.high')).toBe('Alto riesgo');
    expect(t('creditCards.healthScore.levels.moderate')).toBe('Moderado');
    expect(t('creditCards.healthScore.levels.excellent')).toBe('Excelente');
  });

  it('resolves credit card overall health keys', () => {
    expect(t('creditCards.healthScore.overall.excellent.label')).toBe('Excelente');
    expect(t('creditCards.healthScore.overall.poor.label')).toBe('Crítico');
  });

  it('resolves credit card factor keys', () => {
    expect(t('creditCards.healthScore.factors.utilization.label')).toBe('Utilización del crédito');
    expect(t('creditCards.healthScore.factors.trend.noData')).toContain('datos suficientes');
    expect(t('creditCards.healthScore.factors.consistency.neverHadDebt')).toContain('Nunca');
  });
});

// ─── EN ──────────────────────────────────────────────────────────────────────

describe('t() — EN', () => {
  afterEach(async () => {
    await i18next.changeLanguage('es');
  });

  it('resolves loan type keys in English', async () => {
    await i18next.changeLanguage('en');
    expect(t('loans.types.mortgage')).toBe('Mortgage');
    expect(t('loans.types.personal')).toBe('Personal loan');
    expect(t('loans.types.default')).toBe('Loan');
  });

  it('resolves loan error keys in English', async () => {
    await i18next.changeLanguage('en');
    expect(t('loans.errors.amountPositive')).toBe('Amount must be greater than 0');
    expect(t('loans.errors.insufficientPayment')).toContain('does not cover the interest');
  });

  it('resolves credit card health score level keys in English', async () => {
    await i18next.changeLanguage('en');
    expect(t('creditCards.healthScore.levels.critical')).toBe('Critical');
    expect(t('creditCards.healthScore.levels.high')).toBe('High risk');
    expect(t('creditCards.healthScore.levels.excellent')).toBe('Excellent');
  });

  it('resolves credit card overall health keys in English', async () => {
    await i18next.changeLanguage('en');
    expect(t('creditCards.healthScore.overall.excellent.label')).toBe('Excellent');
    expect(t('creditCards.healthScore.overall.poor.summary')).toContain('financial health is at risk');
  });

  it('resolves credit card factor keys in English', async () => {
    await i18next.changeLanguage('en');
    expect(t('creditCards.healthScore.factors.utilization.label')).toBe('Credit utilization');
    expect(t('creditCards.healthScore.factors.trend.noDebt')).toContain('No debt');
    expect(t('creditCards.healthScore.factors.paymentMargin.notConfigured')).toBe('Payment day not configured');
  });
});

// ─── Interpolation ───────────────────────────────────────────────────────────

describe('t() — interpolation', () => {
  it('ignores params when key has no placeholders', () => {
    expect(t('loans.types.mortgage', { n: 99 })).toBe('Hipoteca');
  });

  it('does not crash with empty params object', () => {
    expect(t('loans.types.mortgage', {})).toBe('Hipoteca');
  });
});

// ─── Fallback ─────────────────────────────────────────────────────────────────

describe('t() — fallback language', () => {
  afterEach(async () => {
    await i18next.changeLanguage('es');
  });

  it('falls back to ES when language is changed to unknown locale', async () => {
    await i18next.changeLanguage('xx');
    // fallbackLng: 'es' — should still return Spanish
    expect(t('loans.types.mortgage')).toBe('Hipoteca');
    await i18next.changeLanguage('es');
  });
});

// ─── Translation coverage ─────────────────────────────────────────────────────

const allDicts: Array<{ name: string; dict: object }> = [
  { name: 'EN',    dict: en },
  { name: 'PT-BR', dict: ptBr },
  { name: 'FR',    dict: fr },
];

describe('translation coverage', () => {
  const esKeys = collectLeafKeys(es);
  const esKeySet = new Set(esKeys);

  for (const { name, dict } of allDicts) {
    it(`${name} has every key that ES has`, () => {
      const dictKeys = new Set(collectLeafKeys(dict));
      const missing = esKeys.filter(k => !dictKeys.has(k));
      expect(missing, `${name} is missing keys: ${missing.join(', ')}`).toHaveLength(0);
    });

    it(`${name} has no extra keys not in ES`, () => {
      const dictKeys = collectLeafKeys(dict);
      const orphans = dictKeys.filter(k => !esKeySet.has(k));
      expect(orphans, `${name} has extra keys: ${orphans.join(', ')}`).toHaveLength(0);
    });
  }
});

// ─── common namespace — spot checks ──────────────────────────────────────────

describe('t() — common namespace (ES)', () => {
  it('resolves common action keys in Spanish', () => {
    expect(t('common.cancel')).toBe('Cancelar');
    expect(t('common.save')).toBe('Guardar');
    expect(t('common.saveChanges')).toBe('Guardar cambios');
    expect(t('common.saveExpense')).toBe('Guardar movimiento');
    expect(t('common.createAccount')).toBe('Crear cuenta');
    expect(t('common.createProjection')).toBe('Crear proyección');
    expect(t('common.delete')).toBe('Eliminar');
    expect(t('common.close')).toBe('Cerrar');
  });
});

describe('t() — common namespace (EN)', () => {
  afterEach(async () => { await i18next.changeLanguage('es'); });

  it('resolves common action keys in English', async () => {
    await i18next.changeLanguage('en');
    expect(t('common.cancel')).toBe('Cancel');
    expect(t('common.save')).toBe('Save');
    expect(t('common.saveChanges')).toBe('Save changes');
    expect(t('common.delete')).toBe('Delete');
    expect(t('common.close')).toBe('Close');
  });
});

describe('t() — common namespace (PT-BR)', () => {
  afterEach(async () => { await i18next.changeLanguage('es'); });

  it('resolves common action keys in Brazilian Portuguese', async () => {
    await i18next.changeLanguage('pt-BR');
    expect(t('common.cancel')).toBe('Cancelar');
    expect(t('common.save')).toBe('Salvar');
    expect(t('common.delete')).toBe('Excluir');
    expect(t('common.close')).toBe('Fechar');
  });
});

describe('t() — common namespace (FR)', () => {
  afterEach(async () => { await i18next.changeLanguage('es'); });

  it('resolves common action keys in French', async () => {
    await i18next.changeLanguage('fr');
    expect(t('common.cancel')).toBe('Annuler');
    expect(t('common.save')).toBe('Enregistrer');
    expect(t('common.delete')).toBe('Supprimer');
    expect(t('common.close')).toBe('Fermer');
  });
});

// ─── PT-BR spot checks ────────────────────────────────────────────────────────

describe('t() — PT-BR spot checks', () => {
  afterEach(async () => { await i18next.changeLanguage('es'); });

  it('resolves loan types in Brazilian Portuguese', async () => {
    await i18next.changeLanguage('pt-BR');
    expect(t('loans.types.mortgage')).toBe('Hipoteca');
    expect(t('loans.types.personal')).toBe('Empréstimo pessoal');
    expect(t('loans.types.default')).toBe('Empréstimo');
  });

  it('resolves credit card levels in Brazilian Portuguese', async () => {
    await i18next.changeLanguage('pt-BR');
    expect(t('creditCards.healthScore.levels.critical')).toBe('Crítico');
    expect(t('creditCards.healthScore.levels.high')).toBe('Alto risco');
  });
});

// ─── FR spot checks ───────────────────────────────────────────────────────────

describe('t() — FR spot checks', () => {
  afterEach(async () => { await i18next.changeLanguage('es'); });

  it('resolves loan types in French', async () => {
    await i18next.changeLanguage('fr');
    expect(t('loans.types.mortgage')).toBe('Hypothèque');
    expect(t('loans.types.personal')).toBe('Prêt personnel');
    expect(t('loans.types.default')).toBe('Prêt');
  });

  it('resolves credit card levels in French', async () => {
    await i18next.changeLanguage('fr');
    expect(t('creditCards.healthScore.levels.critical')).toBe('Critique');
    expect(t('creditCards.healthScore.levels.high')).toBe('Risque élevé');
  });
});
