import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const PREFIX = 'scrypt';
const KEY_LEN = 64;

/**
 * Hashes OAuth client secrets for storage (scrypt, Node built-in).
 *
 * @example
 * const hash = await hashClientSecret('my-secret');
 */
export async function hashClientSecret(secret: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scryptAsync(secret, salt, KEY_LEN)) as Buffer;
  return `${PREFIX}$${salt.toString('base64')}$${derived.toString('base64')}`;
}

/**
 * Verifies a plaintext client secret against a stored scrypt hash.
 */
export async function verifyClientSecret(
  secret: string,
  storedHash: string
): Promise<boolean> {
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== PREFIX) {
    return false;
  }

  const salt = Buffer.from(parts[1]!, 'base64');
  const expected = Buffer.from(parts[2]!, 'base64');
  const derived = (await scryptAsync(secret, salt, expected.length)) as Buffer;

  if (derived.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(derived, expected);
}
