# Bootstrap Initializer

## 📋 Table of Contents

- [What is Bootstrap](#-what-is-bootstrap)
- [Why Bootstrap is Needed](#-why-bootstrap-is-needed)
- [Core Concepts](#-core-concepts)
- [Workflow](#-workflow)
- [Implementation in the Project](#-implementation-in-the-project)
- [Plugin System](#-plugin-system)
- [Practical Examples](#-practical-examples)
- [Testing: Core Advantage of Bootstrap](#-testing-core-advantage-of-bootstrap)
- [Best Practices](#-best-practices)
- [FAQ](#-faq)

---

## 🎯 What is Bootstrap

Bootstrap (Initializer) is the application's **initialization manager**, responsible for executing all necessary initialization logic before the application renders.

### Core Responsibilities

```
┌──────────────────────────────────────────────────┐
│  Bootstrap Initializer                           │
│  ┌────────────────────────────────────────────┐  │
│  │ 1. Create IOC Container                    │  │
│  │ 2. Inject Environment Variables            │  │
│  │ 3. Encapsulate Global Variables            │  │
│  │ 4. Register Business Plugins               │  │
│  │ 5. Execute Initialization Logic            │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
                       ↓
              Application Starts Rendering
```

### Understanding by Analogy

Just like when a computer boots up, it needs to:

- ✅ Load drivers
- ✅ Start system services
- ✅ Check hardware status
- ✅ Initialize user environment

Bootstrap does similar things when the application starts:

- ✅ Initialize IOC container (dependency management)
- ✅ Inject environment configuration
- ✅ Encapsulate browser APIs
- ✅ Execute business initialization (user authentication, API configuration, etc.)

---

## 🤔 Why Bootstrap is Needed

### Problem: Pain Points of Traditional Approaches

#### Example 1: Components Mixed with Initialization Logic

```typescript
// ❌ Traditional approach: handling initialization in components
function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialization logic mixed in component
    fetchUserInfo()
      .then(user => {
        setUser(user);
        // Also need to check permissions
        if (!user.hasPermission) {
          window.location.href = '/login';
        }
      })
      .catch(error => {
        setError(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <Router />;
}
```

**Problems:**

- 😰 **Component overload**: UI components shouldn't handle business initialization
- 😰 **Complex state management**: Need to manage multiple states (loading, user, error)
- 😰 **Hard to test**: Initialization logic coupled with UI logic
- 😰 **Hard to reuse**: Initialization logic cannot be reused in other projects
- 😰 **Difficult to maintain**: Business logic changes affect component structure

#### Example 2: Multi-condition Initialization

```typescript
// ❌ More complex scenario: multiple initialization steps
function App() {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [i18nLoaded, setI18nLoaded] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      try {
        // Step 1: Configure API
        await configureAPI();
        setApiConfigured(true);

        // Step 2: Load internationalization
        await loadI18n();
        setI18nLoaded(true);

        // Step 3: Check user authentication
        if (location.pathname !== '/login') {
          const user = await fetchUserInfo();
          setUserInfo(user);

          // Step 4: Load permissions
          const perms = await fetchPermissions(user.id);
          setPermissions(perms);

          // Step 5: Permission check
          if (!hasRequiredPermission(perms, location.pathname)) {
            window.location.href = '/403';
            return;
          }
        }
      } catch (error) {
        console.error('Initialization failed:', error);
        window.location.href = '/error';
      } finally {
      setLoading(false);
    }
    };

    init();
  }, [location.pathname]);

  // Also need to handle various loading states...
  if (loading || !apiConfigured || !i18nLoaded) {
    return <LoadingScreen />;
  }

  return <Router />;
}
```

**Problems Further Aggravated:**

- 😰😰😰 **State explosion**: Need to manage multiple initialization states
- 😰😰😰 **Hard to extend**: Adding new initialization steps makes code more complex
- 😰😰😰 **Complex error handling**: Each step may fail, requiring extensive error handling code
- 😰😰😰 **Implicit dependencies**: Dependencies between steps are not clear

### Solution: Using Bootstrap

```typescript
// ✅ Using Bootstrap: components become cleaner
function App() {
  return (
    <BootstrapsProvider>
      <ComboProvider themeConfig={themeConfig}>
        <AppRouterProvider pages={allPages} />
      </ComboProvider>
    </BootstrapsProvider>
  );
}

// All initialization logic handled in Bootstrap
const bootstrap = new Bootstrap({
  root: window,
  logger,
  ioc: { manager: IOC, register: new IocRegisterImpl({ pathname, appConfig }) },
  envOptions: { /* environment variable config */ },
  globalOptions: { /* global variable config */ }
});

// Register initialization plugins
bootstrap.use([
  IOC(I18nService),        // Internationalization service
  new UserApiBootstrap(),  // User API configuration
  new FeApiBootstrap(),    // Business API configuration
  IOC(UserService)         // User authentication service
]);

// Start application
await bootstrap.initialize();
await bootstrap.start();
```

**Advantages:**

- ✅ **Clear component responsibilities**: UI components only responsible for rendering
- ✅ **Logic separation**: Initialization logic independent of UI
- ✅ **Easy to test**: Can independently test each initialization step
- ✅ **Easy to extend**: Adding new initialization steps only requires adding new plugins
- ✅ **Easy to reuse**: Same initialization logic can be used in different projects

---

## 💡 Core Concepts

### 1. Plugin Architecture

Bootstrap adopts a plugin design where each plugin is responsible for a specific initialization task.

```typescript
// Plugin interface
export interface BootstrapExecutorPlugin {
  readonly pluginName: string;

  // Execute before initialization
  onBefore?(context: BootstrapContext): void | Promise<void>;

  // Execute during initialization
  onExecute?(context: BootstrapContext): void | Promise<void>;

  // Execute after initialization
  onAfter?(context: BootstrapContext): void | Promise<void>;

  // Error handling
  onError?(error: Error, context: BootstrapContext): void | Promise<void>;
}
```

### 2. Lifecycle

```
┌────────────────────────────────────────────────┐
│  Bootstrap Lifecycle                           │
│                                                │
│  initialize()                                  │
│  ├── Create IOC container                      │
│  ├── Inject environment variables              │
│  └── Encapsulate global variables              │
│                                                │
│  start()                                       │
│  ├── onBefore: Pre-initialization              │
│  │   ├── Configure API                         │
│  │   ├── Load internationalization             │
│  │   └── Check user authentication             │
│  │                                              │
│  ├── onExecute: Execute main logic             │
│  │   └── Execute business initialization       │
│  │                                              │
│  ├── onAfter: Post-processing                  │
│  │   └── Cleanup resources, log records        │
│  │                                              │
│  └── onError: Error handling                   │
│      └── Error capture and handling            │
└────────────────────────────────────────────────┘
```

### 3. Dependency Injection

Bootstrap is deeply integrated with the IOC container, and all plugins can obtain services through dependency injection.

```typescript
@injectable()
export class UserService implements ExecutorPlugin {
  readonly pluginName = 'UserService';

  constructor(
    @inject(UserApi) private api: UserApi,
    @inject(IOCIdentifier.AppConfig) private config: AppConfig,
    @inject(IOCIdentifier.LocalStorageEncrypt) private storage: Storage
  ) {}

  async onBefore(): Promise<void> {
    // Use injected dependencies to execute initialization
    const token = this.storage.getItem('token');
    if (token) {
      await this.api.getUserInfo(token);
    }
  }
}
```

---

## 🔄 Workflow

### Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. main.tsx: Application entry point                        │
│    BootstrapClient.main({ root: window, bootHref, ioc })   │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. BootstrapClient: Create Bootstrap instance                │
│    - Create IOC container                                    │
│    - Configure environment variable injection                │
│    - Configure global variable encapsulation                 │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Bootstrap.initialize(): Initialize                       │
│    ✅ IOC container initialization                           │
│    ✅ Environment variables injected to AppConfig            │
│    ✅ Global variables encapsulated (localStorage, window)   │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. BootstrapsRegistry: Register business plugins             │
│    - I18nService: Internationalization service               │
│    - UserApiBootstrap: User API configuration                │
│    - FeApiBootstrap: Business API configuration              │
│    - UserService: User authentication service                │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Bootstrap.start(): Start                                  │
│    ↓                                                         │
│    onBefore phase:                                           │
│    ├── I18nService.onBefore() → Load translation resources  │
│    ├── UserApiBootstrap.onBefore() → Configure API plugins  │
│    ├── FeApiBootstrap.onBefore() → Configure business API   │
│    └── UserService.onBefore() → Check user authentication   │
│    ↓                                                         │
│    onExecute phase:                                          │
│    └── Execute plugin main logic                             │
│    ↓                                                         │
│    onAfter phase:                                            │
│    └── Cleanup and logging                                   │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. React rendering                                           │
│    ReactDOM.render(<App />)                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementation in the Project

### File Structure

```
src/
├── main.tsx                          # Application entry point
├── core/
│   ├── bootstraps/
│   │   ├── BootstrapClient.ts        # Bootstrap initializer
│   │   ├── BootstrapsRegistry.ts     # Plugin registry
│   │   ├── PrintBootstrap.ts         # Print logging plugin
│   │   └── IocIdentifierTest.ts      # IOC test plugin
│   ├── globals.ts                    # Global variable encapsulation
│   └── clientIoc/
│       ├── ClientIOC.ts              # IOC container
│       └── ClientIOCRegister.ts      # IOC registrar
├── base/
│   ├── services/
│   │   ├── UserService.ts            # User service (plugin)
│   │   └── I18nService.ts            # Internationalization service (plugin)
│   └── apis/
│       ├── userApi/
│       │   └── UserApiBootstrap.ts   # User API configuration plugin
│       └── feApi/
│           └── FeApiBootstrap.ts     # Business API configuration plugin
└── uikit/
    └── components/
        └── BootstrapsProvider.tsx    # Bootstrap Provider
```

### 1. Entry File: main.tsx

```typescript
// src/main.tsx
import 'reflect-metadata';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { BootstrapClient } from './core/bootstraps/BootstrapClient';
import { clientIOC } from './core/clientIoc/ClientIOC.ts';

// 🚀 Start Bootstrap
BootstrapClient.main({
  root: window,                    // Inject browser environment
  bootHref: window.location.href,  // Inject startup URL
  ioc: clientIOC                   // Inject IOC container
});

// Render React application
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### 2. Bootstrap Initializer: BootstrapClient.ts

```typescript
// src/core/bootstraps/BootstrapClient.ts
import { Bootstrap } from '@qlover/corekit-bridge';
import { envBlackList, envPrefix, browserGlobalsName } from '@config/common';
import * as globals from '../globals';
import { BootstrapsRegistry } from './BootstrapsRegistry';

export class BootstrapClient {
  static async main(args: BootstrapClientArgs): Promise<BootstrapClientArgs> {
    const { root, bootHref, ioc, iocRegister } = args;
    const { logger, appConfig } = globals;

    // 1️⃣ Create IOC container
    const IOC = ioc.create({
      pathname: bootHref,
      appConfig: appConfig
    });

    // 2️⃣ Create Bootstrap instance
    const bootstrap = new Bootstrap({
      root,
      logger,
      // IOC container configuration
      ioc: {
        manager: IOC,
        register: iocRegister
      },
      // Environment variable injection configuration
      envOptions: {
        target: appConfig, // Inject to AppConfig
        source: Object.assign({}, import.meta.env, {
          [envPrefix + 'BOOT_HREF']: bootHref // Add startup URL
        }),
        prefix: envPrefix, // Environment variable prefix
        blackList: envBlackList // Blacklist
      },
      // Global variable encapsulation configuration
      globalOptions: {
        sources: globals, // Encapsulated global variables
        target: browserGlobalsName // Mount target
      }
    });

    try {
      logger.info('bootstrap start...');

      // 3️⃣ Initialize Bootstrap
      await bootstrap.initialize();

      // 4️⃣ Register business plugins
      const bootstrapsRegistry = new BootstrapsRegistry(IOC);

      // 5️⃣ Start application
      await bootstrap.use(bootstrapsRegistry.register()).start();

      logger.info('bootstrap completed successfully');
    } catch (error) {
      logger.error(`${appConfig.appName} startup error:`, error);
    }

    return args;
  }
}
```

**Key Step Analysis:**

1. **Create IOC Container** - Manage all dependencies uniformly
2. **Create Bootstrap Instance** - Configure initialization parameters
3. **Initialize** - Execute IOC, environment variables, and global variable initialization
4. **Register Plugins** - Add business initialization logic
5. **Start** - Execute lifecycle methods of all plugins

### 3. Plugin Registry: BootstrapsRegistry.ts

```typescript
// src/core/bootstraps/BootstrapsRegistry.ts
import { IOCIdentifier } from '@config/IOCIdentifier';
import { UserApiBootstarp } from '@/base/apis/userApi/UserApiBootstarp';
import { FeApiBootstarp } from '@/base/apis/feApi/FeApiBootstarp';
import { AiApiBootstarp } from '@/base/apis/AiApi';

export class BootstrapsRegistry {
  constructor(
    protected IOC: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>
  ) {}

  get appConfig(): EnvConfigInterface {
    return this.IOC(IOCIdentifier.AppConfig);
  }

  /**
   * Register all business plugins
   */
  register(): BootstrapExecutorPlugin[] {
    const IOC = this.IOC;

    const bootstrapList = [
      // 1. Internationalization service (needs to be initialized first)
      IOC(IOCIdentifier.I18nServiceInterface),

      // 2. API configuration plugins
      new UserApiBootstarp(), // User API
      new FeApiBootstarp(), // Business API
      AiApiBootstarp, // AI API

      // 3. Other plugins
      IOC(IOCIdentifier.I18nKeyErrorPlugin),
      IOC(IOCIdentifier.ProcesserExecutorInterface)
    ];

    // Development environment: Add debug plugins
    if (!this.appConfig.isProduction) {
      bootstrapList.push(printBootstrap);
    }

    return bootstrapList;
  }
}
```

**Plugin Order is Important:**

- ✅ Internationalization service initialized first (other plugins may need translations)
- ✅ API configuration before business logic
- ✅ Development tools only loaded in development environment

---

## 🔌 Plugin System

### Plugin Types

#### 1. Service Plugins (via IOC Injection)

```typescript
// src/base/services/I18nService.ts
@injectable()
export class I18nService implements ExecutorPlugin {
  readonly pluginName = 'I18nService';

  constructor(@inject(IOCIdentifier.AppConfig) private config: AppConfig) {}

  /**
   * Load translation resources before Bootstrap starts
   */
  async onBefore(): Promise<void> {
    await i18next.init({
      lng: this.config.defaultLanguage,
      fallbackLng: 'en',
      resources: this.loadResources()
    });
  }

  private loadResources() {
    // Load translation resources
    return {
      /* ... */
    };
  }
}

// Registration method
bootstrap.use([
  IOC(IOCIdentifier.I18nServiceInterface) // Get from IOC container
]);
```

#### 2. Configuration Plugins (Independent Instances)

```typescript
// src/base/apis/userApi/UserApiBootstrap.ts
export class UserApiBootstarp implements BootstrapExecutorPlugin {
  readonly pluginName = 'UserApiBootstarp';

  /**
   * Configure User API plugins
   */
  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    const userApi = ioc.get<UserApi>(UserApi);

    // Add URL handling plugin
    userApi.usePlugin(new FetchURLPlugin());

    // Add Mock plugin (development environment)
    userApi.usePlugin(ioc.get(IOCIdentifier.ApiMockPlugin));

    // Add request logging plugin
    userApi.usePlugin(ioc.get(RequestLogger));
  }
}

// Registration method
bootstrap.use([
  new UserApiBootstarp() // Create instance directly
]);
```

#### 3. Business Logic Plugins

```typescript
// src/base/services/UserService.ts
@injectable()
export class UserService
  extends UserAuthService<UserInfo>
  implements ExecutorPlugin
{
  readonly pluginName = 'UserService';

  constructor(
    @inject(IOCIdentifier.RouteServiceInterface)
    protected routerService: RouteServiceInterface,
    @inject(UserApi)
    userApi: UserAuthApiInterface<UserInfo>,
    @inject(IOCIdentifier.AppConfig) appConfig: AppConfig,
    @inject(IOCIdentifier.LocalStorageEncrypt)
    storage: SyncStorageInterface<string, string>
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

  /**
   * Check user authentication status on application startup
   */
  async onBefore(): Promise<void> {
    // If already logged in, return directly
    if (this.isAuthenticated()) {
      return;
    }

    // Try to restore user info from storage
    const userToken = this.getToken();
    if (!userToken) {
      throw new AppError('NO_USER_TOKEN');
    }

    // Get user info
    await this.userInfo();
  }

  getToken(): string | null {
    return this.credential();
  }
}
```

### Plugin Lifecycle Details

```typescript
export interface BootstrapExecutorPlugin {
  readonly pluginName: string;

  /**
   * onBefore: Execute before initialization
   *
   * Use cases:
   * - Configure API clients
   * - Load resources (translations, themes, etc.)
   * - Check user authentication
   * - Initialize third-party libraries
   */
  onBefore?(context: BootstrapContext): void | Promise<void>;

  /**
   * onExecute: Execute during initialization
   *
   * Use cases:
   * - Execute main business logic
   * - Start background tasks
   */
  onExecute?(context: BootstrapContext): void | Promise<void>;

  /**
   * onAfter: Execute after initialization
   *
   * Use cases:
   * - Cleanup temporary resources
   * - Record startup logs
   * - Send analytics data
   */
  onAfter?(context: BootstrapContext): void | Promise<void>;

  /**
   * onError: Error handling
   *
   * Use cases:
   * - Capture plugin errors
   * - Error logging
   * - Error recovery
   */
  onError?(error: Error, context: BootstrapContext): void | Promise<void>;
}
```

---

## 🎯 Practical Examples

### Example 1: Internationalization Plugin

```typescript
// src/base/services/I18nService.ts
import i18next from 'i18next';
import { injectable, inject } from 'inversify';
import { IOCIdentifier } from '@config/IOCIdentifier';
import type { AppConfig } from '@/base/cases/AppConfig';

@injectable()
export class I18nService implements ExecutorPlugin {
  readonly pluginName = 'I18nService';

  constructor(@inject(IOCIdentifier.AppConfig) private config: AppConfig) {}

  async onBefore(): Promise<void> {
    // Load translation resources
    const resources = this.loadAllResources();

    // Initialize i18next
    await i18next.init({
      lng: this.config.defaultLanguage || 'zh',
      fallbackLng: 'en',
      resources,
      interpolation: {
        escapeValue: false
      }
    });

    console.log('✅ I18n initialized:', i18next.language);
  }

  private loadAllResources() {
    // Load all translation resources from config files
    return {
      zh: {
        translation: require('@config/i18n/zh').default
      },
      en: {
        translation: require('@config/i18n/en').default
      }
    };
  }

  t(key: string, options?: any): string {
    return i18next.t(key, options);
  }
}
```

### Example 2: API Configuration Plugin

```typescript
// src/base/apis/feApi/FeApiBootstrap.ts
export class FeApiBootstarp implements BootstrapExecutorPlugin {
  readonly pluginName = 'FeApiBootstarp';

  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    const feApi = ioc.get<FeApi>(FeApi);
    const appConfig = ioc.get<AppConfig>(IOCIdentifier.AppConfig);

    // 1. Configure base URL
    feApi.setBaseURL(appConfig.apiBaseUrl);

    // 2. Add authentication plugin
    feApi.usePlugin(
      new AuthTokenPlugin({
        getToken: () => {
          const storage = ioc.get(IOCIdentifier.LocalStorageEncrypt);
          return storage.getItem('token');
        }
      })
    );

    // 3. Add error handling plugin
    feApi.usePlugin(
      new ErrorHandlerPlugin({
        onError: (error) => {
          if (error.status === 401) {
            // Unauthorized, redirect to login
            const router = ioc.get(IOCIdentifier.RouteServiceInterface);
            router.push('/login');
          }
        }
      })
    );

    // 4. Add request logging plugin (development environment)
    if (!appConfig.isProduction) {
      feApi.usePlugin(new RequestLoggerPlugin());
    }
  }
}
```

### Example 3: User Authentication Plugin

```typescript
// src/base/services/UserService.ts
@injectable()
export class UserService
  extends UserAuthService<UserInfo>
  implements ExecutorPlugin
{
  readonly pluginName = 'UserService';

  constructor(
    @inject(IOCIdentifier.RouteServiceInterface)
    protected routerService: RouteServiceInterface,
    @inject(UserApi) userApi: UserAuthApiInterface<UserInfo>,
    @inject(IOCIdentifier.AppConfig) appConfig: AppConfig,
    @inject(IOCIdentifier.LocalStorageEncrypt) storage: SyncStorageInterface
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

  /**
   * Automatically restore user login state on application startup
   */
  async onBefore(): Promise<void> {
    try {
      // Check if on login page
      if (this.routerService.isLoginPage()) {
        return;
      }

      // If already have user info, return directly
      if (this.isAuthenticated()) {
        console.log('✅ User already authenticated');
        return;
      }

      // Try to restore token from storage
      const token = this.getToken();
      if (!token) {
        // No token, redirect to login
        throw new AppError('NO_USER_TOKEN');
      }

      // Use token to get user info
      const userInfo = await this.userInfo();
      console.log('✅ User authenticated:', userInfo.name);
    } catch (error) {
      // Authentication failed, clear storage and redirect to login
      this.clearAuth();
      this.routerService.push('/login');
      console.log('❌ User authentication failed, redirecting to login');
    }
  }

  getToken(): string | null {
    return this.credential();
  }

  private clearAuth() {
    this.setCredential(null);
    this.setUser(null);
  }
}
```

### Example 4: Development Tools Plugin

```typescript
// src/core/bootstraps/PrintBootstrap.ts
export const printBootstrap: BootstrapExecutorPlugin = {
  pluginName: 'PrintBootstrap',

  onAfter({ parameters: { logger, ioc } }: BootstrapContext): void {
    const appConfig = ioc.get<AppConfig>(IOCIdentifier.AppConfig);

    // Print application info
    logger.info('🚀 Application started successfully!');
    logger.info('📦 App Name:', appConfig.appName);
    logger.info('🌍 Environment:', appConfig.env);
    logger.info('🔗 API Base URL:', appConfig.apiBaseUrl);

    // Print registered services
    logger.info('📋 Registered Services:');
    logger.info('  - UserService');
    logger.info('  - I18nService');
    logger.info('  - RouteService');

    // Print warnings (if any)
    if (!appConfig.isProduction && appConfig.mockEnabled) {
      logger.warn('⚠️ Mock API is enabled');
    }
  }
};
```

---

## 🧪 Testing: Core Advantage of Bootstrap

### Why is Testing So Important?

One of the **most important advantages** of Bootstrap architecture is **testability**. By separating initialization logic from UI, we can:

- ✅ Test each plugin independently
- ✅ Easily mock dependencies
- ✅ Run tests quickly (no need to render UI)
- ✅ Improve test coverage

### Traditional Approach vs Bootstrap Approach

#### ❌ Traditional Approach: Components Mixed with Initialization Logic

```typescript
// ❌ Traditional component: hard to test
function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [i18nReady, setI18nReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Initialize internationalization
        await i18next.init({
          lng: 'zh',
          resources: { /* ... */ }
        });
        setI18nReady(true);

        // 2. Configure API
        api.setBaseURL('https://api.example.com');
        api.usePlugin(new AuthPlugin());

        // 3. Check user authentication
        const token = localStorage.getItem('token');
        if (token) {
          const userInfo = await fetch('/api/user', {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => res.json());
          setUser(userInfo);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <Router />;
}
```

**Test Code (Traditional Approach): 😰😰😰 Very Difficult**

```typescript
// ❌ Traditional approach testing: full of tricks and hacks
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('App (Traditional)', () => {
  beforeEach(() => {
    // 😰 Need to mock global variables
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };

    // 😰 Need to mock fetch
    global.fetch = vi.fn();

    // 😰 Need to mock i18next
    vi.mock('i18next', () => ({
      init: vi.fn().mockResolvedValue(undefined),
      t: vi.fn(key => key)
    }));
  });

  it('should initialize and load user', async () => {
    // 😰 Setup complex mocks
    vi.mocked(localStorage.getItem).mockReturnValue('mock-token');
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', name: 'John' })
    });

    render(<App />);

    // 😰 Need to wait for multiple async operations
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // 😰 Hard to verify intermediate states
    expect(fetch).toHaveBeenCalledWith('/api/user', expect.any(Object));
  });

  it('should handle error', async () => {
    // 😰 Each test needs to reset mocks
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Error/)).toBeInTheDocument();
    });
  });

  // 😰 Problems:
  // 1. Need to mock many global variables (localStorage, fetch, i18next)
  // 2. Tests run slowly (need to render components)
  // 3. Hard to test error scenarios
  // 4. Tests may interfere with each other
  // 5. Hard to test individual initialization steps
});
```

#### ✅ Bootstrap Approach: Independent Plugin Testing

```typescript
// ✅ Bootstrap approach: logic and UI separated
// 1. Plugin implementation
@injectable()
export class UserService implements ExecutorPlugin {
  readonly pluginName = 'UserService';

  constructor(
    @inject(UserApi) private api: UserApi,
    @inject(IOCIdentifier.LocalStorageEncrypt) private storage: Storage,
    @inject(IOCIdentifier.RouteServiceInterface) private router: RouteService
  ) {}

  async onBefore(): Promise<void> {
    const token = this.storage.getItem('token');
    if (!token) {
      throw new AppError('NO_USER_TOKEN');
    }

    const userInfo = await this.api.getUserInfo(token);
    this.setUser(userInfo);
  }
}

// 2. UI component becomes simple
function App() {
  return (
    <BootstrapsProvider>
      <ComboProvider themeConfig={themeConfig}>
        <AppRouterProvider pages={allPages} />
      </ComboProvider>
    </BootstrapsProvider>
  );
}
```

**Test Code (Bootstrap Approach): 😊😊😊 Very Simple**

```typescript
// ✅ Bootstrap approach testing: clear, simple, fast
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '@/base/services/UserService';
import { AppError } from '@/base/cases/AppError';

describe('UserService Plugin', () => {
  let userService: UserService;
  let mockApi: any;
  let mockStorage: any;
  let mockRouter: any;

  beforeEach(() => {
    // ✅ Only need to mock dependency interfaces, no global variables
    mockApi = {
      getUserInfo: vi.fn()
    };

    mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn()
    };

    mockRouter = {
      push: vi.fn()
    };

    // ✅ Create service instance
    userService = new UserService(mockApi, mockStorage, mockRouter);
  });

  it('should load user when token exists', async () => {
    // ✅ Setup test data
    mockStorage.getItem.mockReturnValue('mock-token');
    mockApi.getUserInfo.mockResolvedValue({
      id: '1',
      name: 'John Doe'
    });

    // ✅ Execute plugin lifecycle
    await userService.onBefore();

    // ✅ Clear assertions
    expect(mockStorage.getItem).toHaveBeenCalledWith('token');
    expect(mockApi.getUserInfo).toHaveBeenCalledWith('mock-token');
    expect(userService.getUser()).toEqual({
      id: '1',
      name: 'John Doe'
    });
  });

  it('should throw error when token is missing', async () => {
    // ✅ Easy to test error scenarios
    mockStorage.getItem.mockReturnValue(null);

    // ✅ Verify errors
    await expect(userService.onBefore()).rejects.toThrow(AppError);
    await expect(userService.onBefore()).rejects.toThrow('NO_USER_TOKEN');
  });

  it('should handle API error', async () => {
    // ✅ Easy to simulate API errors
    mockStorage.getItem.mockReturnValue('mock-token');
    mockApi.getUserInfo.mockRejectedValue(new Error('Network error'));

    // ✅ Verify error handling
    await expect(userService.onBefore()).rejects.toThrow('Network error');
  });

  // ✅ Advantages:
  // 1. No need to mock global variables
  // 2. Tests run fast (no need to render UI)
  // 3. Easy to test error scenarios
  // 4. Tests are completely independent
  // 5. Can test each initialization step individually
});
```

### Test Complexity Comparison

| Test Scenario            | Traditional Approach                                       | Bootstrap Approach                         | Improvement |
| ------------------------ | ---------------------------------------------------------- | ------------------------------------------ | ----------- |
| **Mock Complexity**      | 😰😰😰 Need to mock global variables, fetch, i18next, etc. | 😊 Only need to mock dependency interfaces | **80%**     |
| **Test Run Speed**       | 😰😰 Slow (need to render components, wait for async)      | 😊😊😊 Fast (pure logic testing)           | **5-10x**   |
| **Test Error Scenarios** | 😰😰😰 Difficult (need complex mock setups)                | 😊😊😊 Simple (directly mock reject)       | **90%**     |
| **Test Isolation**       | 😰😰 Poor (global variables may interfere)                 | 😊😊😊 Good (each test independent)        | **100%**    |
| **Test Readability**     | 😰😰 Poor (full of mocks and hacks)                        | 😊😊😊 Good (clear inputs/outputs)         | **80%**     |
| **Coverage**             | 😰😰 Low (hard to cover all branches)                      | 😊😊😊 High (easy to cover all scenarios)  | **50%**     |

### Actual Project Test Examples

#### Example 1: Testing I18n Plugin

```typescript
// src/base/services/I18nService.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { I18nService } from '@/base/services/I18nService';
import i18n from 'i18next';

// Mock i18next
vi.mock('i18next', () => ({
  default: {
    use: vi.fn().mockReturnThis(),
    init: vi.fn(),
    t: vi.fn(),
    changeLanguage: vi.fn(),
    language: 'en',
    services: {
      languageDetector: {
        addDetector: vi.fn()
      }
    }
  }
}));

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(() => {
    service = new I18nService('/en/test/path');
    vi.clearAllMocks();
  });

  describe('onBefore', () => {
    it('should initialize i18n with correct configuration', () => {
      // ✅ Execute plugin lifecycle
      service.onBefore();

      // ✅ Verify initialization configuration
      expect(i18n.use).toHaveBeenCalledTimes(3);
      expect(i18n.init).toHaveBeenCalledWith(
        expect.objectContaining({
          debug: false,
          detection: {
            order: ['pathLanguageDetector', 'navigator', 'localStorage'],
            caches: []
          }
        })
      );
    });

    it('should detect language from path correctly', () => {
      service.onBefore();

      const detector = vi.mocked(i18n.services.languageDetector.addDetector)
        .mock.calls[0][0];

      // ✅ Test language detection logic
      const language = detector.lookup();
      expect(language).toBe('en');
    });

    it('should return fallback language for invalid path', () => {
      const invalidService = new I18nService('/invalid/path');
      invalidService.onBefore();

      const detector = vi.mocked(i18n.services.languageDetector.addDetector)
        .mock.calls[0][0];

      // ✅ Test edge cases
      const language = detector.lookup();
      expect(language).toBe('zh'); // fallback language
    });
  });

  describe('changeLanguage', () => {
    it('should change language using i18n', async () => {
      await service.changeLanguage('en');
      expect(i18n.changeLanguage).toHaveBeenCalledWith('en');
    });

    it('should handle language change error', async () => {
      // ✅ Test error scenarios
      vi.mocked(i18n.changeLanguage).mockRejectedValueOnce(
        new Error('Change failed')
      );

      await expect(service.changeLanguage('en')).rejects.toThrow(
        'Change failed'
      );
    });
  });
});
```

#### Example 2: Testing Bootstrap Startup Process

```typescript
// __tests__/src/core/bootstraps/BootstrapsApp.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BootstrapClient } from '@/core/bootstraps/BootstrapClient';
import type { BootstrapClientArgs } from '@/core/bootstraps/BootstrapClient';
import { InversifyContainer } from '@/base/cases/InversifyContainer';
import { createIOCFunction } from '@qlover/corekit-bridge';
import { browserGlobalsName } from '@config/common';

// Mock dependencies
vi.mock('@/core/registers/IocRegisterImpl', () => ({
  IocRegisterImpl: vi.fn().mockImplementation(() => ({
    getRegisterList: vi.fn().mockReturnValue([]),
    register: vi.fn()
  }))
}));

vi.mock('@/core/bootstraps/BootstrapsRegistry', () => ({
  BootstrapsRegistry: vi.fn().mockImplementation(() => ({
    register: vi.fn().mockReturnValue([])
  }))
}));

describe('BootstrapClient', () => {
  let mockArgs: BootstrapClientArgs;
  let mockIOC: ReturnType<typeof createIOCFunction>;

  beforeEach(() => {
    vi.clearAllMocks();

    const container = new InversifyContainer();
    mockIOC = createIOCFunction(container);

    mockArgs = {
      root: {},
      bootHref: 'http://localhost:3000',
      ioc: {
        create: vi.fn().mockReturnValue(mockIOC)
      }
    };
  });

  describe('main', () => {
    it('should initialize bootstrap successfully', async () => {
      // ✅ Execute startup process
      const result = await BootstrapClient.main(mockArgs);

      // ✅ Verify startup result
      expect(result.bootHref).toBe('http://localhost:3000');

      // ✅ Verify global variable injection
      expect(
        (mockArgs.root as Record<string, unknown>)[browserGlobalsName]
      ).toBeDefined();

      const injectedGlobals = (mockArgs.root as Record<string, unknown>)[
        browserGlobalsName
      ] as Record<string, unknown>;

      expect(injectedGlobals).toHaveProperty('logger');
      expect(injectedGlobals).toHaveProperty('appConfig');
    });

    it('should handle initialization error', async () => {
      // ✅ Test error scenarios
      mockArgs.ioc.create = vi.fn().mockImplementation(() => {
        throw new Error('IOC creation failed');
      });

      // ✅ Verify error doesn't crash application
      await expect(BootstrapClient.main(mockArgs)).rejects.toThrow(
        'IOC creation failed'
      );
    });
  });
});
```

#### Example 3: Testing API Configuration Plugin

```typescript
// __tests__/src/base/apis/UserApiBootstrap.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserApiBootstarp } from '@/base/apis/userApi/UserApiBootstarp';

describe('UserApiBootstrap', () => {
  let plugin: UserApiBootstarp;
  let mockContext: any;
  let mockUserApi: any;

  beforeEach(() => {
    plugin = new UserApiBootstarp();

    // ✅ Create mock context
    mockUserApi = {
      usePlugin: vi.fn()
    };

    mockContext = {
      parameters: {
        ioc: {
          get: vi.fn().mockReturnValue(mockUserApi)
        }
      }
    };
  });

  it('should have correct plugin name', () => {
    expect(plugin.pluginName).toBe('UserApiBootstarp');
  });

  it('should configure API plugins in onBefore', () => {
    // ✅ Execute plugin lifecycle
    plugin.onBefore(mockContext);

    // ✅ Verify API configuration
    expect(mockContext.parameters.ioc.get).toHaveBeenCalled();
    expect(mockUserApi.usePlugin).toHaveBeenCalled();
  });

  it('should add multiple plugins to API', () => {
    plugin.onBefore(mockContext);

    // ✅ Verify multiple plugins added
    expect(mockUserApi.usePlugin).toHaveBeenCalledTimes(3);
  });
});
```

### Testing Best Practices

#### 1. ✅ Use Vitest Testing Tools

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('MyPlugin', () => {
  beforeEach(() => {
    // ✅ Reset mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // ✅ Cleanup resources
    vi.restoreAllMocks();
  });

  it('should do something', () => {
    // Test logic
  });
});
```

#### 2. ✅ Test Plugin Lifecycle

```typescript
describe('UserService Plugin', () => {
  it('should execute onBefore lifecycle', async () => {
    const service = new UserService(mockApi, mockStorage, mockRouter);

    // ✅ Test onBefore
    await service.onBefore();

    expect(mockApi.getUserInfo).toHaveBeenCalled();
  });

  it('should execute onAfter lifecycle', async () => {
    const service = new UserService(mockApi, mockStorage, mockRouter);

    // ✅ Test onAfter
    await service.onAfter?.();

    // Verify cleanup logic
  });

  it('should handle onError lifecycle', async () => {
    const service = new UserService(mockApi, mockStorage, mockRouter);
    const error = new Error('Test error');

    // ✅ Test onError
    await service.onError?.(error, mockContext);

    // Verify error handling
  });
});
```

#### 3. ✅ Test Edge Cases and Error Scenarios

```typescript
describe('UserService Error Handling', () => {
  it('should handle missing token', async () => {
    mockStorage.getItem.mockReturnValue(null);

    // ✅ Verify errors
    await expect(service.onBefore()).rejects.toThrow('NO_USER_TOKEN');
  });

  it('should handle network error', async () => {
    mockStorage.getItem.mockReturnValue('token');
    mockApi.getUserInfo.mockRejectedValue(new Error('Network error'));

    // ✅ Verify error handling
    await expect(service.onBefore()).rejects.toThrow('Network error');
  });

  it('should handle invalid token', async () => {
    mockStorage.getItem.mockReturnValue('invalid-token');
    mockApi.getUserInfo.mockRejectedValue(new Error('401 Unauthorized'));

    // ✅ Verify 401 error handling
    await expect(service.onBefore()).rejects.toThrow('401 Unauthorized');
  });
});
```

#### 4. ✅ Test Plugin Dependencies

```typescript
describe('Plugin Dependencies', () => {
  it('should ensure I18n is initialized before UserService', async () => {
    const i18nService = new I18nService('/en/path');
    const userService = new UserService(mockApi, mockStorage, mockRouter);

    // ✅ I18n initialized first
    await i18nService.onBefore();

    // ✅ Then initialize UserService
    await userService.onBefore();

    // ✅ Verify UserService can use translations
    expect(i18n.t('some.key')).toBeDefined();
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests and watch for file changes
npm run test -- --watch

# Run tests for specific file
npm run test -- UserService.test.ts

# Generate test coverage report
npm run test -- --coverage
```

### Test Coverage Goals

With Bootstrap architecture, we can easily achieve high coverage:

- **Plugin Logic**: > 90% coverage
- **Service Layer**: > 85% coverage
- **API Adapters**: > 80% coverage
- **Overall Application**: > 75% coverage

### Summary: Value of Testing

Bootstrap architecture makes testing:

1. **Simpler** - No need to mock global variables and complex environments
2. **Faster** - Pure logic testing, no need to render UI
3. **More Reliable** - Tests are completely independent, no interference
4. **More Comprehensive** - Easy to test all edge cases and error scenarios
5. **More Confident** - High coverage ensures code quality

> 💡 **Important Note**: Testability is one of the biggest advantages of Bootstrap architecture. If you find a plugin hard to test, it's likely a design problem requiring reconsideration of responsibility distribution.

---

## 💎 Best Practices

### 1. Plugin Design Principles

#### ✅ Single Responsibility

```typescript
// ✅ Good plugin design: does one thing
export class ApiConfigPlugin implements BootstrapExecutorPlugin {
  readonly pluginName = 'ApiConfigPlugin';

  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    // Only responsible for configuring API
    const api = ioc.get<FeApi>(FeApi);
    api.setBaseURL(config.apiBaseUrl);
    api.usePlugin(new AuthPlugin());
  }
}

// ❌ Bad plugin design: does too many things
export class BadPlugin implements BootstrapExecutorPlugin {
  readonly pluginName = 'BadPlugin';

  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    // Configure API
    const api = ioc.get<FeApi>(FeApi);
    api.setBaseURL(config.apiBaseUrl);

    // Initialize internationalization
    i18next.init({
      /* ... */
    });

    // Check user authentication
    checkAuth();

    // Configure router
    configureRouter();

    // Too many responsibilities! ❌
  }
}
```

#### ✅ Explicit Dependencies

```typescript
// ✅ Inject dependencies through constructor
@injectable()
export class UserService implements ExecutorPlugin {
  constructor(
    @inject(UserApi) private api: UserApi,
    @inject(IOCIdentifier.AppConfig) private config: AppConfig
  ) {}
}

// ❌ Create dependencies directly
export class BadUserService implements ExecutorPlugin {
  private api = new UserApi(); // ❌ Hardcoded dependency
  private config = new AppConfig(); // ❌ Hard to test
}
```

### 2. Error Handling

```typescript
export class UserService implements ExecutorPlugin {
  readonly pluginName = 'UserService';

  async onBefore(): Promise<void> {
    try {
      await this.initializeUser();
    } catch (error) {
      // ✅ Graceful error handling
      if (error instanceof AppError) {
        // Business error
        this.handleBusinessError(error);
      } else if (error instanceof NetworkError) {
        // Network error
        this.handleNetworkError(error);
      } else {
        // Unknown error
        this.logger.error('Unknown error:', error);
      }

      // Don't let errors propagate and crash the app
      // Instead, perform appropriate degradation
    }
  }

  private handleBusinessError(error: AppError) {
    if (error.code === 'NO_USER_TOKEN') {
      // Redirect to login page
      this.router.push('/login');
    } else if (error.code === 'TOKEN_EXPIRED') {
      // Refresh token
      this.refreshToken();
    }
  }
}
```

### 3. Performance Optimization

```typescript
// ✅ Load plugins on demand
export class BootstrapsRegistry {
  register(): BootstrapExecutorPlugin[] {
    const plugins: BootstrapExecutorPlugin[] = [
      // Required plugins
      IOC(IOCIdentifier.I18nServiceInterface),
      new UserApiBootstarp()
    ];

    // Development environment plugins
    if (!this.appConfig.isProduction) {
      plugins.push(new DevToolsPlugin(), new MockDataPlugin());
    }

    // Feature toggle plugins
    if (this.appConfig.features.analytics) {
      plugins.push(new AnalyticsPlugin());
    }

    return plugins;
  }
}
```

### 4. Logging

```typescript
export class ApiConfigPlugin implements BootstrapExecutorPlugin {
  readonly pluginName = 'ApiConfigPlugin';

  async onBefore({ parameters: { logger } }: BootstrapContext): Promise<void> {
    logger.info(`[${this.pluginName}] Configuring API...`);

    try {
      await this.configureAPI();
      logger.info(`[${this.pluginName}] ✅ API configured successfully`);
    } catch (error) {
      logger.error(`[${this.pluginName}] ❌ API configuration failed:`, error);
      throw error;
    }
  }
}
```

---

## ❓ FAQ

### Q1: What's the relationship between Bootstrap and React lifecycle?

**A:** Bootstrap executes before React renders.

```
Bootstrap initialization → Bootstrap startup → React rendering
```

### Q2: Is plugin execution order important?

**A:** Very important! Plugins execute in registration order.

```typescript
// ✅ Correct order
bootstrap.use([
  IOC(I18nService), // 1. Initialize i18n first (other plugins may need it)
  new ApiConfigPlugin(), // 2. Then configure API
  IOC(UserService) // 3. Finally check user auth (depends on API)
]);

// ❌ Wrong order
bootstrap.use([
  IOC(UserService), // ❌ UserService depends on API, but API not configured yet
  new ApiConfigPlugin(), // Configure API
  IOC(I18nService) // I18n at the end (too late)
]);
```

### Q3: How to debug Bootstrap?

```typescript
// Method 1: Use logging
export class MyPlugin implements BootstrapExecutorPlugin {
  readonly pluginName = 'MyPlugin';

  async onBefore({ parameters: { logger } }: BootstrapContext): Promise<void> {
    logger.info(`[${this.pluginName}] Starting...`);
    // ... your logic
    logger.info(`[${this.pluginName}] Completed`);
  }
}

// Method 2: Use debug plugin
export const debugPlugin: BootstrapExecutorPlugin = {
  pluginName: 'DebugPlugin',

  onBefore(context) {
    console.log('onBefore context:', context);
  },

  onAfter(context) {
    console.log('onAfter context:', context);
  }
};
```

### Q4: How to test plugins?

```typescript
describe('UserService Plugin', () => {
  it('should initialize user on startup', async () => {
    // Create mock dependencies
    const mockApi = {
      getUserInfo: jest.fn().mockResolvedValue({ name: 'John' })
    };
    const mockStorage = {
      getItem: jest.fn().mockReturnValue('mock-token')
    };

    // Create service
    const userService = new UserService(
      mockRouter,
      mockApi,
      mockConfig,
      mockStorage
    );

    // Execute plugin lifecycle
    await userService.onBefore();

    // Verify
    expect(mockApi.getUserInfo).toHaveBeenCalledWith('mock-token');
  });
});
```

### Q5: Is Bootstrap suitable for all projects?

**A:** Not necessarily. Bootstrap is more suitable for:

✅ **Suitable scenarios:**

- Medium to large applications
- Complex initialization logic required
- Multi-platform applications (Web, mobile, mini-programs)
- Modularity and testability needed
- Team collaborative development

❌ **Not suitable scenarios:**

- Simple display pages
- Prototype projects
- Projects without complex initialization logic

### Q6: How to ensure test coverage?

**A:** Bootstrap architecture naturally supports high coverage:

```typescript
// ✅ Each plugin can be tested independently
describe('UserService', () => {
  it('should initialize user', async () => {
    const service = new UserService(mockApi, mockStorage, mockRouter);
    await service.onBefore();
    expect(mockApi.getUserInfo).toHaveBeenCalled();
  });

  // Easy to test all edge cases
  it('should handle missing token', async () => {
    mockStorage.getItem.mockReturnValue(null);
    await expect(service.onBefore()).rejects.toThrow('NO_USER_TOKEN');
  });

  it('should handle API error', async () => {
    mockApi.getUserInfo.mockRejectedValue(new Error('Network error'));
    await expect(service.onBefore()).rejects.toThrow('Network error');
  });
});
```

**Coverage Goals:**

- Plugin logic: > 90%
- Service layer: > 85%
- API adapters: > 80%

### Q7: What's the difference between Vitest and Jest?

**A:** This project uses Vitest, a testing framework in the Vite ecosystem:

| Feature           | Vitest                             | Jest                         |
| ----------------- | ---------------------------------- | ---------------------------- |
| **Speed**         | ⚡ Very fast (based on Vite)       | Slow                         |
| **Configuration** | 🎯 Zero config (reuse vite.config) | Needs separate configuration |
| **ESM Support**   | ✅ Native support                  | ⚠️ Experimental              |
| **API**           | Jest compatible                    | -                            |
| **HMR**           | ✅ Supported                       | ❌ Not supported             |

```typescript
// Vitest usage (almost identical to Jest)
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('MyTest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should work', () => {
    expect(true).toBe(true);
  });
});
```

---

## 📚 Related Documentation

- [Project Architecture Design](./index.md) - Understand overall architecture
- [IOC Container](./ioc.md) - Dependency injection details
- [Environment Variables](./env.md) - Environment configuration management
- [Global Variable Encapsulation](./global.md) - Browser API encapsulation

---

## 🎉 Summary

Bootstrap initializer is an important component of modern frontend architecture, helping us:

1. **Separation of Concerns** - UI and initialization logic separated
2. **Improved Maintainability** - Modular design, clear responsibilities
3. **Enhanced Testability** - Each plugin can be tested independently
4. **Support Team Collaboration** - Different developers can develop plugins independently
5. **Adapt to Changes** - Easy to extend and modify

Through Bootstrap, we build a more robust, maintainable, and testable frontend application architecture.

---

**Feedback:**  
If you have any questions or suggestions about Bootstrap, please discuss in the team channel or submit an Issue.
