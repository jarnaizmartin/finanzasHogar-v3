import type { CSSProperties } from 'react';
import { APP_NAME } from '../config/app';

/**
 * Wordmark de marca «FinNort» — las consonantes que resalta el logo (F y N,
 * las dos MAYÚSCULAS del nombre) van en el teal de marca; el resto en blanco
 * (o el color base que se pase). La `t` final va en minúscula a propósito: el
 * monograma del logo deja la T fuera, así que solo se realzan F y N.
 *
 * Cualquier letra mayúscula del nombre se pinta con `accent`; el resto con `base`.
 */
export function BrandWordmark({
  name = APP_NAME,
  accent,
  base,
  style,
}: {
  name?: string;
  accent: string;
  base: string;
  style?: CSSProperties;
}) {
  return (
    <span style={{ color: base, ...style }} aria-label={name}>
      {name.split('').map((ch, i) => (
        <span key={i} style={/[A-Z]/.test(ch) ? { color: accent } : undefined}>
          {ch}
        </span>
      ))}
    </span>
  );
}
