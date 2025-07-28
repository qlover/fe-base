// ! dont't import tsx, only ts file
import type { AppConfig } from '@/base/cases/AppConfig';
import type { IOCRegisterInterface } from '@qlover/corekit-bridge';
import { createIOCFunction } from '@qlover/corekit-bridge';
import { InversifyContainer } from '@/base/cases/InversifyContainer';
import { IOCIdentifier } from '@config/IOCIdentifier';

/**
 * IOC identifier map
 *
 * Define the implementation class corresponding to the string identifier
 */
export interface IOCIdentifierMap {
  [IOCIdentifier.JSON]: import('@qlover/fe-corekit').JSONSerializer;
  [IOCIdentifier.LocalStorage]: import('@qlover/fe-corekit').ObjectStorage<
    string,
    string
  >;
  [IOCIdentifier.LocalStorageEncrypt]: import('@qlover/fe-corekit').ObjectStorage<
    string,
    string
  >;
  [IOCIdentifier.CookieStorage]: import('@qlover/corekit-bridge').CookieStorage;
  [IOCIdentifier.Logger]: import('@qlover/logger').LoggerInterface;
  [IOCIdentifier.FeApiToken]: import('@qlover/corekit-bridge').TokenStorage<string>;
  [IOCIdentifier.FeApiCommonPlugin]: import('@qlover/corekit-bridge').RequestCommonPlugin;
  [IOCIdentifier.AppConfig]: import('@qlover/corekit-bridge').EnvConfigInterface;
  [IOCIdentifier.ApiMockPlugin]: import('@qlover/corekit-bridge').ApiMockPlugin;
  [IOCIdentifier.ApiCatchPlugin]: import('@qlover/corekit-bridge').ApiCatchPlugin;
  [IOCIdentifier.DialogHandler]: import('@/base/cases/DialogHandler').DialogHandler;
}

/**
 * IOC register options
 */
export type IocRegisterOptions = {
  /**
   * The pathname of the current page
   */
  pathname: string;

  /**
   * The app config
   */
  appConfig: AppConfig;
};

/**
 * IOC container
 *
 * This is a alias of IOCContainerInterface, use it without care about the implementation.
 *
 * Need to achieve the effect: when the implementation class on the right side of the equal sign changes, the IOCContainer will change automatically
 */
export type IOCContainer = InversifyContainer;

/**
 * IOC register interface.
 *
 * This is shortcut interface, implement this interface, you can use any IOC container.
 *
 * Need to achieve the effect: when the implementation class on the right side of the equal sign changes, the IOCContainer will change automatically
 */
export interface IOCRegister
  extends IOCRegisterInterface<IOCContainer, IocRegisterOptions> {}

/**
 * IOC function
 *
 * This is the only and main exported content of the file
 *
 * @example use A class
 * ```ts
 * const userService = IOC(UserService);
 * ```
 *
 * @example use A string identifier
 *
 * string identifier is shortcut for `IOCIdentifierMap` type, string key of `IOCIdentifier`
 *
 * ```ts
 * const logger = IOC('Logger'); // Logger instance
 *
 * // or
 * const logger = IOC(IOCIdentifier.Logger);
 * ```
 */
export const IOC = createIOCFunction<IOCIdentifierMap>(
  /**
   * If not inversify, you can use any IOC container,
   * then replace the InversifyContainer with your own IOC container
   */
  new InversifyContainer()
);
