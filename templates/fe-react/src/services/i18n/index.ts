import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

// 自定义语言检测器
const customLanguageDetector = {
  name: 'pathLanguageDetector',
  lookup() {
    const path = window.location.pathname.split('/');
    const language = path[1]; // 假设语言代码在路径的第一部分
    return language;
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
    .init({
      detection: {
        order: ['pathLanguageDetector', 'navigator'], // 使用自定义检测器
        caches: [] // 不缓存语言
      },
      fallbackLng: 'en',
      debug: true,
      interpolation: {
        escapeValue: false // React already does escaping
      },
      ns: ['home'],
      defaultNS: 'home',
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json'
      }
    });
  // 添加自定义检测器
  i18n.services.languageDetector.addDetector(customLanguageDetector);
}
