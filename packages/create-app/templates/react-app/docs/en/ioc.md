# IOC Container (Dependency Injection)

## 📋 Table of Contents

- [Core Philosophy](#-core-philosophy) - UI separation, logic independence
- [What is IOC](#-what-is-ioc) - Inversion of Control
- [Why Need IOC](#-why-need-ioc) - Core problems it solves
- [Two Key Questions](#-two-key-questions) - Why need interfaces? Why separate even simple components?
- [Implementation in the Project](#-implementation-in-the-project) - Bootstrap integration
- [How to Use](#-how-to-use) - Practical guide
- [Testing](#-testing) - Independent testing and combination testing
- [Best Practices](#-best-practices) - 8 core practices
- [FAQ](#-faq) - Common questions

---

## 🎯 Core Philosophy

> **🚨 Important Principle: UI is UI, logic is logic, they must be separated!**

> **⭐ Core Advantage: UI and logic can be tested independently, and also in combination!**

### Core Concept

```
┌─────────────────────────────────────────┐
│  Traditional Approach: UI and Logic Mixed│
│                                         │
│  Component                               │
│  ├── UI rendering                        │
│  ├── Business logic                      │
│  ├── API calls                           │
│  ├── State management                    │
│  └── Data processing                     │
│                                         │
│  ❌ Problems:                            │
│  - Hard to test (need to render)        │
│  - Logic can't be reused                │
│  - Unclear responsibilities             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  IOC Approach: UI and Logic Completely   │
│  Separated                               │
│                                         │
│  Component (UI Layer)                    │
│  └── Only responsible for rendering      │
│       ↓ Get through IOC                  │
│  Service (Logic Layer)                   │
│  ├── Business logic                      │
│  ├── API calls                           │
│  ├── State management                    │
│  └── Data processing                     │
│                                         │
│  ✅ Advantages:                          │
│  - UI and logic can be tested separately │
│  - Logic can be reused                   │
│  - Clear responsibilities                │
└─────────────────────────────────────────┘
```

---

## 🔄 What is IOC

IOC (Inversion of Control) = **Don't create objects yourself, let the container create and manage them**

### Traditional Approach vs IOC

```typescript
// ❌ Traditional approach: Create dependencies yourself (tight coupling)
class UserComponent {
  private userService = new UserService();  // Create yourself
  private storage = new LocalStorage();      // Create yourself
  private api = new UserApi();               // Create yourself

  async loadUser() {
    return await this.userService.getUser();
  }
}

// Problems:
// 1. UserComponent depends on concrete implementations
// 2. Cannot replace UserService implementation
// 3. Cannot mock UserService in tests
// 4. Need to manually create UserService dependencies


// ✅ IOC approach: Container injects dependencies (loose coupling)
function UserComponent() {
  // Get service from IOC container
  const userService = useIOC('UserServiceInterface');  // Container provides

  async function loadUser() {
    return await userService.getUser();
  }

  // UI only responsible for rendering
  return <div>...</div>;
}

// Advantages:
// 1. UserComponent depends on interface, not implementation
// 2. Can easily replace UserService implementation
// 3. Can mock UserService in tests
// 4. UserService dependencies managed by container
```

### Analogy

```
Traditional Approach = Cook at home
- Need to buy groceries (create dependencies)
- Need to cook (manage lifecycle)
- Need to wash dishes (clean up resources)

IOC Approach = Go to restaurant
- Order food (tell container what you need)
- Wait for food (container provides service)
- Don't need to worry about kitchen (dependency management handled by container)
```

---

## 🤔 Why Need IOC

### Core Problem: UI and Logic Mixed Together

#### ❌ Problem Example: No UI Separation

```typescript
// ❌ Traditional component: UI and logic mixed
function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 😰 Business logic mixed in component
  useEffect(() => {
    setLoading(true);

    // 😰 API call in component
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        // 😰 Data processing in component
        const processedData = {
          ...data,
          fullName: `${data.firstName} ${data.lastName}`
        };
        setUser(processedData);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  // 😰 More business logic
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // UI rendering
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{user?.fullName}</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

// 😰😰😰 Problem Summary:
// 1. UI and logic mixed, hard to maintain
// 2. Logic can't be reused (what if another component needs user info?)
// 3. Hard to test (need to render component to test business logic)
// 4. Unclear responsibilities (component does too much)
// 5. Can't test logic separately (must test through UI)
```

#### ✅ Solution: IOC + UI Separation

```typescript
// ✅ Step 1: Define interface (Port)
export interface UserServiceInterface {
  getUser(): Promise<UserInfo>;
  logout(): Promise<void>;
  isAuthenticated(): boolean;
}

// ✅ Step 2: Implement service (Logic layer)
@injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @inject(UserApi) private api: UserApi,
    @inject(IOCIdentifier.AppConfig) private config: AppConfig,
    @inject(IOCIdentifier.LocalStorageEncrypt) private storage: Storage,
    @inject(IOCIdentifier.RouteServiceInterface) private router: RouteService
  ) {}

  // Pure logic: Get user info
  async getUser(): Promise<UserInfo> {
    const data = await this.api.getUserInfo();

    // Data processing
    return {
      ...data,
      fullName: `${data.firstName} ${data.lastName}`
    };
  }

  // Pure logic: Logout
  async logout(): Promise<void> {
    this.storage.removeItem(this.config.userTokenStorageKey);
    this.storage.removeItem(this.config.userInfoStorageKey);
    await this.router.push('/login');
  }

  isAuthenticated(): boolean {
    return !!this.storage.getItem(this.config.userTokenStorageKey);
  }
}

// ✅ Step 3: UI component (UI layer)
function UserProfile() {
  // Get service from IOC container
  const userService = useIOC('UserServiceInterface');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // ✅ UI only calls service, contains no business logic
    userService.getUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  // ✅ UI only responsible for rendering and event binding
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user?.fullName}</h1>
      <button onClick={() => userService.logout()}>Logout</button>
    </div>
  );
}

// ✅✅✅ Advantages Summary:
// 1. UI and logic completely separated, clear responsibilities
// 2. Logic can be reused (other components can use UserService)
// 3. Easy to test (can test UserService independently, no need to render UI)
// 4. Easy to maintain (changing logic doesn't affect UI, changing UI doesn't affect logic)
// 5. Can test logic separately (no dependency on UI)
```

### Comparison Summary

| Feature                         | No UI Separation                   | IOC + UI Separation                           |
| ------------------------------- | ---------------------------------- | --------------------------------------------- |
| **Clarity of Responsibilities** | ❌ UI and logic mixed              | ✅ UI only renders, logic independent         |
| **Testability**                 | ❌ Must render component to test   | ✅ Logic can be tested independently          |
| **Reusability**                 | ❌ Logic can't be reused           | ✅ Logic can be reused in multiple components |
| **Maintainability**             | ❌ Changing logic affects UI       | ✅ UI and logic modified independently        |
| **Test Speed**                  | ❌ Slow (need to render UI)        | ✅ Fast (pure logic tests)                    |
| **Test Complexity**             | ❌ High (need to mock many things) | ✅ Low (only need to mock interfaces)         |

---

## ❓ Two Key Questions

### Question 1: Why does an implementation class also need an interface?

Many developers ask: "If `UserService` only has one implementation class, why define a `UserServiceInterface` interface?"

#### Answer: For testability and flexibility

```typescript
// ❌ No interface: Hard to test
class UserComponent {
  constructor(
    @inject(UserService) private userService: UserService // Depend on concrete implementation
  ) {}
}

// In tests:
describe('UserComponent', () => {
  it('should load user', () => {
    // ❌ Problem: Cannot mock UserService
    // UserService has many dependencies (API, Storage, Router, etc.)
    // Need to create all these dependencies to create UserService

    const userApi = new UserApi(); // Need to create
    const storage = new Storage(); // Need to create
    const router = new Router(); // Need to create
    const config = new AppConfig(); // Need to create

    const userService = new UserService(userApi, config, storage, router);
    const component = new UserComponent(userService);

    // 😰 Too complex!
  });
});

// ✅ With interface: Easy to test
class UserComponent {
  constructor(
    @inject('UserServiceInterface') // Depend on interface
    private userService: UserServiceInterface
  ) {}
}

// In tests:
describe('UserComponent', () => {
  it('should load user', () => {
    // ✅ Only need to mock interface
    const mockUserService: UserServiceInterface = {
      getUser: jest.fn().mockResolvedValue({ name: 'John' }),
      logout: jest.fn(),
      isAuthenticated: jest.fn().mockReturnValue(true)
    };

    const component = new UserComponent(mockUserService);

    // ✅ Simple and clear!
  });
});
```

**Key Advantages:**

1. **Simple testing** - Only need to mock interface methods, no need to create real dependencies
2. **Isolation** - When testing UserComponent, don't need to care about UserService implementation details
3. **Flexibility** - Can easily replace implementation in future (like adding MockUserService, CacheUserService, etc.)
4. **Decoupling** - Component only depends on interface, not concrete implementation

**Even with only one implementation class, interface is necessary because:**

- ✅ Need to mock in tests
- ✅ May have new implementations in future
- ✅ Component shouldn't depend on concrete implementation
- ✅ Interface is contract, implementation is detail

### Question 2: Why does a simple UI component also need UI separation?

Many developers ask: "My component is simple, just displays a username, why separate?"

#### Answer: For testability and future extensibility

```typescript
// ❌ Simple component, not separated
function UserName() {
  const [name, setName] = useState('');

  useEffect(() => {
    // 😰 Even if simple, logic is mixed in UI
    fetch('/api/user')
      .then(res => res.json())
      .then(data => setName(data.name));
  }, []);

  return <span>{name}</span>;
}

// Problems:
// 1. Cannot test logic (must render component)
// 2. What if logic becomes complex? (add cache, error handling, etc.)
// 3. What if other components need username? (copy-paste?)


// ✅ Simple component, but separated
// 1. Service (Logic layer)
@injectable()
export class UserService implements UserServiceInterface {
  constructor(@inject(UserApi) private api: UserApi) {}

  async getUserName(): Promise<string> {
    const user = await this.api.getUserInfo();
    return user.name;
  }
}

// 2. UI component (UI layer)
function UserName() {
  const userService = useIOC('UserServiceInterface');
  const [name, setName] = useState('');

  useEffect(() => {
    userService.getUserName().then(setName);
  }, []);

  return <span>{name}</span>;
}

// Advantages:
// 1. ✅ Can test getUserName logic independently
// 2. ✅ When logic becomes complex in future, only need to modify UserService
// 3. ✅ Other components can reuse UserService
// 4. ✅ UI component stays simple, only responsible for rendering
```

**Key Scenario: Logic Gradually Becomes Complex**

```typescript
// ❌ Not separated: Component becomes bloated when logic gets complex
function UserName() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    // 😰 Add cache
    const cached = localStorage.getItem('userName');
    if (cached) {
      setName(cached);
      setLoading(false);
      return;
    }

    // 😰 Add error handling
    fetch('/api/user')
      .then(res => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then(data => {
        setName(data.name);
        localStorage.setItem('userName', data.name);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  // 😰 Component becomes complex
  if (loading) return <span>Loading...</span>;
  if (error) return <span>Error</span>;
  return <span>{name}</span>;
}


// ✅ With separation: When logic becomes complex, only modify service
@injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @inject(UserApi) private api: UserApi,
    @inject(IOCIdentifier.LocalStorageEncrypt) private storage: Storage
  ) {}

  // ✅ Logic in service, clear and straightforward
  async getUserName(): Promise<string> {
    // Cache logic
    const cached = this.storage.getItem('userName');
    if (cached) return cached;

    // API call
    const user = await this.api.getUserInfo();

    // Cache
    this.storage.setItem('userName', user.name);

    return user.name;
  }
}

// ✅ UI component stays simple
function UserName() {
  const userService = useIOC('UserServiceInterface');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    userService.getUserName()
      .then(setName)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <span>Loading...</span>;
  return <span>{name}</span>;
}
```

**Summary: Even if component is simple, still separate because:**

- ✅ **Simple now doesn't mean simple later** - Requirements change
- ✅ **Logic can be reused** - Other components may need it
- ✅ **Easy to test** - Logic can be tested independently
- ✅ **Clear responsibilities** - UI only renders, logic independent
- ✅ **Easy to maintain** - Changing logic doesn't affect UI

---

## 🛠️ Implementation in the Project

### 1. File Structure

```
src/
├── base/
│   ├── port/                    # Interface definition layer
│   │   ├── UserServiceInterface.ts
│   │   ├── I18nServiceInterface.ts
│   │   └── RouteServiceInterface.ts
│   └── services/                # Service implementation layer
│       ├── UserService.ts
│       ├── I18nService.ts
│       └── RouteService.ts
├── core/
│   ├── clientIoc/
│   │   ├── ClientIOC.ts         # IOC container
│   │   └── ClientIOCRegister.ts # Registrar
│   └── globals.ts               # Global instances
├── uikit/
│   ├── hooks/
│   │   └── useIOC.ts            # React Hook
│   └── contexts/
│       └── IOCContext.tsx       # React Context
└── config/
    └── IOCIdentifier.ts         # Identifier definitions

```

### 2. IOC Identifier Definition

```typescript
// config/IOCIdentifier.ts
export interface IOCIdentifierMap {
  AppConfig: AppConfig;
  Logger: LoggerInterface;
  LocalStorageEncrypt: SyncStorageInterface<string, string>;
  UserServiceInterface: UserServiceInterface;
  I18nServiceInterface: I18nServiceInterface;
  RouteServiceInterface: RouteServiceInterface;
}

export const IOCIdentifier = {
  AppConfig: 'AppConfig',
  Logger: 'Logger',
  LocalStorageEncrypt: 'LocalStorageEncrypt',
  UserServiceInterface: 'UserServiceInterface',
  I18nServiceInterface: 'I18nServiceInterface',
  RouteServiceInterface: 'RouteServiceInterface'
} as const;
```

### 3. Service Registration

```typescript
// src/core/clientIoc/ClientIOCRegister.ts
export class ClientIOCRegister implements IOCRegisterInterface {
  constructor(protected options: IocRegisterOptions) {}

  /**
   * Register global services
   */
  protected registerGlobals(ioc: IOCContainerInterface): void {
    const { appConfig } = this.options;
    const { dialogHandler, localStorageEncrypt, JSON, logger } = globals;

    // ✅ Register global instances
    ioc.bind(IOCIdentifier.JSONSerializer, JSON);
    ioc.bind(IOCIdentifier.Logger, logger);
    ioc.bind(IOCIdentifier.AppConfig, appConfig);
    ioc.bind(IOCIdentifier.LocalStorageEncrypt, localStorageEncrypt);
  }

  /**
   * Register business services
   */
  protected registerImplement(ioc: IOCContainerInterface): void {
    // ✅ Register service implementations
    ioc.bind(
      IOCIdentifier.I18nServiceInterface,
      new I18nService(this.options.pathname)
    );

    ioc.bind(IOCIdentifier.RouteServiceInterface, new RouteService(/* ... */));

    // ✅ Service can depend on other services
    ioc.bind(IOCIdentifier.UserServiceInterface, ioc.get(UserService));
  }

  /**
   * Registration entry point
   */
  register(ioc: IOCContainerInterface): void {
    this.registerGlobals(ioc);
    this.registerImplement(ioc);
  }
}
```

### 4. Create IOC Container

```typescript
// src/core/clientIoc/ClientIOC.ts
import { createIOCFunction } from '@qlover/corekit-bridge';
import { InversifyContainer } from '@/base/cases/InversifyContainer';
import { ClientIOCRegister } from './ClientIOCRegister';

export const clientIOC = {
  create(options: IocRegisterOptions) {
    // Create container
    const container = new InversifyContainer();

    // Create IOC function
    const IOC = createIOCFunction(container);

    // Register services
    const register = new ClientIOCRegister(options);
    register.register(container, IOC);

    return IOC;
  }
};
```

### 5. Initialize in Bootstrap

```typescript
// src/core/bootstraps/BootstrapClient.ts
export class BootstrapClient {
  static async main(args: BootstrapClientArgs) {
    const { root, bootHref, ioc } = args;

    // ✅ Create IOC container
    const IOC = ioc.create({
      pathname: bootHref,
      appConfig: appConfig
    });

    // Use IOC in Bootstrap
    const bootstrap = new Bootstrap({
      root,
      logger,
      ioc: {
        manager: IOC,
        register: iocRegister
      }
    });

    await bootstrap.initialize();
    await bootstrap.start();
  }
}
```

---

## 📝 How to Use

### 1. Define Interface (Port)

```typescript
// src/base/port/UserServiceInterface.ts
export interface UserServiceInterface {
  getUser(): Promise<UserInfo>;
  login(username: string, password: string): Promise<void>;
  logout(): Promise<void>;
  isAuthenticated(): boolean;
}
```

### 2. Implement Service

```typescript
// src/base/services/UserService.ts
import { injectable, inject } from 'inversify';

@injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @inject(UserApi) private api: UserApi,
    @inject(IOCIdentifier.AppConfig) private config: AppConfig,
    @inject(IOCIdentifier.LocalStorageEncrypt) private storage: Storage,
    @inject(IOCIdentifier.RouteServiceInterface) private router: RouteService
  ) {}

  async getUser(): Promise<UserInfo> {
    const token = this.storage.getItem(this.config.userTokenStorageKey);
    if (!token) throw new Error('No token');

    return await this.api.getUserInfo(token);
  }

  async login(username: string, password: string): Promise<void> {
    const response = await this.api.login({ username, password });
    this.storage.setItem(this.config.userTokenStorageKey, response.token);
  }

  async logout(): Promise<void> {
    this.storage.removeItem(this.config.userTokenStorageKey);
    await this.router.push('/login');
  }

  isAuthenticated(): boolean {
    return !!this.storage.getItem(this.config.userTokenStorageKey);
  }
}
```

### 3. Use in UI Components

```typescript
// src/pages/UserProfile.tsx
import { useIOC } from '@/uikit/hooks/useIOC';

function UserProfile() {
  // ✅ Get service from IOC container
  const userService = useIOC('UserServiceInterface');
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    userService.getUser().then(setUser);
  }, []);

  const handleLogout = () => {
    userService.logout();
  };

  // ✅ UI only responsible for rendering
  return (
    <div>
      <h1>{user?.name}</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

### 4. Use Other Services in Services

```typescript
// src/base/services/ProfileService.ts
@injectable()
export class ProfileService {
  constructor(
    // ✅ Service can depend on other services
    @inject(IOCIdentifier.UserServiceInterface)
    private userService: UserServiceInterface,
    @inject(IOCIdentifier.I18nServiceInterface)
    private i18n: I18nServiceInterface
  ) {}

  async getUserProfile(): Promise<string> {
    const user = await this.userService.getUser();
    return this.i18n.t('profile.welcome', { name: user.name });
  }
}
```

---

## 🧪 Testing

### Core Advantage: UI and logic can be tested independently, and also in combination

#### 1. Test Logic Independently (No UI needed)

```typescript
// __tests__/src/base/services/UserService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '@/base/services/UserService';

describe('UserService (Logic Test)', () => {
  let userService: UserService;
  let mockApi: any;
  let mockStorage: any;
  let mockRouter: any;
  let mockConfig: any;

  beforeEach(() => {
    // ✅ Only need to mock interfaces
    mockApi = {
      getUserInfo: vi.fn(),
      login: vi.fn()
    };

    mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };

    mockRouter = {
      push: vi.fn()
    };

    mockConfig = {
      userTokenStorageKey: '__test_token__'
    };

    // ✅ Create service
    userService = new UserService(mockApi, mockConfig, mockStorage, mockRouter);
  });

  it('should get user when token exists', async () => {
    // ✅ Set mock return value
    mockStorage.getItem.mockReturnValue('test-token');
    mockApi.getUserInfo.mockResolvedValue({ name: 'John' });

    // ✅ Test logic
    const user = await userService.getUser();

    // ✅ Verify result
    expect(user.name).toBe('John');
    expect(mockStorage.getItem).toHaveBeenCalledWith('__test_token__');
    expect(mockApi.getUserInfo).toHaveBeenCalledWith('test-token');
  });

  it('should throw error when no token', async () => {
    // ✅ Test error scenario
    mockStorage.getItem.mockReturnValue(null);

    await expect(userService.getUser()).rejects.toThrow('No token');
  });

  it('should login and save token', async () => {
    // ✅ Test login logic
    mockApi.login.mockResolvedValue({ token: 'new-token' });

    await userService.login('user', 'pass');

    expect(mockApi.login).toHaveBeenCalledWith({
      username: 'user',
      password: 'pass'
    });
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      '__test_token__',
      'new-token'
    );
  });

  it('should logout and clear token', async () => {
    // ✅ Test logout logic
    await userService.logout();

    expect(mockStorage.removeItem).toHaveBeenCalledWith('__test_token__');
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });
});

// ✅✅✅ Advantages:
// 1. Don't need to render UI
// 2. Tests run fast (pure logic)
// 3. Easy to mock (only need to mock interfaces)
// 4. Can test all edge cases
```

#### 2. Test UI Independently (No real logic needed)

```typescript
// __tests__/src/pages/UserProfile.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { UserProfile } from '@/pages/UserProfile';
import { IOCProvider } from '@/uikit/contexts/IOCContext';

describe('UserProfile (UI Test)', () => {
  it('should display user name', async () => {
    // ✅ Mock service
    const mockUserService = {
      getUser: vi.fn().mockResolvedValue({ name: 'John Doe' }),
      logout: vi.fn(),
      isAuthenticated: vi.fn().mockReturnValue(true)
    };

    const mockIOC = (identifier: string) => {
      if (identifier === 'UserServiceInterface') return mockUserService;
    };

    // ✅ Render component
    render(
      <IOCProvider value={mockIOC}>
        <UserProfile />
      </IOCProvider>
    );

    // ✅ Verify UI
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should call logout when button clicked', async () => {
    const mockUserService = {
      getUser: vi.fn().mockResolvedValue({ name: 'John' }),
      logout: vi.fn(),
      isAuthenticated: vi.fn().mockReturnValue(true)
    };

    const mockIOC = (identifier: string) => {
      if (identifier === 'UserServiceInterface') return mockUserService;
    };

    render(
      <IOCProvider value={mockIOC}>
        <UserProfile />
      </IOCProvider>
    );

    // ✅ Simulate user action
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    // ✅ Verify service call
    expect(mockUserService.logout).toHaveBeenCalled();
  });
});

// ✅✅✅ Advantages:
// 1. Don't need real service implementation
// 2. Can easily simulate various scenarios
// 3. UI tests focus on UI logic
```

#### 3. Combination Testing (UI + Logic)

```typescript
// __tests__/src/integration/UserFlow.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { UserProfile } from '@/pages/UserProfile';
import { UserService } from '@/base/services/UserService';
import { IOCProvider } from '@/uikit/contexts/IOCContext';

describe('User Flow (Integration Test)', () => {
  it('should complete user login flow', async () => {
    // ✅ Use real service implementation
    const mockApi = {
      getUserInfo: vi.fn().mockResolvedValue({ name: 'John' }),
      login: vi.fn().mockResolvedValue({ token: 'test-token' })
    };

    const mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };

    const mockRouter = { push: vi.fn() };
    const mockConfig = { userTokenStorageKey: '__token__' };

    // ✅ Create real service
    const userService = new UserService(
      mockApi,
      mockConfig,
      mockStorage,
      mockRouter
    );

    const mockIOC = (identifier: string) => {
      if (identifier === 'UserServiceInterface') return userService;
    };

    // ✅ Render real UI
    render(
      <IOCProvider value={mockIOC}>
        <UserProfile />
      </IOCProvider>
    );

    // ✅ Test complete flow
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    // ✅ Click logout
    fireEvent.click(screen.getByText('Logout'));

    // ✅ Verify entire flow
    expect(mockStorage.removeItem).toHaveBeenCalledWith('__token__');
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });
});

// ✅✅✅ Advantages:
// 1. Test real user flow
// 2. Can discover UI and logic integration issues
// 3. Closer to real usage scenarios
```

### Testing Strategy Summary

```
┌─────────────────────────────────────────┐
│  Testing Pyramid                         │
│                                         │
│      △ UI Tests (Few)                   │
│     ╱ ╲                                 │
│    ╱   ╲                                │
│   ╱     ╲                               │
│  ╱───────╲ Integration Tests (Some)    │
│ ╱         ╲                             │
│╱═══════════╲ Logic Tests (Many)        │
│                                         │
│  Logic Tests: Fast, stable, comprehensive│
│  Integration Tests: Verify integration   │
│  UI Tests: Verify user interactions      │
└─────────────────────────────────────────┘
```

**Recommended Test Ratio:**

- 70% Logic tests (UserService.test.ts)
- 20% Integration tests (UserFlow.test.tsx)
- 10% UI tests (UserProfile.test.tsx)

---

## 💎 Best Practices

### 1. ✅ Always Define Interface

```typescript
// ✅ Good practice: Define interface first
export interface UserServiceInterface {
  getUser(): Promise<UserInfo>;
  logout(): Promise<void>;
}

// Then implement
@injectable()
export class UserService implements UserServiceInterface {
  // ...
}

// ❌ Bad practice: Write implementation directly
@injectable()
export class UserService {
  // No interface, hard to test
}
```

### 2. ✅ Complete UI and Logic Separation

```typescript
// ✅ Good practice: UI only responsible for rendering
function UserProfile() {
  const userService = useIOC('UserServiceInterface');
  const [user, setUser] = useState(null);

  useEffect(() => {
    userService.getUser().then(setUser);
  }, []);

  return <div>{user?.name}</div>;
}

// ❌ Bad practice: Logic mixed in UI
function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(setUser);
  }, []);

  return <div>{user?.name}</div>;
}
```

### 3. ✅ Use Dependency Injection

```typescript
// ✅ Good practice: Inject through constructor
@injectable()
export class UserService {
  constructor(
    @inject(UserApi) private api: UserApi,
    @inject(IOCIdentifier.AppConfig) private config: AppConfig
  ) {}
}

// ❌ Bad practice: Create dependencies directly
export class UserService {
  private api = new UserApi();
  private config = new AppConfig();
}
```

### 4. ✅ Single Responsibility for Services

```typescript
// ✅ Good practice: Each service responsible for one thing
@injectable()
export class UserService {
  // Only responsible for user-related logic
  async getUser() {
    /* ... */
  }
  async logout() {
    /* ... */
  }
}

@injectable()
export class ThemeService {
  // Only responsible for theme-related logic
  setTheme() {
    /* ... */
  }
  getTheme() {
    /* ... */
  }
}

// ❌ Bad practice: One service does multiple things
@injectable()
export class ApplicationService {
  async getUser() {
    /* ... */
  }
  setTheme() {
    /* ... */
  }
  changeLanguage() {
    /* ... */
  }
  // Too many responsibilities!
}
```

### 5. ✅ Depend on Interfaces, Not Implementations

```typescript
// ✅ Good practice
@injectable()
export class UserService {
  constructor(
    @inject('UserApiInterface') private api: UserApiInterface // Interface
  ) {}
}

// ❌ Bad practice
@injectable()
export class UserService {
  constructor(
    @inject(UserApi) private api: UserApi // Concrete implementation
  ) {}
}
```

### 6. ✅ Separate Even If Simple

```typescript
// ✅ Good practice: Separate even if simple
@injectable()
export class CounterService {
  private count = 0;

  increment() {
    this.count++;
    return this.count;
  }
}

function Counter() {
  const counterService = useIOC('CounterService');
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(counterService.increment());
  };

  return <button onClick={handleClick}>{count}</button>;
}

// ❌ Bad practice: Simple logic also mixed in UI
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

### 7. ✅ Write Comprehensive Tests

```typescript
// ✅ Good practice: Logic tests + UI tests + Integration tests
describe('UserService (Logic)', () => {
  it('should get user', async () => {
    /* ... */
  });
  it('should handle error', async () => {
    /* ... */
  });
});

describe('UserProfile (UI)', () => {
  it('should display user', async () => {
    /* ... */
  });
});

describe('User Flow (Integration)', () => {
  it('should complete flow', async () => {
    /* ... */
  });
});

// ❌ Bad practice: Only UI tests
describe('UserProfile', () => {
  it('should work', async () => {
    // Only test UI, logic not tested
  });
});
```

### 8. ✅ Use Type-safe Identifiers

```typescript
// ✅ Good practice: Type-safe identifiers
const userService = useIOC('UserServiceInterface');
// TypeScript knows userService type

// ❌ Bad practice: String literals
const userService = useIOC('UserService');
// Easy to misspell, no type checking
```

---

## ❓ FAQ

### Q1: Does IOC increase complexity?

**A:** Short-term maybe, but long-term it greatly reduces complexity:

**Short-term (small projects):**

- Need to define interfaces
- Need to register services
- Need to learn IOC concepts

**Long-term (project grows):**

- ✅ Easy to test (save lots of testing time)
- ✅ Easy to maintain (clear dependency relationships)
- ✅ Easy to extend (adding new features is simple)
- ✅ Team collaboration (clear responsibilities)

### Q2: Do all components need IOC?

**A:** Not necessarily, but recommended:

**Scenarios that need IOC:**

- ✅ Components with business logic
- ✅ Components that call APIs
- ✅ Components that access Storage
- ✅ Components that need testing

**Scenarios that can skip IOC:**

- Pure presentational components (only receive props)
- Very simple UI components (like Button, Icon)

### Q3: Why not directly import service?

**A:**

```typescript
// ❌ Direct import
import { userService } from '@/services/UserService';

function UserProfile() {
  // Problems:
  // 1. userService is singleton, can't replace in tests
  // 2. userService dependencies created at module load time
  // 3. Hard to mock
}

// ✅ Use IOC
function UserProfile() {
  const userService = useIOC('UserServiceInterface');

  // Advantages:
  // 1. Can provide mock implementation in tests
  // 2. Dependencies managed by container, created on demand
  // 3. Easy to mock
}
```

### Q4: How to test components using IOC?

**A:** Provide mock IOC:

```typescript
const mockIOC = (identifier: string) => {
  if (identifier === 'UserServiceInterface') {
    return mockUserService;
  }
  // ... other services
};

render(
  <IOCProvider value={mockIOC}>
    <UserProfile />
  </IOCProvider>
);
```

### Q5: What's the difference between IOC and Context?

**A:**

| Feature                   | React Context             | IOC Container         |
| ------------------------- | ------------------------- | --------------------- |
| **Scope**                 | React component tree      | Global                |
| **Dependency Management** | ❌ None                   | ✅ Yes                |
| **Lifecycle**             | Component lifecycle       | Application lifecycle |
| **Testing**               | ⚠️ Need Provider          | ✅ Easy to mock       |
| **Type Safety**           | ⚠️ Need manual definition | ✅ Auto-inference     |

**Recommendation:**

- Use IOC to manage services (logic)
- Use Context to manage UI state

---

## 📚 Related Documentation

- [Project Architecture Design](./index.md) - Understand overall architecture
- [Bootstrap Initializer](./bootstrap.md) - IOC in Bootstrap application
- [Environment Variable Management](./env.md) - AppConfig injection
- [Store State Management](./store.md) - How application layer notifies UI layer (IOC + Store)
- [Testing Guide](./test-guide.md) - Detailed testing strategies

---

## 🎉 Summary

Core value of IOC container:

1. **UI Separation** 🎨 - UI is UI, logic is logic
2. **Testability** 🧪 - Logic can be tested independently, UI can be tested independently, and also in combination
3. **Interfaces Required** 🔌 - Even with only one implementation, still need interface (for testing)
4. **Complete Separation** 🏗️ - Even simple components, still separate (for future)
5. **Dependency Management** 📦 - Container uniformly manages all dependencies
6. **Decoupling** 🔗 - Components don't depend on concrete implementations
7. **Easy to Maintain** 🛠️ - Clear dependency relationships
8. **Easy to Extend** 🚀 - Easy to add new features

**Remember two core principles:**

1. **UI is UI, logic is logic, they must be separated!**
2. **Even with only one implementation, still need interface; even if component is simple, still separate!**

---

**Feedback:**  
If you have any questions or suggestions about the IOC container, please discuss in the team channel or submit an Issue.
