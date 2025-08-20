import { ImagicaAuthService } from '@brain-toolkit/bridge';
import { injectable } from 'inversify';

@injectable()
export class UserService extends ImagicaAuthService {
  constructor() {
    super({
      requestConfig: {
        env: 'development'
      }
    });
  }
}
