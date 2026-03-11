import {
  BrainUserService,
  type BrainUserFeatureTagType
} from '@brain-toolkit/brain-user';
import type { SeedConfigInterface } from '@qlover/corekit-bridge/bootstrap';
import type { StorageInterface } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

export class UserService extends BrainUserService<BrainUserFeatureTagType[]> {
  constructor(
    logger: LoggerInterface,
    config: SeedConfigInterface,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storage: StorageInterface<string, any>
  ) {
    super({
      logger,
      env: config.isProduction ? 'production' : 'development',
      store: {
        storage: storage,
        persistUserInfo: true
      }
    });
  }
}
