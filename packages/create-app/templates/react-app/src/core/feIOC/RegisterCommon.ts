import { IOCInterface, IOCRegisterInterface } from '@/base/port/IOCInterface';
import { RequestLogger } from '@/uikit/utils/RequestLogger';
import { logger } from '../globals';
import { FetchAbortPlugin } from '@qlover/fe-utils';

export class RegisterCommon implements IOCRegisterInterface {
  register(container: IOCInterface): void {
    const requestLogger = new RequestLogger(logger);
    const feApiAbort = new FetchAbortPlugin();

    container.bind(RequestLogger, requestLogger);
    container.bind(FetchAbortPlugin, feApiAbort);
  }
}
