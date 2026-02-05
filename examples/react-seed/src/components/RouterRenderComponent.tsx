import { Suspense, isValidElement } from 'react';
import { Loading } from './Loading';
import type { RouterLoaderRender } from '@/impls/RouterLoader';
import type { ComponentType, ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';

export type RouterRenderProps = {
  route: Omit<RouteObject, 'element'>;
};

/**
 * Renders route element: if it's a component (function/lazy), render as <Component />;
 * otherwise treat as ReactNode and pass through.
 */
export const RouterRenderComponent: RouterLoaderRender = (route) => {
  const { element, ...rest } = route;

  if (element == null) {
    return null;
  }

  const isNode =
    isValidElement(element) ||
    typeof element === 'string' ||
    typeof element === 'number';

  let content: ReactNode;
  if (isNode) {
    content = element;
  } else {
    const Component = element as ComponentType<RouterRenderProps>;
    content = <Component route={rest as Omit<RouteObject, 'element'>} />;
  }

  return (
    <Suspense
      data-testid="RouterRenderComponent"
      fallback={<Loading fullscreen />}
    >
      {content}
    </Suspense>
  );
};
