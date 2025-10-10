# Detailed Project Structure

## Directory Structure Overview

```
next-app/
├── config/           # Global configuration files
├── src/             # Source code directory
│   ├── app/         # Next.js app router
│   ├── base/        # Client core code
│   ├── core/        # Core bootstrap and IOC configuration
│   ├── server/      # Server-side code
│   ├── styles/      # Style files
│   └── uikit/       # UI component library
└── public/          # Static assets
```

## Detailed Structure Explanation

### 1. Client Architecture (src/base)

#### 1.1 Interface Layer (src/base/port)

- `AdminLayoutInterface.ts` - Admin layout interface
- `AdminPageInterface.ts` - Admin page interface
- `AppApiInterface.ts` - Application API interface
- `AppUserApiInterface.ts` - User API interface
- `AsyncStateInterface.ts` - Asynchronous state interface
- `I18nServiceInterface.ts` - Internationalization service interface
- `IOCInterface.ts` - Dependency injection interface
- `RouterInterface.ts` - Router interface
- `UserServiceInterface.ts` - User service interface

#### 1.2 Business Logic Layer (src/base/cases)

- State management controllers
- Dialog handling
- Router service
- User service
- Encryption service

#### 1.3 Service Implementation Layer (src/base/services)

- `AdminUserService.ts` - Admin user service
- `I18nService.ts` - Internationalization service
- `UserService.ts` - User service
- `adminApi/` - Admin API implementation
- `appApi/` - Application API implementation

### 2. Server Architecture (src/server)

#### 2.1 Interface Layer (src/server/port)

- `CrentialTokenInterface.ts` - Credential token interface
- `DBBridgeInterface.ts` - Database bridge interface
- `DBTableInterface.ts` - Database table interface
- `PaginationInterface.ts` - Pagination interface
- `ParamsHandlerInterface.ts` - Parameter handling interface
- `ServerAuthInterface.ts` - Server authentication interface
- `ServerInterface.ts` - Server interface
- `UserRepositoryInterface.ts` - User repository interface
- `ValidatorInterface.ts` - Validator interface

#### 2.2 Core Implementation

- `AppErrorApi.ts` - API error handling
- `AppSuccessApi.ts` - API success response
- `ServerAuth.ts` - Server authentication implementation
- `UserCredentialToken.ts` - User credential token

#### 2.3 Service Layer (src/server/services)

- `AdminAuthPlugin.ts` - Admin authentication plugin
- `AIService.ts` - AI service
- `ApiUserService.ts` - API user service
- `UserService.ts` - User service

#### 2.4 Data Access Layer

- `repositorys/UserRepository.ts` - User data repository
- `sqlBridges/SupabaseBridge.ts` - Supabase database bridge

#### 2.5 Validators (src/server/validators)

- `LoginValidator.ts` - Login validation
- `PaginationValidator.ts` - Pagination validation

### 3. API Route Structure (src/app/api)

```
api/
├── admin/           # Admin endpoints
│   └── users/       # User management
├── ai/             # AI-related endpoints
│   └── completions/ # AI completions
└── user/           # User endpoints
    ├── login/      # Login
    ├── logout/     # Logout
    └── register/   # Registration
```

### 4. Page Route Structure (src/app/[locale])

```
[locale]/
├── admin/          # Admin pages
│   └── users/      # User management
├── login/          # Login page
├── register/       # Registration page
└── page.tsx        # Homepage
```

### 5. UI Component Library (src/uikit)

#### 5.1 Components (components)

- `AdminLayout.tsx` - Admin layout
- `BaseHeader.tsx` - Base header
- `BaseLayout.tsx` - Base layout
- `ChatRoot.tsx` - Chat root component
- `LanguageSwitcher.tsx` - Language switcher
- `ThemeSwitcher.tsx` - Theme switcher
- Other common components

#### 5.2 Hooks and Context

- `useI18nInterface.ts` - Internationalization hook
- `useIOC.ts` - IOC container hook
- `useStore.ts` - State management hook
- `IOCContext.ts` - IOC context

## Technical Features

1. **Dependency Injection Pattern**
   - Using IOC container for dependency management
   - Separate IOC containers for client and server
   - Decoupling through interfaces

2. **Layered Architecture**
   - Clear interface definitions
   - Well-defined implementation layers
   - Loosely coupled module design

3. **State Management**
   - Controller-based state management
   - Reactive data flow
   - Predictable state changes

4. **Internationalization Support**
   - Multi-language support based on next-intl
   - Dynamic language switching
   - Route-level language isolation

5. **Theme System**
   - Based on Tailwind CSS
   - Dark mode support
   - Configurable theme variables

## Development Workflow

1. **API Development**
   - Define interface (port)
   - Implement validator (validators)
   - Implement service (services)
   - Create API route (api)

2. **Page Development**
   - Create page component
   - Implement controller
   - Register dependencies
   - Add route

3. **Component Development**
   - Create UI component
   - Implement business logic
   - Inject dependencies
   - Add styles
