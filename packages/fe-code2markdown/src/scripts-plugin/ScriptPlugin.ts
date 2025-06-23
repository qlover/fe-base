/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ExecutorContext, ExecutorPlugin } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';
import type { Shell } from '@qlover/scripts-context';
import type ScriptContext from './ScriptContext';

export type StepOption<T> = {
  label: string;
  enabled?: boolean;
  task: () => Promise<T>;
};

export default abstract class ScriptPlugin<
  Context extends ScriptContext<any>,
  Props = unknown
> implements ExecutorPlugin<Context>
{
  readonly onlyOne = true;

  constructor(
    protected context: Context,
    readonly pluginName: string,
    protected props: Props = {} as Props
  ) {
    this.setConfig(this.getInitialProps(props));
  }

  getInitialProps(props?: Props): Props {
    return props as Props;
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

  enabled(_name: string, _context: ExecutorContext<Context>): boolean {
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

  setConfig(config: Partial<Props>): void {
    this.context.setConfig({
      [this.pluginName]: config
    });
  }

  onBefore?(_context: ExecutorContext<Context>): void | Promise<void> {}

  onExec?(_context: ExecutorContext<Context>): void | Promise<void> {}
  onSuccess?(_context: ExecutorContext<Context>): void | Promise<void> {}

  onError?(_context: ExecutorContext<Context>): void | Promise<void> {}

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
