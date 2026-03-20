import type { BootstrapServerPlugin } from '@server/interfaces/ServerInterface';

export const nextApiServerBackstop: BootstrapServerPlugin = {
  pluginName: 'NextApiServerBackstop',
  onBefore({ parameters: { logger, root } }) {
    logger.log(`Request id: ${root.uuid} Start`);
  },

  onError(ctx) {
    const {
      parameters: { logger, root },
      error
    } = ctx;

    logger.error(`Request id: ${root.uuid} Unexpected Error`);
    logger.error(error);

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
