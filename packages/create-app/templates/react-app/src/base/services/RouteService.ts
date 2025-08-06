import type { RouteConfigValue } from '@/base/cases/RouterLoader';
import type { NavigateFunction, NavigateOptions } from 'react-router-dom';
import type { UIDependenciesInterface } from '@/base/port/UIDependenciesInterface';
import type { LoggerInterface } from '@qlover/logger';
import { I18nService } from '@/base/services/I18nService';
import { type StoreStateInterface } from '@qlover/corekit-bridge';
import { RouteServiceInterface } from '../port/RouteServiceInterface';

export type RouterServiceDependencies = {
  navigate: NavigateFunction;
};

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

export class RouteService
  extends RouteServiceInterface
  implements UIDependenciesInterface<RouterServiceDependencies>
{
  /**
   * @override
   */
  dependencies?: RouterServiceDependencies;

  constructor(private options: RouterServiceOptions) {
    super(
      () => new RouterServiceState(options.routes, !!options.hasLocalRoutes)
    );
  }

  override get logger(): LoggerInterface {
    return this.options.logger;
  }

  override get navigate(): NavigateFunction | undefined {
    const navigate = this.dependencies?.navigate;

    if (!navigate) {
      this.logger.debug(
        'Please use `RouteService.setDependencies` to set dependencies'
      );
    }

    return navigate;
  }

  override composePath(path: string): string {
    if (this.state.localeRoutes) {
      const targetLang = I18nService.getCurrentLanguage();
      return `/${targetLang}${path}`;
    }
    return path.startsWith('/') ? path : `/${path}`;
  }

  /**
   * @override
   */
  setDependencies(dependencies: Partial<RouterServiceDependencies>): void {
    this.dependencies = Object.assign(
      this.dependencies || {},
      dependencies
    ) as RouterServiceDependencies;
  }

  override getRoutes(): RouteConfigValue[] {
    return this.state.routes;
  }

  override changeRoutes(routes: RouteConfigValue[]): void {
    this.emit({ routes, localeRoutes: this.state.localeRoutes });
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
    (navigate || this.navigate)?.(path, rest);
  }

  override gotoLogin(): void {
    this.goto('/login', { replace: true });
  }

  override replaceToHome(): void {
    this.goto('/', { replace: true });
  }

  override redirectToDefault(navigate: NavigateFunction): void {
    this.goto('/', { replace: true, navigate });
  }

  override i18nGuard(lng: string, navigate: NavigateFunction): void {
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
