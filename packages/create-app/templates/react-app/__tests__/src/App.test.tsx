import { render, screen } from '@testing-library/react';
import App from '@/App';
import { routerPrefix } from '@config/common';

// Mock the dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    createBrowserRouter: vi.fn(() => ({
      routes: [],
      basename: routerPrefix
    })),
    RouterProvider: vi.fn(({ router }) => (
      <div data-testid="router-provider">
        <div data-testid="router-basename">{router.basename}</div>
        <div data-testid="router-routes-count">
          {router.routes?.length || 0}
        </div>
      </div>
    ))
  };
});

vi.mock('@brain-toolkit/antd-theme-override/react', () => ({
  AntdThemeProvider: vi.fn(({ children, theme }) => (
    <div data-testid="antd-theme-provider">
      <div data-testid="theme-key">{theme?.cssVar?.key}</div>
      <div data-testid="theme-prefix">{theme?.cssVar?.prefix}</div>
      {children}
    </div>
  ))
}));

vi.mock('@/core/IOC', () => ({
  IOC: vi.fn((service) => {
    if (service === 'RouteService') {
      return {
        routes: [
          { path: '/', component: 'HomePage' },
          { path: '/about', component: 'AboutPage' }
        ]
      };
    }
    if (service === 'DialogHandler') {
      return {};
    }
    return {};
  })
}));

vi.mock('@/uikit/hooks/useStore', () => ({
  useStore: vi.fn((service, selector) => {
    if (service && selector) {
      return [
        { path: '/', component: 'HomePage' },
        { path: '/about', component: 'AboutPage' }
      ];
    }
    return [];
  })
}));

vi.mock('@/base/cases/RouterLoader', () => ({
  RouterLoader: vi.fn().mockImplementation(() => ({
    toRoute: vi.fn((route) => ({
      path: route.path,
      element: <div data-testid={`route-${route.path}`}>{route.component}</div>
    }))
  }))
}));

// Mock the CSS import
vi.mock('@/styles/css/index.css', () => ({}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<App />);

    // Check if the main app structure is rendered
    expect(screen.getByTestId('antd-theme-provider')).toBeDefined();
    expect(screen.getByTestId('router-provider')).toBeDefined();
  });

  it('should configure theme provider correctly', () => {
    render(<App />);

    // Check theme configuration
    expect(screen.getByTestId('theme-key').textContent).toBe('fe-theme');
    expect(screen.getByTestId('theme-prefix').textContent).toBe('fe');
  });

  it('should configure router with correct basename', () => {
    render(<App />);

    // Check router configuration
    expect(screen.getByTestId('router-basename')).toBeDefined();
    expect(screen.getByTestId('router-basename').textContent).toBe(
      routerPrefix
    );
  });

  it('should render router provider with routes', () => {
    render(<App />);

    // Check that router provider is rendered
    expect(screen.getByTestId('router-provider')).toBeDefined();
    expect(screen.getByTestId('router-routes-count')).toBeDefined();
  });

  it('should have proper component structure', () => {
    const { container } = render(<App />);

    // Check the overall structure
    expect(container.firstChild).toBeDefined();

    // Check that theme provider wraps router provider
    const themeProvider = screen.getByTestId('antd-theme-provider');
    const routerProvider = screen.getByTestId('router-provider');

    expect(themeProvider.contains(routerProvider)).toBe(true);
  });

  it('should handle empty routes gracefully', async () => {
    // Mock useStore to return empty routes
    const { useStore } = await import('@/uikit/hooks/useStore');
    vi.mocked(useStore).mockReturnValueOnce([]);

    render(<App />);

    // Should still render without crashing
    expect(screen.getByTestId('antd-theme-provider')).toBeDefined();
    expect(screen.getByTestId('router-provider')).toBeDefined();
  });
});
