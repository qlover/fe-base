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
    const { error, hooksRuntimes } = context;
    const runtimesError = hooksRuntimes.returnValue;

    // 优先使用 runtime 的错误, 他可能在运行时被修改
    // 比如 RequestError 会被 AppApiPlugin 修改为 ExecutorError
    const handleError = runtimesError || error;

    if (handleError instanceof ExecutorError) {
      const message = this.i18nService.t(handleError.id);
      this.dialogHandler.error(message);
    }
  }
}
