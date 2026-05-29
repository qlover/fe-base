import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import type { EncryptorInterface } from '@qlover/fe-corekit';

/**
 * AES-256-GCM encryption for sensitive OAuth token fields at rest.
 */
export class TokenEncryption implements EncryptorInterface<string, string> {
  private readonly key: Buffer;

  constructor(keyMaterial: string) {
    const raw = keyMaterial.startsWith('base64:')
      ? keyMaterial.slice('base64:'.length)
      : keyMaterial;
    this.key = Buffer.from(raw, 'base64');
    if (this.key.length !== 32) {
      throw new Error('ENCRYPTION_KEY must decode to 32 bytes (AES-256)');
    }
  }

  /**
   * @override
   */
  public encrypt(plaintext: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final()
    ]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('base64')}:${encrypted.toString('base64')}:${tag.toString('base64')}`;
  }

  /**
   * @override
   */
  public decrypt(ciphertext: string): string {
    const [ivB64, dataB64, tagB64] = ciphertext.split(':');
    if (!ivB64 || !dataB64 || !tagB64) {
      throw new Error('Invalid encrypted token format');
    }
    const iv = Buffer.from(ivB64, 'base64');
    const data = Buffer.from(dataB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString(
      'utf8'
    );
  }
}
