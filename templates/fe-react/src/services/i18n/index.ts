import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import { merge } from 'lodash';
import { i18nConfig, I18nLocale } from '@config/app.common';

// 自定义语言检测器
const pathLanguageDetector = {
  name: 'pathLanguageDetector',
  lookup() {
    const path = window.location.pathname.split('/');
    const language = path[1];
    return i18nConfig.supportedLngs.includes(language as I18nLocale)
      ? language
      : i18nConfig.fallbackLng;
  },
  cacheUserLanguage() {
    // 不需要缓存，因为我们从 URL 中获取语言
  }
};

export default function initI18n() {
  i18n
    .use(HttpApi)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(
      merge({}, i18nConfig, {
        detection: {
          order: ['pathLanguageDetector', 'navigator'], // 使用自定义检测器
          caches: [] // 不缓存语言
        }
      })
    );
  // 添加自定义检测器
  i18n.services.languageDetector.addDetector(pathLanguageDetector);
}
