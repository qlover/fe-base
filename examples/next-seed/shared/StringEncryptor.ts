import type { Base64Serializer, EncryptorInterface } from '@qlover/fe-corekit';

export class StringEncryptor implements EncryptorInterface<string, string> {
  constructor(
    protected readonly key: string,
    protected base64Serializer: Base64Serializer
  ) {}

  protected encryptWithKey(str: string, key: string): string {
    const result = [];
    for (let i = 0; i < str.length; i++) {
      // 使用字符的 Unicode 值和密钥进行混合运算
      const charCode = str.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      // 使用多个运算来增加复杂度
      const encrypted = (charCode + keyChar * 13) ^ (keyChar + i * 7);
      result.push(String.fromCharCode(encrypted % 65536)); // 确保结果在有效的 Unicode 范围内
    }
    return result.join('');
  }

  protected decryptWithKey(str: string, key: string): string {
    const result = [];
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      // 反向运算还原原始字符
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
      // 1. 先用 base64 反序列化
      const decoded = this.base64Serializer.deserialize(encryptedValue);
      // 2. 然后用密钥解密
      return this.decryptWithKey(decoded, this.key);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Decryption failed');
    }
  }
}
