// ─── TourContext.tsx ─────────────────────────────────────────────────────────
// 🎬 Contexto global para coordinar el tour guiado del header (CoachMarksTour)
// con los coachmarks contextuales individuales (useCoachMark).
//
// Filosofía: mientras el tour guiado del header esté activo, los coachmarks
// contextuales de las pantallas se ocultan para no competir visualmente.
// Cuando el tour termina, vuelven a aparecer normalmente.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext } from 'react';

export type TourContextValue = {
  /** True cuando el CoachMarksTour del header está visible */
  isTourActive: boolean;
  /** Permite arrancar / cerrar el tour desde cualquier parte de la app */
  setTourActive: (active: boolean) => void;
};

export const TourContext = createContext<TourContextValue>({
  isTourActive: false,
  setTourActive: () => {},
});

/**
 * Hook para consultar y controlar el estado del tour guiado.
 * Si se invoca fuera del Provider, devuelve valores seguros por defecto
 * (no hay tour activo y setTourActive es un no-op).
 */
export function useTour() {
  return useContext(TourContext);
}
