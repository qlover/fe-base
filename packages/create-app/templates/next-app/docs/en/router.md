# Router System Development Guide

## Table of Contents

1. [Router System Overview](#router-system-overview)
2. [Router Services and Interfaces](#router-services-and-interfaces)
3. [Router Middleware and Permissions](#router-middleware-and-permissions)
4. [Router Navigation and Hooks](#router-navigation-and-hooks)
5. [Best Practices and Examples](#best-practices-and-examples)

## Router System Overview

### 1. Router Architecture

The project combines Next.js App Router with custom router services:

```
Router Layer               Service Layer
┌──────────────┐          ┌──────────────┐
│  Page Routes │          │Router Service│
├──────────────┤          ├──────────────┤
│  Middleware  │    ◄─────┤   Navigation │
├──────────────┤          ├──────────────┤
│  Auth Control│          │Auth Service  │
└──────────────┘          └──────────────┘
```

### 2. Route Types

```typescript
// 1. Basic route configuration
export const routes = {
  // Public routes
  home: '/',
  login: '/login',
  register: '/register',

  // Admin routes
  admin: {
    root: '/admin',
    users: '/admin/users',
    settings: '/admin/settings'
  }
};

// 2. Route metadata
interface RouteMetadata {
  title: string;
  auth?: boolean;
  roles?: string[];
}

// 3. Route configuration
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

## Router Services and Interfaces

### 1. Router Service Interface

```typescript
// 1. Router interface definition
export interface RouterInterface {
  // Navigation methods
  navigate(path: string, options?: NavigateOptions): void;
  replace(path: string, options?: NavigateOptions): void;
  back(): void;

  // Route state
  getCurrentRoute(): string;
  getRouteParams(): Record<string, string>;

  // Route guards
  beforeEach(guard: NavigationGuard): void;
  afterEach(hook: NavigationHook): void;
}

// 2. Navigation options
interface NavigateOptions {
  query?: Record<string, string>;
  state?: unknown;
  locale?: string;
}

// 3. Navigation guards
type NavigationGuard = (to: string, from: string) => boolean | Promise<boolean>;
type NavigationHook = (to: string, from: string) => void;
```

### 2. Router Service Implementation

```typescript
@injectable()
export class RouterService implements RouterInterface {
  constructor(
    @inject(I18nService) private i18n: I18nServiceInterface,
    @inject(AuthService) private auth: AuthServiceInterface
  ) {}

  // Navigate to home
  gotoHome(): void {
    this.navigate(routes.home);
  }

  // Navigate to login
  gotoLogin(): void {
    this.navigate(routes.login);
  }

  // Basic navigation method
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

  // Get current route
  getCurrentRoute(): string {
    return window.location.pathname.replace(
      new RegExp(`^/${this.i18n.currentLocale}`),
      ''
    );
  }
}
```

## Router Middleware and Permissions

### 1. Router Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18nConfig } from '@config/i18n';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Language middleware
  if (!i18nConfig.supportedLngs.some((lng) => pathname.startsWith(`/${lng}`))) {
    return NextResponse.redirect(
      new URL(`/${i18nConfig.defaultLocale}${pathname}`, request.url)
    );
  }

  // 2. Authentication middleware
  const token = request.cookies.get('token');
  if (pathname.startsWith('/admin') && !token) {
    const locale = pathname.split('/')[1];
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }
}

// Configure middleware matching paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

### 2. Permission Control

```typescript
// 1. Permission component
export function PrivateRoute({
  children,
  roles
}: PropsWithChildren<{ roles?: string[] }>) {
  const auth = useAuth();
  const locale = useLocale();

  // Check authentication status
  if (!auth.isAuthenticated) {
    return redirect(`/${locale}/login`);
  }

  // Check role permissions
  if (roles && !roles.some(role => auth.hasRole(role))) {
    return redirect(`/${locale}/403`);
  }

  return children;
}

// 2. Use in page
export default function AdminPage() {
  return (
    <PrivateRoute roles={['admin']}>
      <AdminDashboard />
    </PrivateRoute>
  );
}
```

## Router Navigation and Hooks

### 1. Navigation Components

```typescript
// 1. Localized link component
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

// 2. Navigation menu
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

### 2. Router Hooks

```typescript
// 1. Use router hook
export function useRouteGuard() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    // Check authentication status on route change
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

// 2. Use in application
export function App() {
  useRouteGuard();

  return (
    <RouterProvider>
      {/* Application content */}
    </RouterProvider>
  );
}
```

## Best Practices and Examples

### 1. Route Organization

```typescript
// 1. Organize routes by feature
app /
  [locale] /
  public / // Public route group
  page.tsx; // Homepage
about /
  page.tsx(
    // About page
    auth
  ) / // Auth route group
  login /
  page.tsx;
register /
  page.tsx(admin) / // Admin route group
  admin /
  layout.tsx; // Admin layout
page.tsx; // Admin homepage
users / page.tsx; // User management

// 2. Route constants
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

### 2. Type-Safe Routes

```typescript
// 1. Route type definitions
type Route = keyof typeof ROUTES;
type PublicRoute = keyof typeof ROUTES.PUBLIC;
type AdminRoute = keyof typeof ROUTES.ADMIN;

// 2. Type-safe navigation
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

// 3. Use type-safe routes
function Navigation() {
  const router = useTypedRouter();

  const handleClick = () => {
    router.push(ROUTES.ADMIN.USERS); // Type-safe
  };
}
```

### 3. Route Metadata

```typescript
// 1. Metadata type
interface PageMetadata {
  title: string;
  description?: string;
  auth?: boolean;
  roles?: string[];
}

// 2. Route metadata configuration
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

// 3. Generate metadata
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

## Summary

The project's router system follows these principles:

1. **Layered Architecture**:
   - Page router layer
   - Service layer
   - Middleware layer

2. **Type Safety**:
   - Route constants
   - Type definitions
   - Compile-time checking

3. **Permission Control**:
   - Route guards
   - Role permissions
   - Middleware interception

4. **Best Practices**:
   - Route organization
   - Type safety
   - Metadata management
