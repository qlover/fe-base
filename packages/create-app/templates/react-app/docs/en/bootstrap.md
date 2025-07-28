# Project Bootstrap Guide

## What is Bootstrap?

Bootstrap is an application starter that helps us manage various initialization logic uniformly when the application starts.

**In simple terms**: Just like a computer needs to start various services during boot-up, our application also needs to do some preparation work when starting, such as:

- Check if user is logged in
- Load user information
- Initialize API configuration
- Set theme, language, etc.

File path: src/core/bootstraps

## Implementation in Project

This project is based on the AsyncExecutor of `@qlover/fe-corekit`, and `corekit-bridge` implements Bootstrap on this foundation.

**File Entry**: `src/core/bootstraps/BootstrapApp.ts`

**Main Components**:

1. [IOC Container](./ioc.md) - Dependency injection management
2. [Environment Variable Injection](./env.md) - Configuration management
3. [Browser Global Variable Injection](./global.md) - Browser global properties

## When to Use Bootstrap?

Bootstrap comes in handy when you encounter the following situations:

### Why Need a "Bootstrapper"

**Core Goal**: Make application startup cleaner and business logic clearer.

**Problems Solved**: When a page opens, you need authentication or need to request an API before entering the page, you might do something like this:

```tsx
export function App() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    fetchUserInfo()
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>loading ...</div>;
  }

  return <Router></Router>;
}
```

This code works fine, but the key issue is that it's tightly coupled with the component! That means when fetchUserInfo succeeds, it updates local state and then renders Router.

However, if the logic for entering Router becomes complex and depends on various conditions, the component becomes very bloated and hard to maintain.

For example, consider this situation:

When the route is /home, request user information, after success, if the user's roles have permission then enter, otherwise redirect to /login

```tsx
export function App() {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);

    // Check current route
    if (location.pathname === '/home') {
      fetchUserInfo()
        .then((user) => {
          setUserInfo(user);

          // Check user permissions
          if (user.roles && user.roles.includes('admin')) {
            setHasPermission(true);
            setLoading(false);
          } else {
            // No permission, redirect to login page
            window.location.href = '/login';
          }
        })
        .catch((error) => {
          console.error('Failed to fetch user info:', error);
          // Also redirect to login page on request failure
          window.location.href = '/login';
        });
    } else {
      setLoading(false);
    }
  }, [location.pathname]);

  // If loading, show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // If home page but no permission, show error message
  if (location.pathname === '/home' && !hasPermission) {
    return <div>Access denied</div>;
  }

  return <Router />;
}
```

This example shows several issues:

1. **Component Has Too Many Responsibilities**: App component needs to handle routing, user authentication, permission checking, error handling, etc.
2. **Complex State Management**: Need to manage multiple states like loading, userInfo, hasPermission
3. **Logic Coupling**: Authentication logic mixed with component rendering logic
4. **Hard to Test**: Component contains too much business logic, making unit testing difficult
5. **Hard to Extend**: If more permission checks or authentication logic need to be added later, the component becomes more bloated

These problems will amplify step by step after project iterations until you start refactoring code!

## What is a Bootstrapper?

A bootstrapper is a front-end logic processor that runs at the UI layer, with core functions:

1. **Front-end Logic Processing**: Execute necessary initialization logic before application rendering
2. **State Management**: Manage application state through store, achieving reactive UI updates
3. **Separation of Concerns**: Separate business logic from UI components

### Core Features

- **Asynchronous Execution**: Implement asynchronous logic processing based on AsyncExecutor
- **State Driven**: Trigger UI updates through store state changes
- **Modular**: Support IOC container, environment variable injection, global variable injection, and other modules

### Workflow

```
App Start → Bootstrap Initialization → Execute Front-end Logic → Update Store → UI Responds to Updates
```

### Comparison with Traditional Approach

**Traditional Approach**:

```tsx
// Business logic mixed in component
function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Business logic mixed in component
    fetchData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  return <MainContent data={data} />;
}
```

**Using Bootstrapper**:

```tsx
// Component only focuses on rendering
function App() {
  const { loading, data } = useStore(); // Get state from store

  if (loading) return <Loading />;
  return <MainContent data={data} />;
}

// Business logic handled in bootstrapper
const bootstrap = new Bootstrap({
  root: window,
  logger,
  ioc: {
    manager: IOC,
    register: new IocRegisterImpl({ pathname, appConfig })
  },
  envOptions: {
    target: appConfig,
    source: import.meta.env,
    prefix: 'APP_'
  },
  globalOptions: {
    sources: globals,
    target: 'AppGlobals'
  }
});

// Register business logic plugins
bootstrap.use([
  IOC(UserService), // User authentication service
  new UserApiBootstarp(), // User API configuration
  new FeApiBootstarp() // Other API configurations
]);

// Start application
await bootstrap.initialize();
await bootstrap.start();
```

**Comparison Results**:

- ✅ Component becomes cleaner, only responsible for rendering
- ✅ Business logic separated into bootstrapper
- ✅ Can independently test business logic
- ✅ Can reuse business logic in other UI frameworks

**Complete User Authentication Example**:

```tsx
// 1. Define User API Plugin (Configure API requests)
export class UserApiBootstarp implements BootstrapExecutorPlugin {
  readonly pluginName = 'UserApiBootstarp';

  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    // Configure user API plugins
    ioc
      .get<UserApi>(UserApi)
      .usePlugin(new FetchURLPlugin())
      .usePlugin(IOC.get(IOCIdentifier.ApiMockPlugin))
      .usePlugin(IOC.get(RequestLogger));
  }
}

// 2. Define User Service (Handle user authentication logic)
@injectable()
export class UserService
  extends UserAuthService<UserInfo>
  implements ExecutorPlugin
{
  readonly pluginName = 'UserService';

  constructor(
    @inject(UserApi) userApi: UserAuthApiInterface<UserInfo>,
    @inject(IOCIdentifier.AppConfig) appConfig: AppConfig
  ) {
    super(userApi, {
      userStorage: {
        key: appConfig.userInfoStorageKey,
        storage: storage
      },
      credentialStorage: {
        key: appConfig.userTokenStorageKey,
        storage: storage
      }
    });
  }

  // Check user authentication status before startup
  async onBefore(): Promise<void> {
    if (this.isAuthenticated()) {
      return;
    }

    const userToken = this.getToken();
    if (!userToken) {
      throw new AppError('NO_USER_TOKEN');
    }

    await this.userInfo();
    this.store.authSuccess();
  }
}

// 3. Register in bootstrapper
const bootstrap = new Bootstrap({
  root: window,
  logger,
  ioc: { manager: IOC, register: new IocRegisterImpl({ pathname, appConfig }) },
  envOptions: { target: appConfig, source: import.meta.env, prefix: 'APP_' },
  globalOptions: { sources: globals, target: 'AppGlobals' }
});

// Register user authentication related plugins
bootstrap.use([
  IOC(UserService), // User authentication service
  new UserApiBootstarp(), // User API configuration
  IOC(I18nService) // Internationalization service
]);

// 4. Start application
await bootstrap.initialize();
await bootstrap.start();
```

**Key Points**:

- `UserApiBootstarp`: Responsible for configuring API requests
- `UserService`: Responsible for handling user authentication logic
- `Bootstrap`: Unified management of all plugins
- Components: Only responsible for UI rendering

And most crucially, UI and logic can exist independently, meaning you can implement multiple different UIs based on this logic.

**You might think using classes and objects is redundant, but in terms of software design and long-term project considerations, decades of development have shown us that this is the easiest pattern for developers to understand and collaborate on.**

## Advantages of Bootstrapper

### 1. **Testability**

```tsx
// Can independently test business logic
describe('UserService', () => {
  it('should authenticate user successfully', async () => {
    const userService = new UserService(mockUserApi, mockAppConfig);
    const result = await userService.onBefore();
    expect(result).toBeDefined();
  });
});
```

### 2. **Reusability**

```tsx
// Same business logic can be used in different UI frameworks
// React version
const bootstrap = new Bootstrap({...});
bootstrap.use([IOC(UserService)]);

// Vue version
const bootstrap = new Bootstrap({...});
bootstrap.use([IOC(UserService)]); // Same business logic

// Native JS version
const bootstrap = new Bootstrap({...});
bootstrap.use([IOC(UserService)]); // Same business logic
```

### 3. **Extensibility**

```tsx
// Easily add new business logic
bootstrap.use([
  IOC(UserService),
  IOC(PermissionService), // Add permission service
  IOC(NotificationService), // Add notification service
  IOC(AnalyticsService) // Add analytics service
]);
```

### 4. **Team Collaboration**

- **Frontend Developers**: Focus on UI components and user experience
- **Backend Developers**: Focus on API interfaces and data processing
- **Architects**: Focus on business logic design and system architecture
- **Test Engineers**: Can independently test each module

## Quick Start

If you want to quickly experience Bootstrap, follow these steps:

### Step 1: Create Simple Plugin

```tsx
// Create a simple plugin
export class SimplePlugin implements BootstrapExecutorPlugin {
  readonly pluginName = 'SimplePlugin';

  onBefore({ parameters: { logger } }: BootstrapContext): void {
    logger.info('SimplePlugin started successfully!');
  }
}
```

### Step 2: Register in Bootstrapper

```tsx
const bootstrap = new Bootstrap({
  root: window,
  logger,
  ioc: { manager: IOC, register: new IocRegisterImpl({ pathname, appConfig }) }
});

// Register plugin
bootstrap.use([new SimplePlugin()]);

// Start
await bootstrap.initialize();
await bootstrap.start();
```

### Step 3: Check Results

Open browser console, you'll see the log "SimplePlugin started successfully!".

**Tip**: This simple example shows the basic usage of Bootstrap. As you understand the project better, you can gradually add more complex business logic.

## Real Project Application Scenarios

### Scenario 1: Multi-platform Applications

```tsx
// Web
const webBootstrap = new Bootstrap({
  root: window
  // Web-specific configuration
});
webBootstrap.use([IOC(UserService), IOC(WebSpecificService)]);

// Mobile H5
const mobileBootstrap = new Bootstrap({
  root: window
  // Mobile-specific configuration
});
mobileBootstrap.use([IOC(UserService), IOC(MobileSpecificService)]);

// Mini Program
const miniprogramBootstrap = new Bootstrap({
  root: globalThis
  // Mini program specific configuration
});
miniprogramBootstrap.use([IOC(UserService), IOC(MiniprogramSpecificService)]);
```

### Scenario 2: Micro-frontend Architecture

```tsx
// Main application
const mainBootstrap = new Bootstrap({
  root: window
  // Main application configuration
});
mainBootstrap.use([IOC(GlobalUserService), IOC(RouterService)]);

// Sub-application A
const appABootstrap = new Bootstrap({
  root: window
  // Sub-application A configuration
});
appABootstrap.use([IOC(UserService), IOC(AppASpecificService)]);

// Sub-application B
const appBBootstrap = new Bootstrap({
  root: window
  // Sub-application B configuration
});
appBBootstrap.use([IOC(UserService), IOC(AppBSpecificService)]);
```

### Scenario 3: Progressive Upgrade

```tsx
// Old version: Handle business logic directly in component
function OldApp() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetchUser().then(setUser);
  }, []);
  return <div>{user?.name}</div>;
}

// New version: Use bootstrapper to separate concerns
function NewApp() {
  const { user } = useStore(); // Get from store managed by bootstrapper
  return <div>{user?.name}</div>;
}

// Can coexist, migrate gradually
const bootstrap = new Bootstrap({...});
bootstrap.use([IOC(UserService)]); // New logic
// Old logic can still continue to be used
```

## Best Practices

### 1. **Plugin Design Principles**

```tsx
// ✅ Good plugin design
export class GoodPlugin implements BootstrapExecutorPlugin {
  readonly pluginName = 'GoodPlugin';

  // Single responsibility
  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    // Do only one thing: configure API
    ioc.get<UserApi>(UserApi).usePlugin(new FetchURLPlugin());
  }
}

// ❌ Bad plugin design
export class BadPlugin implements BootstrapExecutorPlugin {
  readonly pluginName = 'BadPlugin';

  // Does too many things
  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    // Configure API
    ioc.get<UserApi>(UserApi).usePlugin(new FetchURLPlugin());
    // Handle routing
    ioc.get<RouterService>(RouterService).configure();
    // Handle theme
    ioc.get<ThemeService>(ThemeService).init();
    // Handle internationalization
    ioc.get<I18nService>(I18nService).load();
  }
}
```

### 2. **Error Handling**

```tsx
export class UserService implements ExecutorPlugin {
  readonly pluginName = 'UserService';

  async onBefore(): Promise<void> {
    try {
      if (this.isAuthenticated()) {
        return;
      }

      const userToken = this.getToken();
      if (!userToken) {
        throw new AppError('NO_USER_TOKEN');
      }

      await this.userInfo();
      this.store.authSuccess();
    } catch (error) {
      // Graceful error handling
      this.store.authFailed(error);
      this.routerService.gotoLogin();
    }
  }
}
```

### 3. **Performance Optimization**

```tsx
// Conditional plugin loading
if (process.env.NODE_ENV === 'development') {
  bootstrap.use([IOC(DevToolsService)]);
}

// Load plugins on demand
if (appConfig.features.analytics) {
  bootstrap.use([IOC(AnalyticsService)]);
}
```

## Summary

The Bootstrap starter is not just a technical implementation, but an architectural concept. It helps us:

1. **Separate Concerns**: Separate UI and business logic
2. **Improve Maintainability**: Modular design, easy to understand and modify
3. **Enhance Testability**: Each module can be tested independently
4. **Support Team Collaboration**: Different roles can focus on their domains
5. **Adapt to Changes**: Business logic changes don't affect UI, UI changes don't affect business logic

This design pattern is becoming increasingly important in modern frontend development, especially in large projects and team collaboration.
