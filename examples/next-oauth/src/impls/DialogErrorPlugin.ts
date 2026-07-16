import {
  ExecutorContextInterface,
  ExecutorError,
  LifecyclePluginInterface
} from '@qlover/fe-corekit';
import { inject, injectable } from '@shared/container';
import { API_NOT_AUTHORIZED } from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import { isI18nKey } from '@schemas/i18nKey';
import type { I18nServiceInterface } from '@interfaces/I18nServiceInterface';
import type { DialogHandlerOptions } from './DialogHandler';
import type { RouterService } from './RouterService';
import type { UIDialogInterface } from '@qlover/corekit-bridge';

export type DialogErrorConfig = {
  disabledDialogError?: boolean;
};
@injectable()
export class DialogErrorPlugin implements LifecyclePluginInterface<
  ExecutorContextInterface<DialogErrorConfig>
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
  public onError(context: ExecutorContextInterface<DialogErrorConfig>): void {
    if (context?.parameters.disabledDialogError) {
      return;
    }

    const { error, hooksRuntimes } = context;
    const runtimesError = hooksRuntimes.returnValue;

    // Prefer runtime error — it may have been rewritten (e.g. RequestError → ExecutorError).
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
    return isI18nKey(message);
  }
}
