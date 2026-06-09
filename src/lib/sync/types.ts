// ─── Capa de transporte del sync — contrato agnóstico de proveedor ───────────
//
// ADR: project/development/10_SYNC_ARCHITECTURE.md §5 (Capa A — Transporte).
//
// Esta interfaz AÍSLA todo lo específico de un proveedor de nube (Google Drive
// hoy; Dropbox o carpeta local mañana) detrás de un único contrato. Objetivo
// explícito (preocupación del founder, sesión 48): si Google cambia su SDK o sus
// reglas, solo cambia la IMPLEMENTACIÓN del proveedor — nunca el motor de fusión
// ni el resto de la app. Añadir un proveedor nuevo = escribir otra implementación
// de esta misma interfaz.
//
// El proveedor mueve un BLOB CIFRADO opaco (snapshot completo del backup, ya
// cifrado por backupCrypto). NUNCA ve el contenido en claro: cero-conocimiento.
// ─────────────────────────────────────────────────────────────────────────────

export type SyncProviderId = 'google-drive' | 'dropbox' | 'local-file';

/**
 * Blob cifrado que viaja a/desde la nube. `content` es el texto serializado de
 * un EncryptedBackupFile (ver backupCrypto). `revision` es el identificador de
 * versión del proveedor (etag de Drive) para control de concurrencia optimista
 * (ADR §8.1 anti-carrera): null cuando el remoto aún no existe.
 */
export type VaultBlob = {
  content: string;
  revision: string | null;
};

/** Resultado de una conexión OAuth con un proveedor. */
export type SyncConnection = {
  providerId: SyncProviderId;
  /**
   * Identidad de la cuenta conectada, si el proveedor la expone. Solo
   * informativo para la UI ("Conectado como x@gmail.com"). Puede faltar.
   */
  account?: string;
};

/** Errores normalizados del transporte, independientes del proveedor concreto. */
export type SyncErrorCode =
  | 'NOT_CONFIGURED' // falta el Client ID (env var sin definir)
  | 'AUTH_CANCELLED' // el usuario cerró el consentimiento sin completar
  | 'AUTH_FAILED' // fallo del flujo OAuth
  | 'TOKEN_EXPIRED' // el token de acceso caducó y no se pudo renovar
  | 'NETWORK' // fallo de red
  | 'NOT_FOUND' // el vault remoto no existe
  | 'CONFLICT' // la revisión remota cambió → re-pull necesario (ADR §8.1)
  | 'WRONG_PASSWORD' // contraseña distinta a la del vault (ADR §8.3)
  | 'SCHEMA_TOO_NEW' // el blob lo escribió una versión más nueva de la app (ADR §8.3)
  | 'INVALID_VAULT' // el contenido no es un vault válido (corrupto/ajeno)
  | 'NOT_IMPLEMENTED'; // método aún no implementado (bloques siguientes)

/** Error de transporte con código normalizado para que la UI reaccione sin
 *  conocer detalles del proveedor. */
export class SyncError extends Error {
  code: SyncErrorCode;
  constructor(code: SyncErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'SyncError';
    this.code = code;
  }
}

/**
 * Contrato de un proveedor de transporte para el vault cifrado.
 *
 * Implementaciones previstas:
 *  - googleDriveProvider — beta (este bloque y los siguientes).
 *  - dropbox / local-file — post-beta (ADR §8 "aún abiertas").
 *
 * El ciclo de I/O del vault (readVault/writeVault/deleteVault) se implementa en
 * el bloque siguiente del sync; aquí queda definido el contrato completo para
 * que el aislamiento del proveedor sea estable desde el principio.
 */
export interface SyncProvider {
  readonly id: SyncProviderId;

  /** ¿Está el proveedor listo para usarse? (p. ej. Client ID presente). */
  isConfigured(): boolean;

  /**
   * Lanza el flujo OAuth y deja una sesión activa con token de acceso vivo.
   * Idempotente si ya hay sesión válida.
   *
   * @param interactive true → puede mostrar UI de consentimiento;
   *                     false → intento silencioso (sesión de proveedor viva).
   */
  connect(interactive: boolean): Promise<SyncConnection>;

  /** ¿Hay sesión activa con token de acceso vivo ahora mismo? */
  isConnected(): boolean;

  /** Cierra la sesión local. NO borra nada en la nube (desconexión suave). */
  disconnect(): void;

  // ── Vault I/O — se implementa en el bloque siguiente ────────────────────────
  readVault(): Promise<VaultBlob | null>;
  writeVault(content: string, expectedRevision: string | null): Promise<VaultBlob>;
  deleteVault(): Promise<void>;
}
