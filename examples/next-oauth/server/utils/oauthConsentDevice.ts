import { randomUUID } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import type { OAuthConsentDeviceContext } from '@qlover/oauth-wrapper';

export const OAUTH_CONSENT_DEVICE_COOKIE = 'fe_oauth_device';

// Browsers cap cookie lifetime at ~400 days; grant expiry is enforced in DB.
const DEVICE_COOKIE_MAX_AGE = 400 * 24 * 60 * 60;
const DEVICE_ID_PATTERN = /^[A-Za-z0-9-]{16,64}$/;

/**
 * Reads the consent device id (if any) and user agent. Safe in Server
 * Components — never writes cookies.
 */
export async function readConsentDevice(): Promise<OAuthConsentDeviceContext> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const raw = cookieStore.get(OAUTH_CONSENT_DEVICE_COOKIE)?.value ?? '';
  return {
    deviceId: DEVICE_ID_PATTERN.test(raw) ? raw : null,
    userAgent: headerStore.get('user-agent')
  };
}

/**
 * Same as {@link readConsentDevice}, but issues the device cookie when
 * missing. Route Handlers / Server Actions only.
 */
export async function ensureConsentDevice(
  secure: boolean
): Promise<OAuthConsentDeviceContext> {
  const device = await readConsentDevice();
  if (device.deviceId) {
    return device;
  }

  const deviceId = randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_CONSENT_DEVICE_COOKIE, deviceId, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: DEVICE_COOKIE_MAX_AGE
  });
  return { ...device, deviceId };
}
