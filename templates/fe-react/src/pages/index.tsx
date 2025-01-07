import { lazy, PropsWithChildren, Suspense } from 'react';
import { LazyExoticComponent } from 'react';
import isString from 'lodash/isString';
import { RouteObject } from 'react-router-dom';
import { RoutePageProps } from './base/type';
import NotFound from './404';
import PageProvider from './base/PageProvider';

export type RouteType = RouteObject & {
  pageProps?: RoutePageProps;
};

export type RouteConfig = {
  routes: RouteType[];
};

type PagesMaps = Record<
  string,
  () => LazyExoticComponent<React.ComponentType<unknown>>
>;

type LoadProps = {
  pagesMaps: PagesMaps;
  componentPath: string;
  route: RouteType;
  Provider?: React.ComponentType<PropsWithChildren<RoutePageProps>>;
};

const getRealComponents = () => {
  return import.meta.glob('./*/**/*.tsx');
};

const getLazyComponentMaps = () => {
  const modules = getRealComponents();

  const pagesMaps: PagesMaps = {};

  for (const path in modules) {
    // 提取相对路径并去掉文件扩展名
    const componentName = path.replace(/^\.\/(.*)\.tsx$/, '$1');
    pagesMaps[componentName] = () =>
      lazy(
        modules[path] as () => Promise<{
          default: React.ComponentType<unknown>;
        }>
      );
  }

  return pagesMaps;
};

// 懒加载组件
const lazyLoad = ({ pagesMaps, componentPath, route, Provider }: LoadProps) => {
  const loadedComponent = pagesMaps[componentPath];

  if (!loadedComponent) {
    console.warn(`Route ${componentPath} not found`);
    return <NotFound />;
  }

  const Component = loadedComponent();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {Provider ? (
        <Provider {...route.pageProps}>
          <Component />
        </Provider>
      ) : (
        <Component />
      )}
    </Suspense>
  );
};

// 转换单个路由
const transformRoute = (
  route: RouteType,
  options: Pick<LoadProps, 'pagesMaps' | 'Provider'>
): RouteType => {
  const result: RouteType = {
    ...route,
    path: route.path
  };

  if (isString(route.element)) {
    result.element = lazyLoad({
      ...options,
      componentPath: route.element,
      route
    });
  }

  if (route.children) {
    result.children = route.children.map((child) =>
      transformRoute(child, options)
    );
  }

  return result;
};

export function createReactRouters(config: RouteConfig) {
  const { routes } = config;

  const pagesMaps = getLazyComponentMaps();

  return routes.map((route) =>
    transformRoute(route, { pagesMaps, Provider: PageProvider })
  );
}
