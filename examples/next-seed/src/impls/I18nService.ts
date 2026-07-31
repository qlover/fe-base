import {
  I18nService as KitI18nService,
  type I18nServiceConfig
} from '@qlover/next-kit/client';
import { i18nConfig } from '@config/i18n';

const config: I18nServiceConfig = {
  fallbackLng: i18nConfig.fallbackLng,
  supportedLngs: i18nConfig.supportedLngs
};

/**
 * App I18nService — kit implementation with seed locale config.
 */
export class I18nService extends KitI18nService {
  constructor(cfg: I18nServiceConfig = config) {
    super(cfg);
  }
}

export type { I18nServiceConfig };
