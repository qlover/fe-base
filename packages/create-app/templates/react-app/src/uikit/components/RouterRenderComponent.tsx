import { Suspense } from 'react';
import { Loading } from './Loading';
import { RouterLoaderRender } from '@qlover/fe-prod/react/router-loader';
import BaseRouteProvider from '@/uikit/providers/BaseRouteProvider';

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
