// src/components/FeedbackModal.tsx
//
// A4 — Canal de feedback in-app.
// Envía sugerencias / reportes de error por email vía Web3Forms (sin backend).
// Patrón de modal con svh + safe-area (consistente con el resto de modales).

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { useApp } from '../AppContext';
import { Field, Input, PrimaryBtn, SecondaryBtn } from './UI';
import { sendWeb3FormsEmail } from '../lib/web3forms';

type FeedbackType = 'bug' | 'idea';
type SendStatus = 'idle' | 'loading' | 'success' | 'error';

export function FeedbackModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { T } = useApp();
  const [type, setType] = useState<FeedbackType>('idea');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<SendStatus>('idle');

  const handleSend = async () => {
    if (!message.trim() || status === 'loading') return;
    setStatus('loading');
    const typeLabel = type === 'bug' ? t('feedback.typeBug') : t('feedback.typeIdea');
    const result = await sendWeb3FormsEmail({
      subject: `[${typeLabel}] ${t('feedback.title')}`,
      fromName: contact.trim() || 'FinNorT App',
      message:
        `Tipo: ${typeLabel}\n` +
        `Idioma: ${i18next.language}\n` +
        `Contacto: ${contact.trim() || '(no facilitado)'}\n` +
        `Dispositivo: ${navigator.userAgent}\n\n` +
        `Mensaje:\n${message.trim()}`,
    });
    setStatus(result.ok ? 'success' : 'error');
  };

  const typeBtn = (value: FeedbackType, label: string) => {
    const selected = type === value;
    return (
      <button
        type="button"
        onClick={() => setType(value)}
        style={{
          flex: 1,
          padding: '0.6rem 0.75rem',
          borderRadius: T.radiusInput,
          border: `1.5px solid ${selected ? T.accent : T.inputBorder}`,
          background: selected ? T.accentLight : T.inputBg,
          color: selected ? T.accent : T.muted,
          fontWeight: 700,
          fontSize: '0.8rem',
          cursor: 'pointer',
          fontFamily: T.fontFamily,
        }}
      >
        {label}
      </button>
    );
  };

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'max(1rem, env(safe-area-inset-top, 0px)) 1rem max(1rem, env(safe-area-inset-bottom, 0px))',
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: T.cardBg, border: `1px solid ${T.cardBorder}`,
          borderRadius: '1.5rem', boxShadow: T.cardShadowLg,
          width: '100%', maxWidth: '32rem', maxHeight: 'min(90svh, 90vh)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'fadeSlideIn 0.2s ease both',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.5rem 0.75rem',
            borderBottom: `1px solid ${T.cardBorder}`,
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: '1rem', flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: T.title, letterSpacing: '-0.02em', margin: 0 }}>
              {t('feedback.title')}
            </h2>
            <p style={{ fontSize: '0.8rem', color: T.muted, marginTop: '0.25rem' }}>
              {t('feedback.subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            style={{
              padding: '0.4rem', borderRadius: '0.625rem', border: 'none',
              background: T.btnSecBg, color: T.muted, cursor: 'pointer',
              display: 'flex', alignItems: 'center', flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1rem 1.5rem 1.5rem', overflowY: 'auto', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle size={48} color={T.green} />
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: T.title }}>{t('feedback.successTitle')}</div>
              <p style={{ fontSize: '0.85rem', color: T.muted, margin: 0 }}>{t('feedback.successBody')}</p>
              <PrimaryBtn T={T} onClick={onClose} style={{ marginTop: '0.5rem' }}>
                {t('common.close')}
              </PrimaryBtn>
            </div>
          ) : (
            <>
              <Field label={t('feedback.typeLabel')}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {typeBtn('idea', t('feedback.typeIdea'))}
                  {typeBtn('bug', t('feedback.typeBug'))}
                </div>
              </Field>

              <Field label={t('feedback.messageLabel')}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('feedback.messagePlaceholder')}
                  rows={5}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: T.inputBg, border: `1.5px solid ${T.inputBorder}`,
                    borderRadius: T.radiusInput, padding: '0.65rem 0.875rem',
                    fontSize: '0.875rem', color: T.inputText, outline: 'none',
                    fontFamily: T.fontFamily, resize: 'vertical', minHeight: '6rem',
                  }}
                />
              </Field>

              <Field label={t('feedback.contactLabel')}>
                <Input
                  T={T}
                  type="email"
                  value={contact}
                  placeholder={t('feedback.contactPlaceholder')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContact(e.target.value)}
                />
              </Field>

              {status === 'error' && (
                <p style={{ fontSize: '0.8rem', color: T.red, margin: 0 }}>{t('feedback.errorBody')}</p>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <SecondaryBtn T={T} onClick={onClose} style={{ flex: 1 }}>
                  {t('common.cancel')}
                </SecondaryBtn>
                <PrimaryBtn
                  T={T}
                  onClick={handleSend}
                  disabled={!message.trim() || status === 'loading'}
                  style={{ flex: 1, opacity: !message.trim() || status === 'loading' ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <Send size={15} />
                  {status === 'loading' ? t('feedback.sending') : t('feedback.send')}
                </PrimaryBtn>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
