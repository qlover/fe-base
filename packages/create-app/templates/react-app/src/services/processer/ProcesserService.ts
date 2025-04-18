import { AsyncExecutor, ExecutorPlugin, Logger } from '@qlover/fe-utils';

export interface ProcesserServiceOptions {
  logger: Logger;
}

export class ProcesserService {
  private executor: AsyncExecutor;
  constructor(private options: ProcesserServiceOptions) {
    this.executor = new AsyncExecutor();
  }

  usePlugin(plugin: ExecutorPlugin): this {
    this.executor.use(plugin);
    return this;
  }

  handler(): Promise<{ success: boolean }> {
    return Promise.resolve({
      success: true
    });
  }

  init(): Promise<unknown> {
    return this.executor.exec(this.handler).catch((err) => {
      this.options.logger.error('PageProcesser init failed', err);
    });
  }
}
