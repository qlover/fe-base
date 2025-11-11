/* eslint-disable import/no-named-as-default-member */
/**
 * I18nService test suite
 *
 * Coverage:
 * 1. constructor       - State initialization
 * 2. onBefore         - Plugin initialization
 * 3. changeLanguage   - Language switching
 * 4. changeLoading    - Loading state management
 * 5. language methods - Language validation and retrieval
 * 6. translation      - Key translation with parameters
 */

import { i18nConfig } from '@config/i18n/i18nConfig';
import i18n from 'i18next';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { I18nService, I18nServiceState } from '@/base/services/I18nService';

const { supportedLngs, fallbackLng } = i18nConfig;

// Mock i18next
vi.mock('i18next', () => ({
  default: {
    use: vi.fn().mockReturnThis(),
    init: vi.fn(),
    t: vi.fn(),
    changeLanguage: vi.fn(),
    language: 'en',
    services: {
      languageDetector: {
        addDetector: vi.fn()
      }
    },
    on: vi.fn()
  }
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  initReactI18next: {}
}));

// Mock i18next-browser-languagedetector
vi.mock('i18next-browser-languagedetector', () => ({
  default: {}
}));

// Mock i18next-http-backend
vi.mock('i18next-http-backend', () => ({
  default: {}
}));

describe('I18nService', () => {
  let service: I18nService;
  const testPath = '/en/test/path';

  beforeEach(() => {
    service = new I18nService(testPath);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct state', () => {
      expect(service.state).toBeInstanceOf(I18nServiceState);
      expect(service.state.language).toBe('en');
      expect(service.state.loading).toBe(false);
    });

    it('should have correct plugin name', () => {
      expect(service.pluginName).toBe('I18nService');
    });

    it('should initialize with correct selector', () => {
      const state = new I18nServiceState('en');
      expect(service.selector.loading(state)).toBe(false);
    });
  });

  describe('onBefore', () => {
    it('should initialize i18n with correct configuration', () => {
      service.onBefore();

      expect(i18n.use).toHaveBeenCalledTimes(3);
      expect(i18n.init).toHaveBeenCalledWith(
        expect.objectContaining({
          debug: false,
          detection: {
            order: ['pathLanguageDetector', 'navigator', 'localStorage'],
            caches: []
          }
        })
      );
    });

    it('should add custom language detector', () => {
      service.onBefore();

      expect(i18n.services.languageDetector.addDetector).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'pathLanguageDetector',
          lookup: expect.any(Function)
        })
      );
    });

    it('should detect language from path correctly', () => {
      service.onBefore();
      const detector = vi.mocked(i18n.services.languageDetector.addDetector)
        .mock.calls[0][0];
      const language = detector.lookup();
      expect(language).toBe('en');
    });

    it('should return fallback language for invalid path', () => {
      const invalidService = new I18nService('/invalid/path');
      invalidService.onBefore();
      const detector = vi.mocked(i18n.services.languageDetector.addDetector)
        .mock.calls[0][0];
      const language = detector.lookup();
      expect(language).toBe(fallbackLng);
    });
  });

  describe('changeLanguage', () => {
    it('should change language using i18n', async () => {
      await service.changeLanguage('en');
      expect(i18n.changeLanguage).toHaveBeenCalledWith('en');
    });

    it('should handle language change error', async () => {
      vi.mocked(i18n.changeLanguage).mockRejectedValueOnce(
        new Error('Change failed')
      );
      await expect(service.changeLanguage('en')).rejects.toThrow(
        'Change failed'
      );
    });
  });

  describe('changeLoading', () => {
    it('should update loading state', () => {
      const emitSpy = vi.spyOn(service, 'emit');
      service.changeLoading(true);
      expect(emitSpy).toHaveBeenCalledWith({
        language: 'en',
        loading: true
      });
    });

    it('should preserve current state when changing loading', () => {
      const currentState = service.state;
      service.changeLoading(true);
      expect(service.state).toEqual({
        ...currentState,
        loading: true
      });
    });
  });

  describe('language methods', () => {
    describe('getCurrentLanguage', () => {
      it('should return current i18n language', () => {
        expect(service.getCurrentLanguage()).toBe('en');
      });
    });

    describe('isValidLanguage', () => {
      it('should validate supported languages', () => {
        for (const lang of supportedLngs) {
          expect(service.isValidLanguage(lang)).toBe(true);
        }
      });

      it('should reject unsupported languages', () => {
        expect(service.isValidLanguage('invalid')).toBe(false);
      });
    });

    describe('getSupportedLanguages', () => {
      it('should return all supported languages', () => {
        const languages = service.getSupportedLanguages();
        expect(languages).toEqual(supportedLngs);
      });

      it('should return a copy of supported languages array', () => {
        const languages1 = service.getSupportedLanguages();
        const languages2 = service.getSupportedLanguages();
        expect(languages1).not.toBe(languages2);
      });
    });
  });

  describe('translation', () => {
    beforeEach(() => {
      // @ts-expect-error
      vi.mocked(i18n.t).mockImplementation((key) => `translated_${key}`);
    });

    it('should translate key without parameters', () => {
      const key = 'test.key';
      const result = service.t(key);
      expect(result).toBe('translated_test.key');
      expect(i18n.t).toHaveBeenCalledWith(key, {
        lng: 'en'
      });
    });

    it('should translate key with parameters', () => {
      const key = 'test.key';
      const params = { value: 'test' };
      const result = service.t(key, params);
      expect(result).toBe('translated_test.key');
      expect(i18n.t).toHaveBeenCalledWith(key, {
        lng: 'en',
        ...params
      });
    });

    it('should return key when translation is empty', () => {
      vi.mocked(i18n.t).mockReturnValueOnce('');
      const key = 'test.key';
      const result = service.t(key);
      expect(result).toBe(key);
    });

    it('should return key when translation equals key', () => {
      // @ts-expect-error
      vi.mocked(i18n.t).mockImplementation((key) => key);
      const key = 'test.key';
      const result = service.t(key);
      expect(result).toBe(key);
    });
  });
});
