// ─── Licencia y sync: adoptar la licencia del otro dispositivo ───────────────
//
// La licencia viaja en el snapshot de sync como una CADENA JSON opaca (es lo
// que hay en `fh_license_state`, que va en claro por la whitelist de
// encryptedStorage). El merge (mergeSnapshots) decide QUÉ estado gana; aquí
// solo se decide cómo se aplica al dispositivo local.
//
// ⚠️ El matiz que hace falta: `LicenseState.deviceId` NO es del usuario, es del
// DISPOSITIVO. Un código de licencia se valida regenerándolo a partir de
// `state.deviceId` (ver `validateAndActivate`), así que si el iPhone adopta tal
// cual el estado del PC, se queda con el deviceId del PC y su próximo código
// —generado contra su deviceId real— sería rechazado por "no válido".
//
// Por eso al adoptar una licencia sincronizada se conserva SIEMPRE el deviceId
// local: viaja el derecho de uso (plan, código, caducidad), no la identidad de
// la máquina.

/** Campos mínimos que hacen reconocible a un estado de licencia. */
type LicenseLike = {
  mode: string;
  deviceId: string;
  [k: string]: unknown;
};

function parseLicense(json: string | null): LicenseLike | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === 'object' && 'mode' in parsed && 'deviceId' in parsed) {
      return parsed as LicenseLike;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Devuelve el JSON de licencia que este dispositivo debe guardar tras un sync,
 * o `null` si no hay que escribir nada (entrante ausente, corrupta o idéntica).
 *
 * @param incomingJson  licencia que trae el snapshot ya fusionado
 * @param localJson     licencia que este dispositivo tiene ahora mismo
 * @param fallbackDeviceId  id del dispositivo (`fh_device_id`) por si la
 *                          licencia local aún no existe
 */
export function adoptSyncedLicense(
  incomingJson: string | null,
  localJson: string | null,
  fallbackDeviceId: string | null
): string | null {
  const incoming = parseLicense(incomingJson);
  if (!incoming) return null;

  const local = parseLicense(localJson);
  const deviceId = local?.deviceId ?? fallbackDeviceId ?? incoming.deviceId;

  const adopted = { ...incoming, deviceId };
  const json = JSON.stringify(adopted);
  // Nada que hacer si ya es exactamente lo que hay guardado.
  return json === localJson ? null : json;
}
