import type { ExecutorPlugin, Logger } from '@qlover/fe-corekit';
import type { DeepPartial, ExecutorReleaseContext, StepOption } from './type';
import type { Shell } from '@qlover/scripts-context';
import type ReleaseContext from './interface/ReleaseContext';
import merge from 'lodash/merge';

export default abstract class Plugin<Props = unknown>
  implements ExecutorPlugin<ReleaseContext>
{
  readonly onlyOne = true;
  protected props: Props = {} as Props;

  constructor(
    protected context: ReleaseContext,
    readonly pluginName: string,
    props?: Props
  ) {
    // command line config, first priority
    const pluginConfig =
      context.options[pluginName as keyof typeof context.options];

    this.props =
      // plugin config, second priority
      pluginConfig || props ? merge({}, props, pluginConfig) : ({} as Props);

    this.setConfig(this.props);
  }

  get logger(): Logger {
    return this.context.logger as unknown as Logger;
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

  enabled(): boolean {
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
