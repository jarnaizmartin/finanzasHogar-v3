// ─── useCoachMark ─────────────────────────────────────────────────────────────
// Estado "visto" de cada spotlight contextual (localStorage).
// Vive fuera de CoachMark.tsx para que ese fichero solo exporte componentes
// (react-refresh/only-export-components → Fast Refresh en desarrollo).
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { useTour } from './TourContext';

const LS_KEY = 'fh_coach_seen';

export function useCoachMark(key: string): {
  seen: boolean;
  markSeen: () => void;
} {
  const get = (): Record<string, boolean> => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    } catch {
      return {};
    }
  };

  const [seen, setSeen] = useState(() => get()[key] === true);

  // 🎬 Si el tour guiado del header está activo, "ocultamos" temporalmente
  // este coachmark contextual devolviendo seen=true. NO lo marcamos como
  // visto en localStorage: cuando el tour termine, volverá a aparecer
  // normalmente la próxima vez que el usuario visite la pantalla.
  const { isTourActive } = useTour();

  const markSeen = useCallback(() => {
    const current = get();
    current[key] = true;
    localStorage.setItem(LS_KEY, JSON.stringify(current));
    setSeen(true);
  }, [key]);

  return { seen: seen || isTourActive, markSeen };
}
