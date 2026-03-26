import type { BootstrapServerPlugin } from '@server/interfaces/ServerInterface';

export const nextApiServerBackstop: BootstrapServerPlugin = {
  pluginName: 'NextApiServerBackstop',
  onBefore({ parameters: { logger, root, IOC } }) {
    logger.log(`Request id: ${root.uuid} Start`);

    const appConfig = IOC('SeedConfigInterface');

    logger.log(`appConfig: ${appConfig}`);
  },

  onError(ctx) {
    const {
      parameters: { logger, root },
      error
    } = ctx;

    // Single log line: avoid duplicate dumps (previously: generic line + second logger.error).
    const detail =
      error instanceof Error && error.cause !== undefined ? error.cause : error;
    logger.error(`Request id: ${root.uuid} Unexpected Error`, detail);

    // FIXME: 是否catch 所有错误
    // return new ExecutorError('Unexpected Error', {
    //   success: false,
    //   id: 'Unexpected Error',
    //   requestId: root.uuid,
    //   message: 'Unexpected Error'
    // });
  },

  onSuccess({ parameters: { logger, root } }) {
    logger.log(`Request id: ${root.uuid} Success`);
  }
};
