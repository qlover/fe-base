import { ExecutorPlugin } from '@qlover/fe-utils';
import { DeepPartial, ExecutorReleaseContext, ReleaseConfig } from './type';
import { ScriptsLogger, Shell } from '@qlover/scripts-context';
import ReleaseContext from './ReleaseContext';

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
    return this.context.getConfig(
      ['release', ...(Array.isArray(keys) ? keys : [keys])],
      defaultValue
    );
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
  step<T>({ label, task }: StepOption<T>): Promise<T> {
    this.logger.verbose(label);

    return task().then((res) => {
      this.logger.verbose(`${label} - success`);
      return res;
    });
  }
}
