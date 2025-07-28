# 环境变量注入

## 什么是环境变量注入？

环境变量注入是 Bootstrap 的一个重要功能，它允许我们将环境变量自动注入到应用配置中，实现配置的集中管理和环境隔离。

**简单来说**：就像给应用穿上不同的衣服一样，根据不同的环境（开发、测试、生产），应用会使用不同的配置。

## 工作原理

### 1. 环境变量加载流程

```
应用启动 → Bootstrap 初始化 → InjectEnv 插件 → 加载环境变量 → 注入到 AppConfig → 应用使用配置
```

### 2. 核心技术栈

- **@qlover/env-loader**：环境变量加载器
- **@qlover/corekit-bridge/vite-env-config**：Vite 环境变量配置插件
- **dotenv**：.env 文件解析
- **Vite**：前端构建工具

### 3. 文件结构

```
项目根目录/
├── .env                    # 默认环境变量
├── .env.local             # 本地环境变量（git ignored）
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
├── .env.staging           # 测试环境变量
├── vite.config.ts         # Vite 配置
└── src/
    └── base/
        └── cases/
            └── AppConfig.ts # 应用配置类
```

## 环境变量文件

### 1. 文件加载优先级

Vite 会按照以下优先级加载环境变量文件：

```
.env.local > .env.[mode] > .env
```

**示例**：

```bash
# 开发模式
vite dev --mode development
# 加载顺序：.env.local > .env.development > .env

# 生产模式
vite build --mode production
# 加载顺序：.env.local > .env.production > .env

# 自定义模式
vite dev --mode staging
# 加载顺序：.env.local > .env.staging > .env
```

### 2. 环境变量文件示例

```bash
# .env (默认配置)
VITE_APP_NAME=MyApp
VITE_API_BASE_URL=http://api.example.com
VITE_USER_TOKEN_KEY=user_token

# .env.development (开发环境)
VITE_API_BASE_URL=http://localhost:3000/api
VITE_DEBUG=true

# .env.production (生产环境)
VITE_API_BASE_URL=https://api.production.com
VITE_DEBUG=false

# .env.local (本地覆盖，不提交到 git)
VITE_API_KEY=your_secret_key
VITE_LOCAL_DEBUG=true
```

## 项目中的实现

### 1. Vite 配置

```tsx
// vite.config.ts
import envConfig from '@qlover/corekit-bridge/vite-env-config';

export default defineConfig({
  plugins: [
    envConfig({
      envPops: true, // 启用环境变量加载
      envPrefix: 'VITE_', // 环境变量前缀
      records: [
        ['APP_NAME', name], // 注入应用名称
        ['APP_VERSION', version] // 注入应用版本
      ]
    })
  ],
  envPrefix: 'VITE_', // Vite 环境变量前缀
  server: {
    port: Number(process.env.VITE_SERVER_PORT || 3200)
  }
});
```

### 2. 应用配置类

```tsx
// src/base/cases/AppConfig.ts
export class AppConfig implements EnvConfigInterface {
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
   * 当前环境模式
   * @description 从 Vite 的 mode 获取
   */
  readonly env: string = import.meta.env.MODE;

  /**
   * 用户令牌存储键
   * @description 从 VITE_USER_TOKEN_STORAGE_KEY 环境变量注入
   */
  readonly userTokenStorageKey = '__fe_user_token__';

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

  // ... 更多配置项
}
```

### 3. Bootstrap 中的注入

```tsx
// src/core/bootstraps/BootstrapApp.ts
const bootstrap = new Bootstrap({
  root: window,
  logger,
  ioc: {
    manager: IOC,
    register: new IocRegisterImpl({ pathname, appConfig })
  },
  envOptions: {
    target: appConfig, // 注入目标
    source: {
      ...import.meta.env, // 环境变量源
      [envPrefix + 'BOOT_HREF']: root.location.href
    },
    prefix: envPrefix, // 环境变量前缀
    blackList: envBlackList // 黑名单（不注入的变量）
  }
});
```

## 多环境配置

### 1. 开发环境配置

```bash
# package.json
{
  "scripts": {
    "dev": "vite --mode localhost",
    "dev:staging": "vite --mode staging",
    "dev:prod": "vite --mode production"
  }
}
```

```bash
# .env.development
VITE_APP_NAME=MyApp Dev
VITE_API_BASE_URL=http://localhost:3000/api
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

### 2. 测试环境配置

```bash
# .env.staging
VITE_APP_NAME=MyApp Staging
VITE_API_BASE_URL=https://api.staging.com
VITE_DEBUG=true
VITE_LOG_LEVEL=info
```

### 3. 生产环境配置

```bash
# .env.production
VITE_APP_NAME=MyApp
VITE_API_BASE_URL=https://api.production.com
VITE_DEBUG=false
VITE_LOG_LEVEL=warn
```

### 4. 本地覆盖配置

```bash
# .env.local (不提交到 git)
VITE_API_KEY=your_secret_key
VITE_LOCAL_DEBUG=true
VITE_CUSTOM_FEATURE=true
```

## 在代码中使用

### 1. 直接使用环境变量

```tsx
// 在组件中直接使用
function App() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const isDebug = import.meta.env.VITE_DEBUG === 'true';
  return (
    <div>
      <p>API URL: {apiUrl}</p>
      {isDebug && <p>Debug mode enabled</p>}
    </div>
  );
}
```

### 2. 通过 AppConfig 使用

```tsx
// 通过 IOC 获取配置
function UserService() {
  const appConfig = IOC(IOCIdentifier.AppConfig);

  const apiUrl = appConfig.aiApiBaseUrl;
  const token = appConfig.aiApiToken;

  // 使用配置进行 API 调用
  const response = await fetch(`${apiUrl}/chat`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
```

### 3. 在服务中使用

```tsx
@injectable()
export class ApiService {
  constructor(@inject(IOCIdentifier.AppConfig) private appConfig: AppConfig) {}

  async makeRequest() {
    const baseUrl = this.appConfig.aiApiBaseUrl;
    const token = this.appConfig.aiApiToken;

    return fetch(`${baseUrl}/api/endpoint`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}
```

## 环境变量注入插件

### 1. InjectEnv 插件工作原理

```tsx
// corekit-bridge/src/core/bootstrap/plugins/InjectEnv.ts
export class InjectEnv implements BootstrapExecutorPlugin {
  readonly pluginName = 'InjectEnv';

  constructor(protected options: InjectEnvConfig) {}

  onBefore(): void {
    const { target, source, prefix, blackList } = this.options;
    // 遍历目标对象的属性
    for (const key in target) {
      if (blackList.includes(key)) {
        continue; // 跳过黑名单中的属性
      }

      const value = target[key as keyof typeof target];
      const envValue = this.env(key, value); // 获取环境变量值

      // 如果环境变量存在且与默认值不同，则注入
      if (!this.isEmpty(envValue) && envValue !== value) {
        target[key as keyof typeof target] = envValue;
      }
    }
  }
}
```

### 2. 环境变量获取逻辑

```tsx
env<D>(key: string, defaultValue?: D): D {
  const { prefix = '', source = {} } = this.options;

  // 将驼峰命名转换为下划线命名
  const formattedKey = key.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
  const envKey = `${prefix}${formattedKey}`;

  const value = source[envKey];

  // 如果是 JSON 字符串，则解析
  if (typeof value === 'string' && InjectEnv.isJSONString(value)) {
    return JSON.parse(value);
  }

  return (value ?? defaultValue) as D;
}
```

## 最佳实践

### 1. 环境变量命名规范

```bash
# ✅ 好的命名
VITE_APP_NAME=MyApp
VITE_API_BASE_URL=https://api.example.com
VITE_USER_TOKEN_STORAGE_KEY=user_token
VITE_DEBUG=true

# ❌ 不好的命名
VITE_app_name=MyApp
VITE_API_BASE_URL=https://api.example.com
VITE_USER_TOKEN_STORAGE_KEY=user_token
VITE_DEBUG=true
```

### 2. 敏感信息处理

```bash
# .env.local (不提交到 git)
VITE_API_KEY=your_secret_key
VITE_DATABASE_PASSWORD=your_password

# .env.template (提交到 git，作为模板)
VITE_API_KEY=your_api_key_here
VITE_DATABASE_PASSWORD=your_password_here
```

### 3. 类型安全

```tsx
// 定义环境变量类型
interface EnvVariables {
  VITE_APP_NAME: string;
  VITE_API_BASE_URL: string;
  VITE_DEBUG: boolean;
  VITE_PORT: number;
}

// 在 AppConfig 中使用
export class AppConfig implements EnvConfigInterface {
  readonly appName: string = '';
  readonly apiBaseUrl: string = '';
  readonly debug: boolean = false;
  readonly port: number = 3000;
}
```

### 4. 环境变量验证

```tsx
// 在应用启动时验证必要的环境变量
export class AppConfig implements EnvConfigInterface {
  constructor() {
    this.validateRequiredEnvVars();
  }

  private validateRequiredEnvVars(): void {
    const required = ['VITE_API_BASE_URL', 'VITE_APP_NAME'];
    for (const envVar of required) {
      if (!import.meta.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }
  }
}
```

## 调试和故障排除

### 1. 检查环境变量加载

```tsx
// 在控制台中检查环境变量
console.log('import.meta.env:', import.meta.env);
console.log('AppConfig:', IOC(IOCIdentifier.AppConfig));
```

### 2. 常见问题

**问题 1：环境变量未注入**

```bash
# 检查环境变量前缀
# 确保使用 VITE_ 前缀
VITE_APP_NAME=MyApp  # ✅ 正确
APP_NAME=MyApp       # ❌ 错误，不会被注入
```

**问题 2：环境变量文件未加载**

```bash
# 检查文件命名
.env.development     # ✅ 正确
.env.dev            # ❌ 错误，Vite 不认识
```

**问题 3：环境变量被黑名单过滤**

```tsx
// 检查黑名单配置
export const envBlackList = ['env', 'userNodeEnv'];
// 确保你的环境变量不在黑名单中
```

### 3. 调试工具

```tsx
// 创建调试工具
export class EnvDebugger {
  static logEnvVars(config: AppConfig): void {
    console.group('Environment Variables Debug');
    console.log('Current Mode:', import.meta.env.MODE);
    console.log('AppConfig:', config);
    console.log('All Env Vars:', import.meta.env);
    console.groupEnd();
  }
}

// 在开发环境中使用
if (import.meta.env.DEV) {
  EnvDebugger.logEnvVars(IOC(IOCIdentifier.AppConfig));
}
```

## 总结

环境变量注入系统提供了：

1. **环境隔离**：不同环境使用不同配置
2. **类型安全**：通过 TypeScript 提供类型检查
3. **集中管理**：所有配置在 AppConfig 中统一管理
4. **灵活配置**：支持多种环境变量文件
5. **安全处理**：敏感信息可以通过 .env.local 本地管理

通过合理使用环境变量注入，可以让应用在不同环境中正确运行，同时保持配置的灵活性和安全性。
