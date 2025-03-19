import { IOCIdentifier } from '@/core/IOC';
import {
  ExecutorPlugin,
  ExecutorContext,
  RequestAdapterFetchConfig,
  Logger
} from '@qlover/fe-utils';
import { injectable, inject } from 'inversify';

@injectable()
export class RequestLogger
  implements ExecutorPlugin<RequestAdapterFetchConfig>
{
  readonly pluginName = 'RequestLogger';

  constructor(@inject(IOCIdentifier.Logger) public logger: Logger) {}

  async onSuccess({
    parameters,
    returnValue
  }: ExecutorContext<RequestAdapterFetchConfig>): Promise<void> {
    this.logger.log(
      `%c[Request success]%c [${new Date().toLocaleString()}] ${parameters.method} ${parameters.url}`,
      'color: #0f0;',
      'color: inherit;',
      returnValue
    );
  }

  onError({
    parameters,
    error
  }: ExecutorContext<RequestAdapterFetchConfig>): void {
    this.logger.error(
      `%c[Request error]%c [${new Date().toLocaleString()}] ${parameters.method} ${parameters.url}`,
      'color: #f00;',
      'color: inherit;',
      error
    );
  }
}
