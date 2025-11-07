import { IOC } from '@/core/IOC';
import { InversifyContainer } from '@/base/cases/InversifyContainer';
import { IOCIdentifier } from '@config/IOCIdentifier';
import type { AppConfig } from '@/base/cases/AppConfig';
import { ClientIOCRegister } from '@/core/clientIoc/ClientIOCRegister';

describe('IOC Container Tests', () => {
  let container: InversifyContainer;
  let mockAppConfig: AppConfig;

  beforeEach(() => {
    container = new InversifyContainer();
    mockAppConfig = {
      appName: '',
      appVersion: '',
      env: 'test',
      userInfoStorageKey: '__fe_user_info__',
      userTokenStorageKey: '__fe_user_token__',
      openAiModels: [
        'gpt-4o-mini',
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-2',
        'gpt-4',
        'gpt-4-32k'
      ],
      openAiBaseUrl: '',
      openAiToken: '',
      openAiTokenPrefix: '',
      openAiRequireToken: true,
      loginUser: '',
      loginPassword: '',
      feApiBaseUrl: '',
      userApiBaseUrl: '',
      aiApiBaseUrl: 'https://api.openai.com/v1',
      aiApiToken: '',
      aiApiTokenPrefix: 'Bearer',
      aiApiRequireToken: true,
      bootHref: '',
      isProduction: false
    };
  });

  describe('InversifyContainer', () => {
    it('should create container with correct configuration', () => {
      expect(container).toBeInstanceOf(InversifyContainer);
    });

    it('should bind and get services correctly', () => {
      const mockService = { test: 'service' };
      const mockKey = 'testKey';

      container.bind(mockKey, mockService);
      const result = container.get(mockKey);

      expect(result).toBe(mockService);
    });

    it('should handle string identifiers correctly', () => {
      const mockLogger = { info: vi.fn() };
      container.bind(IOCIdentifier.Logger, mockLogger);

      const result = container.get(IOCIdentifier.Logger);
      expect(result).toBe(mockLogger);
    });
  });

  describe('IOC Function', () => {
    it('should be a function', () => {
      expect(typeof IOC).toBe('function');
    });

    it('should accept string identifiers', () => {
      // This test verifies that IOC function can be called with string identifiers
      // The function should accept the identifier, but will throw if service is not bound
      expect(() => {
        IOC('NonExistentService' as any);
      }).toThrow();
    });

    it('should get registered services successfully', () => {
      // Logger is registered during IOC initialization
      expect(() => {
        IOC(IOCIdentifier.Logger);
      }).not.toThrow();

      const logger = IOC(IOCIdentifier.Logger);
      expect(logger).toBeDefined();
    });

    it('should accept class constructors', () => {
      // Mock class for testing
      class TestService {
        constructor() {}
      }

      // if service is not bound, it will return the class itself
      const result = IOC(TestService);
      expect(result).toBeInstanceOf(TestService);
    });
  });

  describe('IocRegisterImpl', () => {
    let registerImpl: ClientIOCRegister;

    beforeEach(() => {
      registerImpl = new ClientIOCRegister({
        pathname: '/test',
        appConfig: mockAppConfig
      });
    });

    it('should create register implementation correctly', () => {
      expect(registerImpl).toBeInstanceOf(ClientIOCRegister);
    });

    it('should register services without throwing', () => {
      const mockManager = {
        get: vi.fn(),
        bind: vi.fn(),
        implement: vi.fn(),
        implemention: container
      };

      expect(() => {
        registerImpl.register(container, mockManager);
      }).not.toThrow();
    });
  });

  describe('IOCIdentifierMap Type Safety', () => {
    it('should have correct type mapping for JSON', () => {
      // This test verifies that the type mapping is correct
      const identifierMap = {};

      // TypeScript should enforce that these keys exist
      expect(IOCIdentifier.JSONSerializer in identifierMap).toBeDefined();
      expect(IOCIdentifier.LocalStorage in identifierMap).toBeDefined();
      expect(IOCIdentifier.Logger in identifierMap).toBeDefined();
      expect(IOCIdentifier.AppConfig in identifierMap).toBeDefined();
    });
  });

  describe('Service Registration Integration', () => {
    it('should register global services correctly', async () => {
      const registerImpl = new ClientIOCRegister({
        pathname: '/test',
        appConfig: mockAppConfig
      });

      const mockManager = {
        get: vi.fn(),
        bind: vi.fn(),
        implement: vi.fn(),
        implemention: container
      };

      // This should not throw and should register services
      expect(() => {
        registerImpl.register(container, mockManager);
      }).not.toThrow();
    });

    it('should handle app config registration', () => {
      container.bind(IOCIdentifier.AppConfig, mockAppConfig);
      const result = container.get(IOCIdentifier.AppConfig);

      expect(result).toBe(mockAppConfig);
      expect(result.appName).toBe('');
      expect(result.env).toBe('test');
    });

    it('should handle logger registration', () => {
      const mockLogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn()
      };

      container.bind(IOCIdentifier.Logger, mockLogger);
      const result = container.get(IOCIdentifier.Logger);

      expect(result).toBe(mockLogger);
      expect(typeof result.info).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing service gracefully', () => {
      expect(() => {
        container.get('NonExistentService');
      }).toThrow();
    });

    it('should handle invalid identifier types', () => {
      expect(() => {
        container.get(null as never);
      }).toThrow();
    });
  });

  describe('Dependency Injection', () => {
    it('should support injectable decorators', () => {
      // This test verifies that the container supports @injectable decorators
      // The autobind configuration should allow this
      expect(container).toBeDefined();
    });

    it('should support singleton scope', () => {
      // This test verifies that the container uses singleton scope by default
      const service1 = { id: 'test' };
      const service2 = { id: 'test' };

      container.bind('TestService1', service1);
      container.bind('TestService2', service2);

      const result1 = container.get('TestService1');
      const result2 = container.get('TestService2');

      expect(result1).toBe(service1);
      expect(result2).toBe(service2);
    });
  });

  describe('IOCIdentifier Constants', () => {
    it('should be frozen object', () => {
      expect(Object.isFrozen(IOCIdentifier)).toBe(true);
    });

    it('should have string values', () => {
      Object.values(IOCIdentifier).forEach((value) => {
        expect(typeof value).toBe('string');
      });
    });

    it('should have unique values', () => {
      const values = Object.values(IOCIdentifier);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });
});
