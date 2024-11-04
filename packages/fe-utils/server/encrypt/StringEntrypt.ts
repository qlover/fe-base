import crypto from 'crypto';
import { Buffer } from 'buffer';
import { Encryptor } from './Encryptor';

export class StringEntrypt implements Encryptor<string, string> {
  private ALGORITHM = 'aes-256-cbc';
  private KEY: Buffer;
  private KEY_LENGTH = 32; // AES-256 needs 32 bytes key

  constructor(
    encryptionKey: string,
    private readonly encoding: BufferEncoding = 'base64'
  ) {
    this.KEY = this.validateKey(encryptionKey);
  }

  private validateKey(key: string): Buffer {
    const keyBuffer = Buffer.from(key.slice(0, this.KEY_LENGTH));

    if (keyBuffer.length !== this.KEY_LENGTH) {
      throw new RangeError(
        `Invalid key length. Expected ${this.KEY_LENGTH} bytes, got ${keyBuffer.length} bytes`
      );
    }

    return keyBuffer;
  }

  encrypt(value: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.KEY, iv);
    let encrypted = cipher.update(value, 'utf8', this.encoding);
    encrypted += cipher.final(this.encoding);
    return `${encrypted}:${iv.toString(this.encoding)}`;
  }

  decrypt(encryptedData: string): string {
    const [encrypted, iv] = encryptedData.split(':');
    const decipher = crypto.createDecipheriv(
      this.ALGORITHM,
      this.KEY,
      Buffer.from(iv, this.encoding)
    );
    let decrypted = decipher.update(encrypted, this.encoding, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
