import type { ThemeService } from '@qlover/corekit-bridge';
import type { SeedConfigInterface } from '@qlover/corekit-bridge/bootstrap';
import type * as FeCorekit from '@qlover/fe-corekit';
import type * as Logger from '@qlover/logger';
import type { OAuthClientInterface } from '@qlover/oauth-wrapper/client';

/**
 * IOC identifier
 */
export const IOCIdentifier = Object.freeze({
  JSONSerializer: 'JSONSerializer',
  Logger: 'Logger',
  Config: 'Config',
  ThemeService: 'ThemeService',
  OAuthClientInterface: 'OAuthClientInterface'
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
  [I.Config]: SeedConfigInterface;
  [I.ThemeService]: ThemeService;
  [I.OAuthClientInterface]: OAuthClientInterface;
}
