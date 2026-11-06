import { injectable } from '@shared/container';
import { i18nConfig, type LocaleType } from '@config/i18n';
import type { NextRequest } from 'next/server';

/**
 * 解析服务端请求的语言（邮件模板等场景）。
 *
 * 优先级：显式传入的 `hint` → `NEXT_LOCALE` Cookie → `Accept-Language` → 默认语言。
 */
@injectable()
export class RequestLocaleResolver {
  /**
   * @param request - 当前请求
   * @param hint - 调用方显式指定的语言（如请求体里的 `locale`），非法值会被忽略
   * @returns 受支持的语言
   */
  public resolve(request: NextRequest, hint?: unknown): LocaleType {
    const fromHint = this.toSupportedLocale(hint);
    if (fromHint) {
      return fromHint;
    }

    const fromCookie = this.toSupportedLocale(
      request.cookies.get(i18nConfig.storageKey)?.value
    );
    if (fromCookie) {
      return fromCookie;
    }

    const fromHeader = this.fromAcceptLanguage(
      request.headers.get('accept-language')
    );
    return fromHeader ?? i18nConfig.fallbackLng;
  }

  protected toSupportedLocale(value: unknown): LocaleType | null {
    if (
      typeof value === 'string' &&
      (i18nConfig.supportedLngs as readonly string[]).includes(value)
    ) {
      return value as LocaleType;
    }
    return null;
  }

  protected fromAcceptLanguage(header: string | null): LocaleType | null {
    if (!header) {
      return null;
    }
    for (const part of header.split(',')) {
      const tag = part.split(';')[0]?.trim().toLowerCase() ?? '';
      const primary = tag.split('-')[0] ?? '';
      const matched = this.toSupportedLocale(primary);
      if (matched) {
        return matched;
      }
    }
    return null;
  }
}
