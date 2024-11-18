import { ExecutorPlugin } from '../executor';
import { FetchRequestConfig } from './FetchRequest';

export class AbortPlugin implements ExecutorPlugin {
  private controllers: Map<string, AbortController> = new Map();

  private generateRequestKey(config: FetchRequestConfig): string {
    return `${config.method || 'GET'}-${config.url}`;
  }

  onBefore(config: FetchRequestConfig): void {
    const key = this.generateRequestKey(config);

    // if exists same request, abort previous request
    const prevController = this.controllers.get(key);
    if (prevController) {
      prevController.abort();
    }

    // create new AbortController
    const controller = new AbortController();
    this.controllers.set(key, controller);

    // add signal to config
    config.controller = controller;
    config.signal = controller.signal;
  }

  onFinally(config: FetchRequestConfig): void {
    const key = this.generateRequestKey(config);
    this.controllers.delete(key);
  }

  /**
   * abort specified request
   */
  abort(config: FetchRequestConfig): void {
    const key = this.generateRequestKey(config);
    const controller = this.controllers.get(key);
    if (controller) {
      controller.abort();
      this.controllers.delete(key);
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
