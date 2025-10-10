# API Development Guide

## Table of Contents

1. [API Architecture Overview](#api-architecture-overview)
2. [Client-Side API Implementation](#client-side-api-implementation)
3. [Server-Side API Implementation](#server-side-api-implementation)
4. [Error Handling and Validation](#error-handling-and-validation)
5. [Best Practices and Examples](#best-practices-and-examples)

## API Architecture Overview

### 1. Overall Architecture

The project adopts a layered API architecture design:

```
Client Layer                Server Layer
┌──────────────┐           ┌──────────────┐
│  API Interface│           │  API Routes  │
├──────────────┤           ├──────────────┤
│ API Services │   HTTP    │  Service     │
├──────────────┤ Requests  ├──────────────┤
│API Requester │ ◄──────► │ Validation   │
├──────────────┤           ├──────────────┤
│Plugin System │           │  Data Layer  │
└──────────────┘           └──────────────┘
```

### 2. Core Components

- **Interface Definitions**: `AppApiInterface`, `AppUserApiInterface`, etc.
- **Request Clients**: `AppApiRequester`, `AdminApiRequester`
- **Service Implementations**: `AppUserApi`, `AdminUserApi`, etc.
- **Plugin System**: `AppApiPlugin`, `RequestEncryptPlugin`, etc.

### 3. Unified Response Format

```typescript
// Success response
interface AppApiSuccessInterface<T = unknown> {
  success: true;
  data?: T;
}

// Error response
interface AppApiErrorInterface {
  success: false;
  id: string;
  message?: string;
}

// Unified response type
type AppApiResult<T = unknown> =
  | AppApiSuccessInterface<T>
  | AppApiErrorInterface;
```

## Client-Side API Implementation

### 1. API Requester

```typescript
@injectable()
export class AppApiRequester extends RequestTransaction<AppApiConfig> {
  constructor(
    @inject(FetchAbortPlugin) protected abortPlugin: FetchAbortPlugin
  ) {
    super(
      new RequestAdapterFetch({
        baseURL: '/api',
        responseType: 'json'
      })
    );
  }
}
```

### 2. API Service Implementation

```typescript
@injectable()
export class AppUserApi implements AppUserApiInterface {
  constructor(
    @inject(AppApiRequester)
    protected client: RequestTransaction<AppApiConfig>
  ) {}

  async login(params: UserApiLoginTransaction['data']): Promise<AppApiResult> {
    const response = await this.client.request<UserApiLoginTransaction>({
      url: '/user/login',
      method: 'POST',
      data: params,
      encryptProps: 'password' // Automatically encrypt password field
    });

    return response.data;
  }
}
```

### 3. API Plugin System

```typescript
export class AppUserApiBootstrap implements BootstrapExecutorPlugin {
  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    const appUserApi = ioc.get<AppApiRequester>(AppApiRequester);

    // Register plugins
    appUserApi.usePlugin(new FetchURLPlugin());
    appUserApi.usePlugin(new RequestEncryptPlugin(ioc.get(StringEncryptor)));
    appUserApi.usePlugin(
      new RequestCommonPlugin({
        requestDataSerializer: this.requestDataSerializer.bind(this)
      })
    );
    appUserApi.usePlugin(new AppApiPlugin(ioc.get(I.Logger)));
    appUserApi.usePlugin(ioc.get(DialogErrorPlugin));
  }
}
```

## Server-Side API Implementation

### 1. API Route Handling

```typescript
// app/api/admin/users/route.ts
export async function GET(req: NextRequest) {
  const server = new BootstrapServer();

  const result = await server
    .use(new AdminAuthPlugin()) // Use authentication plugin
    .execNoError(async ({ parameters: { IOC } }) => {
      // 1. Parameter validation
      const searchParams = Object.fromEntries(
        req.nextUrl.searchParams.entries()
      );
      const paginationParams = IOC(PaginationValidator).getThrow(searchParams);

      // 2. Call service
      const apiUserService = IOC(ApiUserService);
      const result = await apiUserService.getUsers({
        page: paginationParams.page,
        pageSize: paginationParams.pageSize
      });

      return result;
    });

  // 3. Error handling
  if (result instanceof ExecutorError) {
    return NextResponse.json(new AppErrorApi(result.id, result.message), {
      status: 400
    });
  }

  // 4. Success response
  return NextResponse.json(new AppSuccessApi(result));
}
```

### 2. Service Layer Implementation

```typescript
@injectable()
export class ApiUserService {
  constructor(
    @inject(IOCIdentifier.UserRepository)
    private userRepository: UserRepositoryInterface
  ) {}

  async getUsers(params: PaginationInterface): Promise<PaginationResult<User>> {
    return this.userRepository.findUsers(params);
  }
}
```

### 3. Authentication and Middleware

```typescript
export class AdminAuthPlugin implements BootstrapExecutorPlugin {
  async onBefore(context: BootstrapContext): Promise<void> {
    const { IOC } = context.parameters;
    const serverAuth = IOC(ServerAuth);

    // Verify admin permissions
    await serverAuth.verifyAdmin();
  }
}
```

## Error Handling and Validation

### 1. Error Response

```typescript
export class AppErrorApi implements AppApiErrorInterface {
  success = false as const;

  constructor(
    public id: string,
    public message?: string
  ) {}
}

export class AppSuccessApi<T = unknown> implements AppApiSuccessInterface<T> {
  success = true as const;

  constructor(public data?: T) {}
}
```

### 2. Parameter Validation

```typescript
@injectable()
export class PaginationValidator implements ValidatorInterface {
  validate(data: unknown): ValidationResult {
    // Implement validation logic
    const errors: ValidationError[] = [];

    if (!this.isValidPageNumber(data.page)) {
      errors.push({ field: 'page', message: 'Invalid page number' });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  getThrow(data: unknown): PaginationInterface {
    const result = this.validate(data);
    if (!result.valid) {
      throw new ValidationError(result.errors);
    }
    return data as PaginationInterface;
  }
}
```

## Best Practices and Examples

### 1. API Interface Definition

```typescript
// 1. Define interface
interface UserApiInterface {
  login(params: LoginParams): Promise<AppApiResult<LoginResult>>;
  logout(): Promise<AppApiResult<void>>;
}

// 2. Implement interface
@injectable()
class UserApi implements UserApiInterface {
  constructor(
    @inject(AppApiRequester)
    private client: AppApiRequester
  ) {}

  async login(params: LoginParams): Promise<AppApiResult<LoginResult>> {
    // Implement login logic
  }

  async logout(): Promise<AppApiResult<void>> {
    // Implement logout logic
  }
}
```

### 2. Error Handling Best Practices

```typescript
// 1. Use unified error handling
try {
  const result = await userApi.login(params);
  if (!result.success) {
    // Handle business error
    handleBusinessError(result);
    return;
  }
  // Handle success response
  handleSuccess(result.data);
} catch (error) {
  // Handle network errors etc.
  handleNetworkError(error);
}

// 2. Use error plugin
class DialogErrorPlugin implements ExecutorPlugin {
  onError(error: Error, context: ExecutorContext): void {
    // Show error dialog
    this.dialogHandler.showError({
      title: 'Error',
      content: error.message
    });
  }
}
```

### 3. API Testing Example

```typescript
describe('UserApi', () => {
  let userApi: UserApi;
  let mockClient: jest.Mocked<AppApiRequester>;

  beforeEach(() => {
    mockClient = {
      request: jest.fn()
    } as any;
    userApi = new UserApi(mockClient);
  });

  it('should handle login success', async () => {
    const mockResponse = {
      success: true,
      data: { token: 'test-token' }
    };
    mockClient.request.mockResolvedValue({ data: mockResponse });

    const result = await userApi.login({
      email: 'test@example.com',
      password: 'password'
    });

    expect(result).toEqual(mockResponse);
    expect(mockClient.request).toHaveBeenCalledWith({
      url: '/user/login',
      method: 'POST',
      data: {
        email: 'test@example.com',
        password: 'password'
      },
      encryptProps: 'password'
    });
  });
});
```

### 4. API Documentation Generation

Use TypeScript types and comments to generate API documentation:

```typescript
/**
 * User login API
 * @param params - Login parameters
 * @param params.email - User email
 * @param params.password - User password (will be automatically encrypted)
 * @returns Login result containing user token
 * @throws {ValidationError} When parameter validation fails
 * @throws {AuthError} When authentication fails
 */
async login(params: LoginParams): Promise<AppApiResult<LoginResult>>;
```

## Summary

The project's API design follows these principles:

1. **Layered Architecture**:
   - Clear interface definitions
   - Service layer implements business logic
   - Unified request handling
   - Plugin-based feature extension

2. **Type Safety**:
   - Complete TypeScript type definitions
   - Runtime parameter validation
   - Compile-time type checking

3. **Error Handling**:
   - Unified error response format
   - Plugin-based error handling
   - Complete error tracking

4. **Extensibility**:
   - Plugin system supports feature extension
   - Dependency injection achieves loose coupling
   - Middleware supports cross-cutting concerns

5. **Security**:
   - Automatic parameter encryption
   - Unified authentication mechanism
   - Parameter validation and sanitization
