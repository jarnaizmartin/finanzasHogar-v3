// src/lib/web3forms.ts
// Centralized Web3Forms email sender.
// Used for license requests and recovery codes.

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined;

export interface Web3FormsPayload {
  subject: string;
  message: string;
  fromName?: string;
}

export interface Web3FormsResult {
  ok: boolean;
  error?: string;
}

export async function sendWeb3FormsEmail(
  payload: Web3FormsPayload
): Promise<Web3FormsResult> {
  if (!ACCESS_KEY) {
    console.error('[Web3Forms] VITE_WEB3FORMS_ACCESS_KEY is not defined');
    return { ok: false, error: 'Configuración de email no disponible.' };
  }

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        subject: payload.subject,
        from_name: payload.fromName ?? 'FinNorT App',
        message: payload.message,
      }),
    });
    const data = await response.json();
    if (response.ok && data.success) {
      return { ok: true };
    }
    console.error('[Web3Forms]', data);
    return { ok: false, error: 'No se pudo enviar el email. Inténtalo de nuevo.' };
  } catch (err) {
    console.error('[Web3Forms]', err);
    return { ok: false, error: 'No se pudo enviar el email. Inténtalo de nuevo.' };
  }
}
