// ─── Cliente REST de Google Drive (carpeta appDataFolder) ────────────────────
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §5 (Capa A) y §8.1 (anti-carrera).
//
// Mueve el blob cifrado del vault a/desde la carpeta oculta por-app del usuario
// en Drive. Funciones puras de transporte: reciben el access_token EXPLÍCITO, no
// tocan estado de sesión ni GIS → testeables con fetch mockeado. El proveedor
// (googleDriveProvider) es quien inyecta el token vivo.
//
// Control de concurrencia optimista (§8.1): usamos el campo `version` del fichero
// de Drive (documentado, incrementa en cada cambio) como revisión. writeVault
// compara la revisión esperada con la remota antes de subir; si difiere, devuelve
// CONFLICT y el motor de sync re-hace pull→merge→push.
//
// ⚠️ Honestidad (Regla 1): NO usamos `If-Match`/ETag — no se pudo confirmar de
// forma autoritativa que Drive v3 lo honre en el endpoint de subida. El check de
// `version` deja una micro-ventana de carrera (dos dispositivos escribiendo en el
// mismo instante), aceptable para single-user/pocos dispositivos (ADR §7).
// ─────────────────────────────────────────────────────────────────────────────

import type { VaultBlob } from './types';
import { SyncError } from './types';

const DRIVE_FILES = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';

/** Nombre fijo del fichero del vault dentro de appDataFolder. */
export const VAULT_FILENAME = 'vault.fhsync';

type DriveFileMeta = { id: string; version: string };

async function authedFetch(
  token: string,
  url: string,
  init?: RequestInit
): Promise<Response> {
  try {
    return await fetch(url, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) },
    });
  } catch {
    throw new SyncError('NETWORK', 'fallo de red contra Google Drive');
  }
}

/** Mapea respuestas no-ok a errores normalizados. 401 → token caducado. */
function ensureOk(res: Response): void {
  if (res.ok) return;
  if (res.status === 401) throw new SyncError('TOKEN_EXPIRED');
  throw new SyncError('NETWORK', `Drive respondió ${res.status}`);
}

/** Busca el fichero del vault por nombre en appDataFolder. null si no existe. */
async function findVaultFile(token: string): Promise<DriveFileMeta | null> {
  const q = encodeURIComponent(`name='${VAULT_FILENAME}'`);
  const url = `${DRIVE_FILES}?spaces=appDataFolder&q=${q}&fields=files(id,version)`;
  const res = await authedFetch(token, url);
  ensureOk(res);
  const data = (await res.json()) as { files?: { id: string; version: string }[] };
  const f = data.files?.[0];
  return f ? { id: f.id, version: String(f.version) } : null;
}

/** Descarga el contenido (texto) de un fichero de Drive. */
async function downloadContent(token: string, id: string): Promise<string> {
  const res = await authedFetch(token, `${DRIVE_FILES}/${id}?alt=media`);
  ensureOk(res);
  return res.text();
}

/** Crea el fichero del vault con su contenido (upload multipart). */
async function createVault(token: string, content: string): Promise<VaultBlob> {
  const boundary = `fhsync${Math.random().toString(36).slice(2)}`;
  const metadata = { name: VAULT_FILENAME, parents: ['appDataFolder'] };
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: text/plain; charset=UTF-8\r\n\r\n` +
    `${content}\r\n` +
    `--${boundary}--`;
  const res = await authedFetch(
    token,
    `${DRIVE_UPLOAD}?uploadType=multipart&fields=id,version`,
    {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    }
  );
  ensureOk(res);
  const data = (await res.json()) as { version: string };
  return { content, revision: String(data.version) };
}

/** Sustituye el contenido de un fichero existente (upload media). */
async function updateContent(
  token: string,
  id: string,
  content: string
): Promise<VaultBlob> {
  const res = await authedFetch(
    token,
    `${DRIVE_UPLOAD}/${id}?uploadType=media&fields=id,version`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'text/plain; charset=UTF-8' },
      body: content,
    }
  );
  ensureOk(res);
  const data = (await res.json()) as { version: string };
  return { content, revision: String(data.version) };
}

// ── API pública del cliente ───────────────────────────────────────────────────

/** Lee el vault remoto. null si aún no existe en Drive. */
export async function readVault(token: string): Promise<VaultBlob | null> {
  const meta = await findVaultFile(token);
  if (!meta) return null;
  const content = await downloadContent(token, meta.id);
  return { content, revision: meta.version };
}

/**
 * Sube el vault con control de concurrencia optimista (§8.1).
 *
 * @param expectedRevision  revisión que el llamante cree que hay en remoto
 *                          (null = creía que no había remoto).
 * @throws SyncError('CONFLICT') si el remoto cambió respecto a lo esperado →
 *         el motor debe re-hacer pull→merge→push.
 */
export async function writeVault(
  token: string,
  content: string,
  expectedRevision: string | null
): Promise<VaultBlob> {
  const meta = await findVaultFile(token);

  if (!meta) {
    // No hay remoto. Solo es coherente si el llamante tampoco esperaba uno.
    if (expectedRevision !== null) {
      throw new SyncError('CONFLICT', 'el vault remoto desapareció');
    }
    return createVault(token, content);
  }

  // Hay remoto pero el llamante no lo conocía → otro dispositivo lo creó.
  if (expectedRevision === null) {
    throw new SyncError('CONFLICT', 'ya existe un vault remoto que no conocías');
  }
  // Hay remoto y cambió desde que el llamante lo leyó.
  if (expectedRevision !== meta.version) {
    throw new SyncError('CONFLICT', 'la revisión remota cambió');
  }
  return updateContent(token, meta.id, content);
}

/** Borra el vault remoto. No-op si no existe (idempotente). */
export async function deleteVault(token: string): Promise<void> {
  const meta = await findVaultFile(token);
  if (!meta) return;
  const res = await authedFetch(token, `${DRIVE_FILES}/${meta.id}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 404) ensureOk(res);
}
