import { Suspense } from 'react';
import type { RouterLoaderRender } from '@/base/cases/RouterLoader';
import { BaseRouteProvider } from '@/uikit/components/BaseRouteProvider';
import { Loading } from './Loading';

export const RouterRenderComponent: RouterLoaderRender = (route) => {
  const Component = route.element();

  return (
    <Suspense
      data-testid="RouterRenderComponent"
      fallback={<Loading fullscreen />}
    >
      <BaseRouteProvider {...route.meta}>
        <Component />
      </BaseRouteProvider>
    </Suspense>
  );
};
