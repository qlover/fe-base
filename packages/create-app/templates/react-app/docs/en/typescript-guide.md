# TypeScript Development Guide

## Overview

This guide introduces TypeScript usage standards in the project, emphasizing three programming paradigms:

- Object-Oriented Programming (OOP)
- Interface-based Programming
- Configuration-based Programming

## Programming Paradigms

### 1. Object-Oriented Programming (OOP)

In the project, we extensively use object-oriented concepts to organize code, primarily manifested in:

#### Class Design

```typescript
// Base class design
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

// Concrete implementation
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
    // Notify observers
  }
}
```

#### Inheritance and Polymorphism

```typescript
// Base service interface
interface ServiceInterface {
  initialize(): Promise<void>;
  destroy(): void;
}

// Abstract base class
abstract class BaseService implements ServiceInterface {
  abstract initialize(): Promise<void>;

  destroy(): void {
    // Common cleanup logic
  }
}

// Concrete service implementation
class UserService extends BaseService {
  async initialize(): Promise<void> {
    // User service initialization logic
  }

  // Extended specific methods
  async login(): Promise<void> {
    // Login logic
  }
}
```

### 2. Interface-based Programming

The project emphasizes using interfaces to define contracts, achieving loose coupling:

#### Interface Definition

```typescript
// Define interface contract
interface StorageInterface<T> {
  get(key: string): T | null;
  set(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

// Interface implementation
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

#### Dependency Injection

```typescript
// Service interface
interface UserServiceInterface {
  getCurrentUser(): User | null;
  updateProfile(data: UserProfile): Promise<void>;
}

// Service implementation
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

### 3. Configuration-based Programming

The project adopts a configuration-driven approach to manage features:

#### Configuration Definition

```typescript
// Configuration interface
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

// Configuration implementation
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

#### Configuration-driven

```typescript
// Configuration-driven feature implementation
@injectable()
class ApiService {
  constructor(
    @inject('AppConfig') private config: AppConfig,
    @inject('HttpClient') private http: HttpClient
  ) {
    // Initialize service using configuration
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

## Type System Usage

### 1. Generics

```typescript
// Generic interface
interface Repository<T> {
  findById(id: string): Promise<T>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
}

// Generic class
class ApiRepository<T> implements Repository<T> {
  constructor(private endpoint: string) {}

  async findById(id: string): Promise<T> {
    return api.get(`${this.endpoint}/${id}`);
  }

  // ... other method implementations
}
```

### 2. Type Utilities

```typescript
// Type mapping
type Nullable<T> = { [P in keyof T]: T[P] | null };

// Conditional types
type ArrayType<T> = T extends Array<infer U> ? U : never;

// Utility types
type PartialDeep<T> = {
  [P in keyof T]?: T[P] extends object ? PartialDeep<T[P]> : T[P];
};
```

### 3. Decorators

```typescript
// Method decorator
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

// Using decorator
class UserService {
  @Cached(1800)
  async getUserProfile(id: string): Promise<UserProfile> {
    return this.api.get(`/users/${id}`);
  }
}
```

## Best Practices

### 1. Type Definitions

- Use interface for object structures
- Use type for union types and utility types
- Prefer readonly to ensure immutability
- Use optional properties judiciously

```typescript
// Good practices
interface UserProfile {
  readonly id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: Readonly<UserPreferences>;
}

// Practices to avoid
interface BadUserProfile {
  [key: string]: any; // Avoid using index signatures
  data: any; // Avoid using any
}
```

### 2. Error Handling

```typescript
// Custom error class
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

// Type guard
function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

// Error handling
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

### 3. Asynchronous Handling

```typescript
// Async result type
interface AsyncResult<T, E = Error> {
  data: T | null;
  error: E | null;
  loading: boolean;
}

// Async operation wrapper
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

## Development Tools Configuration

### 1. TSConfig Configuration

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

### 2. ESLint Configuration

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

## Debugging Techniques

### 1. Type Assertions

```typescript
// Type assertion
function processValue(value: unknown) {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return String(value);
}

// Type narrowing
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
```

### 2. Debugging Tools

```typescript
// Type checking
type Debug<T> = {
  [P in keyof T]: T[P];
};

// Runtime type checking
function assertType<T>(value: unknown, message?: string): asserts value is T {
  if (!isValidType<T>(value)) {
    throw new TypeError(message || 'Type assertion failed');
  }
}
```

## Performance Optimization

### 1. Type Optimization

```typescript
// Use type caching
type CachedType<T> = T extends Function ? T : Readonly<T>;

// Avoid excessive use of generics
type SimpleType = string | number;
type ComplexType<T> = T extends SimpleType ? T : never;
```

### 2. Compilation Optimization

- Use project references
- Enable incremental compilation
- Optimize type imports

## Reference Resources

- [TypeScript Official Documentation](https://www.typescriptlang.org/docs/)
- [TypeScript Design Patterns](https://refactoring.guru/design-patterns/typescript)
- [Clean Code TypeScript](https://github.com/labs42io/clean-code-typescript)
