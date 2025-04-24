// ! dont't import tsx, only ts file
import type {
  ApiMockPlugin,
  EnvConfigInterface,
  StorageTokenInterface,
  RequestCommonPlugin,
  ApiCatchPlugin,
  IOCContainerInterface
} from '@qlover/corekit-bridge';
import type { JSONSerializer, JSONStorage, Logger } from '@qlover/fe-corekit';
import { createIOCFunction } from '@/base/cases/ioc/createIOCFunction';
import { Container } from 'inversify';
import { InversifyRegisterInterface } from '@/base/port/InversifyIocInterface';
import { ServiceIdentifier } from '@/base/cases/ioc/IOCFunctionInterface';

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

  configure(registers?: InversifyRegisterInterface[]): void {
    if (registers) {
      registers.forEach((register) => register.register(this.container, this));
    }
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
  JSONStorage: 'JSONStorage',
  Logger: 'Logger',
  FeApiToken: 'FeApiToken',
  FeApiCommonPlugin: 'FeApiCommonPlugin',
  AppConfig: 'AppConfig',
  ApiMockPlugin: 'ApiMockPlugin',
  ApiCatchPlugin: 'ApiCatchPlugin'
});

/**
 * IOC identifier map
 */
export interface IOCIdentifierMap {
  [IOCIdentifier.JSON]: JSONSerializer;
  [IOCIdentifier.JSONStorage]: JSONStorage;
  [IOCIdentifier.Logger]: Logger;
  [IOCIdentifier.FeApiToken]: StorageTokenInterface<string>;
  [IOCIdentifier.FeApiCommonPlugin]: RequestCommonPlugin;
  [IOCIdentifier.AppConfig]: EnvConfigInterface;
  [IOCIdentifier.ApiMockPlugin]: ApiMockPlugin;
  [IOCIdentifier.ApiCatchPlugin]: ApiCatchPlugin;
}

export const IOC = createIOCFunction<IOCIdentifierMap>(
  new InversifyContainer()
);
