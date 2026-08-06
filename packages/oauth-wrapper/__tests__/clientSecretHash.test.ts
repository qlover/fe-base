import { describe, expect, it } from 'vitest';
import {
  generateOAuthClientId,
  generateOAuthClientSecret,
  hashClientSecret,
  verifyClientSecret
} from '../src/server/utils/clientSecretHash';

describe('clientSecretHash', () => {
  it('hashes and verifies a client secret', async () => {
    const secret = 'super-secret-client-key';
    const stored = await hashClientSecret(secret);

    expect(stored.startsWith('scrypt$')).toBe(true);
    await expect(verifyClientSecret(secret, stored)).resolves.toBe(true);
  });

  it('rejects wrong secrets', async () => {
    const stored = await hashClientSecret('correct-secret');

    await expect(verifyClientSecret('wrong-secret', stored)).resolves.toBe(
      false
    );
  });

  it('rejects malformed stored hashes', async () => {
    await expect(verifyClientSecret('secret', 'invalid-hash')).resolves.toBe(
      false
    );
    await expect(
      verifyClientSecret('secret', 'bcrypt$salt$hash')
    ).resolves.toBe(false);
  });

  it('generates unique client ids and secrets', () => {
    const idA = generateOAuthClientId();
    const idB = generateOAuthClientId();
    expect(idA).toMatch(/^client_[0-9a-f]{24}$/);
    expect(idA).not.toBe(idB);

    const secretA = generateOAuthClientSecret();
    const secretB = generateOAuthClientSecret();
    expect(secretA.length).toBeGreaterThan(20);
    expect(secretA).not.toBe(secretB);
  });
});
