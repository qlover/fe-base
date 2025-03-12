import { I18nService } from '@/services/I18nService';
import { UIDependenciesInterface } from '@/base/port/UIDependenciesInterface';
import { Logger } from '@qlover/fe-utils';
import { NavigateFunction, NavigateOptions } from 'react-router-dom';
import { RouteConfigValue } from '@lib/router-loader/RouterLoader';
import { RouteConfig } from '@/base/types/Page';

export type RouterControllerDependencies = {
  navigate: NavigateFunction;
};

export type RouterControllerOptions = {
  config: RouteConfig;
  logger: Logger;
};

export type RouterControllerState = {
  routes: RouteConfigValue[];
};

export class RouterController
  implements UIDependenciesInterface<RouterControllerDependencies>
{
  /**
   * @override
   */
  dependencies?: RouterControllerDependencies;

  state: RouterControllerState;

  constructor(private options: RouterControllerOptions) {
    this.state = {
      routes: options.config.routes
    };
  }

  get logger(): Logger {
    return this.options.logger;
  }

  get navigate(): NavigateFunction | undefined {
    const navigate = this.dependencies?.navigate;

    if (!navigate) {
      this.logger.debug('navigate is not set');
    }

    return navigate;
  }

  static composePath(path: string): string {
    const targetLang = I18nService.getCurrentLanguage();
    return `/${targetLang}${path}`;
  }

  /**
   * @override
   */
  setDependencies(dependencies: Partial<RouterControllerDependencies>): void {
    this.dependencies = Object.assign(
      this.dependencies || {},
      dependencies
    ) as RouterControllerDependencies;
  }

  getRoutes(): RouteConfigValue[] {
    return this.state.routes;
  }

  changeRoutes(routes: RouteConfigValue[]): void {
    this.state.routes = routes;
  }

  goto(path: string, options?: NavigateOptions): void {
    path = RouterController.composePath(path);
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
