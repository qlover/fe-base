# Bootstrap 启动器

## 📋 目录

- [什么是 Bootstrap](#-什么是-bootstrap)
- [为什么需要 Bootstrap](#-为什么需要-bootstrap)
- [核心概念](#-核心概念)
- [工作流程](#-工作流程)
- [项目中的实现](#-项目中的实现)
- [插件系统](#-插件系统)
- [实战示例](#-实战示例)
- [测试：Bootstrap 的核心优势](#-测试bootstrap-的核心优势)
- [最佳实践](#-最佳实践)
- [常见问题](#-常见问题)

---

## 🎯 什么是 Bootstrap

Bootstrap（启动器）是应用程序的**初始化管理器**，负责在应用渲染前执行所有必要的初始化逻辑。

### 核心职责

```
┌──────────────────────────────────────────────────┐
│  Bootstrap 启动器                                 │
│  ┌────────────────────────────────────────────┐  │
│  │ 1. 创建 IOC 容器                            │  │
│  │ 2. 注入环境变量                             │  │
│  │ 3. 封装全局变量                             │  │
│  │ 4. 注册业务插件                             │  │
│  │ 5. 执行初始化逻辑                           │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
                       ↓
              应用开始渲染
```

### 类比理解

就像电脑开机时需要：

- ✅ 加载驱动程序
- ✅ 启动系统服务
- ✅ 检查硬件状态
- ✅ 初始化用户环境

Bootstrap 在应用启动时做类似的事情：

- ✅ 初始化 IOC 容器（依赖管理）
- ✅ 注入环境配置
- ✅ 封装浏览器 API
- ✅ 执行业务初始化（用户认证、API 配置等）

---

## 🤔 为什么需要 Bootstrap

### 问题：传统方式的痛点

#### 示例 1：组件中混杂初始化逻辑

```typescript
// ❌ 传统方式：在组件中处理初始化
function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 初始化逻辑混在组件中
    fetchUserInfo()
      .then(user => {
        setUser(user);
        // 还要检查权限
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

**问题：**

- 😰 **组件职责过重**：UI 组件不应该处理业务初始化
- 😰 **状态管理复杂**：需要管理多个状态（loading、user、error）
- 😰 **难以测试**：初始化逻辑和 UI 逻辑耦合
- 😰 **难以复用**：初始化逻辑无法在其他项目中复用
- 😰 **维护困难**：业务逻辑变化会影响组件结构

#### 示例 2：多条件初始化

```typescript
// ❌ 更复杂的场景：多个初始化步骤
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
        // 步骤 1：配置 API
        await configureAPI();
        setApiConfigured(true);

        // 步骤 2：加载国际化
        await loadI18n();
        setI18nLoaded(true);

        // 步骤 3：检查用户认证
        if (location.pathname !== '/login') {
          const user = await fetchUserInfo();
          setUserInfo(user);

          // 步骤 4：加载权限
          const perms = await fetchPermissions(user.id);
          setPermissions(perms);

          // 步骤 5：权限检查
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

  // 还要处理各种加载状态...
  if (loading || !apiConfigured || !i18nLoaded) {
    return <LoadingScreen />;
  }

  return <Router />;
}
```

**问题进一步恶化：**

- 😰😰😰 **状态爆炸**：需要管理多个初始化状态
- 😰😰😰 **难以扩展**：添加新的初始化步骤会让代码更复杂
- 😰😰😰 **错误处理复杂**：每一步都可能失败，需要大量错误处理代码
- 😰😰😰 **依赖关系隐式**：步骤之间的依赖关系不清晰

### 解决方案：使用 Bootstrap

```typescript
// ✅ 使用 Bootstrap：组件变得简洁
function App() {
  return (
    <BootstrapsProvider>
      <ComboProvider themeConfig={themeConfig}>
        <AppRouterProvider pages={allPages} />
      </ComboProvider>
    </BootstrapsProvider>
  );
}

// 所有初始化逻辑在 Bootstrap 中处理
const bootstrap = new Bootstrap({
  root: window,
  logger,
  ioc: { manager: IOC, register: new IocRegisterImpl({ pathname, appConfig }) },
  envOptions: { /* 环境变量配置 */ },
  globalOptions: { /* 全局变量配置 */ }
});

// 注册初始化插件
bootstrap.use([
  IOC(I18nService),        // 国际化服务
  new UserApiBootstrap(),  // 用户 API 配置
  new FeApiBootstrap(),    // 业务 API 配置
  IOC(UserService)         // 用户认证服务
]);

// 启动应用
await bootstrap.initialize();
await bootstrap.start();
```

**优势：**

- ✅ **组件职责清晰**：UI 组件只负责渲染
- ✅ **逻辑分离**：初始化逻辑独立于 UI
- ✅ **易于测试**：可以独立测试每个初始化步骤
- ✅ **易于扩展**：添加新的初始化步骤只需添加新插件
- ✅ **易于复用**：同一套初始化逻辑可以在不同项目中使用

---

## 💡 核心概念

### 1. 插件化架构

Bootstrap 采用插件化设计，每个插件负责一个特定的初始化任务。

```typescript
// 插件接口
export interface BootstrapExecutorPlugin {
  readonly pluginName: string;

  // 在初始化前执行
  onBefore?(context: BootstrapContext): void | Promise<void>;

  // 在初始化时执行
  onExecute?(context: BootstrapContext): void | Promise<void>;

  // 在初始化后执行
  onAfter?(context: BootstrapContext): void | Promise<void>;

  // 错误处理
  onError?(error: Error, context: BootstrapContext): void | Promise<void>;
}
```

### 2. 生命周期

```
┌────────────────────────────────────────────────┐
│  Bootstrap 生命周期                             │
│                                                │
│  initialize()                                  │
│  ├── 创建 IOC 容器                              │
│  ├── 注入环境变量                               │
│  └── 封装全局变量                               │
│                                                │
│  start()                                       │
│  ├── onBefore: 前置初始化                       │
│  │   ├── 配置 API                               │
│  │   ├── 加载国际化                             │
│  │   └── 检查用户认证                           │
│  │                                              │
│  ├── onExecute: 执行主逻辑                      │
│  │   └── 执行业务初始化                         │
│  │                                              │
│  ├── onAfter: 后置处理                          │
│  │   └── 清理资源、记录日志                     │
│  │                                              │
│  └── onError: 错误处理                          │
│      └── 错误捕获和处理                         │
└────────────────────────────────────────────────┘
```

### 3. 依赖注入

Bootstrap 与 IOC 容器深度集成，所有插件都可以通过依赖注入获取服务。

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
    // 使用注入的依赖执行初始化
    const token = this.storage.getItem('token');
    if (token) {
      await this.api.getUserInfo(token);
    }
  }
}
```

---

## 🔄 工作流程

### 完整流程图

```
┌─────────────────────────────────────────────────────────────┐
│ 1. main.tsx: 应用入口                                         │
│    BootstrapClient.main({ root: window, bootHref, ioc })   │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. BootstrapClient: 创建 Bootstrap 实例                      │
│    - 创建 IOC 容器                                            │
│    - 配置环境变量注入                                         │
│    - 配置全局变量封装                                         │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Bootstrap.initialize(): 初始化                           │
│    ✅ IOC 容器初始化                                          │
│    ✅ 环境变量注入到 AppConfig                                │
│    ✅ 全局变量封装（localStorage、window 等）                 │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. BootstrapsRegistry: 注册业务插件                          │
│    - I18nService: 国际化服务                                  │
│    - UserApiBootstrap: 用户 API 配置                         │
│    - FeApiBootstrap: 业务 API 配置                           │
│    - UserService: 用户认证服务                                │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Bootstrap.start(): 启动                                   │
│    ↓                                                         │
│    onBefore 阶段：                                           │
│    ├── I18nService.onBefore() → 加载翻译资源                 │
│    ├── UserApiBootstrap.onBefore() → 配置 API 插件          │
│    ├── FeApiBootstrap.onBefore() → 配置业务 API             │
│    └── UserService.onBefore() → 检查用户认证                 │
│    ↓                                                         │
│    onExecute 阶段：                                          │
│    └── 执行插件主逻辑                                         │
│    ↓                                                         │
│    onAfter 阶段：                                            │
│    └── 清理和日志记录                                         │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. React 渲染                                                │
│    ReactDOM.render(<App />)                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 项目中的实现

### 文件结构

```
src/
├── main.tsx                          # 应用入口
├── core/
│   ├── bootstraps/
│   │   ├── BootstrapClient.ts        # Bootstrap 启动器
│   │   ├── BootstrapsRegistry.ts     # 插件注册器
│   │   ├── PrintBootstrap.ts         # 打印日志插件
│   │   └── IocIdentifierTest.ts      # IOC 测试插件
│   ├── globals.ts                    # 全局变量封装
│   └── clientIoc/
│       ├── ClientIOC.ts              # IOC 容器
│       └── ClientIOCRegister.ts      # IOC 注册器
├── base/
│   ├── services/
│   │   ├── UserService.ts            # 用户服务（插件）
│   │   └── I18nService.ts            # 国际化服务（插件）
│   └── apis/
│       ├── userApi/
│       │   └── UserApiBootstrap.ts   # 用户 API 配置插件
│       └── feApi/
│           └── FeApiBootstrap.ts     # 业务 API 配置插件
└── uikit/
    └── components/
        └── BootstrapsProvider.tsx    # Bootstrap Provider
```

### 1. 入口文件：main.tsx

```typescript
// src/main.tsx
import 'reflect-metadata';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { BootstrapClient } from './core/bootstraps/BootstrapClient';
import { clientIOC } from './core/clientIoc/ClientIOC.ts';

// 🚀 启动 Bootstrap
BootstrapClient.main({
  root: window,                    // 注入浏览器环境
  bootHref: window.location.href,  // 注入启动 URL
  ioc: clientIOC                   // 注入 IOC 容器
});

// 渲染 React 应用
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### 2. Bootstrap 启动器：BootstrapClient.ts

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

    // 1️⃣ 创建 IOC 容器
    const IOC = ioc.create({
      pathname: bootHref,
      appConfig: appConfig
    });

    // 2️⃣ 创建 Bootstrap 实例
    const bootstrap = new Bootstrap({
      root,
      logger,
      // IOC 容器配置
      ioc: {
        manager: IOC,
        register: iocRegister
      },
      // 环境变量注入配置
      envOptions: {
        target: appConfig, // 注入到 AppConfig
        source: Object.assign({}, import.meta.env, {
          [envPrefix + 'BOOT_HREF']: bootHref // 添加启动 URL
        }),
        prefix: envPrefix, // 环境变量前缀
        blackList: envBlackList // 黑名单
      },
      // 全局变量封装配置
      globalOptions: {
        sources: globals, // 封装的全局变量
        target: browserGlobalsName // 挂载目标
      }
    });

    try {
      logger.info('bootstrap start...');

      // 3️⃣ 初始化 Bootstrap
      await bootstrap.initialize();

      // 4️⃣ 注册业务插件
      const bootstrapsRegistry = new BootstrapsRegistry(IOC);

      // 5️⃣ 启动应用
      await bootstrap.use(bootstrapsRegistry.register()).start();

      logger.info('bootstrap completed successfully');
    } catch (error) {
      logger.error(`${appConfig.appName} startup error:`, error);
    }

    return args;
  }
}
```

**关键步骤解析：**

1. **创建 IOC 容器** - 统一管理所有依赖
2. **创建 Bootstrap 实例** - 配置初始化参数
3. **初始化** - 执行 IOC、环境变量、全局变量的初始化
4. **注册插件** - 添加业务初始化逻辑
5. **启动** - 执行所有插件的生命周期方法

### 3. 插件注册器：BootstrapsRegistry.ts

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
   * 注册所有业务插件
   */
  register(): BootstrapExecutorPlugin[] {
    const IOC = this.IOC;

    const bootstrapList = [
      // 1. 国际化服务（需要最先初始化）
      IOC(IOCIdentifier.I18nServiceInterface),

      // 2. API 配置插件
      new UserApiBootstarp(), // 用户 API
      new FeApiBootstarp(), // 业务 API
      AiApiBootstarp, // AI API

      // 3. 其他插件
      IOC(IOCIdentifier.I18nKeyErrorPlugin),
      IOC(IOCIdentifier.ProcesserExecutorInterface)
    ];

    // 开发环境：添加调试插件
    if (!this.appConfig.isProduction) {
      bootstrapList.push(printBootstrap);
    }

    return bootstrapList;
  }
}
```

**插件顺序很重要：**

- ✅ 国际化服务最先初始化（其他插件可能需要翻译）
- ✅ API 配置在业务逻辑之前
- ✅ 开发工具仅在开发环境加载

---

## 🔌 插件系统

### 插件类型

#### 1. 服务类插件（通过 IOC 注入）

```typescript
// src/base/services/I18nService.ts
@injectable()
export class I18nService implements ExecutorPlugin {
  readonly pluginName = 'I18nService';

  constructor(@inject(IOCIdentifier.AppConfig) private config: AppConfig) {}

  /**
   * 在 Bootstrap 启动前加载翻译资源
   */
  async onBefore(): Promise<void> {
    await i18next.init({
      lng: this.config.defaultLanguage,
      fallbackLng: 'en',
      resources: this.loadResources()
    });
  }

  private loadResources() {
    // 加载翻译资源
    return {
      /* ... */
    };
  }
}

// 注册方式
bootstrap.use([
  IOC(IOCIdentifier.I18nServiceInterface) // 从 IOC 容器获取
]);
```

#### 2. 配置类插件（独立实例）

```typescript
// src/base/apis/userApi/UserApiBootstrap.ts
export class UserApiBootstarp implements BootstrapExecutorPlugin {
  readonly pluginName = 'UserApiBootstarp';

  /**
   * 配置 User API 的插件
   */
  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    const userApi = ioc.get<UserApi>(UserApi);

    // 添加 URL 处理插件
    userApi.usePlugin(new FetchURLPlugin());

    // 添加 Mock 插件（开发环境）
    userApi.usePlugin(ioc.get(IOCIdentifier.ApiMockPlugin));

    // 添加请求日志插件
    userApi.usePlugin(ioc.get(RequestLogger));
  }
}

// 注册方式
bootstrap.use([
  new UserApiBootstarp() // 直接创建实例
]);
```

#### 3. 业务逻辑插件

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
   * 在应用启动时检查用户认证状态
   */
  async onBefore(): Promise<void> {
    // 如果已登录，直接返回
    if (this.isAuthenticated()) {
      return;
    }

    // 尝试从存储中恢复用户信息
    const userToken = this.getToken();
    if (!userToken) {
      throw new AppError('NO_USER_TOKEN');
    }

    // 获取用户信息
    await this.userInfo();
  }

  getToken(): string | null {
    return this.credential();
  }
}
```

### 插件生命周期详解

```typescript
export interface BootstrapExecutorPlugin {
  readonly pluginName: string;

  /**
   * onBefore: 在初始化前执行
   *
   * 适用场景：
   * - 配置 API 客户端
   * - 加载资源（翻译、主题等）
   * - 检查用户认证
   * - 初始化第三方库
   */
  onBefore?(context: BootstrapContext): void | Promise<void>;

  /**
   * onExecute: 在初始化时执行
   *
   * 适用场景：
   * - 执行主要业务逻辑
   * - 启动后台任务
   */
  onExecute?(context: BootstrapContext): void | Promise<void>;

  /**
   * onAfter: 在初始化后执行
   *
   * 适用场景：
   * - 清理临时资源
   * - 记录启动日志
   * - 发送统计数据
   */
  onAfter?(context: BootstrapContext): void | Promise<void>;

  /**
   * onError: 错误处理
   *
   * 适用场景：
   * - 捕获插件错误
   * - 错误日志记录
   * - 错误恢复
   */
  onError?(error: Error, context: BootstrapContext): void | Promise<void>;
}
```

---

## 🎯 实战示例

### 示例 1：国际化插件

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
    // 加载翻译资源
    const resources = this.loadAllResources();

    // 初始化 i18next
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
    // 从配置文件加载所有翻译资源
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

### 示例 2：API 配置插件

```typescript
// src/base/apis/feApi/FeApiBootstrap.ts
export class FeApiBootstarp implements BootstrapExecutorPlugin {
  readonly pluginName = 'FeApiBootstarp';

  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    const feApi = ioc.get<FeApi>(FeApi);
    const appConfig = ioc.get<AppConfig>(IOCIdentifier.AppConfig);

    // 1. 配置基础 URL
    feApi.setBaseURL(appConfig.apiBaseUrl);

    // 2. 添加认证插件
    feApi.usePlugin(
      new AuthTokenPlugin({
        getToken: () => {
          const storage = ioc.get(IOCIdentifier.LocalStorageEncrypt);
          return storage.getItem('token');
        }
      })
    );

    // 3. 添加错误处理插件
    feApi.usePlugin(
      new ErrorHandlerPlugin({
        onError: (error) => {
          if (error.status === 401) {
            // 未授权，跳转登录
            const router = ioc.get(IOCIdentifier.RouteServiceInterface);
            router.push('/login');
          }
        }
      })
    );

    // 4. 添加请求日志插件（开发环境）
    if (!appConfig.isProduction) {
      feApi.usePlugin(new RequestLoggerPlugin());
    }
  }
}
```

### 示例 3：用户认证插件

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
   * 在应用启动时自动恢复用户登录状态
   */
  async onBefore(): Promise<void> {
    try {
      // 检查是否在登录页
      if (this.routerService.isLoginPage()) {
        return;
      }

      // 如果已经有用户信息，直接返回
      if (this.isAuthenticated()) {
        console.log('✅ User already authenticated');
        return;
      }

      // 尝试从存储中恢复 token
      const token = this.getToken();
      if (!token) {
        // 没有 token，跳转登录
        throw new AppError('NO_USER_TOKEN');
      }

      // 使用 token 获取用户信息
      const userInfo = await this.userInfo();
      console.log('✅ User authenticated:', userInfo.name);
    } catch (error) {
      // 认证失败，清理存储并跳转登录
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

### 示例 4：开发工具插件

```typescript
// src/core/bootstraps/PrintBootstrap.ts
export const printBootstrap: BootstrapExecutorPlugin = {
  pluginName: 'PrintBootstrap',

  onAfter({ parameters: { logger, ioc } }: BootstrapContext): void {
    const appConfig = ioc.get<AppConfig>(IOCIdentifier.AppConfig);

    // 打印应用信息
    logger.info('🚀 Application started successfully!');
    logger.info('📦 App Name:', appConfig.appName);
    logger.info('🌍 Environment:', appConfig.env);
    logger.info('🔗 API Base URL:', appConfig.apiBaseUrl);

    // 打印已注册的服务
    logger.info('📋 Registered Services:');
    logger.info('  - UserService');
    logger.info('  - I18nService');
    logger.info('  - RouteService');

    // 打印警告（如果有）
    if (!appConfig.isProduction && appConfig.mockEnabled) {
      logger.warn('⚠️ Mock API is enabled');
    }
  }
};
```

---

## 🧪 测试：Bootstrap 的核心优势

### 为什么测试如此重要？

Bootstrap 架构的一个**最重要的优势**就是**可测试性**。通过分离初始化逻辑和 UI，我们可以：

- ✅ 独立测试每个插件
- ✅ 轻松 mock 依赖
- ✅ 快速运行测试（不需要渲染 UI）
- ✅ 提高测试覆盖率

### 传统方式 vs Bootstrap 方式

#### ❌ 传统方式：组件中混杂初始化逻辑

```typescript
// ❌ 传统组件：难以测试
function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [i18nReady, setI18nReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        // 1. 初始化国际化
        await i18next.init({
          lng: 'zh',
          resources: { /* ... */ }
        });
        setI18nReady(true);

        // 2. 配置 API
        api.setBaseURL('https://api.example.com');
        api.usePlugin(new AuthPlugin());

        // 3. 检查用户认证
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

**测试代码（传统方式）：😰😰😰 非常困难**

```typescript
// ❌ 传统方式的测试：充满技巧和 hack
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('App (Traditional)', () => {
  beforeEach(() => {
    // 😰 需要 mock 全局变量
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };

    // 😰 需要 mock fetch
    global.fetch = vi.fn();

    // 😰 需要 mock i18next
    vi.mock('i18next', () => ({
      init: vi.fn().mockResolvedValue(undefined),
      t: vi.fn(key => key)
    }));
  });

  it('should initialize and load user', async () => {
    // 😰 设置复杂的 mock
    vi.mocked(localStorage.getItem).mockReturnValue('mock-token');
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', name: 'John' })
    });

    render(<App />);

    // 😰 需要等待多个异步操作
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // 😰 难以验证中间状态
    expect(fetch).toHaveBeenCalledWith('/api/user', expect.any(Object));
  });

  it('should handle error', async () => {
    // 😰 每个测试都需要重新设置 mock
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Error/)).toBeInTheDocument();
    });
  });

  // 😰 问题：
  // 1. 需要 mock 大量全局变量（localStorage, fetch, i18next）
  // 2. 测试运行慢（需要渲染组件）
  // 3. 难以测试错误场景
  // 4. 测试之间可能互相干扰
  // 5. 难以测试初始化的各个步骤
});
```

#### ✅ Bootstrap 方式：独立测试插件

```typescript
// ✅ Bootstrap 方式：逻辑和 UI 分离
// 1. 插件实现
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

// 2. UI 组件变得简单
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

**测试代码（Bootstrap 方式）：😊😊😊 非常简单**

```typescript
// ✅ Bootstrap 方式的测试：清晰、简单、快速
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '@/base/services/UserService';
import { AppError } from '@/base/cases/AppError';

describe('UserService Plugin', () => {
  let userService: UserService;
  let mockApi: any;
  let mockStorage: any;
  let mockRouter: any;

  beforeEach(() => {
    // ✅ 只需要 mock 依赖接口，不需要 mock 全局变量
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

    // ✅ 创建服务实例
    userService = new UserService(mockApi, mockStorage, mockRouter);
  });

  it('should load user when token exists', async () => {
    // ✅ 设置测试数据
    mockStorage.getItem.mockReturnValue('mock-token');
    mockApi.getUserInfo.mockResolvedValue({
      id: '1',
      name: 'John Doe'
    });

    // ✅ 执行插件生命周期
    await userService.onBefore();

    // ✅ 清晰的断言
    expect(mockStorage.getItem).toHaveBeenCalledWith('token');
    expect(mockApi.getUserInfo).toHaveBeenCalledWith('mock-token');
    expect(userService.getUser()).toEqual({
      id: '1',
      name: 'John Doe'
    });
  });

  it('should throw error when token is missing', async () => {
    // ✅ 轻松测试错误场景
    mockStorage.getItem.mockReturnValue(null);

    // ✅ 验证错误
    await expect(userService.onBefore()).rejects.toThrow(AppError);
    await expect(userService.onBefore()).rejects.toThrow('NO_USER_TOKEN');
  });

  it('should handle API error', async () => {
    // ✅ 轻松模拟 API 错误
    mockStorage.getItem.mockReturnValue('mock-token');
    mockApi.getUserInfo.mockRejectedValue(new Error('Network error'));

    // ✅ 验证错误处理
    await expect(userService.onBefore()).rejects.toThrow('Network error');
  });

  // ✅ 优势：
  // 1. 不需要 mock 全局变量
  // 2. 测试运行快（不需要渲染 UI）
  // 3. 易于测试错误场景
  // 4. 测试之间完全独立
  // 5. 可以单独测试每个初始化步骤
});
```

### 测试复杂度对比

| 测试场景         | 传统方式                                     | Bootstrap 方式                  | 提升      |
| ---------------- | -------------------------------------------- | ------------------------------- | --------- |
| **Mock 复杂度**  | 😰😰😰 需要 mock 全局变量、fetch、i18next 等 | 😊 只需 mock 依赖接口           | **80%**   |
| **测试运行速度** | 😰😰 慢（需要渲染组件，等待异步）            | 😊😊😊 快（纯逻辑测试）         | **5-10x** |
| **测试错误场景** | 😰😰😰 困难（需要复杂的 mock 设置）          | 😊😊😊 简单（直接 mock reject） | **90%**   |
| **测试隔离性**   | 😰😰 差（全局变量可能互相影响）              | 😊😊😊 好（每个测试独立）       | **100%**  |
| **测试可读性**   | 😰😰 差（充满 mock 和 hack）                 | 😊😊😊 好（清晰的输入输出）     | **80%**   |
| **覆盖率**       | 😰😰 低（难以覆盖所有分支）                  | 😊😊😊 高（易于覆盖所有场景）   | **50%**   |

### 实际项目中的测试示例

#### 示例 1：测试 I18n 插件

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
      // ✅ 执行插件生命周期
      service.onBefore();

      // ✅ 验证初始化配置
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

      // ✅ 测试语言检测逻辑
      const language = detector.lookup();
      expect(language).toBe('en');
    });

    it('should return fallback language for invalid path', () => {
      const invalidService = new I18nService('/invalid/path');
      invalidService.onBefore();

      const detector = vi.mocked(i18n.services.languageDetector.addDetector)
        .mock.calls[0][0];

      // ✅ 测试边界情况
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
      // ✅ 测试错误场景
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

#### 示例 2：测试 Bootstrap 启动流程

```typescript
// __tests__/src/core/bootstraps/BootstrapsApp.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BootstrapClient } from '@/core/bootstraps/BootstrapClient';
import type { BootstrapClientArgs } from '@/core/bootstraps/BootstrapClient';
import { InversifyContainer } from '@/base/cases/InversifyContainer';
import { createIOCFunction } from '@qlover/corekit-bridge';
import { browserGlobalsName } from '@config/common';

// Mock 依赖
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
      // ✅ 执行启动流程
      const result = await BootstrapClient.main(mockArgs);

      // ✅ 验证启动结果
      expect(result.bootHref).toBe('http://localhost:3000');

      // ✅ 验证全局变量注入
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
      // ✅ 测试错误场景
      mockArgs.ioc.create = vi.fn().mockImplementation(() => {
        throw new Error('IOC creation failed');
      });

      // ✅ 验证错误不会导致应用崩溃
      await expect(BootstrapClient.main(mockArgs)).rejects.toThrow(
        'IOC creation failed'
      );
    });
  });
});
```

#### 示例 3：测试 API 配置插件

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

    // ✅ 创建 mock 上下文
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
    // ✅ 执行插件生命周期
    plugin.onBefore(mockContext);

    // ✅ 验证 API 配置
    expect(mockContext.parameters.ioc.get).toHaveBeenCalled();
    expect(mockUserApi.usePlugin).toHaveBeenCalled();
  });

  it('should add multiple plugins to API', () => {
    plugin.onBefore(mockContext);

    // ✅ 验证添加了多个插件
    expect(mockUserApi.usePlugin).toHaveBeenCalledTimes(3);
  });
});
```

### 测试最佳实践

#### 1. ✅ 使用 Vitest 的测试工具

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('MyPlugin', () => {
  beforeEach(() => {
    // ✅ 每个测试前重置 mock
    vi.clearAllMocks();
  });

  afterEach(() => {
    // ✅ 清理资源
    vi.restoreAllMocks();
  });

  it('should do something', () => {
    // 测试逻辑
  });
});
```

#### 2. ✅ 测试插件的生命周期

```typescript
describe('UserService Plugin', () => {
  it('should execute onBefore lifecycle', async () => {
    const service = new UserService(mockApi, mockStorage, mockRouter);

    // ✅ 测试 onBefore
    await service.onBefore();

    expect(mockApi.getUserInfo).toHaveBeenCalled();
  });

  it('should execute onAfter lifecycle', async () => {
    const service = new UserService(mockApi, mockStorage, mockRouter);

    // ✅ 测试 onAfter
    await service.onAfter?.();

    // 验证清理逻辑
  });

  it('should handle onError lifecycle', async () => {
    const service = new UserService(mockApi, mockStorage, mockRouter);
    const error = new Error('Test error');

    // ✅ 测试 onError
    await service.onError?.(error, mockContext);

    // 验证错误处理
  });
});
```

#### 3. ✅ 测试边界情况和错误场景

```typescript
describe('UserService Error Handling', () => {
  it('should handle missing token', async () => {
    mockStorage.getItem.mockReturnValue(null);

    // ✅ 验证错误
    await expect(service.onBefore()).rejects.toThrow('NO_USER_TOKEN');
  });

  it('should handle network error', async () => {
    mockStorage.getItem.mockReturnValue('token');
    mockApi.getUserInfo.mockRejectedValue(new Error('Network error'));

    // ✅ 验证错误处理
    await expect(service.onBefore()).rejects.toThrow('Network error');
  });

  it('should handle invalid token', async () => {
    mockStorage.getItem.mockReturnValue('invalid-token');
    mockApi.getUserInfo.mockRejectedValue(new Error('401 Unauthorized'));

    // ✅ 验证 401 错误处理
    await expect(service.onBefore()).rejects.toThrow('401 Unauthorized');
  });
});
```

#### 4. ✅ 测试插件之间的依赖

```typescript
describe('Plugin Dependencies', () => {
  it('should ensure I18n is initialized before UserService', async () => {
    const i18nService = new I18nService('/en/path');
    const userService = new UserService(mockApi, mockStorage, mockRouter);

    // ✅ I18n 先初始化
    await i18nService.onBefore();

    // ✅ 然后初始化 UserService
    await userService.onBefore();

    // ✅ 验证 UserService 可以使用翻译
    expect(i18n.t('some.key')).toBeDefined();
  });
});
```

### 运行测试

```bash
# 运行所有测试
npm run test

# 运行测试并监听文件变化
npm run test -- --watch

# 运行特定文件的测试
npm run test -- UserService.test.ts

# 生成测试覆盖率报告
npm run test -- --coverage
```

### 测试覆盖率目标

在 Bootstrap 架构下，我们可以轻松达到高覆盖率：

- **插件逻辑**：> 90% 覆盖率
- **服务层**：> 85% 覆盖率
- **API 适配器**：> 80% 覆盖率
- **整体应用**：> 75% 覆盖率

### 总结：测试的价值

Bootstrap 架构通过分离关注点，让测试变得：

1. **更简单** - 不需要 mock 全局变量和复杂的环境
2. **更快速** - 纯逻辑测试，不需要渲染 UI
3. **更可靠** - 测试之间完全独立，不会互相干扰
4. **更全面** - 易于测试所有边界情况和错误场景
5. **更有信心** - 高覆盖率保证代码质量

> 💡 **重要提示**：可测试性是 Bootstrap 架构最大的优势之一。如果你发现某个插件难以测试，很可能是设计有问题，需要重新考虑职责划分。

---

## 💎 最佳实践

### 1. 插件设计原则

#### ✅ 单一职责

```typescript
// ✅ 好的插件设计：只做一件事
export class ApiConfigPlugin implements BootstrapExecutorPlugin {
  readonly pluginName = 'ApiConfigPlugin';

  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    // 只负责配置 API
    const api = ioc.get<FeApi>(FeApi);
    api.setBaseURL(config.apiBaseUrl);
    api.usePlugin(new AuthPlugin());
  }
}

// ❌ 不好的插件设计：做了太多事
export class BadPlugin implements BootstrapExecutorPlugin {
  readonly pluginName = 'BadPlugin';

  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    // 配置 API
    const api = ioc.get<FeApi>(FeApi);
    api.setBaseURL(config.apiBaseUrl);

    // 初始化国际化
    i18next.init({
      /* ... */
    });

    // 检查用户认证
    checkAuth();

    // 配置路由
    configureRouter();

    // 太多职责！❌
  }
}
```

#### ✅ 明确依赖

```typescript
// ✅ 通过构造函数注入依赖
@injectable()
export class UserService implements ExecutorPlugin {
  constructor(
    @inject(UserApi) private api: UserApi,
    @inject(IOCIdentifier.AppConfig) private config: AppConfig
  ) {}
}

// ❌ 直接创建依赖
export class BadUserService implements ExecutorPlugin {
  private api = new UserApi(); // ❌ 硬编码依赖
  private config = new AppConfig(); // ❌ 难以测试
}
```

### 2. 错误处理

```typescript
export class UserService implements ExecutorPlugin {
  readonly pluginName = 'UserService';

  async onBefore(): Promise<void> {
    try {
      await this.initializeUser();
    } catch (error) {
      // ✅ 优雅的错误处理
      if (error instanceof AppError) {
        // 业务错误
        this.handleBusinessError(error);
      } else if (error instanceof NetworkError) {
        // 网络错误
        this.handleNetworkError(error);
      } else {
        // 未知错误
        this.logger.error('Unknown error:', error);
      }

      // 不要让错误传播，导致应用崩溃
      // 而是进行适当的降级处理
    }
  }

  private handleBusinessError(error: AppError) {
    if (error.code === 'NO_USER_TOKEN') {
      // 跳转登录页
      this.router.push('/login');
    } else if (error.code === 'TOKEN_EXPIRED') {
      // 刷新 token
      this.refreshToken();
    }
  }
}
```

### 3. 性能优化

```typescript
// ✅ 按需加载插件
export class BootstrapsRegistry {
  register(): BootstrapExecutorPlugin[] {
    const plugins: BootstrapExecutorPlugin[] = [
      // 必需插件
      IOC(IOCIdentifier.I18nServiceInterface),
      new UserApiBootstarp()
    ];

    // 开发环境插件
    if (!this.appConfig.isProduction) {
      plugins.push(new DevToolsPlugin(), new MockDataPlugin());
    }

    // 功能开关插件
    if (this.appConfig.features.analytics) {
      plugins.push(new AnalyticsPlugin());
    }

    return plugins;
  }
}
```

### 4. 日志记录

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

## ❓ 常见问题

### Q1: Bootstrap 和 React 的生命周期有什么关系？

**A:** Bootstrap 在 React 渲染之前执行。

```
Bootstrap 初始化 → Bootstrap 启动 → React 渲染
```

### Q2: 插件执行顺序重要吗？

**A:** 非常重要！插件按照注册顺序依次执行。

```typescript
// ✅ 正确的顺序
bootstrap.use([
  IOC(I18nService), // 1. 先初始化国际化（其他插件可能需要）
  new ApiConfigPlugin(), // 2. 再配置 API
  IOC(UserService) // 3. 最后检查用户认证（依赖 API）
]);

// ❌ 错误的顺序
bootstrap.use([
  IOC(UserService), // ❌ 用户服务依赖 API，但 API 还没配置
  new ApiConfigPlugin(), // 配置 API
  IOC(I18nService) // 国际化在最后（太晚了）
]);
```

### Q3: 如何调试 Bootstrap？

```typescript
// 方法 1：使用日志
export class MyPlugin implements BootstrapExecutorPlugin {
  readonly pluginName = 'MyPlugin';

  async onBefore({ parameters: { logger } }: BootstrapContext): Promise<void> {
    logger.info(`[${this.pluginName}] Starting...`);
    // ... 你的逻辑
    logger.info(`[${this.pluginName}] Completed`);
  }
}

// 方法 2：使用调试插件
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

### Q4: 如何测试插件？

```typescript
describe('UserService Plugin', () => {
  it('should initialize user on startup', async () => {
    // 创建 mock 依赖
    const mockApi = {
      getUserInfo: jest.fn().mockResolvedValue({ name: 'John' })
    };
    const mockStorage = {
      getItem: jest.fn().mockReturnValue('mock-token')
    };

    // 创建服务
    const userService = new UserService(
      mockRouter,
      mockApi,
      mockConfig,
      mockStorage
    );

    // 执行插件生命周期
    await userService.onBefore();

    // 验证
    expect(mockApi.getUserInfo).toHaveBeenCalledWith('mock-token');
  });
});
```

### Q5: Bootstrap 适合所有项目吗？

**A:** 不一定。Bootstrap 更适合：

✅ **适合使用的场景：**

- 中大型应用
- 需要复杂初始化逻辑
- 多端应用（Web、移动端、小程序）
- 需要模块化和可测试性
- 团队协作开发

❌ **不适合的场景：**

- 简单的展示页面
- 原型项目
- 没有复杂初始化逻辑的项目

### Q6: 如何保证测试覆盖率？

**A:** Bootstrap 架构天然支持高覆盖率：

```typescript
// ✅ 每个插件都可以独立测试
describe('UserService', () => {
  it('should initialize user', async () => {
    const service = new UserService(mockApi, mockStorage, mockRouter);
    await service.onBefore();
    expect(mockApi.getUserInfo).toHaveBeenCalled();
  });

  // 易于测试所有边界情况
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

**覆盖率目标：**

- 插件逻辑：> 90%
- 服务层：> 85%
- API 适配器：> 80%

### Q7: Vitest 和 Jest 有什么区别？

**A:** 本项目使用 Vitest，它是 Vite 生态的测试框架：

| 特性         | Vitest                        | Jest         |
| ------------ | ----------------------------- | ------------ |
| **速度**     | ⚡ 非常快（基于 Vite）        | 慢           |
| **配置**     | 🎯 零配置（复用 vite.config） | 需要单独配置 |
| **ESM 支持** | ✅ 原生支持                   | ⚠️ 实验性    |
| **API**      | 与 Jest 兼容                  | -            |
| **HMR**      | ✅ 支持                       | ❌ 不支持    |

```typescript
// Vitest 使用方式（与 Jest 几乎相同）
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

## 📚 相关文档

- [项目架构设计](./index.md) - 了解整体架构
- [IOC 容器](./ioc.md) - 依赖注入详解
- [环境变量](./env.md) - 环境配置管理
- [全局变量封装](./global.md) - 浏览器 API 封装

---

## 🎉 总结

Bootstrap 启动器是现代前端架构的重要组成部分，它帮助我们：

1. **分离关注点** - UI 和初始化逻辑分离
2. **提高可维护性** - 模块化设计，职责清晰
3. **增强可测试性** - 每个插件可独立测试
4. **支持团队协作** - 不同开发者可以独立开发插件
5. **适应变化** - 易于扩展和修改

通过 Bootstrap，我们构建了一个更加健壮、可维护、可测试的前端应用架构。

---

**问题反馈：**  
如果你对 Bootstrap 有任何疑问或建议，请在团队频道中讨论或提交 Issue。
