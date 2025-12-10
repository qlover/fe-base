import { inject, injectable } from 'inversify';
import { I } from '@config/IOCIdentifier';
import type { UIBridgeInterface } from '@qlover/corekit-bridge';
import type { LoggerInterface } from '@qlover/logger';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

@injectable()
export class NavigateBridge implements UIBridgeInterface<AppRouterInstance> {
  protected navigate: AppRouterInstance | null = null;

  constructor(@inject(I.Logger) protected logger: LoggerInterface) {}

  setUIBridge(ui: AppRouterInstance): void {
    this.navigate = ui;
  }

  getUIBridge(): AppRouterInstance | null {
    if (!this.navigate) {
      this.logger.debug('NavigateBridge this.navigate is not set');
    }

    return this.navigate;
  }
}
