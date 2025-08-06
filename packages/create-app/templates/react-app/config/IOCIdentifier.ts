import type * as CorekitBridge from '@qlover/corekit-bridge';
import type * as FeCorekit from '@qlover/fe-corekit';
import type * as Logger from '@qlover/logger';
import type { DialogHandler } from '@/base/cases/DialogHandler';
import type { AppConfig } from '@/base/cases/AppConfig';
import type { RequestStatusCatcher } from '@/base/cases/RequestStatusCatcher';
import type { I18nService } from '@/base/services/I18nService';
import type { ProcesserExecutor } from '@/base/services/ProcesserExecutor';
import type { RouteService } from '@/base/services/RouteService';
import type { UserService } from '@/base/services/UserService';
import type { I18nKeyErrorPlugin } from '@/base/cases/I18nKeyErrorPlugin';

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
  EnvConfigInterface: 'EnvConfigInterface',
  InteractionHubInterface: 'InteractionHubInterface',
  AntdStaticApiInterface: 'AntdStaticApiInterface',
  RequestCatcherInterface: 'RequestCatcherInterface',
  I18nServiceInterface: 'I18nServiceInterface',
  ProcesserExecutorInterface: 'ProcesserExecutorInterface',
  RouteServiceInterface: 'RouteServiceInterface',
  UserServiceInterface: 'UserServiceInterface',
  I18nKeyErrorPlugin: 'I18nKeyErrorPlugin',
  FeApiToken: 'FeApiToken',
  FeApiCommonPlugin: 'FeApiCommonPlugin',
  ApiMockPlugin: 'ApiMockPlugin',
  ApiCatchPlugin: 'ApiCatchPlugin',
  ThemeService: 'ThemeService'
});

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
  [IOCIdentifier.AppConfig]: AppConfig;
  [IOCIdentifier.DialogHandler]: DialogHandler;
  [IOCIdentifier.LocalStorage]: FeCorekit.SyncStorage<
    unknown,
    FeCorekit.ObjectStorageOptions
  >;
  [IOCIdentifier.LocalStorageEncrypt]: FeCorekit.SyncStorage<
    unknown,
    FeCorekit.ObjectStorageOptions
  >;
  [IOCIdentifier.CookieStorage]: CorekitBridge.CookieStorage;
  [IOCIdentifier.EnvConfigInterface]: AppConfig;
  [IOCIdentifier.InteractionHubInterface]: DialogHandler;
  [IOCIdentifier.AntdStaticApiInterface]: DialogHandler;
  [IOCIdentifier.RequestCatcherInterface]: RequestStatusCatcher;
  [IOCIdentifier.I18nServiceInterface]: I18nService;
  [IOCIdentifier.ProcesserExecutorInterface]: ProcesserExecutor;
  [IOCIdentifier.RouteServiceInterface]: RouteService;
  [IOCIdentifier.UserServiceInterface]: UserService;
  [IOCIdentifier.I18nKeyErrorPlugin]: I18nKeyErrorPlugin;
  [IOCIdentifier.FeApiToken]: CorekitBridge.TokenStorage<string>;
  [IOCIdentifier.FeApiCommonPlugin]: CorekitBridge.RequestCommonPlugin;
  [IOCIdentifier.ApiMockPlugin]: CorekitBridge.ApiMockPlugin;
  [IOCIdentifier.ApiCatchPlugin]: CorekitBridge.ApiCatchPlugin;
  [IOCIdentifier.ThemeService]: CorekitBridge.ThemeService;
}
