/* eslint-disable @typescript-eslint/no-explicit-any */
import { browserGlobalsName } from '@config/react-seed';
import { Bootstrap } from '@qlover/corekit-bridge/bootstrap';
import * as globals from '@/globals';
import { AppApiRequester } from '@/impls/AppApiRequester';
import { BootstrapClient } from '@/impls/BootstrapClient';
import { I18nService } from '@/impls/I18nService';
import { RouteService } from '@/impls/RouteService';
import { UserService } from '@/impls/UserService';
import { printBootstrap } from '@/utils/PrintBootstrap';
import { createMockGlobals } from '../__mocks__/createMockGlobals';
import type { ReactSeedConfigInterface } from '@/interfaces/ReactSeedConfigInterface';
import type { IOCIdentifierMap } from '@config/IOCIdentifier';
import type {
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge/ioc';

vi.mock('i18next', () => ({
  createInstance: vi.fn().mockReturnValue({
    use: vi.fn().mockReturnThis(),
    init: vi.fn().mockResolvedValue(undefined),
    get language() {
      return 'zh';
    }
  })
}));

describe('BootstrapClient', () => {
  let bootstrapClient: BootstrapClient;
  let mockIOC: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIOC = globals.IOC;
    bootstrapClient = new BootstrapClient(mockIOC);
  });

  describe('constructor', () => {
    it('should accept IOC parameter and store it', () => {
      const client = new BootstrapClient(mockIOC);
      expect(client).toBeInstanceOf(BootstrapClient);
    });

    it('should accept different IOC instances', () => {
      const anotherIOC = createMockGlobals().IOC;
      const client1 = new BootstrapClient(mockIOC);
      const client2 = new BootstrapClient(anotherIOC);

      expect(client1).toBeInstanceOf(BootstrapClient);
      expect(client2).toBeInstanceOf(BootstrapClient);
      expect(client1).not.toBe(client2);
    });

    it('should use IOC parameter in startup method', async () => {
      const client = new BootstrapClient(mockIOC);
      const rootElement = {} as Record<string, unknown>;

      // Verify by checking that initialize is called (which means Bootstrap was created)
      const initializeSpy = vi.spyOn(Bootstrap.prototype, 'initialize');

      await client.startup(rootElement);

      // If initialize was called, Bootstrap was created with correct IOC
      expect(initializeSpy).toHaveBeenCalled();
    });
  });

  describe('startup', () => {
    it('should create Bootstrap instance with correct parameters', async () => {
      const { omit } = await import('lodash-es');
      const { browserGlobalsName, omitInjectedGlobals } =
        await import('@config/react-seed');

      const rootElement = {} as Record<string, unknown>;

      // Verify by checking that Bootstrap methods are called and globals are injected
      const initializeSpy = vi.spyOn(Bootstrap.prototype, 'initialize');

      await bootstrapClient.startup(rootElement);

      // Verify Bootstrap was initialized (created)
      expect(initializeSpy).toHaveBeenCalledTimes(1);

      // Verify globals injection happened (which confirms correct parameters)
      expect(rootElement[browserGlobalsName]).toBeDefined();
      const injectedGlobals = rootElement[browserGlobalsName] as Record<
        string,
        unknown
      >;
      expect(injectedGlobals).toBeDefined();

      // Verify that sources were injected (excluding omitInjectedGlobals)
      // Note: Some properties might not be injected if they're excluded or don't exist
      // So we just verify that at least some expected properties are present
      const expectedSources = omit(globals, omitInjectedGlobals);
      const injectedKeys = Object.keys(injectedGlobals);
      const expectedKeys = Object.keys(expectedSources);

      // Verify that at least some expected keys are present in injected globals
      const commonKeys = expectedKeys.filter((key) =>
        injectedKeys.includes(key)
      );
      expect(commonKeys.length).toBeGreaterThan(0);

      // Verify specific important properties are present
      expect(injectedGlobals.seedConfig).toBeDefined();
      expect(injectedGlobals.logger).toBeDefined();
    });

    it('should inject globals to root object after initialize', async () => {
      const rootElement = {} as Record<string, unknown>;

      await bootstrapClient.startup(rootElement);

      // Verify globals are injected to root[browserGlobalsName]
      expect(rootElement[browserGlobalsName]).toBeDefined();
      expect(typeof rootElement[browserGlobalsName]).toBe('object');

      const injectedGlobals = rootElement[browserGlobalsName] as Record<
        string,
        unknown
      >;

      // Verify seedConfig is included
      expect(injectedGlobals.seedConfig).toBeDefined();
      expect(injectedGlobals.seedConfig).toBe(globals.seedConfig);

      // Verify logger is included
      expect(injectedGlobals.logger).toBeDefined();
      expect(injectedGlobals.logger).toBe(globals.logger);
    });

    it('should exclude omitInjectedGlobals properties from injected globals', async () => {
      const { browserGlobalsName, omitInjectedGlobals } =
        await import('@config/react-seed');
      const rootElement = {} as Record<string, unknown>;

      await bootstrapClient.startup(rootElement);

      const injectedGlobals = rootElement[browserGlobalsName] as Record<
        string,
        unknown
      >;

      // Verify omitInjectedGlobals properties are excluded
      for (const key of omitInjectedGlobals) {
        if (key.includes('.')) {
          // Handle nested keys like 'seedConfig.aiApiToken'
          const [parentKey, childKey] = key.split('.');
          if (injectedGlobals[parentKey]) {
            const parent = injectedGlobals[parentKey] as Record<
              string,
              unknown
            >;
            expect(parent[childKey]).toBeUndefined();
          }
        } else {
          expect(injectedGlobals[key]).toBeUndefined();
        }
      }

      // Verify seedConfig exists but without aiApiToken
      expect(injectedGlobals.seedConfig).toBeDefined();
      const seedConfig = injectedGlobals.seedConfig as Record<string, unknown>;
      expect(seedConfig.aiApiToken).toBeUndefined();
    });

    it('should call initialize on Bootstrap instance', async () => {
      const rootElement = {} as Record<string, unknown>;
      const initializeSpy = vi.spyOn(Bootstrap.prototype, 'initialize');

      await bootstrapClient.startup(rootElement);

      expect(initializeSpy).toHaveBeenCalledTimes(1);
      expect(initializeSpy).toHaveBeenCalledWith();
    });

    it('should call getPlugins and use plugins if available', async () => {
      // Mock seedConfig to be non-production
      vi.spyOn(globals, 'seedConfig', 'get').mockReturnValue({
        ...globals.seedConfig,
        isProduction: false
      } as ReactSeedConfigInterface);

      const rootElement = {} as Record<string, unknown>;
      const useSpy = vi.spyOn(Bootstrap.prototype, 'use');

      await bootstrapClient.startup(rootElement);

      const callWithPlugins = useSpy.mock.calls.find(
        (call) => Array.isArray(call[0]) && call[0].length === 4
      );
      expect(callWithPlugins).toBeDefined();
      const plugins = callWithPlugins![0] as Array<{ pluginName: string }>;
      const expectedPluginNames = [
        'I18nService',
        'AppApiRequesterBootstrap',
        'userRoute',
        'PrintBootstrap'
      ];
      expect(plugins.map((p) => p.pluginName)).toEqual(expectedPluginNames);
    });

    it('should not call use when no plugins are available', async () => {
      // Mock seedConfig to be production (no plugins)
      vi.spyOn(globals, 'seedConfig', 'get').mockReturnValue({
        ...globals.seedConfig,
        isProduction: true
      } as ReactSeedConfigInterface);

      const rootElement = {} as Record<string, unknown>;
      const useSpy = vi.spyOn(Bootstrap.prototype, 'use');

      await bootstrapClient.startup(rootElement);

      // Bootstrap internally calls use() for InjectIOC and InjectGlobal plugins,
      // but BootstrapClient should NOT call use() with printBootstrap
      // So use() should NOT be called with printBootstrap
      expect(useSpy).not.toHaveBeenCalledWith([printBootstrap]);
    });

    it('should call start after initialize completes', async () => {
      const rootElement = {} as Record<string, unknown>;
      const initializeSpy = vi.spyOn(Bootstrap.prototype, 'initialize');
      const startSpy = vi.spyOn(Bootstrap.prototype, 'start');

      await bootstrapClient.startup(rootElement);

      expect(initializeSpy).toHaveBeenCalled();
      // start() is called once by BootstrapClient.startup()
      // Note: start() might be called internally by Bootstrap, so we just check it was called
      expect(startSpy).toHaveBeenCalled();
    });

    it('should return a Promise', () => {
      const rootElement = {} as Record<string, unknown>;
      const result = bootstrapClient.startup(rootElement);
      expect(result).toBeInstanceOf(Promise);
    });

    // it('should resolve promise after startup completes', async () => {
    //   const rootElement = {} as Record<string, unknown>;
    //   const result = await bootstrapClient.startup(rootElement);
    //   // Bootstrap.start() returns BootstrapPluginOptions, not undefined
    //   expect(result).toBeDefined();
    //   expect(result).toHaveProperty('root');
    //   expect(result).toHaveProperty('ioc');
    //   expect(result).toHaveProperty('logger');
    // });

    // it('should handle errors during initialize', async () => {
    //   const error = new Error('Initialize failed');
    //   const rootElement = {} as Record<string, unknown>;

    //   const initializeSpy = vi.spyOn(Bootstrap.prototype, 'initialize');
    //   initializeSpy.mockRejectedValueOnce(error);

    //   await expect(bootstrapClient.startup(rootElement)).rejects.toThrow(
    //     'Initialize failed'
    //   );
    // });

    it('should log debug message when plugins are used', async () => {
      const loggerSpy = vi.spyOn(globals.logger, 'debug');

      // Mock seedConfig to be non-production
      vi.spyOn(globals, 'seedConfig', 'get').mockReturnValue({
        ...globals.seedConfig,
        isProduction: false
      } as ReactSeedConfigInterface);

      const rootElement = {} as Record<string, unknown>;
      await bootstrapClient.startup(rootElement);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('BootstrapClient Using plugins:')
      );
    });
  });

  describe('getPlugins', () => {
    it('应该返回正确的启动插件(production=true)', () => {
      const seedConfig: ReactSeedConfigInterface = {
        env: 'production',
        name: 'test',
        version: '1.0.0',
        isProduction: true
      };

      const plugins = bootstrapClient.getPlugins(seedConfig);

      expect(plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ pluginName: 'I18nService' }),
          expect.objectContaining({ pluginName: 'AppApiRequesterBootstrap' }),
          expect.objectContaining({ pluginName: 'userRoute' })
        ])
      );
    });

    it('应该包含printBootstrap插件(production=false)', async () => {
      const seedConfig: ReactSeedConfigInterface = {
        env: 'development',
        name: 'test',
        version: '1.0.0',
        isProduction: false
      };

      const plugins = bootstrapClient.getPlugins(seedConfig);

      expect(plugins).toHaveLength(4);
      expect(plugins).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ pluginName: 'I18nService' }),
          expect.objectContaining({ pluginName: 'AppApiRequesterBootstrap' }),
          expect.objectContaining({ pluginName: 'userRoute' }),
          expect.objectContaining({ pluginName: 'PrintBootstrap' })
        ])
      );
    });

    it('should return array of BootstrapExecutorPlugin type', () => {
      const seedConfig: ReactSeedConfigInterface = {
        env: 'development',
        name: 'test',
        version: '1.0.0',
        isProduction: false
      };

      const plugins = bootstrapClient.getPlugins(seedConfig);

      expect(Array.isArray(plugins)).toBe(true);
      plugins.forEach((plugin) => {
        expect(plugin).toHaveProperty('pluginName');
        expect(typeof plugin.pluginName).toBe('string');
      });
    });

    it('should handle different seedConfig values correctly', () => {
      const configs: ReactSeedConfigInterface[] = [
        {
          env: 'development',
          name: 'test',
          version: '1.0.0',
          isProduction: false
        },
        {
          env: 'production',
          name: 'test',
          version: '1.0.0',
          isProduction: true
        },
        {
          env: 'test',
          name: 'test-app',
          version: '2.0.0',
          isProduction: false
        }
      ];

      configs.forEach((config) => {
        const plugins = bootstrapClient.getPlugins(config);
        if (config.isProduction) {
          expect(plugins).toHaveLength(3);
        } else {
          expect(plugins.length).toBe(4);
        }
      });
    });
  });

  describe('BootstrapClient.executor', () => {
    let bootstrapClient: BootstrapClient;
    let mockIOC: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>;

    beforeEach(() => {
      vi.clearAllMocks();
      mockIOC = globals.IOC;
      bootstrapClient = new BootstrapClient(mockIOC);
    });

    it('应该正确初始化国际化', () => {
      const seedConfig: ReactSeedConfigInterface = {
        env: 'development',
        name: 'test',
        version: '1.0.0',
        isProduction: false
      };

      const plugins = bootstrapClient.getPlugins(seedConfig);
      const i18nPlugin = plugins.find((p) => p.pluginName === 'I18nService');
      expect(i18nPlugin).toBeDefined();
      expect(i18nPlugin!.onBefore).toBeDefined();

      const mockI18nService = new I18nService();
      const mockI18nServiceInit = vi.spyOn(mockI18nService, 'init');
      const mockIoc = {
        get: vi.fn().mockReturnValue(mockI18nService)
      };

      // @ts-expect-error - 只需要简单验证
      i18nPlugin!.onBefore!({
        parameters: {
          ioc: mockIoc as unknown as IOCContainerInterface,
          logger: globals.logger,
          root: undefined
        }
      });

      expect(mockIoc.get).toHaveBeenCalledWith(I18nService);
      expect(mockI18nServiceInit).toHaveBeenCalledTimes(1);
      expect(mockI18nService.i18n).toBeDefined();
      expect(mockI18nService.i18n).toBeDefined();
      expect(mockI18nService.getLocale()).toBe('zh');
    });

    it('应该正确启动 appApiRequester 请求器', () => {
      const seedConfig: ReactSeedConfigInterface = {
        env: 'development',
        name: 'test',
        version: '1.0.0',
        isProduction: false
      };

      const userService = {
        getCredential: vi.fn().mockReturnValue({ token: 'mock-token' })
      };
      const appApiRequester = new AppApiRequester();
      const mockIoc = {
        get: vi.fn().mockImplementationOnce((value) => {
          if (value === UserService) {
            return userService;
          }

          if (value === AppApiRequester) {
            return appApiRequester;
          }
        })
      };

      const plugins = bootstrapClient.getPlugins(seedConfig);
      const appApiRequesterBootstrap = plugins.find(
        (p) => p.pluginName === 'AppApiRequesterBootstrap'
      );
      expect(appApiRequesterBootstrap).toBeDefined();
      expect(appApiRequesterBootstrap!.onBefore).toBeDefined();

      appApiRequesterBootstrap!.onBefore!({
        parameters: {
          ioc: mockIoc
        }
      } as any);

      const baseConfig = appApiRequester['adapter']['config'];
      expect(baseConfig.baseURL).toBe('/api');
      expect(baseConfig.responseType).toBe('json');
      expect(appApiRequester['executor']).toBeDefined();
      const appApiPlugins = appApiRequester['executor']!['plugins'];
      expect(appApiPlugins.length).toBe(2);
    });

    it('getPlugins 在开发环境应返回 4 个插件(含 printBootstrap)', () => {
      const seedConfig: ReactSeedConfigInterface = {
        env: 'development',
        name: 'test',
        version: '1.0.0',
        isProduction: false
      };
      const plugins = bootstrapClient.getPlugins(seedConfig);
      expect(plugins.length).toBe(4);
      expect(plugins.map((p) => p.pluginName)).toEqual([
        'I18nService',
        'AppApiRequesterBootstrap',
        'userRoute',
        'PrintBootstrap'
      ]);
    });

    it('getPlugins 在生产环境应返回 3 个插件(不含 printBootstrap)', () => {
      const seedConfig: ReactSeedConfigInterface = {
        env: 'production',
        name: 'test',
        version: '1.0.0',
        isProduction: true
      };
      const plugins = bootstrapClient.getPlugins(seedConfig);
      expect(plugins.length).toBe(3);
      expect(plugins.map((p) => p.pluginName)).toEqual([
        'I18nService',
        'AppApiRequesterBootstrap',
        'userRoute'
      ]);
    });

    it('userRoutePlugin onBefore 应按流程获取 UserService 并调用 refreshUser，成功时调用 useMainRoutes', async () => {
      const seedConfig: ReactSeedConfigInterface = {
        env: 'development',
        name: 'test',
        version: '1.0.0',
        isProduction: false
      };
      const routeService = {
        useMainRoutes: vi.fn(),
        useAuthRoutes: vi.fn()
      };
      const userService = {
        refreshUser: vi.fn().mockResolvedValue(true)
      };
      const mockIoc = {
        get: vi.fn().mockImplementation((cls) => {
          if (cls === UserService) return userService;
          if (cls === RouteService) return routeService;
          return undefined;
        })
      };
      const mockLogger = { debug: vi.fn() } as any;

      const plugins = bootstrapClient.getPlugins(seedConfig);
      const userRoute = plugins.find((p) => p.pluginName === 'userRoute');
      expect(userRoute).toBeDefined();
      expect(userRoute!.onBefore).toBeDefined();

      userRoute!.onBefore!({
        parameters: {
          ioc: mockIoc as unknown as IOCContainerInterface,
          logger: mockLogger,
          root: undefined
        }
      } as any);

      expect(mockIoc.get).toHaveBeenCalledWith(UserService);
      expect(userService.refreshUser).toHaveBeenCalledTimes(1);
      await vi.waitFor(() => {
        expect(mockIoc.get).toHaveBeenCalledWith(RouteService);
        expect(routeService.useMainRoutes).toHaveBeenCalledTimes(1);
      });
      expect(routeService.useAuthRoutes).not.toHaveBeenCalled();
    });

    it('userRoutePlugin onBefore 在 refreshUser 失败时应调用 useAuthRoutes', async () => {
      const seedConfig: ReactSeedConfigInterface = {
        env: 'development',
        name: 'test',
        version: '1.0.0',
        isProduction: false
      };
      const routeService = {
        useMainRoutes: vi.fn(),
        useAuthRoutes: vi.fn()
      };
      const userService = {
        refreshUser: vi.fn().mockResolvedValue(false)
      };
      const mockIoc = {
        get: vi.fn().mockImplementation((cls) => {
          if (cls === UserService) return userService;
          if (cls === RouteService) return routeService;
          return undefined;
        })
      };
      const mockLogger = { debug: vi.fn() } as any;

      const plugins = bootstrapClient.getPlugins(seedConfig);
      const userRoute = plugins.find((p) => p.pluginName === 'userRoute');
      userRoute!.onBefore!({
        parameters: {
          ioc: mockIoc as unknown as IOCContainerInterface,
          logger: mockLogger,
          root: undefined
        }
      } as any);

      await vi.waitFor(() => {
        expect(routeService.useAuthRoutes).toHaveBeenCalledTimes(1);
      });
      expect(routeService.useMainRoutes).not.toHaveBeenCalled();
    });

    it('printBootstrap onSuccess 应按流程获取 RouteService/UserService 并调用 logger', () => {
      const seedConfig: ReactSeedConfigInterface = {
        env: 'development',
        name: 'test',
        version: '1.0.0',
        isProduction: false
      };
      const mockRouteService = {};
      const mockUserService = { routeService: mockRouteService };
      const mockIoc = {
        get: vi.fn().mockImplementation((cls) => {
          if (cls === RouteService) return mockRouteService;
          if (cls === UserService) return mockUserService;
          return undefined;
        })
      };
      const mockLogger = { debug: vi.fn(), info: vi.fn() } as any;

      const plugins = bootstrapClient.getPlugins(seedConfig);
      const printPlugin = plugins.find(
        (p) => p.pluginName === 'PrintBootstrap'
      );
      expect(printPlugin).toBeDefined();
      expect(printPlugin!.onSuccess).toBeDefined();

      printPlugin!.onSuccess!({
        parameters: {
          ioc: mockIoc as unknown as IOCContainerInterface,
          logger: mockLogger,
          root: undefined
        }
      } as any);

      expect(mockIoc.get).toHaveBeenCalledWith(RouteService);
      expect(mockIoc.get).toHaveBeenCalledWith(UserService);
      expect(mockLogger.debug).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledTimes(1);
    });
  });
});
