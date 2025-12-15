import {
  ExecutorError,
  RequestError,
  type ExecutorContext,
  type ExecutorPlugin
} from '@qlover/fe-corekit';
import type { AppApiErrorInterface } from '@/base/port/AppApiInterface';
import type { AppApiConfig } from './AppApiRequester';
import type { LoggerInterface } from '@qlover/logger';

export class AppApiPlugin implements ExecutorPlugin {
  public readonly pluginName = 'AppApiPlugin';

  constructor(protected logger: LoggerInterface) {}

  /**
   * @override
   */
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
  public onSuccess(
    context: ExecutorContext<AppApiConfig>
  ): void | Promise<void> {
    const response = context.returnValue;
    const { parameters } = context;

    this.logger.info(
      `%c[AppApi ${parameters.method} ${parameters.url}]%c - ${new Date().toLocaleString()}`,
      'color: #0f0;',
      'color: inherit;',
      response
    );

    if (this.isAppApiErrorInterface(response)) {
      throw new Error(response.message || response.id);
    }
  }

  /**
   * @override
   */
  public async onError(
    context: ExecutorContext<AppApiConfig>
  ): Promise<ExecutorError | void> {
    const { error, parameters } = context;

    this.loggerError(parameters, error);

    if (error instanceof RequestError && parameters.responseType === 'json') {
      // @ts-expect-error response is not defined in Error
      let response = error?.response;

      if (response instanceof Response) {
        // clone the response to avoid mutating the original response
        response = response.clone();

        const json = await this.getResponseJson(response);

        if (this.isAppApiErrorInterface(json)) {
          const newError = new ExecutorError(json.id, json.message);
          // context.error = newError;
          return newError;
        }
      }
    }
  }

  /**
   * @override
   */
  protected async getResponseJson(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  /**
   * @override
   */
  protected loggerError(config: AppApiConfig, error: unknown): void {
    this.logger.error(
      `%c[AppApi ${config.method} ${config.url}]%c - ${new Date().toLocaleString()}`,
      'color: #f00;',
      'color: inherit;',
      error
    );
  }
}
