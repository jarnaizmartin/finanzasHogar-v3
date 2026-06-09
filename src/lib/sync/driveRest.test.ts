import { describe, it, expect, vi, afterEach } from 'vitest';
import { readVault, writeVault, deleteVault, VAULT_FILENAME } from './driveRest';

const TOKEN = 'tok123';

// Construye una respuesta tipo fetch mínima (el código usa ok/status/json/text).
function res(opts: {
  ok?: boolean;
  status?: number;
  json?: unknown;
  text?: string;
}): Response {
  const status = opts.status ?? 200;
  return {
    ok: opts.ok ?? (status >= 200 && status < 300),
    status,
    json: async () => opts.json,
    text: async () => opts.text ?? '',
  } as unknown as Response;
}

function mockFetch(
  handler: (url: string, init?: RequestInit) => Promise<Response>
) {
  vi.stubGlobal('fetch', vi.fn(handler));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('readVault', () => {
  it('null cuando no existe el fichero remoto + consulta appDataFolder por nombre', async () => {
    let listUrl = '';
    mockFetch(async (url) => {
      listUrl = url;
      return res({ json: { files: [] } });
    });
    expect(await readVault(TOKEN)).toBeNull();
    expect(listUrl).toContain('spaces=appDataFolder');
    expect(decodeURIComponent(listUrl)).toContain(`name='${VAULT_FILENAME}'`);
  });

  it('devuelve contenido + revisión (version de Drive como string)', async () => {
    mockFetch(async (url) => {
      if (url.includes('alt=media')) return res({ text: 'CIPHERTEXT' });
      return res({ json: { files: [{ id: 'f1', version: 7 }] } });
    });
    expect(await readVault(TOKEN)).toEqual({
      content: 'CIPHERTEXT',
      revision: '7',
    });
  });

  it('envía el token como Bearer', async () => {
    let auth = '';
    mockFetch(async (_url, init) => {
      auth = (init?.headers as Record<string, string>).Authorization;
      return res({ json: { files: [] } });
    });
    await readVault(TOKEN);
    expect(auth).toBe(`Bearer ${TOKEN}`);
  });
});

describe('writeVault — control de concurrencia (§8.1)', () => {
  it('crea el vault cuando no hay remoto y no se esperaba ninguno', async () => {
    let posted = false;
    mockFetch(async (url, init) => {
      if (url.includes('uploadType=multipart')) {
        posted = init?.method === 'POST';
        return res({ json: { id: 'f1', version: 1 } });
      }
      return res({ json: { files: [] } });
    });
    expect(await writeVault(TOKEN, 'DATA', null)).toEqual({
      content: 'DATA',
      revision: '1',
    });
    expect(posted).toBe(true);
  });

  it('actualiza cuando hay remoto y la revisión esperada coincide', async () => {
    let patched = false;
    mockFetch(async (url, init) => {
      if (url.includes('uploadType=media')) {
        patched = init?.method === 'PATCH';
        return res({ json: { id: 'f1', version: 8 } });
      }
      return res({ json: { files: [{ id: 'f1', version: 7 }] } });
    });
    expect(await writeVault(TOKEN, 'DATA', '7')).toEqual({
      content: 'DATA',
      revision: '8',
    });
    expect(patched).toBe(true);
  });

  it('CONFLICT cuando la revisión remota cambió', async () => {
    mockFetch(async () => res({ json: { files: [{ id: 'f1', version: 9 }] } }));
    await expect(writeVault(TOKEN, 'DATA', '7')).rejects.toMatchObject({
      code: 'CONFLICT',
    });
  });

  it('CONFLICT cuando el remoto desapareció pero se esperaba una revisión', async () => {
    mockFetch(async () => res({ json: { files: [] } }));
    await expect(writeVault(TOKEN, 'DATA', '7')).rejects.toMatchObject({
      code: 'CONFLICT',
    });
  });

  it('CONFLICT cuando hay remoto que el llamante no conocía (otro dispositivo lo creó)', async () => {
    mockFetch(async () => res({ json: { files: [{ id: 'f1', version: 3 }] } }));
    await expect(writeVault(TOKEN, 'DATA', null)).rejects.toMatchObject({
      code: 'CONFLICT',
    });
  });
});

describe('deleteVault', () => {
  it('borra el fichero cuando existe', async () => {
    let deleted = false;
    mockFetch(async (_url, init) => {
      if (init?.method === 'DELETE') {
        deleted = true;
        return res({ status: 204 });
      }
      return res({ json: { files: [{ id: 'f1', version: 2 }] } });
    });
    await deleteVault(TOKEN);
    expect(deleted).toBe(true);
  });

  it('es no-op cuando no existe (idempotente)', async () => {
    let deleteCalled = false;
    mockFetch(async (_url, init) => {
      if (init?.method === 'DELETE') {
        deleteCalled = true;
        return res({ status: 204 });
      }
      return res({ json: { files: [] } });
    });
    await deleteVault(TOKEN);
    expect(deleteCalled).toBe(false);
  });
});

describe('errores normalizados', () => {
  it('401 → TOKEN_EXPIRED', async () => {
    mockFetch(async () => res({ ok: false, status: 401 }));
    await expect(readVault(TOKEN)).rejects.toMatchObject({
      code: 'TOKEN_EXPIRED',
    });
  });

  it('fallo de red → NETWORK', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('boom');
      })
    );
    await expect(readVault(TOKEN)).rejects.toMatchObject({ code: 'NETWORK' });
  });
});
