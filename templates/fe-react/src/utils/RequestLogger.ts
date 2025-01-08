import {
  ExecutorPlugin,
  ExecutorContext,
  RequestAdapterFetchConfig,
  Logger
} from '@qlover/fe-utils';

export class RequestLogger
  implements ExecutorPlugin<RequestAdapterFetchConfig>
{
  readonly pluginName = 'RequestLogger';

  constructor(public logger: Logger) {}

  onBefore({ parameters }: ExecutorContext<RequestAdapterFetchConfig>): void {
    this.logger.info(
      `Request [${new Date().toLocaleString()}] ${parameters.method} ${parameters.url}`,
      parameters
    );
  }

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
