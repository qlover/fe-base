import type { DialogHandler } from '@/impls/DialogHandler';
import type { I18nService } from '@/impls/I18nService';
import type { RouterService } from '@/impls/RouterService';
import type { UserService } from '@/impls/UserService';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { SupabaseBridge } from '@server/repositorys/SupabaseBridge';
import type * as CorekitBridge from '@qlover/corekit-bridge';
import type * as FeCorekit from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

/**
 * IOC identifier
 */
export const IOCIdentifier = Object.freeze({
  JSONSerializer: 'JSONSerializer',
  Logger: 'Logger',
  AppConfig: 'SeedConfigInterface',
  DialogHandler: 'DialogHandler',
  LocalStorage: 'LocalStorage',
  LocalStorageEncrypt: 'LocalStorageEncrypt',
  CookieStorage: 'CookieStorage',
  UserServiceInterface: 'UserServiceInterface',
  RouterServiceInterface: 'RouterServiceInterface',
  I18nServiceInterface: 'I18nServiceInterface',
  /**
   * 数据库桥接接口
   *
   * 你可以实现不同的例如：
   *
   * - Vercel Postgres
   * - supabase
   * - mysql
   * - postgresql
   * - mongodb
   * - redis
   * - sqllite
   */
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
  [IOCIdentifier.LocalStorage]: FeCorekit.StorageInterface<
    string,
    unknown,
    FeCorekit.ObjectStorageOptions
  >;
  [IOCIdentifier.LocalStorageEncrypt]: FeCorekit.StorageInterface<
    string,
    unknown,
    FeCorekit.ObjectStorageOptions
  >;
  [IOCIdentifier.CookieStorage]: CorekitBridge.CookieStorage;
  [IOCIdentifier.AppConfig]: CorekitBridge.SeedConfigInterface;
  [IOCIdentifier.UserServiceInterface]: UserService;
  [IOCIdentifier.RouterServiceInterface]: RouterService;
  [IOCIdentifier.I18nServiceInterface]: I18nService;
  [IOCIdentifier.DialogHandler]: DialogHandler;
}

export interface IOCIdentifierMapServer {
  [IOCIdentifier.Logger]: LoggerInterface;
  [IOCIdentifier.AppConfig]: SeedServerConfigInterface;
  [IOCIdentifier.DBBridgeInterface]: SupabaseBridge;
}
