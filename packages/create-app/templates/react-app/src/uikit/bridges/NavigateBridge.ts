import { UIBridgeInterface } from '@qlover/corekit-bridge';
import { injectable } from 'inversify';
import { NavigateFunction } from 'react-router-dom';

@injectable()
export class NavigateBridge implements UIBridgeInterface<NavigateFunction> {
  protected navigate: NavigateFunction | null = null;

  public setUIBridge(ui: NavigateFunction): void {
    this.navigate = ui;
  }

  public getUIBridge(): NavigateFunction | null {
    return this.navigate;
  }
}
