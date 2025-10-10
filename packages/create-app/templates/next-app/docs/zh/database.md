# 数据库开发指南

## 目录

1. [数据库架构概述](#数据库架构概述)
2. [Supabase 实现](#supabase-实现)
3. [数据库接口和抽象层](#数据库接口和抽象层)
4. [仓库模式实现](#仓库模式实现)
5. [MongoDB 实现示例](#mongodb-实现示例)
6. [最佳实践和示例](#最佳实践和示例)

## 数据库架构概述

### 1. 整体架构

项目采用分层的数据库架构设计：

```
应用层                      数据访问层
┌──────────────┐          ┌──────────────┐
│   业务服务   │          │  数据库接口  │
├──────────────┤          ├──────────────┤
│   仓库接口   │          │ 数据库桥接器 │
├──────────────┤    ◄─────┤              │
│   仓库实现   │          │  具体实现    │
└──────────────┘          └──────────────┘
```

### 2. 核心组件

- **数据库接口**：`DBBridgeInterface`
- **数据库实现**：`SupabaseBridge`, `MongoDBBridge` 等
- **仓库接口**：`UserRepositoryInterface` 等
- **仓库实现**：`UserRepository` 等

### 3. 数据模型

```typescript
// 用户模型示例
interface UserSchema {
  id: number;
  email: string;
  password: string;
  role: string;
  created_at: string;
  updated_at: string;
  email_confirmed_at?: string;
}
```

## Supabase 实现

### 1. 数据库桥接器

```typescript
@injectable()
export class SupabaseBridge implements DBBridgeInterface {
  protected supabase: SupabaseClient;

  constructor(
    @inject(I.AppConfig) appConfig: AppConfig,
    @inject(I.Logger) protected logger: LoggerInterface
  ) {
    // 初始化 Supabase 客户端
    this.supabase = createClient(
      appConfig.supabaseUrl,
      appConfig.supabaseAnonKey
    );
  }

  // 查询实现
  async get(event: BridgeEvent): Promise<SupabaseBridgeResponse<unknown>> {
    const { table, fields = '*', where } = event;
    const selectFields = Array.isArray(fields) ? fields.join(',') : fields;
    const handler = this.supabase.from(table).select(selectFields);

    this.handleWhere(handler, where ?? []);

    return this.catch(await handler);
  }

  // 分页查询实现
  async pagination(event: BridgeEvent): Promise<DBBridgeResponse<unknown[]>> {
    const { table, fields = '*', where, page = 1, pageSize = 10 } = event;
    const selectFields = Array.isArray(fields) ? fields.join(',') : fields;

    const handler = this.supabase
      .from(table)
      .select(selectFields, { count: 'exact' })
      .range((page - 1) * pageSize, page * pageSize - 1);

    this.handleWhere(handler, where ?? []);

    return this.catch(await handler);
  }

  // WHERE 条件处理
  protected handleWhere(
    handler: PostgrestFilterBuilder<any, any, any>,
    where: Where[]
  ): void {
    where.forEach(([field, operation, value]) => {
      const method = whereHandlerMaps[operation];
      if (method) {
        handler[method](field, value);
      }
    });
  }
}
```

### 2. 查询条件映射

```typescript
// Supabase 操作符映射
const whereHandlerMaps = {
  '=': 'eq', // 等于
  '!=': 'neq', // 不等于
  '>': 'gt', // 大于
  '<': 'lt', // 小于
  '>=': 'gte', // 大于等于
  '<=': 'lte' // 小于等于
};
```

## 数据库接口和抽象层

### 1. 数据库桥接接口

```typescript
export interface DBBridgeInterface {
  // 基础 CRUD 操作
  add(event: BridgeEvent): Promise<DBBridgeResponse<unknown>>;
  update(event: BridgeEvent): Promise<DBBridgeResponse<unknown>>;
  delete(event: BridgeEvent): Promise<DBBridgeResponse<unknown>>;
  get(event: BridgeEvent): Promise<DBBridgeResponse<unknown>>;

  // 分页查询
  pagination(event: BridgeEvent): Promise<DBBridgeResponse<unknown[]>>;
}

// 查询事件定义
export interface BridgeEvent {
  table: string;
  fields?: string | string[];
  where?: Where[];
  data?: unknown;
  page?: number;
  pageSize?: number;
}

// 统一响应格式
export interface DBBridgeResponse<T> {
  error?: unknown;
  data: T;
  pagination?: PaginationInfo;
}
```

### 2. 查询条件类型

```typescript
// 操作符类型
export type WhereOperation = '=' | '!=' | '>' | '<' | '>=' | '<=';

// 查询条件类型
export type Where = [string, WhereOperation, string | number];

// 分页信息
export interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
}
```

## 仓库模式实现

### 1. 用户仓库接口

```typescript
export interface UserRepositoryInterface {
  // 获取所有用户
  getAll(): Promise<unknown>;

  // 通过邮箱查询用户
  getUserByEmail(email: string): Promise<UserSchema | null>;

  // 添加用户
  add(params: {
    email: string;
    password: string;
  }): Promise<UserSchema[] | null>;

  // 更新用户
  updateById(
    id: number,
    params: Partial<Omit<UserSchema, 'id' | 'created_at'>>
  ): Promise<void>;

  // 分页查询
  pagination<UserSchema>(params: {
    page: number;
    pageSize: number;
  }): Promise<PaginationInterface<UserSchema>>;
}
```

### 2. 用户仓库实现

```typescript
@injectable()
export class UserRepository implements UserRepositoryInterface {
  readonly name = 'fe_users';

  // 安全字段列表（排除敏感信息）
  protected safeFields = [
    'created_at',
    'email',
    'email_confirmed_at',
    'id',
    'role',
    'updated_at'
  ];

  constructor(
    @inject(I.DBBridgeInterface) protected dbBridge: DBBridgeInterface
  ) {}

  async getUserByEmail(email: string): Promise<UserSchema | null> {
    const result = await this.dbBridge.get({
      table: this.name,
      where: [['email', '=', email]]
    });

    return isEmpty(result.data) ? null : last(result.data as UserSchema[]);
  }

  async pagination<UserSchema>(
    params: PaginationParams
  ): Promise<PaginationResult> {
    const result = await this.dbBridge.pagination({
      table: this.name,
      page: params.page,
      pageSize: params.pageSize,
      fields: this.safeFields // 只返回安全字段
    });

    return {
      list: result.data as UserSchema[],
      total: result.count ?? 0,
      page: params.page,
      pageSize: params.pageSize
    };
  }
}
```

## MongoDB 实现示例

### 1. MongoDB 桥接器

```typescript
@injectable()
export class MongoDBBridge implements DBBridgeInterface {
  protected client: MongoClient;
  protected db: Db;

  constructor(
    @inject(I.AppConfig) appConfig: AppConfig,
    @inject(I.Logger) protected logger: LoggerInterface
  ) {
    this.client = new MongoClient(appConfig.mongodbUrl);
    this.db = this.client.db(appConfig.mongodbDatabase);
  }

  async get(event: BridgeEvent): Promise<DBBridgeResponse<unknown>> {
    const { table, where } = event;
    const collection = this.db.collection(table);

    const query = this.buildQuery(where ?? []);
    const data = await collection.find(query).toArray();

    return { data };
  }

  async pagination(event: BridgeEvent): Promise<DBBridgeResponse<unknown[]>> {
    const { table, where, page = 1, pageSize = 10 } = event;
    const collection = this.db.collection(table);

    const query = this.buildQuery(where ?? []);
    const total = await collection.countDocuments(query);
    const data = await collection
      .find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    return {
      data,
      pagination: { total, page, pageSize }
    };
  }

  protected buildQuery(where: Where[]): Document {
    return where.reduce((query, [field, operation, value]) => {
      switch (operation) {
        case '=':
          return { ...query, [field]: value };
        case '!=':
          return { ...query, [field]: { $ne: value } };
        case '>':
          return { ...query, [field]: { $gt: value } };
        case '<':
          return { ...query, [field]: { $lt: value } };
        case '>=':
          return { ...query, [field]: { $gte: value } };
        case '<=':
          return { ...query, [field]: { $lte: value } };
        default:
          return query;
      }
    }, {});
  }
}
```

### 2. MongoDB 配置

```typescript
// 在 AppConfig 中添加 MongoDB 配置
export class AppConfig implements EnvConfigInterface {
  readonly mongodbUrl: string = process.env.MONGODB_URL!;
  readonly mongodbDatabase: string = process.env.MONGODB_DATABASE!;
}

// 注册 MongoDB 桥接器
export class ServerIOCRegister {
  protected registerImplement(ioc: IOCContainerInterface): void {
    // 使用 MongoDB 实现
    ioc.bind(I.DBBridgeInterface, ioc.get(MongoDBBridge));
    // 或使用 Supabase 实现
    // ioc.bind(I.DBBridgeInterface, ioc.get(SupabaseBridge));
  }
}
```

## 最佳实践和示例

### 1. 仓库模式使用

```typescript
@injectable()
export class UserService {
  constructor(
    @inject(I.UserRepository)
    private userRepository: UserRepositoryInterface
  ) {}

  async getUserProfile(email: string): Promise<UserProfile | null> {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) return null;

    // 转换为业务模型
    return this.mapToUserProfile(user);
  }

  async listUsers(
    params: PaginationParams
  ): Promise<PaginationResult<UserProfile>> {
    const result = await this.userRepository.pagination(params);

    return {
      ...result,
      list: result.list.map(this.mapToUserProfile)
    };
  }
}
```

### 2. 事务处理

```typescript
@injectable()
export class TransactionManager {
  async withTransaction<T>(
    callback: (transaction: Transaction) => Promise<T>
  ): Promise<T> {
    const transaction = await this.dbBridge.startTransaction();

    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

// 使用事务
async createUserWithProfile(data: UserData): Promise<User> {
  return this.transactionManager.withTransaction(async (transaction) => {
    const user = await this.userRepository.add(data, transaction);
    await this.profileRepository.add(data.profile, transaction);
    return user;
  });
}
```

### 3. 查询优化

```typescript
@injectable()
export class OptimizedUserRepository extends UserRepository {
  // 使用字段选择优化查询
  async getUserProfile(id: number): Promise<UserProfile> {
    const result = await this.dbBridge.get({
      table: this.name,
      fields: this.safeFields, // 只选择需要的字段
      where: [['id', '=', id]]
    });
    return this.mapToProfile(result.data);
  }

  // 使用索引优化查询
  async searchUsers(query: string): Promise<User[]> {
    const result = await this.dbBridge.get({
      table: this.name,
      where: [
        ['email', '=', query], // 假设 email 字段有索引
        ['role', '=', 'user']
      ]
    });
    return result.data as User[];
  }
}
```

### 4. 缓存策略

```typescript
@injectable()
export class CachedUserRepository extends UserRepository {
  constructor(
    @inject(I.DBBridgeInterface) dbBridge: DBBridgeInterface,
    @inject(I.CacheManager) private cache: CacheManager
  ) {
    super(dbBridge);
  }

  async getUserByEmail(email: string): Promise<UserSchema | null> {
    // 先查缓存
    const cached = await this.cache.get(`user:${email}`);
    if (cached) return cached;

    // 缓存未命中，查数据库
    const user = await super.getUserByEmail(email);
    if (user) {
      await this.cache.set(`user:${email}`, user, '1h');
    }

    return user;
  }
}
```

## 总结

项目的数据库设计遵循以下原则：

1. **抽象分层**：
   - 清晰的接口定义
   - 数据库实现可替换
   - 仓库模式封装业务逻辑

2. **类型安全**：
   - 完整的 TypeScript 类型定义
   - 查询条件类型检查
   - 响应数据类型验证

3. **安全性**：
   - 字段级别的访问控制
   - 参数化查询防注入
   - 敏感数据过滤

4. **可扩展性**：
   - 支持多种数据库实现
   - 插件化的功能扩展
   - 统一的查询接口

5. **性能优化**：
   - 字段选择优化
   - 查询条件优化
   - 缓存策略支持
