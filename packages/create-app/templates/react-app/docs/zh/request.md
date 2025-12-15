# 请求系统

## 概述

请求系统基于 `@qlover/fe-corekit` 的 request 模块实现，提供了一个功能强大、可扩展的 HTTP 请求解决方案。系统采用插件化架构，支持请求拦截、响应处理、错误处理等功能。

## 核心特性

- 🔌 **插件化架构**：支持自定义插件扩展
- 🔄 **请求调度**：统一的请求调度管理
- 🛡️ **类型安全**：完整的 TypeScript 支持
- 🎯 **请求中断**：支持请求取消
- 📝 **日志记录**：详细的请求日志
- 🔧 **Mock 支持**：内置数据 Mock 功能

## 基础架构

```typescript
// 请求系统架构
Request → Scheduler → Adapter → Plugins → Network
```

## 使用方式

### 1. 创建 API 服务

```typescript
import { RequestAdapterFetch, RequestScheduler } from '@qlover/fe-corekit';

@injectable()
export class FeApi extends RequestScheduler<FeApiConfig> {
  constructor(@inject(FeApiAdapter) adapter: RequestAdapterFetch) {
    super(adapter);
  }

  // API 方法定义
  async getIpInfo(): Promise<FeApiGetIpInfo['response']> {
    return this.get('http://ip-api.com/json/');
  }
}
```

### 2. 配置请求适配器

```typescript
import { RequestAdapterFetch } from '@qlover/fe-corekit';

const apiAdapter = new RequestAdapterFetch({
  responseType: 'json',
  baseURL: '/api'
});

// 配置插件
apiAdapter.usePlugin(new FetchURLPlugin());
apiAdapter.usePlugin(
  new RequestCommonPlugin({
    tokenPrefix: 'Bearer',
    token: () => getToken()
  })
);
```

### 3. 注册请求服务

```typescript
// core/registers/RegisterCommon.ts
export const RegisterCommon: IOCRegister = {
  register(container) {
    // 注册请求插件
    const feApiAbort = new FetchAbortPlugin();
    const feApiRequestCommonPlugin = new RequestCommonPlugin({
      tokenPrefix: AppConfig.openAiTokenPrefix,
      requiredToken: true,
      token: () => container.get(UserService).getToken()
    });

    container.bind(FetchAbortPlugin, feApiAbort);
    container.bind(IOCIdentifier.FeApiCommonPlugin, feApiRequestCommonPlugin);
    container.bind(
      IOCIdentifier.ApiMockPlugin,
      new ApiMockPlugin(mockDataJson, container.get(Logger))
    );
  }
};
```

### 4. 在组件中使用

```typescript
@injectable()
export class RequestController extends StoreInterface<RequestControllerState> {
  constructor(
    @inject(FeApi) private readonly feApi: FeApi,
    @inject(UserApi) private readonly userApi: UserApi
  ) {
    super(createDefaultState);
  }

  async fetchData() {
    if (this.state.loading) return;

    this.setState({ loading: true });
    try {
      const result = await this.feApi.getData();
      this.setState({ loading: false, data: result });
    } catch (error) {
      this.setState({ loading: false, error });
    }
  }
}
```

## 插件系统

### 1. 内置插件

#### FetchURLPlugin

- URL 处理和构建
- 参数序列化
- baseURL 处理

```typescript
apiAdapter.usePlugin(new FetchURLPlugin());
```

#### RequestCommonPlugin

- 通用请求头设置
- Token 管理
- 认证信息处理

```typescript
apiAdapter.usePlugin(
  new RequestCommonPlugin({
    tokenPrefix: 'Bearer',
    requiredToken: true,
    token: () => getToken()
  })
);
```

#### ApiMockPlugin

- Mock 数据支持
- 开发环境调试
- 接口模拟

```typescript
apiAdapter.usePlugin(new ApiMockPlugin(mockDataJson, logger));
```

#### RequestLogger

- 请求日志记录
- 错误追踪
- 调试信息

```typescript
@injectable()
export class RequestLogger implements ExecutorPlugin<RequestAdapterFetchConfig> {
  readonly pluginName = 'RequestLogger';

  onBefore(context) {
    this.logger.log(`Request: ${context.parameters.url}`);
  }

  onSuccess(context) {
    this.logger.log(`Success: ${context.parameters.url}`);
  }

  onError(context) {
    this.logger.error(`Error: ${context.parameters.url}`);
  }
}
```

### 2. 自定义插件

创建自定义插件：

```typescript
export class CustomPlugin implements ExecutorPlugin<RequestAdapterFetchConfig> {
  readonly pluginName = 'CustomPlugin';

  onBefore(context) {
    // 请求前处理
  }

  onSuccess(context) {
    // 请求成功处理
  }

  onError(context) {
    // 请求失败处理
  }
}
```

## 请求配置

### 1. 基础配置

```typescript
interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  responseType?: 'json' | 'text' | 'blob';
}
```

### 2. 高级配置

```typescript
interface AdvancedConfig extends RequestConfig {
  requestId?: string; // 用于请求取消
  mock?: boolean; // 启用 Mock 数据
  retries?: number; // 重试次数
  withCredentials?: boolean; // 跨域携带凭证
}
```

## 错误处理

### 1. 统一错误处理

```typescript
export class ApiCatchPlugin implements ExecutorPlugin {
  onError(context) {
    const error = context.error;

    if (error.status === 401) {
      // 处理认证错误
      handleAuthError();
    } else if (error.status === 500) {
      // 处理服务器错误
      handleServerError();
    }
  }
}
```

### 2. 业务层错误处理

```typescript
try {
  const result = await api.getData();
  handleSuccess(result);
} catch (error) {
  if (error instanceof ApiError) {
    handleApiError(error);
  } else {
    handleUnexpectedError(error);
  }
}
```

## 最佳实践

### 1. API 组织

- 按功能模块组织 API
- 使用统一的响应类型
- 实现完整的类型定义

```typescript
// 用户相关 API
export class UserApi extends RequestScheduler {
  login(data: LoginData): Promise<LoginResponse> {}
  register(data: RegisterData): Promise<RegisterResponse> {}
  getUserInfo(): Promise<UserInfo> {}
}

// 订单相关 API
export class OrderApi extends RequestScheduler {
  createOrder(data: OrderData): Promise<OrderResponse> {}
  getOrderList(): Promise<OrderList> {}
  cancelOrder(id: string): Promise<void> {}
}
```

### 2. 请求状态管理

- 使用 Store 管理请求状态
- 实现加载状态控制
- 处理并发请求

```typescript
interface RequestState<T> {
  loading: boolean;
  data: T | null;
  error: Error | null;
}

class DataStore extends StoreInterface<RequestState<Data>> {
  async fetchData() {
    if (this.state.loading) return;

    this.setState({ loading: true });
    try {
      const data = await api.getData();
      this.setState({ loading: false, data });
    } catch (error) {
      this.setState({ loading: false, error });
    }
  }
}
```

### 3. 请求缓存

- 实现请求结果缓存
- 避免重复请求
- 管理缓存生命周期

```typescript
class CachePlugin implements ExecutorPlugin {
  private cache = new Map();

  onBefore(context) {
    const cached = this.cache.get(context.parameters.url);
    if (cached && !isExpired(cached)) {
      return cached.data;
    }
  }

  onSuccess(context) {
    this.cache.set(context.parameters.url, {
      data: context.returnValue,
      timestamp: Date.now()
    });
  }
}
```

## 调试与测试

### 1. 开发环境配置

```typescript
// 开发环境配置
const devConfig = {
  baseURL: '/api',
  timeout: 5000,
  mock: true,
  debug: true
};

// 生产环境配置
const prodConfig = {
  baseURL: 'https://api.example.com',
  timeout: 10000,
  mock: false,
  debug: false
};
```

### 2. Mock 数据配置

```json
{
  "GET /api/users": {
    "code": 0,
    "data": [
      { "id": 1, "name": "User 1" },
      { "id": 2, "name": "User 2" }
    ]
  },
  "POST /api/login": {
    "code": 0,
    "data": {
      "token": "mock-token",
      "user": { "id": 1, "name": "User" }
    }
  }
}
```

### 3. 请求测试

```typescript
describe('UserApi', () => {
  let api: UserApi;

  beforeEach(() => {
    api = new UserApi(new MockAdapter());
  });

  it('should login successfully', async () => {
    const result = await api.login({
      username: 'test',
      password: '123456'
    });

    expect(result.code).toBe(0);
    expect(result.data.token).toBeDefined();
  });
});
```

## 性能优化

### 1. 请求优化

- 实现请求合并
- 控制并发数量
- 优化请求时机

### 2. 缓存策略

- 合理使用缓存
- 实现缓存更新
- 管理缓存大小

### 3. 错误重试

- 配置重试策略
- 处理网络问题
- 避免无效重试

```

```
