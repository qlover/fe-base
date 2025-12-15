import { StoreInterface } from '@qlover/corekit-bridge';
import type { RouteConfigValue } from '../cases/RouterLoader';
import type { StoreStateInterface } from '@qlover/corekit-bridge';
import type { LoggerInterface } from '@qlover/logger';
import type { NavigateFunction, NavigateOptions } from 'react-router-dom';

export interface RouteServiceStateInterface extends StoreStateInterface {
  routes: RouteConfigValue[];
  localeRoutes: boolean;
}

export abstract class RouteServiceInterface extends StoreInterface<RouteServiceStateInterface> {
  public abstract get logger(): LoggerInterface;

  public abstract getRoutes(): RouteConfigValue[];
  public abstract changeRoutes(routes: RouteConfigValue[]): void;
  public abstract goto(
    path: string,
    options?: NavigateOptions & { navigate?: NavigateFunction }
  ): void;
  public abstract gotoLogin(): void;
  public abstract replaceToHome(): void;
  public abstract redirectToDefault(navigate: NavigateFunction): void;
  public abstract i18nGuard(
    currentPath: string,
    lng: string,
    navigate?: NavigateFunction
  ): void;
}
