import { BootstrapApp } from '@/core/bootstraps/BootstrapApp';

// Mock BootstrapApp
vi.mock('@/core/bootstraps/BootstrapApp', () => ({
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
vi.mock('@/App', () => ({
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
      await import('@/main');
      expect(BootstrapApp.main).toHaveBeenCalledTimes(1);
    });
  });

  describe('Module loading', () => {
    it('should load main module without errors', async () => {
      const mainModule = await import('@/main');
      expect(mainModule).toBeDefined();
    });
  });
});
