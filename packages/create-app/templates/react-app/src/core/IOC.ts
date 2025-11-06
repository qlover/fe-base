// ! dont't import tsx, only ts file
import { clientIOC } from './clientIoc/ClientIOC';

/**
 * IOC function
 *
 * This is the only and main exported content of the file
 *
 * - This is a global singleton instance of ClientIOC, and it is equivalent to clientIOC
 * - It is not recommended to use this global variable, but to recommend using the useIOC hook in the ui component
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
export const IOC = clientIOC.create();
