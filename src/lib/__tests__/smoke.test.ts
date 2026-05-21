describe('smoke test', () => {
  it('Vitest is configured correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('can handle async assertions', async () => {
    const value = await Promise.resolve('ok');
    expect(value).toBe('ok');
  });
});
