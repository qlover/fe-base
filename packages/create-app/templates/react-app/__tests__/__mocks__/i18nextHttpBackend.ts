/**
 * Mock i18next-http-backend for testing
 *
 * This mock prevents network requests while still allowing i18next to work properly.
 * It loads translation data directly from JSON files, enabling translation testing.
 */

import enCommon from '../../public/locales/en/common.json';
import zhCommon from '../../public/locales/zh/common.json';
import type { i18n as I18nType } from 'i18next';

// Translation resources loaded from JSON files
const resources: Record<string, Record<string, Record<string, string>>> = {
  en: {
    common: enCommon as Record<string, string>
  },
  zh: {
    common: zhCommon as Record<string, string>
  }
};

/**
 * Mock HttpApi backend class for i18next
 * Implements the backend interface to avoid network requests
 */
export class MockHttpBackend {
  type = 'backend';

  /**
   * Initialize the backend
   * This is called by i18next when .use() is called
   */
  init(
    _services: unknown,
    _backendOptions: unknown,
    _i18nextOptions: unknown,
    i18nextInstance: I18nType
  ): void {
    // Preload resources directly into i18next
    if (
      i18nextInstance &&
      typeof i18nextInstance.addResourceBundle === 'function'
    ) {
      // Add resources for all languages and namespaces
      Object.keys(resources).forEach((lng) => {
        Object.keys(resources[lng]).forEach((ns) => {
          i18nextInstance.addResourceBundle(
            lng,
            ns,
            resources[lng][ns],
            true,
            true
          );
        });
      });
    }
  }

  /**
   * Read translation data for a language and namespace
   * This method is called by i18next to load translations
   */
  read(
    language: string,
    namespace: string,
    callback: (error: Error | null, data?: Record<string, string>) => void
  ): void {
    try {
      const data = resources[language]?.[namespace];
      if (data) {
        // Return immediately with the data
        callback(null, data);
      } else {
        callback(new Error(`Translation not found: ${language}/${namespace}`));
      }
    } catch (error) {
      callback(error as Error);
    }
  }

  /**
   * Load URL - called by i18next-http-backend to load from URL
   * We intercept this and return data from memory instead
   */
  loadUrl(
    _url: string,
    callback: (error: Error | null, data?: Record<string, string>) => void
  ): void {
    // Extract language and namespace from URL if possible
    // Format: /locales/{{lng}}/{{ns}}.json
    const match = _url.match(/locales\/([^/]+)\/([^/]+)\.json/);
    if (match) {
      const [, lng, ns] = match;
      const data = resources[lng]?.[ns];
      if (data) {
        callback(null, data);
        return;
      }
    }
    // Fallback: return empty object
    callback(null, {});
  }

  /**
   * Create - not used in our mock
   */
  create(): void {
    // No-op
  }
}
