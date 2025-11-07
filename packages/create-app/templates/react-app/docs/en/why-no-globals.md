# Why Prohibit Direct Use of Browser Global Variables?

## 📋 Table of Contents

- [Core Philosophy](#-core-philosophy)
- [Prohibited Global Variables](#-prohibited-global-variables)
- [Allowed Locations](#-allowed-locations)
- [Why Do This](#-why-do-this)
- [Practical Application Scenarios](#-practical-application-scenarios)
- [Best Practices](#-best-practices)
- [FAQ](#-faq)

---

## 🎯 Core Philosophy

In our project, we prohibit direct use of browser global variables (like `window`, `document`, `localStorage`, etc.) in business code. Instead, they must be **injected through the application entry point or encapsulation layer**.

### Simply Put:

```typescript
// ❌ Not allowed: Direct use in business components
function MyComponent() {
  const width = window.innerWidth; // ESLint error!
  return <div>Width: {width}</div>;
}

// ✅ Recommended: Import from encapsulation layer
import { localStorage } from '@/core/globals';

function MyComponent() {
  const token = localStorage.getItem('token'); // Correct!
  return <div>Token: {token}</div>;
}
```

---

## 🚫 Prohibited Global Variables

The following global variables are prohibited from direct use in `src/**/*.{ts,tsx,js,jsx}`:

- `window` - Browser window object
- `document` - DOM document object
- `localStorage` - Local storage
- `sessionStorage` - Session storage
- `navigator` - Browser information
- `location` - URL information
- `history` - Browser history

---

## ✅ Allowed Locations

### 1. **Application Entry** (`src/main.tsx`)

This is the only place allowed to directly access the browser environment, as it's the application's starting point:

```typescript
// !only this file use `window`, `document` ...global variables
import 'reflect-metadata';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { BootstrapClient } from './core/bootstraps/BootstrapClient';
import { clientIOC } from './core/clientIoc/ClientIOC.ts';

BootstrapClient.main({
  root: window,                    // ✅ Direct use of window
  bootHref: window.location.href,  // ✅ Direct use of location
  ioc: clientIOC
});

createRoot(document.getElementById('root')!).render(  // ✅ Direct use of document
  <StrictMode>
    <App />
  </StrictMode>
);
```

**Why?** Because `main.tsx` is responsible for injecting the browser environment into the application - it's the starting point of "dependency injection".

### 2. **Global Variable Encapsulation Layer** (`src/core/globals.ts`)

This is where global variables are uniformly encapsulated and managed:

```typescript
/**
 * Override localStorage to use the global local storage
 */
export const localStorage = new SyncStorage(new ObjectStorage(), [
  JSON,
  new Base64Serializer(),
  window.localStorage as unknown as SyncStorageInterface<string> // ✅ Encapsulate localStorage
]);

export const localStorageEncrypt = localStorage;

export const cookieStorage = new CookieStorage();
```

**Why?** This is the encapsulation layer, responsible for wrapping raw browser APIs into unified, type-safe interfaces.

### 3. **Special Infrastructure Layer**

Some infrastructure code (like IOC container initialization) may need to access global variables, but should:

#### ⚠️ Case A: Not recommended but acceptable

Direct use in `ClientIOC.ts`:

```typescript
const register = new ClientIOCRegister({
  pathname: window.location.pathname, // ⚠️ Special case, acceptable
  appConfig: appConfig
});
```

**Note:** IOC container initialization needs `pathname`, this is acceptable but not best practice.

#### ✅ Case B: Better approach (recommended)

Pass through `main.tsx`:

```typescript
// main.tsx
BootstrapClient.main({
  root: window,
  bootHref: window.location.href,  // Get at entry
  pathname: window.location.pathname,  // Pass via parameter
  ioc: clientIOC
});

// ClientIOC.ts
create(pathname: string) {  // Receive parameter instead of direct access
  const register = new ClientIOCRegister({
    pathname: pathname,  // ✅ Use passed parameter
    appConfig: appConfig
  });
}
```

---

## 🤔 Why Do This?

### 1. **Test-Friendly** 🧪

Direct use of global variables makes testing **extremely difficult or impossible**.

#### ❌ Problem Example: Hard-to-test Component

```typescript
// UserProfile.tsx - Direct use of global variables
function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Direct use of fetch
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        // Direct use of localStorage
        localStorage.setItem('lastUser', data.id);
        setUser(data);
      });
  }, []);

  return <div>{user?.name}</div>;
}

// ❌ Test code - Almost impossible to test
describe('UserProfile', () => {
  it('should load and display user', async () => {
    // Problem 1: How to mock fetch? Need polyfill or global mock
    global.fetch = jest.fn();

    // Problem 2: How to mock localStorage? Need manual implementation
    const mockLocalStorage = {
      setItem: jest.fn()
    };
    global.localStorage = mockLocalStorage as any;

    // Problem 3: Need to clean up global state, otherwise affects other tests
    // Problem 4: Tests may interfere with each other

    render(<UserProfile />);
    // Hard to verify behavior...
  });
});
```

**Problems:**

- 😰 Need to mock global variables (fetch, localStorage)
- 😰 Tests may interfere with each other
- 😰 Hard to test error scenarios
- 😰 Test code full of tricks and hacks
- 😰 May not run at all in Node.js environment

#### ✅ Solution 1: Import from encapsulation layer

```typescript
// UserProfile.tsx - Import from encapsulation layer
import { localStorage } from '@/core/globals';

function getUser() {
  return fetch('/api/user').then((res) => res.json());
}

// ✅ Test code - Easier to test
jest.mock('@/core/globals', () => ({
  localStorage: {
    setItem: jest.fn()
  }
}));

describe('UserProfile', () => {
  it('should save user to localStorage', () => {
    // Relatively easy to mock, but still need to handle fetch
  });
});
```

#### ⭐ Solution 2: Use IOC Container (Best)

```typescript
// UserProfile.tsx - Use IOC container
import { useIoc } from '@/uikit/hooks/useIoc';

function UserProfile() {
  const userService = useIoc('UserService');
  const [user, setUser] = useState(null);

  useEffect(() => {
    userService.getCurrentUser().then(setUser);
  }, []);

  return <div>{user?.name}</div>;
}

// ✅✅ Test code - Very easy!
import { render, screen, waitFor } from '@testing-library/react';
import { IocProvider } from '@/contexts/IocContext';

describe('UserProfile', () => {
  it('should load and display user', async () => {
    // ✅ Only need to mock service, no need to mock global variables
    const mockUserService = {
      getCurrentUser: jest.fn().mockResolvedValue({
        id: '1',
        name: 'John Doe'
      })
    };

    const mockIoc = (serviceName: string) => {
      if (serviceName === 'UserService') return mockUserService;
    };

    render(
      <IocProvider value={mockIoc}>
        <UserProfile />
      </IocProvider>
    );

    // ✅ Clear assertions
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // ✅ Verify service call
    expect(mockUserService.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('should handle error', async () => {
    // ✅ Easy to test error scenarios
    const mockUserService = {
      getCurrentUser: jest.fn().mockRejectedValue(new Error('Network error'))
    };

    // Test error handling...
  });

  it('should handle loading state', () => {
    // ✅ Easy to test loading state
    const mockUserService = {
      getCurrentUser: jest.fn().mockReturnValue(new Promise(() => {})) // Never resolves
    };

    // Test loading state...
  });
});
```

#### Comparison Summary

| Test Scenario         | Direct Global Variables | Encapsulation Layer | IOC Container |
| --------------------- | ----------------------- | ------------------- | ------------- |
| Mock Complexity       | 😰😰😰 Very hard        | 😐 Medium           | 😊😊😊 Simple |
| Test Isolation        | ❌ Poor                 | ⚠️ Fair             | ✅ Good       |
| Test Error Scenarios  | ❌ Difficult            | ⚠️ Possible         | ✅ Easy       |
| Test Code Readability | ❌ Poor                 | ⚠️ Fair             | ✅ Good       |
| Run in Node.js        | ❌ Difficult            | ✅ Yes              | ✅ Yes        |

**Key Advantages:**

- ✅ **Simple mocking**: Only need to mock one service object, no need to mock global environment
- ✅ **Test isolation**: Each test has independent mocks, no interference
- ✅ **Easy error testing**: Easily simulate various error scenarios (network errors, timeout, permission errors, etc.)
- ✅ **Fast execution**: Don't need real browser environment, tests run faster
- ✅ **Clear code**: Test code is simple and intuitive, easy to maintain

### 2. **SSR/Multi-environment Compatibility** 🌐

If your application needs to support server-side rendering (like Next.js), direct use of global variables will cause errors:

```typescript
// ❌ Will error in SSR
function MyComponent() {
  const width = window.innerWidth;  // ReferenceError: window is not defined
  return <div>{width}</div>;
}

// ✅ Safe approach
import { getWindow } from '@/core/globals';

function MyComponent() {
  const win = getWindow();  // Encapsulation layer can handle SSR cases
  const width = win ? win.innerWidth : 0;
  return <div>{width}</div>;
}
```

### 3. **Type Safety and Error Handling** 🛡️

Encapsulation layer can provide better types and error handling:

```typescript
// src/core/globals.ts
export const localStorage = new SyncStorage(/* ... */); // Has complete type definitions

// Business code
import { localStorage } from '@/core/globals';

// ✅ Has complete type hints and error handling
localStorage.setItem('key', value); // TypeScript will check types
```

### 4. **Code Traceability** 🔍

With ESLint rules, we can:

- **See at a glance** which code depends on browser environment
- **Easily find** all places using browser APIs (search `from '@/core/globals'`)
- **Convenient refactoring** - uniformly modify all browser API calls

```typescript
// Want to know where localStorage is used?
// Search: import { localStorage } from '@/core/globals'
// Instead of searching "localStorage" in the entire project (will have many false positives)
```

### 5. **Unified Degradation and Polyfill** 🔄

Can handle compatibility and degradation uniformly in encapsulation layer:

```typescript
// src/core/globals.ts
export const localStorage = (() => {
  try {
    const storage = window.localStorage;
    // Test if available
    storage.setItem('__test__', '1');
    storage.removeItem('__test__');
    return storage;
  } catch {
    // Degrade to memory storage (like privacy mode)
    console.warn('localStorage unavailable, using memory storage');
    return new MemoryStorage();
  }
})();
```

### 6. **Prevent Accidental Coupling** 🚫

Forces developers to think:

- Does this code really need to depend on browser environment?
- Can it be written as a pure function?
- Can it be passed through parameters instead of direct access?

```typescript
// ❌ Tightly coupled to browser environment
function isDesktop() {
  return window.innerWidth > 768;
}

// ✅ Decoupled: Pass through parameters
function isDesktop(width: number) {
  return width > 768;
}

// Pass at call site
const desktop = isDesktop(window.innerWidth);
```

---

## 💡 Practical Application Scenarios

### Scenario 1: Need to operate localStorage

```typescript
// ❌ Wrong approach: Direct use of browser API
function saveToken(token: string) {
  localStorage.setItem('token', token); // ESLint error!
}

// ✅ Correct approach 1: Import encapsulated storage from globals
import { localStorage } from '@/core/globals';

function saveToken(token: string) {
  localStorage.setItem('token', token); // Use encapsulated localStorage
}

// ✅ Correct approach 2: Get service through IOC container (recommended)
import { useIoc } from '@/uikit/hooks/useIoc';

function useAuth() {
  const authService = useIoc('AuthService'); // Get service from IOC container

  const saveToken = (token: string) => {
    authService.setToken(token); // Service internally encapsulates storage operations
  };

  return { saveToken };
}

// Use in component
function LoginComponent() {
  const { saveToken } = useAuth();

  const handleLogin = async () => {
    const token = await login();
    saveToken(token); // Don't need to care if underlying uses localStorage or other storage
  };
}
```

**Why is IOC approach better?**

- Service layer already encapsulates all storage logic
- Business code doesn't need to care about storage implementation details
- Easy to switch storage methods (localStorage → IndexedDB → server)
- Service can contain more business logic (encryption, validation, expiration handling, etc.)

### Scenario 2: Need to get current path

```typescript
// ❌ Wrong approach: Direct access in component
function MyComponent() {
  const path = window.location.pathname; // ESLint error!
  // ...
}

// ✅ Correct approach 1: Use React Router
import { useLocation } from 'react-router-dom';

function MyComponent() {
  const location = useLocation();
  const path = location.pathname; // Through Router-provided hook
  // ...
}

// ✅ Correct approach 2: Get router service through IOC container
import { useIoc } from '@/uikit/hooks/useIoc';

function MyComponent() {
  const routerService = useIoc('RouterService'); // Get router service from IOC
  const path = routerService.getCurrentPath(); // Get path through service

  // Router service can also provide more features
  const navigate = (path: string) => {
    routerService.navigate(path); // Unified routing navigation
  };
}
```

### Scenario 3: Need to make HTTP request

```typescript
// ❌ Wrong approach: Direct use of fetch
async function getUserInfo(id: string) {
  const response = await fetch(`/api/users/${id}`); // Direct use of global fetch
  return response.json();
}

// ✅ Correct approach: Get HTTP service through IOC container
import { useIoc } from '@/uikit/hooks/useIoc';

function useUserService() {
  const httpService = useIoc('HttpService'); // Get HTTP service from IOC

  const getUserInfo = async (id: string) => {
    // HTTP service already encapsulates:
    // - Unified error handling
    // - Request interceptors (add token)
    // - Response interceptors (handle error codes)
    // - Request cancellation
    // - Timeout control
    return httpService.get(`/users/${id}`);
  };

  return { getUserInfo };
}

// Use in component
function UserProfile({ userId }: { userId: string }) {
  const { getUserInfo } = useUserService();
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUserInfo(userId).then(setUser);
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

### Scenario 4: Need internationalization translation

```typescript
// ❌ Wrong approach: Direct dependency on global i18n instance
import i18n from 'i18next';

function MyComponent() {
  const text = i18n.t('common.welcome'); // Direct dependency on global instance
  return <div>{text}</div>;
}

// ✅ Correct approach: Get I18n service through IOC container
import { useIoc } from '@/uikit/hooks/useIoc';

function MyComponent() {
  const i18nService = useIoc('I18nService'); // Get service from IOC
  const text = i18nService.t('common.welcome'); // Translate through service

  // I18n service provides more features
  const changeLanguage = (lang: string) => {
    i18nService.changeLanguage(lang);
  };

  return (
    <div>
      {text}
      <button onClick={() => changeLanguage('en')}>English</button>
    </div>
  );
}
```

### Scenario 5: Need to get window width

```typescript
// ❌ Wrong approach
function useWindowSize() {
  const [size, setSize] = useState(window.innerWidth); // ESLint error!
  // ...
}

// ✅ Correct approach 1: Import from globals
import { window } from '@/core/globals';

function useWindowSize() {
  const [size, setSize] = useState(window?.innerWidth || 0);
  // ...
}

// ✅ Correct approach 2: Get Window service through IOC container (best)
import { useIoc } from '@/uikit/hooks/useIoc';

function useWindowSize() {
  const windowService = useIoc('WindowService');
  const [size, setSize] = useState(windowService.getWidth());

  useEffect(() => {
    const unsubscribe = windowService.onResize((newSize) => {
      setSize(newSize.width);
    });

    return unsubscribe; // Service internally manages event listeners
  }, []);

  return size;
}
```

---

## 📖 Best Practices

### 1. **Prioritize Using IOC Container to Get Services (Recommended)** ⭐

```typescript
// ✅ Best practice: Get services through IOC container
import { useIoc } from '@/uikit/hooks/useIoc';

function MyComponent() {
  const authService = useIoc('AuthService');
  const i18nService = useIoc('I18nService');
  const httpService = useIoc('HttpService');

  // Business logic...
}
```

**Why?**

- Services already encapsulate all underlying dependencies (including global variables)
- Easy to test (can mock entire service)
- Business code doesn't need to care about implementation details
- Unified dependency management

### 2. **Inject Dependencies at Application Entry**

```typescript
// main.tsx
BootstrapClient.main({
  root: window,
  bootHref: window.location.href,
  ioc: clientIOC,
  // Other needed browser information
  initialWindowSize: {
    width: window.innerWidth,
    height: window.innerHeight
  }
});
```

### 3. **Prioritize Using React Ecosystem Solutions**

- Use `react-router-dom` instead of directly accessing `location`
- Use CSS media queries or `useMediaQuery` instead of reading `window.innerWidth`
- Use React's event system instead of `document.addEventListener`

### 4. **Second Choice: Access Through Encapsulation Layer**

If there's no corresponding service, can import from `@/core/globals`:

```typescript
// src/core/globals.ts
export const getDocument = () => {
  if (typeof document === 'undefined') {
    throw new Error('document is not available in SSR');
  }
  return document;
};

// Business code
import { getDocument } from '@/core/globals';

const doc = getDocument();
const element = doc.getElementById('root');
```

### 5. **Document Special Cases**

If an infrastructure layer must directly access global variables, add comments explaining why:

```typescript
// ClientIOC.ts
create() {
  // Note: Direct use of window.location.pathname here
  // Reason: Needed for IOC container initialization, and executes after main.tsx, browser environment guaranteed
  // TODO: Consider passing through BootstrapClient to avoid direct access
  const pathname = window.location.pathname;
  // ...
}
```

### 6. **Recommended Solution Priority**

```
1️⃣ Use IOC container services     (useIoc('XxxService'))        ⭐ Best
2️⃣ Use React ecosystem solutions  (useLocation, useMediaQuery)  👍 Recommended
3️⃣ Import from globals            (import { xxx } from '@/core/globals') ✅ Acceptable
4️⃣ Direct access to global vars   (window.xxx)                   ❌ Prohibited
```

---

## ❓ FAQ

### Q1: My code is simple, why so much trouble?

**A:** Architectural standards aren't for "now", but for:

- Possible future SSR requirements
- Easier to write unit tests
- Consistency in team collaboration
- Code maintainability and traceability

### Q2: What if I really need to directly use global variables in a file?

**A:** Add exception in `eslint.config.mjs`:

```javascript
{
  files: [
    'src/main.tsx',
    'src/core/globals.ts',
    'src/utils/dom-helper.ts'  // Add your file
  ],
  rules: {
    'no-restricted-globals': 'off'
  }
}
```

But consider carefully and add comments explaining why.

### Q3: What's the difference between `@/core/globals` and direct `window.xxx`?

**A:** Main differences:

1. **Type safety**: Encapsulation layer provides complete TypeScript types
2. **Error handling**: Encapsulation layer can handle SSR, privacy mode, etc.
3. **Unified management**: All browser API access in one place, easy to track and modify
4. **Testability**: Can easily mock entire `@/core/globals` module

### Q4: Why can `ClientIOC` directly use `window.location.pathname`?

**A:** This is a **tradeoff**:

- **Acceptable**: Because `ClientIOC` is infrastructure layer and executes after `main.tsx`, browser environment is guaranteed
- **Better approach**: Pass `pathname` parameter through `BootstrapClient.main()`
- **Future improvement**: Plan to refactor to dependency injection approach

---

## 🎯 Summary

### Locations Allowed to Use Global Variables

| Location                          | Allowed         | Description                                                       |
| --------------------------------- | --------------- | ----------------------------------------------------------------- |
| `src/main.tsx`                    | ✅ Yes          | Application entry, responsible for injecting dependencies         |
| `src/core/globals.ts`             | ✅ Yes          | Encapsulation layer, uniformly manages global variables           |
| `src/core/clientIoc/ClientIOC.ts` | ⚠️ Special case | Infrastructure layer, recommended to change to injection approach |
| Other business code               | ❌ Prohibited   | Must access through encapsulation layer or dependency injection   |

### How Business Code Accesses Browser APIs

```typescript
// Priority from high to low

// 🥇 Method 1: Get service through IOC container (most recommended)
const authService = useIoc('AuthService');
authService.setToken(token); // Service internally handles storage

// 🥈 Method 2: Use React ecosystem solutions
const location = useLocation(); // react-router-dom
const path = location.pathname;

// 🥉 Method 3: Import encapsulation from globals
import { localStorage } from '@/core/globals';
localStorage.setItem('key', value);

// ❌ Method 4: Direct access (prohibited!)
window.localStorage.setItem('key', value); // ESLint error
```

### Remember Three Principles:

1. **Inject at entry** - `main.tsx` is the only place to directly access browser environment
2. **Encapsulate in encapsulation layer** - `core/globals.ts` or service layer provides unified interface
3. **Use in business layer** - Prioritize getting services through IOC container, second choice import from encapsulation layer

### Why Do This?

✅ **Easy to test** - Can easily mock services or encapsulation layer  
✅ **SSR compatible** - Encapsulation layer can handle server-side rendering scenarios  
✅ **Type safety** - Complete TypeScript type support  
✅ **Easy to trace** - Unified dependency management, easy to find and refactor  
✅ **Degradation handling** - Uniformly handle browser compatibility and degradation strategies  
✅ **Decouple business** - Business code doesn't depend on specific implementations

---

**Related Documentation:**

- [ESLint Configuration](../../eslint.config.mjs)
- [Dependency Injection Pattern](./dependency-injection.md)
- [Project Architecture Design](./index.md)

**Need Help?**
If you're unsure how to handle a certain scenario, please ask in the team channel or submit an Issue.
