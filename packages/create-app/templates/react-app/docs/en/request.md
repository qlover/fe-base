# Request System

## Overview

The request system is implemented based on the request module of `@qlover/fe-corekit`, providing a powerful and extensible HTTP request solution. The system adopts a plugin architecture, supporting request interception, response handling, error handling, and other features.

## Core Features

- 🔌 **Plugin Architecture**: Supports custom plugin extensions
- 🔄 **Request Scheduling**: Unified request scheduling management
- 🛡️ **Type Safety**: Complete TypeScript support
- 🎯 **Request Cancellation**: Supports request cancellation
- 📝 **Logging**: Detailed request logging
- 🔧 **Mock Support**: Built-in data mocking functionality

## Basic Architecture

```typescript
// Request system architecture
Request → Scheduler → Adapter → Plugins → Network
```

## Usage

### 1. Creating API Service

```typescript
import { RequestAdapterFetch, RequestScheduler } from '@qlover/fe-corekit';

@injectable()
export class FeApi extends RequestScheduler<FeApiConfig> {
  constructor(@inject(FeApiAdapter) adapter: RequestAdapterFetch) {
    super(adapter);
  }

  // API method definition
  async getIpInfo(): Promise<FeApiGetIpInfo['response']> {
    return this.get('http://ip-api.com/json/');
  }
}
```

### 2. Configuring Request Adapter

```typescript
import { RequestAdapterFetch } from '@qlover/fe-corekit';

const apiAdapter = new RequestAdapterFetch({
  responseType: 'json',
  baseURL: '/api'
});

// Configure plugins
apiAdapter.usePlugin(new FetchURLPlugin());
apiAdapter.usePlugin(
  new RequestCommonPlugin({
    tokenPrefix: 'Bearer',
    token: () => getToken()
  })
);
```

### 3. Registering Request Service

```typescript
// core/registers/RegisterCommon.ts
export const RegisterCommon: IOCRegister = {
  register(container) {
    // Register request plugins
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

### 4. Using in Components

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

## Plugin System

### 1. Built-in Plugins

#### FetchURLPlugin

- URL processing and construction
- Parameter serialization
- baseURL handling

```typescript
apiAdapter.usePlugin(new FetchURLPlugin());
```

#### RequestCommonPlugin

- Common header settings
- Token management
- Authentication handling

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

- Mock data support
- Development environment debugging
- Interface simulation

```typescript
apiAdapter.usePlugin(new ApiMockPlugin(mockDataJson, logger));
```

#### RequestLogger

- Request logging
- Error tracking
- Debug information

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

### 2. Custom Plugins

Creating custom plugins:

```typescript
export class CustomPlugin implements ExecutorPlugin<RequestAdapterFetchConfig> {
  readonly pluginName = 'CustomPlugin';

  onBefore(context) {
    // Pre-request processing
  }

  onSuccess(context) {
    // Success processing
  }

  onError(context) {
    // Error processing
  }
}
```

## Request Configuration

### 1. Basic Configuration

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

### 2. Advanced Configuration

```typescript
interface AdvancedConfig extends RequestConfig {
  requestId?: string; // For request cancellation
  mock?: boolean; // Enable mock data
  retries?: number; // Number of retries
  withCredentials?: boolean; // Cross-origin credentials
}
```

## Error Handling

### 1. Unified Error Handling

```typescript
export class ApiCatchPlugin implements ExecutorPlugin {
  onError(context) {
    const error = context.error;

    if (error.status === 401) {
      // Handle authentication error
      handleAuthError();
    } else if (error.status === 500) {
      // Handle server error
      handleServerError();
    }
  }
}
```

### 2. Business Layer Error Handling

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

## Best Practices

### 1. API Organization

- Organize APIs by functional modules
- Use unified response types
- Implement complete type definitions

```typescript
// User-related APIs
export class UserApi extends RequestScheduler {
  login(data: LoginData): Promise<LoginResponse> {}
  register(data: RegisterData): Promise<RegisterResponse> {}
  getUserInfo(): Promise<UserInfo> {}
}

// Order-related APIs
export class OrderApi extends RequestScheduler {
  createOrder(data: OrderData): Promise<OrderResponse> {}
  getOrderList(): Promise<OrderList> {}
  cancelOrder(id: string): Promise<void> {}
}
```

### 2. Request State Management

- Use Store to manage request states
- Implement loading state control
- Handle concurrent requests

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

### 3. Request Caching

- Implement request result caching
- Avoid duplicate requests
- Manage cache lifecycle

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

## Debugging and Testing

### 1. Development Environment Configuration

```typescript
// Development environment configuration
const devConfig = {
  baseURL: '/api',
  timeout: 5000,
  mock: true,
  debug: true
};

// Production environment configuration
const prodConfig = {
  baseURL: 'https://api.example.com',
  timeout: 10000,
  mock: false,
  debug: false
};
```

### 2. Mock Data Configuration

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

### 3. Request Testing

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

## Performance Optimization

### 1. Request Optimization

- Implement request merging
- Control concurrency
- Optimize request timing

### 2. Caching Strategy

- Use caching judiciously
- Implement cache updates
- Manage cache size

### 3. Error Retry

- Configure retry strategies
- Handle network issues
- Avoid ineffective retries
