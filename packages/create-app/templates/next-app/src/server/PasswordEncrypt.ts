import crypto from 'crypto';
import type { Encryptor } from '@qlover/fe-corekit';

export class PasswordEncrypt implements Encryptor<string, string> {
  encrypt(password: string): string {
    return crypto.createHash('md5').update(password).digest('hex');
  }

  decrypt(): string {
    throw new Error('Md5Encrypt is not decryptable');
  }
}
