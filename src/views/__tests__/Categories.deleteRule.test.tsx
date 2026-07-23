// Borrado de reglas de auto-categorización.
//
// Bug encontrado en la s.73 al limpiar el lint: el botón 🗑️ de cada regla
// escribía en un estado (`confirmDeleteRule`) que NADIE leía. No aparecía
// confirmación y la regla no se borraba: el botón no hacía nada. Los textos
// (`categories.rules.confirmDelete*`, `toastDeleted`) llevaban traducidos a
// los 6 idiomas desde el principio — el modal simplemente nunca se escribió.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Categories } from '../Categories';
import { ToastProvider } from '../../contexts/ToastProvider';
import { TEST_STAMPS, TEST_THEME } from '../../test-fixtures';
import { es } from '../../i18n/es';
import type { CategoryRule } from '../../types';

const REGLA: CategoryRule = {
  ...TEST_STAMPS,
  id: 'rule-1',
  categoryId: 'cat-1',
  keywords: ['mercadona', 'super'],
};

const deleteCategoryRule = vi.fn();

vi.mock('../../AppContext', () => ({
  useApp: () => ({
    T: TEST_THEME,
    categories: [
      { ...TEST_STAMPS, id: 'cat-1', name: 'Alimentación', type: 'expense', color: '#f00' },
    ],
    setCategories: vi.fn(),
    deleteCategory: vi.fn(),
    projections: [],
    realExpenses: [],
    goals: [],
    categoryRules: [REGLA],
    setCategoryRules: vi.fn(),
    deleteCategoryRule,
  }),
}));

const t = es.categories.rules;

describe('Categories · borrar una regla de auto-categorización', () => {
  beforeEach(() => deleteCategoryRule.mockClear());
  afterEach(() => vi.clearAllMocks());

  it('pide confirmación y borra la regla por la API del contexto', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Categories />
      </ToastProvider>
    );

    // Abrir el modal de reglas y comprobar que la regla está listada.
    await user.click(screen.getByText(t.btn));
    expect(await screen.findByText('mercadona, super')).toBeInTheDocument();

    // El 🗑️ de la regla es el segundo botón de su fila (el 1º es editar).
    const fila = screen.getByText('mercadona, super').parentElement!.parentElement!;
    const botones = fila.querySelectorAll('button');
    await user.click(botones[botones.length - 1]);

    // ANTES no pasaba nada: ni confirmación, ni borrado.
    expect(await screen.findByText(t.confirmDeleteTitle)).toBeInTheDocument();
    expect(deleteCategoryRule).not.toHaveBeenCalled();

    await user.click(screen.getByText(es.common.delete));

    await waitFor(() => {
      expect(deleteCategoryRule).toHaveBeenCalledWith('rule-1');
    });
  });

  it('cancelar no borra nada', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Categories />
      </ToastProvider>
    );

    await user.click(screen.getByText(t.btn));
    const fila = (await screen.findByText('mercadona, super')).parentElement!.parentElement!;
    const botones = fila.querySelectorAll('button');
    await user.click(botones[botones.length - 1]);

    await user.click(await screen.findByText(es.common.cancel));

    await waitFor(() => {
      expect(screen.queryByText(t.confirmDeleteTitle)).not.toBeInTheDocument();
    });
    expect(deleteCategoryRule).not.toHaveBeenCalled();
  });
});
