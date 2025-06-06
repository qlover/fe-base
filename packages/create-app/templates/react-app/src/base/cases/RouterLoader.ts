import type { ComponentType, LazyExoticComponent, ReactNode } from 'react';
import { RouteObject } from 'react-router-dom';
import isString from 'lodash/isString';

/**
 * Component mapping type for lazy-loaded components
 * @description Maps component identifiers to their lazy-loaded implementations
 */
export type ComponentValue = Record<string, () => unknown>;

/**
 * Route component type definition supporting both regular and lazy-loaded components
 */
type RouteComponentType<T = unknown> =
  | ComponentType<T>
  | LazyExoticComponent<ComponentType<T>>;

/**
 * Extended route configuration interface
 * @description Extends React Router's RouteObject with additional meta information
 */
export type RouteConfigValue = Omit<RouteObject, 'element' | 'children'> & {
  /**
   * Component identifier string that maps to a component in componentMaps
   *
   * TODO: support `ReactNode`
   *
   * @description Used to lookup the actual component implementation
   */
  element?: string;

  /**
   * Nested route configurations
   */
  children?: RouteConfigValue[];

  /**
   * Additional metadata for the route
   * @description Can store any route-specific data like permissions, titles, etc.
   */
  meta?: Record<string, unknown>;
};

/**
 * Route rendering function type
 * @description Function to customize how route components are rendered
 */
export type RouterLoaderRender = (
  route: Omit<RouteConfigValue, 'element'> & {
    element: () => RouteComponentType;
  }
) => ReactNode;

/**
 * Router loader configuration options
 */
export type RouterLoaderOptions = {
  /**
   * Route configuration array
   * @description Defines the application's routing structure
   */
  routes?: RouteConfigValue[];

  /**
   * Component mapping object
   * @description Maps component identifiers to their actual implementations
   * @example
   * {
   *   'Home': () => import('./pages/Home'),
   *   'About': () => import('./pages/About')
   * }
   */
  componentMaps?: ComponentValue;

  /**
   * Custom route rendering function
   * @description Controls how route components are rendered
   * @required
   */
  render: RouterLoaderRender;
};

/**
 * Router Configuration Loader
 *
 * Significance: Manages dynamic route configuration and component loading
 * Core idea: Separate route definitions from component implementations
 * Main function: Transform route configurations into React Router compatible routes
 * Main purpose: Enable dynamic and code-split routing with lazy loading
 *
 * @example
 * const loader = new RouterLoader({
 *   routes: [{
 *     path: '/',
 *     element: 'Home',
 *     children: [{
 *       path: 'about',
 *       element: 'About'
 *     }]
 *   }],
 *   componentMaps: {
 *     'Home': () => import('./pages/Home'),
 *     'About': () => import('./pages/About')
 *   },
 *   render: (route) => <Suspense><route.element /></Suspense>
 * });
 */
export class RouterLoader {
  constructor(private readonly options: RouterLoaderOptions) {
    if (!options.render) {
      throw new Error('RouterLoader render is required');
    }
  }

  /**
   * Get the component mapping object
   * @returns Component mapping dictionary
   */
  getComponentMaps(): ComponentValue {
    const { componentMaps = {} } = this.options;
    return componentMaps;
  }

  /**
   * Retrieve a component implementation by its identifier
   * @param element Component identifier string
   * @returns Component loader function
   * @throws Error if component is not found in componentMaps
   */
  getComponent(element: string): () => RouteComponentType {
    const maps = this.getComponentMaps();
    const component = maps[element];

    if (!component) {
      throw new Error(`Component not found: ${element}`);
    }

    return component as () => RouteComponentType;
  }

  /**
   * Transform a route configuration into a React Router compatible route
   * @param route Route configuration object
   * @returns React Router route object
   */
  toRoute(route: RouteConfigValue): RouteObject {
    const { render } = this.options;
    const { element, children, ...rest } = route;

    if (!element || !isString(element)) {
      console.warn(
        `Invalid route, path is: ${route.path}, element is: ${element}`
      );
    }

    const componet = this.getComponent(element || '404');
    const Element = render({ ...rest, element: componet });

    // @ts-expect-error
    return {
      ...rest,
      element: Element,
      children: children?.map((child) => this.toRoute(child))
    };
  }
}
