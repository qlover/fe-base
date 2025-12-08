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
  abstract get logger(): LoggerInterface;

  abstract getRoutes(): RouteConfigValue[];
  abstract changeRoutes(routes: RouteConfigValue[]): void;
  abstract goto(
    path: string,
    options?: NavigateOptions & { navigate?: NavigateFunction }
  ): void;
  abstract gotoLogin(): void;
  abstract replaceToHome(): void;
  abstract redirectToDefault(navigate: NavigateFunction): void;
  abstract i18nGuard(
    currentPath: string,
    lng: string,
    navigate?: NavigateFunction
  ): void;
}
