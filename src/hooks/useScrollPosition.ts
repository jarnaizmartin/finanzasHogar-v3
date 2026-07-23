import { useEffect, useState, type RefObject } from 'react';

function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node: HTMLElement | null = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    if (
      (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

/**
 * Devuelve el índice (1-based) aproximado donde está el scroll, mapeando
 * la posición del contenedor de la lista al rango [1..total].
 * Funciona tanto con scroll en window como en un scroll container interno.
 */
export function useScrollPosition(
  containerRef: RefObject<HTMLElement>,
  total: number
): number {
  const [current, setCurrent] = useState(1);

  useEffect(() => {
    // Con lista vacía no hay nada que medir: el índice mostrado (0) se deriva
    // en el return, no se escribe en estado desde el efecto.
    if (total === 0) return;
    const el = containerRef.current;
    if (!el) return;

    const scrollParent = findScrollParent(el);
    const scrollTarget: EventTarget = scrollParent ?? window;

    const compute = () => {
      const node = containerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();

      const viewportTop = scrollParent
        ? scrollParent.getBoundingClientRect().top
        : 0;
      const viewportH = scrollParent
        ? scrollParent.clientHeight
        : window.innerHeight;

      const listTopRel = rect.top - viewportTop;
      const listHeight = rect.height;
      const anchor = viewportH * 0.33;
      const scrolled = anchor - listTopRel;
      const progress = Math.max(
        0,
        Math.min(1, scrolled / Math.max(1, listHeight))
      );
      const idx = Math.max(
        1,
        Math.min(total, Math.round(progress * total) || 1)
      );
      setCurrent(idx);
    };

    compute();
    scrollTarget.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      scrollTarget.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, [containerRef, total]);

  return total === 0 ? 0 : Math.min(current, total);
}
