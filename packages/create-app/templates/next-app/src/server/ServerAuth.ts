import { inject, injectable } from 'inversify';
import { cookies } from 'next/headers';
import { I } from '@config/IOCIdentifier';
import type { AppConfig } from '@/base/cases/AppConfig';
import { UserCredentialToken } from './UserCredentialToken';
import type { UserAuthInterface } from './port/UserAuthInterface';

@injectable()
export class ServerAuth implements UserAuthInterface {
  protected userTokenKey: string;
  constructor(
    @inject(I.AppConfig) protected server: AppConfig,
    @inject(UserCredentialToken)
    protected userCredentialToken: UserCredentialToken
  ) {
    this.userTokenKey = server.userTokenKey;
  }

  async setAuth(credential_token: string): Promise<void> {
    const cookieStore = await cookies();

    cookieStore.set(this.userTokenKey, credential_token);
  }

  async hasAuth(): Promise<boolean> {
    const token = await this.getAuth();

    if (!token) {
      return false;
    }

    try {
      const user = await this.userCredentialToken.parseToken(token);

      return !!user;
    } catch {
      return false;
    }
  }

  async getAuth(): Promise<string> {
    const cookieStore = await cookies();
    return cookieStore.get(this.userTokenKey)?.value || '';
  }

  async clear(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(this.userTokenKey);
  }
}
