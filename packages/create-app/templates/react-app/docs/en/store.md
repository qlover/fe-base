# Store State Management

## 📋 Table of Contents

- [Core Philosophy](#-core-philosophy) - Application layer notifies UI layer
- [What is Store](#-what-is-store) - State container
- [Why Need Store](#-why-need-store) - Solve communication problem
- [Core Problem](#-core-problem) - How application layer notifies UI layer
- [Implementation in the Project](#-implementation-in-the-project) - Practical guide
- [How to Use](#-how-to-use) - Service + Store + useStore
- [Testing](#-testing) - Independent testing and combination testing
- [Best Practices](#-best-practices) - 7 core practices
- [FAQ](#-faq) - Common questions

---

## 🎯 Core Philosophy

> **🚨 Core Problem: How does the application layer (Service) notify the UI layer to update while maintaining separation?**

> **⭐ Solution: Service contains Store, publishes state through `emit`, UI subscribes to state through `useStore`!**

### Core Concept

```
┌──────────────────────────────────────────────┐
│  Problem: UI and logic are separated,        │
│  but how do they communicate?                │
│                                              │
│  Service (Application Layer)                 │
│  ├── Business logic                          │
│  └── Data processing                         │
│       ↓ How to notify?                       │
│  Component (UI Layer)                        │
│  └── UI rendering                            │
│                                              │
│  ❌ Problem: Service changed data, how does  │
│     UI know?                                 │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│  Solution: Store as bridge                   │
│                                              │
│  Service (Application Layer)                 │
│  ├── Business logic                          │
│  ├── Store (State container)                 │
│  │   ├── state                               │
│  │   └── emit() (Publish state)              │
│  │                                            │
│  │   ↓ Publish-Subscribe pattern             │
│  │                                            │
│  └── useStore (Subscribe)                    │
│       ↓                                       │
│  Component (UI Layer)                        │
│  └── Auto-update UI                          │
│                                              │
│  ✅ Service publishes state via emit         │
│  ✅ UI subscribes to state via useStore      │
│  ✅ Maintain separation, decoupled           │
└──────────────────────────────────────────────┘
```

---

## 🗂️ What is Store

Store is a **reactive state container** based on the **publish-subscribe pattern**.

### Simple Understanding

```
Store = State + Publish-Subscribe

Service owns Store
Service publishes state through Store.emit()
UI subscribes to state through useStore()
```

### Analogy

```
Store is like a radio station:

📻 Station (Store)
- Has program content (state)
- Can broadcast programs (emit)
- Listeners can tune in (subscribe)

🎤 Host (Service)
- Creates program content (business logic)
- Broadcasts via station (emit)

📱 Listener (UI Component)
- Tunes into station (useStore)
- Automatically reacts to new content (auto-update UI)
```

---

## 🤔 Why Need Store

### Core Problem: How to communicate after UI and logic separation?

We've already separated UI and logic through IOC, but here's the problem:

#### ❌ Problem Example: Without Store

```typescript
// Service (Logic layer)
@injectable()
export class UserService {
  private user: UserInfo | null = null;

  async login(username: string, password: string) {
    const response = await this.api.login({ username, password });
    this.user = response.user;  // ✅ Login successful, user updated

    // ❌ Problem: How does UI know user has been updated?
    // ❌ Service cannot notify UI
  }
}

// UI component
function UserProfile() {
  const userService = useIOC('UserServiceInterface');

  // ❌ Problem: How to get userService.user?
  // ❌ How to trigger UI re-render when userService.user updates?

  return <div>{/* Cannot display user */}</div>;
}

// 😰😰😰 Problem Summary:
// 1. UI cannot access Service's internal state
// 2. UI doesn't know when Service state updates
// 3. Need to manually call a method to get state? (breaks separation principle)
// 4. Need to poll for state? (poor performance)
```

#### ✅ Solution: Use Store

```typescript
// Service (Logic layer)
@injectable()
export class UserService extends StoreInterface<UserState> {
  constructor() {
    super(() => ({
      user: null,
      loading: false
    }));
  }

  async login(username: string, password: string) {
    // Set loading state
    this.emit({ ...this.state, loading: true });

    const response = await this.api.login({ username, password });

    // ✅ Publish new state via emit, automatically notify all subscribers
    this.emit({
      user: response.user,
      loading: false
    });
  }
}

// UI component
function UserProfile() {
  const userService = useIOC('UserServiceInterface');

  // ✅ Subscribe to state via useStore
  const { user, loading } = useStore(userService);

  // ✅ Component automatically re-renders when userService.emit()

  if (loading) return <div>Loading...</div>;
  return <div>{user?.name}</div>;
}

// ✅✅✅ Advantages Summary:
// 1. UI can subscribe to Service state
// 2. UI automatically updates when Service state updates
// 3. Maintain separation (Service doesn't know which UIs are listening)
// 4. High performance (only subscribed components update)
```

### Comparison Summary

| Feature                 | Without Store                          | With Store                     |
| ----------------------- | -------------------------------------- | ------------------------------ |
| **State Access**        | ❌ Cannot access internal state        | ✅ Subscribe via useStore      |
| **Update Notification** | ❌ UI doesn't know about state changes | ✅ emit automatically notifies |
| **UI Update**           | ❌ Need manual trigger                 | ✅ Auto re-render              |
| **Decoupling**          | ❌ Service needs to know UI            | ✅ Completely decoupled        |
| **Performance**         | ❌ Polling or global update            | ✅ Precise subscriber updates  |
| **Testability**         | ❌ Hard to test state changes          | ✅ Easy to test state          |

---

## ❓ Core Problem

### How does application layer notify UI layer while maintaining separation?

#### Problem Breakdown

1. **Application layer (Service) has state** - like user info, loading state
2. **UI layer needs to display this state** - show username, show loading animation
3. **Application layer state changes** - after login success, user info updates
4. **UI layer needs to auto-update** - after user info changes, UI automatically shows new name
5. **Maintain separation** - Service shouldn't directly manipulate UI, UI shouldn't directly access Service internals

#### Solution: Publish-Subscribe Pattern

```typescript
// 1. Service defines state
interface UserState {
  user: UserInfo | null;
  loading: boolean;
}

// 2. Service extends StoreInterface
@injectable()
export class UserService extends StoreInterface<UserState> {
  constructor() {
    super(() => ({
      user: null,
      loading: false
    }));
  }

  // 3. Service publishes state via emit
  async login(username: string, password: string) {
    this.emit({ ...this.state, loading: true });  // Publish: start loading

    const response = await this.api.login({ username, password });

    this.emit({
      user: response.user,
      loading: false
    });  // Publish: loading complete, user logged in
  }

  // 4. Service doesn't need to know who's listening
  // ✅ Completely decoupled
}

// 5. UI subscribes to state via useStore
function LoginPage() {
  const userService = useIOC('UserServiceInterface');
  const { loading } = useStore(userService);

  const handleLogin = () => {
    userService.login('user', 'pass');
  };

  // 6. When Service emits new state, UI auto-updates
  return (
    <button onClick={handleLogin} disabled={loading}>
      {loading ? 'Logging in...' : 'Login'}
    </button>
  );
}
```

#### Workflow

```
┌─────────────────────────────────────────────┐
│  Complete state update flow                  │
│                                             │
│  1. User clicks button                       │
│     ↓                                        │
│  2. UI calls Service method                  │
│     userService.login()                     │
│     ↓                                        │
│  3. Service executes business logic          │
│     - Call API                               │
│     - Process data                           │
│     ↓                                        │
│  4. Service publishes new state via emit     │
│     this.emit({ user: ..., loading: false })│
│     ↓                                        │
│  5. Store notifies all subscribers           │
│     listeners.forEach(listener => ...)      │
│     ↓                                        │
│  6. useStore receives notification           │
│     Trigger component re-render              │
│     ↓                                        │
│  7. UI displays latest state                 │
│     Show username / Hide loading animation   │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Implementation in the Project

### 1. File Structure

```
src/
├── base/
│   ├── services/
│   │   ├── UserService.ts          # Service extends StoreInterface
│   │   ├── RouteService.ts         # Service extends StoreInterface
│   │   └── I18nService.ts          # Service extends StoreInterface
│   └── port/
│       └── UserServiceInterface.ts # Service interface
└── uikit/
    └── hooks/
        └── useStore.ts (from @brain-toolkit/react-kit)
```

### 2. Store Base Class

Store system is based on `SliceStore` from `@brain-toolkit/react-kit`:

```typescript
// From @brain-toolkit/react-kit
export class SliceStore<T> {
  protected state: T;
  private listeners = new Set<(state: T) => void>();

  constructor(stateFactory: () => T) {
    this.state = stateFactory();
  }

  // Publish state
  protected emit(newState: T) {
    this.state = newState;
    // Notify all subscribers
    this.listeners.forEach((listener) => listener(this.state));
  }

  // Subscribe to state
  subscribe(listener: (state: T) => void) {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => this.listeners.delete(listener);
  }

  // Get current state
  getState(): T {
    return this.state;
  }
}
```

### 3. StoreInterface Base Class

Project's Store base class, provides additional utility methods:

```typescript
// From @qlover/corekit-bridge
export abstract class StoreInterface<
  T extends StoreStateInterface
> extends SliceStore<T> {
  constructor(protected stateFactory: () => T) {
    super(stateFactory);
  }

  // Reset state
  resetState(): void {
    this.emit(this.stateFactory());
  }

  // Clone state (for updates)
  cloneState(source?: Partial<T>): T {
    const cloned = clone(this.state);
    if (typeof cloned === 'object' && cloned !== null) {
      Object.assign(cloned, source);
    }
    return cloned;
  }
}
```

### 4. State Interface

```typescript
// All state must implement this interface
export interface StoreStateInterface {
  // Can define common properties here
  // loading?: boolean;
  // error?: Error | null;
}
```

---

## 📝 How to Use

### 1. Define State Interface

```typescript
// src/base/services/UserService.ts
export interface UserState extends StoreStateInterface {
  user: UserInfo | null;
  loading: boolean;
  error: Error | null;
}
```

### 2. Service Extends StoreInterface

```typescript
// src/base/services/UserService.ts
import { StoreInterface } from '@qlover/corekit-bridge';
import { injectable, inject } from 'inversify';

@injectable()
export class UserService extends StoreInterface<UserState> {
  constructor(
    @inject(UserApi) private api: UserApi,
    @inject(IOCIdentifier.AppConfig) private config: AppConfig
  ) {
    // Initialize state
    super(() => ({
      user: null,
      loading: false,
      error: null
    }));
  }

  // Business method: publish state via emit
  async login(username: string, password: string) {
    // 1. Start loading
    this.emit({
      ...this.state,
      loading: true,
      error: null
    });

    try {
      // 2. Call API
      const response = await this.api.login({ username, password });

      // 3. Success: publish new state
      this.emit({
        user: response.user,
        loading: false,
        error: null
      });
    } catch (error) {
      // 4. Failure: publish error state
      this.emit({
        ...this.state,
        loading: false,
        error: error as Error
      });
    }
  }

  async logout() {
    this.emit({
      user: null,
      loading: false,
      error: null
    });
  }

  // Use cloneState to simplify updates
  setUser(user: UserInfo) {
    this.emit(this.cloneState({ user }));
  }
}
```

### 3. UI Subscribes to State

```typescript
// src/pages/LoginPage.tsx
import { useStore } from '@brain-toolkit/react-kit/hooks/useStore';
import { useIOC } from '@/uikit/hooks/useIOC';

function LoginPage() {
  const userService = useIOC('UserServiceInterface');

  // ✅ Method 1: Subscribe to complete state
  const { user, loading, error } = useStore(userService);

  const handleLogin = async () => {
    await userService.login('username', 'password');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {error && <div>Error: {error.message}</div>}
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
```

### 4. Use Selectors (Performance Optimization)

```typescript
// src/pages/UserProfile.tsx
function UserProfile() {
  const userService = useIOC('UserServiceInterface');

  // ✅ Method 2: Only subscribe to needed state (better performance)
  const user = useStore(userService, (state) => state.user);

  // ✅ Only re-renders when user changes, loading changes won't trigger

  return <div>{user?.name}</div>;
}
```

### 5. Define Selectors (Recommended)

```typescript
// src/base/services/UserService.ts
@injectable()
export class UserService extends StoreInterface<UserState> {
  // ... other code

  // ✅ Define selectors
  selector = {
    user: (state: UserState) => state.user,
    loading: (state: UserState) => state.loading,
    error: (state: UserState) => state.error,
    isLoggedIn: (state: UserState) => state.user !== null
  };
}

// Usage
function UserProfile() {
  const userService = useIOC('UserServiceInterface');

  // ✅ Use predefined selectors
  const user = useStore(userService, userService.selector.user);
  const isLoggedIn = useStore(userService, userService.selector.isLoggedIn);

  return <div>{isLoggedIn ? user?.name : 'Please login'}</div>;
}
```

### 6. Real Project Examples

#### Example 1: UserService

```typescript
// src/base/services/UserService.ts
@injectable()
export class UserService extends UserAuthServiceInterface {
  constructor(
    @inject(UserApi) userApi: UserApi,
    @inject(IOCIdentifier.AppConfig) appConfig: AppConfig,
    @inject(IOCIdentifier.LocalStorageEncrypt) storage: Storage
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

  // ✅ UserService's base class contains store
  override get store(): UserAuthStore<UserApiState> {
    return super.store as UserAuthStore<UserApiState>;
  }

  override async logout(): Promise<void> {
    await super.logout();
    // ✅ store automatically notifies UI
    this.routerService.gotoLogin();
  }
}

// Usage
function Layout() {
  const userService = useIOC(IOCIdentifier.UserServiceInterface);

  // ✅ Subscribe to userService.store
  useStore(userService.store);

  if (userService.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
```

#### Example 2: RouteService

```typescript
// src/base/services/RouteService.ts
export class RouteService extends StoreInterface<RouterServiceState> {
  constructor(
    protected uiBridge: UIBridgeInterface<NavigateFunction>,
    protected i18nService: I18nServiceInterface,
    protected options: RouterServiceOptions
  ) {
    super(
      () => new RouterServiceState(options.routes, !!options.hasLocalRoutes)
    );
  }

  // ✅ Publish route changes via emit
  override changeRoutes(routes: RouteConfigValue[]): void {
    this.emit(this.cloneState({ routes }));
  }

  override goto(path: string, options?: NavigateOptions): void {
    const composedPath = this.composePath(path);
    this.uiBridge.getUIBridge()(composedPath, options);
  }
}

// Usage
function AppRouterProvider() {
  const routerService = useIOC(IOCIdentifier.RouteServiceInterface);

  // ✅ Subscribe to routes changes
  const routes = useStore(routerService, (state) => state.routes);

  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
}
```

#### Example 3: I18nService

```typescript
// src/base/services/I18nService.ts
export class I18nService extends StoreInterface<I18nServiceState> {
  constructor(protected pathname: string) {
    super(() => new I18nServiceState(i18n.language as I18nServiceLocale));
  }

  selector = {
    loading: (state: I18nServiceState) => state.loading,
    language: (state: I18nServiceState) => state.language
  };

  override async changeLanguage(lng: string): Promise<void> {
    // ✅ Publish loading state
    this.emit(this.cloneState({ loading: true }));

    await i18n.changeLanguage(lng);

    // ✅ Publish complete state
    this.emit({
      language: lng as I18nServiceLocale,
      loading: false
    });
  }
}

// Usage
function LanguageSwitcher() {
  const i18nService = useIOC(IOCIdentifier.I18nServiceInterface);

  // ✅ Only subscribe to loading state
  const loading = useStore(i18nService, i18nService.selector.loading);

  return (
    <Select
      value={i18n.language}
      loading={loading}
      onChange={(lng) => i18nService.changeLanguage(lng)}
    />
  );
}
```

---

## 🧪 Testing

### Core Advantage: Store can be tested independently, UI can mock Store

#### 1. Test Service and Store (Logic Test)

```typescript
// __tests__/src/base/services/UserService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '@/base/services/UserService';

describe('UserService (Logic Test)', () => {
  let userService: UserService;
  let mockApi: any;

  beforeEach(() => {
    mockApi = {
      login: vi.fn(),
      getUserInfo: vi.fn()
    };

    userService = new UserService(mockApi, mockConfig, mockStorage);
  });

  it('should update store state when login success', async () => {
    // ✅ Test state changes
    mockApi.login.mockResolvedValue({
      user: { name: 'John', id: 1 },
      token: 'test-token'
    });

    // Subscribe to state changes
    const states: any[] = [];
    userService.subscribe((state) => {
      states.push({ ...state });
    });

    // Call login
    await userService.login('user', 'pass');

    // ✅ Verify state change sequence
    expect(states).toHaveLength(2);

    // First emit: loading = true
    expect(states[0]).toEqual({
      user: null,
      loading: true,
      error: null
    });

    // Second emit: loading = false, user = John
    expect(states[1]).toEqual({
      user: { name: 'John', id: 1 },
      loading: false,
      error: null
    });
  });

  it('should update store state when login fails', async () => {
    mockApi.login.mockRejectedValue(new Error('Invalid credentials'));

    const states: any[] = [];
    userService.subscribe((state) => states.push({ ...state }));

    await expect(userService.login('user', 'wrong')).rejects.toThrow();

    // ✅ Verify error state
    expect(states[1]).toEqual({
      user: null,
      loading: false,
      error: expect.any(Error)
    });
  });

  it('should emit logout state', () => {
    // First set user logged in
    userService.emit({
      user: { name: 'John', id: 1 },
      loading: false,
      error: null
    });

    // Logout
    userService.logout();

    // ✅ Verify state reset
    expect(userService.getState()).toEqual({
      user: null,
      loading: false,
      error: null
    });
  });
});

// ✅✅✅ Advantages:
// 1. Don't need to render UI
// 2. Can test all state changes
// 3. Can verify emit call sequence
// 4. Tests run fast
```

#### 2. Test UI Component (UI Test)

```typescript
// __tests__/src/pages/LoginPage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from '@/pages/LoginPage';
import { IOCProvider } from '@/uikit/contexts/IOCContext';

describe('LoginPage (UI Test)', () => {
  it('should show loading when login', async () => {
    // ✅ Mock Service and Store
    const mockStore = {
      user: null,
      loading: false,
      error: null
    };

    const mockUserService = {
      login: vi.fn().mockImplementation(() => {
        // Simulate state change
        mockStore.loading = true;
        return Promise.resolve();
      }),
      subscribe: vi.fn(),
      getState: () => mockStore
    };

    const mockIOC = (identifier: string) => {
      if (identifier === 'UserServiceInterface') return mockUserService;
    };

    // ✅ Render component
    const { rerender } = render(
      <IOCProvider value={mockIOC}>
        <LoginPage />
      </IOCProvider>
    );

    // Click login button
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    // ✅ Verify Service was called
    expect(mockUserService.login).toHaveBeenCalled();

    // Simulate state update
    mockStore.loading = true;
    rerender(
      <IOCProvider value={mockIOC}>
        <LoginPage />
      </IOCProvider>
    );

    // ✅ Verify UI shows loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show error message when login fails', () => {
    const mockStore = {
      user: null,
      loading: false,
      error: new Error('Invalid credentials')
    };

    const mockUserService = {
      login: vi.fn(),
      subscribe: vi.fn(),
      getState: () => mockStore
    };

    const mockIOC = (identifier: string) => {
      if (identifier === 'UserServiceInterface') return mockUserService;
    };

    render(
      <IOCProvider value={mockIOC}>
        <LoginPage />
      </IOCProvider>
    );

    // ✅ Verify error message displayed
    expect(screen.getByText('Error: Invalid credentials')).toBeInTheDocument();
  });
});

// ✅✅✅ Advantages:
// 1. Don't need real Service implementation
// 2. Can easily simulate various states
// 3. UI tests focus on UI logic
```

#### 3. Combination Testing (Integration Test)

```typescript
// __tests__/src/integration/UserLogin.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from '@/pages/LoginPage';
import { UserService } from '@/base/services/UserService';
import { IOCProvider } from '@/uikit/contexts/IOCContext';

describe('User Login Flow (Integration Test)', () => {
  it('should complete login flow', async () => {
    // ✅ Use real Service and Store
    const mockApi = {
      login: vi.fn().mockResolvedValue({
        user: { name: 'John', id: 1 },
        token: 'test-token'
      })
    };

    const userService = new UserService(mockApi, mockConfig, mockStorage);

    const mockIOC = (identifier: string) => {
      if (identifier === 'UserServiceInterface') return userService;
    };

    // ✅ Render real UI
    render(
      <IOCProvider value={mockIOC}>
        <LoginPage />
      </IOCProvider>
    );

    // ✅ Simulate user action
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    // ✅ Verify loading state
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    // ✅ Verify login success
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(userService.getState().user).toEqual({
        name: 'John',
        id: 1
      });
    });

    // ✅ Verify API was called
    expect(mockApi.login).toHaveBeenCalled();
  });
});

// ✅✅✅ Advantages:
// 1. Test real user flow
// 2. Verify Service and UI integration
// 3. Discover integration issues
```

### Testing Strategy Summary

```
┌────────────────────────────────────────┐
│  Testing Pyramid                        │
│                                        │
│      △ UI Tests (10%)                  │
│     ╱ ╲                                │
│    ╱   ╲ Integration Tests (20%)      │
│   ╱     ╲                              │
│  ╱───────╲                             │
│ ╱         ╲ Store + Service Tests (70%)│
│╱═══════════╲                           │
│                                        │
│  Store Tests: Test state change logic  │
│  Integration Tests: Test Service + UI  │
│  UI Tests: Test UI interaction         │
└────────────────────────────────────────┘
```

---

## 💎 Best Practices

### 1. ✅ Service Extends StoreInterface

```typescript
// ✅ Good practice: Service extends StoreInterface
@injectable()
export class UserService extends StoreInterface<UserState> {
  constructor() {
    super(() => ({
      user: null,
      loading: false
    }));
  }

  async login(username: string, password: string) {
    this.emit({ ...this.state, loading: true });
    // ...
  }
}

// ❌ Bad practice: Service doesn't extend StoreInterface
@injectable()
export class UserService {
  private user: UserInfo | null = null;

  // Problem: UI cannot subscribe to state
}
```

### 2. ✅ Use emit to Publish State

```typescript
// ✅ Good practice: Publish state via emit
async login(username: string, password: string) {
  this.emit({ ...this.state, loading: true });

  const response = await this.api.login({ username, password });

  this.emit({
    user: response.user,
    loading: false
  });
}

// ❌ Bad practice: Directly modify state
async login(username: string, password: string) {
  this.state.loading = true;  // ❌ Won't notify subscribers

  const response = await this.api.login({ username, password });

  this.state.user = response.user;  // ❌ Won't notify subscribers
}
```

### 3. ✅ Use cloneState to Simplify Updates

```typescript
// ✅ Good practice: Use cloneState
setUser(user: UserInfo) {
  this.emit(this.cloneState({ user }));
}

setLoading(loading: boolean) {
  this.emit(this.cloneState({ loading }));
}

// ⚠️ Also acceptable: Manual spread
setUser(user: UserInfo) {
  this.emit({ ...this.state, user });
}
```

### 4. ✅ Define Selectors

```typescript
// ✅ Good practice: Define selectors
@injectable()
export class UserService extends StoreInterface<UserState> {
  selector = {
    user: (state: UserState) => state.user,
    loading: (state: UserState) => state.loading,
    isLoggedIn: (state: UserState) => state.user !== null
  };
}

// Usage
const isLoggedIn = useStore(userService, userService.selector.isLoggedIn);

// ❌ Bad practice: Inline selectors
const isLoggedIn = useStore(userService, (state) => state.user !== null);
// Problem: Creates new function every render
```

### 5. ✅ Use Selectors for Performance Optimization

```typescript
// ✅ Good practice: Only subscribe to needed state
function UserName() {
  const userService = useIOC('UserServiceInterface');

  // Only subscribe to user, loading changes won't trigger re-render
  const user = useStore(userService, (state) => state.user);

  return <span>{user?.name}</span>;
}

// ❌ Bad practice: Subscribe to complete state
function UserName() {
  const userService = useIOC('UserServiceInterface');

  // loading changes will also trigger re-render
  const { user, loading } = useStore(userService);

  return <span>{user?.name}</span>;
}
```

### 6. ✅ Keep State Immutable

```typescript
// ✅ Good practice: Create new object
updateUser(changes: Partial<UserInfo>) {
  this.emit({
    ...this.state,
    user: {
      ...this.state.user,
      ...changes
    }
  });
}

// ❌ Bad practice: Directly modify object
updateUser(changes: Partial<UserInfo>) {
  this.state.user.name = changes.name;  // ❌ Direct modification
  this.emit(this.state);  // ❌ Same reference, may not trigger update
}
```

### 7. ✅ Reasonably Divide State

```typescript
// ✅ Good practice: Each Service manages its own state
class UserService extends StoreInterface<UserState> {
  // Only manage user-related state
}

class ThemeService extends StoreInterface<ThemeState> {
  // Only manage theme-related state
}

class I18nService extends StoreInterface<I18nState> {
  // Only manage i18n-related state
}

// ❌ Bad practice: Global large Store
class GlobalStore extends StoreInterface<GlobalState> {
  // Contains all state: user, theme, i18n, etc.
  // Problem: Any state change affects all subscribers
}
```

---

## ❓ FAQ

### Q1: Why not use Redux?

**A:**

| Feature                | Redux                                 | Store (SliceStore)           |
| ---------------------- | ------------------------------------- | ---------------------------- |
| **Complexity**         | ❌ High (Action, Reducer, Middleware) | ✅ Low (emit + subscribe)    |
| **Learning Curve**     | ❌ Steep                              | ✅ Gentle                    |
| **TypeScript Support** | ⚠️ Needs extra config                 | ✅ Native support            |
| **IOC Integration**    | ⚠️ Needs extra work                   | ✅ Natural integration       |
| **Performance**        | ✅ Good                               | ✅ Good                      |
| **Use Case**           | Large applications                    | Small to medium applications |

**Our Choice:**

- Project already uses IOC, don't need Redux's global state management
- Each Service manages its own state, clearer
- SliceStore is simple and powerful enough

### Q2: What's the difference between Store and React Context?

**A:**

| Feature                 | React Context                      | Store                                   |
| ----------------------- | ---------------------------------- | --------------------------------------- |
| **Scope**               | Component tree                     | Global (through IOC)                    |
| **Performance**         | ⚠️ Any value change re-renders all | ✅ Only subscribed value changes render |
| **Selectors**           | ❌ None                            | ✅ Yes                                  |
| **Service Integration** | ⚠️ Need manual                     | ✅ Natural integration                  |

**Recommendation:**

- Use Store to manage application state (Service state)
- Use Context to manage UI state (like modals, temporary form data)

### Q3: How to avoid redundant renders?

**A:** Use selectors

```typescript
// ❌ Problem: Subscribe to complete state
const { user, loading, error } = useStore(userService);
// loading changes will cause component re-render

// ✅ Solution: Only subscribe to needed state
const user = useStore(userService, (state) => state.user);
// Only user changes will cause re-render
```

### Q4: Can I call emit outside Service?

**A:** Not recommended

```typescript
// ❌ Bad practice
function SomeComponent() {
  const userService = useIOC('UserServiceInterface');

  // ❌ Directly call emit
  userService.emit({ user: newUser, loading: false });
}

// ✅ Good practice: Through Service method
function SomeComponent() {
  const userService = useIOC('UserServiceInterface');

  // ✅ Call Service method
  userService.setUser(newUser);
}

// In Service
@injectable()
export class UserService extends StoreInterface<UserState> {
  setUser(user: UserInfo) {
    this.emit(this.cloneState({ user }));
  }
}
```

**Reasons:**

- Maintain encapsulation
- Easier to test
- Business logic centralized in Service

### Q5: Store state update not working?

**A:** Check these points:

```typescript
// ❌ Common mistake 1: Directly modify state
this.state.loading = true;  // Won't trigger update

// ✅ Correct: Use emit
this.emit({ ...this.state, loading: true });

// ❌ Common mistake 2: Not creating new object
const state = this.state;
state.loading = true;
this.emit(state);  // Same reference, may not trigger update

// ✅ Correct: Create new object
this.emit({ ...this.state, loading: true });

// ❌ Common mistake 3: Forgot to subscribe
function MyComponent() {
  const userService = useIOC('UserServiceInterface');
  // Not calling useStore, cannot receive updates

  return <div>{userService.getState().user?.name}</div>;
}

// ✅ Correct: Use useStore to subscribe
function MyComponent() {
  const userService = useIOC('UserServiceInterface');
  const user = useStore(userService, (state) => state.user);

  return <div>{user?.name}</div>;
}
```

### Q6: How to share state between Services?

**A:** Through IOC injection

```typescript
// Service A
@injectable()
export class UserService extends StoreInterface<UserState> {
  // ...
}

// Service B depends on Service A
@injectable()
export class ProfileService {
  constructor(
    @inject('UserServiceInterface')
    private userService: UserService
  ) {}

  async updateProfile(data: ProfileData) {
    // ✅ Access UserService state
    const user = this.userService.getState().user;

    // ✅ Can also subscribe to UserService state
    this.userService.subscribe((state) => {
      console.log('User state changed:', state);
    });
  }
}
```

---

## 📚 Related Documentation

- [Project Architecture Design](./index.md) - Understand overall architecture
- [IOC Container](./ioc.md) - Dependency injection and UI separation
- [Bootstrap Initializer](./bootstrap.md) - Application startup and initialization
- [Testing Guide](./test-guide.md) - Detailed testing strategies

---

## 🎉 Summary

Core value of Store state management:

1. **Solve Communication Problem** 📡 - Application layer notifies UI layer while maintaining separation
2. **Publish-Subscribe Pattern** 🔔 - Service emits, UI uses useStore
3. **Auto-update UI** ⚡ - UI automatically re-renders when state changes
4. **Maintain Decoupling** 🔗 - Service doesn't know which UIs are listening
5. **Easy to Test** 🧪 - Store can be tested independently
6. **Performance Optimization** 🚀 - Selectors only subscribe to needed state
7. **Type Safety** 🔒 - Full TypeScript support

**Remember the core pattern:**

```typescript
// 1. Service extends StoreInterface
class MyService extends StoreInterface<MyState> {
  // 2. Publish state via emit
  doSomething() {
    this.emit({ ...this.state, data: newData });
  }
}

// 3. UI subscribes to state via useStore
function MyComponent() {
  const myService = useIOC('MyServiceInterface');
  const data = useStore(myService, (state) => state.data);

  return <div>{data}</div>;
}
```

**Core Principles:**

- ✅ Service publishes state via emit
- ✅ UI subscribes to state via useStore
- ✅ Use selectors for performance optimization
- ✅ Keep state immutable
- ✅ Each Service manages its own state

---

**Feedback:**  
If you have any questions or suggestions about Store state management, please discuss in the team channel or submit an Issue.
