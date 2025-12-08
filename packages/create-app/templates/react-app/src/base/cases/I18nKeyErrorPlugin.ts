import { IOCIdentifier } from '@config/IOCIdentifier';
import {
  ExecutorError,
  type ExecutorContext,
  type ExecutorPlugin
} from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import type { I18nServiceInterface } from '../port/I18nServiceInterface';
import type { LoggerInterface } from '@qlover/logger';

/**
 * When throw error, it will be converted to i18n key
 *
 * If the error thrown is an i18n key, it will be converted to the corresponding text
 */
@injectable()
export class I18nKeyErrorPlugin implements ExecutorPlugin {
  readonly pluginName = 'I18nKeyErrorPlugin';

  constructor(
    @inject(IOCIdentifier.Logger) protected logger: LoggerInterface,
    @inject(IOCIdentifier.I18nServiceInterface)
    protected i18nService: I18nServiceInterface
  ) {}

  protected translateById(id: string): string {
    return this.i18nService.t(id);
  }

  onError(context: ExecutorContext<unknown>): Error | void {
    const { error } = context;

    if (!error) {
      return;
    }

    if (error instanceof ExecutorError) {
      const i18nText = this.translateById(error.id);
      return new ExecutorError(error.id, i18nText);
    }

    if (error instanceof Error) {
      const i18nKey = error.message;

      if (i18nKey && typeof i18nKey === 'string') {
        const i18nText = this.translateById(i18nKey);

        if (i18nText && i18nText !== i18nKey) {
          this.logger.debug('I18nKeyErrorPlugin Error:', i18nText);
          return new Error(i18nText);
        }
      }
    }
  }
}
