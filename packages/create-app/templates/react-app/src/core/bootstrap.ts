import * as feGlobals from '@/core/globals';
import { IOC } from '.';
import type { IOCContainerInterface } from '@/base/port/IOCContainerInterface';
import { I18nService } from '@/services/I18nService';
import AppConfig from '@config/AppConfig';
import { InjectEnv } from './InjectEnv';

export class Bootstrap {
  constructor(private IOCContainer: IOCContainerInterface) {
    // inject env config to AppConfig
    InjectEnv.inject(AppConfig);
  }

  start(): void {
    // set global feGlobals
    if (typeof window !== 'undefined') {
      window.feGlobals = Object.freeze(Object.assign({}, feGlobals));
    }

    // startup IOC
    IOC.implement(this.IOCContainer);

    // startup i18n
    I18nService.init();
  }
}
