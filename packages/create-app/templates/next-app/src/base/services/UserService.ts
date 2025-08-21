import { ImagicaAuthService } from '@brain-toolkit/bridge';
import { injectable, inject } from 'inversify';
import { AppConfig } from '../cases/AppConfig';
import { CookieStorage } from '@qlover/corekit-bridge';

@injectable()
export class UserService extends ImagicaAuthService {
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
}
