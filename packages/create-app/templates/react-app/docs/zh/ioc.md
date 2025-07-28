# IOC 容器

## 什么是 IOC？

IOC（Inversion of Control，控制反转）是一种设计模式，它将对象的创建和依赖关系的管理交给容器来处理，而不是在代码中直接创建对象。

**简单来说**：就像工厂生产产品一样，你不需要知道产品是如何制造的，只需要告诉工厂你需要什么产品，工厂就会给你提供。

## 项目中的 IOC 实现

### 核心技术栈

- **InversifyJS**：作为 IOC 容器的实现(你也可以手动实现自己的容器)
- **TypeScript**：提供类型安全
- **装饰器模式**：使用 `@injectable()` 和 `@inject()` 装饰器

### 核心文件结构

```
config/
├── IOCIdentifier.ts          # IOC 标识符定义
src/
├── core/
│   ├── IOC.ts                    # IOC 主入口
│   ├── registers/                 # 注册器目录
│   │   ├── RegisterGlobals.ts    # 全局服务注册
│   │   ├── RegisterCommon.ts     # 通用服务注册
│   │   └── RegisterControllers.ts # 控制器注册
│   └── globals.ts                # 全局实例
├── base/
│   └── cases/
│       └── InversifyContainer.ts # Inversify 容器实现
```

## 基本概念

### 1. IOC 标识符

```tsx
// config/IOCIdentifier.ts
export const IOCIdentifier = Object.freeze({
  JSON: 'JSON',
  LocalStorage: 'LocalStorage',
  Logger: 'Logger',
  AppConfig: 'AppConfig'
  // ... 更多标识符
});
```

### 2. IOC 标识符映射

```tsx
// core/IOC.ts
export interface IOCIdentifierMap {
  [IOCIdentifier.JSON]: import('@qlover/fe-corekit').JSONSerializer;
  [IOCIdentifier.LocalStorage]: import('@qlover/fe-corekit').ObjectStorage<
    string,
    string
  >;
  [IOCIdentifier.Logger]: import('@qlover/logger').LoggerInterface;
  [IOCIdentifier.AppConfig]: import('@qlover/corekit-bridge').EnvConfigInterface;
  // ... 更多映射
}
```

### 3. IOC 函数

```tsx
// core/IOC.ts
export const IOC = createIOCFunction<IOCIdentifierMap>(
  new InversifyContainer()
);
```

## 使用方法

### 1. 获取服务实例

```tsx
// 使用类名获取
const userService = IOC(UserService);

// 使用字符串标识符获取
const logger = IOC('Logger');
// 或者
const logger = IOC(IOCIdentifier.Logger);

// 使用 AppConfig
const appConfig = IOC(IOCIdentifier.AppConfig);
```

### 2. 在服务中使用依赖注入

```tsx
import { inject, injectable } from 'inversify';
import { UserApi } from '@/base/apis/userApi/UserApi';
import { RouteService } from './RouteService';
import { IOCIdentifier } from '@config/IOCIdentifier';

@injectable()
export class UserService extends UserAuthService<UserInfo> {
  constructor(
    @inject(RouteService) protected routerService: RouteService,
    @inject(UserApi) userApi: UserAuthApiInterface<UserInfo>,
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
}
```

### 3. 在 Bootstrap 中使用

```tsx
// 在启动器中注册服务
bootstrap.use([
  IOC(UserService), // 用户服务
  IOC(I18nService), // 国际化服务
  new UserApiBootstarp() // API 配置
]);
```

## 服务注册

### 1. 全局服务注册

```tsx
// core/registers/RegisterGlobals.ts
export const RegisterGlobals: IOCRegister = {
  register(container, _, options): void {
    // 注册应用配置
    container.bind(IOCIdentifier.AppConfig, options!.appConfig);

    // 注册日志服务
    container.bind(Logger, logger);
    container.bind(IOCIdentifier.Logger, logger);

    // 注册存储服务
    container.bind(IOCIdentifier.LocalStorage, localStorage);
    container.bind(IOCIdentifier.LocalStorageEncrypt, localStorageEncrypt);
    container.bind(IOCIdentifier.CookieStorage, cookieStorage);
  }
};
```

### 2. 通用服务注册

```tsx
// core/registers/RegisterCommon.ts
export const RegisterCommon: IOCRegister = {
  register(container, _, options): void {
    const AppConfig = container.get(IOCIdentifier.AppConfig);

    // 注册 API 相关服务
    const feApiToken = new TokenStorage(AppConfig.userTokenStorageKey, {
      storage: container.get(IOCIdentifier.LocalStorageEncrypt)
    });

    container.bind(IOCIdentifier.FeApiToken, feApiToken);
    container.bind(IOCIdentifier.FeApiCommonPlugin, feApiRequestCommonPlugin);

    // 注册主题服务
    container.bind(
      ThemeService,
      new ThemeService({
        ...themeConfig,
        storage: localStorage
      })
    );

    // 注册路由服务
    container.bind(
      RouteService,
      new RouteService({
        routes: baseRoutes,
        logger
      })
    );

    // 注册国际化服务
    container.bind(I18nService, new I18nService(options!.pathname));
  }
};
```

### 3. 控制器注册

```tsx
// core/registers/RegisterControllers.ts
export class RegisterControllers implements IOCRegister {
  register(
    container: IOCContainer,
    _: IOCManagerInterface<IOCContainer>
  ): void {
    // 注册控制器
    const jsonStorageController = new JSONStorageController(localStorage);
    container.bind(JSONStorageController, jsonStorageController);

    // 配置处理器
    container
      .get(ProcesserExecutor)
      .use(container.get(I18nKeyErrorPlugin))
      .use(container.get(UserService));
  }
}
```

## 实际应用场景

### 1. 用户认证服务

```tsx
@injectable()
export class UserService extends UserAuthService<UserInfo> {
  constructor(
    @inject(RouteService) protected routerService: RouteService,
    @inject(UserApi) userApi: UserAuthApiInterface<UserInfo>,
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
```

### 2. API 配置服务

```tsx
export class UserApiBootstarp implements BootstrapExecutorPlugin {
  readonly pluginName = 'UserApiBootstarp';

  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    // 通过 IOC 获取 UserApi 实例并配置插件
    ioc
      .get<UserApi>(UserApi)
      .usePlugin(new FetchURLPlugin())
      .usePlugin(IOC.get(IOCIdentifier.ApiMockPlugin))
      .usePlugin(IOC.get(RequestLogger));
  }
}
```

### 3. 在组件中使用

```tsx
// 在 React 组件中使用 IOC 服务
function UserProfile() {
  const userService = IOC(UserService);
  const { user } = useStore(userService.store);

  return (
    <div>
      <h1>欢迎, {user?.name}</h1>
      <button onClick={() => userService.logout()}>退出登录</button>
    </div>
  );
}
```

## 最佳实践

### 1. 服务设计原则

```tsx
// ✅ 好的设计：单一职责
@injectable()
export class UserService {
  constructor(
    @inject(UserApi) private userApi: UserApi,
    @inject(IOCIdentifier.AppConfig) private appConfig: AppConfig
  ) {}
  async getUserInfo(): Promise<UserInfo> {
    return this.userApi.getUserInfo();
  }
}

// ❌ 不好的设计：职责过多
@injectable()
export class BadService {
  constructor(
    @inject(UserApi) private userApi: UserApi,
    @inject(RouteService) private routeService: RouteService,
    @inject(ThemeService) private themeService: ThemeService,
    @inject(I18nService) private i18nService: I18nService
  ) {}
  // 一个服务做了太多事情
  async handleUserAction(): Promise<void> {
    // 处理用户逻辑
    // 处理路由逻辑
    // 处理主题逻辑
    // 处理国际化逻辑
  }
}
```

### 2. 依赖注入的最佳实践

```tsx
// ✅ 使用接口而不是具体实现
@injectable()
export class UserService {
  constructor(
    @inject('UserApiInterface') private userApi: UserAuthApiInterface<UserInfo>
  ) {}
}

// ✅ 使用标识符而不是类名
@injectable()
export class SomeService {
  constructor(
    @inject(IOCIdentifier.Logger) private logger: LoggerInterface,
    @inject(IOCIdentifier.AppConfig) private appConfig: AppConfig
  ) {}
}
```

### 3. 错误处理

```tsx
@injectable()
export class SafeService {
  constructor(@inject(IOCIdentifier.Logger) private logger: LoggerInterface) {}

  async doSomething(): Promise<void> {
    try {
      // 业务逻辑
    } catch (error) {
      this.logger.error('操作失败:', error);
      throw error;
    }
  }
}
```

## 调试和测试

### 1. 调试 IOC 容器

```tsx
// 检查服务是否已注册
const container = IOC.implemention;
const isRegistered = container.isBound(UserService);

// 获取所有已注册的服务
const bindings = container.getAll(UserService);
```

### 2. 单元测试

```tsx
import { Container } from 'inversify';

describe('UserService', () => {
  let container: Container;
  let userService: UserService;

  beforeEach(() => {
    container = new Container();

    // 注册测试依赖
    container.bind('UserApiInterface').toConstantValue(mockUserApi);
    container.bind(IOCIdentifier.AppConfig).toConstantValue(mockAppConfig);
    container
      .bind(IOCIdentifier.LocalStorageEncrypt)
      .toConstantValue(mockStorage);

    userService = container.get(UserService);
  });

  it('should authenticate user successfully', async () => {
    const result = await userService.onBefore();
    expect(result).toBeDefined();
  });
});
```

## 总结

IOC 容器在项目中的作用：

1. **依赖管理**：统一管理所有服务的依赖关系
2. **类型安全**：通过 TypeScript 提供编译时类型检查
3. **可测试性**：便于进行单元测试和模拟
4. **可维护性**：清晰的依赖关系，易于理解和修改
5. **可扩展性**：轻松添加新的服务和依赖

通过合理使用 IOC 容器，可以让代码更加模块化、可测试和可维护。
