import type { RouteConfigValue } from '@/base/cases/RouterLoader';
import type { NavigateFunction, NavigateOptions } from 'react-router-dom';
import type { UIDependenciesInterface } from '@/base/port/UIDependenciesInterface';
import type { LoggerInterface } from '@qlover/logger';
import { I18nService } from '@/base/services/I18nService';
import { StoreInterface, StoreStateInterface } from '@qlover/corekit-bridge';

export type RouterServiceDependencies = {
  navigate: NavigateFunction;
};

export type RouterServiceOptions = {
  routes: RouteConfigValue[];
  logger: LoggerInterface;
};

export class RouterServiceState implements StoreStateInterface {
  constructor(public routes: RouteConfigValue[] = []) {}
}

export class RouteService
  extends StoreInterface<RouterServiceState>
  implements UIDependenciesInterface<RouterServiceDependencies>
{
  /**
   * @override
   */
  dependencies?: RouterServiceDependencies;

  constructor(private options: RouterServiceOptions) {
    super(() => new RouterServiceState(options.routes));
  }

  get logger(): LoggerInterface {
    return this.options.logger;
  }

  get navigate(): NavigateFunction | undefined {
    const navigate = this.dependencies?.navigate;

    if (!navigate) {
      this.logger.debug(
        'Please use `RouterServiceProvider` to set dependencies'
      );
    }

    return navigate;
  }

  composePath(path: string): string {
    const targetLang = I18nService.getCurrentLanguage();
    return `/${targetLang}${path}`;
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

  getRoutes(): RouteConfigValue[] {
    return this.state.routes;
  }

  changeRoutes(routes: RouteConfigValue[]): void {
    this.emit({ routes });
  }

  goto(path: string, options?: NavigateOptions): void {
    path = this.composePath(path);
    this.logger.debug('Goto path => ', path);
    this.navigate?.(path, options);
  }

  gotoLogin(): void {
    this.goto('/login', { replace: true });
  }

  replaceToHome(): void {
    this.goto('/', { replace: true });
  }
}
