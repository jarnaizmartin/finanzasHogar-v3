import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  RealExpenseFormModal,
  type RealExpenseFormValues,
} from '../RealExpenseFormModal';
import { es } from '../../../i18n/es';

// Resolves dot-notation keys against the ES dictionary so tests
// verify user-visible Spanish strings, not internal key names.
function resolveKey(key: string): string {
  return key.split('.').reduce((obj: unknown, k) => (obj as Record<string, unknown>)?.[k], es as unknown) as string ?? key;
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: resolveKey }),
}));

// ── Mock contexto ────────────────────────────────────────────────────────
const T = {
  cardBg: '#fff', cardBorder: '#e5e7eb', cardShadowLg: '0 0 0',
  title: '#111', muted: '#666', body: '#333',
  pageBg: '#fafafa', accent: '#3b82f6', accentLight: '#dbeafe',
  green: '#16a34a', greenBg: '#dcfce7', greenBorder: '#86efac',
  red: '#dc2626', redBg: '#fee2e2', redBorder: '#fca5a5',
  amber: '#d97706', amberBg: '#fef3c7', amberBorder: '#fcd34d',
  btnSecBg: '#f3f4f6',
  inputBg: '#fff', inputText: '#111', inputBorder: '#d1d5db',
};

vi.mock('../../../AppContext', () => ({
  useApp: () => ({
    T,
    accounts: [
      { id: 'acc1', name: 'Cuenta Principal', currency: 'EUR' },
      { id: 'acc2', name: 'Cuenta USD', currency: 'USD' },
    ],
    categories: [
      { id: 'cat1', name: 'Alimentación', type: 'expense' },
      { id: 'cat2', name: 'Ocio', type: 'expense' },
      { id: 'cat3', name: 'Salario', type: 'income' },
    ],
    baseCurrency: 'EUR',
    dateFormat: 'dmy',
  }),
}));

// Mock UI ligero
vi.mock('../../UI', () => ({
  Field: ({ label, error, children }: any) => (
    <div>
      <label>{label}</label>
      {children}
      {error && <span data-testid="field-error">{error}</span>}
    </div>
  ),
  Input: (props: any) => <input {...props} />,
  Sel: ({ children, ...props }: any) => <select {...props}>{children}</select>,
  PrimaryBtn: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  SecondaryBtn: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  QuickCategoryModal: ({ onSave, onClose }: any) => (
    <div data-testid="quick-category-modal">
      <button onClick={() => onSave({ id: 'newCat', name: 'Nueva' })}>
        save-quick-cat
      </button>
      <button onClick={onClose}>close-quick-cat</button>
    </div>
  ),
}));

// ── Helpers ──────────────────────────────────────────────────────────────
const baseValues: RealExpenseFormValues = {
  entryDate: '2025-01-15',
  valueDate: '2025-01-15',
  description: 'Test movimiento',
  categoryId: 'cat1',
  amount: '42.50',
  currency: 'EUR',
  type: 'expense',
  accountId: 'acc1',
  notes: '',
};

const emptyValues: RealExpenseFormValues = {
  entryDate: '',
  valueDate: '',
  description: '',
  categoryId: '',
  amount: '',
  currency: 'EUR',
  type: 'expense',
  accountId: '',
  notes: '',
};

const renderModal = (
  overrides: Partial<{
    mode: 'add' | 'edit';
    initialValues: RealExpenseFormValues;
    onSave: ReturnType<typeof vi.fn>;
    onClose: ReturnType<typeof vi.fn>;
  }> = {}
) => {
  const props = {
    mode: 'add' as const,
    initialValues: baseValues,
    onSave: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  render(<RealExpenseFormModal {...props} />);
  return props;
};

// ── Tests ────────────────────────────────────────────────────────────────
describe('RealExpenseFormModal', () => {
  describe('Render según modo', () => {
    it('muestra título "Nuevo movimiento" en modo add', () => {
      renderModal({ mode: 'add' });
      expect(screen.getByText('Nuevo movimiento')).toBeInTheDocument();
    });

    it('muestra título "Editar movimiento" en modo edit', () => {
      renderModal({ mode: 'edit' });
      expect(screen.getByText('Editar movimiento')).toBeInTheDocument();
    });

    it('renderiza con los initialValues pre-cargados', () => {
      renderModal({ initialValues: baseValues });
      expect(screen.getByDisplayValue('Test movimiento')).toBeInTheDocument();
      expect(screen.getByDisplayValue('42.50')).toBeInTheDocument();
    });
  });

  describe('Selector de tipo', () => {
    it('muestra ambas opciones Ingreso y Gasto', () => {
      renderModal();
      expect(screen.getByText('Ingreso')).toBeInTheDocument();
      expect(screen.getByText('Gasto')).toBeInTheDocument();
    });

    it('cambiar a Ingreso filtra las categorías por tipo', () => {
      renderModal({ initialValues: { ...baseValues, type: 'expense' } });
      // Inicialmente vemos categorías de gasto
      expect(screen.getByText('Alimentación')).toBeInTheDocument();
      // Click en Ingreso
      fireEvent.click(screen.getByText('Ingreso'));
      // Ahora debería aparecer Salario (income)
      expect(screen.getByText('Salario')).toBeInTheDocument();
    });
  });

  describe('Cambio de cuenta', () => {
    it('cambiar de cuenta actualiza la divisa automáticamente', () => {
      renderModal({ initialValues: baseValues });
      const accountSelect = screen.getByDisplayValue('Cuenta Principal');
      fireEvent.change(accountSelect, { target: { value: 'acc2' } });
      // La divisa debería pasar a USD (visible en el select de divisa)
      const usdOption = screen.getByRole('option', { name: /\$\s*USD/ }) as HTMLOptionElement;
      expect(usdOption.selected).toBe(true);
    });
  });

  describe('Validación', () => {
    it('NO llama a onSave si faltan campos obligatorios', () => {
      const onSave = vi.fn();
      renderModal({ initialValues: emptyValues, onSave });
      fireEvent.click(screen.getByText(/Guardar movimiento/i));
      expect(onSave).not.toHaveBeenCalled();
    });

    it('muestra errores cuando se intenta guardar formulario vacío', () => {
      renderModal({ initialValues: emptyValues });
      fireEvent.click(screen.getByText(/Guardar movimiento/i));
      const errors = screen.getAllByTestId('field-error');
      expect(errors.length).toBeGreaterThanOrEqual(4);
    });

    it('NO llama a onSave si importe es 0 o negativo', () => {
      const onSave = vi.fn();
      renderModal({
        initialValues: { ...baseValues, amount: '0' },
        onSave,
      });
      fireEvent.click(screen.getByText(/Guardar movimiento/i));
      expect(onSave).not.toHaveBeenCalled();
    });

    it('llama a onSave con los valores cuando el form es válido', () => {
      const onSave = vi.fn();
      renderModal({ initialValues: baseValues, onSave });
      fireEvent.click(screen.getByText(/Guardar movimiento/i));
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Test movimiento',
          amount: '42.50',
          accountId: 'acc1',
          categoryId: 'cat1',
        })
      );
    });
  });

  describe('Edición de campos', () => {
    it('actualiza la descripción al escribir', () => {
      const onSave = vi.fn();
      renderModal({ initialValues: baseValues, onSave });
      const descInput = screen.getByDisplayValue('Test movimiento');
      fireEvent.change(descInput, { target: { value: 'Nuevo texto' } });
      fireEvent.click(screen.getByText(/Guardar movimiento/i));
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Nuevo texto' })
      );
    });

    it('actualiza el importe al escribir', () => {
      const onSave = vi.fn();
      renderModal({ initialValues: baseValues, onSave });
      const amountInput = screen.getByDisplayValue('42.50');
      fireEvent.change(amountInput, { target: { value: '99.99' } });
      fireEvent.click(screen.getByText(/Guardar movimiento/i));
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ amount: '99.99' })
      );
    });

    it('actualiza las notas al escribir', () => {
      const onSave = vi.fn();
      renderModal({ initialValues: baseValues, onSave });
      const notesInput = screen.getByPlaceholderText(/Añade una nota/i);
      fireEvent.change(notesInput, { target: { value: 'Nota de prueba' } });
      fireEvent.click(screen.getByText(/Guardar movimiento/i));
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ notes: 'Nota de prueba' })
      );
    });
  });

  describe('Cierre del modal', () => {
    it('llama a onClose al pulsar Cancelar', () => {
      const onClose = vi.fn();
      renderModal({ onClose });
      fireEvent.click(screen.getByText('Cancelar'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('llama a onClose al pulsar el botón X', () => {
      const onClose = vi.fn();
      renderModal({ onClose });
      // El X es el primer botón sin texto (solo icono)
      const buttons = screen.getAllByRole('button');
      // Buscar el que no tiene texto reconocible
      const closeBtn = buttons.find((b) => b.textContent === '');
      expect(closeBtn).toBeDefined();
      fireEvent.click(closeBtn!);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Quick category modal', () => {
    it('NO se muestra inicialmente', () => {
      renderModal();
      expect(screen.queryByTestId('quick-category-modal')).not.toBeInTheDocument();
    });

    it('se abre al pulsar el botón "+" de categoría', () => {
      renderModal();
      fireEvent.click(screen.getByText('+'));
      expect(screen.getByTestId('quick-category-modal')).toBeInTheDocument();
    });

    it('al guardar una categoría rápida, se selecciona automáticamente', () => {
      const onSave = vi.fn();
      renderModal({ initialValues: baseValues, onSave });
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('save-quick-cat'));
      // El modal quick se cierra
      expect(screen.queryByTestId('quick-category-modal')).not.toBeInTheDocument();
      // Y la nueva categoría queda seleccionada
      fireEvent.click(screen.getByText(/Guardar movimiento/i));
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 'newCat' })
      );
    });

    it('se cierra al pulsar el botón de cerrar', () => {
      renderModal();
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('close-quick-cat'));
      expect(screen.queryByTestId('quick-category-modal')).not.toBeInTheDocument();
    });
  });
});
