import { cookies } from 'next/headers';
import { injectable } from '@shared/container';
import { i18nConfig, type LocaleType } from '@config/i18n';
import type { ServerStateInterface } from '@server/interfaces/ServerStateInterface';
import type { NextRequest } from 'next/server';

@injectable()
export class ServerState implements ServerStateInterface {
  protected request?: NextRequest | Request;

  /**
   * @override
   */
  public handler(request: NextRequest | Request): Promise<void> {
    this.request = request;
    return Promise.resolve();
  }
  /**
   * @override
   */
  public reset(): void {}
  /**
   * @override
   */
  public async getLocale(): Promise<LocaleType> {
    const cookieStorge = await cookies();
    const locale = cookieStorge.get(i18nConfig.storageKey);

    if (
      locale?.value &&
      i18nConfig.supportedLngs.includes(locale?.value as LocaleType)
    ) {
      return locale.value as LocaleType;
    }

    // TODO: 从请求中头中获取
    if (this.request) {
    }

    return i18nConfig.fallbackLng;
  }
}
