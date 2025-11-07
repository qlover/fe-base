import { IOCIdentifier } from '@config/IOCIdentifier';
import { inject, injectable } from 'inversify';
import type { RequestCatcherInterface } from '@qlover/corekit-bridge';
import type { RequestAdapterResponse } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

@injectable()
export class RequestStatusCatcher
  implements RequestCatcherInterface<RequestAdapterResponse>
{
  constructor(
    @inject(IOCIdentifier.Logger) protected logger: LoggerInterface
  ) {}

  /**
   * default handler
   * @override
   */
  default(context: RequestAdapterResponse<unknown, unknown>): void {
    this.logger.warn(`RequestStatusCatcher default handler`, context);
  }

  /**
   * handler
   * @override
   */
  handler(context: RequestAdapterResponse<unknown, unknown>): void {
    const { status } = context;

    const _handler = this[`case${status}` as keyof RequestStatusCatcher];

    if (typeof _handler === 'function') {
      return _handler.call(this, context);
    }

    return this.default(context);
  }

  case200(_context: RequestAdapterResponse<unknown, unknown>): void {
    // this.logger.info(`RequestStatusCatcher case200 handler`, context);
  }
}
