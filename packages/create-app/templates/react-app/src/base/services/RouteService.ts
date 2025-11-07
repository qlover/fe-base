import type { RouteConfigValue } from '@/base/cases/RouterLoader';
import { RouteServiceInterface } from '../port/RouteServiceInterface';
import type { I18nServiceInterface } from '../port/I18nServiceInterface';
import type {
  UIBridgeInterface,
  StoreStateInterface
} from '@qlover/corekit-bridge';
import type { LoggerInterface } from '@qlover/logger';
import type { NavigateFunction, NavigateOptions } from 'react-router-dom';

export type RouterServiceOptions = {
  routes: RouteConfigValue[];
  /**
   * Whether to use locale routes
   *
   * @default `false`
   */
  hasLocalRoutes?: boolean;
  logger: LoggerInterface;
};

export class RouterServiceState implements StoreStateInterface {
  constructor(
    public routes: RouteConfigValue[] = [],
    public localeRoutes: boolean = false
  ) {}
}

export class RouteService extends RouteServiceInterface {
  constructor(
    protected uiBridge: UIBridgeInterface<NavigateFunction>,
    protected i18nService: I18nServiceInterface,
    protected options: RouterServiceOptions
  ) {
    super(
      () => new RouterServiceState(options.routes, !!options.hasLocalRoutes)
    );
  }

  override get logger(): LoggerInterface {
    return this.options.logger;
  }

  protected composePath(path: string): string {
    if (this.state.localeRoutes) {
      const targetLang = this.i18nService.getCurrentLanguage();
      return `/${targetLang}${path}`;
    }
    return path.startsWith('/') ? path : `/${path}`;
  }

  override getRoutes(): RouteConfigValue[] {
    return this.state.routes;
  }

  override changeRoutes(routes: RouteConfigValue[]): void {
    this.emit(this.cloneState({ routes }));
  }

  override goto(
    path: string,
    options?: NavigateOptions & {
      navigate?: NavigateFunction;
    }
  ): void {
    const { navigate, ...rest } = options || {};
    path = this.composePath(path);
    this.logger.debug('Goto path => ', path);

    (navigate || this.uiBridge.getUIBridge())?.(path, rest);
  }

  override gotoLogin(): void {
    this.goto('/login', { replace: true });
  }

  override replaceToHome(): void {
    this.goto('/', { replace: true });
  }

  override redirectToDefault(navigate?: NavigateFunction): void {
    this.goto('/', { replace: true, navigate });
  }

  override i18nGuard(lng: string, navigate?: NavigateFunction): void {
    if (!this.state.localeRoutes) {
      return;
    }

    if (!lng) {
      this.goto('/404', { replace: true, navigate });
    } else if (!this.i18nService.isValidLanguage(lng)) {
      this.goto('/404', { replace: true, navigate });
    }
  }
}
