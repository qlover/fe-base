# Next.js 环境变量配置指南

## 什么是环境变量？

环境变量是一种在不同环境（开发、测试、生产）中配置应用行为的方式。在 Next.js 中，环境变量的使用有其特殊性，尤其是在客户端和服务端的处理上。

**关键特点**：
- 客户端环境变量必须以 `NEXT_PUBLIC_` 开头
- 服务端环境变量可以直接使用，无需特殊前缀
- 支持多环境配置和本地覆盖

## 环境变量加载优先级

Next.js 按照以下优先级加载环境变量：

```
.env.local → .env.development/.env.production → .env
```

## 文件结构

```
项目根目录/
├── .env                    # 默认环境变量
├── .env.local             # 本地环境变量（git ignored）
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
├── .env.test              # 测试环境变量
└── src/
    └── base/
        └── cases/
            └── AppConfig.ts # 应用配置类
```

## 环境变量文件

### 1. 环境变量文件示例

```bash
# .env (默认配置)
# 客户端可访问的环境变量（以 NEXT_PUBLIC_ 开头）
NEXT_PUBLIC_APP_NAME=MyApp
NEXT_PUBLIC_API_BASE_URL=http://api.example.com
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# 仅服务端可访问的环境变量
DATABASE_URL=postgres://user:pass@localhost:5432/db
JWT_SECRET=your-secret-key
API_TOKEN=server-side-token

# .env.development (开发环境)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_DEBUG=true
DATABASE_URL=postgres://dev:pass@localhost:5432/dev_db

# .env.production (生产环境)
NEXT_PUBLIC_API_BASE_URL=https://api.production.com
NEXT_PUBLIC_DEBUG=false
DATABASE_URL=postgres://prod:pass@production:5432/prod_db

# .env.local (本地覆盖，不提交到 git)
NEXT_PUBLIC_FEATURE_FLAG=true
DATABASE_URL=postgres://local:pass@localhost:5432/local_db
```

### 2. 环境变量使用规范

#### 客户端环境变量
- 必须以 `NEXT_PUBLIC_` 开头
- 会被打包到客户端代码中
- 适用于公开的配置信息

```bash
# ✅ 正确的客户端环境变量
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=UA-XXXXX
NEXT_PUBLIC_FEATURE_FLAGS={"newUI":true}

# ❌ 错误的客户端环境变量（没有 NEXT_PUBLIC_ 前缀）
API_URL=https://api.example.com  # 客户端无法访问
```

#### 服务端环境变量
- 无需特殊前缀
- 只在服务端可用
- 适用于敏感信息

```bash
# ✅ 正确的服务端环境变量
DATABASE_URL=postgres://user:pass@localhost:5432/db
JWT_SECRET=your-secret-key
API_TOKEN=your-api-token

# ❌ 不应该以 NEXT_PUBLIC_ 开头的服务端敏感信息
NEXT_PUBLIC_DATABASE_URL=postgres://user:pass@localhost:5432/db  # 安全风险！
```

## 项目中的实现

### 1. 应用配置类

```typescript
// src/base/cases/AppConfig.ts
export class AppConfig implements EnvConfigInterface {
  /**
   * 应用名称
   * @description 从 NEXT_PUBLIC_APP_NAME 环境变量获取
   */
  readonly appName = process.env.NEXT_PUBLIC_APP_NAME || '';

  /**
   * API 基础 URL
   * @description 从 NEXT_PUBLIC_API_BASE_URL 环境变量获取
   */
  readonly apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  /**
   * 是否为开发环境
   */
  readonly isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * 是否为生产环境
   */
  readonly isProduction = process.env.NODE_ENV === 'production';

  /**
   * 数据库连接 URL（仅服务端可用）
   */
  readonly databaseUrl = process.env.DATABASE_URL;

  /**
   * JWT 密钥（仅服务端可用）
   */
  readonly jwtSecret = process.env.JWT_SECRET;

  // ... 更多配置项
}
```

### 2. 在客户端使用配置

```typescript
// 在组件中使用
function Analytics() {
  // ✅ 正确：通过 IOC 获取配置对象
  const appConfig = IOC(IOCIdentifier.AppConfig);

  useEffect(() => {
    if (appConfig.analyticsId) {
      // 初始化 analytics
    }
  }, [appConfig.analyticsId]);

  return appConfig.debug ? <DebugInfo /> : null;
}
```

### 3. 在服务端使用配置

```typescript
// app/api/auth/[...nextauth]/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // ✅ 正确：通过 IOC 获取配置对象
  const appConfig = IOC(IOCIdentifier.AppConfig);

  if (!appConfig.databaseUrl || !appConfig.jwtSecret) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // 使用配置...
}
```

### 4. 在服务中使用配置

```typescript
// 定义服务类
@injectable()
export class AdminService {
  constructor(
    @inject(IOCIdentifier.AppConfig) 
    private appConfig: AppConfig
  ) {}

  async fetchAdminData() {
    const response = await fetch('https://api.example.com/admin', {
      headers: {
        Authorization: `Bearer ${this.appConfig.apiToken}`
      }
    });
    return response.json();
  }
}
```

## 最佳实践

### 1. 环境变量命名规范

```bash
# ✅ 好的命名
NEXT_PUBLIC_APP_NAME=MyApp
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_FEATURE_FLAGS={"darkMode":true}

# ❌ 不好的命名
next_public_app_name=MyApp      # 应该使用大写
NEXT_PUBLIC_SECRET_KEY=xxx      # 敏感信息不应该用 NEXT_PUBLIC_
```

### 2. 配置类实现

```typescript
// 定义配置接口
interface EnvConfigInterface {
  readonly env: string;
  readonly appName: string;
  readonly appVersion: string;
  // ... 其他配置项
}

// 实现配置类
@injectable()
export class AppConfig implements EnvConfigInterface {
  /**
   * 当前环境模式
   * @description 基于当前使用的 .env 文件自动设置
   */
  readonly env: string = process.env.APP_ENV!;

  /**
   * 应用名称
   */
  readonly appName: string = name;

  /**
   * 应用版本
   */
  readonly appVersion: string = version;

  /**
   * 用户令牌存储键
   */
  readonly userTokenKey: string = '_user_token';

  /**
   * 数据库连接 URL（仅服务端）
   */
  readonly supabaseUrl: string = process.env.SUPABASE_URL!;

  /**
   * 数据库匿名密钥（仅服务端）
   */
  readonly supabaseAnonKey: string = process.env.SUPABASE_ANON_KEY!;

  /**
   * JWT 密钥（仅服务端）
   */
  readonly jwtSecret: string = process.env.JWT_SECRET!;

  /**
   * JWT 过期时间
   * @example '30 days'
   * @example '1 year'
   */
  readonly jwtExpiresIn: StringValue = '30 days';

  /**
   * OpenAI API 配置（仅服务端）
   */
  readonly openaiBaseUrl: string = process.env.CEREBRAS_BASE_URL!;
  readonly openaiApiKey: string = process.env.CEREBRAS_API_KEY!;
}
```

### 3. 配置验证

```typescript
// 定义配置验证器
@injectable()
export class ConfigValidator {
  constructor(
    @inject(IOCIdentifier.AppConfig) 
    private appConfig: AppConfig,
    @inject(IOCIdentifier.Logger)
    private logger: LoggerInterface
  ) {}

  /**
   * 验证所有必需的配置项
   * @throws {Error} 当必需的配置项缺失时抛出错误
   */
  validateRequiredConfig(): void {
    // 验证基础配置
    this.validateBasicConfig();

    // 根据运行环境验证不同的配置
    if (typeof window === 'undefined') {
      this.validateServerConfig();
    }
  }

  /**
   * 验证基础配置项
   */
  private validateBasicConfig(): void {
    const requiredConfigs: Array<keyof AppConfig> = [
      'env',
      'appName',
      'appVersion',
      'userTokenKey'
    ];

    for (const key of requiredConfigs) {
      if (!this.appConfig[key]) {
        throw new Error(`Missing required config: ${key}`);
      }
    }
  }

  /**
   * 验证服务端配置项
   */
  private validateServerConfig(): void {
    const requiredServerConfigs: Array<keyof AppConfig> = [
      'supabaseUrl',
      'supabaseAnonKey',
      'jwtSecret',
      'openaiBaseUrl',
      'openaiApiKey'
    ];

    for (const key of requiredServerConfigs) {
      if (!this.appConfig[key]) {
        throw new Error(`Missing required server config: ${key}`);
      }
    }
  }

  /**
   * 验证配置值的格式
   */
  validateConfigFormat(): void {
    // 验证 URL 格式
    if (!this.isValidUrl(this.appConfig.supabaseUrl)) {
      throw new Error('Invalid supabaseUrl format');
    }

    // 验证 JWT 过期时间格式
    if (!this.isValidDuration(this.appConfig.jwtExpiresIn)) {
      throw new Error('Invalid jwtExpiresIn format');
    }

    this.logger.info('All config formats validated successfully');
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidDuration(duration: string): boolean {
    // 实现持续时间格式验证逻辑
    return /^\d+\s+(days?|weeks?|months?|years?)$/.test(duration);
  }
}
```

### 4. 敏感信息处理

```bash
# .env.local (不提交到 git)
DATABASE_URL=postgres://user:pass@localhost:5432/db
JWT_SECRET=your-secret-key
API_TOKEN=your-api-token

# .env.template (提交到 git，作为模板)
DATABASE_URL=postgres://user:password@localhost:5432/dbname
JWT_SECRET=your-jwt-secret-here
API_TOKEN=your-api-token-here
```

## 调试和故障排除

### 1. 配置调试工具

```typescript
@injectable()
export class ConfigDebugger {
  constructor(
    @inject(IOCIdentifier.AppConfig) 
    private appConfig: AppConfig,
    @inject(IOCIdentifier.Logger)
    private logger: LoggerInterface
  ) {}

  /**
   * 打印配置信息
   */
  logConfig(): void {
    this.logger.group('Configuration Debug Info');
    
    // 基础配置
    this.logger.info('Basic Config:', {
      env: this.appConfig.env,
      appName: this.appConfig.appName,
      appVersion: this.appConfig.appVersion
    });

    // 如果在服务端，打印服务端配置
    if (typeof window === 'undefined') {
      this.logger.info('Server Config:', {
        supabaseUrl: this.maskSensitiveInfo(this.appConfig.supabaseUrl),
        jwtExpiresIn: this.appConfig.jwtExpiresIn
      });
    }

    this.logger.groupEnd();
  }

  /**
   * 验证配置健康状态
   */
  async checkConfigHealth(): Promise<void> {
    try {
      // 验证数据库连接
      if (typeof window === 'undefined') {
        await this.checkDatabaseConnection();
      }

      // 验证其他配置项
      this.validateConfigValues();

      this.logger.info('Configuration health check passed');
    } catch (error) {
      this.logger.error('Configuration health check failed:', error);
      throw error;
    }
  }

  private async checkDatabaseConnection(): Promise<void> {
    // 实现数据库连接检查逻辑
  }

  private validateConfigValues(): void {
    // 实现配置值验证逻辑
  }

  private maskSensitiveInfo(value: string): string {
    return value.replace(/^(https?:\/\/[^:]+:)([^@]+)(@.*)$/, '$1****$3');
  }
}
```

### 2. 常见问题处理

**问题 1：配置未正确注入**
```typescript
// ❌ 错误：直接使用环境变量
class UserService {
  private apiUrl = process.env.NEXT_PUBLIC_API_URL;
}

// ✅ 正确：通过配置类获取
@injectable()
class UserService {
  constructor(
    @inject(IOCIdentifier.AppConfig) 
    private appConfig: AppConfig
  ) {}
}
```

**问题 2：配置验证失败**
```typescript
// ❌ 错误：没有配置验证
@injectable()
class ApiService {
  constructor(
    @inject(IOCIdentifier.AppConfig) 
    private appConfig: AppConfig
  ) {}
}

// ✅ 正确：包含配置验证
@injectable()
class ApiService {
  constructor(
    @inject(IOCIdentifier.AppConfig) 
    private appConfig: AppConfig,
    @inject(IOCIdentifier.ConfigValidator)
    private configValidator: ConfigValidator
  ) {
    this.configValidator.validateRequiredConfig();
  }
}
```

**问题 3：配置类型处理**
```typescript
// ❌ 错误：手动类型转换
class FeatureService {
  private isDebug = process.env.NEXT_PUBLIC_DEBUG === 'true';
}

// ✅ 正确：在配置类中处理类型转换
@injectable()
export class AppConfig implements EnvConfigInterface {
  readonly debug: boolean = this.parseBoolean(process.env.NEXT_PUBLIC_DEBUG);
  
  private parseBoolean(value: string | undefined): boolean {
    return value?.toLowerCase() === 'true';
  }
}
```

## 总结

面向对象的配置管理系统提供了：

1. **配置封装**：
   - 通过 `AppConfig` 类统一管理所有配置
   - 实现 `EnvConfigInterface` 接口确保配置完整性
   - 使用依赖注入实现配置的解耦

2. **类型安全**：
   - 配置类中处理类型转换
   - TypeScript 接口定义确保类型正确
   - 编译时类型检查

3. **配置验证**：
   - 专门的 `ConfigValidator` 类处理配置验证
   - 运行时配置完整性检查
   - 配置格式验证

4. **最佳实践**：
   - 依赖注入管理配置依赖
   - 配置验证和调试工具
   - 敏感信息保护
   - 类型安全处理

通过面向对象的方式管理配置，我们可以：
- 提高代码的可维护性和可测试性
- 确保配置的类型安全和完整性
- 方便地进行配置验证和调试
- 更好地管理配置依赖关系
