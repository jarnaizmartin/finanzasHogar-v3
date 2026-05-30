export function getPasswordStrength(password: string): 1 | 2 | 3 | 4 {
  if (
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  )
    return 4;
  if (
    password.length >= 10 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  )
    return 3;
  if (password.length >= 8) return 2;
  return 1;
}

export const STRENGTH_COLORS: Record<1 | 2 | 3 | 4, string> = {
  1: '#dc2626',
  2: '#d97706',
  3: '#16a34a',
  4: '#2563eb',
};

// Label uses different criteria than getPasswordStrength (original inline logic preserved)
export function getPasswordStrengthLabel(password: string): string {
  if (password.length < 8) return '⚠️ Muy corta';
  if (password.length < 10) return '✅ Aceptable';
  if (password.length >= 12 && /[^A-Za-z0-9]/.test(password))
    return '💪 Muy fuerte';
  return '✅ Buena';
}
