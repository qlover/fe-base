import {
  ExecutorPlugin,
  ExecutorContext,
  RequestAdapterFetchConfig,
  Logger
} from 'packages/fe-utils/common';

export class RequestLogger
  implements ExecutorPlugin<RequestAdapterFetchConfig>
{
  readonly pluginName = 'RequestLogger';

  constructor(public logger: Logger) {}

  onBefore({ parameters }: ExecutorContext<RequestAdapterFetchConfig>): void {
    this.logger.info(
      `RequestLogger ${parameters.method} ${parameters.url}`,
      parameters
    );
  }

  async onSuccess({
    parameters,
    returnValue
  }: ExecutorContext<RequestAdapterFetchConfig>): Promise<void> {
    this.logger.info(
      `RequestLogger ${parameters.method} ${parameters.url} [success] `,
      returnValue
    );
  }
}
