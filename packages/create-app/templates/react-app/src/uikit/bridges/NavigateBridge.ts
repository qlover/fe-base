import { UIBridgeInterface } from '@qlover/corekit-bridge';
import { injectable } from 'inversify';
import { NavigateFunction } from 'react-router-dom';

@injectable()
export class NavigateBridge implements UIBridgeInterface<NavigateFunction> {
  protected navigate: NavigateFunction | null = null;

  setUIBridge(ui: NavigateFunction): void {
    this.navigate = ui;
  }

  getUIBridge(): NavigateFunction | null {
    return this.navigate;
  }
}
