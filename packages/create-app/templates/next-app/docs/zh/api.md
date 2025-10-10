# API 开发指南

## 目录

1. [API 架构概述](#api-架构概述)
2. [客户端 API 实现](#客户端-api-实现)
3. [服务端 API 实现](#服务端-api-实现)
4. [错误处理和验证](#错误处理和验证)
5. [最佳实践和示例](#最佳实践和示例)

## API 架构概述

### 1. 整体架构

项目采用分层的 API 架构设计：

```
客户端层                     服务端层
┌──────────────┐           ┌──────────────┐
│   API 接口   │           │   API 路由   │
├──────────────┤           ├──────────────┤
│  API 服务类  │   HTTP    │  服务层实现  │
├──────────────┤   请求    ├──────────────┤
│ API Requester│ ◄──────► │   验证层    │
├──────────────┤           ├──────────────┤
│  插件系统   │           │   数据层    │
└──────────────┘           └──────────────┘
```

### 2. 核心组件

- **接口定义**：`AppApiInterface`, `AppUserApiInterface` 等
- **请求客户端**：`AppApiRequester`, `AdminApiRequester`
- **服务实现**：`AppUserApi`, `AdminUserApi` 等
- **插件系统**：`AppApiPlugin`, `RequestEncryptPlugin` 等

### 3. 统一响应格式

```typescript
// 成功响应
interface AppApiSuccessInterface<T = unknown> {
  success: true;
  data?: T;
}

// 错误响应
interface AppApiErrorInterface {
  success: false;
  id: string;
  message?: string;
}

// 统一响应类型
type AppApiResult<T = unknown> =
  | AppApiSuccessInterface<T>
  | AppApiErrorInterface;
```

## 客户端 API 实现

### 1. API 请求器

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

### 2. API 服务实现

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
      encryptProps: 'password' // 自动加密密码字段
    });

    return response.data;
  }
}
```

### 3. API 插件系统

```typescript
export class AppUserApiBootstrap implements BootstrapExecutorPlugin {
  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    const appUserApi = ioc.get<AppApiRequester>(AppApiRequester);

    // 注册插件
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

## 服务端 API 实现

### 1. API 路由处理

```typescript
// app/api/admin/users/route.ts
export async function GET(req: NextRequest) {
  const server = new BootstrapServer();

  const result = await server
    .use(new AdminAuthPlugin()) // 使用认证插件
    .execNoError(async ({ parameters: { IOC } }) => {
      // 1. 参数验证
      const searchParams = Object.fromEntries(
        req.nextUrl.searchParams.entries()
      );
      const paginationParams = IOC(PaginationValidator).getThrow(searchParams);

      // 2. 调用服务
      const apiUserService = IOC(ApiUserService);
      const result = await apiUserService.getUsers({
        page: paginationParams.page,
        pageSize: paginationParams.pageSize
      });

      return result;
    });

  // 3. 错误处理
  if (result instanceof ExecutorError) {
    return NextResponse.json(new AppErrorApi(result.id, result.message), {
      status: 400
    });
  }

  // 4. 成功响应
  return NextResponse.json(new AppSuccessApi(result));
}
```

### 2. 服务层实现

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

### 3. 认证和中间件

```typescript
export class AdminAuthPlugin implements BootstrapExecutorPlugin {
  async onBefore(context: BootstrapContext): Promise<void> {
    const { IOC } = context.parameters;
    const serverAuth = IOC(ServerAuth);

    // 验证管理员权限
    await serverAuth.verifyAdmin();
  }
}
```

## 错误处理和验证

### 1. 错误响应

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

### 2. 参数验证

```typescript
@injectable()
export class PaginationValidator implements ValidatorInterface {
  validate(data: unknown): ValidationResult {
    // 实现验证逻辑
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

## 最佳实践和示例

### 1. API 接口定义

```typescript
// 1. 定义接口
interface UserApiInterface {
  login(params: LoginParams): Promise<AppApiResult<LoginResult>>;
  logout(): Promise<AppApiResult<void>>;
}

// 2. 实现接口
@injectable()
class UserApi implements UserApiInterface {
  constructor(
    @inject(AppApiRequester)
    private client: AppApiRequester
  ) {}

  async login(params: LoginParams): Promise<AppApiResult<LoginResult>> {
    // 实现登录逻辑
  }

  async logout(): Promise<AppApiResult<void>> {
    // 实现登出逻辑
  }
}
```

### 2. 错误处理最佳实践

```typescript
// 1. 使用统一的错误处理
try {
  const result = await userApi.login(params);
  if (!result.success) {
    // 处理业务错误
    handleBusinessError(result);
    return;
  }
  // 处理成功响应
  handleSuccess(result.data);
} catch (error) {
  // 处理网络错误等
  handleNetworkError(error);
}

// 2. 使用错误插件
class DialogErrorPlugin implements ExecutorPlugin {
  onError(error: Error, context: ExecutorContext): void {
    // 显示错误对话框
    this.dialogHandler.showError({
      title: '错误',
      content: error.message
    });
  }
}
```

### 3. API 测试示例

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

### 4. API 文档生成

使用 TypeScript 类型和注释来生成 API 文档：

```typescript
/**
 * 用户登录 API
 * @param params - 登录参数
 * @param params.email - 用户邮箱
 * @param params.password - 用户密码（将自动加密）
 * @returns 登录结果，包含用户令牌
 * @throws {ValidationError} 当参数验证失败时
 * @throws {AuthError} 当认证失败时
 */
async login(params: LoginParams): Promise<AppApiResult<LoginResult>>;
```

## 总结

项目的 API 设计遵循以下原则：

1. **分层架构**：
   - 清晰的接口定义
   - 服务层实现业务逻辑
   - 统一的请求处理
   - 插件化的功能扩展

2. **类型安全**：
   - 完整的 TypeScript 类型定义
   - 运行时参数验证
   - 编译时类型检查

3. **错误处理**：
   - 统一的错误响应格式
   - 插件化的错误处理
   - 完整的错误追踪

4. **可扩展性**：
   - 插件系统支持功能扩展
   - 依赖注入实现松耦合
   - 中间件支持横切关注点

5. **安全性**：
   - 自动的参数加密
   - 统一的认证机制
   - 参数验证和清洗
