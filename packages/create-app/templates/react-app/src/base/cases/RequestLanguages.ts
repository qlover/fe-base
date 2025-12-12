import type { I18nServiceInterface } from '@/base/port/I18nServiceInterface';
import type {
  ExecutorContext,
  ExecutorPlugin,
  RequestAdapterConfig
} from '@qlover/fe-corekit';

export class RequestLanguages implements ExecutorPlugin {
  public readonly pluginName = 'RequestLanguages';

  constructor(
    protected i18nService: I18nServiceInterface,
    protected headerName = 'accept-language'
  ) {}

  public buildAcceptLanguage(langs: string[]): string {
    return langs
      .map((lang, index) => {
        const q = Math.max(1 - index * 0.1, 0.1).toFixed(1);
        return index === 0 ? lang : `${lang};q=${q}`;
      })
      .join(',');
  }

  public onBefore(context: ExecutorContext<RequestAdapterConfig>): void {
    const currentLanguage = this.i18nService.getCurrentLanguage();
    const languages = this.i18nService.getSupportedLanguages();

    if (!context.parameters.headers) {
      context.parameters.headers = {};
    }

    const languageValue = this.buildAcceptLanguage(
      Array.from(new Set([currentLanguage, ...languages]))
    );

    context.parameters.headers[this.headerName] = languageValue;
  }
}
