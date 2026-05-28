import { createHash, timingSafeEqual } from 'crypto';

/** RFC 7636 code_verifier length bounds (inclusive). */
const PKCE_VERIFIER_MIN = 43;
const PKCE_VERIFIER_MAX = 128;

const UNRESERVED = /^[A-Za-z0-9\-._~]+$/;

/**
 * PKCE helpers for RFC 7636 (S256 only).
 *
 * Significance: Validates and verifies code_verifier against stored code_challenge.
 * Main purpose: Secure authorization code exchange for public OAuth clients.
 */
export function isValidCodeVerifier(verifier: string): boolean {
  const len = verifier.length;
  if (len < PKCE_VERIFIER_MIN || len > PKCE_VERIFIER_MAX) {
    return false;
  }
  return UNRESERVED.test(verifier);
}

export function isValidCodeChallenge(challenge: string): boolean {
  if (
    challenge.length < PKCE_VERIFIER_MIN ||
    challenge.length > PKCE_VERIFIER_MAX
  ) {
    return false;
  }
  return UNRESERVED.test(challenge);
}

/**
 * Computes the S256 code_challenge for a code_verifier.
 */
export function computeS256CodeChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

/**
 * Returns true when {@link verifier} matches the stored S256 {@link challenge}.
 */
export function verifyPkceS256(verifier: string, challenge: string): boolean {
  if (!isValidCodeVerifier(verifier) || !isValidCodeChallenge(challenge)) {
    return false;
  }
  const computed = computeS256CodeChallenge(verifier);
  try {
    return timingSafeEqual(Buffer.from(computed), Buffer.from(challenge));
  } catch {
    return false;
  }
}

const PKCE_CHARSET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

/**
 * Browser-side PKCE helpers (RFC 7636, S256).
 */
export function generatePkceVerifier(length = 64): string {
  const size = Math.min(128, Math.max(43, length));
  const values = new Uint8Array(size);
  crypto.getRandomValues(values);
  let result = '';
  for (let i = 0; i < size; i++) {
    result += PKCE_CHARSET[values[i]! % PKCE_CHARSET.length];
  }
  return result;
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function computePkceS256Challenge(
  verifier: string
): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
}
