import { inject, injectable } from 'inversify';
import type { useRouter } from '@/i18n/routing';
import { I } from '@config/IOCIdentifier';
import type { UIBridgeInterface } from '@qlover/corekit-bridge';
import type { LoggerInterface } from '@qlover/logger';

type AppRouterInstance = ReturnType<typeof useRouter>;

@injectable()
export class NavigateBridge implements UIBridgeInterface<AppRouterInstance> {
  protected navigate: AppRouterInstance | null = null;

  constructor(@inject(I.Logger) protected logger: LoggerInterface) {}

  public setUIBridge(ui: AppRouterInstance): void {
    this.navigate = ui;
  }

  public getUIBridge(): AppRouterInstance | null {
    if (!this.navigate) {
      this.logger.debug('NavigateBridge this.navigate is not set');
    }

    return this.navigate;
  }
}
