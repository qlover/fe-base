import type * as FeCorekit from '@qlover/fe-corekit';
import type * as Logger from '@qlover/logger';

/**
 * IOC identifier
 */
export const IOCIdentifier = Object.freeze({
  JSONSerializer: 'JSONSerializer',
  Logger: 'Logger'
});

export const I = IOCIdentifier;

/**
 * IOC identifier map
 *
 * Define the implementation class corresponding to the string identifier
 *
 * - key: interface alias or name
 * - value: implementation class
 */
export interface IOCIdentifierMap {
  [IOCIdentifier.JSONSerializer]: FeCorekit.JSONSerializer;
  [IOCIdentifier.Logger]: Logger.LoggerInterface;
}
