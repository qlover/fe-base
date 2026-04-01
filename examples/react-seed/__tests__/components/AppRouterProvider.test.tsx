import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRouterProvider } from '@/components/AppRouterProvider';
import type { ComponentMap } from '@/impls/RouterLoader';
import type { RouteConfigValue } from '@/interfaces/RouteLoaderInterface';

const {
  mockBaseRoutes,
  mockCreateBrowserRouter,
  mockRouterProvider,
  mockRoutesForStore,
  mockUseIOC,
  mockUseStore
} = vi.hoisted(() => {
  const routes: RouteConfigValue[] = [
    { path: '/', category: 'main', element: 'Layout' },
    { path: '404', category: 'general', element: '404' },
    { path: '*', category: 'general', element: '404' }
  ];
  const storeRoutes: RouteConfigValue[] = [
    { path: '404', category: 'general', element: '404' },
    { path: '*', category: 'general', element: '404' }
  ];
  const createBrowserRouter = vi.fn(() => ({}));
  const RouterProvider = () => <div data-testid="router-provider">Router</div>;
  const routeServiceMock = {
    getStore: () => ({
      getState: () => ({ result: storeRoutes })
    }),
    getUIStore: () => ({
      subscribe: vi.fn(() => () => {}),
      getState: () => ({ result: storeRoutes })
    }),
    getRoutes: () => routes
  };
  const useIOC = vi.fn((id: unknown) =>
    id === 'Logger'
      ? { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      : routeServiceMock
  );
  const useStore = vi.fn(
    (
      _store: unknown,
      selector?: (s: { result: RouteConfigValue[] }) => RouteConfigValue[]
    ) => (selector ? selector({ result: storeRoutes }) : storeRoutes)
  );
  return {
    mockBaseRoutes: routes,
    mockCreateBrowserRouter: createBrowserRouter,
    mockRouterProvider: RouterProvider,
    mockRoutesForStore: storeRoutes,
    mockUseIOC: useIOC,
    mockUseStore: useStore
  };
});

vi.mock('@config/router', () => ({
  baseRoutes: mockBaseRoutes,
  baseRoutesWithLocale: mockBaseRoutes
}));

vi.mock('@config/seed.config', () => ({
  usePathLocaleRoute: false,
  routerPrefix: ''
}));

vi.mock('@/hooks/useIOC', () => ({ useIOC: mockUseIOC }));

vi.mock('@/hooks/useStore', () => ({ useStore: mockUseStore }));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    createBrowserRouter: mockCreateBrowserRouter,
    RouterProvider: mockRouterProvider
  };
});

describe('AppRouterProvider', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseIOC.mockImplementation((id: unknown) =>
      id === 'Logger'
        ? { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
        : {
            getStore: () => ({
              getState: () => ({ result: mockRoutesForStore }),
              get state() {
                return this.getState();
              }
            }),
            getUIStore: () => ({
              subscribe: vi.fn(() => () => {}),
              getState: () => ({ result: mockRoutesForStore })
            }),
            getRoutes: () => mockBaseRoutes
          }
    );
    mockUseStore.mockImplementation(
      (
        _store: unknown,
        selector?: (s: { result: RouteConfigValue[] }) => RouteConfigValue[]
      ) =>
        selector ? selector({ result: mockRoutesForStore }) : mockRoutesForStore
    );
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should render RouterProvider', () => {
    const pages: ComponentMap = {
      Layout: () => <div data-testid="layout">Layout</div>,
      '404': () => <div data-testid="not-found">404</div>
    };

    const root = createRoot(container);
    act(() => {
      root.render(<AppRouterProvider pages={pages} />);
    });

    expect(
      container.querySelector('[data-testid="router-provider"]')
    ).toBeTruthy();
    expect(container.textContent).toContain('Router');
  });

  it('should create router with basename from config', () => {
    const pages: ComponentMap = {
      '404': () => <div data-testid="page-404">404</div>
    };

    const root = createRoot(container);
    act(() => {
      root.render(<AppRouterProvider pages={pages} />);
    });

    expect(mockCreateBrowserRouter).toHaveBeenCalledTimes(1);
    const calls = mockCreateBrowserRouter.mock.calls as unknown as [
      unknown[],
      { basename: string }
    ][];
    expect(calls.length).toBeGreaterThanOrEqual(1);
    const [routeList, options] = calls[0];
    expect(options).toEqual({ basename: '' });
    expect(Array.isArray(routeList)).toBe(true);
  });

  it('should build route list from RouteService store and RouterLoader', () => {
    const pages: ComponentMap = {
      Layout: () => <div data-testid="layout">Layout</div>,
      '404': () => <div data-testid="page-404">404</div>
    };

    const root = createRoot(container);
    act(() => {
      root.render(<AppRouterProvider pages={pages} />);
    });

    expect(mockCreateBrowserRouter).toHaveBeenCalled();
    const calls = mockCreateBrowserRouter.mock.calls as unknown as [
      unknown[],
      unknown
    ][];
    const routeList = calls[0]?.[0] as { path?: string }[] | undefined;
    expect(routeList).toBeDefined();
    expect(routeList!.length).toBeGreaterThanOrEqual(1);
    expect(routeList!.some((r) => r.path === '404')).toBe(true);
  });

  it('should use pages as componentMaps for RouterLoader', () => {
    const pages: ComponentMap = {
      Layout: () => <div data-testid="layout">Layout</div>,
      '404': () => <div data-testid="nf">404</div>
    };

    const root = createRoot(container);
    act(() => {
      root.render(<AppRouterProvider pages={pages} />);
    });

    expect(mockCreateBrowserRouter).toHaveBeenCalled();
    const calls = mockCreateBrowserRouter.mock.calls as unknown as [
      unknown[],
      unknown
    ][];
    const routeList = calls[0]?.[0];
    expect(routeList).toBeDefined();
    expect(Array.isArray(routeList)).toBe(true);
    expect((routeList ?? []).length).toBeGreaterThanOrEqual(1);
  });
});
