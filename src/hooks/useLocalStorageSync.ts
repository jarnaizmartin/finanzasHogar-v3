import { useEffect, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';

// ✅ FIX 15 — Sincronización entre pestañas del navegador.
// Si el usuario abre la app en dos pestañas y modifica datos en una,
// la otra se quedaría con datos desactualizados.
//
// F4.3 — Antes hacíamos window.location.reload() automático, pero eso
// pisaba lo que el usuario estuviera editando en ese momento. Ahora
// mostramos un toast persistente avisando del cambio y dejamos que sea
// el usuario quien decida cuándo recargar (cuando haya guardado lo suyo).

const WATCHED_KEYS = [
  'fh_accounts',
  'fh_categories',
  'fh_projections',
  'fh_real_expenses',
  'fh_goals',
  'fh_bank_formats',
  'fh_category_rules',
  'fh_base_currency',
  'fh_currency',
  'fh_dark',
];

export function useLocalStorageSync() {
  const toast = useToast();
  const warnedRef = useRef(false);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      // Solo reacciona a claves de la app
      if (!e.key || !WATCHED_KEYS.includes(e.key)) return;
      // Solo si el valor realmente cambió
      if (e.oldValue === e.newValue) return;
      // Evitar avisar repetidamente en la misma sesión (un solo aviso basta)
      if (warnedRef.current) return;

      warnedRef.current = true;
      console.info(
        `[LocalStorageSync] Cambio detectado en otra pestaña (${e.key}).`
      );

      toast(
        '⚠️ Has modificado datos en otra pestaña. Recarga esta página cuando hayas terminado lo que estás haciendo aquí para ver los cambios sincronizados.',
        'warning'
      );
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [toast]);
}
