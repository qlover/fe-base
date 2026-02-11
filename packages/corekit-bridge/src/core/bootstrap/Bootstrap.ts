import { LifecycleSyncExecutor, type ExecutorError } from '@qlover/fe-corekit';
import type {
  BootstrapPluginOptions,
  BootstrapExecutorPlugin,
  BootstrapContext
} from './BootstrapExecutorPlugin';
import { InjectEnv, type InjectEnvConfig } from './plugins/InjectEnv';
import { InjectIOC, type InjectIOCOptions } from './plugins/InjectIOC';
import { InjectGlobal, type InjectGlobalConfig } from './plugins/InjectGlobal';
import { type IOCContainerInterface, type IOCManagerInterface } from '../ioc';

export interface BootstrapConfig<
  Container extends IOCContainerInterface
> extends Omit<BootstrapPluginOptions, 'ioc'> {
  /**
   * InjectIOC options
   *
   * or is a IOCManagerInterface
   */
  ioc?: InjectIOCOptions<Container> | IOCManagerInterface<Container>;

  /**
   * InjectEnv options
   */
  envOptions?: InjectEnvConfig;

  /**
   * InjectGlobal options
   */
  globalOptions?: InjectGlobalConfig;
}

/**
 * Bootstrap executor
 *
 * After 3.0.0, SyncExecutor is replaced by LifecycleSyncExecutor
 *
 * @template Container - Type of IOC container
 * @example
 * ```typescript
 * const bootstrap = new Bootstrap({
 *   ioc: new IOCContainer(),
 * });
 * await bootstrap.initialize();
 * ```
 */
export class Bootstrap<
  Container extends IOCContainerInterface = IOCContainerInterface
> extends LifecycleSyncExecutor<BootstrapContext> {
  constructor(
    /**
     * @since `2.0.0`
     */
    protected options: BootstrapConfig<Container>
  ) {
    super();

    // correction ioc parameter
    if (options.ioc && InjectIOC.isIocManager(options.ioc)) {
      this.options.ioc = {
        manager: options.ioc
      };
    }
  }

  public setOptions(options: Partial<BootstrapConfig<Container>>): this {
    this.options = { ...this.options, ...options };
    return this;
  }

  public async initialize(): Promise<void> {
    const { ioc: iocOptions, envOptions, globalOptions } = this.options;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inits: [new (options: any) => BootstrapExecutorPlugin, any][] = [
      [InjectEnv, envOptions],
      [InjectIOC, iocOptions],
      [InjectGlobal, globalOptions]
    ];

    const plugins = inits
      .filter(([_, options]) => options !== undefined)
      .map(([Plugin, options]) => new Plugin(options));

    this.use(plugins);

    await this.start();

    this.plugins = [];
  }

  public getIOCContainer(): Container | undefined {
    const ioc = this.options.ioc as InjectIOCOptions<Container>;

    if (ioc?.manager && ioc.manager.implemention) {
      return ioc.manager.implemention;
    }

    return undefined;
  }

  public getContext(): BootstrapPluginOptions {
    return {
      root: this.options.root,
      ioc: this.getIOCContainer()!,
      logger: this.options.logger
    };
  }

  public use(
    plugin: BootstrapExecutorPlugin | BootstrapExecutorPlugin[],
    skip?: boolean
  ): this {
    // skip plugin
    if (skip) {
      return this;
    }

    if (Array.isArray(plugin)) {
      plugin.forEach((p) => super.use(p));
      return this;
    }

    super.use(plugin);

    return this;
  }

  public start(): Promise<BootstrapPluginOptions> {
    const context = this.getContext();
    return this.exec(context, () => Promise.resolve(context));
  }

  public startNoError():
    | Promise<BootstrapPluginOptions | ExecutorError>
    | ExecutorError {
    const context = this.getContext();
    return this.execNoError(context, () => Promise.resolve(context));
  }
}
