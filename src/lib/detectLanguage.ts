// ─── detectLanguage.ts ───────────────────────────────────────────────────────
// Lógica pura: elige el idioma inicial de la app a partir del idioma guardado
// por el usuario y de las preferencias del navegador.
// Sin dependencias de i18n (evita ciclos): el caller pasa la lista de idiomas
// soportados y el fallback.
// ─────────────────────────────────────────────────────────────────────────────

/** Parte "base" de un tag de idioma: 'en-US' → 'en', 'pt-BR' → 'pt'. */
function baseOf(tag: string): string {
  return tag.toLowerCase().split('-')[0];
}

/**
 * Elige el idioma inicial:
 *  1. Si hay idioma guardado válido → ese (la elección explícita del usuario
 *     manda siempre sobre la detección).
 *  2. Si no, recorre los idiomas del navegador en orden y, para cada uno:
 *     a) coincidencia EXACTA de región (case-insensitive) → gana siempre.
 *        Distingue variantes del mismo idioma: 'pt-BR'→'pt-BR', 'pt-PT'→'pt-PT'.
 *     b) si no, coincidencia por base: 'en-US'→'en', 'fr-CA'→'fr', 'es-MX'→'es'.
 *        Un 'pt' a secas cae en la primera variante 'pt-*' soportada.
 *  3. Si nada coincide → fallback.
 */
export function pickInitialLang(
  saved: string | null | undefined,
  browserLangs: readonly string[],
  supported: readonly string[],
  fallback: string,
): string {
  if (saved && supported.includes(saved)) return saved;

  for (const raw of browserLangs) {
    if (!raw) continue;
    // (a) región exacta primero: respeta pt-BR vs pt-PT, en-US vs en-GB si existieran.
    const exact = supported.find((s) => s.toLowerCase() === raw.toLowerCase());
    if (exact) return exact;
    // (b) por base de idioma.
    const base = baseOf(raw);
    const hit = supported.find((s) => baseOf(s) === base);
    if (hit) return hit;
  }

  return fallback;
}

/**
 * Normaliza un idioma recibido por parámetro explícito (p. ej. `?lang=en` en la
 * URL de un enlace de invitación). Reutiliza el mismo emparejamiento que la
 * detección de navegador (región exacta → base). Devuelve el idioma soportado
 * o `null` si el parámetro no encaja con ninguno.
 *
 * Caso de uso: un enlace deep-link en un idioma debe abrir la app en ese idioma,
 * por encima de la detección del navegador.
 */
export function pickLangFromParam(
  param: string | null | undefined,
  supported: readonly string[],
): string | null {
  if (!param) return null;
  const match = pickInitialLang(null, [param], supported, '');
  return match || null;
}
