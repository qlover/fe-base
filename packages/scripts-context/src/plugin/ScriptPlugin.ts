import type { ExecutorContext, ExecutorPlugin } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';
import type ScriptContext from './ScriptContext';
import type { ShellInterface } from '../interface/ShellInterface';
import merge from 'lodash/merge';

export type StepOption<T> = {
  label: string;
  enabled?: boolean;
  task: () => Promise<T>;
};

export interface ScriptPluginProps {
  /**
   * 是否跳过生命周期执行
   *
   * - true 跳过所有
   * - string, 可以是 onBefore,onExec,onSuccess,onError 字符串
   */
  skip?: boolean | string;
}

export default abstract class ScriptPlugin<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Context extends ScriptContext<any>,
  Props extends ScriptPluginProps = ScriptPluginProps
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
    if (typeof this.context.options !== 'object') {
      return {} as Props;
    }

    // command line config, first priority
    const pluginConfig = this.context.options[this.pluginName];

    const fileConfig = this.context.getStore(this.pluginName);

    // Determine base config: command line config takes priority over file config
    const baseConfig = pluginConfig || fileConfig;

    // If props are provided, merge them with base config
    // If no props provided, return base config or empty object
    return props ? merge({}, baseConfig, props) : baseConfig || ({} as Props);
  }

  get logger(): LoggerInterface {
    return this.context.logger as unknown as LoggerInterface;
  }

  get shell(): ShellInterface {
    return this.context.shell;
  }

  get options(): Props {
    return this.context.getStore(this.pluginName, {} as Props);
  }

  enabled(_name: string, _context: ExecutorContext<Context>): boolean {
    const skip = this.getConfig('skip');

    // if skip is true, then return false
    if (skip === true) {
      return false;
    }

    // if skip is a string, and the name is the same as the skip, then return false
    if (typeof skip === 'string' && _name === skip) {
      return false;
    }

    return true;
  }

  getConfig<T>(keys?: string | string[], defaultValue?: T): T {
    if (!keys) {
      return this.context.getStore(this.pluginName, defaultValue);
    }

    return this.context.getStore(
      [this.pluginName, ...(Array.isArray(keys) ? keys : [keys])],
      defaultValue
    );
  }

  setConfig(config: Partial<Props>): void {
    this.context.setStore({
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
