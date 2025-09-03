import { injectable } from 'inversify';
import type { UIBridgeInterface } from '@qlover/corekit-bridge';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

@injectable()
export class NavigateBridge implements UIBridgeInterface<AppRouterInstance> {
  protected navigate: AppRouterInstance | null = null;

  setUIBridge(ui: AppRouterInstance): void {
    this.navigate = ui;
  }

  getUIBridge(): AppRouterInstance | null {
    return this.navigate;
  }
}
