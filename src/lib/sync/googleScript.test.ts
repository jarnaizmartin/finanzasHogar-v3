import { describe, it, expect } from 'vitest';
import { loadGoogleIdentityServices, GIS_SRC } from './googleScript';

// En jsdom no se cargan recursos externos: la promesa queda pendiente (ni resuelve
// ni rechaza). Solo verificamos el efecto observable (inyección idempotente del
// <script>) y el cacheo de la promesa. El flujo real lo valida el founder en navegador.
describe('loadGoogleIdentityServices', () => {
  it('expone la URL oficial de GIS', () => {
    expect(GIS_SRC).toBe('https://accounts.google.com/gsi/client');
  });

  it('inyecta un único <script> de GIS y cachea la promesa (idempotente)', () => {
    const p1 = loadGoogleIdentityServices();
    p1.catch(() => {}); // evita unhandled rejection si jsdom dispara error
    const p2 = loadGoogleIdentityServices();
    p2.catch(() => {});

    expect(p1).toBe(p2); // misma promesa compartida entre llamadas concurrentes
    const scripts = document.querySelectorAll(`script[src="${GIS_SRC}"]`);
    expect(scripts.length).toBe(1); // no duplica el tag
  });
});
