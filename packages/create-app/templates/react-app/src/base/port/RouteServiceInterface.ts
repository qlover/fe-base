import {
  LoggerInterface,
  StoreInterface,
  StoreStateInterface
} from '@qlover/corekit-bridge';
import { RouteConfigValue } from '../cases/RouterLoader';
import { NavigateFunction, NavigateOptions } from 'react-router-dom';

export interface RouteServiceStateInterface extends StoreStateInterface {
  routes: RouteConfigValue[];
  localeRoutes: boolean;
}

export abstract class RouteServiceInterface extends StoreInterface<RouteServiceStateInterface> {
  abstract get logger(): LoggerInterface;
  abstract get navigate(): NavigateFunction | undefined;

  abstract composePath(path: string): string;
  abstract getRoutes(): RouteConfigValue[];
  abstract changeRoutes(routes: RouteConfigValue[]): void;
  abstract goto(
    path: string,
    options?: NavigateOptions & { navigate?: NavigateFunction }
  ): void;
  abstract gotoLogin(): void;
  abstract replaceToHome(): void;
  abstract redirectToDefault(navigate: NavigateFunction): void;
  abstract i18nGuard(lng: string, navigate: NavigateFunction): void;
}
