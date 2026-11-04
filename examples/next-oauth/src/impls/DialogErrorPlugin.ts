import { isAbortError } from '@qlover/fe-corekit/aborter';
import {
  type ExecutorContextInterface,
  ExecutorError,
  type LifecyclePluginInterface
} from '@qlover/fe-corekit/executor';
import { isI18nKey } from '@qlover/next-kit/common';
import { inject, injectable } from '@shared/container';
import { LOGIN_REASON } from '@config/common';
import { API_NOT_AUTHORIZED } from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import type { UserServiceInterface } from '@interfaces/UserServiceInterface';
import type { RouterService } from './RouterService';
import type { UIDialogInterface } from '@qlover/corekit-bridge';
import type { DialogHandlerOptions } from '@qlover/next-kit/client';
import type { I18nServiceInterface } from '@qlover/next-kit/common';

const NOT_AUTHORIZED_DEDUPE_MS = 3000;

export type DialogErrorConfig = {
  disabledDialogError?: boolean;
};

@injectable()
export class DialogErrorPlugin implements LifecyclePluginInterface<
  ExecutorContextInterface<DialogErrorConfig>
> {
  public readonly pluginName = 'DialogErrorPlugin';

  protected lastNotAuthorizedAt = 0;

  constructor(
    @inject(I.DialogHandler)
    protected dialogHandler: UIDialogInterface<DialogHandlerOptions>,
    @inject(I.I18nServiceInterface) protected i18nService: I18nServiceInterface,
    @inject(I.RouterServiceInterface)
    protected routerService: RouterService,
    @inject(I.UserServiceInterface)
    protected userService: UserServiceInterface
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

    if (
      isAbortError(handleError) ||
      isAbortError(error) ||
      (handleError instanceof Error &&
        /operation was aborted|AbortError/i.test(handleError.message))
    ) {
      return;
    }

    if (handleError instanceof ExecutorError) {
      if (handleError.id === API_NOT_AUTHORIZED) {
        this.handleNotAuthorized();
        return;
      }
      if (this.isI18nMessage(handleError.id)) {
        this.dialogHandler.error(this.i18nService.t(handleError.id));
      } else {
        this.dialogHandler.error(handleError.message);
      }
    }
  }

  /**
   * 并发请求同时未授权时只处理一次：清除本地用户状态（触发用户作用域重置），
   * 再跳转登录页；过期提示由登录页根据跳转原因展示。
   */
  protected handleNotAuthorized(): void {
    const now = Date.now();
    if (now - this.lastNotAuthorizedAt < NOT_AUTHORIZED_DEDUPE_MS) {
      return;
    }
    this.lastNotAuthorizedAt = now;
    this.userService.expireSession();
    this.routerService.gotoLogin(LOGIN_REASON.SESSION_EXPIRED);
  }

  protected isI18nMessage(message: string): boolean {
    return isI18nKey(message);
  }
}
