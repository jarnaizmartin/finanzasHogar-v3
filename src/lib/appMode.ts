// ─── appMode — Modo Prueba con aislamiento por prefijo (spec 12 §5.H) ────────
//
// La app puede correr en dos modos, controlados por el flag `fh_mode`:
//   • 'real' (por defecto): tus datos, claves `fh_*`.
//   • 'demo' (Modo Prueba): datos de ejemplo, claves `fh_demo_*`.
//
// Garantía de aislamiento: en Modo Prueba, las claves de DATOS se leen/escriben
// con el prefijo `fh_demo_`. Los datos reales NO se tocan jamás mientras
// exploras. El resto de preferencias (idioma, tema, divisa, seguridad, licencia,
// sync) se comparten deliberadamente — el demo respeta tu idioma y tu moneda.
//
// El cambio de modo fuerza un `location.reload()` para que TODOS los providers
// se reinicialicen leyendo el prefijo correcto (mismo patrón robusto que
// resetApp). Dentro de un mismo ciclo de vida el modo es constante, así que la
// clave efectiva de cada hook es estable.
// ─────────────────────────────────────────────────────────────────────────────

import i18next from 'i18next';
import { buildDemoData } from './demoData';

export type AppMode = 'real' | 'demo';

const MODE_KEY = 'fh_mode';
const DEMO_PREFIX = 'fh_demo_';

// Claves de DATOS que se aíslan en Modo Prueba. Todo lo demás se comparte.
// (Incluye `fh_onboarded[_at]` para que el demo se muestre como "onboarded" sin
// tocar el estado real de onboarding del usuario.)
const PREFIXABLE: ReadonlySet<string> = new Set([
  'fh_accounts',
  'fh_categories',
  'fh_projections',
  'fh_real_expenses',
  'fh_goals',
  'fh_bank_formats',
  'fh_category_rules',
  'fh_ignored_alerts',
  'fh_onboarded',
  'fh_onboarded_at',
]);

// Las que además necesitamos sembrar al entrar (además de las de datos).
const DATA_KEYS = [
  'fh_accounts',
  'fh_categories',
  'fh_projections',
  'fh_real_expenses',
  'fh_goals',
  'fh_bank_formats',
  'fh_category_rules',
] as const;

/**
 * Modo actual de la app (default 'real').
 *
 * 🩹 Auto-curación (s.72): el Modo Prueba SOLO es válido si el sandbox está
 * realmente sembrado (`fh_demo_onboarded` presente). Un `fh_mode='demo'` con el
 * sandbox vacío es un estado ROTO —típico de iOS Safari, que puede perder una
 * escritura de localStorage justo en el `reload` de `enterDemo`: sobrevive el
 * flag pero no la siembra—. Si arrancáramos en 'demo' con ese estado, el gate
 * leería `onboarded=false` y mostraría el onboarding DENTRO de demo: el usuario
 * queda atrapado (rebota al idioma y, al reintentar, todo se vuelca al sandbox).
 * En ese caso reportamos 'real': la app arranca limpia y escapable.
 * (Función pura: no reescribe el flag durante el render; se corrige solo en el
 * próximo enter/exit/reset.)
 */
export function getMode(): AppMode {
  try {
    if (localStorage.getItem(MODE_KEY) !== 'demo') return 'real';
    return demoSeeded() ? 'demo' : 'real';
  } catch {
    return 'real';
  }
}

/** ¿Estamos en Modo Prueba? */
export function isDemoMode(): boolean {
  return getMode() === 'demo';
}

/**
 * Traduce una clave base a la clave efectiva según el modo. En Modo Prueba, las
 * claves de datos reciben el prefijo `fh_demo_`; el resto se devuelve tal cual.
 * useLocalStorage la consume para que todo el árbol de datos apunte al sandbox.
 */
export function keyFor(base: string): string {
  if (getMode() === 'demo' && PREFIXABLE.has(base)) {
    return DEMO_PREFIX + base.slice('fh_'.length);
  }
  return base;
}

// ── Siembra / limpieza del sandbox demo ──────────────────────────────────────

function readBaseCurrency(): string {
  try {
    const raw = localStorage.getItem('fh_base_currency');
    return raw ? (JSON.parse(raw) as string) : 'EUR';
  } catch {
    return 'EUR';
  }
}

function demoKey(base: string): string {
  return DEMO_PREFIX + base.slice('fh_'.length);
}

/**
 * Escribe el dataset de ejemplo bajo las claves `fh_demo_*` (en claro). Si hay
 * vault, la hidratación tras el reload lo migrará a cifrado transparentemente.
 */
function seedDemo(): void {
  // La marca de "onboarded" va PRIMERO y aislada: es lo que decide el gate de
  // arranque. Aunque el volcado de datos falle luego (cuota de iOS Safari, modo
  // privado, etc.), el sandbox se considerará listo y la app arrancará en Modo
  // Prueba (con estados vacíos) en vez de REBOTAR al onboarding.
  try {
    localStorage.setItem(demoKey('fh_onboarded'), JSON.stringify(true));
    localStorage.setItem(demoKey('fh_onboarded_at'), JSON.stringify(Date.now()));
  } catch (err) {
    console.error('[appMode] No se pudo marcar el sandbox demo como onboarded:', err);
  }

  try {
    const currency = readBaseCurrency();
    const t = (k: string) => i18next.t(k) as string;
    const d = buildDemoData({ currency, t });
    const map: Record<(typeof DATA_KEYS)[number], unknown> = {
      fh_accounts: d.accounts,
      fh_categories: d.categories,
      fh_projections: d.projections,
      fh_real_expenses: d.realExpenses,
      fh_goals: d.goals,
      fh_bank_formats: d.bankFormats,
      fh_category_rules: d.categoryRules,
    };
    // Cada clave en su propio try: un fallo puntual no aborta el resto.
    for (const base of DATA_KEYS) {
      try {
        localStorage.setItem(demoKey(base), JSON.stringify(map[base]));
      } catch (err) {
        console.error(`[appMode] Fallo al sembrar ${base}:`, err);
      }
    }
  } catch (err) {
    console.error('[appMode] Error construyendo los datos demo:', err);
  }
}

/** Borra TODO el sandbox demo (`fh_demo_*`). No toca nada real. */
function clearDemoKeys(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(DEMO_PREFIX)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.error('[appMode] Error limpiando sandbox demo:', err);
  }
}

/**
 * ¿El sandbox demo está sembrado y ONBOARDED de verdad?
 * Requiere `fh_demo_onboarded === true` (no basta con que exista): un valor
 * `false` residual —p. ej. un reset que dejó la marca a false— significa que el
 * demo NO es navegable, y `getMode` debe caer a real para no mostrar el
 * onboarding DENTRO del sandbox (la trampa sin salida de la s.72).
 */
function demoSeeded(): boolean {
  try {
    const v = localStorage.getItem(demoKey('fh_onboarded'));
    return v !== null && JSON.parse(v) === true;
  } catch {
    return false;
  }
}

function reload(): void {
  try {
    window.location.reload();
  } catch {
    /* ignore */
  }
}

/**
 * Entra en Modo Prueba: siembra los datos de ejemplo si aún no existen, activa
 * el flag y recarga para que todo el árbol lea el sandbox.
 */
export function enterDemo(): void {
  if (!demoSeeded()) seedDemo();
  // Solo pasamos a Modo Prueba si el sandbox quedó realmente listo (marca
  // onboarded escrita). Si la siembra falló del todo, NO dejamos la app en un
  // estado demo-a-medias que rebota al onboarding: nos quedamos en modo real.
  if (!demoSeeded()) {
    console.error('[appMode] La siembra del Modo Prueba falló; permanezco en modo real.');
    return;
  }
  try {
    localStorage.setItem(MODE_KEY, 'demo');
  } catch {
    /* ignore */
  }
  reload();
}

/**
 * Sale del Modo Prueba y vuelve a los datos reales. El sandbox demo se conserva
 * por si el usuario vuelve a entrar.
 */
export function exitDemo(): void {
  try {
    localStorage.setItem(MODE_KEY, 'real');
  } catch {
    /* ignore */
  }
  reload();
}

/**
 * Regenera datos de ejemplo frescos (borra el sandbox y vuelve a sembrar).
 * Permanece en Modo Prueba. Como el sandbox está aislado, purgarlo no afecta a
 * nada real.
 */
export function resetDemo(): void {
  clearDemoKeys();
  seedDemo();
  try {
    localStorage.setItem(MODE_KEY, 'demo');
  } catch {
    /* ignore */
  }
  reload();
}
