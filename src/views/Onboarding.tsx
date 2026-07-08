import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Shield } from 'lucide-react';
import { CURRENCIES } from '../utils';
import { LegalModal, LEGAL_DOCS } from './Legal';
import { setLanguage, type SupportedLang, i18next } from '../i18n/i18n';
import type {
  Account,
  Category,
  Projection,
  RealExpense,
  CategoryRule,
} from '../types';

// ─── Tipo explícito para onFinish ─────────────────────────────────────────────
type OnboardingData = {
  accounts: Account[];
  categories: Category[];
  projections: Projection[];
  realExpenses?: RealExpense[];
  categoryRules?: CategoryRule[];
  baseCurrency: string;
  dateFormat: string;
};

const CATEGORY_COLORS = [
  { type: 'income', color: '#16a34a' }, { type: 'income', color: '#0891b2' },
  { type: 'income', color: '#0d9488' }, { type: 'income', color: '#4f46e5' },
  { type: 'income', color: '#7c3aed' }, { type: 'income', color: '#ca8a04' },
  { type: 'expense', color: '#dc2626' }, { type: 'expense', color: '#b91c1c' },
  { type: 'expense', color: '#ea580c' }, { type: 'expense', color: '#ca8a04' },
  { type: 'expense', color: '#0891b2' }, { type: 'expense', color: '#4f46e5' },
  { type: 'expense', color: '#7c3aed' }, { type: 'expense', color: '#db2777' },
  { type: 'expense', color: '#ec4899' }, { type: 'expense', color: '#f97316' },
  { type: 'expense', color: '#06b6d4' }, { type: 'expense', color: '#64748b' },
  { type: 'expense', color: '#84cc16' }, { type: 'expense', color: '#1d4ed8' },
  { type: 'expense', color: '#94a3b8' },
] as const;

const DATE_FORMATS = [
  { value: 'dd/mm/yyyy', label: 'DD/MM/YYYY', example: '31/01/2025' },
  { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY', example: '01/31/2025' },
  { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD', example: '2025-01-31' },
  { value: 'dd-mm-yyyy', label: 'DD-MM-YYYY', example: '31-01-2025' },
];

const uid = () => crypto.randomUUID();

export function Onboarding({
  onFinish,
}: {
  onFinish: (data: OnboardingData) => void;
}) {
  const { t } = useTranslation();

  const CAT_KEYS = [
    'salary', 'freelance', 'rentReceived', 'investments', 'pension', 'otherIncome',
    'housing', 'mortgage', 'food', 'transport', 'health', 'education',
    'leisure', 'subscriptions', 'clothing', 'restaurants', 'travel',
    'insurance', 'pets', 'savings', 'otherExpenses',
  ] as const;

  // ✅ FIX — eliminado `step` (dead state que nunca cambiaba)
  // Default = idioma actual de i18next (ya refleja la detección del navegador
  // del primer arranque), para que el selector concuerde con la UI mostrada.
  const [selectedLang, setSelectedLang] = useState<SupportedLang>(
    (i18next.language as SupportedLang) ?? 'es'
  );
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [selectedDateFormat, setSelectedDateFormat] = useState('dd/mm/yyyy');
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [openLegalDoc, setOpenLegalDoc] = useState<
    keyof typeof LEGAL_DOCS | null
  >(null);

  // ── Pantalla principal de onboarding ──────────────────────────────────────
  return (
    <>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '32rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '2rem',
            padding: '3rem 2.5rem',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '1.25rem',
                background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 8px 24px rgba(59,130,246,0.4)',
              }}
            >
              <Shield size={28} color="#fff" />
            </div>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.04em',
                margin: '0 0 0.75rem',
              }}
            >
              {t('onboarding.welcome.title')}
            </h1>
            <p
              style={{
                fontSize: '1rem',
                color: '#93c5fd',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {t('onboarding.welcome.subtitle')}
            </p>

            {/* ── Selector de idioma ── */}
            <div style={{ marginTop: '1.5rem' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#93c5fd',
                  marginBottom: '0.375rem',
                  textAlign: 'center',
                }}
              >
                {t('onboarding.welcome.languageLabel')}
              </div>
              <select
                value={selectedLang}
                onChange={(e) => {
                  const lang = e.target.value as SupportedLang;
                  setSelectedLang(lang);
                  setLanguage(lang);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.875rem',
                  border: '2px solid #3b82f6',
                  background: 'rgba(255,255,255,0.07)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2393c5fd' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="es" style={{ background: '#1e3a5f', color: '#ffffff' }}>🇪🇸 Español</option>
                <option value="en" style={{ background: '#1e3a5f', color: '#ffffff' }}>🇬🇧 English</option>
                <option value="pt-PT" style={{ background: '#1e3a5f', color: '#ffffff' }}>🇵🇹 Português (Portugal)</option>
                <option value="pt-BR" style={{ background: '#1e3a5f', color: '#ffffff' }}>🇧🇷 Português (Brasil)</option>
                <option value="fr" style={{ background: '#1e3a5f', color: '#ffffff' }}>🇫🇷 Français</option>
                <option value="it" style={{ background: '#1e3a5f', color: '#ffffff' }}>🇮🇹 Italiano</option>
              </select>
              <p
                style={{
                  marginTop: '0.625rem',
                  fontSize: '0.78rem',
                  color: '#60a5fa',
                  textAlign: 'center',
                  lineHeight: 1.5,
                }}
              >
                {t('onboarding.welcome.languageHint')}
              </p>
            </div>

            {/* ── Selector de divisa ── */}
            <div style={{ marginTop: '1.5rem' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#93c5fd',
                  marginBottom: '0.375rem',
                  textAlign: 'center',
                }}
              >
                {t('onboarding.welcome.currencyLabel')}
              </div>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#cbd5e1',
                  textAlign: 'center',
                  margin: '0 0 0.875rem',
                  lineHeight: 1.5,
                }}
              >
                {t('onboarding.welcome.currencyHint')}
              </p>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.875rem',
                  border: '2px solid #3b82f6',
                  background: 'rgba(255,255,255,0.07)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2393c5fd' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '2.5rem',
                }}
              >
                {CURRENCIES.map((c) => (
                  <option
                    key={c.code}
                    value={c.code}
                    style={{ background: '#1e3a5f', color: '#ffffff' }}
                  >
                    {c.symbol} {c.code} — {c.name}
                  </option>
                ))}
              </select>
              {(() => {
                const selected = CURRENCIES.find(
                  (c) => c.code === selectedCurrency
                );
                return selected ? (
                  <div
                    style={{
                      marginTop: '0.625rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontSize: '0.78rem',
                      color: '#60a5fa',
                    }}
                  >
                    <Check size={13} color="#60a5fa" />
                    <span>{t('onboarding.welcome.currencySelected', { name: selected.name })}</span>
                  </div>
                ) : null;
              })()}

              {/* ── Selector de formato de fecha ── */}
              <div style={{ marginTop: '1.5rem' }}>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#93c5fd',
                    marginBottom: '0.375rem',
                    textAlign: 'center',
                  }}
                >
                  {t('onboarding.welcome.dateLabel')}
                </div>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: '#cbd5e1',
                    textAlign: 'center',
                    margin: '0 0 0.875rem',
                    lineHeight: 1.5,
                  }}
                >
                  {t('onboarding.welcome.dateHint')}
                </p>
                <select
                  value={selectedDateFormat}
                  onChange={(e) => setSelectedDateFormat(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.875rem',
                    border: '2px solid #3b82f6',
                    background: 'rgba(255,255,255,0.07)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2393c5fd' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    paddingRight: '2.5rem',
                  }}
                >
                  {DATE_FORMATS.map((f) => (
                    <option
                      key={f.value}
                      value={f.value}
                      style={{ background: '#1e3a5f', color: '#ffffff' }}
                    >
                      {f.label} — ej: {f.example}
                    </option>
                  ))}
                </select>
                <div
                  style={{
                    marginTop: '0.625rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.78rem',
                    color: '#60a5fa',
                  }}
                >
                  <Check size={13} color="#60a5fa" />
                  <span>
                    {t('onboarding.welcome.datePreview', {
                      example: DATE_FORMATS.find((f) => f.value === selectedDateFormat)?.example ?? '',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Aceptación legal ── */}
          <div
            style={{
              marginBottom: '1.25rem',
              padding: '1rem 1.25rem',
              borderRadius: '1rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={legalAccepted}
                onChange={(e) => setLegalAccepted(e.target.checked)}
                style={{
                  width: '1.125rem',
                  height: '1.125rem',
                  marginTop: '0.1rem',
                  cursor: 'pointer',
                  accentColor: '#3b82f6',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '0.775rem',
                  color: '#cbd5e1',
                  lineHeight: 1.6,
                }}
              >
                {t('onboarding.welcome.legalPrefix')}{' '}
                {(['aviso', 'privacidad', 'terminos', 'cookies'] as const).map(
                  (doc, i) => {
                    const labelKey = {
                      aviso: 'onboarding.welcome.legalAviso',
                      privacidad: 'onboarding.welcome.legalPrivacidad',
                      terminos: 'onboarding.welcome.legalTerminos',
                      cookies: 'onboarding.welcome.legalCookies',
                    } as const;
                    const separators: Record<number, string> = {
                      1: t('onboarding.welcome.legalSepComma'),
                      2: t('onboarding.welcome.legalSepPlural'),
                      3: t('onboarding.welcome.legalSepLast'),
                    };
                    return (
                      <span key={doc}>
                        {i > 0 && separators[i]}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setOpenLegalDoc(doc);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#60a5fa',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: '0.775rem',
                            textDecoration: 'underline',
                          }}
                        >
                          {t(labelKey[doc])}
                        </button>
                      </span>
                    );
                  }
                )}
                {t('onboarding.welcome.legalSuffix')}
              </span>
            </label>
            {!legalAccepted && (
              <p
                style={{
                  fontSize: '0.72rem',
                  color: '#fca5a5',
                  marginTop: '0.5rem',
                  marginLeft: '1.875rem',
                  fontWeight: 600,
                }}
              >
                {t('onboarding.welcome.legalRequired')}
              </p>
            )}
          </div>

          {/* ── Botón principal ── */}
          <button
            onClick={() => {
              if (!legalAccepted) return;
              const cats = CAT_KEYS.map((key, i) => ({
                name: t(`onboarding.defaultCategories.${key}`),
                type: CATEGORY_COLORS[i].type,
                color: CATEGORY_COLORS[i].color,
                id: uid(),
              }));
              // O1 — Sin activación de seguridad en el arranque: la app entra
              // en local puro. Limpia cualquier seguridad residual para que
              // arranque desbloqueada. Ver 12_ONBOARDING_REDESIGN.md §5.F.
              localStorage.removeItem('fh_security');
              localStorage.removeItem('fh_lock_state');
              localStorage.removeItem('fh_totp_last_unlock');
              onFinish({
                accounts: [],
                categories: cats,
                projections: [],
                baseCurrency: selectedCurrency,
                dateFormat: selectedDateFormat,
              });
            }}
            disabled={!legalAccepted}
            style={{
              padding: '1rem 1.5rem',
              borderRadius: '1rem',
              border: 'none',
              background: legalAccepted ? '#2563eb' : '#1e3a5f',
              color: legalAccepted ? '#ffffff' : '#64748b',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: legalAccepted ? 'pointer' : 'not-allowed',
              width: '100%',
              boxShadow: legalAccepted
                ? '0 4px 16px rgba(37,99,235,0.4)'
                : 'none',
              opacity: legalAccepted ? 1 : 0.5,
              transition: 'all 0.2s',
              marginBottom: '1.25rem',
            }}
          >
            {t('onboarding.welcome.startBtn')}
          </button>

          <p
            style={{
              textAlign: 'center',
              fontSize: '0.8rem',
              color: '#94a3b8',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {t('onboarding.welcome.privacyNote').split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </p>
        </div>
      </div>

      {openLegalDoc && (
        <LegalModal
          docKey={openLegalDoc}
          onClose={() => setOpenLegalDoc(null)}
        />
      )}
    </>
  );
}
