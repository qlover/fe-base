/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * RouterLoader test suite
 *
 * Coverage:
 * 1. constructor      - Initialization and validation
 * 2. getComponentMaps - Component mapping management
 * 3. getComponent    - Component resolution
 * 4. toRoute         - Route transformation
 * 5. error handling  - Invalid configurations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RouterLoader } from '@/base/cases/RouterLoader';
import type {
  RouteConfigValue,
  RouterLoaderOptions
} from '@/base/cases/RouterLoader';
import { createElement } from 'react';

describe('RouterLoader', () => {
  // Mock components and render function
  const mockHomeComponent = vi.fn(() => createElement('div', { id: 'home' }));
  const mockAboutComponent = vi.fn(() => createElement('div', { id: 'about' }));
  const mockNotFoundComponent = vi.fn(() =>
    createElement('div', { id: '404' })
  );
  const mockRender = vi.fn((route) =>
    createElement('div', null, route.element())
  );

  let defaultOptions: RouterLoaderOptions;

  beforeEach(() => {
    defaultOptions = {
      routes: [
        {
          path: '/',
          element: 'Home',
          children: [
            {
              path: 'about',
              element: 'About'
            }
          ]
        }
      ],
      componentMaps: {
        Home: mockHomeComponent,
        About: mockAboutComponent,
        '404': mockNotFoundComponent
      },
      render: mockRender
    };

    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with valid options', () => {
      const loader = new RouterLoader(defaultOptions);
      expect(loader).toBeInstanceOf(RouterLoader);
    });

    it('should throw error when render is not provided', () => {
      const invalidOptions = { ...defaultOptions, render: undefined };
      expect(() => new RouterLoader(invalidOptions as any)).toThrow(
        'RouterLoader render is required'
      );
    });
  });

  describe('getComponentMaps', () => {
    it('should return component maps', () => {
      const loader = new RouterLoader(defaultOptions);
      const maps = loader.getComponentMaps();
      expect(maps).toEqual(defaultOptions.componentMaps);
    });

    it('should return empty object when no component maps provided', () => {
      const options = { ...defaultOptions, componentMaps: undefined };
      const loader = new RouterLoader(options);
      expect(loader.getComponentMaps()).toEqual({});
    });
  });

  describe('getComponent', () => {
    let loader: RouterLoader;

    beforeEach(() => {
      loader = new RouterLoader(defaultOptions);
    });

    it('should return component for valid element', () => {
      const component = loader.getComponent('Home');
      expect(component).toBe(mockHomeComponent);
    });

    it('should throw error for non-existent component', () => {
      expect(() => loader.getComponent('NonExistent')).toThrow(
        'Component not found: NonExistent'
      );
    });

    it('should return 404 component for empty element', () => {
      const component = loader.getComponent('404');
      expect(component).toBe(mockNotFoundComponent);
    });
  });

  describe('toRoute', () => {
    let loader: RouterLoader;
    let consoleWarnSpy: any;

    beforeEach(() => {
      loader = new RouterLoader(defaultOptions);
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    it('should transform route configuration correctly', () => {
      const route: RouteConfigValue = {
        path: '/test',
        element: 'Home'
      };

      const result = loader.toRoute(route);

      expect(result.path).toBe('/test');
      expect(result.element).toBeTruthy();
      expect(mockRender).toHaveBeenCalled();
    });

    it('should handle nested routes', () => {
      const route: RouteConfigValue = {
        path: '/parent',
        element: 'Home',
        children: [
          {
            path: 'child',
            element: 'About'
          }
        ]
      };

      const result = loader.toRoute(route);

      expect(result.path).toBe('/parent');
      expect(result.children).toHaveLength(1);
      expect(result.children![0].path).toBe('child');
    });

    it('should warn and use 404 component for invalid element', () => {
      const route: RouteConfigValue = {
        path: '/invalid',
        element: undefined
      };

      const result = loader.toRoute(route);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Invalid route, path is: /invalid, element is: undefined'
      );
      expect(result.element).toBeTruthy();
      expect(mockRender).toHaveBeenCalled();
    });

    it('should preserve route metadata', () => {
      const route: RouteConfigValue = {
        path: '/meta',
        element: 'Home',
        meta: {
          title: 'Test Page',
          description: 'A test page',
          category: 'main'
        }
      };

      const result = loader.toRoute(route);

      expect(result.path).toBe('/meta');
      expect((result as any).meta).toEqual({
        title: 'Test Page',
        description: 'A test page',
        category: 'main'
      });
    });

    it('should handle empty children array', () => {
      const route: RouteConfigValue = {
        path: '/empty',
        element: 'Home',
        children: []
      };

      const result = loader.toRoute(route);

      expect(result.children).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should handle missing component maps gracefully', () => {
      const options = {
        routes: defaultOptions.routes,
        render: mockRender
      };

      const loader = new RouterLoader(options);
      expect(() => loader.getComponent('Home')).toThrow(
        'Component not found: Home'
      );
    });

    it('should handle invalid route configurations', () => {
      const loader = new RouterLoader(defaultOptions);
      const invalidRoute = {
        path: '/invalid'
      } as RouteConfigValue;

      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
      loader.toRoute(invalidRoute);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Invalid route, path is: /invalid, element is: undefined'
      );
      consoleWarnSpy.mockRestore();
    });
  });
});
