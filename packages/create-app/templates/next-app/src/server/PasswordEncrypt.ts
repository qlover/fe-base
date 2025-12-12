import crypto from 'crypto';
import type { Encryptor } from '@qlover/fe-corekit';

export class PasswordEncrypt implements Encryptor<string, string> {
  public encrypt(password: string): string {
    return crypto.createHash('md5').update(password).digest('hex');
  }

  public decrypt(): string {
    throw new Error('Md5Encrypt is not decryptable');
  }
}
