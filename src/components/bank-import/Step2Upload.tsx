// src/components/bank-import/Step2Upload.tsx
//
// Paso 2 del wizard de importación bancaria.
// Selección de cuenta destino, subida del fichero CSV y previsualización.
//
// Extraído de BankImportModal.tsx (refactor Fase 1 — commit 5/8).
// Estado controlado por el padre: facilita la migración a useBankImport (commit 8).
// Excepción: fileRef es interno (DOM ref, no estado de aplicación).

import { useRef } from 'react';
import type { CSSProperties, Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

import type { Account, BankFormat } from '../../types';
import { BANK_FRIENDLY_NOTES } from '../../lib/bankFormats';
import { bankSelectStyle } from '../../lib/bankImportStyles';

// Theme tokens consumidos — subset de T.
type ThemeTokens = {
  accentLight: string;
  accent: string;
  muted: string;
  amberBg: string;
  amberBorder: string;
  amber: string;
  cardBorder: string;
  pageBg: string;
  btnSecBg: string;
  btnSecText: string;
  greenBg: string;
  green: string;
  cardBg: string;
  body: string;
  inputBorder: string;
  inputBg: string;
  inputText: string;
};

type Props = {
  T: ThemeTokens;
  selectedFormat: BankFormat | undefined;
  selectedFormatId: string;
  accounts: Account[];
  baseCurrency: string;
  selectedAccountId: string;
  rawCSV: string;
  overrideSkipRows: number | null;
  parseErrors: string[];
  setSelectedAccountId: Dispatch<SetStateAction<string>>;
  setRawCSV: Dispatch<SetStateAction<string>>;
  setOverrideSkipRows: Dispatch<SetStateAction<number | null>>;
  onGoBack: () => void;
};

export function Step2Upload({
  T,
  selectedFormat,
  selectedFormatId,
  accounts,
  baseCurrency,
  selectedAccountId,
  rawCSV,
  overrideSkipRows,
  parseErrors,
  setSelectedAccountId,
  setRawCSV,
  setOverrideSkipRows,
  onGoBack,
}: Props) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const selStyle: CSSProperties = bankSelectStyle(T);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          padding: '0.875rem 1rem',
          borderRadius: '0.875rem',
          background: T.accentLight,
          border: `1px solid ${T.accent}33`,
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>🏦</span>
        <div>
          <div
            style={{
              fontSize: '0.875rem',
              fontWeight: 800,
              color: T.accent,
            }}
          >
            {selectedFormat?.name}
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              color: T.muted,
              marginTop: '0.1rem',
            }}
          >
            {BANK_FRIENDLY_NOTES[selectedFormatId] ??
              t('bankImport.upload.defaultNote')}
          </div>
        </div>
        <button
          onClick={onGoBack}
          style={{
            marginLeft: 'auto',
            padding: '0.35rem 0.75rem',
            borderRadius: '0.625rem',
            border: `1px solid ${T.accent}44`,
            background: 'transparent',
            color: T.accent,
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {t('bankImport.upload.changeBank')}
        </button>
      </div>

      {selectedFormat?.note && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.875rem',
            background: T.amberBg,
            border: `1px solid ${T.amberBorder}`,
            fontSize: '0.775rem',
            color: T.amber,
            lineHeight: 1.5,
            display: 'flex',
            gap: '0.625rem',
            alignItems: 'flex-start',
          }}
        >
          <span style={{ flexShrink: 0 }}>💡</span>
          <span>{selectedFormat.note}</span>
        </div>
      )}

      <div>
        <label
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: T.muted,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            display: 'block',
            marginBottom: '0.35rem',
          }}
        >
          {t('bankImport.upload.accountLabel')}
        </label>
        <select
          style={selStyle}
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
        >
          {accounts.map((a) => {
            const isCard = a.accountType === 'credit_card';
            return (
              <option key={a.id} value={a.id}>
                {isCard ? '💳' : '🏦'} {a.name} (
                {a.currency ?? baseCurrency})
              </option>
            );
          })}
        </select>

        {/* Banner informativo cuando la cuenta destino es una tarjeta */}
        {(() => {
          const acc = accounts.find(
            (a) => a.id === selectedAccountId
          );
          if (acc?.accountType !== 'credit_card') return null;
          return (
            <div
              style={{
                marginTop: '0.5rem',
                padding: '0.625rem 0.875rem',
                borderRadius: '0.75rem',
                background: T.accentLight,
                border: `1px solid ${T.accent}33`,
                fontSize: '0.75rem',
                color: T.accent,
                lineHeight: 1.5,
              }}
            >
              {t('bankImport.upload.creditCardBanner')}
            </div>
          );
        })()}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,.txt"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) =>
            setRawCSV((ev.target?.result as string) ?? '');
          reader.readAsText(
            file,
            selectedFormat?.encoding === 'latin1'
              ? 'ISO-8859-1'
              : 'UTF-8'
          );
          e.target.value = '';
        }}
      />

      <button
        onClick={() => fileRef.current?.click()}
        style={{
          padding: '2rem 1.5rem',
          borderRadius: '1rem',
          cursor: 'pointer',
          textAlign: 'center',
          border: `2px dashed ${rawCSV ? T.accent : T.cardBorder}`,
          background: rawCSV ? T.accentLight : T.pageBg,
          color: rawCSV ? T.accent : T.muted,
          fontSize: '0.875rem',
          fontWeight: 700,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '2rem' }}>
          {rawCSV ? '✅' : '📂'}
        </span>
        {rawCSV
          ? t('bankImport.upload.fileLoaded')
          : t('bankImport.upload.filePrompt')}
        {!rawCSV && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 400,
              color: T.muted,
            }}
          >
            {t('bankImport.upload.fileFormats')}
          </span>
        )}
      </button>

      {rawCSV && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.625rem',
              padding: '0.625rem 0.875rem',
              borderRadius: '0.75rem',
              background: T.accentLight,
              border: `1px solid ${T.accent}33`,
            }}
          >
            <span
              style={{
                fontSize: '0.775rem',
                color: T.accent,
                fontWeight: 600,
                flex: 1,
              }}
            >
              {t('bankImport.upload.skipRowsLabel')}
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <button
                onClick={() =>
                  setOverrideSkipRows((s) =>
                    Math.max(
                      0,
                      (s ?? selectedFormat?.skipRows ?? 0) - 1
                    )
                  )
                }
                style={{
                  padding: '0.25rem 0.625rem',
                  borderRadius: '0.5rem',
                  border: `1px solid ${T.cardBorder}`,
                  background: T.btnSecBg,
                  color: T.btnSecText,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '1rem',
                }}
              >
                −
              </button>
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: T.accent,
                  minWidth: '1.5rem',
                  textAlign: 'center',
                }}
              >
                {overrideSkipRows ?? selectedFormat?.skipRows ?? 0}
              </span>
              <button
                onClick={() =>
                  setOverrideSkipRows(
                    (s) => (s ?? selectedFormat?.skipRows ?? 0) + 1
                  )
                }
                style={{
                  padding: '0.25rem 0.625rem',
                  borderRadius: '0.5rem',
                  border: `1px solid ${T.cardBorder}`,
                  background: T.btnSecBg,
                  color: T.btnSecText,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '1rem',
                }}
              >
                +
              </button>
            </div>
          </div>
          <div
            style={{
              borderRadius: '0.75rem',
              border: `1px solid ${T.cardBorder}`,
              overflow: 'hidden',
              fontSize: '0.68rem',
              fontFamily: 'monospace',
              maxHeight: '12rem',
              overflowY: 'auto',
            }}
          >
            {rawCSV
              .split('\n')
              .slice(0, 50)
              .filter((l) => l.trim())
              .map((line, i) => {
                const skip =
                  overrideSkipRows ?? selectedFormat?.skipRows ?? 0;
                const isHeader = i < skip;
                const isFirstData = i === skip;
                return (
                  <div
                    key={i}
                    style={{
                      padding: '0.3rem 0.625rem',
                      background: isFirstData
                        ? T.greenBg
                        : isHeader
                        ? T.pageBg
                        : T.cardBg,
                      borderBottom: `1px solid ${T.cardBorder}`,
                      color: isHeader ? T.muted : T.body,
                      borderLeft: isFirstData
                        ? `3px solid ${T.green}`
                        : '3px solid transparent',
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        color: isFirstData ? T.green : T.muted,
                        minWidth: '1.5rem',
                        fontWeight: isFirstData ? 700 : 400,
                        fontSize: '0.65rem',
                      }}
                    >
                      {isFirstData ? '▶' : i + 1}
                    </span>
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {line.length > 90
                        ? line.slice(0, 90) + '...'
                        : line}
                    </span>
                    {isFirstData && (
                      <span
                        style={{
                          fontSize: '0.6rem',
                          background: T.green,
                          color: '#fff',
                          padding: '0.1rem 0.375rem',
                          borderRadius: '9999px',
                          flexShrink: 0,
                        }}
                      >
                        {t('bankImport.upload.firstDataBadge')}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {parseErrors.length > 0 && (
        <div
          style={{
            padding: '0.75rem',
            borderRadius: '0.75rem',
            background: T.amberBg,
            border: `1px solid ${T.amberBorder}`,
            fontSize: '0.775rem',
            color: T.amber,
          }}
        >
          {t('bankImport.upload.parseErrors', { count: parseErrors.length })}
        </div>
      )}
    </div>
  );
}
