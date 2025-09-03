import { ExecutorError, type ExecutorContext } from '@qlover/fe-corekit';
import { SERVER_AUTH_ERROR } from '@config/Identifier';
import type { BootstrapServerContextValue } from '@/core/bootstraps/BootstrapServer';
import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge';

export class ServerErrorHandler implements BootstrapExecutorPlugin {
  pluginName = 'ServerErrorHandler';

  onError(
    context: ExecutorContext<BootstrapServerContextValue>
  ): ExecutorError | void {
    const { parameters, error } = context;
    const { messages } = parameters;

    if (error instanceof Error) {
      const messageId = error.message;

      if (messageId === SERVER_AUTH_ERROR) {
        const message = messages[messageId];

        if (message) {
          return new ExecutorError(messageId, message);
        }
      }
    }
  }
}
