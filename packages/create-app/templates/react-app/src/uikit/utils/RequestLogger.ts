import { FeRegisterType } from '@/core/feIOC/FeRegisterType';
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

  constructor(@inject(FeRegisterType.Logger) public logger: Logger) {}

  async onSuccess({
    parameters,
    returnValue
  }: ExecutorContext<RequestAdapterFetchConfig>): Promise<void> {
    this.logger.info(
      `Request [${new Date().toLocaleString()}] ${parameters.method} ${parameters.url} [success] `,
      returnValue
    );
  }

  onError({
    parameters,
    error
  }: ExecutorContext<RequestAdapterFetchConfig>): void {
    this.logger.error(
      `Request [${new Date().toLocaleString()}] ${parameters.method} ${parameters.url} [error] `,
      error
    );
  }
}
