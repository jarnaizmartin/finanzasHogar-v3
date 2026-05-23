import { useState, useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import {
  shouldEncrypt,
  hasVault,
  getEncryptedItem,
  setEncryptedItem,
  isHydrated,
  subscribeHydrationChange,
} from '../lib/encryptedStorage';

// ✅ FIX 9 — Extraído de AppProvider para ser compartido por todos los sub-contextos
//
// ⚠️ S.2 — Este hook ahora soporta DOS modos según `shouldEncrypt(key)`:
//
//   • CLARO (claves no sensibles, ej: fh_dark, fh_security):
//     Lee/escribe directamente en localStorage como antes.
//
//   • CIFRADO (claves sensibles, ej: fh_accounts, fh_real_expenses):
//     Usa el cache síncrono de encryptedStorage. La VMK debe estar activa
//     (usuario desbloqueado) para que devuelva valores reales. Si la cache
//     no está hidratada (app bloqueada o sin seguridad), devuelve `fallback`
//     y el componente se re-renderiza automáticamente cuando se hidrate.
export function useLocalStorage<T>(
  key: string,
  fallback: T
): [T, Dispatch<SetStateAction<T>>] {
  // ⚠️ S.2 — Solo activamos el camino cifrado si la clave es candidata
  // Y el usuario tiene VMK envuelta (i.e., usa el sistema S.2).
  // Usuarios LEGACY (security.configured=true pero sin VMK) van en CLARO
  // hasta que la migración silenciosa de S.2.6 les genere una VMK.
  const encrypted = shouldEncrypt(key) && hasVault();

  // ── Lectura inicial (síncrona) ────────────────────────────────────────────
  const [value, setValue] = useState<T>(() => {
    try {
      if (encrypted) {
        // Si la cache aún no está hidratada, devolvemos fallback.
        // Cuando la VMK se active, el listener actualizará el estado.
        if (!isHydrated()) return fallback;
        const stored = getEncryptedItem(key);
        if (stored === null) return fallback;
        return JSON.parse(stored) as T;
      } else {
        const stored = localStorage.getItem(key);
        if (stored === null) return fallback;
        return JSON.parse(stored) as T;
      }
    } catch {
      console.warn(
        `[useLocalStorage] Error leyendo "${key}", usando fallback.`
      );
      return fallback;
    }
  });

  // ── Re-render al hidratarse / deshidratarse el cache ─────────────────────
  // Solo aplica a claves cifradas. Cuando el usuario hace unlock, la cache
  // se llena → re-leemos. Cuando hace lock, la cache se vacía → re-leemos
  // (devolverá fallback hasta el próximo unlock).
  //
  // ⚠️ Para evitar pisar escrituras locales recientes, solo actualizamos si
  // el valor leído del cache realmente difiere del estado actual.
  // Mismo patrón deliberado que en AppProvider/useExchangeRates: el ref
  // se sincroniza durante render para que el useEffect de hidratación
  // (con deps mínimas) pueda comparar contra el valor más reciente sin
  // recrear la suscripción. Validado empíricamente.
  const valueRef = useRef(value);
  // eslint-disable-next-line react-hooks/refs
  valueRef.current = value;

  useEffect(() => {
    if (!encrypted) return;
    const unsubscribe = subscribeHydrationChange((hydrated) => {
      try {
        if (!hydrated) {
          // Cache vacía → reset al fallback (lock)
          setValue(fallback);
          return;
        }
        const stored = getEncryptedItem(key);
        const parsed = stored === null ? fallback : (JSON.parse(stored) as T);
        // Comparación superficial por JSON para evitar loops innecesarios
        if (JSON.stringify(parsed) !== JSON.stringify(valueRef.current)) {
          setValue(parsed);
        }
      } catch {
        console.warn(`[useLocalStorage] Error tras hidratación de "${key}".`);
      }
    });
    return unsubscribe;
    // `fallback` y `key` no deben cambiar en runtime; los omitimos para
    // mantener una sola suscripción estable durante la vida del hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encrypted]);

  // ── Persistencia en cada cambio ───────────────────────────────────────────
  // ⚠️ CRÍTICO: en modo cifrado, NO escribimos hasta que el cache esté
  // hidratado. De lo contrario, persistiríamos el `fallback` (ej. `[]`)
  // sobre los datos reales que aún no se han descifrado del disco.
  // Esta es la causa raíz de la pérdida silenciosa de datos al arrancar
  // con la app bloqueada.
  useEffect(() => {
    try {
      const serialized = JSON.stringify(value);
      if (encrypted) {
        if (!isHydrated()) {
          // Cache aún no lista (pre-unlock o lock). NO persistir.
          // Cuando el usuario haga unlock, la hidratación traerá los datos
          // reales y el siguiente cambio del usuario sí se persistirá.
          return;
        }
        setEncryptedItem(key, serialized);
      } else {
        localStorage.setItem(key, serialized);
      }
    } catch {
      console.warn(`[useLocalStorage] Error escribiendo "${key}".`);
    }
  }, [key, value, encrypted]);

  return [value, setValue];
}
