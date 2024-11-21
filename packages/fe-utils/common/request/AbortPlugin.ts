import { ExecutorPlugin } from '../executor';
import { FetchRequestError, FetchRequestErrorID } from './FetchRequest';
import { FetchRequestConfig } from './FetchRequestConfig';

export class AbortPlugin implements ExecutorPlugin {
  private controllers: Map<string, AbortController> = new Map();

  private generateRequestKey(config: FetchRequestConfig): string {
    const params = config.params ? JSON.stringify(config.params) : '';
    const data = config.data ? JSON.stringify(config.data) : '';
    return `${config.method || 'GET'}-${config.url}-${params}-${data}`;
  }

  onBefore(config: FetchRequestConfig): FetchRequestConfig {
    const key = this.generateRequestKey(config);

    // abort previous request
    if (this.controllers.has(key)) {
      this.abort(config);
    }

    const controller = new AbortController();
    this.controllers.set(key, controller);

    config.controller = controller;
    config.signal = controller.signal;
    return config;
  }

  onError(error: Error, config?: FetchRequestConfig): FetchRequestError | void {
    // if error is a abortError (DOMException or regular AbortError)
    if (
      error &&
      (error.name === 'AbortError' || error instanceof DOMException)
    ) {
      return new FetchRequestError(FetchRequestErrorID.ABORT_ERROR, error);
    }

    if (config && config.controller) {
      this.controllers.delete(this.generateRequestKey(config));
      const reason = config.controller.signal.reason;

      // reason maybe a DOMException or a FetchRequestError
      if (reason instanceof FetchRequestError) {
        return reason;
      }

      if (reason instanceof DOMException) {
        return new FetchRequestError(FetchRequestErrorID.ABORT_ERROR, reason);
      }

      if (config.controller.signal.aborted) {
        return new FetchRequestError(FetchRequestErrorID.ABORT_ERROR, error);
      }
    }
  }

  /**
   * abort specified request
   */
  abort(config: FetchRequestConfig): void {
    const key = this.generateRequestKey(config);
    const controller = this.controllers.get(key);
    if (controller && !controller.signal.aborted) {
      controller.abort(
        new FetchRequestError(
          FetchRequestErrorID.ABORT_ERROR,
          'The operation was aborted'
        )
      );
      this.controllers.delete(key);
      config.onAbort?.(config);
    }
  }

  /**
   * abort all requests
   */
  abortAll(): void {
    this.controllers.forEach((controller) => controller.abort());
    this.controllers.clear();
  }
}
