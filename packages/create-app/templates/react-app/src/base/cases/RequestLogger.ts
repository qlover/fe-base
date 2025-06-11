import { IOCIdentifier } from '@/core/IOC';
import {
  type ExecutorPlugin,
  type ExecutorContext,
  type RequestAdapterFetchConfig,
  type RequestAdapterResponse
} from '@qlover/fe-corekit';
import {
  type ApiCatchPluginConfig,
  type ApiCatchPluginResponse
} from '@qlover/corekit-bridge';
import { injectable, inject } from 'inversify';
import type { LoggerInterface } from '@qlover/logger';

@injectable()
export class RequestLogger
  implements ExecutorPlugin<RequestAdapterFetchConfig>
{
  readonly pluginName = 'RequestLogger';

  constructor(@inject(IOCIdentifier.Logger) public logger: LoggerInterface) {}

  onBefore(context: ExecutorContext<RequestAdapterFetchConfig<unknown>>): void {
    this.logger.log(
      `%c[Request before]%c [${new Date().toLocaleString()}] ${context.parameters.method} ${context.parameters.url}`,
      'color: #0ff;',
      'color: inherit;',
      context.parameters
    );
  }

  async onSuccess({
    parameters,
    returnValue
  }: ExecutorContext<
    RequestAdapterFetchConfig & ApiCatchPluginConfig
  >): Promise<void> {
    const _returnValue = returnValue as RequestAdapterResponse &
      ApiCatchPluginResponse;

    // If the apiCatchResult is not null, it means that the error has been caught
    // from `ApiCatchPlugin`
    if (_returnValue.apiCatchResult) {
      this.loggerError(parameters, _returnValue.apiCatchResult);
      return;
    }

    this.logger.log(
      `%c[Request success]%c [${new Date().toLocaleString()}] ${parameters.method} ${parameters.url}`,
      'color: #0f0;',
      'color: inherit;',
      _returnValue
    );
  }

  onError({
    parameters,
    error
  }: ExecutorContext<RequestAdapterFetchConfig>): void {
    this.loggerError(parameters, error);
  }

  loggerError(config: RequestAdapterFetchConfig, error: unknown): void {
    this.logger.log(
      `%c[Request error]%c [${new Date().toLocaleString()}] ${config.method} ${config.url}`,
      'color: #f00;',
      'color: inherit;',
      error
    );
  }
}
