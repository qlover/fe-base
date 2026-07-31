import type { EncryptorInterface } from '@qlover/fe-corekit/encrypt';
import type { Base64Serializer } from '@qlover/fe-corekit/serializer';

export class StringEncryptor implements EncryptorInterface<string, string> {
  constructor(
    protected readonly key: string,
    protected base64Serializer: Base64Serializer
  ) {
    if (!key) {
      throw new Error('Key is required');
    }
  }

  protected encryptWithKey(str: string, key: string): string {
    const result = [];
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      const encrypted = (charCode + keyChar * 13) ^ (keyChar + i * 7);
      result.push(String.fromCharCode(encrypted % 65536));
    }
    return result.join('');
  }

  protected decryptWithKey(str: string, key: string): string {
    const result = [];
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      const decrypted = (charCode ^ (keyChar + i * 7)) - keyChar * 13;
      result.push(String.fromCharCode(decrypted));
    }
    return result.join('');
  }

  /**
   * @override
   */
  public encrypt(value: string): string {
    try {
      const encrypted = this.encryptWithKey(value, this.key);
      return this.base64Serializer.serialize(encrypted);
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * @override
   */
  public decrypt(encryptedValue: string): string {
    try {
      const decoded = this.base64Serializer.deserialize(encryptedValue);
      return this.decryptWithKey(decoded, this.key);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Decryption failed');
    }
  }
}
