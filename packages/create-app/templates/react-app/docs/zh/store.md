# Store 状态管理

## 📋 目录

- [核心理念](#-核心理念) - 应用层通知 UI 层
- [什么是 Store](#-什么是-store) - 状态容器
- [为什么需要 Store](#-为什么需要-store) - 解决通信问题
- [核心问题](#-核心问题) - 应用层如何通知 UI 层
- [项目中的实现](#-项目中的实现) - 实战指南
- [使用方式](#-使用方式) - Service + Store + useStore
- [测试](#-测试) - 独立测试和组合测试
- [最佳实践](#-最佳实践) - 7 条核心实践
- [常见问题](#-常见问题) - FAQ

---

## 🎯 核心理念

> **🚨 核心问题：应用层（Service）如何通知 UI 层更新，同时保持分离？**

> **⭐ 解决方案：Service 包含 Store，通过 `emit` 发布状态，UI 通过 `useStore` 订阅状态！**

### 核心概念

```
┌──────────────────────────────────────────────┐
│  问题：UI 和逻辑已经分离了，但如何通信？      │
│                                              │
│  Service (应用层)                             │
│  ├── 业务逻辑                                 │
│  └── 数据处理                                 │
│       ↓ 如何通知？                            │
│  Component (UI 层)                            │
│  └── UI 渲染                                  │
│                                              │
│  ❌ 问题：Service 改变了数据，UI 如何知道？   │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  解决方案：Store 作为桥梁                     │
│                                              │
│  Service (应用层)                             │
│  ├── 业务逻辑                                 │
│  ├── Store (状态容器)                         │
│  │   ├── state (状态)                         │
│  │   └── emit() (发布状态)                    │
│  │                                            │
│  │   ↓ 发布订阅模式                           │
│  │                                            │
│  └── useStore (订阅)                          │
│       ↓                                       │
│  Component (UI 层)                            │
│  └── 自动更新 UI                              │
│                                              │
│  ✅ Service 通过 emit 发布状态                │
│  ✅ UI 通过 useStore 订阅状态                 │
│  ✅ 保持分离，解耦合                          │
└──────────────────────────────────────────────┘
```

---

## 🗂️ 什么是 Store

Store 是一个**响应式状态容器**，基于**发布订阅模式**实现。

### 简单理解

```
Store = 状态 + 发布订阅

Service 拥有 Store
Service 通过 Store.emit() 发布状态
UI 通过 useStore() 订阅状态
```

### 类比理解

```
Store 就像一个广播电台：

📻 电台（Store）
- 有节目内容（state）
- 可以广播节目（emit）
- 听众可以收听（subscribe）

🎤 主持人（Service）
- 制作节目内容（业务逻辑）
- 通过电台广播（emit）

📱 听众（UI Component）
- 收听电台（useStore）
- 听到新内容自动反应（自动更新 UI）
```

---

## 🤔 为什么需要 Store

### 核心问题：UI 和逻辑分离后，如何通信？

我们已经通过 IOC 实现了 UI 和逻辑分离，但问题来了：

#### ❌ 问题示例：没有 Store

```typescript
// Service（逻辑层）
@injectable()
export class UserService {
  private user: UserInfo | null = null;

  async login(username: string, password: string) {
    const response = await this.api.login({ username, password });
    this.user = response.user;  // ✅ 登录成功，user 已更新

    // ❌ 问题：UI 如何知道 user 已经更新？
    // ❌ Service 无法通知 UI
  }
}

// UI 组件
function UserProfile() {
  const userService = useIOC('UserServiceInterface');

  // ❌ 问题：如何获取 userService.user？
  // ❌ userService.user 更新后，如何触发 UI 重新渲染？

  return <div>{/* 无法显示 user */}</div>;
}

// 😰😰😰 问题总结：
// 1. UI 无法获取 Service 的内部状态
// 2. Service 状态更新后，UI 不知道
// 3. 需要手动调用某个方法来获取状态？（打破分离原则）
// 4. 需要轮询检查状态？（性能差）
```

#### ✅ 解决方案：使用 Store

```typescript
// Service（逻辑层）
@injectable()
export class UserService extends StoreInterface<UserState> {
  constructor() {
    super(() => ({
      user: null,
      loading: false
    }));
  }

  async login(username: string, password: string) {
    // 设置加载状态
    this.emit({ ...this.state, loading: true });

    const response = await this.api.login({ username, password });

    // ✅ 通过 emit 发布新状态，自动通知所有订阅者
    this.emit({
      user: response.user,
      loading: false
    });
  }
}

// UI 组件
function UserProfile() {
  const userService = useIOC('UserServiceInterface');

  // ✅ 通过 useStore 订阅状态
  const { user, loading } = useStore(userService);

  // ✅ userService.emit() 时，组件会自动重新渲染

  if (loading) return <div>Loading...</div>;
  return <div>{user?.name}</div>;
}

// ✅✅✅ 优势总结：
// 1. UI 可以订阅 Service 的状态
// 2. Service 状态更新后，UI 自动更新
// 3. 保持分离（Service 不知道有哪些 UI 在监听）
// 4. 高性能（只有订阅的组件才会更新）
```

### 对比总结

| 特性             | 没有 Store             | 有 Store              |
| ---------------- | ---------------------- | --------------------- |
| **状态获取**     | ❌ 无法获取内部状态    | ✅ 通过 useStore 订阅 |
| **状态更新通知** | ❌ UI 不知道状态变化   | ✅ emit 自动通知      |
| **UI 更新**      | ❌ 需要手动触发        | ✅ 自动重新渲染       |
| **解耦**         | ❌ Service 需要知道 UI | ✅ 完全解耦           |
| **性能**         | ❌ 轮询或全局更新      | ✅ 精确更新订阅者     |
| **可测试性**     | ❌ 难以测试状态变化    | ✅ 易于测试状态       |

---

## ❓ 核心问题

### 应用层如何通知 UI 层，同时保持分离？

#### 问题拆解

1. **应用层（Service）有状态** - 如用户信息、加载状态
2. **UI 层需要显示这些状态** - 显示用户名、显示加载动画
3. **应用层状态会变化** - 登录成功后，用户信息更新
4. **UI 层需要自动更新** - 用户信息变化后，UI 自动显示新名字
5. **保持分离** - Service 不应该直接操作 UI，UI 不应该直接访问 Service 内部

#### 解决方案：发布订阅模式

```typescript
// 1. Service 定义状态
interface UserState {
  user: UserInfo | null;
  loading: boolean;
}

// 2. Service 继承 StoreInterface
@injectable()
export class UserService extends StoreInterface<UserState> {
  constructor() {
    super(() => ({
      user: null,
      loading: false
    }));
  }

  // 3. Service 通过 emit 发布状态
  async login(username: string, password: string) {
    this.emit({ ...this.state, loading: true });  // 发布：开始加载

    const response = await this.api.login({ username, password });

    this.emit({
      user: response.user,
      loading: false
    });  // 发布：加载完成，用户已登录
  }

  // 4. Service 不需要知道谁在监听
  // ✅ 完全解耦
}

// 5. UI 通过 useStore 订阅状态
function LoginPage() {
  const userService = useIOC('UserServiceInterface');
  const { loading } = useStore(userService);

  const handleLogin = () => {
    userService.login('user', 'pass');
  };

  // 6. 当 Service emit 新状态时，UI 自动更新
  return (
    <button onClick={handleLogin} disabled={loading}>
      {loading ? 'Logging in...' : 'Login'}
    </button>
  );
}
```

#### 工作流程

```
┌─────────────────────────────────────────────┐
│  完整的状态更新流程                          │
│                                             │
│  1. 用户点击按钮                             │
│     ↓                                        │
│  2. UI 调用 Service 方法                     │
│     userService.login()                     │
│     ↓                                        │
│  3. Service 执行业务逻辑                     │
│     - 调用 API                               │
│     - 处理数据                               │
│     ↓                                        │
│  4. Service 通过 emit 发布新状态             │
│     this.emit({ user: ..., loading: false })│
│     ↓                                        │
│  5. Store 通知所有订阅者                     │
│     listeners.forEach(listener => ...)      │
│     ↓                                        │
│  6. useStore 收到通知                        │
│     触发组件重新渲染                         │
│     ↓                                        │
│  7. UI 显示最新状态                          │
│     显示用户名 / 隐藏加载动画                │
└─────────────────────────────────────────────┘
```

---

## 🛠️ 项目中的实现

### 1. 文件结构

```
src/
├── base/
│   ├── services/
│   │   ├── UserService.ts          # Service 继承 StoreInterface
│   │   ├── RouteService.ts         # Service 继承 StoreInterface
│   │   └── I18nService.ts          # Service 继承 StoreInterface
│   └── port/
│       └── UserServiceInterface.ts # Service 接口
└── uikit/
    └── hooks/
        └── useStore.ts (from @brain-toolkit/react-kit)
```

### 2. Store 基类

Store 系统基于 `@brain-toolkit/react-kit` 的 `SliceStore`：

```typescript
// 来自 @brain-toolkit/react-kit
export class SliceStore<T> {
  protected state: T;
  private listeners = new Set<(state: T) => void>();

  constructor(stateFactory: () => T) {
    this.state = stateFactory();
  }

  // 发布状态
  protected emit(newState: T) {
    this.state = newState;
    // 通知所有订阅者
    this.listeners.forEach((listener) => listener(this.state));
  }

  // 订阅状态
  subscribe(listener: (state: T) => void) {
    this.listeners.add(listener);
    // 返回取消订阅函数
    return () => this.listeners.delete(listener);
  }

  // 获取当前状态
  getState(): T {
    return this.state;
  }
}
```

### 3. StoreInterface 基类

项目中的 Store 基类，提供额外的工具方法：

```typescript
// 来自 @qlover/corekit-bridge
export abstract class StoreInterface<
  T extends StoreStateInterface
> extends SliceStore<T> {
  constructor(protected stateFactory: () => T) {
    super(stateFactory);
  }

  // 重置状态
  resetState(): void {
    this.emit(this.stateFactory());
  }

  // 克隆状态（用于更新）
  cloneState(source?: Partial<T>): T {
    const cloned = clone(this.state);
    if (typeof cloned === 'object' && cloned !== null) {
      Object.assign(cloned, source);
    }
    return cloned;
  }
}
```

### 4. 状态接口

```typescript
// 所有状态必须实现此接口
export interface StoreStateInterface {
  // 可以在这里定义通用属性
  // loading?: boolean;
  // error?: Error | null;
}
```

---

## 📝 使用方式

### 1. 定义状态接口

```typescript
// src/base/services/UserService.ts
export interface UserState extends StoreStateInterface {
  user: UserInfo | null;
  loading: boolean;
  error: Error | null;
}
```

### 2. Service 继承 StoreInterface

```typescript
// src/base/services/UserService.ts
import { StoreInterface } from '@qlover/corekit-bridge';
import { injectable, inject } from 'inversify';

@injectable()
export class UserService extends StoreInterface<UserState> {
  constructor(
    @inject(UserApi) private api: UserApi,
    @inject(IOCIdentifier.AppConfig) private config: AppConfig
  ) {
    // 初始化状态
    super(() => ({
      user: null,
      loading: false,
      error: null
    }));
  }

  // 业务方法：通过 emit 发布状态
  async login(username: string, password: string) {
    // 1. 开始加载
    this.emit({
      ...this.state,
      loading: true,
      error: null
    });

    try {
      // 2. 调用 API
      const response = await this.api.login({ username, password });

      // 3. 成功：发布新状态
      this.emit({
        user: response.user,
        loading: false,
        error: null
      });
    } catch (error) {
      // 4. 失败：发布错误状态
      this.emit({
        ...this.state,
        loading: false,
        error: error as Error
      });
    }
  }

  async logout() {
    this.emit({
      user: null,
      loading: false,
      error: null
    });
  }

  // 使用 cloneState 简化更新
  setUser(user: UserInfo) {
    this.emit(this.cloneState({ user }));
  }
}
```

### 3. UI 订阅状态

```typescript
// src/pages/LoginPage.tsx
import { useStore } from '@brain-toolkit/react-kit/hooks/useStore';
import { useIOC } from '@/uikit/hooks/useIOC';

function LoginPage() {
  const userService = useIOC('UserServiceInterface');

  // ✅ 方式 1：订阅完整状态
  const { user, loading, error } = useStore(userService);

  const handleLogin = async () => {
    await userService.login('username', 'password');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {error && <div>Error: {error.message}</div>}
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
```

### 4. 使用选择器（性能优化）

```typescript
// src/pages/UserProfile.tsx
function UserProfile() {
  const userService = useIOC('UserServiceInterface');

  // ✅ 方式 2：只订阅需要的状态（性能更好）
  const user = useStore(userService, (state) => state.user);

  // ✅ 只有 user 变化时才重新渲染，loading 变化不会触发

  return <div>{user?.name}</div>;
}
```

### 5. 定义选择器（推荐）

```typescript
// src/base/services/UserService.ts
@injectable()
export class UserService extends StoreInterface<UserState> {
  // ... 其他代码

  // ✅ 定义选择器
  selector = {
    user: (state: UserState) => state.user,
    loading: (state: UserState) => state.loading,
    error: (state: UserState) => state.error,
    isLoggedIn: (state: UserState) => state.user !== null
  };
}

// 使用
function UserProfile() {
  const userService = useIOC('UserServiceInterface');

  // ✅ 使用预定义的选择器
  const user = useStore(userService, userService.selector.user);
  const isLoggedIn = useStore(userService, userService.selector.isLoggedIn);

  return <div>{isLoggedIn ? user?.name : 'Please login'}</div>;
}
```

### 6. 实际项目示例

#### 示例 1：UserService

```typescript
// src/base/services/UserService.ts
@injectable()
export class UserService extends UserAuthServiceInterface {
  constructor(
    @inject(UserApi) userApi: UserApi,
    @inject(IOCIdentifier.AppConfig) appConfig: AppConfig,
    @inject(IOCIdentifier.LocalStorageEncrypt) storage: Storage
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

  // ✅ UserService 继承的基类包含 store
  override get store(): UserAuthStore<UserApiState> {
    return super.store as UserAuthStore<UserApiState>;
  }

  override async logout(): Promise<void> {
    await super.logout();
    // ✅ store 会自动通知 UI
    this.routerService.gotoLogin();
  }
}

// 使用
function Layout() {
  const userService = useIOC(IOCIdentifier.UserServiceInterface);

  // ✅ 订阅 userService.store
  useStore(userService.store);

  if (userService.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
```

#### 示例 2：RouteService

```typescript
// src/base/services/RouteService.ts
export class RouteService extends StoreInterface<RouterServiceState> {
  constructor(
    protected uiBridge: UIBridgeInterface<NavigateFunction>,
    protected i18nService: I18nServiceInterface,
    protected options: RouterServiceOptions
  ) {
    super(
      () => new RouterServiceState(options.routes, !!options.hasLocalRoutes)
    );
  }

  // ✅ 通过 emit 发布路由变化
  override changeRoutes(routes: RouteConfigValue[]): void {
    this.emit(this.cloneState({ routes }));
  }

  override goto(path: string, options?: NavigateOptions): void {
    const composedPath = this.composePath(path);
    this.uiBridge.getUIBridge()(composedPath, options);
  }
}

// 使用
function AppRouterProvider() {
  const routerService = useIOC(IOCIdentifier.RouteServiceInterface);

  // ✅ 订阅 routes 变化
  const routes = useStore(routerService, (state) => state.routes);

  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
}
```

#### 示例 3：I18nService

```typescript
// src/base/services/I18nService.ts
export class I18nService extends StoreInterface<I18nServiceState> {
  constructor(protected pathname: string) {
    super(() => new I18nServiceState(i18n.language as I18nServiceLocale));
  }

  selector = {
    loading: (state: I18nServiceState) => state.loading,
    language: (state: I18nServiceState) => state.language
  };

  override async changeLanguage(lng: string): Promise<void> {
    // ✅ 发布加载状态
    this.emit(this.cloneState({ loading: true }));

    await i18n.changeLanguage(lng);

    // ✅ 发布完成状态
    this.emit({
      language: lng as I18nServiceLocale,
      loading: false
    });
  }
}

// 使用
function LanguageSwitcher() {
  const i18nService = useIOC(IOCIdentifier.I18nServiceInterface);

  // ✅ 只订阅 loading 状态
  const loading = useStore(i18nService, i18nService.selector.loading);

  return (
    <Select
      value={i18n.language}
      loading={loading}
      onChange={(lng) => i18nService.changeLanguage(lng)}
    />
  );
}
```

---

## 🧪 测试

### 核心优势：Store 可以独立测试，UI 可以 mock Store

#### 1. 测试 Service 和 Store（逻辑测试）

```typescript
// __tests__/src/base/services/UserService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '@/base/services/UserService';

describe('UserService (逻辑测试)', () => {
  let userService: UserService;
  let mockApi: any;

  beforeEach(() => {
    mockApi = {
      login: vi.fn(),
      getUserInfo: vi.fn()
    };

    userService = new UserService(mockApi, mockConfig, mockStorage);
  });

  it('should update store state when login success', async () => {
    // ✅ 测试状态变化
    mockApi.login.mockResolvedValue({
      user: { name: 'John', id: 1 },
      token: 'test-token'
    });

    // 订阅状态变化
    const states: any[] = [];
    userService.subscribe((state) => {
      states.push({ ...state });
    });

    // 调用登录
    await userService.login('user', 'pass');

    // ✅ 验证状态变化序列
    expect(states).toHaveLength(2);

    // 第一次 emit：loading = true
    expect(states[0]).toEqual({
      user: null,
      loading: true,
      error: null
    });

    // 第二次 emit：loading = false, user = John
    expect(states[1]).toEqual({
      user: { name: 'John', id: 1 },
      loading: false,
      error: null
    });
  });

  it('should update store state when login fails', async () => {
    mockApi.login.mockRejectedValue(new Error('Invalid credentials'));

    const states: any[] = [];
    userService.subscribe((state) => states.push({ ...state }));

    await expect(userService.login('user', 'wrong')).rejects.toThrow();

    // ✅ 验证错误状态
    expect(states[1]).toEqual({
      user: null,
      loading: false,
      error: expect.any(Error)
    });
  });

  it('should emit logout state', () => {
    // 先设置用户登录
    userService.emit({
      user: { name: 'John', id: 1 },
      loading: false,
      error: null
    });

    // 登出
    userService.logout();

    // ✅ 验证状态被重置
    expect(userService.getState()).toEqual({
      user: null,
      loading: false,
      error: null
    });
  });
});

// ✅✅✅ 优势：
// 1. 不需要渲染 UI
// 2. 可以测试所有状态变化
// 3. 可以验证 emit 的调用序列
// 4. 测试运行快速
```

#### 2. 测试 UI 组件（UI 测试）

```typescript
// __tests__/src/pages/LoginPage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from '@/pages/LoginPage';
import { IOCProvider } from '@/uikit/contexts/IOCContext';

describe('LoginPage (UI 测试)', () => {
  it('should show loading when login', async () => {
    // ✅ Mock Service 和 Store
    const mockStore = {
      user: null,
      loading: false,
      error: null
    };

    const mockUserService = {
      login: vi.fn().mockImplementation(() => {
        // 模拟状态变化
        mockStore.loading = true;
        return Promise.resolve();
      }),
      subscribe: vi.fn(),
      getState: () => mockStore
    };

    const mockIOC = (identifier: string) => {
      if (identifier === 'UserServiceInterface') return mockUserService;
    };

    // ✅ 渲染组件
    const { rerender } = render(
      <IOCProvider value={mockIOC}>
        <LoginPage />
      </IOCProvider>
    );

    // 点击登录按钮
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    // ✅ 验证 Service 被调用
    expect(mockUserService.login).toHaveBeenCalled();

    // 模拟状态更新
    mockStore.loading = true;
    rerender(
      <IOCProvider value={mockIOC}>
        <LoginPage />
      </IOCProvider>
    );

    // ✅ 验证 UI 显示加载状态
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show error message when login fails', () => {
    const mockStore = {
      user: null,
      loading: false,
      error: new Error('Invalid credentials')
    };

    const mockUserService = {
      login: vi.fn(),
      subscribe: vi.fn(),
      getState: () => mockStore
    };

    const mockIOC = (identifier: string) => {
      if (identifier === 'UserServiceInterface') return mockUserService;
    };

    render(
      <IOCProvider value={mockIOC}>
        <LoginPage />
      </IOCProvider>
    );

    // ✅ 验证错误消息显示
    expect(screen.getByText('Error: Invalid credentials')).toBeInTheDocument();
  });
});

// ✅✅✅ 优势：
// 1. 不需要真实的 Service 实现
// 2. 可以轻松模拟各种状态
// 3. UI 测试专注于 UI 逻辑
```

#### 3. 组合测试（集成测试）

```typescript
// __tests__/src/integration/UserLogin.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from '@/pages/LoginPage';
import { UserService } from '@/base/services/UserService';
import { IOCProvider } from '@/uikit/contexts/IOCContext';

describe('User Login Flow (组合测试)', () => {
  it('should complete login flow', async () => {
    // ✅ 使用真实的 Service 和 Store
    const mockApi = {
      login: vi.fn().mockResolvedValue({
        user: { name: 'John', id: 1 },
        token: 'test-token'
      })
    };

    const userService = new UserService(mockApi, mockConfig, mockStorage);

    const mockIOC = (identifier: string) => {
      if (identifier === 'UserServiceInterface') return userService;
    };

    // ✅ 渲染真实 UI
    render(
      <IOCProvider value={mockIOC}>
        <LoginPage />
      </IOCProvider>
    );

    // ✅ 模拟用户操作
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    // ✅ 验证加载状态
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    // ✅ 验证登录成功
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(userService.getState().user).toEqual({
        name: 'John',
        id: 1
      });
    });

    // ✅ 验证 API 被调用
    expect(mockApi.login).toHaveBeenCalled();
  });
});

// ✅✅✅ 优势：
// 1. 测试真实的用户流程
// 2. 验证 Service 和 UI 的集成
// 3. 发现集成问题
```

### 测试策略总结

```
┌────────────────────────────────────────┐
│  测试金字塔                             │
│                                        │
│      △ UI 测试 (10%)                   │
│     ╱ ╲                                │
│    ╱   ╲ 组合测试 (20%)                │
│   ╱     ╲                              │
│  ╱───────╲                             │
│ ╱         ╲ Store + Service 测试 (70%) │
│╱═══════════╲                           │
│                                        │
│  Store 测试：测试状态变化逻辑           │
│  组合测试：测试 Service + UI 集成       │
│  UI 测试：测试 UI 交互                  │
└────────────────────────────────────────┘
```

---

## 💎 最佳实践

### 1. ✅ Service 继承 StoreInterface

```typescript
// ✅ 好的做法：Service 继承 StoreInterface
@injectable()
export class UserService extends StoreInterface<UserState> {
  constructor() {
    super(() => ({
      user: null,
      loading: false
    }));
  }

  async login(username: string, password: string) {
    this.emit({ ...this.state, loading: true });
    // ...
  }
}

// ❌ 不好的做法：Service 不继承 StoreInterface
@injectable()
export class UserService {
  private user: UserInfo | null = null;

  // 问题：UI 无法订阅状态
}
```

### 2. ✅ 使用 emit 发布状态

```typescript
// ✅ 好的做法：通过 emit 发布状态
async login(username: string, password: string) {
  this.emit({ ...this.state, loading: true });

  const response = await this.api.login({ username, password });

  this.emit({
    user: response.user,
    loading: false
  });
}

// ❌ 不好的做法：直接修改 state
async login(username: string, password: string) {
  this.state.loading = true;  // ❌ 不会通知订阅者

  const response = await this.api.login({ username, password });

  this.state.user = response.user;  // ❌ 不会通知订阅者
}
```

### 3. ✅ 使用 cloneState 简化更新

```typescript
// ✅ 好的做法：使用 cloneState
setUser(user: UserInfo) {
  this.emit(this.cloneState({ user }));
}

setLoading(loading: boolean) {
  this.emit(this.cloneState({ loading }));
}

// ⚠️ 也可以：手动展开
setUser(user: UserInfo) {
  this.emit({ ...this.state, user });
}
```

### 4. ✅ 定义选择器

```typescript
// ✅ 好的做法：定义选择器
@injectable()
export class UserService extends StoreInterface<UserState> {
  selector = {
    user: (state: UserState) => state.user,
    loading: (state: UserState) => state.loading,
    isLoggedIn: (state: UserState) => state.user !== null
  };
}

// 使用
const isLoggedIn = useStore(userService, userService.selector.isLoggedIn);

// ❌ 不好的做法：内联选择器
const isLoggedIn = useStore(userService, (state) => state.user !== null);
// 问题：每次渲染都创建新函数
```

### 5. ✅ 使用选择器优化性能

```typescript
// ✅ 好的做法：只订阅需要的状态
function UserName() {
  const userService = useIOC('UserServiceInterface');

  // 只订阅 user，loading 变化不会触发重新渲染
  const user = useStore(userService, (state) => state.user);

  return <span>{user?.name}</span>;
}

// ❌ 不好的做法：订阅完整状态
function UserName() {
  const userService = useIOC('UserServiceInterface');

  // loading 变化也会触发重新渲染
  const { user, loading } = useStore(userService);

  return <span>{user?.name}</span>;
}
```

### 6. ✅ 状态保持不可变

```typescript
// ✅ 好的做法：创建新对象
updateUser(changes: Partial<UserInfo>) {
  this.emit({
    ...this.state,
    user: {
      ...this.state.user,
      ...changes
    }
  });
}

// ❌ 不好的做法：直接修改对象
updateUser(changes: Partial<UserInfo>) {
  this.state.user.name = changes.name;  // ❌ 直接修改
  this.emit(this.state);  // ❌ 引用相同，可能不触发更新
}
```

### 7. ✅ 合理划分状态

```typescript
// ✅ 好的做法：每个 Service 管理自己的状态
class UserService extends StoreInterface<UserState> {
  // 只管理用户相关状态
}

class ThemeService extends StoreInterface<ThemeState> {
  // 只管理主题相关状态
}

class I18nService extends StoreInterface<I18nState> {
  // 只管理国际化相关状态
}

// ❌ 不好的做法：全局大 Store
class GlobalStore extends StoreInterface<GlobalState> {
  // 包含所有状态：用户、主题、国际化等
  // 问题：任何状态变化都会影响所有订阅者
}
```

---

## ❓ 常见问题

### Q1: 为什么不用 Redux？

**A:**

| 特性                | Redux                                | Store (SliceStore)        |
| ------------------- | ------------------------------------ | ------------------------- |
| **复杂度**          | ❌ 高（Action, Reducer, Middleware） | ✅ 低（emit + subscribe） |
| **学习曲线**        | ❌ 陡峭                              | ✅ 平缓                   |
| **TypeScript 支持** | ⚠️ 需要额外配置                      | ✅ 原生支持               |
| **IOC 集成**        | ⚠️ 需要额外工作                      | ✅ 天然集成               |
| **性能**            | ✅ 好                                | ✅ 好                     |
| **适用场景**        | 大型应用                             | 中小型应用                |

**我们的选择：**

- 项目已经使用 IOC，不需要 Redux 的全局状态管理
- 每个 Service 管理自己的状态，更清晰
- SliceStore 足够简单和强大

### Q2: Store 和 React Context 有什么区别？

**A:**

| 特性                | React Context             | Store                     |
| ------------------- | ------------------------- | ------------------------- |
| **作用域**          | 组件树                    | 全局（通过 IOC）          |
| **性能**            | ⚠️ 任何值变化都会重新渲染 | ✅ 只有订阅的值变化才渲染 |
| **选择器**          | ❌ 无                     | ✅ 有                     |
| **与 Service 集成** | ⚠️ 需要手动               | ✅ 天然集成               |

**建议：**

- 使用 Store 管理应用状态（Service 状态）
- 使用 Context 管理 UI 状态（如模态框、临时表单数据）

### Q3: 如何避免重复渲染？

**A:** 使用选择器

```typescript
// ❌ 问题：订阅完整状态
const { user, loading, error } = useStore(userService);
// loading 变化会导致组件重新渲染

// ✅ 解决：只订阅需要的状态
const user = useStore(userService, (state) => state.user);
// 只有 user 变化才会重新渲染
```

### Q4: 可以在 Service 外部调用 emit 吗？

**A:** 不建议

```typescript
// ❌ 不好的做法
function SomeComponent() {
  const userService = useIOC('UserServiceInterface');

  // ❌ 直接调用 emit
  userService.emit({ user: newUser, loading: false });
}

// ✅ 好的做法：通过 Service 方法
function SomeComponent() {
  const userService = useIOC('UserServiceInterface');

  // ✅ 调用 Service 方法
  userService.setUser(newUser);
}

// Service 中
@injectable()
export class UserService extends StoreInterface<UserState> {
  setUser(user: UserInfo) {
    this.emit(this.cloneState({ user }));
  }
}
```

**原因：**

- 保持封装性
- 方便测试
- 业务逻辑集中在 Service

### Q5: Store 状态更新不生效？

**A:** 检查以下几点：

```typescript
// ❌ 常见错误 1：直接修改 state
this.state.loading = true;  // 不会触发更新

// ✅ 正确：使用 emit
this.emit({ ...this.state, loading: true });

// ❌ 常见错误 2：没有创建新对象
const state = this.state;
state.loading = true;
this.emit(state);  // 引用相同，可能不触发更新

// ✅ 正确：创建新对象
this.emit({ ...this.state, loading: true });

// ❌ 常见错误 3：忘记订阅
function MyComponent() {
  const userService = useIOC('UserServiceInterface');
  // 没有调用 useStore，无法接收更新

  return <div>{userService.getState().user?.name}</div>;
}

// ✅ 正确：使用 useStore 订阅
function MyComponent() {
  const userService = useIOC('UserServiceInterface');
  const user = useStore(userService, (state) => state.user);

  return <div>{user?.name}</div>;
}
```

### Q6: 如何在 Service 之间共享状态？

**A:** 通过 IOC 注入

```typescript
// Service A
@injectable()
export class UserService extends StoreInterface<UserState> {
  // ...
}

// Service B 依赖 Service A
@injectable()
export class ProfileService {
  constructor(
    @inject('UserServiceInterface')
    private userService: UserService
  ) {}

  async updateProfile(data: ProfileData) {
    // ✅ 访问 UserService 的状态
    const user = this.userService.getState().user;

    // ✅ 也可以订阅 UserService 的状态
    this.userService.subscribe((state) => {
      console.log('User state changed:', state);
    });
  }
}
```

---

## 📚 相关文档

- [项目架构设计](./index.md) - 了解整体架构
- [IOC 容器](./ioc.md) - 依赖注入和 UI 分离
- [Bootstrap 启动器](./bootstrap.md) - 应用启动和初始化
- [测试指南](./test-guide.md) - 详细的测试策略

---

## 🎉 总结

Store 状态管理的核心价值：

1. **解决通信问题** 📡 - 应用层通知 UI 层，同时保持分离
2. **发布订阅模式** 🔔 - Service emit，UI useStore
3. **自动更新 UI** ⚡ - 状态变化时，UI 自动重新渲染
4. **保持解耦** 🔗 - Service 不知道有哪些 UI 在监听
5. **易于测试** 🧪 - Store 可以独立测试
6. **性能优化** 🚀 - 选择器只订阅需要的状态
7. **类型安全** 🔒 - TypeScript 完整支持

**记住核心模式：**

```typescript
// 1. Service 继承 StoreInterface
class MyService extends StoreInterface<MyState> {
  // 2. 通过 emit 发布状态
  doSomething() {
    this.emit({ ...this.state, data: newData });
  }
}

// 3. UI 通过 useStore 订阅状态
function MyComponent() {
  const myService = useIOC('MyServiceInterface');
  const data = useStore(myService, (state) => state.data);

  return <div>{data}</div>;
}
```

**核心原则：**

- ✅ Service 通过 emit 发布状态
- ✅ UI 通过 useStore 订阅状态
- ✅ 使用选择器优化性能
- ✅ 状态保持不可变
- ✅ 每个 Service 管理自己的状态

---

**问题反馈：**  
如果你对 Store 状态管理有任何疑问或建议，请在团队频道中讨论或提交 Issue。
