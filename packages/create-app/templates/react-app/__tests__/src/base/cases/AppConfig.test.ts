/**
 * AppConfig test suite
 *
 * Coverage:
 * 1. constructor       - Constructor initialization
 * 2. basic properties - App name, version, etc.
 * 3. OpenAI configuration
 * 4. Login configuration
 * 5. API endpoints
 * 6. Environment detection
 * 7. Default values
 * 8. Configuration validation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AppConfig } from '@/base/cases/AppConfig';
import { InjectEnv } from '@qlover/corekit-bridge';
import { envBlackList, envPrefix } from '@config/common';

// Mock import.meta.env
const mockImportMetaEnv = {
  VITE_USER_NODE_ENV: 'test',
  VITE_APP_NAME: 'TestApp',
  VITE_APP_VERSION: '1.0.0',
  VITE_USER_TOKEN_STORAGE_KEY: 'test_user_token',
  VITE_USER_INFO_STORAGE_KEY: 'test_user_info',
  VITE_OPEN_AI_BASE_URL: 'https://api.openai.com',
  VITE_OPEN_AI_TOKEN: 'test_openai_token',
  VITE_OPEN_AI_TOKEN_PREFIX: 'Bearer',
  VITE_OPEN_AI_REQUIRE_TOKEN: 'true',
  VITE_LOGIN_USER: 'testuser',
  VITE_LOGIN_PASSWORD: 'testpass',
  VITE_FE_API_BASE_URL: 'https://api.fe.com',
  VITE_USER_API_BASE_URL: 'https://api.user.com',
  VITE_AI_API_BASE_URL: 'https://api.ai.com',
  VITE_AI_API_TOKEN: 'test_ai_token',
  VITE_AI_API_TOKEN_PREFIX: 'Bearer',
  VITE_AI_API_REQUIRE_TOKEN: 'true',
  VITE_BOOT_HREF: 'https://test.com'
};

// Mock window.location
const mockLocation = {
  href: 'https://test.com/app'
};

// Helper function to inject environment variables using InjectEnv plugin
function injectEnvVariables(
  config: AppConfig,
  envVars: Record<string, string>
) {
  const injectEnv = new InjectEnv({
    target: config,
    source: envVars,
    prefix: envPrefix,
    blackList: envBlackList
  });

  injectEnv.onBefore();
}

describe('AppConfig', () => {
  let appConfig: AppConfig;
  let originalImportMetaEnv: Record<string, string>;
  let originalLocation: Location;

  beforeEach(() => {
    // Save original values
    originalImportMetaEnv = { ...import.meta.env };
    originalLocation = window.location;

    // Mock import.meta.env
    Object.defineProperty(import.meta, 'env', {
      value: { ...mockImportMetaEnv },
      writable: true
    });

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    });

    appConfig = new AppConfig();

    // Simulate environment variable injection
    injectEnvVariables(appConfig, mockImportMetaEnv);
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(import.meta, 'env', {
      value: originalImportMetaEnv,
      writable: true
    });
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true
    });
  });

  describe('Basic Properties', () => {
    it('should have correct appName', () => {
      expect(appConfig.appName).toBe('TestApp');
    });

    it('should have correct appVersion', () => {
      expect(appConfig.appVersion).toBe('1.0.0');
    });

    it('should have correct env', () => {
      // because blackList
      expect(appConfig.env).toBeUndefined();
    });

    it('should have correct userTokenStorageKey', () => {
      expect(appConfig.userTokenStorageKey).toBe('test_user_token');
    });

    it('should have correct userInfoStorageKey', () => {
      expect(appConfig.userInfoStorageKey).toBe('test_user_info');
    });
  });

  describe('OpenAI Configuration', () => {
    it('should have correct openAiModels', () => {
      const expectedModels = [
        'gpt-4o-mini',
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-2',
        'gpt-4',
        'gpt-4-32k'
      ];
      expect(appConfig.openAiModels).toEqual(expectedModels);
    });

    it('should have correct openAiBaseUrl', () => {
      expect(appConfig.openAiBaseUrl).toBe('https://api.openai.com');
    });

    it('should have correct openAiToken', () => {
      expect(appConfig.openAiToken).toBe('test_openai_token');
    });

    it('should have correct openAiTokenPrefix', () => {
      expect(appConfig.openAiTokenPrefix).toBe('Bearer');
    });

    it('should have correct openAiRequireToken', () => {
      expect(appConfig.openAiRequireToken).toBe(true);
    });
  });

  describe('Login Configuration', () => {
    it('should have correct loginUser', () => {
      expect(appConfig.loginUser).toBe('testuser');
    });

    it('should have correct loginPassword', () => {
      expect(appConfig.loginPassword).toBe('testpass');
    });
  });

  describe('API Configuration', () => {
    it('should have correct feApiBaseUrl', () => {
      expect(appConfig.feApiBaseUrl).toBe('https://api.fe.com');
    });

    it('should have correct userApiBaseUrl', () => {
      expect(appConfig.userApiBaseUrl).toBe('https://api.user.com');
    });

    it('should have correct aiApiBaseUrl', () => {
      expect(appConfig.aiApiBaseUrl).toBe('https://api.ai.com');
    });

    it('should have correct aiApiToken', () => {
      expect(appConfig.aiApiToken).toBe('test_ai_token');
    });

    it('should have correct aiApiTokenPrefix', () => {
      expect(appConfig.aiApiTokenPrefix).toBe('Bearer');
    });

    it('should have correct aiApiRequireToken', () => {
      expect(appConfig.aiApiRequireToken).toBe(true);
    });
  });

  describe('Boot Configuration', () => {
    it('should have correct bootHref', () => {
      expect(appConfig.bootHref).toBe('https://test.com');
    });
  });

  describe('Environment Detection', () => {
    it('should correctly identify production environment', () => {
      const productionConfig = new AppConfig('production');
      expect(productionConfig.isProduction).toBe(true);
    });

    it('should correctly identify non-production environment', () => {
      // Mock development environment
      Object.defineProperty(import.meta, 'env', {
        value: { ...mockImportMetaEnv, VITE_USER_NODE_ENV: 'development' },
        writable: true
      });

      const developmentConfig = new AppConfig();
      expect(developmentConfig.isProduction).toBe(false);
    });

    it('should correctly identify test environment', () => {
      expect(appConfig.isProduction).toBe(false);
    });
  });

  describe('Property Types', () => {
    it('should have correct property types', () => {
      expect(typeof appConfig.appName).toBe('string');
      expect(typeof appConfig.appVersion).toBe('string');
      expect(appConfig.env).toBeUndefined(); // because blackList
      expect(typeof appConfig.userInfoStorageKey).toBe('string');
    });
  });

  describe('Default Values', () => {
    it('should have sensible default values when environment variables are not set', () => {
      // Mock empty environment
      Object.defineProperty(import.meta, 'env', {
        value: {},
        writable: true
      });

      const defaultConfig = new AppConfig();
      // Don't inject environment variables to test defaults

      expect(defaultConfig.appName).toBe('');
      expect(defaultConfig.appVersion).toBe('');
      expect(defaultConfig.userTokenStorageKey).toBe('__fe_user_token__');
      expect(defaultConfig.userInfoStorageKey).toBe('__fe_user_info__');
      expect(defaultConfig.openAiRequireToken).toBe(true);
      expect(defaultConfig.aiApiBaseUrl).toBe('https://api.openai.com/v1');
      expect(defaultConfig.aiApiTokenPrefix).toBe('Bearer');
      expect(defaultConfig.aiApiRequireToken).toBe(true);
    });
  });

  describe('Configuration Validation', () => {
    it('should have valid OpenAI models configuration', () => {
      expect(Array.isArray(appConfig.openAiModels)).toBe(true);
      expect(appConfig.openAiModels.length).toBeGreaterThan(0);

      // Check that all models are strings
      appConfig.openAiModels.forEach((model) => {
        expect(typeof model).toBe('string');
        expect(model.length).toBeGreaterThan(0);
      });
    });

    it('should have valid storage keys', () => {
      expect(typeof appConfig.userTokenStorageKey).toBe('string');
      expect(typeof appConfig.userInfoStorageKey).toBe('string');
      expect(appConfig.userTokenStorageKey.length).toBeGreaterThan(0);
      expect(appConfig.userInfoStorageKey.length).toBeGreaterThan(0);
    });

    it('should have valid API URLs when provided', () => {
      // Test with valid URLs
      const validUrlConfig = new AppConfig();
      if (validUrlConfig.aiApiBaseUrl) {
        expect(validUrlConfig.aiApiBaseUrl).toMatch(/^https?:\/\//);
      }
    });
  });

  describe('Instance Creation', () => {
    it('should create new instance with default values', () => {
      const newConfig = new AppConfig();
      expect(newConfig).toBeInstanceOf(AppConfig);
    });

    it('should create new instance with custom environment', () => {
      const customConfig = new AppConfig('custom');
      expect(customConfig.env).toBe('custom');
    });
  });
});
