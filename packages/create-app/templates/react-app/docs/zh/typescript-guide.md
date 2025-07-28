# TypeScript 开发指南

## 概述

本指南介绍项目中 TypeScript 的使用规范，重点强调三种编程范式：

- 面向对象编程（OOP）
- 面向接口编程（Interface-based）
- 面向配置编程（Configuration-based）

## 编程范式

### 1. 面向对象编程（OOP）

在项目中，我们大量使用面向对象的思想来组织代码，主要体现在：

#### 类的设计

```typescript
// 基类设计
abstract class StoreInterface<T extends StoreStateInterface> {
  protected state: T;

  constructor(initialState: T) {
    this.state = initialState;
  }

  abstract setState(state: Partial<T>): void;

  getState(): T {
    return this.state;
  }
}

// 具体实现
@injectable()
class UserStore extends StoreInterface<UserState> {
  constructor() {
    super({
      user: null,
      loading: false
    });
  }

  setState(state: Partial<UserState>): void {
    this.state = { ...this.state, ...state };
    this.notify();
  }

  private notify(): void {
    // 通知观察者
  }
}
```

#### 继承和多态

```typescript
// 基础服务接口
interface ServiceInterface {
  initialize(): Promise<void>;
  destroy(): void;
}

// 抽象基类
abstract class BaseService implements ServiceInterface {
  abstract initialize(): Promise<void>;

  destroy(): void {
    // 通用清理逻辑
  }
}

// 具体服务实现
class UserService extends BaseService {
  async initialize(): Promise<void> {
    // 用户服务初始化逻辑
  }

  // 扩展特定方法
  async login(): Promise<void> {
    // 登录逻辑
  }
}
```

### 2. 面向接口编程

项目强调使用接口来定义契约，实现松耦合：

#### 接口定义

```typescript
// 定义接口契约
interface StorageInterface<T> {
  get(key: string): T | null;
  set(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

// 实现接口
class LocalStorage<T> implements StorageInterface<T> {
  get(key: string): T | null {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  set(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}
```

#### 依赖注入

```typescript
// 服务接口
interface UserServiceInterface {
  getCurrentUser(): User | null;
  updateProfile(data: UserProfile): Promise<void>;
}

// 服务实现
@injectable()
class UserService implements UserServiceInterface {
  constructor(
    @inject('StorageService') private storage: StorageInterface<User>,
    @inject('ApiService') private api: ApiInterface
  ) {}

  getCurrentUser(): User | null {
    return this.storage.get('currentUser');
  }

  async updateProfile(data: UserProfile): Promise<void> {
    await this.api.put('/user/profile', data);
  }
}
```

### 3. 面向配置编程

项目采用配置驱动的方式来管理功能特性：

#### 配置定义

```typescript
// 配置接口
interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  auth: {
    tokenKey: string;
    tokenPrefix: string;
    expiresIn: number;
  };
  theme: {
    defaultTheme: 'light' | 'dark';
    enableUserTheme: boolean;
  };
}

// 配置实现
const appConfig: AppConfig = {
  api: {
    baseUrl: process.env.API_BASE_URL || '/api',
    timeout: 5000,
    retries: 3
  },
  auth: {
    tokenKey: 'auth_token',
    tokenPrefix: 'Bearer',
    expiresIn: 7200
  },
  theme: {
    defaultTheme: 'light',
    enableUserTheme: true
  }
};
```

#### 配置驱动

```typescript
// 配置驱动的功能实现
@injectable()
class ApiService {
  constructor(
    @inject('AppConfig') private config: AppConfig,
    @inject('HttpClient') private http: HttpClient
  ) {
    // 使用配置初始化服务
    this.http.setBaseUrl(config.api.baseUrl);
    this.http.setTimeout(config.api.timeout);
  }

  async request<T>(options: RequestOptions): Promise<T> {
    let retries = this.config.api.retries;

    while (retries > 0) {
      try {
        return await this.http.request(options);
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
      }
    }
  }
}
```

## 类型系统使用

### 1. 泛型

```typescript
// 泛型接口
interface Repository<T> {
  findById(id: string): Promise<T>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
}

// 泛型类
class ApiRepository<T> implements Repository<T> {
  constructor(private endpoint: string) {}

  async findById(id: string): Promise<T> {
    return api.get(`${this.endpoint}/${id}`);
  }

  // ... 其他方法实现
}
```

### 2. 类型工具

```typescript
// 类型映射
type Nullable<T> = { [P in keyof T]: T[P] | null };

// 条件类型
type ArrayType<T> = T extends Array<infer U> ? U : never;

// 工具类型
type PartialDeep<T> = {
  [P in keyof T]?: T[P] extends object ? PartialDeep<T[P]> : T[P];
};
```

### 3. 装饰器

```typescript
// 方法装饰器
function Cached(ttl: number = 3600) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    const cache = new Map();

    descriptor.value = async function (...args: any[]) {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        const { value, timestamp } = cache.get(key);
        if (Date.now() - timestamp < ttl * 1000) {
          return value;
        }
      }

      const result = await original.apply(this, args);
      cache.set(key, { value: result, timestamp: Date.now() });
      return result;
    };
  };
}

// 使用装饰器
class UserService {
  @Cached(1800)
  async getUserProfile(id: string): Promise<UserProfile> {
    return this.api.get(`/users/${id}`);
  }
}
```

## 最佳实践

### 1. 类型定义

- 使用 interface 定义对象结构
- 使用 type 定义联合类型和工具类型
- 优先使用 readonly 确保不可变性
- 合理使用可选属性

```typescript
// 好的实践
interface UserProfile {
  readonly id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: Readonly<UserPreferences>;
}

// 避免的实践
interface BadUserProfile {
  [key: string]: any; // 避免使用索引签名
  data: any; // 避免使用 any
}
```

### 2. 错误处理

```typescript
// 自定义错误类
class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 类型守卫
function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

// 错误处理
try {
  await api.request();
} catch (error) {
  if (isApiError(error)) {
    handleApiError(error);
  } else {
    handleUnknownError(error);
  }
}
```

### 3. 异步处理

```typescript
// 异步结果类型
interface AsyncResult<T, E = Error> {
  data: T | null;
  error: E | null;
  loading: boolean;
}

// 异步操作包装器
async function asyncWrapper<T, E = Error>(
  promise: Promise<T>
): Promise<AsyncResult<T, E>> {
  try {
    const data = await promise;
    return { data, error: null, loading: false };
  } catch (error) {
    return { data: null, error: error as E, loading: false };
  }
}
```

## 开发工具配置

### 1. TSConfig 配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### 2. ESLint 配置

```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

## 调试技巧

### 1. 类型断言

```typescript
// 类型断言
function processValue(value: unknown) {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return String(value);
}

// 类型收窄
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
```

### 2. 调试工具

```typescript
// 类型检查
type Debug<T> = {
  [P in keyof T]: T[P];
};

// 运行时类型检查
function assertType<T>(value: unknown, message?: string): asserts value is T {
  if (!isValidType<T>(value)) {
    throw new TypeError(message || 'Type assertion failed');
  }
}
```

## 性能优化

### 1. 类型优化

```typescript
// 使用类型缓存
type CachedType<T> = T extends Function ? T : Readonly<T>;

// 避免过度使用泛型
type SimpleType = string | number;
type ComplexType<T> = T extends SimpleType ? T : never;
```

### 2. 编译优化

- 使用 project references
- 启用增量编译
- 优化类型导入

## 参考资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript 设计模式](https://refactoring.guru/design-patterns/typescript)
- [Clean Code TypeScript](https://github.com/labs42io/clean-code-typescript)
