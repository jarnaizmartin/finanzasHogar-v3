import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  now,
  stampNew,
  stampUpdate,
  stampDelete,
  ensureStamps,
} from '../timestamps';

// ────────────────────────────────────────────────────────────────────────────
// now
// ────────────────────────────────────────────────────────────────────────────
describe('now', () => {
  it('returns a number', () => {
    expect(typeof now()).toBe('number');
  });

  it('returns a value close to Date.now()', () => {
    const before = Date.now();
    const t = now();
    const after = Date.now();
    expect(t).toBeGreaterThanOrEqual(before);
    expect(t).toBeLessThanOrEqual(after);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// stampNew
// ────────────────────────────────────────────────────────────────────────────
describe('stampNew', () => {
  const FIXED = 1_700_000_000_000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds createdAt and updatedAt set to now', () => {
    const r = stampNew({ id: 'x' });
    expect(r.createdAt).toBe(FIXED);
    expect(r.updatedAt).toBe(FIXED);
  });

  it('preserves all original fields', () => {
    const r = stampNew({ id: 'x', name: 'foo', balance: 100 });
    expect(r.id).toBe('x');
    expect(r.name).toBe('foo');
    expect(r.balance).toBe(100);
  });

  it('respects existing createdAt if provided', () => {
    const r = stampNew({ id: 'x', createdAt: 123 });
    expect(r.createdAt).toBe(123);
    expect(r.updatedAt).toBe(FIXED);
  });

  it('respects existing updatedAt if provided', () => {
    const r = stampNew({ id: 'x', updatedAt: 456 });
    expect(r.createdAt).toBe(FIXED);
    expect(r.updatedAt).toBe(456);
  });

  it('does not mutate the input object', () => {
    const input = { id: 'x' };
    stampNew(input);
    expect(input).toEqual({ id: 'x' });
    expect('createdAt' in input).toBe(false);
  });

  it('returns a new object reference', () => {
    const input = { id: 'x' };
    const r = stampNew(input);
    expect(r).not.toBe(input);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// stampUpdate
// ────────────────────────────────────────────────────────────────────────────
describe('stampUpdate', () => {
  const FIXED = 1_700_000_000_000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('updates updatedAt to now', () => {
    const r = stampUpdate({ id: 'x', createdAt: 100, updatedAt: 200 });
    expect(r.updatedAt).toBe(FIXED);
  });

  it('preserves original createdAt', () => {
    const r = stampUpdate({ id: 'x', createdAt: 100, updatedAt: 200 });
    expect(r.createdAt).toBe(100);
  });

  it('fills missing createdAt with now (legacy fallback)', () => {
    const r = stampUpdate({ id: 'x' });
    expect(r.createdAt).toBe(FIXED);
    expect(r.updatedAt).toBe(FIXED);
  });

  it('always overwrites updatedAt even if input had one', () => {
    const r = stampUpdate({ id: 'x', updatedAt: 999 });
    expect(r.updatedAt).toBe(FIXED);
  });

  it('preserves all original fields', () => {
    const r = stampUpdate({ id: 'x', name: 'foo', createdAt: 100 });
    expect(r.id).toBe('x');
    expect(r.name).toBe('foo');
  });

  it('does not mutate the input object', () => {
    const input = { id: 'x', createdAt: 100, updatedAt: 200 };
    stampUpdate(input);
    expect(input.updatedAt).toBe(200);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// stampDelete
// ────────────────────────────────────────────────────────────────────────────
describe('stampDelete', () => {
  const FIXED = 1_700_000_000_000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sets deletedAt to now', () => {
    const r = stampDelete({ id: 'x', createdAt: 100, updatedAt: 200 });
    expect(r.deletedAt).toBe(FIXED);
  });

  it('bumps updatedAt to now', () => {
    const r = stampDelete({ id: 'x', createdAt: 100, updatedAt: 200 });
    expect(r.updatedAt).toBe(FIXED);
  });

  it('preserves original createdAt', () => {
    const r = stampDelete({ id: 'x', createdAt: 100, updatedAt: 200 });
    expect(r.createdAt).toBe(100);
  });

  it('fills missing createdAt with now', () => {
    const r = stampDelete({ id: 'x' });
    expect(r.createdAt).toBe(FIXED);
  });

  it('does not mutate the input object', () => {
    const input = { id: 'x', createdAt: 100, updatedAt: 200 };
    stampDelete(input);
    expect('deletedAt' in input).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// ensureStamps
// ────────────────────────────────────────────────────────────────────────────
describe('ensureStamps', () => {
  const FIXED = 1_700_000_000_000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns entity unchanged when both timestamps exist', () => {
    const input = { id: 'x', createdAt: 100, updatedAt: 200 };
    const r = ensureStamps(input);
    expect(r.createdAt).toBe(100);
    expect(r.updatedAt).toBe(200);
  });

  it('fills both timestamps when missing', () => {
    const r = ensureStamps({ id: 'x' });
    expect(r.createdAt).toBe(FIXED);
    expect(r.updatedAt).toBe(FIXED);
  });

  it('fills updatedAt when only createdAt exists', () => {
    const r = ensureStamps({ id: 'x', createdAt: 100 });
    // Pasa por stampNew, que respeta createdAt existente
    expect(r.createdAt).toBe(100);
    expect(r.updatedAt).toBe(FIXED);
  });

  it('fills createdAt when only updatedAt exists', () => {
    const r = ensureStamps({ id: 'x', updatedAt: 200 });
    expect(r.createdAt).toBe(FIXED);
    expect(r.updatedAt).toBe(200);
  });

  it('treats createdAt=0 and updatedAt=0 as valid (no refill)', () => {
    // 0 != null → no debe rellenar
    const r = ensureStamps({ id: 'x', createdAt: 0, updatedAt: 0 });
    expect(r.createdAt).toBe(0);
    expect(r.updatedAt).toBe(0);
  });

  it('preserves all original fields', () => {
    const r = ensureStamps({ id: 'x', name: 'foo' });
    expect(r.id).toBe('x');
    expect(r.name).toBe('foo');
  });
});
