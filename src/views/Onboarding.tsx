// ─── Onboarding.tsx ──────────────────────────────────────────────────────────
// Onboarding conversacional — misma piel que el WelcomeTour (cero costura).
// 5 slides, una pregunta por slide, tono de diálogo:
//   1. Idioma (multilingüe)  2. Nombre (O7)  3. Divisa  4. Datos reales/prueba  5. Legal
// El formato de fecha se DERIVA del idioma (no se pregunta) — editable en Ajustes.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, User, Wallet, FlaskConical, ShieldCheck, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { APP_NAME } from '../config/app';
import { BrandLogo } from '../components/BrandLogo';
import { BrandWordmark } from '../components/BrandWordmark';
import { CURRENCIES } from '../utils';
import { LegalModal, LEGAL_DOCS } from './Legal';
import { setLanguage, type SupportedLang, i18next } from '../i18n/i18n';
import { enterDemo } from '../lib/appMode';
import type { Account, Category, Projection, RealExpense, CategoryRule } from '../types';

// ─── Paleta — idéntica al WelcomeTour ────────────────────────────────────────
const BG       = '#060610';
const ACCENT   = '#22d3ee';
const TEXT     = '#f1f5f9';
const TEXT_SUB = '#94a3b8';
const TEXT_MTD = '#64748b';
const CARD_BG  = '#0d0d1f';
const CARD_BDR = '#1e1e3a';

// ─── Animaciones — mismas keyframes que el tour ──────────────────────────────
const STYLES = `
  @keyframes obFadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes obSlideL { from { opacity:0; transform:translateX(48px); } to { opacity:1; transform:translateX(0); } }
  @keyframes obSlideR { from { opacity:0; transform:translateX(-48px); } to { opacity:1; transform:translateX(0); } }
  @keyframes obFloat  { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-7px); } }
  @keyframes obGlow   { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
  @keyframes obPulse  { 0%,100% { box-shadow:0 4px 20px rgba(34,211,238,0.4); } 50% { box-shadow:0 8px 36px rgba(34,211,238,0.65), 0 0 0 4px rgba(34,211,238,0.1); } }
`;

// ─── Partículas de fondo (idénticas al tour) ─────────────────────────────────
const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i, x: (i * 41 + 13) % 100, y: (i * 57 + 9) % 100,
  duration: (i % 4) + 7, delay: (i % 5) * 0.9,
}));

function BackgroundGlow() {
  return (
    <>
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
        background:'radial-gradient(ellipse at 50% 42%, rgba(34,211,238,0.20) 0%, rgba(34,211,238,0.06) 40%, transparent 65%)',
        animation:'obGlow 5s ease-in-out infinite',
      }} />
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, height:'45%', pointerEvents:'none', zIndex:0,
        background:'linear-gradient(0deg, rgba(34,211,238,0.055) 0%, transparent 100%)',
      }} />
    </>
  );
}

// ─── Datos estáticos ─────────────────────────────────────────────────────────
type LangDef = { code: SupportedLang; flag: string; native: string };
const LANGS: LangDef[] = [
  { code: 'es',    flag: '🇪🇸', native: 'Español' },
  { code: 'en',    flag: '🇬🇧', native: 'English' },
  { code: 'pt-PT', flag: '🇵🇹', native: 'Português' },
  { code: 'pt-BR', flag: '🇧🇷', native: 'Português (BR)' },
  { code: 'fr',    flag: '🇫🇷', native: 'Français' },
  { code: 'it',    flag: '🇮🇹', native: 'Italiano' },
];

// Formato de fecha derivado del idioma (no se pregunta — editable en Ajustes).
const DATE_FMT_BY_LANG: Record<string, string> = {
  es: 'dd/mm/yyyy', 'pt-PT': 'dd/mm/yyyy', 'pt-BR': 'dd/mm/yyyy',
  fr: 'dd/mm/yyyy', it: 'dd/mm/yyyy', en: 'mm/dd/yyyy',
};

// Divisas de acceso rápido (el resto, en el desplegable).
const QUICK_CURRENCIES = ['EUR', 'USD', 'GBP'];

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

const CAT_KEYS = [
  'salary', 'freelance', 'rentReceived', 'investments', 'pension', 'otherIncome',
  'housing', 'mortgage', 'food', 'transport', 'health', 'education',
  'leisure', 'subscriptions', 'clothing', 'restaurants', 'travel',
  'insurance', 'pets', 'savings', 'otherExpenses',
] as const;

const uid = () => crypto.randomUUID();

type OnboardingData = {
  accounts: Account[];
  categories: Category[];
  projections: Projection[];
  realExpenses?: RealExpense[];
  categoryRules?: CategoryRule[];
  baseCurrency: string;
  dateFormat: string;
};

type SlideId = 'language' | 'name' | 'currency' | 'mode' | 'legal';
const SLIDES: SlideId[] = ['language', 'name', 'currency', 'mode', 'legal'];

// ─── Componente ──────────────────────────────────────────────────────────────
export function Onboarding({ onFinish }: { onFinish: (data: OnboardingData) => void }) {
  const { t } = useTranslation();

  const [index, setIndex]         = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [animKey, setAnimKey]     = useState(0);
  const [busy, setBusy]           = useState(false);

  const [selectedLang, setSelectedLang]         = useState<SupportedLang>((i18next.language as SupportedLang) ?? 'es');
  const [userName, setUserName]                 = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [chosenMode, setChosenMode]             = useState<'real' | 'demo' | null>(null);
  const [legalAccepted, setLegalAccepted]       = useState(false);
  const [openLegalDoc, setOpenLegalDoc]         = useState<keyof typeof LEGAL_DOCS | null>(null);

  const touchStartX = useRef<number | null>(null);
  const slide       = SLIDES[index];
  const isLast      = index === SLIDES.length - 1;
  const progress    = (index + 1) / SLIDES.length;
  const dateFmt     = DATE_FMT_BY_LANG[selectedLang] ?? 'dd/mm/yyyy';

  // ── Navegación entre slides ──
  const navigate = useCallback((newIndex: number, dir: 'left' | 'right') => {
    if (busy || newIndex < 0 || newIndex >= SLIDES.length) return;
    setBusy(true);
    setDirection(dir);
    setTimeout(() => { setIndex(newIndex); setAnimKey(k => k + 1); setBusy(false); }, 220);
  }, [busy]);

  const goNext = useCallback(() => navigate(index + 1, 'left'), [index, navigate]);
  const goPrev = useCallback(() => navigate(index - 1, 'right'), [index, navigate]);

  // ── Finalizar ──
  const finishReal = useCallback(() => {
    // O1 — arranca en local puro; limpia seguridad residual.
    localStorage.removeItem('fh_security');
    localStorage.removeItem('fh_lock_state');
    localStorage.removeItem('fh_totp_last_unlock');
    // O5 — nombre solo-local.
    if (userName.trim()) {
      try { localStorage.setItem('fh_user_name', JSON.stringify(userName.trim())); } catch { /* ignore */ }
    }
    const cats = CAT_KEYS.map((key, i) => ({
      name: t(`onboarding.defaultCategories.${key}`),
      type: CATEGORY_COLORS[i].type,
      color: CATEGORY_COLORS[i].color,
      id: uid(),
    }));
    onFinish({ accounts: [], categories: cats, projections: [], baseCurrency: selectedCurrency, dateFormat: dateFmt });
  }, [userName, selectedCurrency, dateFmt, t, onFinish]);

  const finishDemo = useCallback(() => {
    try {
      localStorage.setItem('fh_base_currency', JSON.stringify(selectedCurrency));
      localStorage.setItem('fh_currency', JSON.stringify(selectedCurrency));
      if (userName.trim()) localStorage.setItem('fh_user_name', JSON.stringify(userName.trim()));
    } catch { /* ignore */ }
    enterDemo(); // recarga en modo demo
  }, [selectedCurrency, userName]);

  const finish = useCallback(() => {
    if (!legalAccepted) return;
    if (chosenMode === 'demo') finishDemo();
    else finishReal();
  }, [legalAccepted, chosenMode, finishDemo, finishReal]);

  // ── Estado del botón "Continuar" según slide ──
  const continueEnabled =
    slide === 'mode' ? chosenMode !== null :
    slide === 'legal' ? legalAccepted :
    true;

  const handlePrimary = () => { if (isLast) finish(); else goNext(); };

  // ── Teclado ──
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (busy) return;
      if ((e.key === 'ArrowRight' || e.key === 'Enter') && continueEnabled) { e.preventDefault(); handlePrimary(); }
      if (e.key === 'ArrowLeft' && index > 0) { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  // ── Swipe ──
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 48) {
      if (diff > 0 && continueEnabled) handlePrimary();
      else if (diff < 0 && index > 0) goPrev();
    }
    touchStartX.current = null;
  };

  const animName = direction === 'left' ? 'obSlideL' : 'obSlideR';
  const greeting = userName.trim() ? t('onboarding.dialog.greetingName', { name: userName.trim() }) : '';

  return (
    <>
      <style>{STYLES}</style>
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: BG,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: 'calc(5.5rem + env(safe-area-inset-top, 0px)) 1.5rem calc(1.5rem + env(safe-area-inset-bottom, 0px))',
          overflow: 'hidden', userSelect: 'none',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        <BackgroundGlow />

        {/* Partículas */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          {PARTICLES.map(p => (
            <div key={p.id} style={{
              position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
              width: '1.5px', height: '1.5px', borderRadius: '50%',
              background: ACCENT, opacity: 0.07,
              animation: `obFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }} />
          ))}
        </div>

        {/* Barra de progreso */}
        <div style={{ position: 'absolute', top: 'env(safe-area-inset-top, 0px)', left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.06)', zIndex: 10 }}>
          <div style={{
            height: '100%', width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${ACCENT}, #06b6d4)`,
            boxShadow: '0 0 10px rgba(34,211,238,0.5)',
            transition: 'width 0.45s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>

        {/* Header: logo + wordmark */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: 'calc(1rem + env(safe-area-inset-top, 0px)) 1.5rem 1rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 10,
        }}>
          <BrandLogo size={30} title={APP_NAME} />
          <BrandWordmark accent={ACCENT} base={TEXT} style={{ fontSize: '0.875rem', fontWeight: 800, letterSpacing: '-0.03em' }} />
        </div>

        {/* ── Contenido del slide ── */}
        <div
          key={animKey}
          style={{
            width: '100%', maxWidth: '34rem', margin: 'auto',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', gap: '1.25rem', position: 'relative', zIndex: 2,
            animation: `${animName} 0.3s cubic-bezier(0.4,0,0.2,1) both`,
          }}
        >
          {renderSlide()}
        </div>

        {/* ── Barra inferior: Atrás + Continuar ── */}
        <div style={{
          width: '100%', maxWidth: '34rem', position: 'relative', zIndex: 3,
          display: 'flex', alignItems: 'center', gap: '0.875rem', marginTop: '1rem',
        }}>
          {index > 0 && (
            <button
              onClick={goPrev}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.9rem 1.125rem', borderRadius: '0.75rem',
                border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)',
                color: TEXT_SUB, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              <ArrowLeft size={16} /> {t('onboarding.dialog.back')}
            </button>
          )}
          <button
            onClick={handlePrimary}
            disabled={!continueEnabled}
            style={{
              flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.95rem 1.5rem', borderRadius: '0.75rem', border: 'none',
              background: continueEnabled ? `linear-gradient(135deg, ${ACCENT} 0%, #06b6d4 100%)` : 'rgba(255,255,255,0.06)',
              color: continueEnabled ? '#07131a' : TEXT_MTD,
              fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em',
              cursor: continueEnabled ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
              boxShadow: continueEnabled ? '0 1px 3px rgba(34,211,238,0.4), 0 6px 20px rgba(34,211,238,0.25)' : 'none',
              animation: isLast && continueEnabled ? 'obPulse 2.5s ease-in-out 1s infinite' : undefined,
              transition: 'all 0.2s',
            }}
          >
            {isLast
              ? (chosenMode === 'demo' ? t('onboarding.dialog.finishDemo') : t('onboarding.dialog.finishReal'))
              : t('onboarding.dialog.continue')}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {openLegalDoc && <LegalModal docKey={openLegalDoc} onClose={() => setOpenLegalDoc(null)} />}
    </>
  );

  // ── Sub-render por slide ───────────────────────────────────────────────────
  function renderSlide() {
    switch (slide) {
      // 1 · IDIOMA
      case 'language':
        return (
          <>
            <SlideIcon Icon={Globe} />
            <Eyebrow>{t('onboarding.dialog.langEyebrow')}</Eyebrow>
            <Title>{t('onboarding.dialog.langTitle')}</Title>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem',
              width: '100%', maxWidth: '26rem', marginTop: '0.25rem',
            }}>
              {LANGS.map(l => {
                const active = selectedLang === l.code;
                return (
                  <button
                    key={l.code}
                    onClick={() => { setSelectedLang(l.code); setLanguage(l.code); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.625rem',
                      padding: '0.875rem 1rem', borderRadius: '0.875rem', cursor: 'pointer',
                      border: active ? `1.5px solid ${ACCENT}` : `1px solid ${CARD_BDR}`,
                      background: active ? 'rgba(34,211,238,0.1)' : CARD_BG,
                      boxShadow: active ? '0 0 20px rgba(34,211,238,0.2)' : 'none',
                      color: TEXT, fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '1.375rem', lineHeight: 1 }}>{l.flag}</span>
                    <span style={{ fontSize: '0.925rem', fontWeight: 700 }}>{l.native}</span>
                    {active && <Check size={16} color={ACCENT} style={{ marginLeft: 'auto' }} />}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: '0.72rem', color: TEXT_MTD, lineHeight: 1.6, margin: '0.25rem 0 0', maxWidth: '30rem' }}>
              {t('onboarding.dialog.langHint')}
            </p>
          </>
        );

      // 2 · NOMBRE (O7)
      case 'name':
        return (
          <>
            <SlideIcon Icon={User} />
            <Eyebrow>{t('onboarding.dialog.nameEyebrow')}</Eyebrow>
            <Title>{t('onboarding.dialog.nameTitle')}</Title>
            <input
              type="text"
              value={userName}
              autoFocus
              onChange={e => setUserName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); goNext(); } }}
              placeholder={t('onboarding.dialog.namePlaceholder')}
              maxLength={40}
              style={{
                width: '100%', maxWidth: '22rem', textAlign: 'center',
                padding: '1rem 1.25rem', borderRadius: '0.875rem',
                border: `1.5px solid ${CARD_BDR}`, background: CARD_BG, color: TEXT,
                fontSize: '1.25rem', fontWeight: 700, fontFamily: 'inherit', outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(34,211,238,0.15)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = CARD_BDR; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: TEXT_MTD, lineHeight: 1.5, margin: 0, maxWidth: '24rem' }}>
              <ShieldCheck size={14} color={TEXT_MTD} style={{ flexShrink: 0 }} /> {t('onboarding.dialog.namePrivacy')}
            </p>
            <button
              onClick={goNext}
              style={{ background: 'none', border: 'none', color: TEXT_SUB, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
              {t('onboarding.dialog.nameSkip')}
            </button>
          </>
        );

      // 3 · DIVISA
      case 'currency': {
        const selected = CURRENCIES.find(c => c.code === selectedCurrency);
        const isQuick = QUICK_CURRENCIES.includes(selectedCurrency);
        return (
          <>
            <SlideIcon Icon={Wallet} />
            <Eyebrow>{greeting || t('onboarding.dialog.currencyEyebrow')}</Eyebrow>
            <Title>{t('onboarding.dialog.currencyTitle')}</Title>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '24rem' }}>
              {QUICK_CURRENCIES.map(code => {
                const c = CURRENCIES.find(x => x.code === code);
                if (!c) return null;
                const active = selectedCurrency === code;
                return (
                  <button
                    key={code}
                    onClick={() => setSelectedCurrency(code)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                      minWidth: '5.5rem', padding: '0.875rem 1rem', borderRadius: '0.875rem', cursor: 'pointer',
                      border: active ? `1.5px solid ${ACCENT}` : `1px solid ${CARD_BDR}`,
                      background: active ? 'rgba(34,211,238,0.1)' : CARD_BG,
                      boxShadow: active ? '0 0 20px rgba(34,211,238,0.2)' : 'none',
                      color: TEXT, fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '1.375rem', fontWeight: 800, color: active ? ACCENT : TEXT }}>{c.symbol}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{c.code}</span>
                  </button>
                );
              })}
            </div>
            <select
              value={isQuick ? '' : selectedCurrency}
              onChange={e => e.target.value && setSelectedCurrency(e.target.value)}
              style={{
                width: '100%', maxWidth: '24rem', padding: '0.8rem 1rem', borderRadius: '0.875rem',
                border: `1px solid ${CARD_BDR}`, background: isQuick ? CARD_BG : 'rgba(34,211,238,0.1)',
                color: isQuick ? TEXT_SUB : TEXT, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', outline: 'none', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem',
              }}
            >
              <option value="" style={{ background: '#12122a', color: TEXT_MTD }}>{t('onboarding.dialog.currencyOther')}</option>
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code} style={{ background: '#12122a', color: TEXT }}>
                  {c.symbol} {c.code} — {c.name}
                </option>
              ))}
            </select>
            {selected && (
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: TEXT_MTD, lineHeight: 1.5, margin: 0, maxWidth: '26rem' }}>
                <Check size={14} color={ACCENT} style={{ flexShrink: 0 }} /> {t('onboarding.dialog.currencyHint')}
              </p>
            )}
          </>
        );
      }

      // 4 · DATOS REALES vs PRUEBA
      case 'mode':
        return (
          <>
            <Eyebrow>{t('onboarding.dialog.modeEyebrow')}</Eyebrow>
            <Title>{t('onboarding.dialog.modeTitle')}</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', width: '100%', maxWidth: '26rem', marginTop: '0.25rem' }}>
              <ModeCard
                Icon={ShieldCheck}
                active={chosenMode === 'real'}
                onClick={() => setChosenMode('real')}
                title={t('onboarding.dialog.modeRealTitle')}
                desc={t('onboarding.dialog.modeRealDesc')}
              />
              <ModeCard
                Icon={FlaskConical}
                active={chosenMode === 'demo'}
                onClick={() => setChosenMode('demo')}
                title={t('onboarding.dialog.modeDemoTitle')}
                desc={t('onboarding.dialog.modeDemoDesc')}
                badge={t('onboarding.dialog.modeDemoBadge')}
              />
            </div>
          </>
        );

      // 5 · LEGAL
      case 'legal':
        return (
          <>
            <SlideIcon Icon={ShieldCheck} />
            <Eyebrow>{t('onboarding.dialog.legalEyebrow')}</Eyebrow>
            <Title>{t('onboarding.dialog.legalTitle')}</Title>
            <p style={{ fontSize: '0.925rem', color: TEXT_SUB, lineHeight: 1.65, margin: 0, maxWidth: '28rem' }}>
              {t('onboarding.dialog.legalIntro')}
            </p>
            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer',
              width: '100%', maxWidth: '28rem', textAlign: 'left',
              padding: '1rem 1.125rem', borderRadius: '0.875rem',
              border: legalAccepted ? `1.5px solid ${ACCENT}` : `1px solid ${CARD_BDR}`,
              background: legalAccepted ? 'rgba(34,211,238,0.08)' : CARD_BG, transition: 'all 0.15s',
            }}>
              <input
                type="checkbox"
                checked={legalAccepted}
                onChange={e => setLegalAccepted(e.target.checked)}
                style={{ width: '1.125rem', height: '1.125rem', marginTop: '0.1rem', cursor: 'pointer', accentColor: ACCENT, flexShrink: 0 }}
              />
              <span style={{ fontSize: '0.8rem', color: TEXT_SUB, lineHeight: 1.6 }}>
                {t('onboarding.welcome.legalPrefix')}{' '}
                {(['aviso', 'privacidad', 'terminos', 'cookies'] as const).map((doc, i) => {
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
                        onClick={e => { e.preventDefault(); setOpenLegalDoc(doc); }}
                        style={{ background: 'none', border: 'none', color: ACCENT, fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: '0.8rem', textDecoration: 'underline' }}
                      >
                        {t(labelKey[doc])}
                      </button>
                    </span>
                  );
                })}
                {t('onboarding.welcome.legalSuffix')}
              </span>
            </label>
          </>
        );
    }
  }
}

// ─── Primitivos de slide (para consistencia visual) ──────────────────────────
function SlideIcon({ Icon }: { Icon: typeof Globe }) {
  return (
    <div style={{
      width: '4rem', height: '4rem', borderRadius: '50%',
      background: 'rgba(34,211,238,0.08)', border: '1.5px solid rgba(34,211,238,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 0 32px rgba(34,211,238,0.25)', animation: 'obFloat 4s ease-in-out infinite',
    }}>
      <Icon size={28} color={ACCENT} strokeWidth={1.75} />
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', padding: '0.3rem 0.875rem', borderRadius: '9999px',
      border: '1px solid rgba(34,211,238,0.3)', background: 'rgba(34,211,238,0.08)',
      color: ACCENT, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', animation: 'obFadeUp 0.3s ease 0.05s both',
    }}>
      {children}
    </div>
  );
}

function Title({ children }: { children: string }) {
  return (
    <h1 style={{
      fontSize: 'clamp(1.875rem, 7vw, 3rem)', fontWeight: 900, color: TEXT,
      letterSpacing: '-0.04em', lineHeight: 1.05, margin: 0, whiteSpace: 'pre-line',
      animation: 'obFadeUp 0.3s ease 0.08s both',
    }}>
      {children}
    </h1>
  );
}

function ModeCard({ Icon, active, onClick, title, desc, badge }: {
  Icon: typeof Globe; active: boolean; onClick: () => void; title: string; desc: string; badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.875rem', textAlign: 'left',
        padding: '1.125rem 1.25rem', borderRadius: '1rem', cursor: 'pointer', width: '100%',
        border: active ? `1.5px solid ${ACCENT}` : `1px solid ${CARD_BDR}`,
        background: active ? 'rgba(34,211,238,0.1)' : CARD_BG,
        boxShadow: active ? '0 0 24px rgba(34,211,238,0.22)' : 'none',
        fontFamily: 'inherit', transition: 'all 0.15s',
      }}
    >
      <div style={{
        width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.04)',
      }}>
        <Icon size={22} color={active ? ACCENT : TEXT_SUB} strokeWidth={1.9} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: TEXT }}>{title}</span>
          {badge && (
            <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: ACCENT, background: 'rgba(34,211,238,0.12)', padding: '0.15rem 0.45rem', borderRadius: '9999px' }}>{badge}</span>
          )}
          {active && <Check size={16} color={ACCENT} style={{ marginLeft: 'auto' }} />}
        </div>
        <p style={{ fontSize: '0.8rem', color: TEXT_SUB, lineHeight: 1.55, margin: 0 }}>{desc}</p>
      </div>
    </button>
  );
}
