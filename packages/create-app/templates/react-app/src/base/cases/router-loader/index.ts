import { RouteObject } from 'react-router-dom';
import isString from 'lodash/isString';
import type { ComponentType, LazyExoticComponent, ReactNode } from 'react';

export type ComponentValue = Record<string, () => unknown>;

type RouteComponentType<T = unknown> =
  | ComponentType<T>
  | LazyExoticComponent<ComponentType<T>>;

export type RouteConfigValue = Omit<RouteObject, 'element' | 'children'> & {
  /**
   * 路径
   *
   * FIXME: support `ReactNode`
   */
  element?: string;
  children?: RouteConfigValue[];
  meta?: Record<string, unknown>;
};

export type RouterLoaderRender = (
  route: Omit<RouteConfigValue, 'element'> & {
    element: () => RouteComponentType;
  }
) => ReactNode;

export type RouterLoaderOptions = {
  /**
   * 路由配置
   */
  routes?: RouteConfigValue[];

  /**
   * 组件映射表
   */
  componentMaps?: ComponentValue;

  /**
   * 渲染路由
   */
  render: RouterLoaderRender;
};

export class RouterLoader {
  constructor(private readonly options: RouterLoaderOptions) {
    if (!options.render) {
      throw new Error('RouterLoader render is required');
    }
  }

  getComponentMaps(): ComponentValue {
    const { componentMaps = {} } = this.options;

    return componentMaps;
  }

  getComponent(element: string): () => RouteComponentType {
    const maps = this.getComponentMaps();

    const component = maps[element];

    if (!component) {
      throw new Error(`Component not found: ${element}`);
    }

    return component as () => RouteComponentType;
  }

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
