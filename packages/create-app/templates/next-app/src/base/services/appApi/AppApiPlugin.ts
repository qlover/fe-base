import {
  ExecutorError,
  RequestError,
  type ExecutorContext,
  type ExecutorPlugin
} from '@qlover/fe-corekit';
import type { AppApiErrorInterface } from '@/base/port/AppApiInterface';
import type { UserApiConfig } from './AppUserType';

export class AppApiPlugin implements ExecutorPlugin {
  readonly pluginName = 'AppApiPlugin';

  isAppApiErrorInterface(value: unknown): value is AppApiErrorInterface {
    return (
      typeof value === 'object' &&
      value !== null &&
      'success' in value &&
      value.success === false &&
      'id' in value &&
      typeof value.id === 'string'
    );
  }

  onSuccess(context: ExecutorContext<unknown>): void | Promise<void> {
    const response = context.returnValue;

    if (this.isAppApiErrorInterface(response)) {
      throw new Error(response.message || response.id);
    }
  }

  async onError(
    context: ExecutorContext<UserApiConfig>
  ): Promise<ExecutorError | void> {
    const { error, parameters } = context;

    if (error instanceof RequestError && parameters.responseType === 'json') {
      // @ts-expect-error response is not defined in Error
      let response = error?.response;

      if (response instanceof Response) {
        // clone the response to avoid mutating the original response
        response = response.clone();

        const json = await this.getResponseJson(response);

        if (this.isAppApiErrorInterface(json)) {
          const newError = new ExecutorError(json.message || json.id);
          // context.error = newError;
          return newError;
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
}
