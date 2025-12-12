import {
  ExecutorError,
  type ExecutorContext,
  type ExecutorPlugin
} from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import { i18nKeySchema } from '@config/i18n/i18nKeyScheam';
import { API_NOT_AUTHORIZED } from '@config/Identifier';
import { I } from '@config/IOCIdentifier';
import type { DialogHandlerOptions } from './DialogHandler';
import type { RouterService } from './RouterService';
import type { I18nServiceInterface } from '../port/I18nServiceInterface';
import type { UIDialogInterface } from '@qlover/corekit-bridge';

@injectable()
export class DialogErrorPlugin implements ExecutorPlugin {
  public readonly pluginName = 'DialogErrorPlugin';

  constructor(
    @inject(I.DialogHandler)
    protected dialogHandler: UIDialogInterface<DialogHandlerOptions>,
    @inject(I.I18nServiceInterface) protected i18nService: I18nServiceInterface,
    @inject(I.RouterServiceInterface)
    protected routerService: RouterService
  ) {}

  public onError(context: ExecutorContext<unknown>): void | Promise<void> {
    const { error, hooksRuntimes } = context;
    const runtimesError = hooksRuntimes.returnValue;

    // 优先使用 runtime 的错误, 他可能在运行时被修改
    // 比如 RequestError 会被 AppApiPlugin 修改为 ExecutorError
    const handleError = runtimesError || error;

    if (handleError instanceof ExecutorError) {
      if (this.isI18nMessage(handleError.id)) {
        const message = this.i18nService.t(handleError.id);
        this.dialogHandler.error(message);

        if (handleError.id === API_NOT_AUTHORIZED) {
          this.routerService.gotoLogin();
        }
      } else {
        this.dialogHandler.error(handleError.message);
      }
    }
  }

  protected isI18nMessage(message: string): boolean {
    return i18nKeySchema.safeParse(message).success;
  }
}
