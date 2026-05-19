import { useEffect, useState } from 'react';
import {
  isHydrated,
  subscribeHydrationChange,
  hasVault,
} from '../lib/encryptedStorage';

/**
 * Suscribe el componente al estado de hidratación del cache cifrado.
 * Re-renderiza cuando cambia (unlock → true, lock → false).
 */
export function useHydration(): boolean {
  const [hydrated, setHydrated] = useState<boolean>(() => isHydrated());
  useEffect(() => subscribeHydrationChange(setHydrated), []);
  return hydrated;
}

/**
 * True si el usuario tiene vault y los datos ya están listos para leer.
 * True (trivialmente) si NO tiene vault (datos en claro, lectura inmediata).
 */
export function useDataReady(): boolean {
  const hydrated = useHydration();
  if (!hasVault()) return true;
  return hydrated;
}
