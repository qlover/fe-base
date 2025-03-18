import {
  IOCContainerInterface,
  IOCRegisterInterface
} from '@/base/port/IOCContainerInterface';
import { ExecutorContext } from '@qlover/fe-utils';
import type {
  BootstrapContext,
  BootstrapExecutorPlugin
} from '../BootstrapExecutorPlugin';
import { IOCFunction } from '@/base/port/IOCFunction';
import { Container } from 'inversify';

export class InjectIOC implements BootstrapExecutorPlugin {
  readonly pluginName = 'InjectIOC';

  constructor(
    private IOC: IOCFunction,
    private registeres: IOCRegisterInterface<Container>[]
  ) {}

  onBefore(context: BootstrapContext): void {
    const { ioc } = context.parameters;
    this.IOC.implement(ioc);

    // maybe runtimes configure
    ioc.configure(this.registeres);
  }
}
