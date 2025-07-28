## 项目启动指南

### 什么是 Bootstrap？

Bootstrap 是一个应用启动器，它帮助我们在应用启动时统一管理各种初始化逻辑。

**简单来说**：就像电脑开机时需要启动各种服务一样，我们的应用也需要在启动时做一些准备工作，比如：

- 检查用户是否登录
- 加载用户信息
- 初始化 API 配置
- 设置主题、语言等

文件路径: src/core/bootstraps

### 项目中的实现

该项目基于 `@qlover/fe-corekit` 的 AsyncExecutor 异步执行器，`corekit-bridge` 在此基础上实现了 Bootstrap。

**文件入口**：`src/core/bootstraps/BootstrapApp.ts`

**主要组成部分**：

1. [IOC 容器](./ioc.md) - 依赖注入管理
2. [环境变量的注入](./env.md) - 配置管理
3. [浏览器全局变量的注入](./global.md) - 浏览器全局属性

### 什么时候需要使用 Bootstrap？

当你遇到以下情况时，Bootstrap 就能派上用场：

### 为什么需要"启动器"

**核心目标**：让应用启动更简洁，业务逻辑更清晰。

**解决的问题**：当页面打开时，你需要鉴权，或者请求某个 API，数据才能进入页面，这个时候你可能会这样做

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

这段代码执行起来没有什么问题，关键的问题在于，他会和组件强耦合在一起！也就是说当 fetchUserInfo 成功后更新局部状态，然后渲染 Router

但是如果，进入 Router 的逻辑变得复杂，依赖各种情况的时候，组件会变成非常臃肿且难以维护

就比如下面情况：

当路由是 /home 时请求用户信息，成功后，如果用户信息 roles 有权限则进入，否则跳转到 /login

```tsx
export function App() {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);

    // 检查当前路由
    if (location.pathname === '/home') {
      fetchUserInfo()
        .then((user) => {
          setUserInfo(user);

          // 检查用户权限
          if (user.roles && user.roles.includes('admin')) {
            setHasPermission(true);
            setLoading(false);
          } else {
            // 没有权限，跳转到登录页
            window.location.href = '/login';
          }
        })
        .catch((error) => {
          console.error('Failed to fetch user info:', error);
          // 请求失败也跳转到登录页
          window.location.href = '/login';
        });
    } else {
      setLoading(false);
    }
  }, [location.pathname]);

  // 如果正在加载，显示加载状态
  if (loading) {
    return <div>Loading...</div>;
  }

  // 如果是 home 页面但没有权限，显示错误信息
  if (location.pathname === '/home' && !hasPermission) {
    return <div>Access denied</div>;
  }

  return <Router />;
}
```

这个示例展示了几个问题：

1. **组件职责过重**：App 组件不仅要处理路由，还要处理用户认证、权限检查、错误处理等
2. **状态管理复杂**：需要管理 loading、userInfo、hasPermission 等多个状态
3. **逻辑耦合**：认证逻辑与组件渲染逻辑混在一起
4. **难以测试**：组件包含了太多业务逻辑，难以进行单元测试
5. **难以扩展**：如果后续需要添加更多权限检查或认证逻辑，组件会变得更加臃肿

这些问题会再项目迭代后一步一步将问题放大，直到你开始重构代码！

### 启动器是什么？

启动器（Bootstrap）是一个在 UI 层运行的前置逻辑处理器，它的核心作用是：

1. **前置逻辑处理**：在应用渲染之前，执行必要的初始化逻辑
2. **状态管理**：通过 store 来管理应用状态，实现 UI 的响应式更新
3. **关注点分离**：将业务逻辑从 UI 组件中分离出来

#### 核心特性

- **异步执行**：基于 AsyncExecutor 实现异步逻辑处理
- **状态驱动**：通过 store 状态变化来触发 UI 更新
- **模块化**：支持 IOC 容器、环境变量注入、全局变量注入等模块

#### 工作流程

```
应用启动 → Bootstrap 初始化 → 执行前置逻辑 → 更新 Store → UI 响应更新
```

#### 与传统方式的对比

**传统方式**：

```tsx
// 组件中混合业务逻辑
function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // 业务逻辑混在组件中
    fetchData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  return <MainContent data={data} />;
}
```

**使用启动器**：

```tsx
// 组件只关注渲染
function App() {
  const { loading, data } = useStore(); // 从 store 获取状态

  if (loading) return <Loading />;
  return <MainContent data={data} />;
}

// 业务逻辑在启动器中处理
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

// 注册业务逻辑插件
bootstrap.use([
  IOC(UserService), // 用户认证服务
  new UserApiBootstarp(), // 用户 API 配置
  new FeApiBootstarp() // 其他 API 配置
]);

// 启动应用
await bootstrap.initialize();
await bootstrap.start();
```

**对比结果**：

- ✅ 组件变得简洁，只负责渲染
- ✅ 业务逻辑被分离到启动器中
- ✅ 可以独立测试业务逻辑
- ✅ 可以复用业务逻辑到其他 UI 框架

**完整的用户认证示例**：

```tsx
// 1. 定义用户 API 插件（配置 API 请求）
export class UserApiBootstarp implements BootstrapExecutorPlugin {
  readonly pluginName = 'UserApiBootstarp';

  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    // 配置用户 API 的插件
    ioc
      .get<UserApi>(UserApi)
      .usePlugin(new FetchURLPlugin())
      .usePlugin(IOC.get(IOCIdentifier.ApiMockPlugin))
      .usePlugin(IOC.get(RequestLogger));
  }
}

// 2. 定义用户服务（处理用户认证逻辑）
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

  // 在启动前检查用户认证状态
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

// 3. 在启动器中注册
const bootstrap = new Bootstrap({
  root: window,
  logger,
  ioc: { manager: IOC, register: new IocRegisterImpl({ pathname, appConfig }) },
  envOptions: { target: appConfig, source: import.meta.env, prefix: 'APP_' },
  globalOptions: { sources: globals, target: 'AppGlobals' }
});

// 注册用户认证相关插件
bootstrap.use([
  IOC(UserService), // 用户认证服务
  new UserApiBootstarp(), // 用户 API 配置
  IOC(I18nService) // 国际化服务
]);

// 4. 启动应用
await bootstrap.initialize();
await bootstrap.start();
```

**关键点**：

- `UserApiBootstarp`：负责配置 API 请求
- `UserService`：负责处理用户认证逻辑
- `Bootstrap`：统一管理所有插件
- 组件：只负责 UI 渲染

并且最关键的是，ui 和 逻辑可以独立存在，也就是说你可以根据这个逻辑实现多个不同的 UI

**可能你觉得使用class，对象来处理多此一举，但论软件设计，项目长远考虑，过去几十年发展时间已经告诉我们，这样是最容易让开发者理解和多人协作的模式**

### 启动器的优势

#### 1. **可测试性**

```tsx
// 可以独立测试业务逻辑
describe('UserService', () => {
  it('should authenticate user successfully', async () => {
    const userService = new UserService(mockUserApi, mockAppConfig);
    const result = await userService.onBefore();
    expect(result).toBeDefined();
  });
});
```

#### 2. **可复用性**

```tsx
// 同一个业务逻辑可以在不同 UI 框架中使用
// React 版本
const bootstrap = new Bootstrap({...});
bootstrap.use([IOC(UserService)]);

// Vue 版本
const bootstrap = new Bootstrap({...});
bootstrap.use([IOC(UserService)]); // 相同的业务逻辑

// 原生 JS 版本
const bootstrap = new Bootstrap({...});
bootstrap.use([IOC(UserService)]); // 相同的业务逻辑
```

#### 3. **可扩展性**

```tsx
// 轻松添加新的业务逻辑
bootstrap.use([
  IOC(UserService),
  IOC(PermissionService), // 新增权限服务
  IOC(NotificationService), // 新增通知服务
  IOC(AnalyticsService) // 新增统计服务
]);
```

#### 4. **团队协作**

- **前端开发者**：专注于 UI 组件和用户体验
- **后端开发者**：专注于 API 接口和数据处理
- **架构师**：专注于业务逻辑设计和系统架构
- **测试工程师**：可以独立测试各个模块

### 快速开始

如果你想要快速体验 Bootstrap，可以按照以下步骤：

#### 步骤 1：创建简单的插件

```tsx
// 创建一个简单的插件
export class SimplePlugin implements BootstrapExecutorPlugin {
  readonly pluginName = 'SimplePlugin';

  onBefore({ parameters: { logger } }: BootstrapContext): void {
    logger.info('SimplePlugin 启动成功！');
  }
}
```

#### 步骤 2：在启动器中注册

```tsx
const bootstrap = new Bootstrap({
  root: window,
  logger,
  ioc: { manager: IOC, register: new IocRegisterImpl({ pathname, appConfig }) }
});

// 注册插件
bootstrap.use([new SimplePlugin()]);

// 启动
await bootstrap.initialize();
await bootstrap.start();
```

#### 步骤 3：查看效果

打开浏览器控制台，你会看到 "SimplePlugin 启动成功！" 的日志。

**提示**：这个简单的例子展示了 Bootstrap 的基本用法。随着你对项目的了解，可以逐步添加更复杂的业务逻辑。

### 实际项目中的应用场景

#### 场景一：多端应用

```tsx
// Web 端
const webBootstrap = new Bootstrap({
  root: window
  // Web 特定配置
});
webBootstrap.use([IOC(UserService), IOC(WebSpecificService)]);

// 移动端 H5
const mobileBootstrap = new Bootstrap({
  root: window
  // 移动端特定配置
});
mobileBootstrap.use([IOC(UserService), IOC(MobileSpecificService)]);

// 小程序
const miniprogramBootstrap = new Bootstrap({
  root: globalThis
  // 小程序特定配置
});
miniprogramBootstrap.use([IOC(UserService), IOC(MiniprogramSpecificService)]);
```

#### 场景二：微前端架构

```tsx
// 主应用
const mainBootstrap = new Bootstrap({
  root: window
  // 主应用配置
});
mainBootstrap.use([IOC(GlobalUserService), IOC(RouterService)]);

// 子应用 A
const appABootstrap = new Bootstrap({
  root: window
  // 子应用 A 配置
});
appABootstrap.use([IOC(UserService), IOC(AppASpecificService)]);

// 子应用 B
const appBBootstrap = new Bootstrap({
  root: window
  // 子应用 B 配置
});
appBBootstrap.use([IOC(UserService), IOC(AppBSpecificService)]);
```

#### 场景三：渐进式升级

```tsx
// 旧版本：直接在组件中处理业务逻辑
function OldApp() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetchUser().then(setUser);
  }, []);
  return <div>{user?.name}</div>;
}

// 新版本：使用启动器分离关注点
function NewApp() {
  const { user } = useStore(); // 从启动器管理的 store 获取
  return <div>{user?.name}</div>;
}

// 可以同时存在，逐步迁移
const bootstrap = new Bootstrap({...});
bootstrap.use([IOC(UserService)]); // 新逻辑
// 旧逻辑仍然可以继续使用
```

### 最佳实践

#### 1. **插件设计原则**

```tsx
// ✅ 好的插件设计
export class GoodPlugin implements BootstrapExecutorPlugin {
  readonly pluginName = 'GoodPlugin';

  // 单一职责
  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    // 只做一件事：配置 API
    ioc.get<UserApi>(UserApi).usePlugin(new FetchURLPlugin());
  }
}

// ❌ 不好的插件设计
export class BadPlugin implements BootstrapExecutorPlugin {
  readonly pluginName = 'BadPlugin';

  // 做了太多事情
  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    // 配置 API
    ioc.get<UserApi>(UserApi).usePlugin(new FetchURLPlugin());
    // 处理路由
    ioc.get<RouterService>(RouterService).configure();
    // 处理主题
    ioc.get<ThemeService>(ThemeService).init();
    // 处理国际化
    ioc.get<I18nService>(I18nService).load();
  }
}
```

#### 2. **错误处理**

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
      // 优雅的错误处理
      this.store.authFailed(error);
      this.routerService.gotoLogin();
    }
  }
}
```

#### 3. **性能优化**

```tsx
// 条件加载插件
if (process.env.NODE_ENV === 'development') {
  bootstrap.use([IOC(DevToolsService)]);
}

// 按需加载插件
if (appConfig.features.analytics) {
  bootstrap.use([IOC(AnalyticsService)]);
}
```

### 总结

Bootstrap 启动器不仅仅是一个技术实现，更是一种架构思想。它帮助我们：

1. **分离关注点**：UI 和业务逻辑分离
2. **提高可维护性**：模块化设计，易于理解和修改
3. **增强可测试性**：每个模块都可以独立测试
4. **支持团队协作**：不同角色可以专注于自己的领域
5. **适应变化**：业务逻辑变化不影响 UI，UI 变化不影响业务逻辑

这种设计模式在现代前端开发中变得越来越重要，特别是在大型项目和团队协作中。
