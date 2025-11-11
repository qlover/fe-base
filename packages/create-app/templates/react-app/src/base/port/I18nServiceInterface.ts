import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge';

export interface I18nServiceInterface extends BootstrapExecutorPlugin {
  t(key: string, params?: Record<string, unknown>): string;
  changeLanguage(language: string): void;
  changeLoading(loading: boolean): void;
  getCurrentLanguage(): string;
  isValidLanguage(language: string): boolean;
  getSupportedLanguages(): string[];
}
