import type {
  IOCContainerInterface,
  IOCManagerInterface,
  IOCRegisterInterface
} from '../../ioc';
import type {
  BootstrapContext,
  BootstrapExecutorPlugin
} from '../BootstrapExecutorPlugin';

export interface InjectIOCOptions<Container extends IOCContainerInterface> {
  /**
   * IOC manager
   */
  manager: IOCManagerInterface<Container>;

  /**
   * IOC register
   */
  register?: IOCRegisterInterface<Container>;
}

export class InjectIOC<Container extends IOCContainerInterface>
  implements BootstrapExecutorPlugin
{
  public readonly pluginName = 'InjectIOC';

  constructor(
    /**
     * @since 2.0.0
     */
    protected options: InjectIOCOptions<Container>
  ) {}

  public static isIocManager<C extends IOCContainerInterface>(
    ioc?: unknown
  ): ioc is IOCManagerInterface<C> {
    return (
      typeof ioc === 'object' &&
      ioc !== null &&
      'implemention' in ioc &&
      'get' in ioc &&
      'implement' in ioc &&
      typeof ioc['get'] === 'function' &&
      typeof ioc['implement'] === 'function'
    );
  }

  public startup(): void {
    const { manager, register } = this.options;

    if (!manager.implemention) {
      throw new Error('IOC Container is not implemented');
    }

    // maybe runtimes configure
    if (register) {
      register.register(manager.implemention, manager, null);
    }
  }

  /**
   * @override
   */
  public onBefore(): void {
    this.startup();
  }

  /**
   * @override
   */
  public onSuccess({ parameters: { logger } }: BootstrapContext): void {
    logger.debug('InjectIOC success!');
  }
}
