import { ExecutorPlugin } from '@qlover/fe-utils';
import { DeepPartial, ExecutorReleaseContext, ReleaseConfig } from './type';
import { ScriptsLogger, Shell } from '@qlover/scripts-context';
import ReleaseContext from './interface/ReleaseContext';

export type StepOption<T> = {
  label: string;
  task: () => Promise<T>;
};

export default abstract class Plugin implements ExecutorPlugin {
  abstract readonly pluginName: string;
  readonly onlyOne = true;

  constructor(protected context: ReleaseContext) {}

  get logger(): ScriptsLogger {
    return this.context.logger;
  }

  get shell(): Shell {
    return this.context.shell;
  }

  getEnv(key: string, defaultValue?: string): string | undefined {
    return this.context.getEnv().get(key) ?? defaultValue;
  }

  enabled(): boolean {
    return true;
  }

  /**
   * get reelase config
   *
   * feConfig.release
   */
  getConfig(keys: string | string[], defaultValue?: unknown): unknown {
    return this.context.getConfig(keys, defaultValue);
  }

  /**
   * set release config
   */
  setConfig(config: DeepPartial<ReleaseConfig>): void {
    this.context.setConfig(config);
  }

  onBefore?(_context: ExecutorReleaseContext): void | Promise<void> {}

  onSuccess?(_context: ExecutorReleaseContext): void | Promise<void> {}

  onError?(_context: ExecutorReleaseContext): void | Promise<void> {}

  /**
   * run a step
   *
   * this will log the step and return the result of the task
   *
   * @param label - the label of the step
   * @param task - the task to run
   * @returns the result of the task
   */
  async step<T>({ label, task }: StepOption<T>): Promise<T> {
    this.logger.obtrusive(label);

    try {
      const res = await task();
      this.logger.info(`${label} - success`);
      return res;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
