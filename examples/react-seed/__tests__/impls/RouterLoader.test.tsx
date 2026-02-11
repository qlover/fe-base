import { Suspense, lazy } from 'react';
import { RouterLoader, type ComponentMap } from '@/impls/RouterLoader';
import NotFound from '@/pages/404';
import NotFound500 from '@/pages/500';
import type { RouteConfigValue } from '@/interfaces/RouteLoaderInterface';
import type { LoggerInterface } from '@qlover/logger';
import type React from 'react';

describe('RouterLoader', () => {
  let mockLogger: LoggerInterface;
  let mockRender: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    } as unknown as LoggerInterface;

    mockRender = vi.fn((route) => {
      const { element } = route;
      if (element && typeof element === 'object' && '$$typeof' in element) {
        const Component = element as React.ComponentType;
        return (
          <Suspense fallback={<div data-testid="loading">Loading...</div>}>
            <Component />
          </Suspense>
        );
      }
      return element as React.ReactNode;
    });
  });

  describe('constructor', () => {
    it('should create RouterLoader instance with valid options', () => {
      const loader = new RouterLoader({
        render: mockRender
      });
      expect(loader).toBeInstanceOf(RouterLoader);
    });

    it('should throw error when render is not provided', () => {
      expect(() => {
        // @ts-expect-error Testing invalid input
        new RouterLoader({});
      }).toThrow('RouterLoader render is required');
    });
  });

  describe('toRoute - string element (componentMaps lookup)', () => {
    it('should resolve string element from componentMaps', () => {
      const componentMaps: ComponentMap = {
        NotFound: NotFound,
        NotFound500: NotFound500
      };

      const loader = new RouterLoader({
        componentMaps,
        render: mockRender
      });

      const routeConfig: RouteConfigValue = {
        path: '/404',
        element: 'NotFound'
      };

      const route = loader.toRoute(routeConfig);

      expect(route.path).toBe('/404');
      expect(route.element).toBeDefined();
      expect(mockRender).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/404',
          element: NotFound
        })
      );
    });

    it('should handle lazy loader function in componentMaps', () => {
      const LazyComponent = vi.fn(() => (
        <div data-testid="lazy">Lazy Component</div>
      ));
      const lazyLoader = () =>
        Promise.resolve({
          default: LazyComponent
        });

      const componentMaps: ComponentMap = {
        LazyPage: lazyLoader
      };

      const loader = new RouterLoader({
        componentMaps,
        render: mockRender
      });

      const routeConfig: RouteConfigValue = {
        path: '/lazy',
        element: 'LazyPage'
      };

      const route = loader.toRoute(routeConfig);

      expect(route.path).toBe('/lazy');
      expect(route.element).toBeDefined();
      // Verify that lazy was called (element should be LazyExoticComponent)
      expect(mockRender).toHaveBeenCalled();
      const renderCall = mockRender.mock.calls[0][0];
      expect(renderCall.element).toBeDefined();
      // The element should be a lazy component (has $$typeof)
      expect(
        renderCall.element &&
          typeof renderCall.element === 'object' &&
          '$$typeof' in renderCall.element
      ).toBe(true);
    });

    it('should handle LazyExoticComponent in componentMaps', () => {
      const LazyComponent = lazy(() =>
        Promise.resolve({
          default: () => <div data-testid="already-lazy">Already Lazy</div>
        })
      );

      const componentMaps: ComponentMap = {
        AlreadyLazy: LazyComponent
      };

      const loader = new RouterLoader({
        componentMaps,
        render: mockRender
      });

      const routeConfig: RouteConfigValue = {
        path: '/already-lazy',
        element: 'AlreadyLazy'
      };

      const route = loader.toRoute(routeConfig);

      expect(route.path).toBe('/already-lazy');
      expect(route.element).toBeDefined();
      expect(mockRender).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/already-lazy',
          element: LazyComponent
        })
      );
    });

    it('should log warning when component not found in componentMaps', () => {
      const loader = new RouterLoader({
        componentMaps: {},
        render: mockRender,
        logger: mockLogger
      });

      const routeConfig: RouteConfigValue = {
        path: '/missing',
        element: 'NonExistent'
      };

      const route = loader.toRoute(routeConfig);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Component not found in componentMaps for key: NonExistent'
      );
      expect(route.element).toBeDefined();
    });
  });

  describe('toRoute - ReactNode element', () => {
    it('should handle ReactNode element directly', () => {
      const loader = new RouterLoader({
        render: mockRender
      });

      const reactNode = <div data-testid="direct-node">Direct ReactNode</div>;
      const routeConfig: RouteConfigValue = {
        path: '/direct',
        element: reactNode
      };

      const route = loader.toRoute(routeConfig);

      expect(route.path).toBe('/direct');
      expect(mockRender).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/direct',
          element: reactNode
        })
      );
    });
  });

  describe('toRoute - ComponentType element', () => {
    it('should handle ComponentType element directly', () => {
      const loader = new RouterLoader({
        render: mockRender
      });

      const routeConfig: RouteConfigValue = {
        path: '/component',
        element: NotFound
      };

      const route = loader.toRoute(routeConfig);

      expect(route.path).toBe('/component');
      expect(mockRender).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/component',
          element: NotFound
        })
      );
    });
  });

  describe('toRoute - nested routes', () => {
    it('should handle nested routes with children', () => {
      const componentMaps: ComponentMap = {
        Parent: () => <div data-testid="parent">Parent</div>,
        Child: () => <div data-testid="child">Child</div>
      };

      const loader = new RouterLoader({
        componentMaps,
        render: mockRender
      });

      const routeConfig: RouteConfigValue = {
        path: '/parent',
        element: 'Parent',
        children: [
          {
            path: 'child',
            element: 'Child'
          }
        ]
      };

      const route = loader.toRoute(routeConfig);

      expect(route.path).toBe('/parent');
      expect(route.children).toBeDefined();
      expect(route.children).toHaveLength(1);
      expect(route.children?.[0].path).toBe('child');
      expect(mockRender).toHaveBeenCalledTimes(2); // Parent + Child
    });

    it('should handle deeply nested routes', () => {
      const componentMaps: ComponentMap = {
        Level1: () => <div data-testid="level1">Level1</div>,
        Level2: () => <div data-testid="level2">Level2</div>,
        Level3: () => <div data-testid="level3">Level3</div>
      };

      const loader = new RouterLoader({
        componentMaps,
        render: mockRender
      });

      const routeConfig: RouteConfigValue = {
        path: '/level1',
        element: 'Level1',
        children: [
          {
            path: 'level2',
            element: 'Level2',
            children: [
              {
                path: 'level3',
                element: 'Level3'
              }
            ]
          }
        ]
      };

      const route = loader.toRoute(routeConfig);

      expect(route.path).toBe('/level1');
      expect(route.children).toHaveLength(1);
      expect(route.children?.[0].path).toBe('level2');
      expect(route.children?.[0].children).toHaveLength(1);
      expect(route.children?.[0].children?.[0].path).toBe('level3');
      expect(mockRender).toHaveBeenCalledTimes(3); // All three levels
    });
  });

  describe('toRoute - index routes', () => {
    it('should handle index route correctly', () => {
      const componentMaps: ComponentMap = {
        Index: () => <div data-testid="index">Index</div>
      };

      const loader = new RouterLoader({
        componentMaps,
        render: mockRender
      });

      const routeConfig: RouteConfigValue = {
        path: '/',
        index: true,
        element: 'Index'
      };

      const route = loader.toRoute(routeConfig);

      expect(route.path).toBe('/');
      expect(route.index).toBe(true);
      expect(route.children).toBeUndefined(); // Index routes cannot have children
      expect(mockRender).toHaveBeenCalledTimes(1);
    });

    it('should handle non-index route with index: false', () => {
      const componentMaps: ComponentMap = {
        Page: () => <div data-testid="page">Page</div>
      };

      const loader = new RouterLoader({
        componentMaps,
        render: mockRender
      });

      const routeConfig: RouteConfigValue = {
        path: '/page',
        index: false,
        element: 'Page',
        children: [
          {
            path: 'child',
            element: 'Page'
          }
        ]
      };

      const route = loader.toRoute(routeConfig);

      expect(route.path).toBe('/page');
      expect(route.index).toBe(false);
      expect(route.children).toBeDefined();
    });
  });

  describe('toRoute - route properties', () => {
    it('should preserve all route properties', () => {
      const componentMaps: ComponentMap = {
        Page: NotFound
      };

      const loader = new RouterLoader({
        componentMaps,
        render: mockRender
      });

      const routeConfig: RouteConfigValue = {
        path: '/test',
        element: 'Page',
        caseSensitive: true,
        id: 'test-route',
        meta: {
          title: 'Test Page',
          description: 'Test Description'
        }
      };

      const route = loader.toRoute(routeConfig);
      expect(route.path).toBe('/test');
      expect(route.caseSensitive).toBe(true);
      expect(route.id).toBe('test-route');
      // meta is not part of RouteObject, so it should be excluded
      expect((route as RouteConfigValue).meta).toBe(routeConfig.meta);
    });
  });

  describe('toRoute - undefined element', () => {
    it('should handle undefined element', () => {
      const loader = new RouterLoader({
        render: mockRender
      });

      const routeConfig: RouteConfigValue = {
        path: '/no-element'
        // element is undefined
      };

      const route = loader.toRoute(routeConfig);

      expect(route.path).toBe('/no-element');
      expect(route.element).toBeDefined();
      expect(mockRender).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/no-element',
          element: null
        })
      );
    });
  });

  describe('integration', () => {
    it('should work with real page components', () => {
      const componentMaps: ComponentMap = {
        '404': NotFound,
        '500': NotFound500
      };

      const loader = new RouterLoader({
        componentMaps,
        render: mockRender
      });

      const routes: RouteConfigValue[] = [
        { path: '/404', element: '404' },
        { path: '/500', element: '500' }
      ];

      const convertedRoutes = routes.map((route) => loader.toRoute(route));

      expect(convertedRoutes).toHaveLength(2);
      expect(convertedRoutes[0].path).toBe('/404');
      expect(convertedRoutes[1].path).toBe('/500');
      expect(mockRender).toHaveBeenCalledTimes(2);
    });
  });
});
