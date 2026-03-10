import type { I18nService } from '@/impls/I18nService';
import type { UserService } from '@/impls/UserService';
import type { SeedConfigInterface } from '@interfaces/SeedConfigInterface';
import type { ThemeService } from '@qlover/corekit-bridge';
import type * as FeCorekit from '@qlover/fe-corekit';
import type * as Logger from '@qlover/logger';

/**
 * IOC identifier
 */
export const IOCIdentifier = Object.freeze({
  JSONSerializer: 'JSONSerializer',
  Logger: 'Logger',
  Config: 'Config',
  I18nService: 'I18nService',
  ThemeService: 'ThemeService',
  UserService: 'UserService'
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
  [I.I18nService]: I18nService;
  [I.ThemeService]: ThemeService;
  [I.UserService]: UserService;
}
