import { BootstrapApp } from '../../src/core/bootstraps/BootstrapApp';

// Mock BootstrapApp
vi.mock('../../src/core/bootstraps/BootstrapApp', () => ({
  BootstrapApp: {
    main: vi.fn()
  }
}));

// Mock react-dom
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
    unmount: vi.fn()
  }))
}));

// Mock App component
vi.mock('../../src/App', () => ({
  default: vi.fn(() => 'MockedApp')
}));

describe('main.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('BootstrapApp initialization', () => {
    it('should call BootstrapApp.main()', async () => {
      await import('../../src/main');
      expect(BootstrapApp.main).toHaveBeenCalledTimes(1);
    });
  });

  describe('Module loading', () => {
    it('should load main module without errors', async () => {
      const mainModule = await import('../../src/main');
      expect(mainModule).toBeDefined();
    });
  });
});
