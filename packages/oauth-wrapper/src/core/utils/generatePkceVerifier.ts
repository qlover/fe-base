const PKCE_CHARSET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

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
