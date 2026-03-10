import {
  RouterContext,
  type RouterContextValue
} from '@/contexts/RouterContext';
import type {
  RouteConfigMeta,
  RouteConfigValue
} from '@interfaces/RouteLoaderInterface';
import { Suspense, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface MatchResult {
  stack: RouteConfigValue[];
  params: Record<string, string>;
}

export type RouterComponentMap = Record<
  string,
  React.ComponentType<RouteConfigMeta & { children?: ReactNode }>
>;
function findInitialPath(
  routes: RouteConfigValue[],
  currentPrefix = ''
): string | null {
  for (const route of routes) {
    if (route.index) {
      return currentPrefix || '/';
    }
    if (route.path && route.path !== '*' && !route.path.startsWith(':')) {
      const nextPrefix =
        currentPrefix === '/'
          ? `/${route.path}`
          : `${currentPrefix}/${route.path}`;
      if (route.children && route.children.length > 0) {
        const found = findInitialPath(route.children, nextPrefix);
        if (found) return found;
      }
    }
  }
  return null;
}

function findRouteStack(
  routes: RouteConfigValue[],
  segments: string[],
  currentStack: RouteConfigValue[] = [],
  params: Record<string, string> = {}
): MatchResult | null {
  for (const route of routes) {
    if (route.path === '*') continue;

    if (route.index && segments.length === 0) {
      return { stack: [...currentStack, route], params };
    }

    if (!route.path || route.index) continue;

    const routePath = route.path;

    // 修复：处理根路径 '/' 下寻找 index 的情况
    if (segments.length === 0 && routePath === '/') {
      if (route.children && route.children.length > 0) {
        const result = findRouteStack(
          route.children,
          [],
          [...currentStack, route],
          params
        );
        if (result) return result;
      }
      continue;
    }

    // 根路径 '/' 作为前缀：不消费 segment，直接用当前 segments 匹配 children（如 /login 匹配 auth/Layout 的 children）
    if (routePath === '/' && route.children && route.children.length > 0) {
      const result = findRouteStack(
        route.children,
        segments,
        [...currentStack, route],
        params
      );
      if (result) return result;
      continue;
    }

    const currentSegment = segments[0];
    if (!currentSegment) continue;

    let isMatch = false;
    const newParams = { ...params };

    if (routePath.startsWith(':')) {
      const paramName = routePath.slice(1);
      newParams[paramName] = decodeURIComponent(currentSegment);
      isMatch = true;
    } else if (routePath === currentSegment) {
      isMatch = true;
    }

    if (isMatch) {
      const remainingSegments = segments.slice(1);

      if (
        remainingSegments.length > 0 &&
        route.children &&
        route.children.length > 0
      ) {
        const result = findRouteStack(
          route.children,
          remainingSegments,
          [...currentStack, route],
          newParams
        );
        if (result) return result;
      } else if (remainingSegments.length === 0) {
        return { stack: [...currentStack, route], params: newParams };
      }
    }
  }

  const wildcardRoute = routes.find((r) => r.path === '*');
  if (wildcardRoute) {
    return { stack: [...currentStack, wildcardRoute], params };
  }

  return null;
}

function renderRouteStack(
  componentMap: RouterComponentMap,
  stack: RouteConfigValue[],
  params: Record<string, string>,
  index: number
): ReactNode {
  if (index >= stack.length) return null;

  const route = stack[index];
  const componentKey = route.element as string;

  if (!componentKey) {
    return <div key={`err-${index}`}>Error: Route missing element</div>;
  }

  const Component = componentMap[componentKey];

  if (!Component) {
    return (
      <div key={`err-${index}`} style={{ color: 'red' }}>
        Error: Component "{componentKey}" not registered.
      </div>
    );
  }

  const innerContent = renderRouteStack(componentMap, stack, params, index + 1);

  return (
    <Suspense
      key={componentKey}
      fallback={<div style={{ padding: 20 }}>Loading {componentKey}...</div>}>
      <Component {...route.meta} {...params} children={innerContent} />
    </Suspense>
  );
}

interface RouterProviderProps {
  children?: ReactNode;
  routes: RouteConfigValue[];
  componentMap: RouterComponentMap;
}

export const RouterProvider: React.FC<RouterProviderProps> = ({
  routes,
  componentMap,
  children
}) => {
  // 1. 初始化路径 (使用 useMemo 是安全的，因为它只运行一次且不依赖状态)
  const initialPath = useMemo(() => {
    const found = findInitialPath(routes);
    return found || '/';
  }, [routes]);

  const [currentPath, setCurrentPath] = useState<string>(initialPath);

  // 2. 导航方法
  // React Compiler 会自动优化这个函数，无需手动 useCallback
  const navigate = (path: string) => {
    // console.log('[Router] Navigating to:', path);
    setCurrentPath(path);
  };

  // 3. 渲染内容
  // 【修复点】：移除了 useMemo，让 React Compiler 自动处理依赖和缓存
  // 逻辑很简单：依赖 currentPath -> 计算 -> 返回 JSX
  const cleanPath = currentPath.replace(/^\/+|\/+$/g, '');
  const segments = cleanPath ? cleanPath.split('/') : [];
  const matchResult = findRouteStack(routes, segments);

  let renderedContent: ReactNode;
  if (!matchResult) {
    renderedContent = (
      <div style={{ padding: 20 }}>404: No route found for "{currentPath}"</div>
    );
  } else {
    renderedContent = renderRouteStack(
      componentMap,
      matchResult.stack,
      matchResult.params,
      0
    );
  }

  // 4. Context Value
  // 同样，让 Compiler 自动处理对象创建的优化
  const contextValue: RouterContextValue = {
    currentPath,
    navigate
  };

  return (
    <RouterContext.Provider value={contextValue}>
      {renderedContent}
      {children}
    </RouterContext.Provider>
  );
};
