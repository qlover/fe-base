import { FetchAbortPlugin, JSONStorage } from '@qlover/fe-utils';
import { UserToken } from '@/base/cases/UserToken';
import { Container } from 'inversify';
import type { IOCRegisterInterface } from '@/base/port/IOCContainerInterface';
import AppConfig from '@config/AppConfig';

export class RegisterCommon implements IOCRegisterInterface<Container> {
  register(container: Container): void {
    const feApiAbort = new FetchAbortPlugin();
    const userToken = new UserToken({
      storageKey: AppConfig.userTokenStorageKey,
      storage: container.get(JSONStorage)
    });

    container.bind(FetchAbortPlugin).toConstantValue(feApiAbort);
    container.bind(UserToken).toConstantValue(userToken);
  }
}
