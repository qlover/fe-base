// ! dont't import tsx, only ts file
import type { AppConfig } from '@/base/cases/AppConfig';
import type { IOCRegisterInterface } from '@qlover/corekit-bridge';
import { createIOCFunction } from '@qlover/corekit-bridge';
import { InversifyContainer } from '@/base/cases/InversifyContainer';
import { IOCIdentifierMap } from '@config/IOCIdentifierMap';

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
