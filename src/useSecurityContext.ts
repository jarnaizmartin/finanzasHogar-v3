import { createContext, useContext } from 'react';
import type { SecurityContextType } from './SecurityContext';

// El contexto y el hook viven aquí (no en SecurityContext.tsx, que exporta el
// componente SecurityProvider) para que Fast Refresh funcione: un fichero no
// debe exportar componentes junto a contexto/hook.
export const SecurityContext = createContext<SecurityContextType | null>(null);

export function useSecurityContext(): SecurityContextType {
  const ctx = useContext(SecurityContext);
  if (!ctx)
    throw new Error(
      'useSecurityContext debe usarse dentro de <SecurityProvider>'
    );
  return ctx;
}
