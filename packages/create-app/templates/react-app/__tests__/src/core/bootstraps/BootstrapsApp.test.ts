import { InversifyContainer } from '@/base/cases/InversifyContainer';
import { BootstrapApp } from '@/core/bootstraps/BootstrapApp';
import type { BootstrapAppArgs } from '@/core/bootstraps/BootstrapApp';
import { createIOCFunction } from '@qlover/corekit-bridge';
import type { IOCIdentifierMap } from '@/core/IOC';
import { name, version } from '../../../../package.json';
import { browserGlobalsName } from '@config/common';

// Mock IocRegisterImpl to properly handle registration
vi.mock('@/core/registers/IocRegisterImpl', () => ({
  IocRegisterImpl: vi.fn().mockImplementation((_options) => ({
    getRegisterList: vi.fn().mockReturnValue([]),
    register: vi.fn().mockImplementation((_container, _manager) => {
      // Mock the actual registration process to avoid I18nService constructor issues
      // This prevents the real registration from happening which causes the error
    })
  }))
}));

// Mock BootstrapsRegistry to avoid I18nService instantiation
vi.mock('@/core/bootstraps/BootstrapsRegistry', () => ({
  BootstrapsRegistry: vi.fn().mockImplementation(() => ({
    register: vi.fn().mockReturnValue([])
  }))
}));

describe('BootstrapApp', () => {
  let mockArgs: BootstrapAppArgs;
  let mockIOC: ReturnType<typeof createIOCFunction<IOCIdentifierMap>>;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock IOC with proper typing
    const container = new InversifyContainer();
    mockIOC = createIOCFunction<IOCIdentifierMap>(container);

    // Setup test arguments
    mockArgs = {
      root: {},
      bootHref: 'http://localhost:3000',
      IOC: mockIOC
    };
  });

  describe('main', () => {
    it('should initialize bootstrap successfully', async () => {
      const result = await BootstrapApp.main(mockArgs);

      expect(result.bootHref).toBe('http://localhost:3000');
      // default inject env,globals var, ioc

      expect(
        (mockArgs.root as Record<string, unknown>)[browserGlobalsName]
      ).toBeDefined();

      // Verify that the globals object is injected into root
      const injectedGlobals = (mockArgs.root as Record<string, unknown>)[
        browserGlobalsName
      ] as Record<string, unknown>;
      expect(injectedGlobals).toHaveProperty('logger');
      expect(injectedGlobals).toHaveProperty('appConfig');
      expect(
        (injectedGlobals.appConfig as Record<string, unknown>).appName
      ).toBe(name);
      expect(
        (injectedGlobals.appConfig as Record<string, unknown>).appVersion
      ).toBe(version);
    });
  });
});
