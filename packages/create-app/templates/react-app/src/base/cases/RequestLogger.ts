import { IOCIdentifier } from '@config/IOCIdentifier';
import { type ApiCatchPluginResponse } from '@qlover/corekit-bridge';
import {
  type LifecyclePluginInterface,
  type ExecutorContextInterface,
  type RequestAdapterFetchConfig,
  type RequestAdapterResponse
} from '@qlover/fe-corekit';
import { injectable, inject } from 'inversify';
import type { LoggerInterface } from '@qlover/logger';

@injectable()
export class RequestLogger implements LifecyclePluginInterface<
  ExecutorContextInterface<RequestAdapterFetchConfig, unknown>
> {
  public readonly pluginName = 'RequestLogger';

  constructor(@inject(IOCIdentifier.Logger) public logger: LoggerInterface) {}

  /**
   * @override
   */
  public onBefore(
    context: ExecutorContextInterface<RequestAdapterFetchConfig, unknown>
  ): void {
    this.logger.log(
      `%c[Request before]%c [${new Date().toLocaleString()}] ${context.parameters.method} ${context.parameters.url}`,
      'color: #0ff;',
      'color: inherit;',
      context.parameters
    );
  }

  /**
   * @override
   */
  public async onSuccess({
    parameters,
    returnValue
  }: ExecutorContextInterface<
    RequestAdapterFetchConfig,
    unknown
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

  /**
   * @override
   */
  public onError({
    parameters,
    error
  }: ExecutorContextInterface<RequestAdapterFetchConfig, unknown>): void {
    this.loggerError(parameters, error);
  }

  public loggerError(config: RequestAdapterFetchConfig, error: unknown): void {
    this.logger.log(
      `%c[Request error]%c [${new Date().toLocaleString()}] ${config.method} ${config.url}`,
      'color: #f00;',
      'color: inherit;',
      error
    );
  }
}
