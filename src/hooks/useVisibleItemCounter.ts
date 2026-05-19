import { useEffect, useState, type RefObject } from 'react';

/**
 * Devuelve el índice (1-based) del primer elemento visible dentro
 * de un contenedor con scroll de página. Usa IntersectionObserver
 * sobre los hijos directos del contenedor.
 *
 * @param containerRef Ref al contenedor que envuelve la lista
 * @param total Número total de elementos (para resetear cuando cambia)
 */
export function useVisibleItemCounter(
  containerRef: RefObject<HTMLElement>,
  total: number
): number {
  const [current, setCurrent] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || total === 0) {
      setCurrent(0);
      return;
    }

    const items = Array.from(container.children) as HTMLElement[];
    if (items.length === 0) {
      setCurrent(0);
      return;
    }

    const visibility = new Map<number, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = items.indexOf(entry.target as HTMLElement);
          if (idx >= 0) visibility.set(idx, entry.intersectionRatio);
        });
        // Primer elemento con visibilidad > 10% empezando por arriba
        for (let i = 0; i < items.length; i++) {
          if ((visibility.get(i) ?? 0) > 0.1) {
            setCurrent(i + 1);
            return;
          }
        }
      },
      { threshold: [0, 0.1, 0.5, 1] }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [containerRef, total]);

  return current;
}
