import type { DialogHandler } from '@/impls/DialogHandler';
import type { I18nService } from '@/impls/I18nService';
import type { RouterService } from '@/impls/RouterService';
import type { UserService } from '@/impls/UserService';
import type { ZustandCounterService } from '@/impls/ZustandCounterService';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { OAuthWrapperProviderInterface } from '@server/interfaces/OAuthWrapperProviderInterface';
import type { ServerContextInterface } from '@server/interfaces/ServerContextInterface';
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
  ZustandCounterServiceInterface: 'ZustandCounterServiceInterface',
  /**
   * OAuth 包装服务提供接口
   */
  OAuthWrapperProviderInterface: 'OAuthWrapperProviderInterface',

  /**
   * 服务器状态接口, 其实和 config 类型，不过仅仅用于保存当次会话的配置状态
   *
   * 比如当次请求的 locale 等
   */
  ServerContextInterface: 'ServerContextInterface'
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
  [IOCIdentifier.ZustandCounterServiceInterface]: ZustandCounterService;
  [IOCIdentifier.DialogHandler]: DialogHandler;
}

export interface IOCIdentifierMapServer {
  [IOCIdentifier.Logger]: LoggerInterface;
  [IOCIdentifier.AppConfig]: SeedServerConfigInterface;
  [IOCIdentifier.OAuthWrapperProviderInterface]: OAuthWrapperProviderInterface;
  [IOCIdentifier.ServerContextInterface]: ServerContextInterface;
}
