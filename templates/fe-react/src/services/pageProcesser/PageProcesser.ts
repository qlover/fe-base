import { AsyncExecutor, ExecutorPlugin, Logger } from '@qlover/fe-utils';

export interface PageProcesserOptions {
  logger: Logger;
}

export class PageProcesser {
  private executor: AsyncExecutor;
  private logger: Logger;
  constructor({ logger }: PageProcesserOptions) {
    this.executor = new AsyncExecutor();
    this.logger = logger;
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
    return this.executor.exec(this.handler);
  }
}
