import { useCallback, useSyncExternalStore } from 'react';

/**
 * `true` cuando el viewport es <= breakpoint. Se apoya en `useSyncExternalStore`
 * (el mecanismo que React ofrece para suscribirse a una fuente externa) en vez
 * de un useEffect con setState: sin render extra al montar y sin riesgo de
 * "tearing". Antes disparaba react-hooks/set-state-in-effect.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const query = `(max-width: ${breakpoint}px)`;

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return () => {};
      }
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return false;
    if (typeof window.matchMedia === 'function') return window.matchMedia(query).matches;
    return window.innerWidth <= breakpoint;
  }, [query, breakpoint]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
