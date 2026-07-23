// ─── Prueba de humo del BUCLE NÚCLEO ─────────────────────────────────────────
//
// La PRIMERA prueba del proyecto que arranca la aplicación de verdad (el mismo
// árbol que monta App.tsx) en vez de comprobar una función suelta.
//
// Por qué existe (s.73): los 1167 tests anteriores cubren funciones puras de
// `src/lib`, y NINGUNO de los bugs de las sesiones 71-73 vivía ahí. Vivían en
// el cableado — un helper leyendo la clave equivocada, un componente que tira
// una prop, un coachmark anclado al elemento que no era, categorías sin `type`
// que dejaban los selectores vacíos. Nada ejecutaba la app entera, así que
// nada podía verlos.
//
// ⚠️ Los modales se portean a document.body: hay que consultarlos con `screen`,
// NUNCA con el `container` de render (esto ya mordió en la s.56 y la s.71).
//
// No sustituye a mirar la pantalla en un navegador. Sustituye a no tener nada.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../contexts/ToastProvider';
import { SecurityProvider } from '../SecurityContext';
import { SecureAppGate } from '../components/SecureAppGate';
import { LicenseProvider } from '../LicenseContext';

type User = ReturnType<typeof userEvent.setup>;

/** El mismo árbol que monta App.tsx. */
function renderApp() {
  return render(
    <LicenseProvider>
      <ToastProvider>
        <SecurityProvider>
          <SecureAppGate />
        </SecurityProvider>
      </ToastProvider>
    </LicenseProvider>
  );
}

/** Las transiciones del arranque son animadas: hay que dejarlas terminar. */
const settle = () => new Promise((r) => setTimeout(r, 350));

async function pulsar(user: User, texto: string) {
  const el = screen.getByText(texto);
  await user.click(el.closest('button') ?? el);
  await settle();
}

/** Deja la app configurada con DATOS REALES (no Modo Prueba). */
async function completarArranque(user: User) {
  await pulsar(user, 'Español');
  await pulsar(user, 'Continuar');
  await pulsar(user, 'Prefiero no decirlo ahora');
  await pulsar(user, 'EUR');
  await pulsar(user, 'Continuar');
  await pulsar(user, 'Con mis datos');
  await pulsar(user, 'Continuar');
  for (const c of screen.getAllByRole('checkbox')) await user.click(c);
  await pulsar(user, 'Empezar');
}

/** Estado de un usuario que ya pasó bienvenida y arranque. */
function yaConfigurado() {
  localStorage.setItem('fh_tour_completed', 'true');
  localStorage.setItem('fh_onboarded', 'true');
  localStorage.setItem('fh_base_currency', JSON.stringify('EUR'));
  localStorage.setItem('fh_currency', JSON.stringify('EUR'));
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
afterEach(() => localStorage.clear());

describe('Bucle núcleo · 1 · la puerta de entrada', () => {
  it('la bienvenida se puede completar y desemboca en el arranque', async () => {
    const user = userEvent.setup();
    renderApp();

    // Diapositivas de bienvenida. Si una se rompe, NADIE puede entrar nunca en
    // la aplicación: por eso se recorren enteras en vez de saltárselas.
    for (let i = 0; i < 8; i++) {
      const siguiente =
        screen.queryByText('Siguiente →') ?? screen.queryByText('¡Lo quiero! →');
      if (!siguiente) break;
      await user.click(siguiente.closest('button') ?? siguiente);
      await settle();
    }

    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(localStorage.getItem('fh_tour_completed')).toBe('true');
  }, 30000);

  it('el arranque con datos reales deja al usuario DENTRO y en modo real', async () => {
    localStorage.setItem('fh_tour_completed', 'true');
    const user = userEvent.setup();
    renderApp();

    await completarArranque(user);

    await waitFor(() => expect(screen.queryByText('Español')).not.toBeInTheDocument());
    expect(localStorage.getItem('fh_onboarded')).toBe('true');
    // Bug s.72 (Modo Prueba, trampa sin salida): elegir "Con mis datos" no
    // puede dejar la app dentro del sandbox de la demo.
    expect(localStorage.getItem('fh_mode')).not.toBe('demo');
    expect(localStorage.getItem('fh_demo_onboarded')).toBeNull();
    // Y se entra al Resumen, con la navegación montada.
    expect(screen.getAllByText('Resumen').length).toBeGreaterThan(0);
  }, 30000);

  it('el arranque siembra categorías USABLES (todas con tipo ingreso/gasto)', async () => {
    localStorage.setItem('fh_tour_completed', 'true');
    const user = userEvent.setup();
    renderApp();

    await completarArranque(user);

    await waitFor(() => expect(localStorage.getItem('fh_categories')).not.toBeNull());
    const cats = JSON.parse(localStorage.getItem('fh_categories') as string);
    expect(cats.length).toBeGreaterThan(0);
    // Bug s.72: categorías sin `type` → los selectores de categoría salían
    // VACÍOS (movimientos y proyecciones filtran por tipo).
    for (const c of cats) expect(['income', 'expense']).toContain(c.type);
    expect(cats.some((c: { type: string }) => c.type === 'income')).toBe(true);
    expect(cats.some((c: { type: string }) => c.type === 'expense')).toBe(true);
  }, 30000);
});

describe('Bucle núcleo · 2 · crear la primera cuenta', () => {
  it('desde el empty state se abre el formulario y la cuenta queda guardada y visible', async () => {
    yaConfigurado();
    const user = userEvent.setup();
    renderApp();
    await settle();

    await pulsar(user, 'Cuentas');
    await pulsar(user, 'Crear primera cuenta');

    // ⚠️ El modal vive en un portal: se busca con screen, no en el container.
    const textos = screen.getAllByRole('textbox');
    expect(textos.length).toBeGreaterThan(0);
    await user.type(textos[0], 'Cuenta de prueba');

    const numeros = screen
      .getAllByRole('spinbutton')
      .filter((i) => !(i as HTMLInputElement).disabled);
    expect(numeros.length).toBeGreaterThan(0);
    await user.clear(numeros[0]);
    await user.type(numeros[0], '1500');

    await pulsar(user, 'Crear cuenta');

    // La cuenta existe de verdad, con su saldo, y sellada por el setter.
    await waitFor(() => {
      const raw = localStorage.getItem('fh_accounts');
      expect(raw).not.toBeNull();
      const accounts = JSON.parse(raw as string);
      expect(accounts).toHaveLength(1);
      expect(accounts[0].name).toBe('Cuenta de prueba');
      expect(accounts[0].balance).toBe(1500);
      expect(typeof accounts[0].createdAt).toBe('number');
    });

    // Y se ve en pantalla, no solo en localStorage.
    await waitFor(() => {
      expect(screen.getAllByText('Cuenta de prueba').length).toBeGreaterThan(0);
    });
  }, 30000);
});

describe('Bucle núcleo · 3 · lo que el usuario NO debe ver nunca', () => {
  it('el Resumen no muestra claves de traducción en crudo', async () => {
    yaConfigurado();
    renderApp();
    await settle();

    const texto = document.body.textContent ?? '';
    // Fuga típica: 'dashboard.algo.otro' impreso tal cual porque falta la clave.
    // (Los plurales _one/_other no cuentan: el mock de i18n de test-setup no
    // pluraliza, y eso es limitación del mock, no fallo de la app.)
    const claveCruda = texto.match(
      /\b(dashboard|appShell|projections|realExpenses|onboarding|common)\.[a-zA-Z]+\.[a-zA-Z]+/
    );
    expect(claveCruda?.[0] ?? null).toBeNull();
  }, 30000);
});
