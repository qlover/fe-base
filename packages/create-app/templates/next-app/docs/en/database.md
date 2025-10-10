# Database Development Guide

## Table of Contents

1. [Database Architecture Overview](#database-architecture-overview)
2. [Supabase Implementation](#supabase-implementation)
3. [Database Interfaces and Abstraction Layer](#database-interfaces-and-abstraction-layer)
4. [Repository Pattern Implementation](#repository-pattern-implementation)
5. [MongoDB Implementation Example](#mongodb-implementation-example)
6. [Best Practices and Examples](#best-practices-and-examples)

## Database Architecture Overview

### 1. Overall Architecture

The project adopts a layered database architecture design:

```
Application Layer           Data Access Layer
┌──────────────┐          ┌──────────────┐
│Business Service│          │   DB Interface│
├──────────────┤          ├──────────────┤
│Repo Interface │          │   DB Bridge   │
├──────────────┤    ◄─────┤              │
│Repo Implement │          │Implementation │
└──────────────┘          └──────────────┘
```

### 2. Core Components

- **Database Interface**: `DBBridgeInterface`
- **Database Implementation**: `SupabaseBridge`, `MongoDBBridge`, etc.
- **Repository Interface**: `UserRepositoryInterface`, etc.
- **Repository Implementation**: `UserRepository`, etc.

### 3. Data Models

```typescript
// User model example
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

## Supabase Implementation

### 1. Database Bridge

```typescript
@injectable()
export class SupabaseBridge implements DBBridgeInterface {
  protected supabase: SupabaseClient;

  constructor(
    @inject(I.AppConfig) appConfig: AppConfig,
    @inject(I.Logger) protected logger: LoggerInterface
  ) {
    // Initialize Supabase client
    this.supabase = createClient(
      appConfig.supabaseUrl,
      appConfig.supabaseAnonKey
    );
  }

  // Query implementation
  async get(event: BridgeEvent): Promise<SupabaseBridgeResponse<unknown>> {
    const { table, fields = '*', where } = event;
    const selectFields = Array.isArray(fields) ? fields.join(',') : fields;
    const handler = this.supabase.from(table).select(selectFields);

    this.handleWhere(handler, where ?? []);

    return this.catch(await handler);
  }

  // Pagination query implementation
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

  // WHERE condition handling
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

### 2. Query Condition Mapping

```typescript
// Supabase operator mapping
const whereHandlerMaps = {
  '=': 'eq', // Equal
  '!=': 'neq', // Not equal
  '>': 'gt', // Greater than
  '<': 'lt', // Less than
  '>=': 'gte', // Greater than or equal
  '<=': 'lte' // Less than or equal
};
```

## Database Interfaces and Abstraction Layer

### 1. Database Bridge Interface

```typescript
export interface DBBridgeInterface {
  // Basic CRUD operations
  add(event: BridgeEvent): Promise<DBBridgeResponse<unknown>>;
  update(event: BridgeEvent): Promise<DBBridgeResponse<unknown>>;
  delete(event: BridgeEvent): Promise<DBBridgeResponse<unknown>>;
  get(event: BridgeEvent): Promise<DBBridgeResponse<unknown>>;

  // Pagination query
  pagination(event: BridgeEvent): Promise<DBBridgeResponse<unknown[]>>;
}

// Query event definition
export interface BridgeEvent {
  table: string;
  fields?: string | string[];
  where?: Where[];
  data?: unknown;
  page?: number;
  pageSize?: number;
}

// Unified response format
export interface DBBridgeResponse<T> {
  error?: unknown;
  data: T;
  pagination?: PaginationInfo;
}
```

### 2. Query Condition Types

```typescript
// Operator types
export type WhereOperation = '=' | '!=' | '>' | '<' | '>=' | '<=';

// Query condition type
export type Where = [string, WhereOperation, string | number];

// Pagination information
export interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
}
```

## Repository Pattern Implementation

### 1. User Repository Interface

```typescript
export interface UserRepositoryInterface {
  // Get all users
  getAll(): Promise<unknown>;

  // Query user by email
  getUserByEmail(email: string): Promise<UserSchema | null>;

  // Add user
  add(params: {
    email: string;
    password: string;
  }): Promise<UserSchema[] | null>;

  // Update user
  updateById(
    id: number,
    params: Partial<Omit<UserSchema, 'id' | 'created_at'>>
  ): Promise<void>;

  // Pagination query
  pagination<UserSchema>(params: {
    page: number;
    pageSize: number;
  }): Promise<PaginationInterface<UserSchema>>;
}
```

### 2. User Repository Implementation

```typescript
@injectable()
export class UserRepository implements UserRepositoryInterface {
  readonly name = 'fe_users';

  // Safe field list (excluding sensitive information)
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
      fields: this.safeFields // Only return safe fields
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

## MongoDB Implementation Example

### 1. MongoDB Bridge

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

### 2. MongoDB Configuration

```typescript
// Add MongoDB configuration in AppConfig
export class AppConfig implements EnvConfigInterface {
  readonly mongodbUrl: string = process.env.MONGODB_URL!;
  readonly mongodbDatabase: string = process.env.MONGODB_DATABASE!;
}

// Register MongoDB bridge
export class ServerIOCRegister {
  protected registerImplement(ioc: IOCContainerInterface): void {
    // Use MongoDB implementation
    ioc.bind(I.DBBridgeInterface, ioc.get(MongoDBBridge));
    // Or use Supabase implementation
    // ioc.bind(I.DBBridgeInterface, ioc.get(SupabaseBridge));
  }
}
```

## Best Practices and Examples

### 1. Repository Pattern Usage

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

    // Convert to business model
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

### 2. Transaction Handling

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

// Using transactions
async createUserWithProfile(data: UserData): Promise<User> {
  return this.transactionManager.withTransaction(async (transaction) => {
    const user = await this.userRepository.add(data, transaction);
    await this.profileRepository.add(data.profile, transaction);
    return user;
  });
}
```

### 3. Query Optimization

```typescript
@injectable()
export class OptimizedUserRepository extends UserRepository {
  // Use field selection to optimize queries
  async getUserProfile(id: number): Promise<UserProfile> {
    const result = await this.dbBridge.get({
      table: this.name,
      fields: this.safeFields, // Only select needed fields
      where: [['id', '=', id]]
    });
    return this.mapToProfile(result.data);
  }

  // Use index to optimize queries
  async searchUsers(query: string): Promise<User[]> {
    const result = await this.dbBridge.get({
      table: this.name,
      where: [
        ['email', '=', query], // Assuming email field is indexed
        ['role', '=', 'user']
      ]
    });
    return result.data as User[];
  }
}
```

### 4. Caching Strategy

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
    // Check cache first
    const cached = await this.cache.get(`user:${email}`);
    if (cached) return cached;

    // Cache miss, query database
    const user = await super.getUserByEmail(email);
    if (user) {
      await this.cache.set(`user:${email}`, user, '1h');
    }

    return user;
  }
}
```

## Summary

The project's database design follows these principles:

1. **Abstraction Layers**:
   - Clear interface definitions
   - Replaceable database implementations
   - Repository pattern encapsulating business logic

2. **Type Safety**:
   - Complete TypeScript type definitions
   - Query condition type checking
   - Response data type validation

3. **Security**:
   - Field-level access control
   - Parameterized queries preventing injection
   - Sensitive data filtering

4. **Extensibility**:
   - Support for multiple database implementations
   - Plugin-based feature extension
   - Unified query interface

5. **Performance Optimization**:
   - Field selection optimization
   - Query condition optimization
   - Cache strategy support
