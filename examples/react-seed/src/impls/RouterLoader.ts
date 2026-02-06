import { default as isString } from 'lodash-es/isString';
import { lazy } from 'react';
import type {
  RouteLoaderInterface,
  RouteConfigElementType,
  RouteConfigValue
} from '@/interfaces/RouteLoaderInterface';
import type { LoggerInterface } from '@qlover/logger';
import type { ComponentType, LazyExoticComponent, ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';

/**
 * Lazy component loader function
 * @description Function that returns a Promise resolving to a component module
 */
type LazyComponentLoader = () => Promise<{
  default: ComponentType<unknown>;
}>;

/**
 * Component value that can be used in componentMaps
 * @description Can be a component itself, a lazy component, or a lazy loader function
 */
type ComponentMapValue =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ComponentType<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | LazyExoticComponent<ComponentType<any>>
  | LazyComponentLoader;

/**
 * Component mapping object
 * @description Maps component identifiers (strings) to their implementations
 */
export type ComponentMap = Record<string, ComponentMapValue>;

type RouteComponentType<T = unknown> =
  | ComponentType<T>
  | LazyExoticComponent<ComponentType<T>>;

export type ParseComponentResult<T> = RouteComponentType<T> | ReactNode;

export type RouterLoaderRender = (
  route: Omit<RouteConfigValue, 'element'> & {
    element: ParseComponentResult<unknown>;
  }
) => ReactNode;

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
  componentMaps?: ComponentMap;

  /**
   * Custom route rendering function
   * @description Controls how route components are rendered
   * @required
   */
  render: RouterLoaderRender;

  /**
   * Logger
   */
  logger?: LoggerInterface;
};

export class RouterLoader implements RouteLoaderInterface {
  constructor(protected options: RouterLoaderOptions) {
    if (!options.render) {
      throw new Error('RouterLoader render is required');
    }
  }

  /**
   * Get the component mapping object
   * @returns Component mapping dictionary
   */
  protected getComponentMaps(): ComponentMap {
    const { componentMaps = {} } = this.options;
    return componentMaps;
  }

  /**
   * Check if a value is a LazyExoticComponent
   * @param value Value to check
   * @returns True if value is a LazyExoticComponent
   */
  protected isLazyExoticComponent(
    value: ComponentMapValue
  ): value is LazyExoticComponent<ComponentType<unknown>> {
    return (
      typeof value === 'object' &&
      value !== null &&
      '$$typeof' in value &&
      (value as { $$typeof?: symbol }).$$typeof ===
        (Symbol.for('react.lazy') as unknown as symbol)
    );
  }

  /**
   * Check if a value is a lazy loader function
   * @description A lazy loader function is a function with no parameters
   * that returns a Promise. We check by calling the function and checking
   * if the return value is a Promise.
   * @param value Value to check
   * @returns True if value is a lazy loader function
   */
  protected isLazyLoader(
    value: ComponentMapValue
  ): value is LazyComponentLoader {
    // Must be a function with no parameters
    if (typeof value !== 'function' || value.length !== 0) {
      return false;
    }

    // Cannot be a LazyExoticComponent
    if (this.isLazyExoticComponent(value as ComponentMapValue)) {
      return false;
    }

    // Check if calling the function returns a Promise
    // This is the most reliable way to distinguish lazy loaders from components
    try {
      const result = (value as () => unknown)();
      return result instanceof Promise;
    } catch {
      // If calling throws an error, it's likely not a lazy loader
      return false;
    }
  }

  /**
   * Check if a value is a React component
   * @param value Value to check
   * @returns True if value is a component
   */
  protected isComponent(
    value: ComponentMapValue
  ): value is
    | ComponentType<unknown>
    | LazyExoticComponent<ComponentType<unknown>> {
    // If it's already a LazyExoticComponent, return true
    if (this.isLazyExoticComponent(value)) {
      return true;
    }

    // If it's a function but not a lazy loader, assume it's a component
    if (typeof value === 'function' && !this.isLazyLoader(value)) {
      return true;
    }

    return false;
  }

  /**
   * Parse route element configuration into a renderable component
   * @description Handles three cases:
   * 1. If element is a string, lookup in componentMaps
   * 2. If element is a ReactNode or ComponentType, return as-is
   * 3. If componentMaps value is a lazy loader, convert to LazyExoticComponent
   *
   * @param element Route element configuration (string, ReactNode, or ComponentType)
   * @returns Parsed component ready for rendering
   */
  protected parseComponent(
    element: RouteConfigElementType<unknown> | string | undefined
  ): ParseComponentResult<unknown> {
    // If element is undefined, return null
    if (element === undefined) {
      return null;
    }

    // If element is a ReactNode or ComponentType, return directly
    if (!isString(element)) {
      return element as ParseComponentResult<unknown>;
    }

    // If element is a string, lookup in componentMaps
    const componentMaps = this.getComponentMaps();
    const componentValue = componentMaps[element];

    // If not found in componentMaps, log warning and return null
    if (componentValue === undefined) {
      this.options.logger?.warn(
        `Component not found in componentMaps for key: ${element}`
      );
      return null;
    }

    // If componentMaps value is already a LazyExoticComponent, return it directly
    if (this.isLazyExoticComponent(componentValue)) {
      return componentValue;
    }

    // If componentMaps value is a lazy loader function, convert to LazyExoticComponent
    if (this.isLazyLoader(componentValue)) {
      return lazy(componentValue) as LazyExoticComponent<
        ComponentType<unknown>
      >;
    }

    // If componentMaps value is already a component, return it
    if (this.isComponent(componentValue)) {
      return componentValue;
    }

    // Fallback: return null if value type is unexpected
    this.options.logger?.warn(
      `Unexpected component type in componentMaps for key: ${element}, type: ${typeof componentValue}`
    );
    return null;
  }

  /**
   * Transform a route configuration into a React Router compatible route
   *
   * @override
   * @param route Route configuration object
   * @returns React Router route object
   */
  public toRoute(route: RouteConfigValue): RouteObject {
    const { render } = this.options;

    const { element, children, index, ...restRouteProps } = route;

    // Parse the element configuration
    const parsedComponent = this.parseComponent(element);

    // Render the route using the custom render function
    const Element = render({ ...restRouteProps, element: parsedComponent });

    // Build the route object based on whether it's an index route
    // Index routes cannot have children in React Router
    if (index === true) {
      return {
        ...restRouteProps,
        index: true,
        element: Element
      } as RouteObject;
    }

    // Non-index route: can have children
    const routeObject: RouteObject = {
      ...restRouteProps,
      element: Element
    };

    // Only add index: false if explicitly set, otherwise omit it
    if (index === false) {
      routeObject.index = false;
    }

    // Add children if they exist
    if (children) {
      routeObject.children = children.map((child) => this.toRoute(child));
    }

    return routeObject;
  }
}
