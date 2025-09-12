import {
  ExecutorError,
  type ExecutorContext,
  type ExecutorPlugin
} from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import { I } from '@config/IOCIdentifier';
import type { DialogHandlerOptions } from './DialogHandler';
import type { I18nServiceInterface } from '../port/I18nServiceInterface';
import type { UIDialogInterface } from '@qlover/corekit-bridge';

@injectable()
export class DialogErrorPlugin implements ExecutorPlugin {
  readonly pluginName = 'DialogErrorPlugin';

  constructor(
    @inject(I.DialogHandler)
    protected dialogHandler: UIDialogInterface<DialogHandlerOptions>,
    @inject(I.I18nServiceInterface) protected i18nService: I18nServiceInterface
  ) {}

  onError(context: ExecutorContext<unknown>): void | Promise<void> {
    const error = context.error;

    if (error instanceof ExecutorError) {
      const message = this.i18nService.t(error.id);
      this.dialogHandler.error(message);
    }
  }
}
