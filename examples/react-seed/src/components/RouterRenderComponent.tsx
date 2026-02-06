import { Suspense, isValidElement } from 'react';
import { Loading } from './Loading';
import { Page } from './Page';
import type { RouterLoaderRender } from '@/impls/RouterLoader';
import type { RouteConfigValue } from '@/interfaces/RouteLoaderInterface';
import type { ComponentType, ReactNode } from 'react';

export type RouterRenderProps = {
  route: Omit<RouteConfigValue, 'element'>;
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
    content = <Component route={rest} />;
  }

  return (
    <Page route={rest}>
      <Suspense fallback={<Loading fullscreen />}>{content}</Suspense>
    </Page>
  );
};
