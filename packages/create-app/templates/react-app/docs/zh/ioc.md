# IOC 容器 (依赖注入)

## 📋 目录

- [核心理念](#-核心理念) - UI 分离，逻辑独立
- [什么是 IOC](#-什么是-ioc) - 控制反转
- [为什么需要 IOC](#-为什么需要-ioc) - 解决的核心问题
- [两个关键问题](#-两个关键问题) - 为什么需要接口？为什么简单组件也要分离？
- [项目中的实现](#-项目中的实现) - Bootstrap 集成
- [使用方式](#-使用方式) - 实战指南
- [测试](#-测试) - 独立测试和组合测试
- [最佳实践](#-最佳实践) - 8 条核心实践
- [常见问题](#-常见问题) - FAQ

---

## 🎯 核心理念

> **🚨 重要原则：UI 就是 UI，逻辑就是逻辑，两者必须分离！**

> **⭐ 核心优势：UI 和逻辑可以独立测试，也可以组合测试！**

### 核心概念

```
┌─────────────────────────────────────────┐
│  传统方式：UI 和逻辑混在一起             │
│                                         │
│  Component (组件)                        │
│  ├── UI 渲染                             │
│  ├── 业务逻辑                            │
│  ├── API 调用                            │
│  ├── 状态管理                            │
│  └── 数据处理                            │
│                                         │
│  ❌ 问题：                               │
│  - 难以测试（需要渲染组件）              │
│  - 逻辑无法复用                          │
│  - 职责不清晰                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  IOC 方式：UI 和逻辑完全分离             │
│                                         │
│  Component (UI 层)                       │
│  └── 只负责渲染                          │
│       ↓ 通过 IOC 获取                    │
│  Service (逻辑层)                        │
│  ├── 业务逻辑                            │
│  ├── API 调用                            │
│  ├── 状态管理                            │
│  └── 数据处理                            │
│                                         │
│  ✅ 优势：                               │
│  - UI 和逻辑可以独立测试                 │
│  - 逻辑可以复用                          │
│  - 职责清晰                              │
└─────────────────────────────────────────┘
```

---

## 🔄 什么是 IOC

IOC（Inversion of Control，控制反转）= **不要自己 new，让容器帮你创建和管理对象**

### 传统方式 vs IOC

```typescript
// ❌ 传统方式：自己创建依赖（强耦合）
class UserComponent {
  private userService = new UserService();  // 自己 new
  private storage = new LocalStorage();      // 自己 new
  private api = new UserApi();               // 自己 new

  async loadUser() {
    return await this.userService.getUser();
  }
}

// 问题：
// 1. UserComponent 依赖具体的实现类
// 2. 无法替换 UserService 的实现
// 3. 测试时无法 mock UserService
// 4. UserService 的依赖需要手动创建


// ✅ IOC 方式：容器注入依赖（松耦合）
function UserComponent() {
  // 从 IOC 容器获取服务
  const userService = useIOC('UserServiceInterface');  // 容器提供

  async function loadUser() {
    return await userService.getUser();
  }

  // UI 只负责渲染
  return <div>...</div>;
}

// 优势：
// 1. UserComponent 依赖接口，不依赖实现
// 2. 可以轻松替换 UserService 的实现
// 3. 测试时可以 mock UserService
// 4. UserService 的依赖由容器管理
```

### 类比理解

```
传统方式 = 自己做饭
- 需要买菜（创建依赖）
- 需要做饭（管理生命周期）
- 需要洗碗（清理资源）

IOC 方式 = 去餐厅
- 点菜（告诉容器需要什么）
- 等待上菜（容器提供服务）
- 不需要关心厨房的事（依赖管理由容器负责）
```

---

## 🤔 为什么需要 IOC

### 核心问题：UI 和逻辑混在一起

#### ❌ 问题示例：没有 UI 分离

```typescript
// ❌ 传统组件：UI 和逻辑混在一起
function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 😰 业务逻辑混在组件中
  useEffect(() => {
    setLoading(true);

    // 😰 API 调用在组件中
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        // 😰 数据处理在组件中
        const processedData = {
          ...data,
          fullName: `${data.firstName} ${data.lastName}`
        };
        setUser(processedData);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  // 😰 更多业务逻辑
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // UI 渲染
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{user?.fullName}</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

// 😰😰😰 问题总结：
// 1. UI 和逻辑混在一起，难以维护
// 2. 逻辑无法复用（如果另一个组件也需要用户信息怎么办？）
// 3. 难以测试（需要渲染组件才能测试业务逻辑）
// 4. 职责不清晰（组件做了太多事）
// 5. 无法单独测试逻辑（必须通过 UI 测试）
```

#### ✅ 解决方案：IOC + UI 分离

```typescript
// ✅ 步骤 1：定义接口（Port）
export interface UserServiceInterface {
  getUser(): Promise<UserInfo>;
  logout(): Promise<void>;
  isAuthenticated(): boolean;
}

// ✅ 步骤 2：实现服务（逻辑层）
@injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @inject(UserApi) private api: UserApi,
    @inject(IOCIdentifier.AppConfig) private config: AppConfig,
    @inject(IOCIdentifier.LocalStorageEncrypt) private storage: Storage,
    @inject(IOCIdentifier.RouteServiceInterface) private router: RouteService
  ) {}

  // 纯逻辑：获取用户信息
  async getUser(): Promise<UserInfo> {
    const data = await this.api.getUserInfo();

    // 数据处理
    return {
      ...data,
      fullName: `${data.firstName} ${data.lastName}`
    };
  }

  // 纯逻辑：退出登录
  async logout(): Promise<void> {
    this.storage.removeItem(this.config.userTokenStorageKey);
    this.storage.removeItem(this.config.userInfoStorageKey);
    await this.router.push('/login');
  }

  isAuthenticated(): boolean {
    return !!this.storage.getItem(this.config.userTokenStorageKey);
  }
}

// ✅ 步骤 3：UI 组件（UI 层）
function UserProfile() {
  // 从 IOC 容器获取服务
  const userService = useIOC('UserServiceInterface');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // ✅ UI 只调用服务，不包含业务逻辑
    userService.getUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  // ✅ UI 只负责渲染和事件绑定
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user?.fullName}</h1>
      <button onClick={() => userService.logout()}>Logout</button>
    </div>
  );
}

// ✅✅✅ 优势总结：
// 1. UI 和逻辑完全分离，职责清晰
// 2. 逻辑可以复用（其他组件也可以使用 UserService）
// 3. 易于测试（可以独立测试 UserService，不需要渲染 UI）
// 4. 易于维护（修改逻辑不影响 UI，修改 UI 不影响逻辑）
// 5. 可以单独测试逻辑（不依赖 UI）
```

### 对比总结

| 特性           | 没有 UI 分离                | IOC + UI 分离               |
| -------------- | --------------------------- | --------------------------- |
| **职责清晰度** | ❌ UI 和逻辑混在一起        | ✅ UI 只负责渲染，逻辑独立  |
| **可测试性**   | ❌ 必须渲染组件才能测试     | ✅ 逻辑可以独立测试         |
| **可复用性**   | ❌ 逻辑无法复用             | ✅ 逻辑可以在多个组件中复用 |
| **可维护性**   | ❌ 修改逻辑影响 UI          | ✅ UI 和逻辑独立修改        |
| **测试速度**   | ❌ 慢（需要渲染 UI）        | ✅ 快（纯逻辑测试）         |
| **测试复杂度** | ❌ 高（需要 mock 很多东西） | ✅ 低（只需 mock 接口）     |

---

## ❓ 两个关键问题

### 问题 1：为什么一个实现类也需要一个接口？

很多开发者会问："如果 `UserService` 只有一个实现类，为什么还要定义 `UserServiceInterface` 接口？"

#### 答案：为了可测试性和灵活性

```typescript
// ❌ 没有接口：难以测试
class UserComponent {
  constructor(
    @inject(UserService) private userService: UserService // 依赖具体实现
  ) {}
}

// 测试时：
describe('UserComponent', () => {
  it('should load user', () => {
    // ❌ 问题：无法 mock UserService
    // UserService 有很多依赖（API、Storage、Router 等）
    // 需要创建所有这些依赖才能创建 UserService

    const userApi = new UserApi(); // 需要创建
    const storage = new Storage(); // 需要创建
    const router = new Router(); // 需要创建
    const config = new AppConfig(); // 需要创建

    const userService = new UserService(userApi, config, storage, router);
    const component = new UserComponent(userService);

    // 😰 太复杂了！
  });
});

// ✅ 有接口：易于测试
class UserComponent {
  constructor(
    @inject('UserServiceInterface') // 依赖接口
    private userService: UserServiceInterface
  ) {}
}

// 测试时：
describe('UserComponent', () => {
  it('should load user', () => {
    // ✅ 只需要 mock 接口
    const mockUserService: UserServiceInterface = {
      getUser: jest.fn().mockResolvedValue({ name: 'John' }),
      logout: jest.fn(),
      isAuthenticated: jest.fn().mockReturnValue(true)
    };

    const component = new UserComponent(mockUserService);

    // ✅ 简单清晰！
  });
});
```

**关键优势：**

1. **测试简单** - 只需 mock 接口方法，不需要创建真实依赖
2. **隔离性** - 测试 UserComponent 时不需要关心 UserService 的实现细节
3. **灵活性** - 将来可以轻松替换实现（如添加 MockUserService、CacheUserService 等）
4. **解耦** - 组件只依赖接口，不依赖具体实现

**即使只有一个实现类，接口也是必需的，因为：**

- ✅ 测试时需要 mock
- ✅ 将来可能有新的实现
- ✅ 组件不应该依赖具体实现
- ✅ 接口是契约，实现是细节

### 问题 2：为什么一个简单的 UI 组件也需要 UI 分离？

很多开发者会问："我的组件很简单，只是显示一个用户名，为什么还要分离？"

#### 答案：为了可测试性和未来的扩展性

```typescript
// ❌ 简单组件，没有分离
function UserName() {
  const [name, setName] = useState('');

  useEffect(() => {
    // 😰 即使很简单，逻辑也混在 UI 中
    fetch('/api/user')
      .then(res => res.json())
      .then(data => setName(data.name));
  }, []);

  return <span>{name}</span>;
}

// 问题：
// 1. 无法测试逻辑（必须渲染组件）
// 2. 如果逻辑变复杂了怎么办？（加缓存、加错误处理等）
// 3. 如果其他组件也需要用户名怎么办？（复制粘贴？）


// ✅ 简单组件，但有分离
// 1. 服务（逻辑层）
@injectable()
export class UserService implements UserServiceInterface {
  constructor(@inject(UserApi) private api: UserApi) {}

  async getUserName(): Promise<string> {
    const user = await this.api.getUserInfo();
    return user.name;
  }
}

// 2. UI 组件（UI 层）
function UserName() {
  const userService = useIOC('UserServiceInterface');
  const [name, setName] = useState('');

  useEffect(() => {
    userService.getUserName().then(setName);
  }, []);

  return <span>{name}</span>;
}

// 优势：
// 1. ✅ 可以独立测试 getUserName 逻辑
// 2. ✅ 将来逻辑变复杂时，只需修改 UserService
// 3. ✅ 其他组件可以复用 UserService
// 4. ✅ UI 组件保持简单，只负责渲染
```

**关键场景：逻辑逐步变复杂**

```typescript
// ❌ 没有分离：逻辑变复杂后，组件变得臃肿
function UserName() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    // 😰 加缓存
    const cached = localStorage.getItem('userName');
    if (cached) {
      setName(cached);
      setLoading(false);
      return;
    }

    // 😰 加错误处理
    fetch('/api/user')
      .then(res => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then(data => {
        setName(data.name);
        localStorage.setItem('userName', data.name);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  // 😰 组件变复杂了
  if (loading) return <span>Loading...</span>;
  if (error) return <span>Error</span>;
  return <span>{name}</span>;
}


// ✅ 有分离：逻辑变复杂后，只需修改服务
@injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @inject(UserApi) private api: UserApi,
    @inject(IOCIdentifier.LocalStorageEncrypt) private storage: Storage
  ) {}

  // ✅ 逻辑在服务中，清晰明了
  async getUserName(): Promise<string> {
    // 缓存逻辑
    const cached = this.storage.getItem('userName');
    if (cached) return cached;

    // API 调用
    const user = await this.api.getUserInfo();

    // 缓存
    this.storage.setItem('userName', user.name);

    return user.name;
  }
}

// ✅ UI 组件保持简单
function UserName() {
  const userService = useIOC('UserServiceInterface');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    userService.getUserName()
      .then(setName)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <span>Loading...</span>;
  return <span>{name}</span>;
}
```

**总结：即使组件很简单，也要分离，因为：**

- ✅ **现在简单，不代表将来简单** - 需求会变化
- ✅ **逻辑可以复用** - 其他组件可能也需要
- ✅ **易于测试** - 逻辑可以独立测试
- ✅ **职责清晰** - UI 只负责渲染，逻辑独立
- ✅ **易于维护** - 修改逻辑不影响 UI

---

## 🛠️ 项目中的实现

### 1. 文件结构

```
src/
├── base/
│   ├── port/                    # 接口定义层
│   │   ├── UserServiceInterface.ts
│   │   ├── I18nServiceInterface.ts
│   │   └── RouteServiceInterface.ts
│   └── services/                # 服务实现层
│       ├── UserService.ts
│       ├── I18nService.ts
│       └── RouteService.ts
├── core/
│   ├── clientIoc/
│   │   ├── ClientIOC.ts         # IOC 容器
│   │   └── ClientIOCRegister.ts # 注册器
│   └── globals.ts               # 全局实例
├── uikit/
│   ├── hooks/
│   │   └── useIOC.ts            # React Hook
│   └── contexts/
│       └── IOCContext.tsx       # React Context
└── config/
    └── IOCIdentifier.ts         # 标识符定义

```

### 2. IOC 标识符定义

```typescript
// config/IOCIdentifier.ts
export interface IOCIdentifierMap {
  AppConfig: AppConfig;
  Logger: LoggerInterface;
  LocalStorageEncrypt: SyncStorageInterface<string, string>;
  UserServiceInterface: UserServiceInterface;
  I18nServiceInterface: I18nServiceInterface;
  RouteServiceInterface: RouteServiceInterface;
}

export const IOCIdentifier = {
  AppConfig: 'AppConfig',
  Logger: 'Logger',
  LocalStorageEncrypt: 'LocalStorageEncrypt',
  UserServiceInterface: 'UserServiceInterface',
  I18nServiceInterface: 'I18nServiceInterface',
  RouteServiceInterface: 'RouteServiceInterface'
} as const;
```

### 3. 服务注册

```typescript
// src/core/clientIoc/ClientIOCRegister.ts
export class ClientIOCRegister implements IOCRegisterInterface {
  constructor(protected options: IocRegisterOptions) {}

  /**
   * 注册全局服务
   */
  protected registerGlobals(ioc: IOCContainerInterface): void {
    const { appConfig } = this.options;
    const { dialogHandler, localStorageEncrypt, JSON, logger } = globals;

    // ✅ 注册全局实例
    ioc.bind(IOCIdentifier.JSONSerializer, JSON);
    ioc.bind(IOCIdentifier.Logger, logger);
    ioc.bind(IOCIdentifier.AppConfig, appConfig);
    ioc.bind(IOCIdentifier.LocalStorageEncrypt, localStorageEncrypt);
  }

  /**
   * 注册业务服务
   */
  protected registerImplement(ioc: IOCContainerInterface): void {
    // ✅ 注册服务实现
    ioc.bind(
      IOCIdentifier.I18nServiceInterface,
      new I18nService(this.options.pathname)
    );

    ioc.bind(IOCIdentifier.RouteServiceInterface, new RouteService(/* ... */));

    // ✅ 服务可以依赖其他服务
    ioc.bind(IOCIdentifier.UserServiceInterface, ioc.get(UserService));
  }

  /**
   * 注册入口
   */
  register(ioc: IOCContainerInterface): void {
    this.registerGlobals(ioc);
    this.registerImplement(ioc);
  }
}
```

### 4. 创建 IOC 容器

```typescript
// src/core/clientIoc/ClientIOC.ts
import { createIOCFunction } from '@qlover/corekit-bridge';
import { InversifyContainer } from '@/base/cases/InversifyContainer';
import { ClientIOCRegister } from './ClientIOCRegister';

export const clientIOC = {
  create(options: IocRegisterOptions) {
    // 创建容器
    const container = new InversifyContainer();

    // 创建 IOC 函数
    const IOC = createIOCFunction(container);

    // 注册服务
    const register = new ClientIOCRegister(options);
    register.register(container, IOC);

    return IOC;
  }
};
```

### 5. Bootstrap 中初始化

```typescript
// src/core/bootstraps/BootstrapClient.ts
export class BootstrapClient {
  static async main(args: BootstrapClientArgs) {
    const { root, bootHref, ioc } = args;

    // ✅ 创建 IOC 容器
    const IOC = ioc.create({
      pathname: bootHref,
      appConfig: appConfig
    });

    // Bootstrap 中使用 IOC
    const bootstrap = new Bootstrap({
      root,
      logger,
      ioc: {
        manager: IOC,
        register: iocRegister
      }
    });

    await bootstrap.initialize();
    await bootstrap.start();
  }
}
```

---

## 📝 使用方式

### 1. 定义接口（Port）

```typescript
// src/base/port/UserServiceInterface.ts
export interface UserServiceInterface {
  getUser(): Promise<UserInfo>;
  login(username: string, password: string): Promise<void>;
  logout(): Promise<void>;
  isAuthenticated(): boolean;
}
```

### 2. 实现服务

```typescript
// src/base/services/UserService.ts
import { injectable, inject } from 'inversify';

@injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @inject(UserApi) private api: UserApi,
    @inject(IOCIdentifier.AppConfig) private config: AppConfig,
    @inject(IOCIdentifier.LocalStorageEncrypt) private storage: Storage,
    @inject(IOCIdentifier.RouteServiceInterface) private router: RouteService
  ) {}

  async getUser(): Promise<UserInfo> {
    const token = this.storage.getItem(this.config.userTokenStorageKey);
    if (!token) throw new Error('No token');

    return await this.api.getUserInfo(token);
  }

  async login(username: string, password: string): Promise<void> {
    const response = await this.api.login({ username, password });
    this.storage.setItem(this.config.userTokenStorageKey, response.token);
  }

  async logout(): Promise<void> {
    this.storage.removeItem(this.config.userTokenStorageKey);
    await this.router.push('/login');
  }

  isAuthenticated(): boolean {
    return !!this.storage.getItem(this.config.userTokenStorageKey);
  }
}
```

### 3. 在 UI 组件中使用

```typescript
// src/pages/UserProfile.tsx
import { useIOC } from '@/uikit/hooks/useIOC';

function UserProfile() {
  // ✅ 从 IOC 容器获取服务
  const userService = useIOC('UserServiceInterface');
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    userService.getUser().then(setUser);
  }, []);

  const handleLogout = () => {
    userService.logout();
  };

  // ✅ UI 只负责渲染
  return (
    <div>
      <h1>{user?.name}</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

### 4. 在服务中使用其他服务

```typescript
// src/base/services/ProfileService.ts
@injectable()
export class ProfileService {
  constructor(
    // ✅ 服务可以依赖其他服务
    @inject(IOCIdentifier.UserServiceInterface)
    private userService: UserServiceInterface,
    @inject(IOCIdentifier.I18nServiceInterface)
    private i18n: I18nServiceInterface
  ) {}

  async getUserProfile(): Promise<string> {
    const user = await this.userService.getUser();
    return this.i18n.t('profile.welcome', { name: user.name });
  }
}
```

---

## 🧪 测试

### 核心优势：UI 和逻辑可以独立测试，也可以组合测试

#### 1. 独立测试逻辑（不需要 UI）

```typescript
// __tests__/src/base/services/UserService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '@/base/services/UserService';

describe('UserService (逻辑测试)', () => {
  let userService: UserService;
  let mockApi: any;
  let mockStorage: any;
  let mockRouter: any;
  let mockConfig: any;

  beforeEach(() => {
    // ✅ 只需 mock 接口
    mockApi = {
      getUserInfo: vi.fn(),
      login: vi.fn()
    };

    mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };

    mockRouter = {
      push: vi.fn()
    };

    mockConfig = {
      userTokenStorageKey: '__test_token__'
    };

    // ✅ 创建服务
    userService = new UserService(mockApi, mockConfig, mockStorage, mockRouter);
  });

  it('should get user when token exists', async () => {
    // ✅ 设置 mock 返回值
    mockStorage.getItem.mockReturnValue('test-token');
    mockApi.getUserInfo.mockResolvedValue({ name: 'John' });

    // ✅ 测试逻辑
    const user = await userService.getUser();

    // ✅ 验证结果
    expect(user.name).toBe('John');
    expect(mockStorage.getItem).toHaveBeenCalledWith('__test_token__');
    expect(mockApi.getUserInfo).toHaveBeenCalledWith('test-token');
  });

  it('should throw error when no token', async () => {
    // ✅ 测试错误场景
    mockStorage.getItem.mockReturnValue(null);

    await expect(userService.getUser()).rejects.toThrow('No token');
  });

  it('should login and save token', async () => {
    // ✅ 测试登录逻辑
    mockApi.login.mockResolvedValue({ token: 'new-token' });

    await userService.login('user', 'pass');

    expect(mockApi.login).toHaveBeenCalledWith({
      username: 'user',
      password: 'pass'
    });
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      '__test_token__',
      'new-token'
    );
  });

  it('should logout and clear token', async () => {
    // ✅ 测试登出逻辑
    await userService.logout();

    expect(mockStorage.removeItem).toHaveBeenCalledWith('__test_token__');
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });
});

// ✅✅✅ 优势：
// 1. 不需要渲染 UI
// 2. 测试运行快（纯逻辑）
// 3. 易于 mock（只需 mock 接口）
// 4. 可以测试所有边界情况
```

#### 2. 独立测试 UI（不需要真实逻辑）

```typescript
// __tests__/src/pages/UserProfile.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { UserProfile } from '@/pages/UserProfile';
import { IOCProvider } from '@/uikit/contexts/IOCContext';

describe('UserProfile (UI 测试)', () => {
  it('should display user name', async () => {
    // ✅ Mock 服务
    const mockUserService = {
      getUser: vi.fn().mockResolvedValue({ name: 'John Doe' }),
      logout: vi.fn(),
      isAuthenticated: vi.fn().mockReturnValue(true)
    };

    const mockIOC = (identifier: string) => {
      if (identifier === 'UserServiceInterface') return mockUserService;
    };

    // ✅ 渲染组件
    render(
      <IOCProvider value={mockIOC}>
        <UserProfile />
      </IOCProvider>
    );

    // ✅ 验证 UI
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should call logout when button clicked', async () => {
    const mockUserService = {
      getUser: vi.fn().mockResolvedValue({ name: 'John' }),
      logout: vi.fn(),
      isAuthenticated: vi.fn().mockReturnValue(true)
    };

    const mockIOC = (identifier: string) => {
      if (identifier === 'UserServiceInterface') return mockUserService;
    };

    render(
      <IOCProvider value={mockIOC}>
        <UserProfile />
      </IOCProvider>
    );

    // ✅ 模拟用户操作
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    // ✅ 验证服务调用
    expect(mockUserService.logout).toHaveBeenCalled();
  });
});

// ✅✅✅ 优势：
// 1. 不需要真实的服务实现
// 2. 可以轻松模拟各种场景
// 3. UI 测试专注于 UI 逻辑
```

#### 3. 组合测试（UI + 逻辑）

```typescript
// __tests__/src/integration/UserFlow.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { UserProfile } from '@/pages/UserProfile';
import { UserService } from '@/base/services/UserService';
import { IOCProvider } from '@/uikit/contexts/IOCContext';

describe('User Flow (组合测试)', () => {
  it('should complete user login flow', async () => {
    // ✅ 使用真实的服务实现
    const mockApi = {
      getUserInfo: vi.fn().mockResolvedValue({ name: 'John' }),
      login: vi.fn().mockResolvedValue({ token: 'test-token' })
    };

    const mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };

    const mockRouter = { push: vi.fn() };
    const mockConfig = { userTokenStorageKey: '__token__' };

    // ✅ 创建真实服务
    const userService = new UserService(
      mockApi,
      mockConfig,
      mockStorage,
      mockRouter
    );

    const mockIOC = (identifier: string) => {
      if (identifier === 'UserServiceInterface') return userService;
    };

    // ✅ 渲染真实 UI
    render(
      <IOCProvider value={mockIOC}>
        <UserProfile />
      </IOCProvider>
    );

    // ✅ 测试完整流程
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    // ✅ 点击登出
    fireEvent.click(screen.getByText('Logout'));

    // ✅ 验证整个流程
    expect(mockStorage.removeItem).toHaveBeenCalledWith('__token__');
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });
});

// ✅✅✅ 优势：
// 1. 测试真实的用户流程
// 2. 可以发现 UI 和逻辑的集成问题
// 3. 更接近真实使用场景
```

### 测试策略总结

```
┌─────────────────────────────────────────┐
│  测试金字塔                              │
│                                         │
│      △ UI 测试 (少量)                    │
│     ╱ ╲                                 │
│    ╱   ╲                                │
│   ╱     ╲                               │
│  ╱───────╲ 组合测试 (适量)              │
│ ╱         ╲                             │
│╱═══════════╲ 逻辑测试 (大量)            │
│                                         │
│  逻辑测试：快速、稳定、覆盖全面          │
│  组合测试：验证集成、发现问题            │
│  UI 测试：验证用户交互                   │
└─────────────────────────────────────────┘
```

**推荐测试比例：**

- 70% 逻辑测试（UserService.test.ts）
- 20% 组合测试（UserFlow.test.tsx）
- 10% UI 测试（UserProfile.test.tsx）

---

## 💎 最佳实践

### 1. ✅ 始终定义接口

```typescript
// ✅ 好的做法：先定义接口
export interface UserServiceInterface {
  getUser(): Promise<UserInfo>;
  logout(): Promise<void>;
}

// 然后实现
@injectable()
export class UserService implements UserServiceInterface {
  // ...
}

// ❌ 不好的做法：直接写实现
@injectable()
export class UserService {
  // 没有接口，难以测试
}
```

### 2. ✅ UI 和逻辑完全分离

```typescript
// ✅ 好的做法：UI 只负责渲染
function UserProfile() {
  const userService = useIOC('UserServiceInterface');
  const [user, setUser] = useState(null);

  useEffect(() => {
    userService.getUser().then(setUser);
  }, []);

  return <div>{user?.name}</div>;
}

// ❌ 不好的做法：逻辑混在 UI 中
function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(setUser);
  }, []);

  return <div>{user?.name}</div>;
}
```

### 3. ✅ 使用依赖注入

```typescript
// ✅ 好的做法：通过构造函数注入
@injectable()
export class UserService {
  constructor(
    @inject(UserApi) private api: UserApi,
    @inject(IOCIdentifier.AppConfig) private config: AppConfig
  ) {}
}

// ❌ 不好的做法：直接创建依赖
export class UserService {
  private api = new UserApi();
  private config = new AppConfig();
}
```

### 4. ✅ 服务单一职责

```typescript
// ✅ 好的做法：每个服务只负责一件事
@injectable()
export class UserService {
  // 只负责用户相关逻辑
  async getUser() {
    /* ... */
  }
  async logout() {
    /* ... */
  }
}

@injectable()
export class ThemeService {
  // 只负责主题相关逻辑
  setTheme() {
    /* ... */
  }
  getTheme() {
    /* ... */
  }
}

// ❌ 不好的做法：一个服务做多件事
@injectable()
export class ApplicationService {
  async getUser() {
    /* ... */
  }
  setTheme() {
    /* ... */
  }
  changeLanguage() {
    /* ... */
  }
  // 太多职责！
}
```

### 5. ✅ 依赖接口，不依赖实现

```typescript
// ✅ 好的做法
@injectable()
export class UserService {
  constructor(
    @inject('UserApiInterface') private api: UserApiInterface // 接口
  ) {}
}

// ❌ 不好的做法
@injectable()
export class UserService {
  constructor(
    @inject(UserApi) private api: UserApi // 具体实现
  ) {}
}
```

### 6. ✅ 即使简单也要分离

```typescript
// ✅ 好的做法：即使很简单也分离
@injectable()
export class CounterService {
  private count = 0;

  increment() {
    this.count++;
    return this.count;
  }
}

function Counter() {
  const counterService = useIOC('CounterService');
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(counterService.increment());
  };

  return <button onClick={handleClick}>{count}</button>;
}

// ❌ 不好的做法：简单逻辑也混在 UI 中
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

### 7. ✅ 编写全面的测试

```typescript
// ✅ 好的做法：逻辑测试 + UI 测试 + 组合测试
describe('UserService (逻辑)', () => {
  it('should get user', async () => {
    /* ... */
  });
  it('should handle error', async () => {
    /* ... */
  });
});

describe('UserProfile (UI)', () => {
  it('should display user', async () => {
    /* ... */
  });
});

describe('User Flow (组合)', () => {
  it('should complete flow', async () => {
    /* ... */
  });
});

// ❌ 不好的做法：只有 UI 测试
describe('UserProfile', () => {
  it('should work', async () => {
    // 只测 UI，逻辑没有测试
  });
});
```

### 8. ✅ 使用类型安全的标识符

```typescript
// ✅ 好的做法：类型安全的标识符
const userService = useIOC('UserServiceInterface');
// TypeScript 知道 userService 的类型

// ❌ 不好的做法：字符串字面量
const userService = useIOC('UserService');
// 容易拼写错误，没有类型检查
```

---

## ❓ 常见问题

### Q1: IOC 会增加复杂度吗？

**A:** 短期看可能增加复杂度，但长期看大大降低复杂度：

**短期（小项目）：**

- 需要定义接口
- 需要注册服务
- 需要学习 IOC 概念

**长期（项目变大）：**

- ✅ 易于测试（节省大量测试时间）
- ✅ 易于维护（清晰的依赖关系）
- ✅ 易于扩展（添加新功能很简单）
- ✅ 团队协作（职责清晰）

### Q2: 所有组件都要用 IOC 吗？

**A:** 不一定，但建议：

**需要使用 IOC 的场景：**

- ✅ 包含业务逻辑的组件
- ✅ 需要调用 API 的组件
- ✅ 需要访问 Storage 的组件
- ✅ 需要测试的组件

**可以不用 IOC 的场景：**

- 纯展示组件（只接收 props）
- 非常简单的 UI 组件（如 Button、Icon）

### Q3: 为什么不直接 import 服务？

**A:**

```typescript
// ❌ 直接 import
import { userService } from '@/services/UserService';

function UserProfile() {
  // 问题：
  // 1. userService 是单例，无法测试时替换
  // 2. userService 的依赖在模块加载时就创建了
  // 3. 难以 mock
}

// ✅ 使用 IOC
function UserProfile() {
  const userService = useIOC('UserServiceInterface');

  // 优势：
  // 1. 测试时可以提供 mock 实现
  // 2. 依赖由容器管理，按需创建
  // 3. 易于 mock
}
```

### Q4: 如何测试使用 IOC 的组件？

**A:** 提供 mock IOC：

```typescript
const mockIOC = (identifier: string) => {
  if (identifier === 'UserServiceInterface') {
    return mockUserService;
  }
  // ... 其他服务
};

render(
  <IOCProvider value={mockIOC}>
    <UserProfile />
  </IOCProvider>
);
```

### Q5: IOC 和 Context 有什么区别？

**A:**

| 特性         | React Context    | IOC 容器     |
| ------------ | ---------------- | ------------ |
| **作用域**   | React 组件树     | 全局         |
| **依赖管理** | ❌ 无            | ✅ 有        |
| **生命周期** | 组件生命周期     | 应用生命周期 |
| **测试**     | ⚠️ 需要 Provider | ✅ 易于 mock |
| **类型安全** | ⚠️ 需要手动定义  | ✅ 自动推导  |

**建议：**

- 使用 IOC 管理服务（逻辑）
- 使用 Context 管理 UI 状态

---

## 📚 相关文档

- [项目架构设计](./index.md) - 了解整体架构
- [Bootstrap 启动器](./bootstrap.md) - IOC 在 Bootstrap 中的应用
- [环境变量管理](./env.md) - AppConfig 的注入
- [Store 状态管理](./store.md) - 应用层如何通知 UI 层（IOC + Store）
- [测试指南](./test-guide.md) - 详细的测试策略

---

## 🎉 总结

IOC 容器的核心价值：

1. **UI 分离** 🎨 - UI 就是 UI，逻辑就是逻辑
2. **可测试性** 🧪 - 逻辑可以独立测试，UI 可以独立测试，也可以组合测试
3. **必须接口** 🔌 - 即使只有一个实现，也需要接口（为了测试）
4. **全面分离** 🏗️ - 即使简单组件，也要分离（为了未来）
5. **依赖管理** 📦 - 容器统一管理所有依赖
6. **解耦合** 🔗 - 组件不依赖具体实现
7. **易维护** 🛠️ - 清晰的依赖关系
8. **易扩展** 🚀 - 轻松添加新功能

**记住两个核心原则：**

1. **UI 就是 UI，逻辑就是逻辑，两者必须分离！**
2. **即使只有一个实现，也需要接口；即使组件很简单，也要分离！**

---

**问题反馈：**  
如果你对 IOC 容器有任何疑问或建议，请在团队频道中讨论或提交 Issue。
