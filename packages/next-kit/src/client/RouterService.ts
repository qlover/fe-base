import type { RouterInterface } from '../common/interfaces/RouterInterface';
import type { UIBridgeInterface } from '@qlover/corekit-bridge';

export type ClientRouterBridge = {
  push: (href: string) => void;
  replace: (href: string) => void;
};

export type RouterServiceOptions = {
  homePath?: string;
  loginPath?: string;
};

/**
 * Client router helper. Login/home paths are app options — not hard-coded.
 */
export class RouterService implements RouterInterface {
  protected locale: string = '';

  constructor(
    protected uiBridge: UIBridgeInterface<ClientRouterBridge>,
    protected options: RouterServiceOptions = {}
  ) {}

  /**
   * @override
   */
  public goto(href: string): void {
    this.uiBridge.getUIBridge()?.push(href);
  }

  /**
   * @override
   */
  public gotoHome(): void {
    this.goto(this.options.homePath ?? '/');
  }

  public gotoLogin(): void {
    this.goto(this.options.loginPath ?? '/login');
  }

  public replaceHome(): void {
    this.uiBridge.getUIBridge()?.replace(this.options.homePath ?? '/');
  }

  /**
   * @override
   */
  public setLocale(locale: string): void {
    this.locale = locale;
  }

  /**
   * @override
   */
  public getLocale(): string {
    return this.locale;
  }
}
