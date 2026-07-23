// ─── Metadatos de documentos legales ──────────────────────────────────────────
// Contenido completo en i18n/*/legal.docs.*
// Vive fuera de Legal.tsx para que ese fichero solo exporte componentes
// (react-refresh/only-export-components → Fast Refresh en desarrollo).
export const LEGAL_DOCS = {
  aviso:      { sectionCount: 7 },
  privacidad: { sectionCount: 8 },
  terminos:   { sectionCount: 8 },
  cookies:    { sectionCount: 6 },
} as const;

export type LegalDocKey = keyof typeof LEGAL_DOCS;
