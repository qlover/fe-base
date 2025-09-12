import type { AppApiErrorInterface } from '@/base/port/AppApiInterface';
import type { ExecutorContext, ExecutorPlugin } from '@qlover/fe-corekit';

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
      throw new Error(response.id);
    }
  }
}
