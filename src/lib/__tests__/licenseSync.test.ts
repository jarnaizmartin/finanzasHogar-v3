import { describe, it, expect } from 'vitest';
import { adoptSyncedLicense } from '../licenseSync';

const lic = (over: Record<string, unknown> = {}) =>
  JSON.stringify({
    mode: 'activated',
    trialStartDate: 1,
    trialDays: 15,
    licenseCode: 'FH-AAAA-BBBB-CCCCCC',
    activatedAt: 2,
    activatedExpiryDate: 3,
    graceTrialStartDate: null,
    deviceId: 'device-PC',
    ...over,
  });

describe('adoptSyncedLicense', () => {
  it('adopta la licencia que llega pero CONSERVA el deviceId local', () => {
    const out = adoptSyncedLicense(lic(), lic({ mode: 'trial', deviceId: 'device-iPhone' }), null);
    const parsed = JSON.parse(out as string);
    // El derecho de uso viaja...
    expect(parsed.mode).toBe('activated');
    expect(parsed.licenseCode).toBe('FH-AAAA-BBBB-CCCCCC');
    // ...la identidad de la máquina NO: si se pisara, el próximo código
    // generado para este dispositivo sería rechazado por validateAndActivate.
    expect(parsed.deviceId).toBe('device-iPhone');
  });

  it('usa el fh_device_id de respaldo si este dispositivo aún no tiene licencia', () => {
    const out = adoptSyncedLicense(lic(), null, 'device-nuevo');
    expect(JSON.parse(out as string).deviceId).toBe('device-nuevo');
  });

  it('no escribe nada si no llega licencia', () => {
    expect(adoptSyncedLicense(null, lic(), null)).toBeNull();
  });

  it('no escribe nada si lo que llega no es una licencia', () => {
    expect(adoptSyncedLicense('no soy json', lic(), null)).toBeNull();
    expect(adoptSyncedLicense(JSON.stringify({ foo: 1 }), lic(), null)).toBeNull();
  });

  it('no escribe nada si el resultado es idéntico a lo que ya hay', () => {
    expect(adoptSyncedLicense(lic(), lic(), null)).toBeNull();
  });

  it('conserva el deviceId local aunque la licencia local esté corrupta, vía respaldo', () => {
    const out = adoptSyncedLicense(lic(), 'enc:v1:basura', 'device-real');
    expect(JSON.parse(out as string).deviceId).toBe('device-real');
  });
});
