import { ExecutorError } from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import { cookies } from 'next/headers';
import type { AppConfig } from '@/base/cases/AppConfig';
import { API_NOT_AUTHORIZED } from '@config/Identifier';
import { I } from '@config/IOCIdentifier';
import { UserCredentialToken } from './UserCredentialToken';
import type { ServerAuthInterface } from './port/ServerAuthInterface';

@injectable()
export class ServerAuth implements ServerAuthInterface {
  protected userTokenKey: string;
  constructor(
    @inject(I.AppConfig) protected server: AppConfig,
    @inject(UserCredentialToken)
    protected userCredentialToken: UserCredentialToken
  ) {
    this.userTokenKey = server.userTokenKey;
  }

  public async setAuth(credential_token: string): Promise<void> {
    const cookieStore = await cookies();

    cookieStore.set(this.userTokenKey, credential_token);
  }

  public async hasAuth(): Promise<boolean> {
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

  public async getAuth(): Promise<string> {
    const cookieStore = await cookies();
    return cookieStore.get(this.userTokenKey)?.value || '';
  }

  public async clear(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(this.userTokenKey);
  }

  public async throwIfNotAuth(): Promise<void> {
    const hasAuth = await this.hasAuth();

    if (!hasAuth) {
      throw new ExecutorError(API_NOT_AUTHORIZED, 'Not authorized');
    }
  }
}
