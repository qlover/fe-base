import { I } from '@config/IOCIdentifier';
import type { AppConfig } from '@/base/cases/AppConfig';
import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge';
import type { SyncStorageInterface } from '@qlover/fe-corekit';

/**
 * 保存应用信息到本地存储
 *
 * 包含以下:
 *
 * - 应用名称
 * - 应用版本
 */
export const saveAppInfo: BootstrapExecutorPlugin = {
  pluginName: 'SaveAppInfo',
  onSuccess({ parameters: { ioc, logger } }) {
    const appConfig = ioc.get<AppConfig>(I.AppConfig);
    const localStorage = ioc.get<SyncStorageInterface<string>>(I.LocalStorage);

    const key = appConfig.appName + '_appInfo';
    localStorage.setItem(key, {
      appName: appConfig.appName,
      appVersion: appConfig.appVersion
    });

    logger.info(`Saved app info to localStorage: ${key}`);
  }
};
