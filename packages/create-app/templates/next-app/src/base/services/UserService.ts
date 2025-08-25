import { CookieStorage } from '@qlover/corekit-bridge';
import { injectable, inject } from 'inversify';
import { AppConfig } from '../cases/AppConfig';
import { UserServiceInterface } from '../port/UserServiceInterface';

@injectable()
export class UserService extends UserServiceInterface {
  constructor(@inject(AppConfig) protected appConfig: AppConfig) {
    super({
      credentialStorage: {
        key: appConfig.userTokenKey,
        storage: new CookieStorage()
      },
      requestConfig: {
        env: appConfig.env !== 'production' ? 'development' : 'production'
      }
    });
  }

  getToken(): string | null {
    return this.store.getCredential();
  }
}
