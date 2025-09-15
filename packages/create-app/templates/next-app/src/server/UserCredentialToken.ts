import { inject, injectable } from 'inversify';
import jwt from 'jsonwebtoken';
import type { CrentialTokenInterface } from './port/CrentialTokenInterface';
import type { UserSchema } from '@migrations/schema/UserSchema';
import { AppConfig } from '@/base/cases/AppConfig';

export type UserCredentialTokenValue = Pick<UserSchema, 'id' | 'email'>;

@injectable()
export class UserCredentialToken
  implements CrentialTokenInterface<UserCredentialTokenValue>
{
  protected jwtSecret: string;
  protected jwtExpiresIn: string;

  constructor(@inject(AppConfig) protected config: AppConfig) {
    this.jwtSecret = config.jwtSecret;
    this.jwtExpiresIn = config.jwtExpiresIn;
  }

  async generateToken(
    data: UserCredentialTokenValue,
    options: { expiresIn?: string } = {}
  ): Promise<string> {
    const { expiresIn = '30 days' } = options;

    return jwt.sign({ i: data.id, e: data.email }, this.jwtSecret, {
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
      algorithm: 'HS256',
      noTimestamp: true
    });
  }

  async parseToken(token: string): Promise<UserCredentialTokenValue> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as {
        i: UserSchema['id'];
        e: string;
      };

      return {
        id: decoded.i,
        email: decoded.e
      };
    } catch {
      throw new Error('Invalid token');
    }
  }
}
