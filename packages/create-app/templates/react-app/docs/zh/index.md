# 项目架构设计

> **📖 本文档是项目的入口文档，提供架构概览、核心概念和完整的文档导航。**

## 📋 目录

- [快速开始](#-快速开始)
- [架构概览](#-架构概览)
- [分层架构](#-分层架构)
- [完整的工作流程](#-完整的工作流程)
- [核心概念](#-核心概念)
- [快速示例](#-快速示例)
- [详细文档导航](#-详细文档导航)

---

## 🚀 快速开始

### 新手开发者

如果你是第一次接触本项目，建议按以下顺序：

1. **阅读本文档** - 了解整体架构和核心理念（10-15 分钟）
2. **[IOC 容器](./ioc.md)** - 理解 UI 和逻辑分离（10-15 分钟）
3. **[Store 状态管理](./store.md)** - 理解应用层如何通知 UI 层（10-15 分钟）
4. **[开发指南](./development-guide.md)** - 跟随完整示例开发一个页面（20-30 分钟）

### 有经验的开发者

如果你已经有相关经验，可以直接：

1. 快速浏览本文档了解架构特点
2. 查看 [开发指南](./development-guide.md) 了解开发流程
3. 按需查阅各专题文档

### 环境准备

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 启动测试环境
pnpm dev:staging

# 构建生产版本
pnpm build

# 运行测试
pnpm test
```

---

## 🎯 架构概览

本项目采用**分层架构 + 依赖注入 + 面向接口编程**的设计模式。

### 架构全景图

```
┌─────────────────────────────────────────────────────┐
│  配置层 (Config Layer)                               │
│  • 所有配置统一管理                                   │
|  （路由、主题、i18n、IOC 等）                         │
│  • 环境变量注入目标                                   |
|  （AppConfig.ts）                                    │
│  📄 详见：env.md                                     │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  入口层 (Entry Layer)                                │
│  • main.tsx: 应用启动                                 │
│  • 注入全局依赖（window, document 等）                │
│  • 初始化 IOC 容器                                    │
│  • 执行 Bootstrap 启动流程                            │
│  📄 详见：bootstrap.md                                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  核心层 (Core Layer)                                 │
│  • globals.ts: 封装浏览器 API                         │
│  • clientIoc/: IOC 容器管理                           │
│  • bootstraps/: Bootstrap 启动流程                    │
│  📄 详见：why-no-globals.md                           │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  业务层 (Business Layer)                             │
│  • port/: 接口定义 (Interface)                        │
│  • services/: 服务实现                                 │
│  • cases/: 业务用例                                    │
│  • apis/: 外部 API 适配                                │
│  📄 详见：ioc.md                                       │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  UI 层 (UI Layer)                                    │
│  • pages/: 页面组件                                   │
│  • components/: UI 组件                                │
│  • hooks/: React Hooks (useIOC, useStore 等)          │
│  • bridges/: 页面桥接                                  │
│  📄 详见：store.md                                     │
└─────────────────────────────────────────────────────┘
```

### 核心原则

1. **单向依赖** ↓ - 只能从上往下依赖，不能反向
2. **依赖接口不依赖实现** 🔌 - 所有依赖都通过 Interface 定义
3. **UI 与逻辑分离** 🎨 - UI 就是 UI，逻辑就是逻辑
4. **单一职责** 📦 - 每个模块只做一件事
5. **配置驱动** ⚙️ - 业务逻辑由配置驱动

---

## 🏗️ 分层架构

### 1. 配置层 (Config Layer)

**位置：** `config/`, `src/base/cases/AppConfig.ts`

**职责：**

- 统一管理所有配置（路由、主题、i18n、IOC 标识符等）
- 作为环境变量的注入目标

**文件结构：**

```
config/
├── common.ts              # 公共配置
├── theme.ts               # 主题配置
├── app.router.ts          # 路由配置
├── IOCIdentifier.ts       # IOC 标识符
├── i18n/                  # 国际化配置
└── Identifier/            # 业务标识符
```

**👉 详见：** [环境变量管理文档](./env.md)

### 2. 入口层 (Entry Layer)

**位置：** `src/main.tsx`, `src/core/bootstraps/`

**职责：**

- 应用启动
- 注入全局依赖（浏览器 API）
- 创建 IOC 容器
- 执行 Bootstrap 启动流程

**关键特点：**

- 🔴 **唯一允许直接访问全局变量的地方**
- 🔴 **Bootstrap 在应用渲染前执行所有初始化**

**👉 详见：** [Bootstrap 启动器文档](./bootstrap.md)

### 3. 核心层 (Core Layer)

**位置：** `src/core/`

**职责：**

- 封装浏览器 API（localStorage、cookie 等）
- 管理全局实例（logger、dialog 等）
- IOC 容器初始化和服务注册
- Bootstrap 流程控制

**文件结构：**

```
core/
├── globals.ts              # 全局变量封装
├── IOC.ts                  # IOC 工具
├── bootstraps/             # 启动流程
│   ├── BootstrapClient.ts
│   └── BootstrapsRegistry.ts
└── clientIoc/              # IOC 容器
    ├── ClientIOC.ts
    └── ClientIOCRegister.ts
```

**👉 详见：** [为什么要禁用全局变量文档](./why-no-globals.md)

### 4. 业务层 (Business Layer)

**位置：** `src/base/`

**职责：**

- 定义业务接口（Port）
- 实现业务服务（Services）
- 处理业务逻辑（Cases）
- 适配外部 API（APIs）

**文件结构：**

```
base/
├── port/                   # 接口定义
│   ├── UserServiceInterface.ts
│   └── I18nServiceInterface.ts
├── services/               # 服务实现
│   ├── UserService.ts
│   └── I18nService.ts
├── cases/                  # 业务用例
│   ├── AppConfig.ts
│   └── AppError.ts
└── apis/                   # API 适配器
    └── userApi/
        ├── UserApi.ts
        └── UserApiType.ts
```

**关键特点：**

- 🔵 **面向接口** - 所有依赖通过接口注入
- 🔵 **单一职责** - 每个服务只负责一个领域
- 🔵 **可测试性** - 易于 mock 和测试

**👉 详见：** [IOC 容器文档](./ioc.md)

### 5. UI 层 (UI Layer)

**位置：** `src/pages/`, `src/uikit/`

**职责：**

- 渲染页面和组件
- 处理用户交互
- 通过 `useIOC` 获取服务
- 通过 `useStore` 订阅状态

**文件结构：**

```
├── pages/                  # 页面组件
│   ├── base/
│   └── auth/
└── uikit/                  # UI 工具
    ├── components/         # 公共组件
    ├── hooks/              # React Hooks
    │   ├── useIOC.ts       # IOC Hook
    │   └── useStore.ts     # Store Hook
    ├── contexts/           # React Context
    └── bridges/            # 页面桥接
```

**关键特点：**

- 🟢 **不直接依赖实现** - 通过 IOC 获取服务
- 🟢 **UI 和逻辑分离** - 只处理渲染和交互
- 🟢 **响应式更新** - 通过 Store 自动更新

**👉 详见：** [Store 状态管理文档](./store.md)

---

## 🔄 完整的工作流程

### 数据流向图

```
┌─────────────────────────────────────────────┐
│  1. 用户交互（UI 层）                         │
│  const userService = useIOC('UserService')  │
│  userService.login(username, password)      │
└──────────────────┬──────────────────────────┘
                   ↓ (通过 IOC 调用服务)
┌─────────────────────────────────────────────┐
│  2. 服务层处理（Business 层）                 │
│  async login(username, password) {          │
│    const response = await this.api.login()  │
│    this.storage.setItem('token', ...)       │
│    this.emit({ user: ... })  // 通知 UI     │
│  }                                          │
└──────────────┬─────────────┬────────────────┘
               ↓             ↓ (调用 API)
      (使用 Storage)    ┌─────────────────────┐
               ↓         │  3. API 层           │
    ┌──────────────┐    │  POST /api/login    │
    │ Core/Globals │    └─────────────────────┘
    │ localStorage │              ↓
    └──────────────┘         (HTTP 请求)
               ↓                 ↓
    (数据持久化)           (后端服务器)
               ↓                 ↓
               └────←── 返回数据 ←┘
                         ↓
               (emit 发布新状态)
                         ↓
          ┌─────────────────────────┐
          │  4. Store 通知订阅者      │
          │  listeners.forEach(...)  │
          └─────────────────────────┘
                         ↓
          ┌─────────────────────────┐
          │  5. UI 自动更新           │
          │  useStore 收到通知       │
          │  组件重新渲染            │
          └─────────────────────────┘
```

### 应用启动流程

```
1️⃣ main.tsx
   ↓
2️⃣ BootstrapClient.main()
   ├── 创建 IOC 容器
   ├── 注册所有服务
   ├── 执行 Bootstrap 插件
   │   ├── InjectEnv (注入环境变量到 AppConfig)
   │   ├── I18nService.onBefore() (初始化 i18n)
   │   ├── UserService.onBefore() (检查用户登录)
   │   └── ProcesserExecutor.startup() (启动处理器)
   └── Bootstrap 完成
       ↓
3️⃣ React 应用渲染
   ├── App.tsx
   ├── IOCContext.Provider (提供 IOC 容器)
   └── AppRouterProvider (路由)
       ↓
4️⃣ 页面组件渲染
   ├── useIOC() 获取服务
   ├── useStore() 订阅状态
   └── UI 渲染
```

---

## 💡 核心概念

### 1. IOC 容器（依赖注入）⭐

**核心理念：** UI 就是 UI，逻辑就是逻辑，两者必须分离

```typescript
// ❌ 传统方式：UI 和逻辑混在一起
function UserProfile() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch('/api/user').then(res => res.json()).then(setUser);
  }, []);
  return <div>{user?.name}</div>;
}

// ✅ IOC 方式：UI 和逻辑完全分离
function UserProfile() {
  const userService = useIOC('UserServiceInterface');  // 获取服务
  const { user } = useStore(userService);               // 订阅状态
  return <div>{user?.name}</div>;
}
```

**关键问题：**

1. **为什么一个实现类也需要接口？** → 为了可测试性
2. **为什么简单组件也要分离？** → 现在简单不代表将来简单

**👉 详见：** [IOC 容器详细文档](./ioc.md)

### 2. Store 状态管理（应用层通知 UI 层）⭐

**核心理念：** Service 通过 Store 发布状态，UI 通过 useStore 订阅状态

```typescript
// Service（应用层）
@injectable()
export class UserService extends StoreInterface<UserState> {
  async login(username: string, password: string) {
    this.emit({ loading: true });  // 发布：开始加载
    const response = await this.api.login({ username, password });
    this.emit({ user: response.user, loading: false });  // 发布：完成
  }
}

// UI（UI 层）
function LoginPage() {
  const userService = useIOC('UserServiceInterface');
  const { loading } = useStore(userService);  // 订阅：自动更新

  return (
    <button onClick={() => userService.login('user', 'pass')} disabled={loading}>
      {loading ? 'Logging in...' : 'Login'}
    </button>
  );
}
```

**👉 详见：** [Store 状态管理详细文档](./store.md)

### 3. Bootstrap 启动器（应用初始化）⭐

**核心理念：** 在应用渲染前执行所有初始化逻辑

```typescript
// Bootstrap 插件
export class I18nService implements BootstrapPlugin {
  onBefore() {
    // 在应用启动前初始化 i18n
    i18n.init({
      /* ... */
    });
  }
}

// Bootstrap 执行
const bootstrap = new Bootstrap({
  root: window,
  ioc: clientIOC
});

await bootstrap.initialize(); // 执行所有插件的 onBefore
await bootstrap.start(); // 启动应用
```

**👉 详见：** [Bootstrap 启动器详细文档](./bootstrap.md)

### 4. 环境变量管理（多环境配置）⭐

**核心理念：** 使用 `vite --mode` 切换环境，通过 Bootstrap 注入到 AppConfig

```bash
# 不同环境
npm run dev           # 开发环境 (.env.localhost)
npm run dev:staging   # 测试环境 (.env.staging)
npm run build         # 生产环境 (.env.production)
```

```typescript
// AppConfig 自动注入环境变量
export class AppConfig {
  readonly env: string;
  readonly apiBaseUrl = ''; // 自动从 VITE_API_BASE_URL 注入
  readonly appName = ''; // 自动从 VITE_APP_NAME 注入
}

// 使用
const config = useIOC(IOCIdentifier.AppConfig);
console.log(config.apiBaseUrl); // 根据环境自动切换
```

**👉 详见：** [环境变量管理详细文档](./env.md)

### 5. 国际化（i18n Key）⭐

**核心理念：** 所有文字都使用 i18n Key，绝不硬编码

```typescript
// ❌ 错误：硬编码文本
<button>登录</button>

// ✅ 正确：使用 i18n Key
import { BUTTON_LOGIN } from '@config/Identifier';
<button>{t(BUTTON_LOGIN)}</button>
```

**核心优势：** 开发者不需要记住 `'common:button.login'` 字符串，只需要知道 `BUTTON_LOGIN` 变量，IDE 会自动补全

**👉 详见：** [国际化详细文档](./i18n.md)

---

## 📝 快速示例

### 示例：创建一个主题切换功能

```typescript
// 1️⃣ 定义接口 (base/port/ThemeServiceInterface.ts)
export interface ThemeServiceInterface {
  setTheme(theme: 'light' | 'dark'): void;
  getTheme(): 'light' | 'dark';
}

// 2️⃣ 实现服务 (base/services/ThemeService.ts)
@injectable()
export class ThemeService extends StoreInterface<ThemeState> {
  constructor(
    @inject(IOCIdentifier.LocalStorage) private storage: Storage
  ) {
    super(() => ({ theme: 'light' }));
  }

  setTheme(theme: 'light' | 'dark') {
    this.storage.setItem('theme', theme);
    this.emit({ theme });  // 通知 UI 更新
  }

  getTheme() {
    return this.state.theme;
  }
}

// 3️⃣ 注册到 IOC (core/clientIoc/ClientIOCRegister.ts)
register(ioc: IOCContainer) {
  ioc.bind(IOCIdentifier.ThemeServiceInterface, ThemeService);
}

// 4️⃣ UI 使用 (components/ThemeSwitcher.tsx)
function ThemeSwitcher() {
  const themeService = useIOC('ThemeServiceInterface');
  const { theme } = useStore(themeService);

  return (
    <button onClick={() => themeService.setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
```

**完整的开发流程请查看：** [开发指南](./development-guide.md)

---

## 📚 详细文档导航

### 核心文档 ⭐

#### 1. [开发指南](./development-guide.md)

**适合人群：** 准备开发新功能的开发者  
**阅读时间：** 20-30 分钟

**内容概览：**

- 开发一个页面需要什么（8 项清单）
- 完整的 10 步开发流程
- 实战示例：用户列表页（完整代码）
- 常见场景（添加按钮、弹窗、搜索等）
- 代码规范和开发工具

**核心价值：** 手把手教你开发一个完整的页面

#### 2. [IOC 容器](./ioc.md)

**核心问题：** UI 和逻辑如何分离？为什么需要接口？

**关键内容：**

- 为什么需要 IOC（UI 和逻辑分离）
- 两个关键问题：
  1. 为什么一个实现类也需要接口？（可测试性）
  2. 为什么简单组件也要分离？（未来扩展性）
- 如何独立测试逻辑和 UI
- 如何组合测试
- 完整的实战示例

**适合场景：**

- 需要创建新的服务
- 需要理解依赖注入
- 需要编写可测试的代码

#### 3. [Store 状态管理](./store.md)

**核心问题：** 应用层（Service）如何通知 UI 层更新？

**关键内容：**

- 为什么需要 Store（解决通信问题）
- Service 通过 `emit` 发布状态
- UI 通过 `useStore` 订阅状态
- 选择器和性能优化
- 独立测试和组合测试

**适合场景：**

- Service 需要通知 UI 更新
- 需要实现响应式 UI
- 需要优化渲染性能

#### 4. [Bootstrap 启动器](./bootstrap.md)

**核心问题：** 应用如何初始化？为什么需要 Bootstrap？

**关键内容：**

- 什么是 Bootstrap（插件系统）
- 为什么需要 Bootstrap（问题驱动）
- Bootstrap 的核心优势（特别是测试）
- 完整的项目实现和示例
- Vitest 测试指南

**适合场景：**

- 需要在应用启动前执行初始化逻辑
- 需要理解应用启动流程
- 需要添加新的启动插件

#### 5. [环境变量管理](./env.md)

**核心问题：** 如何管理多环境配置？

**关键内容：**

- 使用 `vite --mode` 切换环境
- `.env` 文件管理和优先级
- AppConfig 自动注入机制
- Bootstrap 的 InjectEnv 插件
- 多环境配置示例

**适合场景：**

- 需要添加新的环境变量
- 需要切换开发/测试/生产环境
- 需要理解配置注入机制

#### 6. [国际化 (i18n)](./i18n.md)

**核心问题：** 如何管理多语言文本？

**关键内容：**

- **核心原则：** 所有文字都使用 i18n Key，绝不硬编码
- **核心优势：** 减少开发者思考（不需要记字符串，只需记变量名）
- 自动生成翻译文件（ts2Locales）
- I18nService Bootstrap 插件
- 完整的使用示例

**适合场景：**

- 需要添加新的文本
- 需要支持新语言
- 需要理解 i18n Key 概念

### 辅助文档

#### [为什么要禁用全局变量](./why-no-globals.md)

**核心问题：** 为什么不能直接使用 `window`、`document` 等？

**关键内容：**

- 核心理念：全局变量应该从入口注入
- 允许使用的位置：`main.tsx`、`core/globals.ts`
- 为什么需要这样做（测试、SSR、可追溯性）
- 实际应用场景（IOC 容器）
- 测试友好性对比

#### [路由管理](./router.md)

**核心内容：**

- 路由配置文件（`config/app.router.ts`）
- 路由元数据（title、requiresAuth 等）
- 动态路由加载
- RouteService 使用

#### [主题系统](./theme.md)

**核心内容：**

- Tailwind CSS 配置
- CSS 变量管理
- 主题切换实现
- ThemeService 使用

#### [请求处理](./request.md)

**核心内容：**

- API 适配器模式
- 请求插件系统
- 错误处理
- Mock 数据

#### [测试指南](./test-guide.md)

**核心内容：**

- Vitest 测试框架
- 服务测试（逻辑层）
- UI 测试（组件层）
- 集成测试（流程）
- 测试最佳实践

#### [TypeScript 指南](./typescript-guide.md)

**核心内容：**

- TypeScript 类型规范
- 泛型使用
- 类型推导
- 常见问题

---

## 🎯 快速查找

### 我想...

**开发一个新页面** → [开发指南](./development-guide.md)

**理解 UI 和逻辑分离** → [IOC 容器](./ioc.md)

**让 Service 通知 UI 更新** → [Store 状态管理](./store.md)

**添加环境变量** → [环境变量管理](./env.md)

**添加多语言文本** → [国际化](./i18n.md)

**在应用启动前执行初始化** → [Bootstrap 启动器](./bootstrap.md)

**封装浏览器 API** → [为什么要禁用全局变量](./why-no-globals.md)

**添加路由** → [路由管理](./router.md)

**切换主题** → [主题系统](./theme.md)

**调用 API** → [请求处理](./request.md)

**编写测试** → [测试指南](./test-guide.md)

**解决 TypeScript 问题** → [TypeScript 指南](./typescript-guide.md)

---

## 🎯 核心理念总结

| 理念         | 说明                      | 收益               |
| ------------ | ------------------------- | ------------------ |
| **分层架构** | 清晰的职责划分            | 易于理解、易于维护 |
| **单向依赖** | 只能从上往下依赖          | 避免循环依赖       |
| **面向接口** | 依赖接口不依赖实现        | 易于测试、易于替换 |
| **依赖注入** | 由 IOC 容器管理依赖       | 解耦、可测试       |
| **UI 分离**  | UI 就是 UI，逻辑就是逻辑  | 独立测试、可复用   |
| **状态管理** | Service emit，UI useStore | 自动更新、保持分离 |
| **单一职责** | 每个模块只做一件事        | 易于复用、易于维护 |
| **配置驱动** | 业务由配置驱动            | 灵活、易于扩展     |

---

## 🚦 开发流程

```
1. 定义 i18n Key (config/Identifier/)
   ↓
2. 定义接口 (base/port/)
   ↓
3. 实现服务 (base/services/)
   ↓
4. 实现 API（如需要） (base/apis/)
   ↓
5. 配置路由 (config/app.router.ts)
   ↓
6. 实现页面 (pages/)
   ├── useIOC() 获取服务
   └── useStore() 订阅状态
   ↓
7. 注册 IOC（如果是新服务） (core/clientIoc/)
   ↓
8. 编写测试 (__tests__/)
   ├── 服务测试（逻辑）
   ├── UI 测试（渲染）
   └── 集成测试（流程）
```

---

## 💡 开发建议

### 新手开发者

1. 先理解架构 - 阅读本文档
2. 了解 IOC - 阅读 [IOC 容器文档](./ioc.md)
3. 了解 Store - 阅读 [Store 文档](./store.md)
4. 看示例代码 - 参考现有的 `UserService`、`I18nService` 等
5. 动手实践 - 创建一个简单的功能

### 有经验的开发者

- **Bootstrap 机制** → [Bootstrap 文档](./bootstrap.md)
- **环境变量管理** → [环境变量文档](./env.md)
- **国际化实现** → [i18n 文档](./i18n.md)
- **全局变量规范** → [why-no-globals 文档](./why-no-globals.md)

---

**问题反馈：**  
如果你对架构设计有任何疑问或建议，请在团队频道中讨论或提交 Issue。
