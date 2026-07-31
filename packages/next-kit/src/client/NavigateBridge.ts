import type { UIBridgeInterface } from '@qlover/corekit-bridge';
import type { LoggerInterface } from '@qlover/logger';

/**
 * Holds a client router/UI bridge instance (e.g. next-intl `useRouter()` result).
 * Apps construct with an injected logger — no IOC decorators in the kit.
 */
export class NavigateBridge<TRouter = unknown>
  implements UIBridgeInterface<TRouter>
{
  protected navigate: TRouter | null = null;

  constructor(protected logger: LoggerInterface) {}

  /**
   * @override
   */
  public setUIBridge(ui: TRouter): void {
    this.navigate = ui;
  }

  /**
   * @override
   */
  public getUIBridge(): TRouter | null {
    if (!this.navigate) {
      this.logger.debug('NavigateBridge this.navigate is not set');
    }

    return this.navigate;
  }
}
