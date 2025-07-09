// ! dont't import tsx, only ts file
import {
  ApiMockPlugin,
  EnvConfigInterface,
  RequestCommonPlugin,
  ApiCatchPlugin,
  IOCContainerInterface,
  createIOCFunction,
  ServiceIdentifier,
  TokenStorage,
  CookieStorage
} from '@qlover/corekit-bridge';
import type { JSONSerializer, ObjectStorage } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';
import type { AppConfig } from '@/base/cases/AppConfig';
import { Container } from 'inversify';
import { IOCRegisterInterface } from '@qlover/corekit-bridge';
import { DialogHandler } from '@/base/cases/DialogHandler';

export type IocRegisterOptions = {
  pathname: string;
  appConfig: AppConfig;
};

export type InversifyRegisterContainer = Container;
/**
 * Inversify register interface.
 */
export interface InversifyRegisterInterface
  extends IOCRegisterInterface<InversifyContainer, IocRegisterOptions> {}

export class InversifyContainer implements IOCContainerInterface {
  private container: Container;

  constructor() {
    this.container = new Container({
      // allow `@injectable` decorator, auto bind injectable classes
      autobind: true,
      // use singleton scope
      defaultScope: 'Singleton'
    });
  }

  bind<T>(key: ServiceIdentifier<T>, value: T): void {
    this.container.bind<T>(key).toConstantValue(value);
  }

  get<K extends keyof IOCIdentifierMap>(
    serviceIdentifier: K
  ): IOCIdentifierMap[K];
  get<T>(serviceIdentifier: ServiceIdentifier<T>): T;
  get<T, K extends keyof IOCIdentifierMap>(
    serviceIdentifier: ServiceIdentifier<T> | K
  ): T | IOCIdentifierMap[K] {
    return this.container.get<T>(serviceIdentifier);
  }
}

/**
 * IOC identifier
 *
 * @description
 * IOC identifier is used to identify the service in the IOC container.
 *
 * @example
 * ```ts
 * const a = IOC(IOCIdentifier.JSON);
 * const b = IOC('JSON');
 * ```
 */
export const IOCIdentifier = Object.freeze({
  JSON: 'JSON',
  LocalStorage: 'LocalStorage',
  LocalStorageEncrypt: 'LocalStorageEncrypt',
  CookieStorage: 'CookieStorage',
  Logger: 'Logger',
  FeApiToken: 'FeApiToken',
  FeApiCommonPlugin: 'FeApiCommonPlugin',
  AppConfig: 'AppConfig',
  ApiMockPlugin: 'ApiMockPlugin',
  ApiCatchPlugin: 'ApiCatchPlugin',
  DialogHandler: 'DialogHandler'
});

/**
 * IOC identifier map
 */
export interface IOCIdentifierMap {
  [IOCIdentifier.JSON]: JSONSerializer;
  [IOCIdentifier.LocalStorage]: ObjectStorage<string, string>;
  [IOCIdentifier.LocalStorageEncrypt]: ObjectStorage<string, string>;
  [IOCIdentifier.CookieStorage]: CookieStorage;
  [IOCIdentifier.Logger]: LoggerInterface;
  [IOCIdentifier.FeApiToken]: TokenStorage<string>;
  [IOCIdentifier.FeApiCommonPlugin]: RequestCommonPlugin;
  [IOCIdentifier.AppConfig]: EnvConfigInterface;
  [IOCIdentifier.ApiMockPlugin]: ApiMockPlugin;
  [IOCIdentifier.ApiCatchPlugin]: ApiCatchPlugin;
  [IOCIdentifier.DialogHandler]: DialogHandler;
}

export const IOC = createIOCFunction<IOCIdentifierMap>(
  new InversifyContainer()
);
