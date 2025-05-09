import type { ExecutorPlugin } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';
import type { DeepPartial, ExecutorReleaseContext, StepOption } from '../type';
import type { Shell } from '@qlover/scripts-context';
import type ReleaseContext from '../implments/ReleaseContext';
import merge from 'lodash/merge';
import get from 'lodash/get';

export default abstract class Plugin<Props = unknown>
  implements ExecutorPlugin<ReleaseContext>
{
  readonly onlyOne = true;

  constructor(
    protected context: ReleaseContext,
    readonly pluginName: string,
    protected props: Props = {} as Props
  ) {
    this.setConfig(this.getInitialProps(props));
  }

  getInitialProps(props?: Props): Props {
    // command line config, first priority
    const pluginConfig =
      this.context.options[
        this.pluginName as keyof typeof this.context.options
      ];

    const fileConfig = get(this.context.shared, this.pluginName);
    // plugin config, second priority
    return pluginConfig || props
      ? merge({}, fileConfig, props, pluginConfig)
      : ({} as Props);
  }

  get logger(): LoggerInterface {
    return this.context.logger as unknown as LoggerInterface;
  }

  get shell(): Shell {
    return this.context.shell;
  }

  get options(): Props {
    return this.context.getConfig(this.pluginName, {} as Props);
  }

  getEnv(key: string, defaultValue?: string): string | undefined {
    return this.context.env.get(key) ?? defaultValue;
  }

  enabled(_name: string, _context: ExecutorReleaseContext): boolean {
    return true;
  }

  getConfig<T>(keys?: string | string[], defaultValue?: T): T {
    if (!keys) {
      return this.context.getConfig(this.pluginName, defaultValue);
    }

    return this.context.getConfig(
      [this.pluginName, ...(Array.isArray(keys) ? keys : [keys])],
      defaultValue
    );
  }

  setConfig(config: DeepPartial<Props>): void {
    this.context.setConfig({
      [this.pluginName]: config
    });
  }

  onBefore?(_context: ExecutorReleaseContext): void | Promise<void> {}

  onExec?(_context: ExecutorReleaseContext): void | Promise<void> {}
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
    this.logger.log();
    this.logger.info(label);
    this.logger.log();

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
