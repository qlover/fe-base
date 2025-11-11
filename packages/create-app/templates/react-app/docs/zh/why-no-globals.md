# 为什么要禁止直接使用浏览器全局变量？

## 📋 目录

- [核心理念](#-核心理念)
- [禁用的全局变量](#-禁用的全局变量)
- [允许使用的位置](#-允许使用的位置)
- [为什么要这样做](#-为什么要这样做)
- [实际应用场景](#-实际应用场景)
- [最佳实践](#-最佳实践)
- [常见问题](#-常见问题)

---

## 🎯 核心理念

在我们的项目中，禁止在业务代码中直接使用浏览器全局变量（如 `window`、`document`、`localStorage` 等），而是要求**通过应用入口或封装层传入**。

### 简单来说：

```typescript
// ❌ 不允许：在业务组件中直接使用
function MyComponent() {
  const width = window.innerWidth; // ESLint 错误！
  return <div>宽度：{width}</div>;
}

// ✅ 推荐：从封装层导入
import { localStorage } from '@/core/globals';

function MyComponent() {
  const token = localStorage.getItem('token'); // 正确！
  return <div>Token: {token}</div>;
}
```

---

## 🚫 禁用的全局变量

以下全局变量在 `src/**/*.{ts,tsx,js,jsx}` 中被禁止直接使用：

- `window` - 浏览器窗口对象
- `document` - DOM 文档对象
- `localStorage` - 本地存储
- `sessionStorage` - 会话存储
- `navigator` - 浏览器信息
- `location` - URL 信息
- `history` - 浏览器历史

---

## ✅ 允许使用的位置

### 1. **应用入口** (`src/main.tsx`)

这是唯一允许直接访问浏览器环境的地方，因为它是应用的启动点：

```typescript:1:19:src/main.tsx
// !only this file use `window`, `document` ...global variables
import 'reflect-metadata';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { BootstrapClient } from './core/bootstraps/BootstrapClient';
import { clientIOC } from './core/clientIoc/ClientIOC.ts';

BootstrapClient.main({
  root: window,                    // ✅ 直接使用 window
  bootHref: window.location.href,  // ✅ 直接使用 location
  ioc: clientIOC
});

createRoot(document.getElementById('root')!).render(  // ✅ 直接使用 document
  <StrictMode>
    <App />
  </StrictMode>
);
```

**为什么？** 因为 `main.tsx` 负责将浏览器环境注入到应用中，它是"依赖注入"的起点。

### 2. **全局变量封装层** (`src/core/globals.ts`)

这是统一封装和管理全局变量的地方：

```typescript:38:48:src/core/globals.ts
/**
 * Override localStorage to use the global local storage
 */
export const localStorage = new SyncStorage(new ObjectStorage(), [
  JSON,
  new Base64Serializer(),
  window.localStorage as unknown as SyncStorageInterface<string>  // ✅ 封装 localStorage
]);

export const localStorageEncrypt = localStorage;

export const cookieStorage = new CookieStorage();
```

**为什么？** 这里是封装层，负责将原始的浏览器 API 包装成统一的、类型安全的接口。

### 3. **特殊的基础设施层**

某些基础设施代码（如 IOC 容器初始化）可能需要访问全局变量，但应该：

#### ⚠️ 情况 A：不推荐但可接受

在 `ClientIOC.ts` 中直接使用：

```typescript:28:30:src/core/clientIoc/ClientIOC.ts
const register = new ClientIOCRegister({
  pathname: window.location.pathname,  // ⚠️ 特殊情况，可以使用
  appConfig: appConfig
});
```

**说明：** IOC 容器初始化时需要 `pathname`，这是可以接受的，但不是最佳实践。

#### ✅ 情况 B：更好的做法（推荐）

通过 `main.tsx` 传入：

```typescript
// main.tsx
BootstrapClient.main({
  root: window,
  bootHref: window.location.href,  // 在入口获取
  pathname: window.location.pathname,  // 通过参数传入
  ioc: clientIOC
});

// ClientIOC.ts
create(pathname: string) {  // 接收参数而不是直接访问
  const register = new ClientIOCRegister({
    pathname: pathname,  // ✅ 使用传入的参数
    appConfig: appConfig
  });
}
```

---

## 🤔 为什么要这样做？

### 1. **测试友好** 🧪

直接使用全局变量会让测试变得**极其困难甚至不可能**。

#### ❌ 问题示例：难以测试的组件

```typescript
// UserProfile.tsx - 直接使用全局变量
function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 直接使用 fetch
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        // 直接使用 localStorage
        localStorage.setItem('lastUser', data.id);
        setUser(data);
      });
  }, []);

  return <div>{user?.name}</div>;
}

// ❌ 测试代码 - 几乎无法测试
describe('UserProfile', () => {
  it('should load and display user', async () => {
    // 问题 1：如何 mock fetch？需要 polyfill 或全局 mock
    global.fetch = jest.fn();

    // 问题 2：如何 mock localStorage？需要手动实现
    const mockLocalStorage = {
      setItem: jest.fn()
    };
    global.localStorage = mockLocalStorage as any;

    // 问题 3：需要清理全局状态，否则影响其他测试
    // 问题 4：多个测试之间可能互相干扰

    render(<UserProfile />);
    // 难以验证行为...
  });
});
```

**问题：**

- 😰 需要 mock 全局变量（fetch、localStorage）
- 😰 测试之间可能互相干扰
- 😰 难以测试错误场景
- 😰 测试代码充满技巧和 hack
- 😰 在 Node.js 环境中可能根本无法运行

#### ✅ 解决方案 1：从封装层导入

```typescript
// UserProfile.tsx - 从封装层导入
import { localStorage } from '@/core/globals';

function getUser() {
  return fetch('/api/user').then((res) => res.json());
}

// ✅ 测试代码 - 更容易测试
jest.mock('@/core/globals', () => ({
  localStorage: {
    setItem: jest.fn()
  }
}));

describe('UserProfile', () => {
  it('should save user to localStorage', () => {
    // 相对容易 mock，但仍需处理 fetch
  });
});
```

#### ⭐ 解决方案 2：使用 IOC 容器（最佳）

```typescript
// UserProfile.tsx - 使用 IOC 容器
import { useIoc } from '@/uikit/hooks/useIoc';

function UserProfile() {
  const userService = useIoc('UserService');
  const [user, setUser] = useState(null);

  useEffect(() => {
    userService.getCurrentUser().then(setUser);
  }, []);

  return <div>{user?.name}</div>;
}

// ✅✅ 测试代码 - 非常容易！
import { render, screen, waitFor } from '@testing-library/react';
import { IocProvider } from '@/contexts/IocContext';

describe('UserProfile', () => {
  it('should load and display user', async () => {
    // ✅ 只需要 mock 服务，不需要 mock 全局变量
    const mockUserService = {
      getCurrentUser: jest.fn().mockResolvedValue({
        id: '1',
        name: 'John Doe'
      })
    };

    const mockIoc = (serviceName: string) => {
      if (serviceName === 'UserService') return mockUserService;
    };

    render(
      <IocProvider value={mockIoc}>
        <UserProfile />
      </IocProvider>
    );

    // ✅ 清晰的断言
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // ✅ 验证服务调用
    expect(mockUserService.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('should handle error', async () => {
    // ✅ 轻松测试错误场景
    const mockUserService = {
      getCurrentUser: jest.fn().mockRejectedValue(new Error('Network error'))
    };

    // 测试错误处理...
  });

  it('should handle loading state', () => {
    // ✅ 轻松测试加载状态
    const mockUserService = {
      getCurrentUser: jest.fn().mockReturnValue(new Promise(() => {})) // 永不 resolve
    };

    // 测试加载中状态...
  });
});
```

#### 对比总结

| 测试场景        | 直接使用全局变量 | 使用封装层 | 使用 IOC 容器 |
| --------------- | ---------------- | ---------- | ------------- |
| Mock 复杂度     | 😰😰😰 很难      | 😐 中等    | 😊😊😊 简单   |
| 测试隔离性      | ❌ 差            | ⚠️ 一般    | ✅ 好         |
| 测试错误场景    | ❌ 困难          | ⚠️ 可以    | ✅ 容易       |
| 测试代码可读性  | ❌ 差            | ⚠️ 一般    | ✅ 好         |
| 在 Node.js 运行 | ❌ 困难          | ✅ 可以    | ✅ 可以       |

**关键优势：**

- ✅ **Mock 简单**：只需 mock 一个服务对象，不需要 mock 全局环境
- ✅ **测试隔离**：每个测试有独立的 mock，互不干扰
- ✅ **易测错误**：轻松模拟各种错误场景（网络错误、超时、权限错误等）
- ✅ **快速运行**：不需要真实的浏览器环境，测试跑得更快
- ✅ **代码清晰**：测试代码简单直观，易于维护

### 2. **SSR/多环境兼容** 🌐

如果你的应用需要支持服务端渲染（如 Next.js），直接使用全局变量会导致错误：

```typescript
// ❌ SSR 时会报错
function MyComponent() {
  const width = window.innerWidth;  // ReferenceError: window is not defined
  return <div>{width}</div>;
}

// ✅ 安全的方式
import { getWindow } from '@/core/globals';

function MyComponent() {
  const win = getWindow();  // 封装层可以处理 SSR 情况
  const width = win ? win.innerWidth : 0;
  return <div>{width}</div>;
}
```

### 3. **类型安全和错误处理** 🛡️

封装层可以提供更好的类型和错误处理：

```typescript
// src/core/globals.ts
export const localStorage = new SyncStorage(/* ... */); // 有完整的类型定义

// 业务代码
import { localStorage } from '@/core/globals';

// ✅ 有完整的类型提示和错误处理
localStorage.setItem('key', value); // TypeScript 会检查类型
```

### 4. **代码可追踪性** 🔍

通过 ESLint 规则，我们可以：

- **一眼看出** 哪些代码依赖浏览器环境
- **轻松查找** 所有使用浏览器 API 的地方（搜索 `from '@/core/globals'`）
- **方便重构** 统一修改所有浏览器 API 调用

```typescript
// 想知道哪里用了 localStorage？
// 搜索：import { localStorage } from '@/core/globals'
// 而不是在整个项目中搜索 "localStorage"（会有很多误报）
```

### 5. **统一的降级和 Polyfill** 🔄

在封装层可以统一处理兼容性和降级：

```typescript
// src/core/globals.ts
export const localStorage = (() => {
  try {
    const storage = window.localStorage;
    // 测试是否可用
    storage.setItem('__test__', '1');
    storage.removeItem('__test__');
    return storage;
  } catch {
    // 降级到内存存储（如隐私模式）
    console.warn('localStorage 不可用，使用内存存储');
    return new MemoryStorage();
  }
})();
```

### 6. **防止意外耦合** 🚫

强制开发者思考：

- 这段代码真的需要依赖浏览器环境吗？
- 可以写成纯函数吗？
- 是否可以通过参数传入而不是直接访问？

```typescript
// ❌ 紧密耦合浏览器环境
function isDesktop() {
  return window.innerWidth > 768;
}

// ✅ 解耦：通过参数传入
function isDesktop(width: number) {
  return width > 768;
}

// 在调用处传入
const desktop = isDesktop(window.innerWidth);
```

---

## 💡 实际应用场景

### 场景 1：需要操作 localStorage

```typescript
// ❌ 错误做法：直接使用浏览器 API
function saveToken(token: string) {
  localStorage.setItem('token', token); // ESLint 错误！
}

// ✅ 正确做法 1：从 globals 导入封装的 storage
import { localStorage } from '@/core/globals';

function saveToken(token: string) {
  localStorage.setItem('token', token); // 使用封装的 localStorage
}

// ✅ 正确做法 2：通过 IOC 容器获取服务（推荐）
import { useIoc } from '@/uikit/hooks/useIoc';

function useAuth() {
  const authService = useIoc('AuthService'); // 从 IOC 容器获取服务

  const saveToken = (token: string) => {
    authService.setToken(token); // 服务内部已封装 storage 操作
  };

  return { saveToken };
}

// 在组件中使用
function LoginComponent() {
  const { saveToken } = useAuth();

  const handleLogin = async () => {
    const token = await login();
    saveToken(token); // 不需要关心底层是用 localStorage 还是其他存储
  };
}
```

**为什么 IOC 方式更好？**

- 服务层已经封装了所有存储逻辑
- 业务代码不需要关心存储实现细节
- 易于切换存储方式（localStorage → IndexedDB → 服务器）
- 服务可以包含更多业务逻辑（加密、验证、过期处理等）

### 场景 2：需要获取当前路径

```typescript
// ❌ 错误做法：在组件中直接访问
function MyComponent() {
  const path = window.location.pathname; // ESLint 错误！
  // ...
}

// ✅ 正确做法 1：使用 React Router
import { useLocation } from 'react-router-dom';

function MyComponent() {
  const location = useLocation();
  const path = location.pathname; // 通过 Router 提供的 hook
  // ...
}

// ✅ 正确做法 2：通过 IOC 容器获取路由服务
import { useIoc } from '@/uikit/hooks/useIoc';

function MyComponent() {
  const routerService = useIoc('RouterService'); // 从 IOC 获取路由服务
  const path = routerService.getCurrentPath(); // 通过服务获取路径

  // 路由服务还可以提供更多功能
  const navigate = (path: string) => {
    routerService.navigate(path); // 统一的路由跳转
  };
}
```

### 场景 3：需要发起 HTTP 请求

```typescript
// ❌ 错误做法：直接使用 fetch
async function getUserInfo(id: string) {
  const response = await fetch(`/api/users/${id}`); // 直接使用全局 fetch
  return response.json();
}

// ✅ 正确做法：通过 IOC 容器获取 HTTP 服务
import { useIoc } from '@/uikit/hooks/useIoc';

function useUserService() {
  const httpService = useIoc('HttpService'); // 从 IOC 获取 HTTP 服务

  const getUserInfo = async (id: string) => {
    // HTTP 服务已经封装了：
    // - 统一的错误处理
    // - 请求拦截器（添加 token）
    // - 响应拦截器（处理错误码）
    // - 请求取消
    // - 超时控制
    return httpService.get(`/users/${id}`);
  };

  return { getUserInfo };
}

// 在组件中使用
function UserProfile({ userId }: { userId: string }) {
  const { getUserInfo } = useUserService();
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUserInfo(userId).then(setUser);
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

### 场景 4：需要国际化翻译

```typescript
// ❌ 错误做法：直接依赖全局 i18n 实例
import i18n from 'i18next';

function MyComponent() {
  const text = i18n.t('common.welcome'); // 直接依赖全局实例
  return <div>{text}</div>;
}

// ✅ 正确做法：通过 IOC 容器获取 I18n 服务
import { useIoc } from '@/uikit/hooks/useIoc';

function MyComponent() {
  const i18nService = useIoc('I18nService'); // 从 IOC 获取服务
  const text = i18nService.t('common.welcome'); // 通过服务翻译

  // I18n 服务还提供更多功能
  const changeLanguage = (lang: string) => {
    i18nService.changeLanguage(lang);
  };

  return (
    <div>
      {text}
      <button onClick={() => changeLanguage('en')}>English</button>
    </div>
  );
}
```

### 场景 5：需要获取窗口宽度

```typescript
// ❌ 错误做法
function useWindowSize() {
  const [size, setSize] = useState(window.innerWidth); // ESLint 错误！
  // ...
}

// ✅ 正确做法 1：从 globals 导入
import { window } from '@/core/globals';

function useWindowSize() {
  const [size, setSize] = useState(window?.innerWidth || 0);
  // ...
}

// ✅ 正确做法 2：通过 IOC 容器获取 Window 服务（最佳）
import { useIoc } from '@/uikit/hooks/useIoc';

function useWindowSize() {
  const windowService = useIoc('WindowService');
  const [size, setSize] = useState(windowService.getWidth());

  useEffect(() => {
    const unsubscribe = windowService.onResize((newSize) => {
      setSize(newSize.width);
    });

    return unsubscribe; // 服务内部管理事件监听器
  }, []);

  return size;
}
```

---

## 📖 最佳实践

### 1. **优先使用 IOC 容器获取服务（推荐）** ⭐

```typescript
// ✅ 最佳实践：通过 IOC 容器获取服务
import { useIoc } from '@/uikit/hooks/useIoc';

function MyComponent() {
  const authService = useIoc('AuthService');
  const i18nService = useIoc('I18nService');
  const httpService = useIoc('HttpService');

  // 业务逻辑...
}
```

**为什么？**

- 服务已经封装了所有底层依赖（包括全局变量）
- 易于测试（可以 mock 整个服务）
- 业务代码不需要关心实现细节
- 统一的依赖管理

### 2. **在应用入口注入依赖**

```typescript
// main.tsx
BootstrapClient.main({
  root: window,
  bootHref: window.location.href,
  ioc: clientIOC,
  // 其他需要的浏览器信息
  initialWindowSize: {
    width: window.innerWidth,
    height: window.innerHeight
  }
});
```

### 3. **优先使用 React 生态的解决方案**

- 使用 `react-router-dom` 而不是直接访问 `location`
- 使用 CSS 媒体查询或 `useMediaQuery` 而不是读取 `window.innerWidth`
- 使用 React 的事件系统而不是 `document.addEventListener`

### 4. **次选：通过封装层访问**

如果没有相应的服务，可以从 `@/core/globals` 导入：

```typescript
// src/core/globals.ts
export const getDocument = () => {
  if (typeof document === 'undefined') {
    throw new Error('document is not available in SSR');
  }
  return document;
};

// 业务代码
import { getDocument } from '@/core/globals';

const doc = getDocument();
const element = doc.getElementById('root');
```

### 5. **特殊情况要文档化**

如果某个基础设施层必须直接访问全局变量，添加注释说明原因：

```typescript
// ClientIOC.ts
create() {
  // 注意：这里直接使用 window.location.pathname
  // 原因：IOC 容器初始化时需要，且在 main.tsx 之后执行，浏览器环境确保可用
  // TODO: 考虑通过 BootstrapClient 传入，避免直接访问
  const pathname = window.location.pathname;
  // ...
}
```

### 6. **推荐的解决方案优先级**

```
1️⃣ 使用 IOC 容器服务     (useIoc('XxxService'))        ⭐ 最佳
2️⃣ 使用 React 生态方案    (useLocation, useMediaQuery)  👍 推荐
3️⃣ 从 globals 导入        (import { xxx } from '@/core/globals') ✅ 可以
4️⃣ 直接访问全局变量       (window.xxx)                   ❌ 禁止
```

---

## ❓ 常见问题

### Q1: 我的代码很简单，为什么还要这么麻烦？

**A:** 架构规范不是为了"当前"，而是为了：

- 未来可能的 SSR 需求
- 更容易编写单元测试
- 团队协作时的一致性
- 代码的可维护性和可追踪性

### Q2: 如果我确实需要在某个文件中直接使用全局变量怎么办？

**A:** 在 `eslint.config.mjs` 中添加例外：

```javascript
{
  files: [
    'src/main.tsx',
    'src/core/globals.ts',
    'src/utils/dom-helper.ts'  // 添加你的文件
  ],
  rules: {
    'no-restricted-globals': 'off'
  }
}
```

但要慎重考虑，并添加注释说明原因。

### Q3: `@/core/globals` 和直接使用 `window.xxx` 有什么区别？

**A:** 主要区别：

1. **类型安全**：封装层提供完整的 TypeScript 类型
2. **错误处理**：封装层可以处理 SSR、隐私模式等特殊情况
3. **统一管理**：所有浏览器 API 访问都在一个地方，便于追踪和修改
4. **可测试性**：可以轻松 mock 整个 `@/core/globals` 模块

### Q4: 为什么 `ClientIOC` 可以直接使用 `window.location.pathname`？

**A:** 这是一个**权衡**：

- **可以接受**：因为 `ClientIOC` 是基础设施层，且在 `main.tsx` 之后执行，浏览器环境确保可用
- **更好的做法**：通过 `BootstrapClient.main()` 传入 `pathname` 参数
- **未来改进**：计划重构为依赖注入方式

---

## 🎯 总结

### 允许使用全局变量的位置

| 位置                              | 是否允许    | 说明                         |
| --------------------------------- | ----------- | ---------------------------- |
| `src/main.tsx`                    | ✅ 允许     | 应用入口，负责注入依赖       |
| `src/core/globals.ts`             | ✅ 允许     | 封装层，统一管理全局变量     |
| `src/core/clientIoc/ClientIOC.ts` | ⚠️ 特殊情况 | 基础设施层，建议改为注入方式 |
| 其他业务代码                      | ❌ 禁止     | 必须通过封装层或依赖注入访问 |

### 业务代码如何访问浏览器 API

```typescript
// 优先级从高到低

// 🥇 方式 1：通过 IOC 容器获取服务（最推荐）
const authService = useIoc('AuthService');
authService.setToken(token); // 服务内部处理 storage

// 🥈 方式 2：使用 React 生态方案
const location = useLocation(); // react-router-dom
const path = location.pathname;

// 🥉 方式 3：从 globals 导入封装
import { localStorage } from '@/core/globals';
localStorage.setItem('key', value);

// ❌ 方式 4：直接访问（禁止！）
window.localStorage.setItem('key', value); // ESLint 错误
```

### 记住三个原则：

1. **在入口注入** - `main.tsx` 是唯一直接访问浏览器环境的地方
2. **在封装层封装** - `core/globals.ts` 或服务层提供统一接口
3. **在业务层使用** - 优先通过 IOC 容器获取服务，次选从封装层导入

### 为什么要这样做？

✅ **易于测试** - 可以轻松 mock 服务或封装层  
✅ **SSR 兼容** - 封装层可以处理服务端渲染场景  
✅ **类型安全** - 完整的 TypeScript 类型支持  
✅ **易于追踪** - 统一的依赖管理，便于查找和重构  
✅ **降级处理** - 统一处理浏览器兼容性和降级策略  
✅ **解耦业务** - 业务代码不依赖具体实现

---

**相关文档：**

- [ESLint 配置说明](../../eslint.config.mjs)
- [依赖注入模式](./dependency-injection.md)
- [项目架构设计](./index.md)

**需要帮助？**
如果你不确定某个场景应该如何处理，请在团队频道中询问或提交 Issue。
