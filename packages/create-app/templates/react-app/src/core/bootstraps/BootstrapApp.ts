import type { BootstrapExecutorPlugin } from '@qlover/fe-prod/core/bootstrap';

export class BootstrapApp implements BootstrapExecutorPlugin {
  readonly pluginName = 'BootstrapApp';

  onBefore(): void {}
}
