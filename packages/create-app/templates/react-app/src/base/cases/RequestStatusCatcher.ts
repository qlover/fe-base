import type { RequestCatcherInterface } from '@/base/port/RequestCatcherInterface';
import { IOCIdentifier } from '@/core/IOC';
import type { RequestAdapterResponse } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';
import { inject, injectable } from 'inversify';

@injectable()
export class RequestStatusCatcher
  implements RequestCatcherInterface<RequestAdapterResponse>
{
  constructor(
    @inject(IOCIdentifier.Logger)
    private readonly logger: LoggerInterface
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
