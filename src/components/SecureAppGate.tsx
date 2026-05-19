import { Shield, Loader2 } from 'lucide-react';
import { useSecurityContext } from '../SecurityContext';
import { useDataReady } from '../hooks/useHydration';
import { LockScreen } from '../views/LockScreen';
import { AppProvider } from '../AppProvider';
import { AppShell } from '../AppShell';
import { GlobalModals } from './GlobalModals';
import { TourProvider } from './TourContext';

// ─── <SecureAppGate /> ───────────────────────────────────────────────────
//
// Guardián arquitectónico del boot sequence (Fase 2 — refactor de seguridad).
//
// Garantías que ofrece a los providers de datos (Settings/Data/UI/AppCore):
//   1. Si el usuario tiene seguridad configurada Y está bloqueado,
//      LOS DATA PROVIDERS NO EXISTEN. Solo se monta <LockScreen />.
//      → Imposible que useLocalStorage lea/escriba claves cifradas pre-unlock.
//
//   2. Si el usuario tiene vault pero el cache aún no está hidratado
//      (justo tras unlock, mientras se descifran las claves), MUESTRA
//      UN SPINNER. Los providers se montan SOLO cuando hay datos reales
//      disponibles.
//      → Imposible la race condition que causó la pérdida de datos.
//
//   3. Si el usuario no tiene seguridad / no tiene vault, monta los
//      providers inmediatamente (datos en claro, sin esperar nada).
//      → Cero impacto en el flujo de onboarding inicial.
// ─────────────────────────────────────────────────────────────────────────

export function SecureAppGate() {
  const { isLocked, isConfigured } = useSecurityContext();
  const dataReady = useDataReady();

  // ── Caso 1: app bloqueada → LockScreen aislado ─────────────────────────
  if (isConfigured && isLocked) {
    return <LockScreen />;
  }

  // ── Caso 2: desbloqueado pero cache aún no hidratado → loading ────────
  if (!dataReady) {
    return <HydratingScreen />;
  }

  // ── Caso 3: listo → montamos toda la app ──────────────────────────────
  // 🎬 TourProvider envuelve la app para coordinar el tour guiado del header
  // con los coachmarks contextuales y evitar que se solapen.
  return (
    <AppProvider>
      <TourProvider>
        <AppShell />
        <GlobalModals />
      </TourProvider>
    </AppProvider>
  );
}

// ─── Pantalla de hidratación ─────────────────────────────────────────────
function HydratingScreen() {
  return (
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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          color: '#93c5fd',
        }}
      >
        <div
          style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '1.25rem',
            background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(59,130,246,0.4)',
          }}
        >
          <Shield size={28} color="#fff" />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
          Descifrando tus datos...
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
