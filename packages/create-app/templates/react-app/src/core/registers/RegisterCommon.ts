import type {
  InversifyRegisterInterface,
  InversifyRegisterContainer
} from '@/base/port/InversifyIocInterface';

import { FetchAbortPlugin, JSONStorage } from '@qlover/fe-utils';
import { UserToken } from '@/base/cases/UserToken';
import AppConfig from '@/core/AppConfig';

export class RegisterCommon implements InversifyRegisterInterface {
  register(container: InversifyRegisterContainer): void {
    const feApiAbort = new FetchAbortPlugin();
    const userToken = new UserToken({
      storageKey: AppConfig.userTokenStorageKey,
      storage: container.get(JSONStorage)
    });

    container.bind(FetchAbortPlugin).toConstantValue(feApiAbort);
    container.bind(UserToken).toConstantValue(userToken);
  }
}
