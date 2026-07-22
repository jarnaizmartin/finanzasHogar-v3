// ─── Piezas compartidas por los tests ────────────────────────────────────────
// Solo para tests (no entra en el bundle: nadie de src/ la importa).

import { DARK } from './theme';
import type { Theme } from './theme';

/**
 * Timestamps de fixture. Las entidades de la app son `Timestamped`: en la vida
 * real las sella `wrapSetter` al escribir, así que un objeto de test que se
 * hace pasar por entidad guardada también los lleva.
 *
 * Valor fijo (2023-11-14) para que los tests sean deterministas. Se sobrescribe
 * poniendo createdAt/updatedAt DESPUÉS del spread cuando un test los necesite.
 */
export const TEST_STAMPS = {
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_000,
};

/**
 * Theme real para los tests que montan componentes.
 *
 * Antes cada test escribía a mano un objeto con los 3-9 tokens que usaba el
 * componente. Eso deja de compilar en cuanto el componente pasa su `T` a otro
 * (y además el test no se entera si un token desaparece del theme de verdad).
 */
export const TEST_THEME: Theme = DARK;
