import { createBrowserRouter, RouteObject } from 'react-router-dom';
import appRouterConfig from '../../config/app.router.json';
import { LazyExoticComponent, Suspense } from 'react';
import { lazy } from 'react';
import { isString } from 'lodash';
import NotFound from './404';
import { RoutePageProps } from './base/type';
import PageProvider from './base/PageProvider';

export type RouteType = RouteObject & RoutePageProps;

const pagesMaps: Record<
  string,
  () => LazyExoticComponent<React.ComponentType<RoutePageProps>>
> = {
  'base/BasicLayout': () => lazy(() => import('./base/BasicLayout')),
  'base/Home': () => lazy(() => import('./base/Home')),
  'base/About': () => lazy(() => import('./base/About')),
  'base/JSONStorage': () => lazy(() => import('./base/JSONStorage')),
  'base/Request': () => lazy(() => import('./base/Request')),
  'base/Executor': () => lazy(() => import('./base/Executor')),
  'base/RedirectPathname': () => lazy(() => import('./base/RedirectPathname')),
  '404': () =>
    lazy(
      () =>
        import('./404') as Promise<{
          default: React.ComponentType<RoutePageProps>;
        }>
    )
};

// 懒加载组件
const lazyLoad = (componentPath: string, route: RouteType) => {
  const loadedComponent = pagesMaps[componentPath];

  if (!loadedComponent) {
    console.warn(`Route ${componentPath} not found`);
    return <NotFound />;
  }

  const Component = loadedComponent();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageProvider pageProps={route.pageProps || {}}>
        <Component pageProps={route.pageProps} />
      </PageProvider>
    </Suspense>
  );
};

// 转换单个路由
const transformRoute = (route: RouteType): RouteType => {
  const result: RouteType = {
    ...route,
    path: route.path
  };

  if (isString(route.element)) {
    result.element = lazyLoad(route.element, route);
  }

  if (route.children) {
    result.children = route.children.map(transformRoute);
  }

  return result;
};

export const transformRoutes = (routes: RouteType[]): RouteType[] => {
  return routes.map(transformRoute);
};

export const routerBase = createBrowserRouter(transformRoutes(appRouterConfig));
