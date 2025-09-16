import type { AppConfig } from '@/base/cases/AppConfig';
import type { DialogHandler } from '@/base/cases/DialogHandler';
import type { RouterService } from '@/base/cases/RouterService';
import type { DBBridgeInterface } from '@/base/port/DBBridgeInterface';
import type { I18nService } from '@/base/services/I18nService';
import type { UserService } from '@/base/services/UserService';
import type * as CorekitBridge from '@qlover/corekit-bridge';
import type * as FeCorekit from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

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
  CookieStorage: 'CookieStorage',
  UserServiceInterface: 'UserServiceInterface',
  RouterServiceInterface: 'RouterServiceInterface',
  I18nServiceInterface: 'I18nServiceInterface',
  DBBridgeInterface: 'DBBridgeInterface'
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
  [IOCIdentifier.Logger]: LoggerInterface;
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
  [IOCIdentifier.UserServiceInterface]: UserService;
  [IOCIdentifier.RouterServiceInterface]: RouterService;
  [IOCIdentifier.I18nServiceInterface]: I18nService;
  [IOCIdentifier.DialogHandler]: DialogHandler;
}

export interface IOCIdentifierMapServer {
  [IOCIdentifier.AppConfig]: AppConfig;
  [IOCIdentifier.Logger]: LoggerInterface;
  [IOCIdentifier.DBBridgeInterface]: DBBridgeInterface;
}
