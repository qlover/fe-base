import { vi } from 'vitest';
import { MockLogger } from './MockLogger';
import { MockAppConfig } from './MockAppConfit';
import { MockDialogHandler } from './MockDialogHandler';

export function createMockGlobals() {
  const mockLogger = new MockLogger();
  const mockAppConfig = new MockAppConfig();
  const mockDialogHandler = new MockDialogHandler();

  // Mock JSON serializer
  const mockJSON = {
    serialize: vi.fn((data) => JSON.stringify(data)),
    deserialize: vi.fn((data) => JSON.parse(data)),
    stringify: vi.fn((data) => JSON.stringify(data)),
    parse: vi.fn((data) => JSON.parse(data))
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storageOptions: Record<string, any> = {
    localStorage: {},
    cookieStorage: {},
    localStorageEncrypt: {}
  };

  // Mock localStorage with actual storage simulation
  const mockLocalStorageData = storageOptions.localStorage ?? {};
  const mockLocalStorage = {
    get: vi.fn((key: string) => mockLocalStorageData[key]),
    set: vi.fn((key: string, value: unknown) => {
      mockLocalStorageData[key] = value;
    }),
    getItem: vi.fn((key: string) => mockLocalStorageData[key]),
    setItem: vi.fn((key: string, value: unknown) => {
      mockLocalStorageData[key] = value;
    }),
    remove: vi.fn((key: string) => {
      delete mockLocalStorageData[key];
    }),
    removeItem: vi.fn((key: string) => {
      delete mockLocalStorageData[key];
    }),
    clear: vi.fn(() => {
      Object.keys(mockLocalStorageData).forEach((key) => {
        delete mockLocalStorageData[key];
      });
    }),
    has: vi.fn((key: string) => key in mockLocalStorageData),
    keys: vi.fn(() => Object.keys(mockLocalStorageData)),
    size: vi.fn(() => Object.keys(mockLocalStorageData).length)
  };

  // Mock localStorageEncrypt (same as localStorage for now)
  const mockLocalStorageEncrypt = { ...mockLocalStorage };

  // Mock cookieStorage
  const mockCookieStorageData = storageOptions.cookieStorage ?? {};
  const mockCookieStorage = {
    get: vi.fn((key: string) => mockCookieStorageData[key]),
    set: vi.fn((key: string, value: unknown, _options?: unknown) => {
      mockCookieStorageData[key] = value;
    }),
    getItem: vi.fn((key: string) => mockCookieStorageData[key]),
    setItem: vi.fn((key: string, value: unknown, _options?: unknown) => {
      mockCookieStorageData[key] = value;
    }),
    remove: vi.fn((key: string) => {
      delete mockCookieStorageData[key];
    }),
    removeItem: vi.fn((key: string) => {
      delete mockCookieStorageData[key];
    }),
    clear: vi.fn(() => {
      Object.keys(mockCookieStorageData).forEach((key) => {
        delete mockCookieStorageData[key];
      });
    }),
    has: vi.fn((key: string) => key in mockCookieStorageData),
    keys: vi.fn(() => Object.keys(mockCookieStorageData)),
    size: vi.fn(() => Object.keys(mockCookieStorageData).length)
  };

  return {
    logger: mockLogger,
    appConfig: mockAppConfig,
    dialogHandler: mockDialogHandler,
    JSON: mockJSON,
    localStorage: mockLocalStorage,
    localStorageEncrypt: mockLocalStorageEncrypt,
    cookieStorage: mockCookieStorage
  };
}
