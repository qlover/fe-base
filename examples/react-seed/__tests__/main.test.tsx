import { StrictMode } from 'react';
import type { ReactElement } from 'react';

// Store instances to verify IOC references
const BootstrapClientInstances: Array<{
  IOC: unknown;
  startup: ReturnType<typeof vi.fn>;
}> = [];

// Mock dependencies before importing anything
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn()
}));

// Mock Bootstrap to avoid complex initialization
vi.mock('@qlover/corekit-bridge/bootstrap', () => ({
  Bootstrap: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    use: vi.fn().mockReturnThis(),
    start: vi.fn()
  }))
}));

// Mock BootstrapClient to capture instances
vi.mock('@/impls/BootstrapClient', () => ({
  BootstrapClient: vi.fn().mockImplementation(function (IOC: unknown) {
    const mockStartup = vi.fn().mockResolvedValue(undefined);
    const instance = {
      IOC,
      startup: mockStartup
    };
    BootstrapClientInstances.push(instance);
    return instance;
  })
}));

vi.mock('@/App', () => ({
  default: vi.fn(() => <div data-testid="div">App Component</div>)
}));

describe('main.tsx', () => {
  let mockRender: ReturnType<typeof vi.fn>;
  let mockRoot: { render: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    // Reset module cache to allow re-importing main.tsx
    vi.resetModules();

    // Reset mocks
    vi.clearAllMocks();
    BootstrapClientInstances.length = 0;

    // Setup createRoot mock
    mockRender = vi.fn();
    mockRoot = { render: mockRender };
    const { createRoot } = await import('react-dom/client');
    (createRoot as ReturnType<typeof vi.fn>).mockReturnValue(mockRoot);
  });

  it('should initialize BootstrapClient with IOC from globals', async () => {
    const { BootstrapClient } = await import('@/impls/BootstrapClient');
    const globals = await import('@/globals');

    // Dynamically import main.tsx to execute it
    await import('@/main');

    // Verify BootstrapClient was instantiated
    expect(BootstrapClient).toHaveBeenCalled();

    // Verify BootstrapClient was instantiated with IOC from globals
    expect(BootstrapClient).toHaveBeenCalledWith(globals.IOC);

    // Verify the IOC passed to BootstrapClient is the same reference as globals.IOC
    const instance = BootstrapClientInstances[0];
    expect(instance.IOC).toBe(globals.IOC);
  });

  it('should use the same IOC reference as globals.IOC', async () => {
    const { BootstrapClient } = await import('@/impls/BootstrapClient');
    const globals = await import('@/globals');

    // Dynamically import main.tsx to execute it
    await import('@/main');

    // Get the instance created
    const instance = BootstrapClientInstances[0];

    // Verify IOC reference equality - they should be the exact same object
    expect(instance.IOC).toBe(globals.IOC);
    expect(instance.IOC).toStrictEqual(globals.IOC);
    expect(BootstrapClient).toHaveBeenCalledWith(globals.IOC);
  });

  it('should verify IOC.implemention equals containerImpl', async () => {
    const globals = await import('@/globals');

    // Dynamically import main.tsx to execute it
    await import('@/main');

    // Verify IOC.implemention is the same as containerImpl
    expect(globals.IOC.implemention).toBe(globals.containerImpl);
    expect(globals.IOC.implemention).toStrictEqual(globals.containerImpl);

    // Verify the IOC passed to BootstrapClient has the same implemention
    const instance = BootstrapClientInstances[0];
    const passedIOC = instance.IOC as typeof globals.IOC;
    expect(passedIOC.implemention).toBe(globals.containerImpl);
    expect(passedIOC.implemention).toStrictEqual(globals.containerImpl);
  });

  it('should call startup with window object', async () => {
    // Dynamically import main.tsx to execute it
    await import('@/main');

    // Wait for startup promise to resolve (mock resolves immediately)
    await Promise.resolve();

    // Verify startup was called
    const instance = BootstrapClientInstances[0];
    expect(instance.startup).toHaveBeenCalled();

    // Verify startup was called with window
    expect(instance.startup).toHaveBeenCalledWith(window);
    expect(instance.startup).toHaveBeenCalledTimes(1);
  });

  it('should create root and render App component inside StrictMode', async () => {
    const { createRoot } = await import('react-dom/client');
    const App = (await import('@/App')).default;

    // Ensure root element exists
    const rootElement = document.getElementById('root');
    expect(rootElement).toBeTruthy();

    // Dynamically import main.tsx to execute it
    await import('@/main');

    // Verify createRoot was called with root element
    expect(createRoot).toHaveBeenCalledWith(rootElement);

    // Verify render was called
    expect(mockRender).toHaveBeenCalled();

    // Verify render was called with StrictMode wrapping App
    const renderCall = mockRender.mock.calls[0][0] as ReactElement;
    expect(renderCall.type).toBe(StrictMode);
    expect((renderCall.props as { children: ReactElement }).children.type).toBe(
      App
    );
  });
});
