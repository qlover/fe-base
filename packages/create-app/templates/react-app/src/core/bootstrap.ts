import {
  Bootstrap,
  BootstrapExecutorPlugin,
  InjectEnv,
  InjectIOC
} from '@/base/cases/bootstrap';
import { AppIOCContainer } from '@/core/AppIOCContainer';
import AppConfig from '@/core/AppConfig';
import { envPrefix } from '@config/common.json';
import { IOC } from '.';
import * as feGlobals from '@/core/globals';
import { I18nService } from '@/services/I18nService';
import { registerList } from './registers';

const injectGlobals: BootstrapExecutorPlugin = {
  pluginName: 'InjectGLobas',
  onBefore({ parameters: { root } }) {
    // inject globals to window
    Object.assign(root!, {
      feGlobals: Object.freeze(Object.assign({}, feGlobals))
    });
  }
};

/**
 * Bootstrap
 *
 * 1. inject env config to AppConfig
 * 2. inject IOC to Application
 * 3. inject globals to window
 *
 */
export default function startup(root: typeof globalThis) {
  const window =
    typeof root !== 'undefined' && root instanceof Window ? root : undefined;

  if (!window) {
    throw new Error('Not Found Window');
  }

  const bootstrap = new Bootstrap(new AppIOCContainer());

  /**
   * bootstrap start list
   *
   * - inject env config to AppConfig
   * - inject IOC to Application
   * - inject globals to window
   * - inject i18n service to Application
   */
  const bootstrapList: BootstrapExecutorPlugin[] = [
    new InjectEnv(AppConfig, envPrefix),
    new InjectIOC(IOC, registerList),
    injectGlobals,
    new I18nService(window.location.pathname)
  ];

  if (AppConfig.env !== 'production') {
    bootstrapList.push({
      pluginName: 'InjectDevTools',
      onBefore() {
        root.console.log(AppConfig);
      },
      onError({ error }) {
        root.console.error(`${AppConfig.appName} starup error:`, error);
      }
    });
  }

  try {
    bootstrap.use(bootstrapList).start(root);
  } catch (error) {
    root.console.error(`${AppConfig.appName} starup error:`, error);
  }
}
