import type { ExecutorContext, ExecutorPlugin } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';
import { inject } from 'inversify';
import { I18nService } from '../services/I18nService';
import { IOCIdentifier } from '@/core/IOC';

/**
 * When throw error, it will be converted to i18n key
 *
 * If the error thrown is an i18n key, it will be converted to the corresponding text
 */
export class I18nKeyErrorPlugin implements ExecutorPlugin {
  readonly pluginName = 'I18nKeyErrorPlugin';

  constructor(
    @inject(IOCIdentifier.Logger) private logger: LoggerInterface,
    @inject(I18nService) private i18nService: I18nService
  ) {}

  onError(context: ExecutorContext<unknown>): Error | void {
    const { error } = context;

    if (error instanceof Error) {
      const i18nKey = error.message;

      if (i18nKey && typeof i18nKey === 'string') {
        const i18nText = this.i18nService.t(i18nKey);

        if (i18nText && i18nText !== i18nKey) {
          this.logger.debug('I18nKeyErrorPlugin Error:', i18nText);
          return new Error(i18nText);
        }
      }
    }
  }
}
