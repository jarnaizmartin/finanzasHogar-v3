// ─── TourContext.tsx ─────────────────────────────────────────────────────────
// 🎬 Contexto global para coordinar el tour guiado del header (CoachMarksTour)
// con los coachmarks contextuales individuales (useCoachMark).
//
// Filosofía: mientras el tour guiado del header esté activo, los coachmarks
// contextuales de las pantallas se ocultan para no competir visualmente.
// Cuando el tour termina, vuelven a aparecer normalmente.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

type TourContextValue = {
  /** True cuando el CoachMarksTour del header está visible */
  isTourActive: boolean;
  /** Permite arrancar / cerrar el tour desde cualquier parte de la app */
  setTourActive: (active: boolean) => void;
};

const TourContext = createContext<TourContextValue>({
  isTourActive: false,
  setTourActive: () => {},
});

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

/**
 * Hook para consultar y controlar el estado del tour guiado.
 * Si se invoca fuera del Provider, devuelve valores seguros por defecto
 * (no hay tour activo y setTourActive es un no-op).
 */
export function useTour() {
  return useContext(TourContext);
}
