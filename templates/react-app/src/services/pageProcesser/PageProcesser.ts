import { AsyncExecutor, ExecutorPlugin, Logger } from '@qlover/fe-utils';

export interface PageProcesserOptions {
  logger: Logger;
}

export class PageProcesser {
  private executor: AsyncExecutor;
  constructor(private options: PageProcesserOptions) {
    this.executor = new AsyncExecutor();
  }

  usePlugin(plugin: ExecutorPlugin): this {
    this.executor.use(plugin);
    return this;
  }

  handler(): Promise<{ success: boolean }> {
    return Promise.resolve({
      success: true,
    });
  }

  init(): Promise<unknown> {
    return this.executor.exec(this.handler).catch(() => {
      this.options.logger.error('PageProcesser init failed');
    });
  }
}
