import { describe, expect, it, vi } from 'vitest';

vi.mock('@qlover/next-kit/server', () => ({
  TokenEncryption: class TokenEncryption {
    public constructor(private readonly key: string) {
      if (!this.key) {
        throw new Error('ENCRYPTION_KEY must decode to 32 bytes (AES-256)');
      }
    }

    public encrypt(plaintext: string): string {
      return `${this.key}:${plaintext}`;
    }

    public decrypt(ciphertext: string): string {
      const prefix = `${this.key}:`;
      return ciphertext.startsWith(prefix)
        ? ciphertext.slice(prefix.length)
        : ciphertext;
    }
  }
}));

const { LazyTokenEncryption } =
  await import('@server/providers/LazyTokenEncryption');

const VALID_KEY = Buffer.alloc(32, 7).toString('base64');

describe('LazyTokenEncryption', () => {
  it('构造时不读密钥', () => {
    const config = {
      get encryptionKey(): string {
        throw new Error('read encryptionKey');
      }
    };
    expect(() => new LazyTokenEncryption(config)).not.toThrow();
  });

  it('加密时读取当时的密钥', () => {
    let key = '';
    const encryption = new LazyTokenEncryption({
      get encryptionKey(): string {
        return key;
      }
    });
    key = VALID_KEY;
    const ciphertext = encryption.encrypt('session-token');
    expect(encryption.decrypt(ciphertext)).toBe('session-token');
  });
});
