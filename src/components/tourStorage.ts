// ─── Persistencia del tour del header ────────────────────────
// Vive fuera de CoachMarksTour.tsx para que ese fichero solo exporte
// componentes (react-refresh/only-export-components → Fast Refresh en dev).

/** Clave pública (usada en AppShell para reset) */
export const LS_KEY_TOUR = 'fh_header_tour_done';

/** Marca el tour como completado en localStorage */
export function markTourDone() {
  localStorage.setItem(LS_KEY_TOUR, 'true');
}

/** Comprueba si el tour ya se ha visto */
export function isTourDone(): boolean {
  return localStorage.getItem(LS_KEY_TOUR) === 'true';
}

/** Reinicia el tour (para usar desde Ayuda o Reset) */
export function resetTour() {
  localStorage.removeItem(LS_KEY_TOUR);
}
