import type { RouteConfigValue } from '@/base/cases/RouterLoader';
import type { NavigateFunction, NavigateOptions } from 'react-router-dom';
import type { LoggerInterface } from '@qlover/logger';
import { I18nService } from '@/base/services/I18nService';
import {
  StoreInterface,
  type UIBridgeInterface,
  type StoreStateInterface
} from '@qlover/corekit-bridge';

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

export class RouteService extends StoreInterface<RouterServiceState> {
  constructor(
    protected uiBridge: UIBridgeInterface<NavigateFunction>,
    protected options: RouterServiceOptions
  ) {
    super(
      () => new RouterServiceState(options.routes, !!options.hasLocalRoutes)
    );
  }

  get logger(): LoggerInterface {
    return this.options.logger;
  }

  get navigate(): NavigateFunction | null {
    const navigate = this.uiBridge.getUIBridge();

    if (!navigate) {
      this.logger.debug(
        'Please use `RouteService.setDependencies` to set dependencies'
      );
    }

    return navigate;
  }

  composePath(path: string): string {
    if (this.state.localeRoutes) {
      const targetLang = I18nService.getCurrentLanguage();
      return `/${targetLang}${path}`;
    }
    return path.startsWith('/') ? path : `/${path}`;
  }

  getRoutes(): RouteConfigValue[] {
    return this.state.routes;
  }

  changeRoutes(routes: RouteConfigValue[]): void {
    this.emit({ routes, localeRoutes: this.state.localeRoutes });
  }

  goto(
    path: string,
    options?: NavigateOptions & {
      navigate?: NavigateFunction;
    }
  ): void {
    const { navigate, ...rest } = options || {};
    path = this.composePath(path);
    this.logger.debug('Goto path => ', path);
    (navigate || this.navigate)?.(path, rest);
  }

  gotoLogin(): void {
    this.goto('/login', { replace: true });
  }

  replaceToHome(): void {
    this.goto('/', { replace: true });
  }

  redirectToDefault(navigate: NavigateFunction): void {
    this.goto('/', { replace: true, navigate });
  }

  i18nGuard(lng: string, navigate: NavigateFunction): void {
    if (!this.state.localeRoutes) {
      return;
    }

    if (!lng) {
      this.goto('/404', { replace: true, navigate });
    } else if (!I18nService.isValidLanguage(lng)) {
      this.goto('/404', { replace: true, navigate });
    }
  }
}
