// ─── WelcomeTour.tsx ─────────────────────────────────────────────────────────
// Tour de bienvenida — drama visual al nivel de la landing.
// Misma paleta. Títulos enormes. Teal en palabras clave. Glow protagonista.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, TrendingUp, CheckCircle } from 'lucide-react';
import { APP_NAME } from './config/app';
import { BrandLogo } from './components/BrandLogo';
import { BrandWordmark } from './components/BrandWordmark';

// ─── Paleta — idéntica a la landing ──────────────────────────────────────────
const BG       = '#060610';
const CARD_BG  = '#0d0d1f';
const CARD_BDR = '#1e1e3a';
const ACCENT   = '#22d3ee';
const TEXT     = '#f1f5f9';
const TEXT_SUB = '#94a3b8';
const TEXT_MTD = '#64748b';

// ─── Tipos ───────────────────────────────────────────────────────────────────
type TourCard = {
  id: string;
  eyebrow: string;
  titleKey: string;
  accentLine: 0 | 1; // qué línea del título (separado por \n) va en teal
  description: string;
  ctaLabel?: string;
  layout: 'text-left' | 'text-right' | 'centered';
  Mockup: ComponentType | null;
  glowSide: 'right' | 'left' | 'center';
};

// ─── Partículas ───────────────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: (i * 41 + 13) % 100,
  y: (i * 57 + 9) % 100,
  size: 1.5,
  duration: (i % 4) + 7,
  delay: (i % 5) * 0.9,
}));

// ─── Animaciones ─────────────────────────────────────────────────────────────
const STYLES = `
  @keyframes twFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes twSlideL {
    from { opacity: 0; transform: translateX(48px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes twSlideR {
    from { opacity: 0; transform: translateX(-48px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes twFloat {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-7px); }
  }
  @keyframes twBarGrow {
    from { transform: scaleY(0); }
    to   { transform: scaleY(1); }
  }
  @keyframes twPulseCta {
    0%, 100% { box-shadow: 0 4px 20px rgba(34,211,238,0.4); }
    50%       { box-shadow: 0 8px 36px rgba(34,211,238,0.65), 0 0 0 4px rgba(34,211,238,0.1); }
  }
  @keyframes twGlow {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1; }
  }
`;

// ─── WindowBar decorativa ─────────────────────────────────────────────────────
function WindowBar() {
  return (
    <div style={{
      background: '#080812', padding: '0.5rem 0.75rem',
      borderBottom: `1px solid ${CARD_BDR}`,
      display: 'flex', gap: '0.35rem', alignItems: 'center',
    }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', background: '#252540' }} />
      ))}
    </div>
  );
}

// ─── Mockup 1: Dashboard ─────────────────────────────────────────────────────
function MockupDashboard() {
  return (
    <div style={{
      background: CARD_BG, border: `1px solid ${CARD_BDR}`,
      borderRadius: '1.25rem', overflow: 'hidden',
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 24px 64px rgba(0,0,0,0.6), 0 0 60px rgba(34,211,238,0.15)`,
      width: '100%',
    }}>
      <WindowBar />
      <div style={{ background: '#080812', padding: '0.5rem 0.875rem 0', borderBottom: `1px solid ${CARD_BDR}` }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: TEXT, letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>{APP_NAME}</div>
        <div style={{ display: 'flex' }}>
          {['Resumen', 'Cuentas', 'Proyecciones'].map((tab, i) => (
            <div key={tab} style={{
              fontSize: '0.55rem', fontWeight: 600, padding: '0.3rem 0.5rem',
              color: i === 0 ? ACCENT : TEXT_MTD,
              borderBottom: i === 0 ? `2px solid ${ACCENT}` : '2px solid transparent',
              background: i === 0 ? 'rgba(34,211,238,0.07)' : 'transparent',
              borderRadius: i === 0 ? '0.25rem 0.25rem 0 0' : 0,
            }}>{tab}</div>
          ))}
        </div>
      </div>
      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #030b0f 0%, #051a26 50%, #0a2e3f 100%)',
          border: '1px solid rgba(34,211,238,0.25)', borderRadius: '0.875rem', padding: '0.875rem 1rem',
        }}>
          <div style={{ fontSize: '0.48rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(125,211,252,0.65)', marginBottom: '0.2rem' }}>PATRIMONIO TOTAL</div>
          <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.05 }}>€247.389,00</div>
          <div style={{ fontSize: '0.48rem', color: 'rgba(125,211,252,0.5)', margin: '0.15rem 0 0.625rem' }}>Saldo real · 10 cuentas</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
            {[['INGRESOS','+€5.800','#4ade80'],['GASTOS','-€3.941','#f87171'],['NETO','+€1.859','#4ade80']].map(([l,v,c])=>(
              <div key={l} style={{ textAlign:'center', borderRight: l!=='NETO'?'1px solid rgba(255,255,255,0.07)':'none' }}>
                <div style={{ fontSize:'0.4rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'rgba(125,211,252,0.5)', marginBottom:'0.15rem' }}>{l}</div>
                <div style={{ fontSize:'0.625rem', fontWeight:800, color:c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.4rem' }}>
          {[['Santander','C/C Principal','€15.420','#0f1e40','rgba(59,130,246,0.25)','#93c5fd'],['ING Direct','Ahorro','€8.260','#0f1e34','rgba(34,211,238,0.2)','#67e8f9']].map(([b,n,a,bg,bdr,c])=>(
            <div key={b} style={{ background:bg, border:`1px solid ${bdr}`, borderRadius:'0.75rem', padding:'0.5rem 0.625rem' }}>
              <div style={{ fontSize:'0.45rem', fontWeight:700, color:TEXT_MTD, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:'0.1rem' }}>{b}</div>
              <div style={{ fontSize:'0.48rem', fontWeight:600, color:TEXT_MTD, marginBottom:'0.2rem' }}>{n}</div>
              <div style={{ fontSize:'0.8rem', fontWeight:800, letterSpacing:'-0.02em', color:c }}>{a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Mockup 2: Privacidad ─────────────────────────────────────────────────────
function MockupPrivacy() {
  // §5.L — honestidad: el sync E2E existe, así que "0 bytes a la nube" era falso.
  const items = ['AES-GCM 256 bits','Sin servidores nuestros','Por defecto, solo en tu dispositivo','Sync opcional cifrado de extremo a extremo','Frase BIP39 de recuperación'];
  return (
    <div style={{
      background: CARD_BG, border: '1.5px solid rgba(34,211,238,0.3)',
      borderRadius: '1.25rem', padding: '2rem 1.5rem',
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 24px 64px rgba(0,0,0,0.6), 0 0 60px rgba(34,211,238,0.18)`,
      width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem',
    }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.875rem' }}>
        <div style={{
          width:'5rem', height:'5rem', borderRadius:'50%',
          background:'rgba(34,211,238,0.08)', border:'1.5px solid rgba(34,211,238,0.35)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 0 32px rgba(34,211,238,0.25)',
          animation:'twFloat 4s ease-in-out infinite',
        }}>
          <Shield size={30} color={ACCENT} strokeWidth={1.75} />
        </div>
        <div style={{ fontSize:'0.65rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:ACCENT }}>
          CIFRADO DE NIVEL BANCARIO
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
        {items.map(item=>(
          <div key={item} style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
            <CheckCircle size={14} color={ACCENT} strokeWidth={2} />
            <span style={{ fontSize:'0.825rem', color:TEXT_SUB }}>{item}</span>
          </div>
        ))}
      </div>
      <div style={{ borderTop:`1px solid ${CARD_BDR}`, paddingTop:'0.875rem', fontSize:'0.7rem', color:TEXT_MTD, textAlign:'center', lineHeight:1.5 }}>
        Código open source · Verificable por cualquiera
      </div>
    </div>
  );
}

// ─── Mockup 3: Proyecciones ───────────────────────────────────────────────────
function MockupProjections() {
  const months = [
    {label:'JUN',h:62},{label:'JUL',h:83},{label:'AGO',h:55},
    {label:'SEP',h:73},{label:'OCT',h:69},{label:'NOV',h:80},
  ];
  return (
    <div style={{
      background: CARD_BG, border:`1px solid ${CARD_BDR}`,
      borderRadius:'1.25rem', overflow:'hidden',
      boxShadow:`inset 0 1px 0 rgba(255,255,255,0.05), 0 24px 64px rgba(0,0,0,0.6), 0 0 60px rgba(34,211,238,0.15)`,
      width:'100%',
    }}>
      <WindowBar />
      <div style={{ padding:'1rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'1rem' }}>
          <div>
            <div style={{ fontSize:'0.5rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:ACCENT, marginBottom:'0.2rem' }}>PROYECCIÓN</div>
            <div style={{ fontSize:'0.925rem', fontWeight:800, color:TEXT, letterSpacing:'-0.02em' }}>Próximos 6 meses</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:'0.45rem', color:TEXT_MTD, marginBottom:'0.1rem' }}>NETO ACUMULADO</div>
            <div style={{ fontSize:'1rem', fontWeight:800, color:'#4ade80', letterSpacing:'-0.02em' }}>+€12.200</div>
          </div>
        </div>
        <div style={{
          display:'flex', alignItems:'flex-end', gap:'0.375rem',
          height:'100px', paddingBottom:'0.25rem',
          borderBottom:'1px solid rgba(255,255,255,0.06)', marginBottom:'0.5rem',
        }}>
          {months.map((m,i)=>(
            <div key={m.label} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div style={{
                width:'100%', height:`${m.h}px`, borderRadius:'0.3rem 0.3rem 0 0',
                background: i===1||i===3||i===5
                  ? `linear-gradient(180deg, ${ACCENT} 0%, rgba(34,211,238,0.6) 100%)`
                  : 'linear-gradient(180deg, rgba(34,211,238,0.5) 0%, rgba(34,211,238,0.2) 100%)',
                transformOrigin:'bottom',
                animation:`twBarGrow 0.6s cubic-bezier(0.34,1.1,0.64,1) ${i*0.07}s both`,
              }} />
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:'0.375rem' }}>
          {months.map(m=>(
            <div key={m.label} style={{ flex:1, textAlign:'center', fontSize:'0.45rem', fontWeight:700, color:TEXT_MTD, letterSpacing:'0.04em' }}>{m.label}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Glow de fondo dinámico ───────────────────────────────────────────────────
function BackgroundGlow({ side }: { side: 'right' | 'left' | 'center' }) {
  const pos = side === 'right' ? '72% 50%' : side === 'left' ? '28% 50%' : '50% 50%';
  const size = side === 'center' ? '65%' : '72%';
  return (
    <>
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        background: `radial-gradient(ellipse at ${pos}, rgba(34,211,238,0.20) 0%, rgba(34,211,238,0.06) 40%, transparent ${size})`,
        animation:'twGlow 5s ease-in-out infinite',
        zIndex:0,
      }} />
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, height:'45%',
        background:'linear-gradient(0deg, rgba(34,211,238,0.055) 0%, transparent 100%)',
        pointerEvents:'none', zIndex:0,
      }} />
    </>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function WelcomeTour({
  onComplete,
  isFirstTime = true,
}: {
  onComplete: () => void;
  isFirstTime?: boolean;
}) {
  const { t } = useTranslation();

  const TOUR_CARDS: TourCard[] = useMemo(() => [
    {
      id: 'problem',
      eyebrow: t('onboarding.tour.cards.problemEyebrow'),
      titleKey: 'onboarding.tour.cards.problemTitle',
      accentLine: 1,
      description: t('onboarding.tour.cards.problemDesc'),
      layout: 'text-left',
      Mockup: MockupDashboard,
      glowSide: 'right',
    },
    {
      id: 'privacy',
      eyebrow: t('onboarding.tour.cards.privacyEyebrow'),
      titleKey: 'onboarding.tour.cards.privacyTitle',
      accentLine: 1,
      description: t('onboarding.tour.cards.privacyDesc'),
      layout: 'text-right',
      Mockup: MockupPrivacy,
      glowSide: 'left',
    },
    {
      id: 'superpower',
      eyebrow: t('onboarding.tour.cards.superpowerEyebrow'),
      titleKey: 'onboarding.tour.cards.superpowerTitle',
      accentLine: 0,
      description: t('onboarding.tour.cards.superpowerDesc'),
      layout: 'text-left',
      Mockup: MockupProjections,
      glowSide: 'right',
    },
    {
      id: 'start',
      eyebrow: t('onboarding.tour.cards.startEyebrow'),
      titleKey: 'onboarding.tour.cards.startTitle',
      accentLine: 0,
      description: t('onboarding.tour.cards.startDesc'),
      ctaLabel: t('onboarding.tour.cards.startCta'),
      layout: 'centered',
      Mockup: null,
      glowSide: 'center',
    },
  ], [t]);

  const [index, setIndex]           = useState(0);
  const [direction, setDirection]   = useState<'left'|'right'>('left');
  const [animKey, setAnimKey]       = useState(0);
  const [busy, setBusy]             = useState(false);
  const [isDesktop, setIsDesktop]   = useState(false);
  const touchStartX                 = useRef<number|null>(null);

  const card   = TOUR_CARDS[index];
  const isLast = index === TOUR_CARDS.length - 1;
  const progress = (index + 1) / TOUR_CARDS.length;
  const MockupComponent = card.Mockup;

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 820);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // iOS PWA: el overlay fixed no pinta el safe-area inferior (home indicator)
  // y asomaba el canvas blanco del documento. Pintamos el fondo oscuro
  // mientras el tour está montado y lo restauramos al salir.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.backgroundColor;
    html.style.backgroundColor = BG;
    return () => { html.style.backgroundColor = prev; };
  }, []);

  const navigate = useCallback(
    (newIndex: number, dir: 'left'|'right') => {
      if (busy || newIndex < 0 || newIndex >= TOUR_CARDS.length) return;
      setBusy(true);
      setDirection(dir);
      setTimeout(() => { setIndex(newIndex); setAnimKey(k => k+1); setBusy(false); }, 250);
    },
    [busy, TOUR_CARDS.length]
  );

  const goNext = useCallback(() => {
    if (isLast) { onComplete(); return; }
    navigate(index+1, 'left');
  }, [index, isLast, navigate, onComplete]);

  const goPrev = useCallback(() => navigate(index-1, 'right'), [index, navigate]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (busy) return;
      if (e.key==='ArrowRight'||e.key===' ') { e.preventDefault(); goNext(); }
      if (e.key==='ArrowLeft') { e.preventDefault(); goPrev(); }
      if (e.key==='Escape'&&!isFirstTime) onComplete();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [busy, goNext, goPrev, isFirstTime, onComplete]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStartX.current===null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff)>48) diff>0 ? goNext() : goPrev();
    touchStartX.current = null;
  };

  const animName = direction==='left' ? 'twSlideL' : 'twSlideR';
  const isCentered = card.layout === 'centered' || !isDesktop;
  const isReversed = card.layout === 'text-right' && isDesktop;

  return (
    <>
      <style>{STYLES}</style>
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          position:'fixed', inset:0, zIndex:9999,
          background:BG,
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          padding: isCentered ? 'calc(6.5rem + env(safe-area-inset-top, 0px)) 1.5rem 1.5rem' : isDesktop ? '4rem 3.5rem 1.5rem' : 'calc(6.5rem + env(safe-area-inset-top, 0px)) 1.25rem 1.5rem',
          overflow:'hidden', userSelect:'none',
          fontFamily:"'Inter', system-ui, -apple-system, sans-serif",
          WebkitFontSmoothing:'antialiased',
        }}
      >
        {/* Glow dinámico */}
        <BackgroundGlow side={card.glowSide} />

        {/* Partículas */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:1 }}>
          {PARTICLES.map(p => (
            <div key={p.id} style={{
              position:'absolute', left:`${p.x}%`, top:`${p.y}%`,
              width:`${p.size}px`, height:`${p.size}px`,
              borderRadius:'50%', background:ACCENT, opacity:0.07,
              animation:`twFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }} />
          ))}
        </div>

        {/* Barra de progreso */}
        <div style={{ position:'absolute', top:'env(safe-area-inset-top, 0px)', left:0, right:0, height:'2px', background:'rgba(255,255,255,0.06)', zIndex:10 }}>
          <div style={{
            height:'100%', width:`${progress*100}%`,
            background:`linear-gradient(90deg, ${ACCENT}, #06b6d4)`,
            boxShadow:'0 0 10px rgba(34,211,238,0.5)',
            transition:'width 0.45s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>

        {/* Header */}
        <div style={{
          position:'absolute', top:0, left:0, right:0,
          padding:'calc(1rem + env(safe-area-inset-top, 0px)) 1.5rem 1rem', display:'flex', alignItems:'center',
          justifyContent:'space-between', zIndex:10,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
            <BrandLogo size={isDesktop ? 58 : 44} title={APP_NAME} />
            <BrandWordmark accent={ACCENT} base={TEXT} style={{ fontSize: isDesktop ? '1.5rem' : '1.125rem', fontWeight:800, letterSpacing:'-0.03em' }} />
          </div>
          {!isFirstTime && (
            <button onClick={onComplete} style={{
              padding:'0.375rem 0.875rem', borderRadius:'9999px',
              border:'1px solid rgba(255,255,255,0.12)',
              background:'rgba(255,255,255,0.06)', color:TEXT_SUB,
              fontSize:'0.75rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s',
            }}
            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color=TEXT; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color=TEXT_SUB; }}>
              {t('onboarding.tour.skipBtn')}
            </button>
          )}
        </div>

        {/* ── Layout principal ── */}
        <div
          key={animKey}
          style={{
            width:'100%',
            maxWidth: isCentered ? '38rem' : '1140px',
            display:'flex',
            flexDirection: isCentered ? 'column' : 'row',
            flexDirection: isReversed ? 'row-reverse' : isCentered ? 'column' : 'row',
            alignItems:'center',
            gap: isCentered ? '1rem' : '3.5rem',
            animation:`${animName} 0.3s cubic-bezier(0.4,0,0.2,1) both`,
            position:'relative', zIndex:2,
          } as React.CSSProperties}
        >
          {/* ── Texto ── */}
          <div style={{
            flex: isCentered ? undefined : '0 0 42%',
            display:'flex', flexDirection:'column',
            alignItems: isCentered ? 'center' : 'flex-start',
            gap: isDesktop ? '1.375rem' : '1rem',
            textAlign: isCentered ? 'center' : 'left',
          }}>
            {/* Eyebrow */}
            <div style={{
              display:'inline-flex', alignItems:'center',
              padding:'0.3rem 0.875rem', borderRadius:'9999px',
              border:'1px solid rgba(34,211,238,0.3)',
              background:'rgba(34,211,238,0.08)',
              color:ACCENT, fontSize:'0.7rem', fontWeight:700,
              letterSpacing:'0.08em', textTransform:'uppercase' as const,
              animation:'twFadeUp 0.3s ease 0.05s both',
            }}>
              {card.eyebrow}
            </div>

            {/* Título — enorme, con acento teal */}
            <h1 style={{
              fontSize: isDesktop
                ? (isCentered ? 'clamp(3.75rem, 6.5vw, 5.75rem)' : 'clamp(3rem, 4.8vw, 4.75rem)')
                : 'clamp(1.875rem, 8vw, 3rem)',
              fontWeight:900, color:TEXT,
              letterSpacing:'-0.04em', lineHeight:1.05, margin:0,
              whiteSpace:'pre-line',
              animation:'twFadeUp 0.3s ease 0.08s both',
            }}>
              {t(card.titleKey).split('\n').map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  <span style={i === card.accentLine ? { color: ACCENT } : undefined}>{line}</span>
                </span>
              ))}
            </h1>

            {/* Descripción */}
            <p style={{
              fontSize: isDesktop ? '1rem' : '0.9rem',
              color:TEXT_SUB,
              lineHeight: isDesktop ? 1.7 : 1.6,
              margin:0,
              maxWidth: isCentered ? '100%' : '32ch',
              animation:'twFadeUp 0.3s ease 0.14s both',
            }}>
              {card.description}
            </p>

            {/* CTA */}
            <button
              onClick={goNext}
              style={{
                padding: isDesktop ? '0.9375rem 2.25rem' : '0.75rem 1.875rem', borderRadius:'0.75rem', border:'none',
                background:`linear-gradient(135deg, ${ACCENT} 0%, #06b6d4 100%)`,
                color:'#0a0a1e', fontSize:'1rem', fontWeight:700,
                cursor:'pointer', letterSpacing:'-0.01em',
                boxShadow:'0 1px 3px rgba(34,211,238,0.4), 0 6px 20px rgba(34,211,238,0.25)',
                transition:'filter 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
                animation: isLast
                  ? 'twFadeUp 0.3s ease 0.2s both, twPulseCta 2.5s ease-in-out 1s infinite'
                  : 'twFadeUp 0.3s ease 0.2s both',
                alignSelf: isCentered ? 'center' : 'flex-start',
                minWidth:'11rem',
              }}
              onMouseEnter={e=>{ e.currentTarget.style.filter='brightness(1.1)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 2px 8px rgba(34,211,238,0.5), 0 12px 28px rgba(34,211,238,0.3)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.filter=''; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 1px 3px rgba(34,211,238,0.4), 0 6px 20px rgba(34,211,238,0.25)'; }}
            >
              {card.ctaLabel ?? t('onboarding.tour.nextBtn')}
            </button>

            {/* Dots */}
            <div style={{
              display:'flex', gap:'0.4rem', alignItems:'center',
              animation:'twFadeUp 0.3s ease 0.25s both',
              alignSelf: isCentered ? 'center' : 'flex-start',
            }}>
              {TOUR_CARDS.map((_,i)=>(
                <button key={i}
                  onClick={()=>!busy&&navigate(i, i>index?'left':'right')}
                  aria-label={t('onboarding.tour.goToScreen', {n:i+1})}
                  style={{
                    width:i===index?'1.5rem':'0.4rem', height:'0.4rem',
                    borderRadius:'9999px', border:'none',
                    background:i===index?ACCENT:'rgba(255,255,255,0.2)',
                    cursor:'pointer', padding:0,
                    transition:'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                    boxShadow:i===index?`0 0 8px ${ACCENT}`:'none',
                  }}
                />
              ))}
            </div>

            {/* Hint */}
            {isDesktop && (
              <div style={{
                display:'flex', gap:'0.5rem', alignItems:'center',
                fontSize:'0.65rem', color:'rgba(255,255,255,0.18)', fontWeight:500,
                animation:'twFadeUp 0.3s ease 0.3s both',
              }}>
                <span>{t('onboarding.tour.navHint')}</span>
                <span>·</span>
                <span>{t('onboarding.tour.spaceHint')}</span>
                {!isFirstTime&&<><span>·</span><span>{t('onboarding.tour.escHint')}</span></>}
              </div>
            )}
            {!isDesktop && (
              <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.18)', fontWeight:500, animation:'twFadeUp 0.3s ease 0.3s both' }}>
                {t('onboarding.tour.swipeHint')}
              </div>
            )}
          </div>

          {/* ── Mockup — full en desktop, recortado con fade en móvil ── */}
          {MockupComponent && (
            <div style={{
              flex: isCentered ? undefined : '0 0 52%',
              width: !isDesktop ? '100%' : undefined,
              maxWidth: !isDesktop ? '300px' : undefined,
              maxHeight: !isDesktop ? '35vh' : undefined,
              overflow: !isDesktop ? 'hidden' : undefined,
              borderRadius: '1.25rem',
              position: 'relative',
              flexShrink: !isDesktop ? 1 : undefined,
              animation:'twFadeUp 0.4s ease 0.06s both',
            }}>
              <MockupComponent />
              {/* Fade inferior en móvil — hace el corte elegante, no abrupto */}
              {!isDesktop && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: '5rem', pointerEvents: 'none',
                  background: `linear-gradient(to bottom, transparent, ${BG})`,
                  borderRadius: '0 0 1.25rem 1.25rem',
                }} />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
