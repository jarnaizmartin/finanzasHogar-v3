import { useId } from 'react';

/**
 * Logo de marca FinNort — monograma N+F en espejo (R3 · «híbrido barras sólidas»).
 * Se lee F → N de izquierda a derecha; el palo es un haz de luz (guiño «norte»).
 * Tile redondeado navy + glow + rim light. Mismo dibujo que `public/favicon.svg`
 * y que los PNG de `public/android-chrome-*`.
 *
 * IDs de gradiente únicos por instancia (useId) para poder pintar varios logos
 * en la misma página sin colisión de `id`.
 */
export function BrandLogo({
  size = 36,
  title = 'FinNort',
}: {
  size?: number;
  title?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const deep = `fnDeep-${uid}`;
  const beacon = `fnBeacon-${uid}`;
  const bar = `fnBar-${uid}`;
  const tile = `fnTile-${uid}`;
  const edge = `fnEdge-${uid}`;
  const glow = `fnGlow-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label={title}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={deep} gradientUnits="userSpaceOnUse" x1="100" y1="48" x2="100" y2="152">
          <stop offset="0" stopColor="#1f7791" />
          <stop offset="1" stopColor="#0a3a4d" />
        </linearGradient>
        <linearGradient id={beacon} gradientUnits="userSpaceOnUse" x1="105" y1="48" x2="105" y2="152">
          <stop offset="0" stopColor="#f2feff" />
          <stop offset=".3" stopColor="#8beefb" />
          <stop offset="1" stopColor="#0c7f9c" />
        </linearGradient>
        <linearGradient id={bar} gradientUnits="userSpaceOnUse" x1="100" y1="48" x2="100" y2="152">
          <stop offset="0" stopColor="#cbf7ff" />
          <stop offset=".5" stopColor="#3fddf2" />
          <stop offset="1" stopColor="#18aacb" />
        </linearGradient>
        <linearGradient id={tile} gradientUnits="userSpaceOnUse" x1="14" y1="14" x2="186" y2="186">
          <stop offset="0" stopColor="#12253c" />
          <stop offset="1" stopColor="#070d16" />
        </linearGradient>
        <linearGradient id={edge} gradientUnits="userSpaceOnUse" x1="100" y1="6" x2="100" y2="194">
          <stop offset="0" stopColor="#33607f" />
          <stop offset="1" stopColor="#0a1826" />
        </linearGradient>
        <radialGradient id={glow} gradientUnits="userSpaceOnUse" cx="100" cy="90" r="82">
          <stop offset="0" stopColor="#22d3ee" stopOpacity=".26" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="6" y="6" width="188" height="188" rx="44" fill={`url(#${tile})`} />
      <rect x="6" y="6" width="188" height="188" rx="44" fill={`url(#${glow})`} />
      <g strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M159,146 L159,54 L105,146" stroke={`url(#${deep})`} />
        <path d="M105,146 L105,54" stroke={`url(#${beacon})`} />
        <path d="M77,54 L41,54" stroke={`url(#${bar})`} />
        <path d="M77,96 L56,96" stroke={`url(#${bar})`} />
      </g>
      <rect x="7" y="7" width="186" height="186" rx="43" fill="none" stroke={`url(#${edge})`} strokeWidth="2" />
    </svg>
  );
}
