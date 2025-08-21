import { AppConfig } from '@/base/cases/AppConfig';
import type * as CorekitBridge from '@qlover/corekit-bridge';
import type * as FeCorekit from '@qlover/fe-corekit';
import type * as Logger from '@qlover/logger';

/**
 * IOC identifier
 */
export const IOCIdentifier = Object.freeze({
  JSONSerializer: 'JSONSerializer',
  Logger: 'Logger',
  AppConfig: 'AppConfig',
  DialogHandler: 'DialogHandler',
  LocalStorage: 'LocalStorage',
  LocalStorageEncrypt: 'LocalStorageEncrypt',
  CookieStorage: 'CookieStorage'
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
  [IOCIdentifier.Logger]: Logger.Logger;
  [IOCIdentifier.LocalStorage]: FeCorekit.SyncStorage<
    unknown,
    FeCorekit.ObjectStorageOptions
  >;
  [IOCIdentifier.LocalStorageEncrypt]: FeCorekit.SyncStorage<
    unknown,
    FeCorekit.ObjectStorageOptions
  >;
  [IOCIdentifier.CookieStorage]: CorekitBridge.CookieStorage;
  [IOCIdentifier.AppConfig]: AppConfig;
}
