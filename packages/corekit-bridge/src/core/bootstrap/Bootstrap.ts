import { ExecutorError, SyncExecutor } from '@qlover/fe-corekit';
import type {
  BootstrapContextValue,
  BootstrapExecutorPlugin
} from './BootstrapExecutorPlugin';
import { InjectEnv, type InjectEnvConfig } from './plugins/InjectEnv';
import { InjectIOC, InjectIOCOptions } from './plugins/InjectIOC';
import { InjectGlobal, InjectGlobalConfig } from './plugins/InjectGlobal';
import { IOCContainerInterface, IOCManagerInterface } from '../ioc';

export interface BootstrapConfig<Container extends IOCContainerInterface>
  extends Omit<BootstrapContextValue, 'ioc'> {
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

export class Bootstrap<
  Container extends IOCContainerInterface = IOCContainerInterface
> extends SyncExecutor {
  constructor(
    /**
     * @since 2.0.0
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

  public getContext(): BootstrapContextValue {
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

  public start(): Promise<BootstrapContextValue> {
    const context = this.getContext();
    return this.exec(context, () => Promise.resolve(context));
  }

  public startNoError():
    | Promise<BootstrapContextValue | ExecutorError>
    | ExecutorError {
    const context = this.getContext();
    return this.execNoError(context, () => Promise.resolve(context));
  }
}
