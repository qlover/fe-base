import type { IOCRegisterInterface } from '../../ioc/IOCContainerInterface';
import type { IOCManagerInterface } from '../../ioc/IOCManagerInterface';
import type {
  BootstrapContext,
  BootstrapExecutorPlugin
} from '../BootstrapExecutorPlugin';
import { Container } from 'inversify';

export class InjectIOC implements BootstrapExecutorPlugin {
  readonly pluginName = 'InjectIOC';

  constructor(
    private IOC: IOCManagerInterface,
    private registeres: IOCRegisterInterface<Container>[]
  ) {}

  onBefore({ parameters: { logger, ioc } }: BootstrapContext): void {
    this.IOC.implement(ioc);

    // maybe runtimes configure
    ioc.configure(this.registeres);
  }

  onSuccess({ parameters: { logger } }: BootstrapContext): void {
    logger.debug('InjectIOC success!');
  }
}
