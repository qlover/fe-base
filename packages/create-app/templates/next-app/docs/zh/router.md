# 路由系统开发指南

## 目录

1. [路由系统概述](#路由系统概述)
2. [路由服务和接口](#路由服务和接口)
3. [路由中间件和权限](#路由中间件和权限)
4. [路由导航和钩子](#路由导航和钩子)
5. [最佳实践和示例](#最佳实践和示例)

## 路由系统概述

### 1. 路由架构

项目采用 Next.js App Router 和自定义路由服务相结合的架构：

```
路由层                      服务层
┌──────────────┐          ┌──────────────┐
│   页面路由   │          │  路由服务    │
├──────────────┤          ├──────────────┤
│   中间件     │    ◄─────┤  导航服务    │
├──────────────┤          ├──────────────┤
│   权限控制   │          │  权限服务    │
└──────────────┘          └──────────────┘
```

### 2. 路由类型

```typescript
// 1. 基础路由配置
export const routes = {
  // 公共路由
  home: '/',
  login: '/login',
  register: '/register',

  // 管理路由
  admin: {
    root: '/admin',
    users: '/admin/users',
    settings: '/admin/settings'
  }
};

// 2. 路由元数据
interface RouteMetadata {
  title: string;
  auth?: boolean;
  roles?: string[];
}

// 3. 路由配置
const routeMetadata: Record<keyof typeof routes, RouteMetadata> = {
  home: {
    title: 'page.home.title'
  },
  login: {
    title: 'page.login.title'
  },
  admin: {
    title: 'page.admin.title',
    auth: true,
    roles: ['admin']
  }
};
```

## 路由服务和接口

### 1. 路由服务接口

```typescript
// 1. 路由接口定义
export interface RouterInterface {
  // 导航方法
  navigate(path: string, options?: NavigateOptions): void;
  replace(path: string, options?: NavigateOptions): void;
  back(): void;

  // 路由状态
  getCurrentRoute(): string;
  getRouteParams(): Record<string, string>;

  // 路由守卫
  beforeEach(guard: NavigationGuard): void;
  afterEach(hook: NavigationHook): void;
}

// 2. 导航选项
interface NavigateOptions {
  query?: Record<string, string>;
  state?: unknown;
  locale?: string;
}

// 3. 导航守卫
type NavigationGuard = (to: string, from: string) => boolean | Promise<boolean>;
type NavigationHook = (to: string, from: string) => void;
```

### 2. 路由服务实现

```typescript
@injectable()
export class RouterService implements RouterInterface {
  constructor(
    @inject(I18nService) private i18n: I18nServiceInterface,
    @inject(AuthService) private auth: AuthServiceInterface
  ) {}

  // 导航到首页
  gotoHome(): void {
    this.navigate(routes.home);
  }

  // 导航到登录页
  gotoLogin(): void {
    this.navigate(routes.login);
  }

  // 基础导航方法
  navigate(path: string, options?: NavigateOptions): void {
    const locale = options?.locale || this.i18n.currentLocale;
    const localePath = `/${locale}${path}`;

    if (options?.query) {
      const queryString = new URLSearchParams(options.query).toString();
      window.location.href = `${localePath}?${queryString}`;
    } else {
      window.location.href = localePath;
    }
  }

  // 获取当前路由
  getCurrentRoute(): string {
    return window.location.pathname.replace(
      new RegExp(`^/${this.i18n.currentLocale}`),
      ''
    );
  }
}
```

## 路由中间件和权限

### 1. 路由中间件

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18nConfig } from '@config/i18n';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 语言中间件
  if (!i18nConfig.supportedLngs.some((lng) => pathname.startsWith(`/${lng}`))) {
    return NextResponse.redirect(
      new URL(`/${i18nConfig.defaultLocale}${pathname}`, request.url)
    );
  }

  // 2. 认证中间件
  const token = request.cookies.get('token');
  if (pathname.startsWith('/admin') && !token) {
    const locale = pathname.split('/')[1];
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }
}

// 配置中间件匹配路径
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

### 2. 权限控制

```typescript
// 1. 权限组件
export function PrivateRoute({
  children,
  roles
}: PropsWithChildren<{ roles?: string[] }>) {
  const auth = useAuth();
  const locale = useLocale();

  // 检查认证状态
  if (!auth.isAuthenticated) {
    return redirect(`/${locale}/login`);
  }

  // 检查角色权限
  if (roles && !roles.some(role => auth.hasRole(role))) {
    return redirect(`/${locale}/403`);
  }

  return children;
}

// 2. 在页面中使用
export default function AdminPage() {
  return (
    <PrivateRoute roles={['admin']}>
      <AdminDashboard />
    </PrivateRoute>
  );
}
```

## 路由导航和钩子

### 1. 导航组件

```typescript
// 1. 本地化链接组件
export function LocaleLink({
  href,
  locale,
  children,
  ...props
}: LocaleLinkProps) {
  const currentLocale = useLocale();
  const finalLocale = locale || currentLocale;

  return (
    <Link href={`/${finalLocale}${href}`} {...props}>
      {children}
    </Link>
  );
}

// 2. 导航菜单
export function AdminNav() {
  const { navItems } = useStore(adminPageManager);
  const locale = useLocale();
  const t = useTranslations();

  return (
    <Menu>
      {navItems.map(item => (
        <Menu.Item key={item.key}>
          <LocaleLink href={item.pathname}>
            {t(item.i18nKey)}
          </LocaleLink>
        </Menu.Item>
      ))}
    </Menu>
  );
}
```

### 2. 路由钩子

```typescript
// 1. 使用路由钩子
export function useRouteGuard() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    // 路由变化时检查认证状态
    const handleRouteChange = (url: string) => {
      if (url.startsWith('/admin') && !auth.isAuthenticated) {
        router.push('/login');
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router, auth]);
}

// 2. 在应用中使用
export function App() {
  useRouteGuard();

  return (
    <RouterProvider>
      {/* 应用内容 */}
    </RouterProvider>
  );
}
```

## 最佳实践和示例

### 1. 路由组织

```typescript
// 1. 按功能组织路由
app /
  [locale] /
  public / // 公共路由组
  page.tsx; // 首页
about /
  page.tsx(
    // 关于页面
    auth
  ) / // 认证路由组
  login /
  page.tsx;
register /
  page.tsx(admin) / // 管理路由组
  admin /
  layout.tsx; // 管理布局
page.tsx; // 管理首页
users / page.tsx; // 用户管理

// 2. 路由常量
export const ROUTES = {
  PUBLIC: {
    HOME: '/',
    ABOUT: '/about'
  },
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register'
  },
  ADMIN: {
    ROOT: '/admin',
    USERS: '/admin/users'
  }
} as const;
```

### 2. 类型安全的路由

```typescript
// 1. 路由类型定义
type Route = keyof typeof ROUTES;
type PublicRoute = keyof typeof ROUTES.PUBLIC;
type AdminRoute = keyof typeof ROUTES.ADMIN;

// 2. 类型安全的导航
function useTypedRouter() {
  const router = useRouter();
  const locale = useLocale();

  return {
    push: (route: Route) => {
      router.push(`/${locale}${route}`);
    },
    replace: (route: Route) => {
      router.replace(`/${locale}${route}`);
    }
  };
}

// 3. 使用类型安全的路由
function Navigation() {
  const router = useTypedRouter();

  const handleClick = () => {
    router.push(ROUTES.ADMIN.USERS); // 类型安全
  };
}
```

### 3. 路由元数据

```typescript
// 1. 元数据类型
interface PageMetadata {
  title: string;
  description?: string;
  auth?: boolean;
  roles?: string[];
}

// 2. 路由元数据配置
const pageMetadata: Record<Route, PageMetadata> = {
  [ROUTES.PUBLIC.HOME]: {
    title: 'page.home.title',
    description: 'page.home.description'
  },
  [ROUTES.ADMIN.ROOT]: {
    title: 'page.admin.title',
    auth: true,
    roles: ['admin']
  }
};

// 3. 生成元数据
export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations(locale);
  const route = getCurrentRoute();
  const meta = pageMetadata[route];

  return {
    title: t(meta.title),
    description: meta.description ? t(meta.description) : undefined
  };
}
```

## 总结

项目的路由系统遵循以下原则：

1. **分层架构**：
   - 页面路由层
   - 服务层
   - 中间件层

2. **类型安全**：
   - 路由常量
   - 类型定义
   - 编译时检查

3. **权限控制**：
   - 路由守卫
   - 角色权限
   - 中间件拦截

4. **最佳实践**：
   - 路由组织
   - 类型安全
   - 元数据管理
