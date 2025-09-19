import { injectable, inject } from 'inversify';
import type { UserSchema } from '@migrations/schema/UserSchema';
import { AppConfig } from '../cases/AppConfig';
import { UserServiceApi } from '../cases/UserServiceApi';
import { UserServiceInterface } from '../port/UserServiceInterface';
import type { UserAuthApiInterface } from '@qlover/corekit-bridge';

@injectable()
export class UserService extends UserServiceInterface {
  constructor(
    @inject(AppConfig) protected appConfig: AppConfig,
    @inject(UserServiceApi) protected userApi: UserAuthApiInterface<UserSchema>
  ) {
    super(userApi, {
      credentialStorage: {
        key: appConfig.userTokenKey
      }
    });
  }

  getToken(): string | null {
    return this.store.getCredential();
  }
}
