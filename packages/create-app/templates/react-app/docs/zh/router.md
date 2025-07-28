# 路由系统

## 概述

路由系统采用配置式路由，通过 `RouteService` 和 `RouterLoader` 实现了一个灵活、可扩展的路由管理方案。主要特点：

- **配置驱动**：通过配置文件定义路由，无需手动编写路由组件
- **代码分割**：自动处理组件的懒加载
- **类型安全**：完整的 TypeScript 类型支持
- **状态管理**：与 Store 系统无缝集成
- **国际化支持**：内置多语言路由支持
- **元数据扩展**：支持路由级别的元数据配置

## 路由配置

### 1. 路径配置（path）

`path` 定义了路由的 URL 路径模式：

```typescript
{
  // 基础路径
  path: '/about',                  // 匹配 /about

  // 动态参数
  path: '/user/:id',              // 匹配 /user/123

  // 可选参数
  path: '/posts/:id?',            // 匹配 /posts 和 /posts/1

  // 多层级路径
  path: '/blog/:category/:id',    // 匹配 /blog/tech/123

  // 通配符
  path: '*',                      // 匹配任何未定义的路径

  // 国际化路径
  path: '/:lng/dashboard',        // 匹配 /en/dashboard, /zh/dashboard

  // 索引路由（默认子路由）
  index: true                     // 父路由的默认渲染内容
}
```

### 2. 组件配置（element）

`element` 使用字符串标识符来引用实际的组件，这种设计有以下优势：

1. **自动代码分割**：

```typescript
// App.tsx
function getAllPages() {
  // 自动扫描 pages 目录下的所有组件
  const modules = import.meta.glob('./pages/**/*.tsx');
  return Object.keys(modules).reduce((acc, path) => {
    // 将文件路径转换为组件标识符
    const componentName = path.replace(/^\.\/pages\/(.*)\.tsx$/, '$1');
    // 创建懒加载组件
    acc[componentName] = () =>
      lazy(
        modules[path] as () => Promise<{
          default: React.ComponentType<unknown>;
        }>
      );
    return acc;
  }, {} as ComponentValue);
}
```

2. **组件映射规则**：

```typescript
{
  // 基础组件映射
  element: 'HomePage',           // 映射到 pages/HomePage.tsx

  // 子目录组件
  element: 'user/Profile',      // 映射到 pages/user/Profile.tsx

  // 布局组件
  element: 'layouts/Default',   // 映射到 pages/layouts/Default.tsx

  // 特殊页面
  element: '404',              // 映射到 pages/404.tsx

  // 认证相关页面
  element: 'auth/LoginPage'    // 映射到 pages/auth/LoginPage.tsx
}
```

3. **组件加载过程**：

```typescript
class RouterLoader {
  // 获取组件实现
  getComponent(element: string): () => RouteComponentType {
    const maps = this.getComponentMaps();
    const component = maps[element];

    if (!component) {
      throw new Error(`Component not found: ${element}`);
    }

    return component;
  }

  // 转换为路由对象
  toRoute(route: RouteConfigValue): RouteObject {
    const { element, children, ...rest } = route;
    const component = this.getComponent(element || '404');

    return {
      ...rest,
      element: this.render({ ...rest, element: component }),
      children: children?.map((child) => this.toRoute(child))
    };
  }
}
```

4. **组件渲染流程**：

```tsx
// RouterRenderComponent.tsx
export const RouterRenderComponent: RouterLoaderRender = (route) => {
  const Component = route.element(); // 懒加载组件

  return (
    <Suspense fallback={<Loading fullscreen />}>
      <BaseRouteProvider {...route.meta}>
        <Component />
      </BaseRouteProvider>
    </Suspense>
  );
};
```

### 3. 完整路由示例

```typescript
export const baseRoutes: RouteConfigValue[] = [
  // 重定向路由
  {
    path: '/',
    element: 'base/RedirectPathname' // 处理默认语言重定向
  },

  // 主布局路由
  {
    path: '/:lng', // 语言参数
    element: 'base/Layout', // 主布局组件
    meta: {
      category: 'main'
    },
    children: [
      // 首页路由
      {
        index: true, // 默认子路由
        element: 'base/HomePage', // 首页组件
        meta: {
          title: 'PAGE_HOME_TITLE',
          icon: 'home',
          localNamespace: 'common'
        }
      },

      // 功能页面路由
      {
        path: 'dashboard', // 仪表盘页面
        element: 'base/DashboardPage',
        meta: {
          title: 'PAGE_DASHBOARD_TITLE',
          icon: 'dashboard'
        }
      }
    ]
  },

  // 认证布局路由
  {
    path: '/:lng',
    element: 'auth/Layout',
    meta: {
      category: 'auth'
    },
    children: [
      {
        path: 'login',
        element: 'auth/LoginPage',
        meta: {
          title: 'PAGE_LOGIN_TITLE'
        }
      }
    ]
  }
];
```

### 2. 路由类型定义

```typescript
interface RouteConfigValue {
  path?: string; // 路由路径
  element: string; // 组件标识符
  children?: RouteConfigValue[]; // 子路由
  meta?: RouteMeta; // 路由元数据
  index?: boolean; // 是否为索引路由
}

interface RouteMeta {
  title?: string; // 页面标题
  description?: string; // 页面描述
  icon?: string; // 页面图标
  category?: string; // 路由分类
  localNamespace?: string; // 国际化命名空间
}
```

## 核心组件

### 1. RouterLoader

`RouterLoader` 负责将路由配置转换为实际的路由组件：

```typescript
class RouterLoader {
  constructor(private readonly options: RouterLoaderOptions) {
    if (!options.render) {
      throw new Error('RouterLoader render is required');
    }
  }

  // 转换路由配置为 React Router 路由对象
  toRoute(route: RouteConfigValue): RouteObject {
    const { render } = this.options;
    const { element, children, ...rest } = route;

    const component = this.getComponent(element || '404');
    const Element = render({ ...rest, element: component });

    return {
      ...rest,
      element: Element,
      children: children?.map((child) => this.toRoute(child))
    };
  }
}
```

### 2. RouteService

`RouteService` 管理路由状态和导航：

```typescript
class RouteService extends StoreInterface<RouterServiceState> {
  // 组合路径（添加语言前缀）
  composePath(path: string): string {
    const targetLang = I18nService.getCurrentLanguage();
    return `/${targetLang}${path}`;
  }

  // 路由跳转
  goto(path: string, options?: NavigateOptions): void {
    path = this.composePath(path);
    this.navigate?.(path, options);
  }

  // 更新路由配置
  changeRoutes(routes: RouteConfigValue[]): void {
    this.emit({ routes });
  }
}
```

### 3. RouterRenderComponent

路由渲染组件，处理懒加载和页面上下文：

```tsx
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
```

## 使用方式

### 1. 应用配置

在应用入口处配置路由系统：

```tsx
function App() {
  // 初始化路由加载器
  const routerLoader = new RouterLoader({
    componentMaps: getAllPages(),
    render: RouterRenderComponent
  });

  // 获取路由配置
  const routes = useStore(IOC(RouteService), (state) => state.routes);

  // 创建路由器
  const routerBase = useMemo(() => {
    const routeList = routes.map((route) => routerLoader.toRoute(route));
    return createBrowserRouter(routeList, {
      basename: routerPrefix
    });
  }, [routes]);

  return <RouterProvider router={routerBase} />;
}
```

### 2. 页面导航

在组件中使用路由服务进行导航：

```tsx
function LoginButton() {
  const routeService = IOC(RouteService);

  const handleLogin = () => {
    routeService.goto('/login');
  };

  return <button onClick={handleLogin}>登录</button>;
}
```

### 3. 路由守卫

通过 `BaseRouteProvider` 实现路由级别的功能：

```tsx
function BaseRouteProvider(props: PropsWithChildren<RouteMeta>) {
  const { t } = useTranslation();

  // 自动设置页面标题
  useDocumentTitle(props.title ? t(props.title) : IOC('AppConfig').appName);

  return (
    <BaseRoutePageContext.Provider value={props}>
      {props.children}
    </BaseRoutePageContext.Provider>
  );
}
```

## 最佳实践

1. **路由组织**
   - 按功能模块组织路由配置
   - 使用嵌套路由处理复杂页面结构
   - 合理使用路由元数据

2. **代码分割**
   - 对大型页面组件进行代码分割
   - 使用 Suspense 处理加载状态
   - 预加载关键路由组件

3. **类型安全**
   - 为所有路由配置定义类型
   - 使用常量管理路由路径
   - 避免硬编码路由字符串

4. **国际化**
   - 使用路由参数处理多语言
   - 配置页面级别的翻译命名空间
   - 自动处理标题和描述的翻译

## 常见问题

### 1. 路由不生效

检查以下几点：

- 确保路由配置格式正确
- 检查组件映射是否正确配置
- 验证路径是否包含语言前缀

### 2. 页面加载失败

可能的解决方案：

- 检查组件是否正确导出
- 确保懒加载配置正确
- 查看网络请求是否正常

### 3. 类型错误

常见解决方法：

- 确保路由配置符合类型定义
- 检查组件属性是否完整
- 使用正确的路由元数据类型

```

```
