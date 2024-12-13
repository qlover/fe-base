import { createBrowserRouter, RouteObject } from 'react-router-dom';
import appRouterConfig from '../../config/app.router.json';
import { LazyExoticComponent, Suspense } from 'react';
import { lazy } from 'react';
import { isString } from 'lodash';
import NotFound from './404';

const pagesMaps: Record<string, () => LazyExoticComponent<any>> = {
  'base/BasicLayout': () => lazy(() => import('./base/BasicLayout')),
  'base/Home': () => lazy(() => import('./base/Home')),
  'base/About': () => lazy(() => import('./base/About')),
  'base/JSONStorage': () => lazy(() => import('./base/JSONStorage')),
  '404': () => lazy(() => import('./404'))
};

// 懒加载组件
const lazyLoad = (componentPath: string) => {
  let loadedComponent = pagesMaps[componentPath];

  if (!loadedComponent) {
    console.warn(`Route ${componentPath} not found`);
    return <NotFound />;
  }

  const Component = loadedComponent();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  );
};

// 转换单个路由
const transformRoute = (route: RouteObject): RouteObject => {
  const result: RouteObject = {
    ...route,
    path: route.path
  };

  if (isString(route.element)) {
    result.element = lazyLoad(route.element);
  }

  if (route.children) {
    result.children = route.children.map(transformRoute);
  }

  return result;
};

export const transformRoutes = (routes: RouteObject[]): RouteObject[] => {
  return routes.map(transformRoute);
};

export const routerBase = createBrowserRouter(transformRoutes(appRouterConfig));
