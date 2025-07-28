# IOC Container

## What is IOC?

IOC (Inversion of Control) is a design pattern that hands over the creation of objects and management of their dependencies to a container, rather than creating objects directly in the code.

**In simple terms**: Like a factory producing products, you don't need to know how products are manufactured; you just tell the factory what product you need, and the factory will provide it.

## IOC Implementation in Project

### Core Technology Stack

- **InversifyJS**: As the IOC container implementation (you can also manually implement your own container)
- **TypeScript**: Provides type safety
- **Decorator Pattern**: Uses `@injectable()` and `@inject()` decorators

### Core File Structure

```
config/
├── IOCIdentifier.ts          # IOC identifier definitions
src/
├── core/
│   ├── IOC.ts                    # IOC main entry
│   ├── registers/                 # Registers directory
│   │   ├── RegisterGlobals.ts    # Global service registration
│   │   ├── RegisterCommon.ts     # Common service registration
│   │   └── RegisterControllers.ts # Controller registration
│   └── globals.ts                # Global instances
├── base/
│   └── cases/
│       └── InversifyContainer.ts # Inversify container implementation
```

## Basic Concepts

### 1. IOC Identifiers

```tsx
// config/IOCIdentifier.ts
export const IOCIdentifier = Object.freeze({
  JSON: 'JSON',
  LocalStorage: 'LocalStorage',
  Logger: 'Logger',
  AppConfig: 'AppConfig'
  // ... more identifiers
});
```

### 2. IOC Identifier Mapping

```tsx
// core/IOC.ts
export interface IOCIdentifierMap {
  [IOCIdentifier.JSON]: import('@qlover/fe-corekit').JSONSerializer;
  [IOCIdentifier.LocalStorage]: import('@qlover/fe-corekit').ObjectStorage<
    string,
    string
  >;
  [IOCIdentifier.Logger]: import('@qlover/logger').LoggerInterface;
  [IOCIdentifier.AppConfig]: import('@qlover/corekit-bridge').EnvConfigInterface;
  // ... more mappings
}
```

### 3. IOC Function

```tsx
// core/IOC.ts
export const IOC = createIOCFunction<IOCIdentifierMap>(
  new InversifyContainer()
);
```

## Usage

### 1. Getting Service Instances

```tsx
// Using class name
const userService = IOC(UserService);

// Using string identifier
const logger = IOC('Logger');
// Or
const logger = IOC(IOCIdentifier.Logger);

// Using AppConfig
const appConfig = IOC(IOCIdentifier.AppConfig);
```

### 2. Using Dependency Injection in Services

```tsx
import { inject, injectable } from 'inversify';
import { UserApi } from '@/base/apis/userApi/UserApi';
import { RouteService } from './RouteService';
import { IOCIdentifier } from '@config/IOCIdentifier';

@injectable()
export class UserService extends UserAuthService<UserInfo> {
  constructor(
    @inject(RouteService) protected routerService: RouteService,
    @inject(UserApi) userApi: UserAuthApiInterface<UserInfo>,
    @inject(IOCIdentifier.AppConfig) appConfig: AppConfig,
    @inject(IOCIdentifier.LocalStorageEncrypt)
    storage: SyncStorageInterface<string, string>
  ) {
    super(userApi, {
      userStorage: {
        key: appConfig.userInfoStorageKey,
        storage: storage
      },
      credentialStorage: {
        key: appConfig.userTokenStorageKey,
        storage: storage
      }
    });
  }
}
```

### 3. Using in Bootstrap

```tsx
// Register services in bootstrapper
bootstrap.use([
  IOC(UserService), // User service
  IOC(I18nService), // Internationalization service
  new UserApiBootstarp() // API configuration
]);
```

## Service Registration

### 1. Global Service Registration

```tsx
// core/registers/RegisterGlobals.ts
export const RegisterGlobals: IOCRegister = {
  register(container, _, options): void {
    // Register application configuration
    container.bind(IOCIdentifier.AppConfig, options!.appConfig);

    // Register logging service
    container.bind(Logger, logger);
    container.bind(IOCIdentifier.Logger, logger);

    // Register storage services
    container.bind(IOCIdentifier.LocalStorage, localStorage);
    container.bind(IOCIdentifier.LocalStorageEncrypt, localStorageEncrypt);
    container.bind(IOCIdentifier.CookieStorage, cookieStorage);
  }
};
```

### 2. Common Service Registration

```tsx
// core/registers/RegisterCommon.ts
export const RegisterCommon: IOCRegister = {
  register(container, _, options): void {
    const AppConfig = container.get(IOCIdentifier.AppConfig);

    // Register API-related services
    const feApiToken = new TokenStorage(AppConfig.userTokenStorageKey, {
      storage: container.get(IOCIdentifier.LocalStorageEncrypt)
    });

    container.bind(IOCIdentifier.FeApiToken, feApiToken);
    container.bind(IOCIdentifier.FeApiCommonPlugin, feApiRequestCommonPlugin);

    // Register theme service
    container.bind(
      ThemeService,
      new ThemeService({
        ...themeConfig,
        storage: localStorage
      })
    );

    // Register router service
    container.bind(
      RouteService,
      new RouteService({
        routes: baseRoutes,
        logger
      })
    );

    // Register i18n service
    container.bind(I18nService, new I18nService(options!.pathname));
  }
};
```

### 3. Controller Registration

```tsx
// core/registers/RegisterControllers.ts
export class RegisterControllers implements IOCRegister {
  register(
    container: IOCContainer,
    _: IOCManagerInterface<IOCContainer>
  ): void {
    // Register controllers
    const jsonStorageController = new JSONStorageController(localStorage);
    container.bind(JSONStorageController, jsonStorageController);

    // Configure processor
    container
      .get(ProcesserExecutor)
      .use(container.get(I18nKeyErrorPlugin))
      .use(container.get(UserService));
  }
}
```

## Practical Application Scenarios

### 1. User Authentication Service

```tsx
@injectable()
export class UserService extends UserAuthService<UserInfo> {
  constructor(
    @inject(RouteService) protected routerService: RouteService,
    @inject(UserApi) userApi: UserAuthApiInterface<UserInfo>,
    @inject(IOCIdentifier.AppConfig) appConfig: AppConfig,
    @inject(IOCIdentifier.LocalStorageEncrypt)
    storage: SyncStorageInterface<string, string>
  ) {
    super(userApi, {
      userStorage: {
        key: appConfig.userInfoStorageKey,
        storage: storage
      },
      credentialStorage: {
        key: appConfig.userTokenStorageKey,
        storage: storage
      }
    });
  }

  async onBefore(): Promise<void> {
    if (this.isAuthenticated()) {
      return;
    }

    const userToken = this.getToken();
    if (!userToken) {
      throw new AppError('NO_USER_TOKEN');
    }

    await this.userInfo();
    this.store.authSuccess();
  }
}
```

### 2. API Configuration Service

```tsx
export class UserApiBootstarp implements BootstrapExecutorPlugin {
  readonly pluginName = 'UserApiBootstarp';

  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    // Get UserApi instance through IOC and configure plugins
    ioc
      .get<UserApi>(UserApi)
      .usePlugin(new FetchURLPlugin())
      .usePlugin(IOC.get(IOCIdentifier.ApiMockPlugin))
      .usePlugin(IOC.get(RequestLogger));
  }
}
```

### 3. Using in Components

```tsx
// Using IOC services in React components
function UserProfile() {
  const userService = IOC(UserService);
  const { user } = useStore(userService.store);

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={() => userService.logout()}>Logout</button>
    </div>
  );
}
```

## Best Practices

### 1. Service Design Principles

```tsx
// ✅ Good design: Single responsibility
@injectable()
export class UserService {
  constructor(
    @inject(UserApi) private userApi: UserApi,
    @inject(IOCIdentifier.AppConfig) private appConfig: AppConfig
  ) {}

  async getUserInfo(): Promise<UserInfo> {
    return this.userApi.getUserInfo();
  }
}

// ❌ Bad design: Too many responsibilities
@injectable()
export class BadService {
  constructor(
    @inject(UserApi) private userApi: UserApi,
    @inject(RouteService) private routeService: RouteService,
    @inject(ThemeService) private themeService: ThemeService,
    @inject(I18nService) private i18nService: I18nService
  ) {}

  // One service doing too many things
  async handleUserAction(): Promise<void> {
    // Handle user logic
    // Handle routing logic
    // Handle theme logic
    // Handle i18n logic
  }
}
```

### 2. Dependency Injection Best Practices

```tsx
// ✅ Use interfaces instead of concrete implementations
@injectable()
export class UserService {
  constructor(
    @inject('UserApiInterface') private userApi: UserAuthApiInterface<UserInfo>
  ) {}
}

// ✅ Use identifiers instead of class names
@injectable()
export class SomeService {
  constructor(
    @inject(IOCIdentifier.Logger) private logger: LoggerInterface,
    @inject(IOCIdentifier.AppConfig) private appConfig: AppConfig
  ) {}
}
```

### 3. Error Handling

```tsx
@injectable()
export class SafeService {
  constructor(@inject(IOCIdentifier.Logger) private logger: LoggerInterface) {}

  async doSomething(): Promise<void> {
    try {
      // Business logic
    } catch (error) {
      this.logger.error('Operation failed:', error);
      throw error;
    }
  }
}
```

## Debugging and Testing

### 1. Debugging IOC Container

```tsx
// Check if service is registered
const container = IOC.implemention;
const isRegistered = container.isBound(UserService);

// Get all registered services
const bindings = container.getAll(UserService);
```

### 2. Unit Testing

```tsx
import { Container } from 'inversify';

describe('UserService', () => {
  let container: Container;
  let userService: UserService;

  beforeEach(() => {
    container = new Container();

    // Register test dependencies
    container.bind('UserApiInterface').toConstantValue(mockUserApi);
    container.bind(IOCIdentifier.AppConfig).toConstantValue(mockAppConfig);
    container
      .bind(IOCIdentifier.LocalStorageEncrypt)
      .toConstantValue(mockStorage);

    userService = container.get(UserService);
  });

  it('should authenticate user successfully', async () => {
    const result = await userService.onBefore();
    expect(result).toBeDefined();
  });
});
```

## Summary

The role of IOC container in the project:

1. **Dependency Management**: Unified management of all service dependencies
2. **Type Safety**: Compile-time type checking through TypeScript
3. **Testability**: Easy to unit test and mock
4. **Maintainability**: Clear dependency relationships, easy to understand and modify
5. **Extensibility**: Easy to add new services and dependencies

Through proper use of the IOC container, code becomes more modular, testable, and maintainable.
