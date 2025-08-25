// ! dont't import tsx, only ts file
import type {
  EnvConfigInterface,
  IOCContainerInterface,
  IOCManagerInterface,
  IOCRegisterInterface
} from '@qlover/corekit-bridge';
import {
  createIOCFunction,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';
import { InversifyContainer } from '@/base/cases/InversifyContainer';
import { IOCIdentifierMap } from '@config/IOCIdentifier';
import { IocRegisterImpl } from './IocRegisterImpl';
import { appConfig } from './globals';
import { BootstrapClient } from './bootstraps/BootstrapClient';

/**
 * IOC register options
 */
export type IocRegisterOptions = {
  /**
   * The app config
   */
  appConfig: Record<string, unknown>;
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
export type IOCRegister = IOCRegisterInterface<
  IOCContainer,
  IocRegisterOptions
>;

let _ioc: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface> | null =
  null;

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
export const IOC = BootstrapClient.createSingletonIOC();
