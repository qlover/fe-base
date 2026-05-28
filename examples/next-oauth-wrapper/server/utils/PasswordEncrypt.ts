import crypto from 'crypto';
import type { EncryptorInterface } from '@qlover/fe-corekit';

export class PasswordEncrypt implements EncryptorInterface<string, string> {
  /**
   * @override
   */
  public encrypt(password: string): string {
    return crypto.createHash('md5').update(password).digest('hex');
  }

  /**
   * @override
   */
  public decrypt(): string {
    throw new Error('Md5Encrypt is not decryptable');
  }
}
