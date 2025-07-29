import { InversifyContainer } from '@/base/cases/InversifyContainer';
import { BootstrapApp } from '@/core/bootstraps/BootstrapApp';
import type { BootstrapAppArgs } from '@/core/bootstraps/BootstrapApp';
import { createIOCFunction } from '@qlover/corekit-bridge';

vi.mock('@config/common', () => ({
  envBlackList: ['env', 'userNodeEnv'],
  envPrefix: 'VITE_',
  browserGlobalsName: 'test_feGlobals',
  routerPrefix: 'test_routerPrefix'
}));

// Mock globals
vi.mock('@/core/globals', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn()
  },
  appConfig: {
    appName: 'TestApp'
  }
}));

// Mock IocRegisterImpl
vi.mock('@/core/registers/IocRegisterImpl', () => ({
  IocRegisterImpl: vi.fn().mockImplementation(() => ({
    getRegisterList: vi.fn().mockReturnValue([]),
    register: vi.fn()
  }))
}));

describe('BootstrapApp', () => {
  let mockArgs: BootstrapAppArgs;
  let mockIOC: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock IOC
    mockIOC = vi.fn().mockImplementation(() => {
      return createIOCFunction(new InversifyContainer());
    });

    // Setup test arguments
    mockArgs = {
      root: {},
      bootHref: 'http://localhost:3000',
      IOC: mockIOC as unknown as BootstrapAppArgs['IOC']
    };
  });

  describe('main', () => {
    it('should initialize bootstrap successfully', async () => {
      // Setup test arguments
      mockArgs = {
        root: {},
        bootHref: 'http://localhost:3000',
        IOC: mockIOC as unknown as BootstrapAppArgs['IOC']
      };

      const result = await BootstrapApp.main(mockArgs);

      console.log(result);
      expect(result.bootHref).toBe('http://localhost:3000');
      // // defualt inject env,globals var, ioc
      // expect(mockIOC).toHaveBeenCalled();
      // const globals = await import('@/core/globals');
      // const { browserGlobalsName } = await import('@config/common');

      // expect(mockArgs.root[browserGlobalsName]).toBe(globals);
    });
  });
});
