import type { ReactSeedConfigInterface } from '@/interfaces/ReactSeedConfigInterface';
import type * as FeCorekit from '@qlover/fe-corekit';
import type * as Logger from '@qlover/logger';

/**
 * IOC identifier
 */
export const IOCIdentifier = Object.freeze({
  JSONSerializer: 'JSONSerializer',
  Logger: 'Logger',
  Config: 'Config'
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
  [I.JSONSerializer]: FeCorekit.JSONSerializer;
  [I.Logger]: Logger.LoggerInterface;
  [I.Config]: ReactSeedConfigInterface;
}
