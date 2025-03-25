import type { IOCRegisterInterface } from '../../ioc/IOCContainerInterface';
import type { IOCManagerInterface } from '../../ioc/IOCManagerInterface';
import type {
  BootstrapContext,
  BootstrapExecutorPlugin
} from '../BootstrapExecutorPlugin';

export class InjectIOC<Container> implements BootstrapExecutorPlugin {
  readonly pluginName = 'InjectIOC';

  constructor(
    private IOC: IOCManagerInterface,
    private registeres: IOCRegisterInterface<Container>[]
  ) {}

  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    this.IOC.implement(ioc);

    // maybe runtimes configure
    ioc.configure(this.registeres);
  }

  onSuccess({ parameters: { logger } }: BootstrapContext): void {
    logger.debug('InjectIOC success!');
  }
}
