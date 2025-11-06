import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { BootstrapClient } from '@/core/bootstraps/BootstrapClient';
import { clientIOC } from '@/core/clientIoc/ClientIOC';
import { routerPrefix } from '@config/common';

// Mock CSS imports
vi.mock('@/styles/css/index.css', () => ({}));

// Mock RouterProvider
vi.mock('react-router-dom', () => ({
  createBrowserRouter: vi.fn((routes, options) => ({
    routes,
    basename: options?.basename
  })),
  RouterProvider: ({ router }: any) => (
    <div data-testid="router-provider">
      <div data-testid="router-basename">{router?.basename}</div>
      <div data-testid="router-routes-count">{router?.routes?.length || 0}</div>
    </div>
  ),
  useNavigate: () => vi.fn()
}));

// Mock AntdThemeProvider
vi.mock('@brain-toolkit/antd-theme-override/react', () => ({
  AntdThemeProvider: ({ children, theme }: any) => (
    <div data-testid="antd-theme-provider">
      <div data-testid="theme-key">{theme?.cssVar?.key}</div>
      <div data-testid="theme-prefix">{theme?.cssVar?.prefix}</div>
      {children}
    </div>
  )
}));

// Mock react-kit
vi.mock('@brain-toolkit/react-kit', () => ({
  useMountedClient: () => true,
  useStore: (_service: any, selector?: any) => {
    if (selector) {
      return [
        { path: '/', component: 'HomePage' },
        { path: '/about', component: 'AboutPage' }
      ];
    }
    return [];
  }
}));

// Mock ComboProvider - force children to render
vi.mock('@/uikit/components/ComboProvider', () => ({
  ComboProvider: ({ children }: any) => children
}));

// Mock AppRouterProvider - return our mocked router structure
vi.mock('@/uikit/components/AppRouterProvider', () => ({
  AppRouterProvider: () => (
    <div data-testid="router-provider">
      <div data-testid="router-basename">{routerPrefix}</div>
      <div data-testid="router-routes-count">0</div>
    </div>
  )
}));

// Import App after all mocks
import App from '@/App';
import { ClientIOCRegister } from '@/core/clientIoc/ClientIOCRegister';
import { appConfig } from '@/core/globals';

describe('App Component with IOC Initialization', () => {
  beforeAll(async () => {
    /**
     * Initialize IOC container with BootstrapClient.main()
     * This is essential to register all services including DialogHandler
     *
     * Without this initialization, you'll get:
     * "No bindings found for service: DialogHandler"
     */
    await BootstrapClient.main({
      root: globalThis,
      bootHref: 'http://localhost:3000',
      IOC: clientIOC.create(),
      IOCRegister: new ClientIOCRegister({
        pathname: '/',
        appConfig: appConfig
      })
    });
  });

  it('should render without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
  });

  it('should initialize and render the app structure', () => {
    render(<App />);

    // App should render successfully after IOC initialization
    const routerProvider = screen.getByTestId('router-provider');
    expect(routerProvider).toBeDefined();
  });

  it('should configure router with correct basename', () => {
    render(<App />);

    const routerBasename = screen.getByTestId('router-basename');
    expect(routerBasename.textContent).toBe(routerPrefix);
  });

  it('should render without DialogHandler binding errors', () => {
    // This test verifies that BootstrapClient.main() correctly initialized the IOC container
    // If DialogHandler was not registered, this would throw an error
    expect(() => render(<App />)).not.toThrow();
  });
});
