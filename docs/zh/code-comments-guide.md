# 代码注释指南

## 概述

本指南提供了项目中编写有效代码注释的综合标准。好的注释应该解释"为什么"而不是"是什么"，让代码本身具有自文档化的特性，同时为复杂的逻辑和业务规则提供必要的上下文。

## 基本原则

### 1. 代码自文档化优先

- 使用清晰、描述性的变量和函数名
- 将复杂逻辑拆分为命名良好的函数
- 尽可能让代码自己说明其用途

### 2. 注释的目的

- 解释为什么，而不是是什么
- 记录业务规则和需求
- 突出重要决策和权衡
- 警示边界情况和限制

### 3. 何时添加注释

- 复杂的业务逻辑
- 不明显的技术决策
- 性能考虑
- 安全影响
- API 使用示例
- 未来改进计划
- 边界情况和已知限制

### 4. 注释格式规范

- 使用反引号包围 `@` 开头的元数据标签，如：`@since`、`@deprecated`、`@optional`
- 使用反引号包围 `@default` 值，如：`@default 'src'`、`@default 3000`、`@default true`
- 使用反引号包围代码片段、变量名、函数名等
- 使用反引号包围文件路径、配置项等技术术语
- 保持注释的一致性和可读性

**重要：表格和复杂格式中的反引号转义**

- 一般情况使用多行注释(/\*\* \*/), 特别情况使用到单行注释(//)
- 在表格单元格或复杂 markdown 格式中使用反引号时，使用反斜杠转义：`\``
- 这可以防止解析错误并确保正确的 TypeDoc 渲染
- 例外：代码块的三个反引号（```）应保持不转义
- 示例：在表格单元格中使用 `\`--sourcePath\``而不是`--sourcePath`

````typescript
/**
 * CLI 选项表格示例
 *
 * | Option | Alias | Type | Required | Default | Description |
 * |--------|-------|------|----------|---------|-------------|
 * | \`--sourcePath\` | \`-p\` | \`string\` | ❌ | \`'src'\` | 源代码目录路径 |
 * | \`--generatePath\` | \`-g\` | \`string\` | ❌ | \`'docs'\` | 输出目录路径 |
 *
 * 代码块保持不变：
 * ```typescript
 * const config = { sourcePath: 'src' };
 * ```
 */
````

```typescript
/**
 * 检查参数是否可选（有 `?` 标记、默认值或 `@optional` 标签）
 *
 * 业务规则：
 * - 只处理 JSDoc 注释中的 `@since` 标签
 * - 过滤掉 `@default`、`@since`、`@deprecated`、`@optional` 标签
 * - 支持 `@param`、`@returns`、`@example` 等文档标签
 *
 * @param reflection - TypeDoc 反射对象
 * @returns 是否可选
 */
```

## 注释规则

### 文件级文档

带有 `@module` 标签的文件级 TSDoc 注释对于大多数文件是**可选的**，但在以下情况下是**必需的**：

1. **没有具体导出的文件**：当文件没有导出任何具体的函数、类或变量时
2. **索引文件**：名为 `index.ts`、`index.js` 或类似的索引文件，作为入口点或重新导出模块

在这些情况下，`@module` 标签对于提供文件用途和功能的上下文变得至关重要。

````typescript
/**
 * @module UserService
 * @description 用户管理服务，处理用户数据的 CRUD 操作和业务逻辑
 *
 * 核心职责：
 * - 用户数据的增删改查
 * - 用户状态管理（激活、暂停、删除）
 * - 用户权限验证
 * - 用户数据缓存管理
 *
 * 设计考虑：
 * - 使用 Redis 缓存热点用户数据，减少数据库压力
 * - 实现软删除，保留用户历史数据
 * - 支持批量操作以提高性能
 *
 * @example 基本使用
 * ```typescript
 * const userService = new UserService(db, cache);
 * const user = await userService.getUserById('user-123');
 * ```
 *
 * @example 批量操作
 * ```typescript
 * const users = await userService.getUsersByIds(['user-1', 'user-2']);
 * await userService.updateUserStatus(users, 'suspended');
 * ```
 */

// 文件导入和实现...
````

**必需示例：**

```typescript
/**
 * @module DatabaseConfig
 * @description 数据库连接配置和初始化
 *
 * 此文件包含数据库连接设置、连接池配置和初始化逻辑。
 * 它不导出具体函数，但为其他模块提供数据库连接实例。
 *
 * 核心功能：
 * - 数据库连接设置
 * - 连接池管理
 * - 基于环境的配置
 * - 连接健康监控
 */
```

`````

````typescript
/**
 * @module UserModule
 * @description 用户相关功能的入口点和重新导出
 *
 * 此索引文件作为所有用户相关功能的主要入口点。
 * 它重新导出用户服务、类型和工具函数，为其他模块
 * 导入用户功能提供清晰的 API。
 *
 * 导出内容：
 * - UserService: 主要用户管理服务
 * - UserTypes: TypeScript 类型定义
 * - UserUtils: 用户操作工具函数
 * - UserConstants: 用户相关常量
 *
 * @example
 * ```typescript
 * import { UserService, UserTypes } from './user';
 * ```
 */
`````

`@module` 标签应该：

- 使用描述性的模块名称，反映文件的主要用途
- 包含文件功能的全面描述
- 列出核心职责和特性
- 提及重要的设计考虑
- 在适当时提供使用示例
- 放置在 shebang 之后（如果存在）和任何导入之前

### 类/接口文档

````typescript
/**
 * 管理用户认证和会话处理
 *
 * 核心思想：
 * 集中式认证服务，处理用户登录、会话管理和权限验证
 *
 * 主要功能：
 * - 用户认证：基于 JWT 的无状态认证，支持多因素认证（MFA）
 *   - 支持用户名/邮箱登录
 *   - 密码使用 bcrypt 哈希验证
 *   - 实现登录速率限制防止暴力破解
 *   - 支持记住登录状态（延长令牌有效期）
 *
 * - 会话管理：Redis 存储会话状态，支持会话续期和强制下线
 *   - 会话数据包含用户状态、权限、最后活跃时间
 *   - 支持会话续期（滑动过期时间）
 *   - 管理员可强制下线指定用户
 *   - 异常登录检测和自动锁定
 *
 * - 权限验证：基于角色的访问控制（RBAC），支持细粒度权限
 *   - 角色：超级管理员、管理员、普通用户、访客
 *   - 权限：功能权限（如：用户管理、系统配置）
 *   - 资源权限：数据级别的访问控制
 *   - 动态权限：基于用户状态和时间的权限变化
 *
 * - 密码重置：安全的密码重置流程，包含邮箱验证和临时令牌
 *   - 发送重置邮件到已验证的邮箱
 *   - 临时令牌有效期 1 小时
 *   - 重置后自动清除所有活跃会话
 *   - 记录密码变更日志
 *
 * @example 基本使用
 * ```typescript
 * const authService = new AuthService(config);
 * await authService.login(credentials);
 * ```
 *
 * @example 高级使用
 * ```typescript
 * const authService = new AuthService(config);
 * await authService.logout();
 * ```
 */
class AuthService {
  // 实现
}
````

### 方法/函数文档

给每个参数增加详细的说明和默认值

````typescript
/**
 * 处理用户登录，包含速率限制和安全措施
 *
 * @returns {Promise<AuthResult>} 认证结果包含：
 *   - token: 用于后续请求的 JWT 令牌
 *   - user: 用户档案信息
 *   - permissions: 用户权限列表
 *
 * @param credentials - 登陆参数
 * @param {string} [credentials.username] - 邮箱或用户名
 * @param {string} [credentials.password] - 用户密码（将被哈希处理）
 * @param {boolean} [credentials.rememberMe=false] - 是否延长会话时间
 *
 * @throws {AuthError} 当凭证无效时
 * @throws {RateLimitError} 当登录尝试次数过多时
 *
 * @example
 * ```typescript
 * try {
 *   const result = await login({
 *     username: "john@example.com",
 *     password: "****",
 *     rememberMe: true
 *   });
 * } catch (error) {
 *   // 处理错误
 * }
 * ```
 */
function login(
  /**
   * 登陆参数
   */
  credentials: {
    /**
     * 邮箱或用户名
     */
    username: string;
    /**
     * 用户密码（将被哈希处理）
     */
    password: string;
    /**
     * 是否延长会话时间
     *
     * @default `false`
     */
    rememberMe?: boolean;
  }
): Promise<AuthResult> {}
````

#### 方法参数签名注释

```typescript
/**
 * 用户服务类，提供用户认证、管理和数据操作功能
 *
 * 核心功能：
 * - 用户认证和会话管理
 * - 用户数据 CRUD 操作
 * - 权限验证和角色管理
 * - 用户状态监控和日志记录
 *
 * @example 基本使用
 * ```typescript
 * const userService = new UserService({
 *   tokenKey: 'custom_token',
 *   cors: true
 * }, true);
 * ```
 */
class UserService {
  constructor(
    /**
     * 服务配置选项
     * 
     * 控制用户服务的核心行为和配置参数
     */
    options: {
      /**
       * JWT token 在本地存储中的键名
       * 
       * 用于在浏览器 localStorage 或 sessionStorage 中存储和检索用户认证令牌
       * 建议使用有意义的键名以避免与其他应用的存储冲突
       *
       * @default `'user_token'`
       * @example `'myapp_auth_token'`
       */
      tokenKey?: string;
      /**
       * 是否启用跨域资源共享（CORS）
       * 
       * 当设置为 true 时，允许跨域请求访问用户数据
       * 在生产环境中应谨慎启用，确保适当的安全措施
       *
       * @default `false`
       * @example `true` // 开发环境
       */
      cors?: boolean;
      /**
       * 数据库连接配置
       * 
       * 指定用户数据存储的数据库连接参数
       * 支持多种数据库类型：MySQL、PostgreSQL、MongoDB
       */
      database?: {
        /**
         * 数据库类型
         * 
         * @default `'mysql'`
         */
        type: 'mysql' | 'postgresql' | 'mongodb';
        /**
         * 数据库主机地址
         * 
         * @default `'localhost'`
         */
        host: string;
        /**
         * 数据库端口号
         * 
         * @default `3306`
         */
        port: number;
      };
    },
    /**
     * 是否启用调试模式
     * 
     * 调试模式下会输出详细的日志信息，包括：
     * - API 请求和响应详情
     * - 数据库查询语句
     * - 认证流程的每个步骤
     * - 错误堆栈信息
     * 
     * 仅在开发环境使用，生产环境应设置为 false
     *
     * @default `false`
     * @example `true` // 开发调试
     */
    protected debug?: boolean
  ) {}

  /**
   * 处理用户登录认证，包含安全验证和速率限制
   *
   * 认证流程：
   * 1. 验证用户输入格式和长度
   * 2. 检查登录尝试次数（防止暴力破解）
   * 3. 验证用户名/邮箱和密码
   * 4. 生成 JWT 令牌和刷新令牌
   * 5. 记录登录日志和安全事件
   * 6. 返回认证结果和用户信息
   *
   * 安全特性：
   * - 密码使用 bcrypt 哈希验证
   * - 实现登录速率限制（5分钟内最多5次失败）
   * - 支持多因素认证（MFA）
   * - 异常登录检测和告警
   *
   * @returns {Promise<AuthResult>} 认证结果对象，包含：
   *   - token: JWT 访问令牌，用于后续 API 请求认证
   *   - refreshToken: 刷新令牌，用于获取新的访问令牌
   *   - user: 用户基本信息（ID、姓名、邮箱、角色等）
   *   - permissions: 用户权限列表，用于前端路由和功能控制
   *   - expiresAt: 令牌过期时间戳
   *
   * @throws {ValidationError} 当输入参数格式无效时
   * @throws {AuthError} 当用户名或密码错误时
   * @throws {RateLimitError} 当登录尝试次数过多时（5分钟内超过5次）
   * @throws {AccountLockedError} 当账户被锁定或暂停时
   * @throws {DatabaseError} 当数据库连接失败时
   *
   * @example 基本登录
   * ```typescript
   * try {
   *   const result = await userService.login({
   *     username: "john@example.com",
   *     password: "securePassword123",
   *     rememberMe: false
   *   });
   *   console.log('登录成功:', result.user.name);
   * } catch (error) {
   *   console.error('登录失败:', error.message);
   * }
   * ```
   *
   * @example 记住登录状态
   * ```typescript
   * const result = await userService.login({
   *   username: "admin@company.com",
   *   password: "adminPass",
   *   rememberMe: true // 延长会话时间到30天
   * });
   * ```
   */
  async login(
    /**
     * 用户登录凭证
     * 
     * 包含用户身份验证所需的所有信息
     */
    credentials: {
      /**
       * 用户登录标识符
       * 
       * 支持以下格式：
       * - 邮箱地址：user@example.com
       * - 用户名：john_doe
       * - 手机号：+86-138-0013-8000
       * 
       * 系统会自动识别格式并进行相应的验证
       *
       * @example `"john@example.com"`
       * @example `"john_doe"`
       * @example `"+86-138-0013-8000"`
       */
      username: string;
      /**
       * 用户密码
       * 
       * 密码要求：
       * - 长度：8-128 个字符
       * - 必须包含：大小写字母、数字、特殊字符
       * - 不能包含：用户名、常见密码、连续字符
       * 
       * 系统会自动进行密码强度检查
       *
       * @example `"MySecurePass123!"`
       * @minLength 8
       * @maxLength 128
       */
      password: string;
      /**
       * 是否记住登录状态
       * 
       * 当设置为 true 时：
       * - JWT 令牌有效期延长到 30 天
       * - 刷新令牌有效期延长到 90 天
       * - 在多个设备间保持登录状态
       * 
       * 安全考虑：
       * - 仅在可信设备上启用
       * - 用户可随时撤销所有会话
       *
       * @default `false`
       * @example `true` // 个人设备
       * @example `false` // 公共设备
       */
      rememberMe?: boolean;
      /**
       * 多因素认证代码
       * 
       * 当用户启用了 MFA 时，需要提供此代码
       * 支持 TOTP（基于时间的一次性密码）
       * 
       * 格式：6 位数字代码
       *
       * @optional
       * @example `"123456"`
       * @pattern `^\d{6}$`
       */
      mfaCode?: string;
      /**
       * 客户端设备信息
       * 
       * 用于安全审计和异常登录检测
       * 包含设备类型、浏览器、IP 地址等信息
       *
       * @optional
       * @example `{ deviceType: 'mobile', browser: 'Chrome', ip: '192.168.1.1' }`
       */
      deviceInfo?: {
        /**
         * 设备类型
         * 
         * @example `'desktop'` | `'mobile'` | `'tablet'`
         */
        deviceType: string;
        /**
         * 浏览器信息
         * 
         * @example `'Chrome 120.0.0'`
         */
        browser: string;
        /**
         * IP 地址
         * 
         * @example `'192.168.1.1'`
         */
        ip: string;
      };
    }
  ): Promise<AuthResult> {}

  /**
   * 更新用户个人信息
   *
   * @param userId - 要更新的用户唯一标识符
   * @param updates - 要更新的用户信息字段
   * @returns 更新后的用户信息
   */
  async updateUser(
    /**
     * 用户唯一标识符
     * 
     * 必须是有效的 UUID v4 格式
     * 系统会验证用户是否存在和当前用户是否有权限修改
     *
     * @example `"550e8400-e29b-41d4-a716-446655440000"`
     * @pattern `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`
     */
    userId: string,
    /**
     * 要更新的用户信息
     * 
     * 只更新提供的字段，其他字段保持不变
     * 系统会自动验证字段格式和业务规则
     */
    updates: {
      /**
       * 用户显示名称
       * 
       * 用于界面显示，支持多语言
       * 长度限制：2-50 个字符
       *
       * @optional
       * @example `"张三"`
       * @example `"John Doe"`
       * @minLength 2
       * @maxLength 50
       */
      displayName?: string;
      /**
       * 用户头像 URL
       * 
       * 必须是有效的图片 URL
       * 支持格式：JPG、PNG、GIF、WebP
       * 建议尺寸：200x200 像素
       *
       * @optional
       * @example `"https://example.com/avatar.jpg"`
       * @pattern `^https?://.*\.(jpg|jpeg|png|gif|webp)$`
       */
      avatar?: string;
      /**
       * 用户个人简介
       * 
       * 支持 Markdown 格式
       * 长度限制：0-500 个字符
       *
       * @optional
       * @example `"热爱编程的全栈开发者"`
       * @maxLength 500
       */
      bio?: string;
    }
  ): Promise<User> {}
}
```

## 业务逻辑注释

### 配置注释

```typescript
const CONFIG = {
  /**
   * API 调用失败的最大重试次数
   */
  MAX_RETRIES: 3,

  /**
   * 请求超时时间（毫秒）
   */
  REQUEST_TIMEOUT: 5000,

  /**
   * 功能标志，用于渐进式发布
   */
  FEATURES: {
    /**
     * 发布日期：2024-04
     */
    NEW_UI: false,
    /**
     * 当前处于测试阶段
     */
    BETA_API: true
  }
};
```

### 算法注释

```typescript
/**
 * 实现优化的归并排序，包含以下优化：
 * 1. 对小数组（长度 < 10）使用插入排序
 * 2. 维护辅助数组以减少内存分配
 * 3. 检查数组是否已经排序
 *
 * 时间复杂度：O(n log n)
 * 空间复杂度：O(n)
 */
```

### 错误处理注释

```typescript
// 处理用户有权限但账户不活跃的边界情况
// 这种情况可能发生在账户暂停或维护模式下
if (hasPermissions && !isActive) {
  throw new AccountStatusError('账户暂时不活跃');
}
```

## TODO 注释

- 始终包含工单/问题引用
- 添加目标日期或版本（如果可能）
- 简要解释上下文

```typescript
// TODO(JIRA-123): 实现 API 调用的速率限制
// 目标：v2.1.0 (2024-04)

// FIXME(JIRA-456): 当前实现不能处理并发更新
// 阻塞 v2.0.0 发布
```

## 注释禁忌

### 1. 避免显而易见的注释

```typescript
// ❌ 不好
// 设置用户名
user.name = 'John';

// ✅ 好
// 覆盖测试环境的用户名
user.name = 'John';
```

### 2. 不要注释掉代码

- 使用版本控制代替
- 删除死代码
- 如果是临时的，添加带解释的 TODO

### 3. 避免冗余注释

```typescript
// ❌ 不好
/**
 * 通过 ID 获取用户
 * @param id - 用户 ID
 * @returns 用户
 */

// ✅ 好
/**
 * 从数据库检索用户，带缓存
 * @param id - 唯一用户标识符（UUID v4）
 * @returns 用户对象，如果未找到则返回 null
 * @throws DatabaseError 如果连接失败
 */
```

## 维护

### 1. 保持注释更新

- 代码变更时更新注释
- 删除过时的注释
- 验证示例是否仍然有效

### 2. 审查注释

- 在代码审查中包含注释
- 检查清晰度和准确性
- 确保注释增加价值

## 语言指南

### 1. 使用英语的场景：

- 所有代码注释
- 函数和变量名
- 文档字符串
- 提交消息

### 2. 使用中文的场景：

- 业务需求文档
- 团队沟通
- 面向用户的内容

## 工具和自动化

### 1. ESLint 规则

- 强制要求公共 API 的 JSDoc
- 检查注释存在
- 验证注释格式

### 2. 文档生成

- 使用 TypeDoc 生成 API 文档
- 从注释生成文档
- 在文档中包含示例

## 总结

记住：最好的注释往往是你不需要写的注释，因为代码本身已经足够清晰。当你确实需要写注释时，要确保它们提供有价值的上下文和见解，这些是仅通过代码无法表达的。

### 关键要点：

- ✅ 优先让代码自文档化
- ✅ 注释解释"为什么"而不是"是什么"
- ✅ 使用完整的 TSDoc/JSDoc 格式
- ✅ 包含使用示例和边界情况
- ✅ 保持注释与代码同步更新
- ✅ 在代码审查中检查注释质量
