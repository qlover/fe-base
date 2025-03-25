import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge';

export class BootstrapApp implements BootstrapExecutorPlugin {
  readonly pluginName = 'BootstrapApp';

  onBefore(): void {}
}
