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
 *  2. Si no, el primer idioma del navegador cuya base coincida con un soportado.
 *     Ej: 'en-US'→'en', 'fr-CA'→'fr', 'pt-PT'/'pt-BR'→'pt-BR', 'es-MX'→'es'.
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
    const base = baseOf(raw);
    const hit = supported.find((s) => baseOf(s) === base);
    if (hit) return hit;
  }

  return fallback;
}
