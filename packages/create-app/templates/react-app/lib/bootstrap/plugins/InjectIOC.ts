import type { IOCRegisterInterface } from '../IOCContainerInterface';
import type { IOCManagerInterface } from '../IOCManagerInterface';
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

  onBefore(context: BootstrapContext): void {
    const { ioc } = context.parameters;
    this.IOC.implement(ioc);

    // maybe runtimes configure
    ioc.configure(this.registeres);
  }
}
