import type { AuthMethod } from '../../types';

export const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)',
  padding: '1.5rem',
};

export const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '30rem',
  background: '#ffffff',
  borderRadius: '2rem',
  boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
  maxHeight: '90vh',
  overflowY: 'auto',
};

export const bodyStyle: React.CSSProperties = {
  padding: '2rem 2.25rem 2.25rem',
};

export const titleStyle: React.CSSProperties = {
  fontSize: '1.375rem',
  fontWeight: 800,
  color: '#0f172a',
  letterSpacing: '-0.03em',
  margin: '0 0 0.5rem',
};

export const subtitleStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#64748b',
  lineHeight: 1.6,
  margin: '0 0 1.75rem',
};

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '0.75rem',
  border: '1.5px solid #e2e8f0',
  background: '#f8fafc',
  color: '#0f172a',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
  marginBottom: '0.75rem',
};

export const btnPrimaryStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.875rem',
  borderRadius: '0.875rem',
  border: 'none',
  background: '#2563eb',
  color: '#ffffff',
  fontSize: '0.95rem',
  fontWeight: 700,
  cursor: 'pointer',
  marginTop: '0.5rem',
};

export const btnSecondaryStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '0.875rem',
  border: '1.5px solid #e2e8f0',
  background: '#f8fafc',
  color: '#475569',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: '0.5rem',
};

export const errorStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: '0.75rem',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#dc2626',
  fontSize: '0.825rem',
  marginBottom: '0.75rem',
  lineHeight: 1.5,
};

export const AUTH_METHODS: { method: AuthMethod; emoji: string }[] = [
  { method: 'password', emoji: '🔑' },
  { method: 'totp', emoji: '📱' },
];
