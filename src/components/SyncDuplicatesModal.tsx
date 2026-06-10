// ─── Revisión de posibles duplicados del sync (§8.3) ─────────────────────────
//
// Muestra SOLO los movimientos que el último merge trajo de otro dispositivo y
// que se parecen a uno que ya tenías (misma heurística que la importación CSV:
// mismo tipo + importe ±0,01 + fecha ±2 días). Para cada uno indica con cuál
// coincide (el motivo) y permite eliminar el entrante. Lista de solo lectura por
// lo demás: la decisión la toma el usuario.
// ─────────────────────────────────────────────────────────────────────────────

import { useTranslation } from 'react-i18next';
import { useApp } from '../AppContext';
import { Modal, PrimaryBtn } from './UI';
import { fmtDateDMY } from '../utils';
import { fmtAmount } from '../lib/i18nFormats';

export function SyncDuplicatesModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { T, sync, realExpenses, dateFormat, deleteRealExpense } = useApp();

  // Solo filas cuyo movimiento entrante sigue vivo (al eliminar uno, desaparece).
  const rows = sync.duplicates
    .map((d) => ({
      incoming: realExpenses.find((e) => e.id === d.id),
      match: realExpenses.find((e) => e.id === d.duplicateOf),
    }))
    .filter((r) => r.incoming);

  const handleDelete = (id: string) => {
    deleteRealExpense(id);
    // Si era el último, cierra y limpia el aviso.
    if (rows.length <= 1) {
      sync.clearDuplicates();
      onClose();
    }
  };

  return (
    <Modal
      title={t('appShell.sync.duplicatesModalTitle')}
      subtitle={t('appShell.sync.duplicatesModalSubtitle')}
      onClose={onClose}
      T={T}
      preventClickOutside={true}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', padding: '0 1.5rem 1rem' }}>
        {rows.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: T.muted, margin: '0.5rem 0' }}>
            {t('appShell.sync.duplicatesEmpty')}
          </p>
        ) : (
          rows.map(({ incoming, match }) => (
            <div
              key={incoming!.id}
              style={{
                padding: '0.625rem 0.75rem',
                borderRadius: '0.625rem',
                background: T.pageBg,
                border: `1px solid ${T.cardBorder}`,
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: T.title }}>
                {incoming!.description || '—'}
              </div>
              <div style={{ fontSize: '0.75rem', color: T.body, marginTop: '0.15rem' }}>
                {fmtDateDMY(incoming!.valueDate, dateFormat)} · {fmtAmount(incoming!.amount)} {incoming!.currency}
              </div>
              {match && (
                <div
                  style={{
                    marginTop: '0.4rem',
                    padding: '0.35rem 0.6rem',
                    borderRadius: '0.5rem',
                    background: T.amberBg,
                    border: `1px solid ${T.amberBorder}`,
                    fontSize: '0.68rem',
                    color: T.amber,
                  }}
                >
                  {t('appShell.sync.duplicatesMatchReason', {
                    desc: match.description || '—',
                    date: fmtDateDMY(match.valueDate, dateFormat),
                    amount: fmtAmount(match.amount),
                    currency: match.currency,
                  })}
                </div>
              )}
              <button
                onClick={() => handleDelete(incoming!.id)}
                style={{
                  marginTop: '0.5rem',
                  background: 'none',
                  border: `1.5px solid ${T.red}`,
                  color: T.red,
                  borderRadius: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {t('appShell.sync.duplicatesDeleteBtn')}
              </button>
            </div>
          ))
        )}

        <PrimaryBtn T={T} onClick={onClose} style={{ marginTop: '0.5rem' }}>
          {t('common.close')}
        </PrimaryBtn>
      </div>
    </Modal>
  );
}
