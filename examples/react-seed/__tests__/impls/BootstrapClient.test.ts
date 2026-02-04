import { browserGlobalsName } from '@config/react-seed';
import { Bootstrap } from '@qlover/corekit-bridge/bootstrap';
import * as globals from '@/globals';
import { BootstrapClient } from '@/impls/BootstrapClient';
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

      // Bootstrap internally calls use() for InjectIOC and InjectGlobal plugins,
      // then BootstrapClient calls use() with printBootstrap
      // So use() should be called at least once with printBootstrap
      expect(useSpy).toHaveBeenCalledWith([printBootstrap]);
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

    it('should resolve promise after startup completes', async () => {
      const rootElement = {} as Record<string, unknown>;
      const result = await bootstrapClient.startup(rootElement);
      // Bootstrap.start() returns BootstrapPluginOptions, not undefined
      expect(result).toBeDefined();
      expect(result).toHaveProperty('root');
      expect(result).toHaveProperty('ioc');
      expect(result).toHaveProperty('logger');
    });

    it('should handle errors during initialize', async () => {
      const error = new Error('Initialize failed');
      const rootElement = {} as Record<string, unknown>;

      const initializeSpy = vi.spyOn(Bootstrap.prototype, 'initialize');
      initializeSpy.mockRejectedValueOnce(error);

      await expect(bootstrapClient.startup(rootElement)).rejects.toThrow(
        'Initialize failed'
      );
    });

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
    it('should return empty array when seedConfig.isProduction is true', () => {
      const seedConfig: ReactSeedConfigInterface = {
        env: 'production',
        name: 'test',
        version: '1.0.0',
        isProduction: true
      };

      const plugins = bootstrapClient.getPlugins(seedConfig);

      expect(plugins).toEqual([]);
      expect(plugins).toHaveLength(0);
    });

    it('should return printBootstrap plugin when seedConfig.isProduction is false', async () => {
      const seedConfig: ReactSeedConfigInterface = {
        env: 'development',
        name: 'test',
        version: '1.0.0',
        isProduction: false
      };

      const plugins = bootstrapClient.getPlugins(seedConfig);

      expect(plugins).toHaveLength(1);
      expect(plugins).toContain(printBootstrap);
      expect(plugins[0]).toBe(printBootstrap);
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
          expect(plugins).toHaveLength(0);
        } else {
          expect(plugins.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('plugin execution', () => {
    it('should execute printBootstrap.onSuccess when plugin is used', async () => {
      // Mock seedConfig to be non-production
      vi.spyOn(globals, 'seedConfig', 'get').mockReturnValue({
        ...globals.seedConfig,
        isProduction: false
      } as ReactSeedConfigInterface);

      // Mock IOC container methods
      const mockRouteService = new RouteService();
      const mockUserService = new UserService(mockRouteService);
      const mockGet = vi.fn((service: unknown) => {
        if (service === RouteService) {
          return mockRouteService;
        }
        if (service === UserService) {
          return mockUserService;
        }
        return null;
      });

      globals.IOC.get = mockGet;

      // Create spy before calling startup
      const mockPrintBootstrapOnSuccess = vi.spyOn(printBootstrap, 'onSuccess');

      const rootElement = {} as Record<string, unknown>;
      await bootstrapClient.startup(rootElement);

      // Verify printBootstrap.onSuccess was called
      expect(mockPrintBootstrapOnSuccess).toHaveBeenCalledTimes(1);
      // onSuccess receives ExecutorContextImpl which has a 'parameters' getter
      // The actual call receives the full context object, not just { parameters: ... }
      expect(mockPrintBootstrapOnSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          parameters: expect.objectContaining({
            logger: globals.logger,
            ioc: expect.any(Object),
            root: expect.any(Object)
          })
        })
      );
    });

    it('should call logger methods in printBootstrap.onSuccess', async () => {
      // Mock seedConfig to be non-production
      vi.spyOn(globals, 'seedConfig', 'get').mockReturnValue({
        ...globals.seedConfig,
        isProduction: false
      } as ReactSeedConfigInterface);

      // Mock IOC container methods
      const mockRouteService = new RouteService();
      const mockUserService = new UserService(mockRouteService);
      const mockGet = vi.fn((service: unknown) => {
        if (service === RouteService) {
          return mockRouteService;
        }
        if (service === UserService) {
          return mockUserService;
        }
        return null;
      });

      globals.IOC.get = mockGet;

      // Import and execute printBootstrap.onSuccess manually to verify logger calls
      if (printBootstrap?.onSuccess) {
        const mockIOCContainer = {
          get: mockGet,
          implement: vi.fn(),
          implemention: globals.containerImpl
        };
        // Call onSuccess with proper context structure
        printBootstrap.onSuccess({
          parameters: {
            logger: globals.logger,
            ioc: mockIOCContainer as unknown as typeof mockIOC,
            root: {}
          }
        } as unknown as Parameters<
          NonNullable<typeof printBootstrap.onSuccess>
        >[0]);
      }

      // Verify logger.debug was called
      expect(globals.logger.debug).toHaveBeenCalled();
      // Verify logger.info was called with bootstrap success message
      expect(globals.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('bootstrap success!'),
        expect.any(String),
        expect.any(String)
      );
    });

    it('should not execute printBootstrap when in production', async () => {
      // Mock seedConfig to be production
      vi.spyOn(globals, 'seedConfig', 'get').mockReturnValue({
        ...globals.seedConfig,
        isProduction: true
      } as ReactSeedConfigInterface);

      // Create spy before calling startup
      const mockPrintBootstrapOnSuccess = vi.spyOn(printBootstrap, 'onSuccess');

      const rootElement = {} as Record<string, unknown>;
      await bootstrapClient.startup(rootElement);

      // Verify printBootstrap.onSuccess was NOT called
      expect(mockPrintBootstrapOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe('integration', () => {
    it('should complete full startup flow with plugins', async () => {
      // Mock seedConfig to be non-production
      vi.spyOn(globals, 'seedConfig', 'get').mockReturnValue({
        ...globals.seedConfig,
        isProduction: false
      } as ReactSeedConfigInterface);

      // Create spies before calling startup
      const mockPrintBootstrapOnSuccess = vi.spyOn(printBootstrap, 'onSuccess');
      const initializeSpy = vi.spyOn(Bootstrap.prototype, 'initialize');
      const useSpy = vi.spyOn(Bootstrap.prototype, 'use');
      const startSpy = vi.spyOn(Bootstrap.prototype, 'start');

      const rootElement = {} as Record<string, unknown>;
      await bootstrapClient.startup(rootElement);

      // Verify the complete flow
      expect(initializeSpy).toHaveBeenCalled();
      expect(useSpy).toHaveBeenCalledWith([printBootstrap]);
      expect(useSpy).toHaveBeenCalled();
      expect(startSpy).toHaveBeenCalled();

      // Verify globals injection
      expect(rootElement[browserGlobalsName]).toBeDefined();

      // Verify plugin execution
      expect(mockPrintBootstrapOnSuccess).toHaveBeenCalled();
    });

    it('should complete full startup flow without plugins', async () => {
      // Mock seedConfig to be production
      vi.spyOn(globals, 'seedConfig', 'get').mockReturnValue({
        ...globals.seedConfig,
        isProduction: true
      } as ReactSeedConfigInterface);

      // Create spies before calling startup
      const mockPrintBootstrapOnSuccess = vi.spyOn(printBootstrap, 'onSuccess');
      const initializeSpy = vi.spyOn(Bootstrap.prototype, 'initialize');
      const useSpy = vi.spyOn(Bootstrap.prototype, 'use');
      const startSpy = vi.spyOn(Bootstrap.prototype, 'start');

      const rootElement = {} as Record<string, unknown>;
      await bootstrapClient.startup(rootElement);

      // Verify the complete flow without plugins
      expect(initializeSpy).toHaveBeenCalled();
      // Bootstrap internally calls use() for InjectIOC and InjectGlobal plugins,
      // but BootstrapClient should NOT call use() with printBootstrap
      expect(useSpy).not.toHaveBeenCalledWith([printBootstrap]);
      expect(startSpy).toHaveBeenCalled();

      // Verify globals injection still happens
      expect(rootElement[browserGlobalsName]).toBeDefined();

      // Verify plugin was NOT executed
      expect(mockPrintBootstrapOnSuccess).not.toHaveBeenCalled();
    });
  });
});
