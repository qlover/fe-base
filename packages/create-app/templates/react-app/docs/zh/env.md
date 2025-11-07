# 环境变量管理

## 📋 目录

- [什么是环境变量管理](#-什么是环境变量管理)
- [为什么需要环境变量](#-为什么需要环境变量)
- [工作原理](#-工作原理)
- [项目中的实现](#-项目中的实现)
- [多环境配置](#-多环境配置)
- [环境变量注入](#-环境变量注入)
- [AppConfig 使用](#-appconfig-使用)
- [高级用法](#-高级用法)
- [测试配置](#-测试配置)
- [最佳实践](#-最佳实践)
- [常见问题](#-常见问题)

---

## 🎯 什么是环境变量管理

环境变量管理是 Bootstrap 架构的核心组成部分，负责在不同环境（开发、测试、生产）中使用不同的配置，并通过 **自动注入** 的方式将配置传递给应用。

### 核心流程

```
启动应用 → Vite 加载 .env 文件 → Bootstrap 初始化 → 注入环境变量到 AppConfig → IOC 容器 → 应用使用
```

### 关键概念

```
┌─────────────────────────────────────────────────┐
│  环境变量管理系统                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ 1. Vite --mode 选择环境                    │  │
│  │ 2. 加载对应的 .env 文件                    │  │
│  │ 3. envConfig 插件预处理                    │  │
│  │ 4. Bootstrap 注入到 AppConfig             │  │
│  │ 5. 注册到 IOC 容器                         │  │
│  │ 6. 应用通过 IOC 获取配置                   │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 🤔 为什么需要环境变量

### 问题：硬编码配置的痛点

#### ❌ 传统方式：配置散落各处

```typescript
// ❌ 问题 1：API 地址硬编码在代码中
function fetchUserInfo() {
  // 😰 开发环境和生产环境的 API 地址不同，每次切换都要改代码
  return fetch('http://localhost:3000/api/user');
}

// ❌ 问题 2：配置散落在各个文件
function saveToken(token: string) {
  // 😰 存储键名硬编码，难以统一管理
  localStorage.setItem('user_token', token);
}

// ❌ 问题 3：敏感信息直接写在代码中
function callAI(prompt: string) {
  // 😰 API Key 直接暴露在代码中，存在安全风险
  return fetch('https://api.openai.com/v1/chat', {
    headers: {
      Authorization: 'Bearer sk-xxxxxxxxxxxx' // 😰 危险！
    }
  });
}

// ❌ 问题 4：环境切换困难
if (window.location.host === 'localhost:3000') {
  // 😰 需要手动判断环境
  apiUrl = 'http://localhost:3000/api';
} else if (window.location.host === 'staging.example.com') {
  apiUrl = 'https://api.staging.example.com';
} else {
  apiUrl = 'https://api.production.com';
}
```

**问题总结：**

- 😰 **配置散落** - 配置分散在多个文件中，难以管理
- 😰 **环境切换困难** - 需要手动修改代码或使用复杂的条件判断
- 😰 **安全风险** - 敏感信息可能被提交到代码仓库
- 😰 **难以测试** - 测试时需要 mock 大量硬编码的值
- 😰 **团队协作困难** - 每个开发者的本地配置可能不同

#### ✅ 解决方案：环境变量 + AppConfig

```typescript
// ✅ 1. 环境变量文件（不同环境不同配置）
// .env.localhost
VITE_API_BASE_URL=http://localhost:3000/api
VITE_AI_API_TOKEN=sk-dev-xxxxx

// .env.staging
VITE_API_BASE_URL=https://api.staging.example.com
VITE_AI_API_TOKEN=sk-staging-xxxxx

// .env.production
VITE_API_BASE_URL=https://api.production.com
VITE_AI_API_TOKEN=sk-prod-xxxxx

// ✅ 2. AppConfig 统一管理配置
export class AppConfig {
  readonly feApiBaseUrl = '';  // ← 自动注入
  readonly aiApiToken = '';    // ← 自动注入
  readonly userTokenStorageKey = '__fe_user_token__';
}

// ✅ 3. 通过 IOC 容器获取配置
@injectable()
export class UserService {
  constructor(
    @inject(IOCIdentifier.AppConfig) private config: AppConfig
  ) {}

  async fetchUserInfo() {
    // ✅ 从配置中获取 API 地址，自动适配环境
    return fetch(`${this.config.feApiBaseUrl}/user`);
  }
}

// ✅ 4. 运行时切换环境（无需修改代码）
npm run dev              # localhost 环境
npm run dev:staging      # staging 环境
npm run build:production # production 环境
```

**优势：**

- ✅ **集中管理** - 所有配置在 AppConfig 中统一管理
- ✅ **环境切换简单** - 只需切换运行命令
- ✅ **安全** - 敏感信息通过 `.env.local` 管理，不提交到仓库
- ✅ **易于测试** - 测试时可以轻松 mock AppConfig
- ✅ **团队协作友好** - 每个开发者可以有自己的 `.env.local`

---

## ⚙️ 工作原理

### 环境变量加载流程

```
┌────────────────────────────────────────────────────────────┐
│ 1. package.json: 定义启动命令                               │
│    npm run dev → vite --mode localhost                     │
│    npm run dev:staging → vite --mode staging               │
│    npm run build:production → vite build --mode production │
└──────────────────┬─────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────────────────────────┐
│ 2. Vite: 根据 --mode 加载对应的 .env 文件                   │
│    --mode localhost → .env.localhost                       │
│    --mode staging → .env.staging                           │
│    --mode production → .env.production                     │
│                                                            │
│    加载优先级：.env.local > .env.[mode] > .env             │
└──────────────────┬─────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────────────────────────┐
│ 3. vite.config.ts: envConfig 插件预处理                     │
│    - 注入 APP_NAME、APP_VERSION 等                          │
│    - 设置环境变量前缀 (VITE_)                               │
└──────────────────┬─────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────────────────────────┐
│ 4. BootstrapClient: 初始化 Bootstrap                        │
│    envOptions: {                                           │
│      target: appConfig,     // 注入目标                     │
│      source: import.meta.env, // 环境变量源                 │
│      prefix: 'VITE_',       // 前缀                        │
│      blackList: ['env', 'userNodeEnv'] // 黑名单           │
│    }                                                       │
└──────────────────┬─────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────────────────────────┐
│ 5. InjectEnv 插件: 自动注入环境变量到 AppConfig             │
│    - VITE_APP_NAME → appConfig.appName                     │
│    - VITE_FE_API_BASE_URL → appConfig.feApiBaseUrl         │
│    - VITE_AI_API_TOKEN → appConfig.aiApiToken              │
└──────────────────┬─────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────────────────────────┐
│ 6. IOC 容器: 注册 AppConfig                                 │
│    container.bind(IOCIdentifier.AppConfig).toConstantValue │
└──────────────────┬─────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────────────────────────┐
│ 7. 应用使用: 通过 IOC 获取配置                               │
│    const config = useIOC('AppConfig');                     │
│    console.log(config.feApiBaseUrl);                       │
└────────────────────────────────────────────────────────────┘
```

### 命名转换规则

环境变量名会自动转换为 AppConfig 属性名：

```
VITE_APP_NAME          → appName
VITE_FE_API_BASE_URL   → feApiBaseUrl
VITE_AI_API_TOKEN      → aiApiToken
VITE_USER_TOKEN_STORAGE_KEY → userTokenStorageKey
```

**转换规则：**

1. 移除前缀 (`VITE_`)
2. 将下划线分隔转换为驼峰命名
3. 匹配 AppConfig 中的属性名

---

## 🛠️ 项目中的实现

### 1. 定义启动命令

```json
// package.json
{
  "scripts": {
    "dev": "vite --mode localhost",
    "dev:staging": "vite --mode staging",
    "dev:prod": "vite --mode production",
    "build": "npm run lint && vite build",
    "build:staging": "npm run lint && vite build --mode staging",
    "build:production": "npm run lint && vite build --mode production"
  }
}
```

**说明：**

- `--mode` 参数决定加载哪个 `.env` 文件
- 开发环境：使用 `localhost` 模式
- 测试环境：使用 `staging` 模式
- 生产环境：使用 `production` 模式

### 2. 配置 Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vitest/config';
import { envPrefix } from './config/common';
import { name, version } from './package.json';
import envConfig from '@qlover/corekit-bridge/build/vite-env-config';

export default defineConfig({
  plugins: [
    // ✅ envConfig 插件：预处理环境变量
    envConfig({
      envPops: true, // 启用环境变量处理
      envPrefix, // 环境变量前缀: 'VITE_'
      records: [
        ['APP_NAME', name], // 注入应用名称
        ['APP_VERSION', version] // 注入应用版本
      ]
    })
    // ... 其他插件
  ],
  envPrefix: envPrefix, // Vite 环境变量前缀
  server: {
    port: Number(process.env.VITE_SERVER_PORT || 3200)
  }
});
```

**关键配置：**

- `envConfig` 插件负责预处理环境变量
- `records` 可以注入额外的变量（如 package.json 中的信息）
- `envPrefix` 设置为 `'VITE_'`，只有此前缀的变量会被暴露给客户端

### 3. 定义公共配置

```typescript
// config/common.ts
export const envPrefix = 'VITE_';

/**
 * 启动器环境变量注入黑名单
 * 这些属性不会从环境变量注入
 */
export const envBlackList = ['env', 'userNodeEnv'];

export const browserGlobalsName = 'feGlobals';
```

### 4. 定义 AppConfig

```typescript
// src/base/cases/AppConfig.ts
import type { EnvConfigInterface } from '@qlover/corekit-bridge';

/**
 * 应用配置类
 *
 * 所有属性都会在 Bootstrap 初始化时自动注入对应的环境变量值
 *
 * 环境变量命名规则：
 * - 属性名会转换为大写下划线格式
 * - 添加 VITE_ 前缀
 *
 * 示例：
 * - appName → VITE_APP_NAME
 * - feApiBaseUrl → VITE_FE_API_BASE_URL
 * - aiApiToken → VITE_AI_API_TOKEN
 */
export class AppConfig implements EnvConfigInterface {
  constructor(
    /**
     * 当前环境模式
     * @description 从 Vite 的 MODE 自动设置
     */
    readonly env: string = import.meta.env.VITE_USER_NODE_ENV
  ) {}

  /**
   * 应用名称
   * @description 从 VITE_APP_NAME 环境变量注入
   */
  readonly appName = '';

  /**
   * 应用版本
   * @description 从 VITE_APP_VERSION 环境变量注入
   */
  readonly appVersion = '';

  /**
   * 用户令牌存储键
   * @description 从 VITE_USER_TOKEN_STORAGE_KEY 环境变量注入
   */
  readonly userTokenStorageKey = '__fe_user_token__';

  /**
   * 用户信息存储键
   * @description 从 VITE_USER_INFO_STORAGE_KEY 环境变量注入
   */
  readonly userInfoStorageKey = '__fe_user_info__';

  /**
   * 前端 API 基础 URL
   * @description 从 VITE_FE_API_BASE_URL 环境变量注入
   */
  readonly feApiBaseUrl = '';

  /**
   * 用户 API 基础 URL
   * @description 从 VITE_USER_API_BASE_URL 环境变量注入
   */
  readonly userApiBaseUrl = '';

  /**
   * AI API 基础 URL
   * @description 从 VITE_AI_API_BASE_URL 环境变量注入
   */
  readonly aiApiBaseUrl = 'https://api.openai.com/v1';

  /**
   * AI API 令牌
   * @description 从 VITE_AI_API_TOKEN 环境变量注入
   */
  readonly aiApiToken = '';

  /**
   * AI API 令牌前缀
   * @description 从 VITE_AI_API_TOKEN_PREFIX 环境变量注入
   */
  readonly aiApiTokenPrefix = 'Bearer';

  /**
   * 是否需要 AI API 令牌
   * @description 从 VITE_AI_API_REQUIRE_TOKEN 环境变量注入
   */
  readonly aiApiRequireToken = true;

  /**
   * 默认登录用户名
   * @description 从 VITE_LOGIN_USER 环境变量注入
   */
  readonly loginUser = '';

  /**
   * 默认登录密码
   * @description 从 VITE_LOGIN_PASSWORD 环境变量注入
   */
  readonly loginPassword = '';

  /**
   * OpenAI 可用模型列表
   */
  readonly openAiModels = [
    'gpt-4o-mini',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-2',
    'gpt-4',
    'gpt-4-32k'
  ];

  /**
   * OpenAI API 基础 URL
   * @description 从 VITE_OPEN_AI_BASE_URL 环境变量注入
   */
  readonly openAiBaseUrl = '';

  /**
   * OpenAI API 令牌
   * @description 从 VITE_OPEN_AI_TOKEN 环境变量注入
   */
  readonly openAiToken = '';

  /**
   * OpenAI API 令牌前缀
   * @description 从 VITE_OPEN_AI_TOKEN_PREFIX 环境变量注入
   */
  readonly openAiTokenPrefix = '';

  /**
   * 是否需要 OpenAI API 令牌
   * @description 从 VITE_OPEN_AI_REQUIRE_TOKEN 环境变量注入
   */
  readonly openAiRequireToken = true;

  /**
   * 项目启动 URL
   * @description 从 Bootstrap 注入的 BOOT_HREF
   */
  readonly bootHref = '';

  /**
   * 是否为生产环境
   */
  get isProduction(): boolean {
    return this.env === 'production';
  }
}
```

### 5. Bootstrap 配置

```typescript
// src/core/bootstraps/BootstrapClient.ts
import { envBlackList, envPrefix, browserGlobalsName } from '@config/common';
import { Bootstrap } from '@qlover/corekit-bridge';
import * as globals from '../globals';

export class BootstrapClient {
  static async main(args: BootstrapClientArgs) {
    const { root, bootHref, ioc, iocRegister } = args;
    const { logger, appConfig } = globals;

    // 创建 IOC 容器
    const IOC = ioc.create({
      pathname: bootHref,
      appConfig: appConfig
    });

    // 创建 Bootstrap 实例
    const bootstrap = new Bootstrap({
      root,
      logger,
      ioc: {
        manager: IOC,
        register: iocRegister
      },
      // ✅ 环境变量注入配置
      envOptions: {
        target: appConfig, // 注入目标：AppConfig 实例
        source: Object.assign({}, import.meta.env, {
          [envPrefix + 'BOOT_HREF']: bootHref // 额外注入启动 URL
        }),
        prefix: envPrefix, // 环境变量前缀：'VITE_'
        blackList: envBlackList // 黑名单：['env', 'userNodeEnv']
      },
      // 全局变量封装配置
      globalOptions: {
        sources: globals,
        target: browserGlobalsName
      }
    });

    try {
      logger.info('bootstrap start...');

      // ✅ 初始化 Bootstrap（此时会执行环境变量注入）
      await bootstrap.initialize();

      // 注册业务插件
      const bootstrapsRegistry = new BootstrapsRegistry(IOC);
      await bootstrap.use(bootstrapsRegistry.register()).start();

      logger.info('bootstrap completed successfully');
    } catch (error) {
      logger.error(`${appConfig.appName} startup error:`, error);
    }

    return args;
  }
}
```

**关键流程：**

1. `appConfig` 是一个 AppConfig 实例，所有属性都有默认值
2. `bootstrap.initialize()` 时会执行 `InjectEnv` 插件
3. `InjectEnv` 插件遍历 `appConfig` 的属性，从 `import.meta.env` 中查找对应的环境变量
4. 如果找到环境变量且值不为空，则覆盖默认值
5. 最后 `appConfig` 被注册到 IOC 容器中

---

## 🌍 多环境配置

### 环境文件结构

```
项目根目录/
├── .env                    # 默认配置（所有环境共享）
├── .env.localhost          # 本地开发环境
├── .env.staging            # 测试环境
├── .env.production         # 生产环境
├── .env.local              # 本地覆盖配置（不提交到 git）
└── .env.template           # 环境变量模板（提交到 git）
```

### 加载优先级

```
.env.local > .env.[mode] > .env
```

**示例：**

```bash
# 运行：npm run dev (vite --mode localhost)
# 加载顺序：
# 1. .env.local      # 优先级最高
# 2. .env.localhost  # 其次
# 3. .env            # 最后

# 运行：npm run build:production (vite build --mode production)
# 加载顺序：
# 1. .env.local
# 2. .env.production
# 3. .env
```

### 示例 1：默认配置

```bash
# .env
# 所有环境共享的配置

VITE_APP_NAME=MyApp
VITE_USER_TOKEN_STORAGE_KEY=__fe_user_token__
VITE_USER_INFO_STORAGE_KEY=__fe_user_info__
VITE_AI_API_TOKEN_PREFIX=Bearer
VITE_AI_API_REQUIRE_TOKEN=true
```

### 示例 2：本地开发环境

```bash
# .env.localhost
# 本地开发环境配置

# API 配置
VITE_FE_API_BASE_URL=http://localhost:3000/api
VITE_USER_API_BASE_URL=http://localhost:3000/api/user
VITE_AI_API_BASE_URL=http://localhost:3001/v1

# AI 配置（开发环境可能使用本地 Mock）
VITE_AI_API_TOKEN=sk-dev-xxxxx
VITE_AI_API_REQUIRE_TOKEN=false

# 调试配置
VITE_LOG_LEVEL=debug
VITE_DEBUG=true

# 默认登录信息（方便开发）
VITE_LOGIN_USER=admin
VITE_LOGIN_PASSWORD=admin123
```

### 示例 3：测试环境

```bash
# .env.staging
# 测试环境配置

# API 配置
VITE_FE_API_BASE_URL=https://api.staging.example.com
VITE_USER_API_BASE_URL=https://api.staging.example.com/user
VITE_AI_API_BASE_URL=https://api.staging.example.com/ai

# AI 配置
VITE_AI_API_TOKEN=sk-staging-xxxxx
VITE_AI_API_REQUIRE_TOKEN=true

# 调试配置
VITE_LOG_LEVEL=info
VITE_DEBUG=true
```

### 示例 4：生产环境

```bash
# .env.production
# 生产环境配置

# API 配置
VITE_FE_API_BASE_URL=https://api.example.com
VITE_USER_API_BASE_URL=https://api.example.com/user
VITE_AI_API_BASE_URL=https://api.openai.com/v1

# AI 配置
VITE_AI_API_TOKEN=sk-prod-xxxxx
VITE_AI_API_REQUIRE_TOKEN=true

# 调试配置
VITE_LOG_LEVEL=error
VITE_DEBUG=false
```

### 示例 5：本地覆盖配置

```bash
# .env.local
# 本地个人配置，不提交到 git

# 覆盖 AI API Token（使用自己的 Key）
VITE_AI_API_TOKEN=sk-my-personal-key

# 覆盖 API 地址（连接到自己的本地服务）
VITE_FE_API_BASE_URL=http://192.168.1.100:3000/api

# 启用特定功能
VITE_ENABLE_EXPERIMENTAL_FEATURES=true
```

### 示例 6：环境变量模板

```bash
# .env.template
# 环境变量模板，提交到 git 供团队参考

# ===== 必填配置 =====
VITE_FE_API_BASE_URL=https://your-api-url.com
VITE_AI_API_TOKEN=your-ai-api-token-here

# ===== 可选配置 =====
VITE_LOGIN_USER=your-default-username
VITE_LOGIN_PASSWORD=your-default-password

# ===== 说明 =====
# 1. 复制此文件为 .env.local
# 2. 填写实际的配置值
# 3. .env.local 不会被提交到 git
```

---

## 🔄 环境变量注入

### InjectEnv 插件工作原理

```typescript
// @qlover/corekit-bridge/src/core/bootstrap/plugins/InjectEnv.ts (简化版)
export class InjectEnv implements BootstrapExecutorPlugin {
  readonly pluginName = 'InjectEnv';

  constructor(protected options: InjectEnvConfig) {}

  /**
   * 在 Bootstrap 初始化前执行
   */
  onBefore(): void {
    const { target, source, prefix, blackList } = this.options;

    // 遍历目标对象的所有属性
    for (const key in target) {
      // 跳过黑名单中的属性
      if (blackList.includes(key)) {
        continue;
      }

      const currentValue = target[key as keyof typeof target];

      // 获取对应的环境变量值
      const envValue = this.getEnvValue(key, currentValue);

      // 如果环境变量存在且与默认值不同，则注入
      if (!this.isEmpty(envValue) && envValue !== currentValue) {
        target[key as keyof typeof target] = envValue;
      }
    }
  }

  /**
   * 获取环境变量值
   */
  private getEnvValue<D>(key: string, defaultValue?: D): D {
    const { prefix = '', source = {} } = this.options;

    // 将驼峰命名转换为大写下划线命名
    // appName → APP_NAME
    // feApiBaseUrl → FE_API_BASE_URL
    const formattedKey = key.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();

    // 添加前缀
    const envKey = `${prefix}${formattedKey}`;

    // 获取环境变量值
    const value = source[envKey];

    // 如果是 JSON 字符串，则解析
    if (typeof value === 'string' && this.isJSONString(value)) {
      return JSON.parse(value);
    }

    return (value ?? defaultValue) as D;
  }

  /**
   * 判断值是否为空
   */
  private isEmpty(value: any): boolean {
    return value === undefined || value === null || value === '';
  }

  /**
   * 判断是否为 JSON 字符串
   */
  private isJSONString(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
}
```

### 注入示例

```typescript
// 假设有以下环境变量：
VITE_APP_NAME=MyApp
VITE_FE_API_BASE_URL=https://api.example.com
VITE_AI_API_TOKEN=sk-xxxxx

// AppConfig 初始状态：
const appConfig = new AppConfig();
console.log(appConfig.appName);        // ''
console.log(appConfig.feApiBaseUrl);   // ''
console.log(appConfig.aiApiToken);     // ''

// Bootstrap 初始化后（InjectEnv 插件执行后）：
await bootstrap.initialize();

console.log(appConfig.appName);        // 'MyApp'
console.log(appConfig.feApiBaseUrl);   // 'https://api.example.com'
console.log(appConfig.aiApiToken);     // 'sk-xxxxx'
```

---

## 📦 AppConfig 使用

### 1. 在服务中使用（推荐）⭐

```typescript
// src/base/services/UserService.ts
import { injectable, inject } from 'inversify';
import { IOCIdentifier } from '@config/IOCIdentifier';
import type { AppConfig } from '@/base/cases/AppConfig';

@injectable()
export class UserService {
  constructor(
    @inject(IOCIdentifier.AppConfig) private config: AppConfig,
    @inject(UserApi) private api: UserApi
  ) {}

  async login(username: string, password: string) {
    // ✅ 使用配置中的 API 地址
    const response = await this.api.post(
      `${this.config.userApiBaseUrl}/login`,
      { username, password }
    );

    // ✅ 使用配置中的存储键
    this.storage.setItem(this.config.userTokenStorageKey, response.token);

    return response.user;
  }
}
```

### 2. 在 UI 组件中使用

```typescript
// src/pages/base/HomePage.tsx
import { useIOC } from '@/uikit/hooks/useIOC';

function HomePage() {
  // ✅ 通过 Hook 获取配置
  const config = useIOC('AppConfig');

  return (
    <div>
      <h1>{config.appName}</h1>
      <p>Version: {config.appVersion}</p>
      <p>Environment: {config.env}</p>
      {!config.isProduction && <p>🚧 Development Mode</p>}
    </div>
  );
}
```

### 3. 在插件中使用

```typescript
// src/base/apis/feApi/FeApiBootstrap.ts
export class FeApiBootstarp implements BootstrapExecutorPlugin {
  readonly pluginName = 'FeApiBootstarp';

  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    const feApi = ioc.get<FeApi>(FeApi);
    // ✅ 从 IOC 获取配置
    const config = ioc.get<AppConfig>(IOCIdentifier.AppConfig);

    // ✅ 使用配置设置 API 基础 URL
    feApi.setBaseURL(config.feApiBaseUrl);

    // 添加其他插件
    feApi.usePlugin(
      new AuthTokenPlugin({
        getToken: () => {
          const storage = ioc.get(IOCIdentifier.LocalStorageEncrypt);
          return storage.getItem(config.userTokenStorageKey);
        }
      })
    );
  }
}
```

### 4. 直接在代码中使用环境变量

```typescript
// 注意：直接使用 import.meta.env 不推荐，因为无法被 IOC 管理

// ❌ 不推荐：直接使用（绕过了 AppConfig）
function MyComponent() {
  const apiUrl = import.meta.env.VITE_FE_API_BASE_URL;
  // ...
}

// ✅ 推荐：通过 AppConfig 使用
function MyComponent() {
  const config = useIOC('AppConfig');
  const apiUrl = config.feApiBaseUrl;
  // ...
}
```

---

## 🚀 高级用法

### 1. 动态修改配置

有时候你可能需要在运行时动态修改配置（而不是通过环境变量）：

```typescript
// ✅ 方法 1：在 Bootstrap 初始化前修改
const appConfig = new AppConfig();

// 动态修改配置
if (window.location.hostname.includes('localhost')) {
  // 本地开发时使用不同的 API 地址
  (appConfig as any).feApiBaseUrl = 'http://localhost:3000/api';
}

// 然后传递给 Bootstrap
const bootstrap = new Bootstrap({
  envOptions: {
    target: appConfig, // 使用修改后的配置
    source: import.meta.env,
    prefix: 'VITE_',
    blackList: envBlackList
  }
});

await bootstrap.initialize();
```

```typescript
// ✅ 方法 2：创建配置工厂函数
export function createAppConfig(): AppConfig {
  const config = new AppConfig();

  // 根据特定条件动态设置配置
  if (someCondition) {
    (config as any).aiApiBaseUrl = 'https://custom-api.com';
  }

  return config;
}

// 在 Bootstrap 中使用
const appConfig = createAppConfig();
```

### 2. 配置验证

```typescript
// src/base/cases/AppConfig.ts
export class AppConfig implements EnvConfigInterface {
  // ... 属性定义

  /**
   * 验证必需的配置项
   */
  validate(): void {
    const required: (keyof AppConfig)[] = [
      'appName',
      'feApiBaseUrl',
      'userTokenStorageKey'
    ];

    for (const key of required) {
      if (!this[key]) {
        throw new Error(`Missing required configuration: ${key}`);
      }
    }
  }
}

// 在 Bootstrap 中使用
const appConfig = new AppConfig();

await bootstrap.initialize();

// 初始化后验证
appConfig.validate();
```

### 3. 配置组合

```typescript
// ✅ 方法 3：从多个源组合配置
const appConfig = new AppConfig();

const bootstrap = new Bootstrap({
  envOptions: {
    target: appConfig,
    // 合并多个配置源
    source: Object.assign(
      {},
      import.meta.env, // Vite 环境变量
      { VITE_BOOT_HREF: window.location.href }, // 运行时信息
      window.__APP_CONFIG__ // 服务端注入的配置
    ),
    prefix: 'VITE_',
    blackList: envBlackList
  }
});
```

### 4. 条件配置

```typescript
// src/core/bootstraps/BootstrapClient.ts
const appConfig = new AppConfig();

// ✅ 根据环境设置不同的配置源
const configSource =
  import.meta.env.VITE_USER_NODE_ENV === 'production'
    ? import.meta.env // 生产环境：只使用环境变量
    : {
        ...import.meta.env,
        ...window.__DEV_CONFIG__ // 开发环境：允许 window 注入
      };

const bootstrap = new Bootstrap({
  envOptions: {
    target: appConfig,
    source: configSource,
    prefix: 'VITE_',
    blackList: envBlackList
  }
});
```

---

## 🧪 测试配置

### 1. 测试时 Mock AppConfig

```typescript
// __tests__/src/base/services/UserService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '@/base/services/UserService';
import type { AppConfig } from '@/base/cases/AppConfig';

describe('UserService', () => {
  let userService: UserService;
  let mockConfig: AppConfig;

  beforeEach(() => {
    // ✅ 创建 mock 配置
    mockConfig = {
      userApiBaseUrl: 'http://localhost:3000/api',
      userTokenStorageKey: '__test_token__',
      userInfoStorageKey: '__test_user__',
      isProduction: false
    } as AppConfig;

    // 创建服务
    userService = new UserService(mockConfig, mockApi, mockStorage);
  });

  it('should use config values', async () => {
    await userService.login('user', 'pass');

    // ✅ 验证使用了配置中的值
    expect(mockApi.post).toHaveBeenCalledWith(
      `${mockConfig.userApiBaseUrl}/login`,
      expect.any(Object)
    );
  });
});
```

### 2. 测试不同环境配置

```typescript
// __tests__/src/base/cases/AppConfig.test.ts
import { describe, it, expect } from 'vitest';
import { AppConfig } from '@/base/cases/AppConfig';

describe('AppConfig', () => {
  it('should detect production environment', () => {
    const config = new AppConfig('production');
    expect(config.isProduction).toBe(true);
  });

  it('should detect non-production environment', () => {
    const config = new AppConfig('localhost');
    expect(config.isProduction).toBe(false);
  });

  it('should have default values', () => {
    const config = new AppConfig();
    expect(config.appName).toBe('');
    expect(config.userTokenStorageKey).toBe('__fe_user_token__');
  });
});
```

### 3. 测试环境变量注入

```typescript
// __tests__/src/core/bootstraps/BootstrapClient.test.ts
import { describe, it, expect, vi } from 'vitest';
import { BootstrapClient } from '@/core/bootstraps/BootstrapClient';

describe('BootstrapClient', () => {
  it('should inject environment variables to AppConfig', async () => {
    const mockArgs = {
      root: {},
      bootHref: 'http://localhost:3000',
      ioc: {
        create: vi.fn().mockReturnValue(mockIOC)
      }
    };

    // 执行启动
    await BootstrapClient.main(mockArgs);

    // ✅ 验证配置已注入
    const globals = (mockArgs.root as any).feGlobals;
    expect(globals.appConfig).toBeDefined();
    expect(globals.appConfig.appName).toBeTruthy();
  });
});
```

---

## 💎 最佳实践

### 1. ✅ 使用环境变量前缀

```bash
# ✅ 好的命名：使用 VITE_ 前缀
VITE_APP_NAME=MyApp
VITE_API_BASE_URL=https://api.example.com

# ❌ 错误命名：没有前缀
APP_NAME=MyApp
API_BASE_URL=https://api.example.com
```

### 2. ✅ 敏感信息使用 .env.local

```bash
# .env.local（不提交到 git）
VITE_AI_API_TOKEN=sk-your-secret-key
VITE_DATABASE_PASSWORD=your-password

# .gitignore
.env.local
```

### 3. ✅ 提供 .env.template

```bash
# .env.template（提交到 git）
# 团队成员可以复制此文件为 .env.local 并填写实际值

VITE_AI_API_TOKEN=your-api-token-here
VITE_DATABASE_PASSWORD=your-password-here
```

### 4. ✅ 使用类型安全的配置

```typescript
// ✅ 好的做法：通过 AppConfig 访问
const config = useIOC('AppConfig');
const apiUrl = config.feApiBaseUrl; // ✅ 类型安全

// ❌ 不好的做法：直接访问环境变量
const apiUrl = import.meta.env.VITE_FE_API_BASE_URL; // ❌ 可能为 undefined
```

### 5. ✅ 为 AppConfig 添加注释

```typescript
export class AppConfig {
  /**
   * AI API 基础 URL
   * @description 从 VITE_AI_API_BASE_URL 环境变量注入
   * @default 'https://api.openai.com/v1'
   * @example 'https://api.openai.com/v1'
   */
  readonly aiApiBaseUrl = 'https://api.openai.com/v1';
}
```

### 6. ✅ 避免在代码中判断环境

```typescript
// ❌ 不好：在代码中判断环境
if (process.env.NODE_ENV === 'production') {
  apiUrl = 'https://api.production.com';
} else {
  apiUrl = 'http://localhost:3000';
}

// ✅ 好：通过配置管理
const config = useIOC('AppConfig');
const apiUrl = config.feApiBaseUrl; // 自动根据环境使用正确的值
```

### 7. ✅ 配置命名规范

```bash
# ✅ 好的命名：清晰、具体
VITE_FE_API_BASE_URL=https://api.example.com
VITE_USER_TOKEN_STORAGE_KEY=__fe_user_token__
VITE_AI_API_REQUIRE_TOKEN=true

# ❌ 不好的命名：模糊、简写
VITE_API=https://api.example.com
VITE_KEY=__token__
VITE_REQ=true
```

---

## ❓ 常见问题

### Q1: 为什么我的环境变量没有注入？

**A:** 检查以下几点：

1. **环境变量前缀**

```bash
# ✅ 正确：使用 VITE_ 前缀
VITE_APP_NAME=MyApp

# ❌ 错误：没有前缀
APP_NAME=MyApp
```

2. **AppConfig 属性名**

```typescript
// ✅ 正确：属性名存在
export class AppConfig {
  readonly appName = ''; // ← VITE_APP_NAME 会注入这里
}

// ❌ 错误：没有对应的属性
export class AppConfig {
  // 没有 appName 属性，VITE_APP_NAME 不会被注入
}
```

3. **黑名单配置**

```typescript
// config/common.ts
export const envBlackList = ['env', 'userNodeEnv'];
// 确保你的属性不在黑名单中
```

### Q2: 如何在不同环境使用不同配置？

**A:** 使用 `--mode` 参数：

```json
{
  "scripts": {
    "dev": "vite --mode localhost", // 加载 .env.localhost
    "dev:staging": "vite --mode staging", // 加载 .env.staging
    "build:prod": "vite build --mode production" // 加载 .env.production
  }
}
```

### Q3: 如何处理敏感信息？

**A:** 使用 `.env.local`：

```bash
# .env.local（不提交到 git）
VITE_AI_API_TOKEN=sk-your-secret-key

# .gitignore
.env.local
```

### Q4: 能否在运行时动态修改配置？

**A:** 可以，但需要在 Bootstrap 初始化前：

```typescript
const appConfig = new AppConfig();

// ✅ 在 Bootstrap 初始化前修改
(appConfig as any).feApiBaseUrl = 'https://custom-api.com';

const bootstrap = new Bootstrap({
  envOptions: {
    target: appConfig, // 使用修改后的配置
    source: import.meta.env,
    prefix: 'VITE_',
    blackList: envBlackList
  }
});

await bootstrap.initialize();
```

### Q5: 为什么推荐通过 AppConfig 而不是直接使用 import.meta.env？

**A:**

| 特性           | import.meta.env     | AppConfig       |
| -------------- | ------------------- | --------------- |
| **类型安全**   | ❌ 可能为 undefined | ✅ 完整类型定义 |
| **默认值**     | ❌ 没有             | ✅ 有默认值     |
| **可测试性**   | ❌ 难以 mock        | ✅ 易于 mock    |
| **集中管理**   | ❌ 分散各处         | ✅ 统一管理     |
| **运行时修改** | ❌ 不可能           | ✅ 可以         |

### Q6: 环境变量和配置文件有什么区别？

**A:**

**环境变量：** 适用于：

- 不同环境的配置（API 地址、Token 等）
- 敏感信息
- 部署时需要修改的配置

**配置文件（config/）：** 适用于：

- 应用逻辑配置（路由、主题、i18n 等）
- 不随环境变化的配置
- 代码级的配置

---

## 📚 相关文档

- [项目架构设计](./index.md) - 了解整体架构
- [Bootstrap 启动器](./bootstrap.md) - Bootstrap 详解
- [IOC 容器](./ioc.md) - 依赖注入详解
- [全局变量封装](./global.md) - 浏览器 API 封装

---

## 🎉 总结

环境变量管理系统通过 **Bootstrap + AppConfig + IOC** 的组合，提供了：

1. **环境隔离** 🌍 - 不同环境使用不同配置，无需修改代码
2. **类型安全** 🔒 - 通过 TypeScript 提供完整的类型检查
3. **集中管理** 📦 - 所有配置在 AppConfig 中统一管理
4. **自动注入** ⚡ - Bootstrap 自动将环境变量注入到 AppConfig
5. **易于测试** 🧪 - 可以轻松 mock AppConfig 进行测试
6. **灵活扩展** 🚀 - 支持多种配置源和动态修改

通过合理使用环境变量管理，你可以构建一个更加健壮、灵活、易于维护的应用架构。

---

**问题反馈：**  
如果你对环境变量管理有任何疑问或建议，请在团队频道中讨论或提交 Issue。
