# Router System

## Overview

The router system uses configuration-based routing, implementing a flexible and extensible routing management solution through `RouteService` and `RouterLoader`. Main features:

- **Configuration Driven**: Define routes through configuration files, no need to manually write router components
- **Code Splitting**: Automatically handle component lazy loading
- **Type Safety**: Complete TypeScript type support
- **State Management**: Seamless integration with Store system
- **Internationalization Support**: Built-in multi-language route support
- **Metadata Extension**: Support route-level metadata configuration

## Route Configuration

### 1. Path Configuration (path)

`path` defines the URL path pattern for the route:

```typescript
{
  // Basic path
  path: '/about',                  // Matches /about

  // Dynamic parameters
  path: '/user/:id',              // Matches /user/123

  // Optional parameters
  path: '/posts/:id?',            // Matches /posts and /posts/1

  // Multi-level paths
  path: '/blog/:category/:id',    // Matches /blog/tech/123

  // Wildcards
  path: '*',                      // Matches any undefined path

  // Internationalized paths
  path: '/:lng/dashboard',        // Matches /en/dashboard, /zh/dashboard

  // Index routes (default child route)
  index: true                     // Default rendering content for parent route
}
```

### 2. Component Configuration (element)

`element` uses string identifiers to reference actual components, this design has the following advantages:

1. **Automatic Code Splitting**:

```typescript
// App.tsx
function getAllPages() {
  // Automatically scan all components under pages directory
  const modules = import.meta.glob('./pages/**/*.tsx');
  return Object.keys(modules).reduce((acc, path) => {
    // Convert file path to component identifier
    const componentName = path.replace(/^\.\/pages\/(.*)\.tsx$/, '$1');
    // Create lazy-loaded component
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

2. **Component Mapping Rules**:

```typescript
{
  // Basic component mapping
  element: 'HomePage',           // Maps to pages/HomePage.tsx

  // Subdirectory components
  element: 'user/Profile',      // Maps to pages/user/Profile.tsx

  // Layout components
  element: 'layouts/Default',   // Maps to pages/layouts/Default.tsx

  // Special pages
  element: '404',              // Maps to pages/404.tsx

  // Authentication related pages
  element: 'auth/LoginPage'    // Maps to pages/auth/LoginPage.tsx
}
```

3. **Component Loading Process**:

```typescript
class RouterLoader {
  // Get component implementation
  getComponent(element: string): () => RouteComponentType {
    const maps = this.getComponentMaps();
    const component = maps[element];

    if (!component) {
      throw new Error(`Component not found: ${element}`);
    }

    return component;
  }

  // Convert to route object
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

4. **Component Rendering Process**:

```tsx
// RouterRenderComponent.tsx
export const RouterRenderComponent: RouterLoaderRender = (route) => {
  const Component = route.element(); // Lazy-loaded component

  return (
    <Suspense fallback={<Loading fullscreen />}>
      <BaseRouteProvider {...route.meta}>
        <Component />
      </BaseRouteProvider>
    </Suspense>
  );
};
```

### 3. Complete Route Example

```typescript
export const baseRoutes: RouteConfigValue[] = [
  // Redirect route
  {
    path: '/',
    element: 'base/RedirectPathname' // Handle default language redirect
  },

  // Main layout route
  {
    path: '/:lng', // Language parameter
    element: 'base/Layout', // Main layout component
    meta: {
      category: 'main'
    },
    children: [
      // Home route
      {
        index: true, // Default child route
        element: 'base/HomePage', // Home page component
        meta: {
          title: 'PAGE_HOME_TITLE',
          icon: 'home',
          localNamespace: 'common'
        }
      },

      // Feature page route
      {
        path: 'dashboard', // Dashboard page
        element: 'base/DashboardPage',
        meta: {
          title: 'PAGE_DASHBOARD_TITLE',
          icon: 'dashboard'
        }
      }
    ]
  },

  // Auth layout route
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

### 2. Route Type Definitions

```typescript
interface RouteConfigValue {
  path?: string; // Route path
  element: string; // Component identifier
  children?: RouteConfigValue[]; // Child routes
  meta?: RouteMeta; // Route metadata
  index?: boolean; // Whether it's an index route
}

interface RouteMeta {
  title?: string; // Page title
  description?: string; // Page description
  icon?: string; // Page icon
  category?: string; // Route category
  localNamespace?: string; // Internationalization namespace
}
```

## Core Components

### 1. RouterLoader

`RouterLoader` is responsible for converting route configurations into actual route components:

```typescript
class RouterLoader {
  constructor(private readonly options: RouterLoaderOptions) {
    if (!options.render) {
      throw new Error('RouterLoader render is required');
    }
  }

  // Convert route configuration to React Router route object
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

`RouteService` manages route state and navigation:

```typescript
class RouteService extends StoreInterface<RouterServiceState> {
  // Compose path (add language prefix)
  composePath(path: string): string {
    const targetLang = I18nService.getCurrentLanguage();
    return `/${targetLang}${path}`;
  }

  // Route navigation
  goto(path: string, options?: NavigateOptions): void {
    path = this.composePath(path);
    this.navigate?.(path, options);
  }

  // Update route configuration
  changeRoutes(routes: RouteConfigValue[]): void {
    this.emit({ routes });
  }
}
```

### 3. RouterRenderComponent

Route rendering component, handles lazy loading and page context:

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

## Usage

### 1. Application Configuration

Configure the router system at the application entry point:

```tsx
function App() {
  // Initialize router loader
  const routerLoader = new RouterLoader({
    componentMaps: getAllPages(),
    render: RouterRenderComponent
  });

  // Get route configuration
  const routes = useStore(IOC(RouteService), (state) => state.routes);

  // Create router
  const routerBase = useMemo(() => {
    const routeList = routes.map((route) => routerLoader.toRoute(route));
    return createBrowserRouter(routeList, {
      basename: routerPrefix
    });
  }, [routes]);

  return <RouterProvider router={routerBase} />;
}
```

### 2. Page Navigation

Use route service for navigation in components:

```tsx
function LoginButton() {
  const routeService = IOC(RouteService);

  const handleLogin = () => {
    routeService.goto('/login');
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

### 3. Route Guards

Implement route-level functionality through `BaseRouteProvider`:

```tsx
function BaseRouteProvider(props: PropsWithChildren<RouteMeta>) {
  const { t } = useTranslation();

  // Automatically set page title
  useDocumentTitle(props.title ? t(props.title) : IOC('AppConfig').appName);

  return (
    <BaseRoutePageContext.Provider value={props}>
      {props.children}
    </BaseRoutePageContext.Provider>
  );
}
```

## Best Practices

1. **Route Organization**
   - Organize route configurations by feature modules
   - Use nested routes for complex page structures
   - Use route metadata appropriately

2. **Code Splitting**
   - Apply code splitting to large page components
   - Use Suspense to handle loading states
   - Preload critical route components

3. **Type Safety**
   - Define types for all route configurations
   - Use constants to manage route paths
   - Avoid hardcoding route strings

4. **Internationalization**
   - Use route parameters for multi-language support
   - Configure page-level translation namespaces
   - Automatically handle title and description translations

## Common Issues

### 1. Routes Not Working

Check the following:

- Ensure route configuration format is correct
- Check if component mapping is properly configured
- Verify paths include language prefix

### 2. Page Loading Failures

Possible solutions:

- Check if components are correctly exported
- Ensure lazy loading is properly configured
- Check if network requests are working correctly

### 3. Type Errors

Common solutions:

- Ensure route configurations match type definitions
- Check if component properties are complete
- Use correct route metadata types
