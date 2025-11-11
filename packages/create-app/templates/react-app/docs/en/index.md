# Project Architecture Design

> **📖 This document is the entry point of the project, providing an architecture overview, core concepts, and complete documentation navigation.**

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Architecture Overview](#-architecture-overview)
- [Layered Architecture](#-layered-architecture)
- [Complete Workflow](#-complete-workflow)
- [Core Concepts](#-core-concepts)
- [Quick Example](#-quick-example)
- [Detailed Documentation Navigation](#-detailed-documentation-navigation)

---

## 🚀 Quick Start

### New Developers

If this is your first time with this project, we recommend the following order:

1. **Read this document** - Understand overall architecture and core philosophy (10-15 minutes)
2. **[IOC Container](./ioc.md)** - Understand UI and logic separation (10-15 minutes)
3. **[Store State Management](./store.md)** - Understand how application layer notifies UI layer (10-15 minutes)
4. **[Development Guide](./development-guide.md)** - Follow complete example to develop a page (20-30 minutes)

### Experienced Developers

If you already have relevant experience, you can directly:

1. Quickly browse this document to understand architecture features
2. Check [Development Guide](./development-guide.md) to understand development workflow
3. Refer to specialized documentation as needed

### Environment Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Start staging environment
pnpm dev:staging

# Build production version
pnpm build

# Run tests
pnpm test
```

---

## 🎯 Architecture Overview

This project adopts **Layered Architecture + Dependency Injection + Interface-Oriented Programming** design pattern.

### Architecture Panorama

```
┌─────────────────────────────────────────────────────┐
│  Config Layer                                        │
│  • Unified management of all configurations         │
│    (routes, themes, i18n, IOC, etc.)                │
│  • Environment variable injection target            │
│    (AppConfig.ts)                                   │
│  📄 See: env.md                                      │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Entry Layer                                         │
│  • main.tsx: Application startup                     │
│  • Inject global dependencies (window, document)     │
│  • Initialize IOC container                          │
│  • Execute Bootstrap startup process                 │
│  📄 See: bootstrap.md                                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Core Layer                                          │
│  • globals.ts: Encapsulate browser APIs              │
│  • clientIoc/: IOC container management              │
│  • bootstraps/: Bootstrap startup process            │
│  📄 See: why-no-globals.md                           │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Business Layer                                      │
│  • port/: Interface definitions                      │
│  • services/: Service implementations                │
│  • cases/: Business use cases                        │
│  • apis/: External API adapters                      │
│  📄 See: ioc.md                                      │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  UI Layer                                            │
│  • pages/: Page components                           │
│  • components/: UI components                        │
│  • hooks/: React Hooks (useIOC, useStore, etc.)      │
│  • bridges/: Page bridges                            │
│  📄 See: store.md                                    │
└─────────────────────────────────────────────────────┘
```

### Core Principles

1. **Unidirectional Dependency** ↓ - Can only depend from top to bottom, not reverse
2. **Depend on Interfaces, Not Implementations** 🔌 - All dependencies defined through interfaces
3. **UI and Logic Separation** 🎨 - UI is UI, logic is logic
4. **Single Responsibility** 📦 - Each module does one thing
5. **Configuration-Driven** ⚙️ - Business logic driven by configuration

---

## 🏗️ Layered Architecture

### 1. Config Layer

**Location:** `config/`, `src/base/cases/AppConfig.ts`

**Responsibilities:**

- Unified management of all configurations (routes, themes, i18n, IOC identifiers, etc.)
- Serve as injection target for environment variables

**File Structure:**

```
config/
├── common.ts              # Common configuration
├── theme.ts               # Theme configuration
├── app.router.ts          # Route configuration
├── IOCIdentifier.ts       # IOC identifiers
├── i18n/                  # Internationalization config
└── Identifier/            # Business identifiers
```

**👉 See:** [Environment Variable Management](./env.md)

### 2. Entry Layer

**Location:** `src/main.tsx`, `src/core/bootstraps/`

**Responsibilities:**

- Application startup
- Inject global dependencies (browser APIs)
- Create IOC container
- Execute Bootstrap startup process

**Key Characteristics:**

- 🔴 **Only place allowed to directly access global variables**
- 🔴 **Bootstrap executes all initialization before app renders**

**👉 See:** [Bootstrap Initializer](./bootstrap.md)

### 3. Core Layer

**Location:** `src/core/`

**Responsibilities:**

- Encapsulate browser APIs (localStorage, cookie, etc.)
- Manage global instances (logger, dialog, etc.)
- IOC container initialization and service registration
- Bootstrap flow control

**File Structure:**

```
core/
├── globals.ts              # Global variable encapsulation
├── IOC.ts                  # IOC utilities
├── bootstraps/             # Startup process
│   ├── BootstrapClient.ts
│   └── BootstrapsRegistry.ts
└── clientIoc/              # IOC container
    ├── ClientIOC.ts
    └── ClientIOCRegister.ts
```

**👉 See:** [Why Disable Global Variables](./why-no-globals.md)

### 4. Business Layer

**Location:** `src/base/`

**Responsibilities:**

- Define business interfaces (Port)
- Implement business services (Services)
- Handle business logic (Cases)
- Adapt external APIs (APIs)

**File Structure:**

```
base/
├── port/                   # Interface definitions
│   ├── UserServiceInterface.ts
│   └── I18nServiceInterface.ts
├── services/               # Service implementations
│   ├── UserService.ts
│   └── I18nService.ts
├── cases/                  # Business use cases
│   ├── AppConfig.ts
│   └── AppError.ts
└── apis/                   # API adapters
    └── userApi/
        ├── UserApi.ts
        └── UserApiType.ts
```

**Key Characteristics:**

- 🔵 **Interface-Oriented** - All dependencies injected through interfaces
- 🔵 **Single Responsibility** - Each service responsible for one domain
- 🔵 **Testability** - Easy to mock and test

**👉 See:** [IOC Container](./ioc.md)

### 5. UI Layer

**Location:** `src/pages/`, `src/uikit/`

**Responsibilities:**

- Render pages and components
- Handle user interactions
- Get services through `useIOC`
- Subscribe to state through `useStore`

**File Structure:**

```
├── pages/                  # Page components
│   ├── base/
│   └── auth/
└── uikit/                  # UI utilities
    ├── components/         # Common components
    ├── hooks/              # React Hooks
    │   ├── useIOC.ts       # IOC Hook
    │   └── useStore.ts     # Store Hook
    ├── contexts/           # React Context
    └── bridges/            # Page bridges
```

**Key Characteristics:**

- 🟢 **Don't depend on implementations directly** - Get services through IOC
- 🟢 **UI and logic separated** - Only handle rendering and interaction
- 🟢 **Reactive updates** - Automatic updates through Store

**👉 See:** [Store State Management](./store.md)

---

## 🔄 Complete Workflow

### Data Flow Diagram

```
┌─────────────────────────────────────────────┐
│  1. User Interaction (UI Layer)             │
│  const userService = useIOC('UserService')  │
│  userService.login(username, password)      │
└──────────────────┬──────────────────────────┘
                   ↓ (Call service through IOC)
┌─────────────────────────────────────────────┐
│  2. Service Layer Processing (Business)      │
│  async login(username, password) {          │
│    const response = await this.api.login()  │
│    this.storage.setItem('token', ...)       │
│    this.emit({ user: ... })  // Notify UI   │
│  }                                          │
└──────────────┬─────────────┬────────────────┘
               ↓             ↓ (Call API)
      (Use Storage)    ┌─────────────────────┐
               ↓         │  3. API Layer        │
    ┌──────────────┐    │  POST /api/login    │
    │ Core/Globals │    └─────────────────────┘
    │ localStorage │              ↓
    └──────────────┘         (HTTP request)
               ↓                 ↓
    (Data persistence)      (Backend server)
               ↓                 ↓
               └────←── Return data ←┘
                         ↓
               (emit publishes new state)
                         ↓
          ┌─────────────────────────┐
          │  4. Store notifies        │
          │     subscribers           │
          │  listeners.forEach(...)   │
          └─────────────────────────┘
                         ↓
          ┌─────────────────────────┐
          │  5. UI auto-updates       │
          │  useStore receives        │
          │  notification             │
          │  Component re-renders     │
          └─────────────────────────┘
```

### Application Startup Flow

```
1️⃣ main.tsx
   ↓
2️⃣ BootstrapClient.main()
   ├── Create IOC container
   ├── Register all services
   ├── Execute Bootstrap plugins
   │   ├── InjectEnv (Inject env vars to AppConfig)
   │   ├── I18nService.onBefore() (Initialize i18n)
   │   ├── UserService.onBefore() (Check user login)
   │   └── ProcesserExecutor.startup() (Start processors)
   └── Bootstrap complete
       ↓
3️⃣ React application renders
   ├── App.tsx
   ├── IOCContext.Provider (Provide IOC container)
   └── AppRouterProvider (Routing)
       ↓
4️⃣ Page components render
   ├── useIOC() get services
   ├── useStore() subscribe to state
   └── UI renders
```

---

## 💡 Core Concepts

### 1. IOC Container (Dependency Injection) ⭐

**Core Philosophy:** UI is UI, logic is logic, they must be separated

```typescript
// ❌ Traditional approach: UI and logic mixed together
function UserProfile() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch('/api/user').then(res => res.json()).then(setUser);
  }, []);
  return <div>{user?.name}</div>;
}

// ✅ IOC approach: UI and logic completely separated
function UserProfile() {
  const userService = useIOC('UserServiceInterface');  // Get service
  const { user } = useStore(userService);               // Subscribe to state
  return <div>{user?.name}</div>;
}
```

**Key Questions:**

1. **Why does an implementation class also need an interface?** → For testability
2. **Why separate even simple components?** → Simple now doesn't mean simple later

**👉 See:** [IOC Container Detailed Documentation](./ioc.md)

### 2. Store State Management (Application Layer Notifies UI Layer) ⭐

**Core Philosophy:** Service publishes state through Store, UI subscribes to state through useStore

```typescript
// Service (Application Layer)
@injectable()
export class UserService extends StoreInterface<UserState> {
  async login(username: string, password: string) {
    this.emit({ loading: true });  // Publish: start loading
    const response = await this.api.login({ username, password });
    this.emit({ user: response.user, loading: false });  // Publish: complete
  }
}

// UI (UI Layer)
function LoginPage() {
  const userService = useIOC('UserServiceInterface');
  const { loading } = useStore(userService);  // Subscribe: auto-update

  return (
    <button onClick={() => userService.login('user', 'pass')} disabled={loading}>
      {loading ? 'Logging in...' : 'Login'}
    </button>
  );
}
```

**👉 See:** [Store State Management Detailed Documentation](./store.md)

### 3. Bootstrap Initializer (Application Initialization) ⭐

**Core Philosophy:** Execute all initialization logic before app renders

```typescript
// Bootstrap plugin
export class I18nService implements BootstrapPlugin {
  onBefore() {
    // Initialize i18n before app starts
    i18n.init({
      /* ... */
    });
  }
}

// Bootstrap execution
const bootstrap = new Bootstrap({
  root: window,
  ioc: clientIOC
});

await bootstrap.initialize(); // Execute all plugins' onBefore
await bootstrap.start(); // Start application
```

**👉 See:** [Bootstrap Initializer Detailed Documentation](./bootstrap.md)

### 4. Environment Variable Management (Multi-Environment Configuration) ⭐

**Core Philosophy:** Use `vite --mode` to switch environments, inject to AppConfig through Bootstrap

```bash
# Different environments
npm run dev           # Development environment (.env.localhost)
npm run dev:staging   # Staging environment (.env.staging)
npm run build         # Production environment (.env.production)
```

```typescript
// AppConfig automatically injects environment variables
export class AppConfig {
  readonly env: string;
  readonly apiBaseUrl = ''; // Auto-injected from VITE_API_BASE_URL
  readonly appName = ''; // Auto-injected from VITE_APP_NAME
}

// Usage
const config = useIOC(IOCIdentifier.AppConfig);
console.log(config.apiBaseUrl); // Automatically switches based on environment
```

**👉 See:** [Environment Variable Management Detailed Documentation](./env.md)

### 5. Internationalization (i18n Key) ⭐

**Core Philosophy:** All text uses i18n Keys, never hard-code

```typescript
// ❌ Wrong: Hard-coded text
<button>Login</button>

// ✅ Correct: Use i18n Key
import { BUTTON_LOGIN } from '@config/Identifier';
<button>{t(BUTTON_LOGIN)}</button>
```

**Core Advantage:** Developers don't need to remember `'common:button.login'` string, just need to know `BUTTON_LOGIN` variable, IDE will auto-complete

**👉 See:** [Internationalization Detailed Documentation](./i18n.md)

---

## 📝 Quick Example

### Example: Create a Theme Switching Feature

```typescript
// 1️⃣ Define interface (base/port/ThemeServiceInterface.ts)
export interface ThemeServiceInterface {
  setTheme(theme: 'light' | 'dark'): void;
  getTheme(): 'light' | 'dark';
}

// 2️⃣ Implement service (base/services/ThemeService.ts)
@injectable()
export class ThemeService extends StoreInterface<ThemeState> {
  constructor(
    @inject(IOCIdentifier.LocalStorage) private storage: Storage
  ) {
    super(() => ({ theme: 'light' }));
  }

  setTheme(theme: 'light' | 'dark') {
    this.storage.setItem('theme', theme);
    this.emit({ theme });  // Notify UI to update
  }

  getTheme() {
    return this.state.theme;
  }
}

// 3️⃣ Register to IOC (core/clientIoc/ClientIOCRegister.ts)
register(ioc: IOCContainer) {
  ioc.bind(IOCIdentifier.ThemeServiceInterface, ThemeService);
}

// 4️⃣ UI usage (components/ThemeSwitcher.tsx)
function ThemeSwitcher() {
  const themeService = useIOC('ThemeServiceInterface');
  const { theme } = useStore(themeService);

  return (
    <button onClick={() => themeService.setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
```

**For complete development workflow see:** [Development Guide](./development-guide.md)

---

## 📚 Detailed Documentation Navigation

### Core Documentation ⭐

#### 1. [Development Guide](./development-guide.md)

**Target Audience:** Developers preparing to develop new features  
**Reading Time:** 20-30 minutes

**Content Overview:**

- What's needed to develop a page (8-item checklist)
- Complete 10-step development process
- Practical example: User list page (complete code)
- Common scenarios (add button, dialog, search, etc.)
- Code standards and development tools

**Core Value:** Step-by-step guide to develop a complete page

#### 2. [IOC Container](./ioc.md)

**Core Questions:** How to separate UI and logic? Why need interfaces?

**Key Content:**

- Why need IOC (UI and logic separation)
- Two key questions:
  1. Why does an implementation class also need an interface? (Testability)
  2. Why separate even simple components? (Future extensibility)
- How to test logic and UI independently
- How to test in combination
- Complete practical examples

**Applicable Scenarios:**

- Need to create new services
- Need to understand dependency injection
- Need to write testable code

#### 3. [Store State Management](./store.md)

**Core Question:** How does application layer (Service) notify UI layer to update?

**Key Content:**

- Why need Store (solve communication problem)
- Service publishes state through `emit`
- UI subscribes to state through `useStore`
- Selectors and performance optimization
- Independent testing and combination testing

**Applicable Scenarios:**

- Service needs to notify UI to update
- Need to implement reactive UI
- Need to optimize rendering performance

#### 4. [Bootstrap Initializer](./bootstrap.md)

**Core Question:** How does application initialize? Why need Bootstrap?

**Key Content:**

- What is Bootstrap (plugin system)
- Why need Bootstrap (problem-driven)
- Core advantages of Bootstrap (especially testing)
- Complete project implementation and examples
- Vitest testing guide

**Applicable Scenarios:**

- Need to execute initialization logic before app starts
- Need to understand application startup flow
- Need to add new startup plugins

#### 5. [Environment Variable Management](./env.md)

**Core Question:** How to manage multi-environment configuration?

**Key Content:**

- Use `vite --mode` to switch environments
- `.env` file management and priority
- AppConfig automatic injection mechanism
- Bootstrap's InjectEnv plugin
- Multi-environment configuration examples

**Applicable Scenarios:**

- Need to add new environment variables
- Need to switch between dev/staging/production environments
- Need to understand configuration injection mechanism

#### 6. [Internationalization (i18n)](./i18n.md)

**Core Question:** How to manage multi-language text?

**Key Content:**

- **Core Principle:** All text uses i18n Keys, never hard-code
- **Core Advantage:** Reduce developer thinking (don't need to remember strings, just variable names)
- Auto-generate translation files (ts2Locales)
- I18nService Bootstrap plugin
- Complete usage examples

**Applicable Scenarios:**

- Need to add new text
- Need to support new languages
- Need to understand i18n Key concept

### Supporting Documentation

#### [Why Disable Global Variables](./why-no-globals.md)

**Core Question:** Why can't we directly use `window`, `document`, etc.?

**Key Content:**

- Core philosophy: Global variables should be injected from entry point
- Allowed locations: `main.tsx`, `core/globals.ts`
- Why do this (testing, SSR, traceability)
- Practical application scenarios (IOC container)
- Test-friendliness comparison

#### [Route Management](./router.md)

**Core Content:**

- Route configuration file (`config/app.router.ts`)
- Route metadata (title, requiresAuth, etc.)
- Dynamic route loading
- RouteService usage

#### [Theme System](./theme.md)

**Core Content:**

- Tailwind CSS configuration
- CSS variable management
- Theme switching implementation
- ThemeService usage

#### [Request Handling](./request.md)

**Core Content:**

- API adapter pattern
- Request plugin system
- Error handling
- Mock data

#### [Testing Guide](./test-guide.md)

**Core Content:**

- Vitest testing framework
- Service testing (logic layer)
- UI testing (component layer)
- Integration testing (workflow)
- Testing best practices

#### [Playwright E2E Testing](./playwright/) 🎭

**Core Content:**

- Complete E2E testing documentation
- Multi-browser testing (Chromium, Firefox, WebKit, Mobile)
- Page Object Model architecture
- Test writing guide and best practices
- Debugging techniques and CI/CD integration
- See [Playwright Documentation Hub](./playwright/)
- Quick reference: [Playwright Overview](./playwright/overview.md)

#### [TypeScript Guide](./typescript-guide.md)

**Core Content:**

- TypeScript type standards
- Generic usage
- Type inference
- Common issues

---

## 🎯 Quick Lookup

### I want to...

**Develop a new page** → [Development Guide](./development-guide.md)

**Understand UI and logic separation** → [IOC Container](./ioc.md)

**Let Service notify UI to update** → [Store State Management](./store.md)

**Add environment variables** → [Environment Variable Management](./env.md)

**Add multi-language text** → [Internationalization](./i18n.md)

**Execute initialization before app starts** → [Bootstrap Initializer](./bootstrap.md)

**Encapsulate browser APIs** → [Why Disable Global Variables](./why-no-globals.md)

**Add routes** → [Route Management](./router.md)

**Switch themes** → [Theme System](./theme.md)

**Call APIs** → [Request Handling](./request.md)

**Write unit tests** → [Testing Guide](./test-guide.md)

**Write E2E tests** → [Playwright E2E Testing](./playwright/README.md)

**Solve TypeScript issues** → [TypeScript Guide](./typescript-guide.md)

---

## 🎯 Core Philosophy Summary

| Philosophy                    | Description                               | Benefits                         |
| ----------------------------- | ----------------------------------------- | -------------------------------- |
| **Layered Architecture**      | Clear responsibility division             | Easy to understand and maintain  |
| **Unidirectional Dependency** | Can only depend from top to bottom        | Avoid circular dependencies      |
| **Interface-Oriented**        | Depend on interfaces, not implementations | Easy to test and replace         |
| **Dependency Injection**      | IOC container manages dependencies        | Decoupling, testable             |
| **UI Separation**             | UI is UI, logic is logic                  | Independent testing, reusable    |
| **State Management**          | Service emits, UI uses useStore           | Auto-update, maintain separation |
| **Single Responsibility**     | Each module does one thing                | Easy to reuse and maintain       |
| **Configuration-Driven**      | Business driven by configuration          | Flexible, easy to extend         |

---

## 🚦 Development Workflow

```
1. Define i18n Key (config/Identifier/)
   ↓
2. Define interface (base/port/)
   ↓
3. Implement service (base/services/)
   ↓
4. Implement API (if needed) (base/apis/)
   ↓
5. Configure routes (config/app.router.ts)
   ↓
6. Implement page (pages/)
   ├── useIOC() get services
   └── useStore() subscribe to state
   ↓
7. Register IOC (if new service) (core/clientIoc/)
   ↓
8. Write tests (__tests__/)
   ├── Service tests (logic)
   ├── UI tests (rendering)
   └── Integration tests (workflow)
```

---

## 💡 Development Recommendations

### New Developers

1. Understand architecture first - Read this document
2. Learn IOC - Read [IOC Container Documentation](./ioc.md)
3. Learn Store - Read [Store Documentation](./store.md)
4. See example code - Refer to existing `UserService`, `I18nService`, etc.
5. Hands-on practice - Create a simple feature

### Experienced Developers

- **Bootstrap mechanism** → [Bootstrap Documentation](./bootstrap.md)
- **Environment variable management** → [Environment Variable Documentation](./env.md)
- **Internationalization implementation** → [i18n Documentation](./i18n.md)
- **Global variable standards** → [why-no-globals Documentation](./why-no-globals.md)

---

**Feedback:**  
If you have any questions or suggestions about the architecture design, please discuss in the team channel or submit an Issue.
