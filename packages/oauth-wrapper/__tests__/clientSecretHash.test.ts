import { describe, expect, it } from 'vitest';
import {
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
});
