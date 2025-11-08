import type { AppConfig } from '@/base/cases/AppConfig';
import type { DialogHandler } from '@/base/cases/DialogHandler';
import type { I18nKeyErrorPlugin } from '@/base/cases/I18nKeyErrorPlugin';
import type { RequestStatusCatcher } from '@/base/cases/RequestStatusCatcher';
import type { ExecutorPageBridgeInterface } from '@/base/port/ExecutorPageBridgeInterface';
import type { JSONStoragePageBridgeInterface } from '@/base/port/JSONStoragePageBridgeInterface';
import type { RequestPageBridgeInterface } from '@/base/port/RequestPageBridgeInterface';
import type { I18nService } from '@/base/services/I18nService';
import type { ProcesserExecutor } from '@/base/services/ProcesserExecutor';
import type { RouteService } from '@/base/services/RouteService';
import type { UserService } from '@/base/services/UserService';
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
  CookieStorage: 'CookieStorage',
  EnvConfigInterface: 'EnvConfigInterface',
  UIDialogInterface: 'UIDialogInterface',
  AntdStaticApiInterface: 'AntdStaticApiInterface',
  RequestCatcherInterface: 'RequestCatcherInterface',
  I18nServiceInterface: 'I18nServiceInterface',
  ProcesserExecutorInterface: 'ProcesserExecutorInterface',
  RouteServiceInterface: 'RouteServiceInterface',
  UserServiceInterface: 'UserServiceInterface',
  I18nKeyErrorPlugin: 'I18nKeyErrorPlugin',
  FeApiCommonPlugin: 'FeApiCommonPlugin',
  ApiMockPlugin: 'ApiMockPlugin',
  ApiCatchPlugin: 'ApiCatchPlugin',
  ThemeService: 'ThemeService',
  ExecutorPageBridgeInterface: 'ExecutorPageBridgeInterface',
  JSONStoragePageInterface: 'JSONStoragePageInterface',
  RequestPageBridgeInterface: 'RequestPageBridgeInterface'
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
  [IOCIdentifier.UIDialogInterface]: DialogHandler;
  [IOCIdentifier.AntdStaticApiInterface]: DialogHandler;
  [IOCIdentifier.RequestCatcherInterface]: RequestStatusCatcher;
  [IOCIdentifier.I18nServiceInterface]: I18nService;
  [IOCIdentifier.ProcesserExecutorInterface]: ProcesserExecutor;
  [IOCIdentifier.RouteServiceInterface]: RouteService;
  [IOCIdentifier.UserServiceInterface]: UserService;
  [IOCIdentifier.I18nKeyErrorPlugin]: I18nKeyErrorPlugin;
  [IOCIdentifier.FeApiCommonPlugin]: CorekitBridge.RequestCommonPlugin;
  [IOCIdentifier.ApiMockPlugin]: CorekitBridge.ApiMockPlugin;
  [IOCIdentifier.ApiCatchPlugin]: CorekitBridge.ApiCatchPlugin;
  [IOCIdentifier.ThemeService]: CorekitBridge.ThemeService;
  [IOCIdentifier.ExecutorPageBridgeInterface]: ExecutorPageBridgeInterface;
  [IOCIdentifier.JSONStoragePageInterface]: JSONStoragePageBridgeInterface;
  [IOCIdentifier.RequestPageBridgeInterface]: RequestPageBridgeInterface;
}
