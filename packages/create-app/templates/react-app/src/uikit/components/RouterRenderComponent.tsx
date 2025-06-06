import { Suspense } from 'react';
import { Loading } from './Loading';
import BaseRouteProvider from '@/uikit/providers/BaseRouteProvider';
import { RouterLoaderRender } from '@/base/cases/RouterLoader';

export const RouterRenderComponent: RouterLoaderRender = (route) => {
  const Component = route.element();

  return (
    <Suspense fallback={<Loading fullscreen />}>
      <BaseRouteProvider {...route.meta}>
        <Component />
      </BaseRouteProvider>
    </Suspense>
  );
};
