import { ExecutorError, isRequestAdapterResponse } from '@qlover/fe-corekit';
import type { AppApiErrorInterface } from '@/base/port/AppApiInterface';
import type { AppApiConfig } from './AppApiRequester';
import type {
  ExecutorContextInterface,
  LifecyclePluginInterface
} from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

export class AppApiPlugin implements LifecyclePluginInterface<
  ExecutorContextInterface<AppApiConfig>
> {
  public readonly pluginName = 'AppApiPlugin';

  constructor(protected logger: LoggerInterface) {}

  public isAppApiErrorInterface(value: unknown): value is AppApiErrorInterface {
    return (
      typeof value === 'object' &&
      value !== null &&
      'success' in value &&
      value.success === false &&
      'id' in value &&
      typeof value.id === 'string'
    );
  }

  /**
   * @override
   */
  public onSuccess(context: ExecutorContextInterface<AppApiConfig>): void {
    const response = context.returnValue;
    const { parameters } = context;

    // Important: 当响应数据失败则抛出错误
    if (isRequestAdapterResponse(response)) {
      if (this.isAppApiErrorInterface(response.data)) {
        throw new ExecutorError(
          response.data.message || response.data.id,
          response
        );
      }
    }

    this.logger.info(
      `%c[AppApi ${parameters.method} ${parameters.url}]%c - ${new Date().toLocaleString()}`,
      'color: #0f0;',
      'color: inherit;',
      response
    );
  }

  /**
   * @override
   */
  public async onError(
    context: ExecutorContextInterface<AppApiConfig>
  ): Promise<ExecutorError | void> {
    const { error, parameters } = context;

    this.loggerError(parameters, error);

    if (error instanceof Error && parameters.responseType === 'json') {
      let response = error?.cause;

      if (response instanceof Response) {
        // clone the response to avoid mutating the original response
        response = response.clone();

        const json = await this.getResponseJson(response as Response);

        if (this.isAppApiErrorInterface(json)) {
          return new ExecutorError(json.id, json);
        }
      }
    }
  }

  protected async getResponseJson(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  protected loggerError(config: AppApiConfig, error: unknown): void {
    this.logger.error(
      `%c[AppApi ${config.method} ${config.url}]%c - ${new Date().toLocaleString()}`,
      'color: #f00;',
      'color: inherit;',
      error
    );
  }
}
