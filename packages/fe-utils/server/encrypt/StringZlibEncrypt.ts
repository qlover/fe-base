import crypto from 'crypto';
import { Buffer } from 'buffer';
import zlib from 'zlib';
import { Encryptor } from './Encryptor';

export class StringZlibEncrypt implements Encryptor<string, string> {
  private ALGORITHM = 'aes-128-cbc';
  private KEY: Buffer;
  private IV_LENGTH = 16;
  private KEY_LENGTH = 16;
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
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.KEY, iv);

    const compressedValue = zlib.deflateSync(value);
    let encrypted = cipher.update(compressedValue, undefined, this.encoding);
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

    let decrypted = Buffer.from(
      decipher.update(encrypted, this.encoding, 'binary'),
      'binary'
    );
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    const decompressedValue = zlib.inflateSync(decrypted);

    return decompressedValue.toString();
  }
}
