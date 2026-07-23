// ─── TourProvider.tsx ────────────────────────────────────────────────────────
// Provider del contexto del tour guiado. Vive aparte de TourContext.tsx para
// que ese fichero no mezcle componente y hook (react-refresh: Fast Refresh).
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, type ReactNode } from 'react';
import { TourContext } from './TourContext';

export function TourProvider({ children }: { children: ReactNode }) {
  // El estado arranca en false. AppShell se encarga de activarlo
  // explícitamente cuando detecta que el tour del header está pendiente
  // (ver useEffect del tour en AppShell). Esto garantiza que funcione
  // incluso tras un reset, ya que el provider no se re-instancia pero
  // AppShell sí re-evalúa cuando cambia `onboarded`.
  const [isTourActive, setActive] = useState(false);

  // Memoizamos para no provocar re-renders innecesarios en consumidores.
  const setTourActive = useCallback((active: boolean) => {
    setActive(active);
  }, []);

  return (
    <TourContext.Provider value={{ isTourActive, setTourActive }}>
      {children}
    </TourContext.Provider>
  );
}
