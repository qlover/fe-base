import { IOCInterface, IOCRegisterInterface } from '@/base/port/IOCInterface';
import { RequestLogger } from '@/uikit/utils/RequestLogger';
import { localJsonStorage, logger } from '../globals';
import { FetchAbortPlugin } from '@qlover/fe-utils';
import { UserToken } from '@/base/cases/UserToken';

export class RegisterCommon implements IOCRegisterInterface {
  register(container: IOCInterface): void {
    const requestLogger = new RequestLogger(logger);
    const feApiAbort = new FetchAbortPlugin();
    const userToken = new UserToken({
      storageKey: 'fe_user_token',
      storage: localJsonStorage
    });

    container.bind(RequestLogger, requestLogger);
    container.bind(FetchAbortPlugin, feApiAbort);
    container.bind(UserToken, userToken);
  }
}
