import { describe, it, expect } from 'vitest';
import {
  parseDate,
  parseAmount,
  splitCSVLine,
  parseBankCSV,
} from '../bankCSVParser';
import type { BankFormat } from '../../types';

const baseFormat: BankFormat = {
  id: 'test',
  name: 'Test',
  isCustom: true,
  separator: ';',
  decimal: ',',
  encoding: 'utf-8',
  skipRows: 0,
  dateFormat: 'dd/mm/yyyy',
  amountMode: 'single',
  columns: ['date', 'description', 'amount'],
  negativeIsExpense: true,
  createdAt: 0,
  updatedAt: 0,
};

describe('bankCSVParser', () => {
  describe('parseDate', () => {
    it('parsea dd/mm/yyyy a ISO', () => {
      expect(parseDate('15/03/2024', 'dd/mm/yyyy')).toBe('2024-03-15');
    });

    it('parsea dd-mm-yyyy a ISO', () => {
      expect(parseDate('15-03-2024', 'dd-mm-yyyy')).toBe('2024-03-15');
    });

    it('parsea dd/mm/yy con prefijo 20', () => {
      expect(parseDate('15/03/24', 'dd/mm/yy')).toBe('2024-03-15');
    });

    it('parsea yyyy-mm-dd ya en ISO', () => {
      expect(parseDate('2024-03-15', 'yyyy-mm-dd')).toBe('2024-03-15');
    });

    it('padding de día y mes a 2 dígitos', () => {
      expect(parseDate('5/3/2024', 'dd/mm/yyyy')).toBe('2024-03-05');
    });

    it('elimina espacios en la entrada', () => {
      expect(parseDate(' 15/03/2024 ', 'dd/mm/yyyy')).toBe('2024-03-15');
    });

    it('devuelve cadena vacía si raw vacío', () => {
      expect(parseDate('', 'dd/mm/yyyy')).toBe('');
      expect(parseDate('   ', 'dd/mm/yyyy')).toBe('');
    });

    it('trunca yyyy-mm-dd a 10 caracteres', () => {
      expect(parseDate('2024-03-15T10:00:00', 'yyyy-mm-dd')).toBe('2024-03-15');
    });
  });

  describe('parseAmount', () => {
    it('parsea importe simple con decimal coma', () => {
      expect(parseAmount('1234,56', ',')).toBe(1234.56);
    });

    it('parsea importe simple con decimal punto', () => {
      expect(parseAmount('1234.56', '.')).toBe(1234.56);
    });

    it('elimina separador de miles (punto) en formato europeo', () => {
      expect(parseAmount('1.234,56', ',')).toBe(1234.56);
      expect(parseAmount('1.234.567,89', ',')).toBe(1234567.89);
    });

    it('elimina separador de miles (coma) en formato anglosajón', () => {
      expect(parseAmount('1,234.56', '.')).toBe(1234.56);
      expect(parseAmount('1,234,567.89', '.')).toBe(1234567.89);
    });

    it('parsea importes negativos', () => {
      expect(parseAmount('-1234,56', ',')).toBe(-1234.56);
      expect(parseAmount('-1,234.56', '.')).toBe(-1234.56);
    });

    it('elimina símbolos de moneda', () => {
      expect(parseAmount('1234,56 €', ',')).toBe(1234.56);
      expect(parseAmount('$1234.56', '.')).toBe(1234.56);
      expect(parseAmount('£1234.56', '.')).toBe(1234.56);
    });

    it('devuelve 0 si raw vacío o inválido', () => {
      expect(parseAmount('', ',')).toBe(0);
      expect(parseAmount('abc', ',')).toBe(0);
    });

    it('elimina espacios en blanco', () => {
      expect(parseAmount('1 234,56', ',')).toBe(1234.56);
    });
  });

  describe('splitCSVLine', () => {
    it('split básico por separador', () => {
      expect(splitCSVLine('a;b;c', ';')).toEqual(['a', 'b', 'c']);
    });

    it('split por coma', () => {
      expect(splitCSVLine('a,b,c', ',')).toEqual(['a', 'b', 'c']);
    });

    it('respeta comillas dobles (no parte dentro)', () => {
      expect(splitCSVLine('"a;b";c;d', ';')).toEqual(['a;b', 'c', 'd']);
    });

    it('elimina comillas envolventes', () => {
      expect(splitCSVLine('"abc";"def"', ';')).toEqual(['abc', 'def']);
    });

    it('trim de espacios alrededor de cada campo', () => {
      expect(splitCSVLine(' a ; b ; c ', ';')).toEqual(['a', 'b', 'c']);
    });

    it('línea vacía produce un campo vacío', () => {
      expect(splitCSVLine('', ';')).toEqual(['']);
    });

    it('campos vacíos consecutivos', () => {
      expect(splitCSVLine('a;;b', ';')).toEqual(['a', '', 'b']);
    });
  });

  describe('parseBankCSV', () => {
    it('parsea CSV simple correctamente', () => {
      const csv = '15/03/2024;Compra Mercadona;-45,30\n16/03/2024;Nomina;2000,00';
      const result = parseBankCSV(csv, baseFormat);
      expect(result.rows).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.rows[0]).toMatchObject({
        valueDate: '2024-03-15',
        description: 'Compra Mercadona',
        amount: 45.3,
        type: 'expense',
      });
      expect(result.rows[1]).toMatchObject({
        amount: 2000,
        type: 'income',
      });
    });

    it('respeta skipRows (cabecera)', () => {
      const csv = 'CABECERA1\nCABECERA2\n15/03/2024;Compra;-10,00';
      const result = parseBankCSV(csv, { ...baseFormat, skipRows: 2 });
      expect(result.rows).toHaveLength(1);
    });

    it('descarta líneas de TOTAL/SUBTOTAL', () => {
      const csv =
        '15/03/2024;Compra;-10,00\nTotal Crédito;;-309,00\nSubtotal;;100,00\nResumen del periodo;;0,00';
      const result = parseBankCSV(csv, baseFormat);
      expect(result.rows).toHaveLength(1);
    });

    it('descarta líneas vacías', () => {
      const csv = '15/03/2024;Compra;-10,00\n\n\n16/03/2024;Otro;-20,00';
      const result = parseBankCSV(csv, baseFormat);
      expect(result.rows).toHaveLength(2);
    });

    it('soporta line endings \\r\\n y \\r', () => {
      const csv = '15/03/2024;Compra;-10,00\r\n16/03/2024;Otro;-20,00';
      const result = parseBankCSV(csv, baseFormat);
      expect(result.rows).toHaveLength(2);
    });

    it('modo split: amountIn / amountOut', () => {
      const splitFormat: BankFormat = {
        ...baseFormat,
        amountMode: 'split',
        columns: ['date', 'description', 'amountIn', 'amountOut'],
      };
      const csv = '15/03/2024;Nomina;2000,00;0\n16/03/2024;Compra;0;45,30';
      const result = parseBankCSV(csv, splitFormat);
      expect(result.rows[0]).toMatchObject({ amount: 2000, type: 'income' });
      expect(result.rows[1]).toMatchObject({ amount: 45.3, type: 'expense' });
    });

    it('detecta divisa si hay columna currency', () => {
      const fmt: BankFormat = {
        ...baseFormat,
        columns: ['date', 'description', 'amount', 'currency'],
      };
      const csv = '15/03/2024;Compra;-10,00;USD';
      const result = parseBankCSV(csv, fmt);
      expect(result.rows[0].detectedCurrency).toBe('USD');
    });

    it('importes positivos = income con negativeIsExpense=true', () => {
      const csv = '15/03/2024;Nomina;1500,00';
      const result = parseBankCSV(csv, baseFormat);
      expect(result.rows[0].type).toBe('income');
    });

    it('descarta filas con importe 0', () => {
      const csv = '15/03/2024;Algo;0,00';
      const result = parseBankCSV(csv, baseFormat);
      expect(result.rows).toHaveLength(0);
    });

    it('descarta líneas con menos de 2 columnas', () => {
      const csv = '15/03/2024\n16/03/2024;Otro;-20,00';
      const result = parseBankCSV(csv, baseFormat);
      expect(result.rows).toHaveLength(1);
    });

    it('si falta description usa fallback "Movimiento N"', () => {
      const csv = '15/03/2024;;-10,00';
      const result = parseBankCSV(csv, baseFormat);
      expect(result.rows[0].description).toMatch(/^Movimiento \d+$/);
    });

    it('importe siempre se devuelve en valor absoluto', () => {
      const csv = '15/03/2024;Compra;-45,30';
      const result = parseBankCSV(csv, baseFormat);
      expect(result.rows[0].amount).toBe(45.3);
      expect(result.rows[0].amount).toBeGreaterThan(0);
    });

    it('si valueDate vacío, usa entryDate como fallback', () => {
      const fmt: BankFormat = {
        ...baseFormat,
        columns: ['date', 'valueDate', 'description', 'amount'],
      };
      const csv = '15/03/2024;;Compra;-10,00';
      const result = parseBankCSV(csv, fmt);
      expect(result.rows[0].valueDate).toBe('2024-03-15');
      expect(result.rows[0].entryDate).toBe('2024-03-15');
    });
  });
});
