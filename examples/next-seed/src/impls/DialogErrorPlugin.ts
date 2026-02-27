import {
  ExecutorContextInterface,
  ExecutorError,
  LifecyclePluginInterface
} from '@qlover/fe-corekit';
import { inject, injectable } from '@shared/container';
import { API_NOT_AUTHORIZED } from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import { i18nKeySchema } from '@schemas/i18nKeyScheam';
import type { I18nServiceInterface } from '@interfaces/I18nServiceInterface';
import type { DialogHandlerOptions } from './DialogHandler';
import type { RouterService } from './RouterService';
import type { UIDialogInterface } from '@qlover/corekit-bridge';

@injectable()
export class DialogErrorPlugin implements LifecyclePluginInterface<
  ExecutorContextInterface<unknown>
> {
  public readonly pluginName = 'DialogErrorPlugin';

  constructor(
    @inject(I.DialogHandler)
    protected dialogHandler: UIDialogInterface<DialogHandlerOptions>,
    @inject(I.I18nServiceInterface) protected i18nService: I18nServiceInterface,
    @inject(I.RouterServiceInterface)
    protected routerService: RouterService
  ) {}

  /**
   * @override
   */
  public onError(context: ExecutorContextInterface<unknown>): void {
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
