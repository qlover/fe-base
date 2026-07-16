import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  type BinaryLike,
  type CipherKey
} from 'crypto';
import type { EncryptorInterface } from '@qlover/fe-corekit';

function toUint8Array(data: Buffer): Uint8Array {
  return Uint8Array.from(data);
}

function concatUint8(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

/**
 * AES-256-GCM encryption for sensitive OAuth token fields at rest.
 */
export class TokenEncryption implements EncryptorInterface<string, string> {
  private readonly key: CipherKey;

  constructor(keyMaterial: string) {
    const raw = keyMaterial.startsWith('base64:')
      ? keyMaterial.slice('base64:'.length)
      : keyMaterial;
    const keyBytes = toUint8Array(Buffer.from(raw, 'base64'));
    if (keyBytes.length !== 32) {
      throw new Error('ENCRYPTION_KEY must decode to 32 bytes (AES-256)');
    }
    this.key = keyBytes as CipherKey;
  }

  /**
   * @override
   */
  public encrypt(plaintext: string): string {
    const iv = toUint8Array(randomBytes(12));
    const cipher = createCipheriv('aes-256-gcm', this.key, iv as BinaryLike);
    const encrypted = concatUint8(
      toUint8Array(cipher.update(plaintext, 'utf8')),
      toUint8Array(cipher.final())
    );
    const tag = toUint8Array(cipher.getAuthTag());
    return `${toBase64(iv)}:${toBase64(encrypted)}:${toBase64(tag)}`;
  }

  /**
   * @override
   */
  public decrypt(ciphertext: string): string {
    const [ivB64, dataB64, tagB64] = ciphertext.split(':');
    if (!ivB64 || !dataB64 || !tagB64) {
      throw new Error('Invalid encrypted token format');
    }
    const iv = toUint8Array(Buffer.from(ivB64, 'base64'));
    const data = toUint8Array(Buffer.from(dataB64, 'base64'));
    const tag = toUint8Array(Buffer.from(tagB64, 'base64'));
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.key,
      iv as BinaryLike
    );
    decipher.setAuthTag(tag as NodeJS.ArrayBufferView);
    return Buffer.from(
      concatUint8(
        toUint8Array(decipher.update(data)),
        toUint8Array(decipher.final())
      )
    ).toString('utf8');
  }
}
