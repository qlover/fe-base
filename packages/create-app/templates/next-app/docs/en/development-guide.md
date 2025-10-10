# Development Guidelines

## Table of Contents

1. [Project Structure Guidelines](#project-structure-guidelines)
2. [Code Style Guidelines](#code-style-guidelines)
3. [Component Development Guidelines](#component-development-guidelines)
4. [State Management Guidelines](#state-management-guidelines)
5. [Router Development Guidelines](#router-development-guidelines)
6. [Internationalization Guidelines](#internationalization-guidelines)
7. [Theme Style Guidelines](#theme-style-guidelines)
8. [Testing Guidelines](#testing-guidelines)
9. [Documentation Guidelines](#documentation-guidelines)

## Project Structure Guidelines

> 💡 These are just basic guidelines. For complete project structure documentation, please refer to [Project Structure Documentation](./project-structure.md)

### 1. Directory Structure

```
src/
├── base/               # Base functionality implementation
│   ├── cases/         # Business case implementation
│   ├── services/      # Core service implementation
│   └── types/         # Type definitions
├── core/              # Core functionality
│   ├── bootstraps/    # Startup related
│   ├── clientIoc/     # Client IOC implementation
│   ├── serverIoc/     # Server IOC implementation
│   └── globals.ts     # Global variables
├── pages/             # Page components
│   ├── auth/          # Authentication related pages
│   └── base/          # Base pages
├── styles/            # Style files
│   └── css/
│       ├── themes/    # Theme related
│       └── antd-themes/ # Ant Design themes
├── uikit/             # UI component library
│   ├── components/    # Common components
│   ├── contexts/      # React Context
│   ├── hooks/         # Custom Hooks
│   └── providers/     # Provider components
└── App.tsx            # Application entry
```

### 2. Application Bootstrap Process

#### 2.1 Client Bootstrap Process

The client bootstrap process is handled by the `BootstrapClient` class, mainly including the following steps:

1. **Initialize IOC Container**

   ```typescript
   // Create IOC container instance
   const clientIOC = new ClientIOC();
   const ioc = clientIOC.create();
   ```

2. **Register Dependencies**
   - Register global dependencies and services through `ClientIOCRegister`
   - Mainly includes three types of registration:

     ```typescript
     // 1. Register global dependencies
     registerGlobals(ioc: IOCContainerInterface) {
       ioc.bind(I.JSONSerializer, JSON);
       ioc.bind(I.Logger, logger);
       ioc.bind(I.AppConfig, appConfig);
       ioc.bind(I.DialogHandler, dialogHandler);
     }

     // 2. Register core service implementations
     registerImplement(ioc: IOCContainerInterface) {
       ioc.bind(I.I18nServiceInterface, new I18nService());
       ioc.bind(I.RouterServiceInterface, ioc.get(RouterService));
       ioc.bind(I.UserServiceInterface, ioc.get(UserService));
     }

     // 3. Register common services and plugins
     registerCommon(ioc: IOCContainerInterface) {
       // Register request plugins, Mock plugins, etc.
     }
     ```

3. **Start Application**

   ```typescript
   export class BootstrapClient {
     static async main(args: BootstrapAppArgs) {
       const bootstrap = new Bootstrap({
         root,
         logger,
         ioc: { manager: IOC },
         globalOptions: { sources: globals }
       });

       // Initialize bootstrapper
       await bootstrap.initialize();

       // Register bootstrap plugins
       const bootstrapsRegistry = new BootstrapsRegistry(args);
       await bootstrap.use(bootstrapsRegistry.register()).start();
     }
   }
   ```

4. **Bootstrap Plugin Registration**
   ```typescript
   class BootstrapsRegistry {
     register(): BootstrapExecutorPlugin[] {
       return [
         i18nService, // Internationalization service
         new AppUserApiBootstrap(), // User API
         printBootstrap, // Development environment printing
         IocIdentifierTest // IOC identifier test
       ];
     }
   }
   ```

#### 2.2 Server Bootstrap Process

The server bootstrap process is handled by the `BootstrapServer` class, mainly including the following steps:

1. **Initialize IOC Container**

   ```typescript
   export class ServerIOC {
     static create(): ServerIOC {
       if (this.instance) return this.instance;
       this.instance = new ServerIOC();
       return this.instance;
     }

     create() {
       this.ioc = createIOCFunction<IOCIdentifierMapServer>(
         new InversifyContainer()
       );
       const register = new ServerIOCRegister({
         appConfig: new AppConfig()
       });
       register.register(this.ioc.implemention!, this.ioc);
       return this.ioc;
     }
   }
   ```

2. **Register Server Dependencies**
   - Register server-specific dependencies through `ServerIOCRegister`:

     ```typescript
     class ServerIOCRegister {
       // 1. Register global dependencies
       registerGlobals(ioc: IOCContainerInterface) {
         ioc.bind(I.AppConfig, appConfig);
         ioc.bind(
           I.Logger,
           new Logger({
             handlers: new ConsoleHandler(new TimestampFormatter()),
             level: appConfig.env === 'development' ? 'debug' : 'info'
           })
         );
       }

       // 2. Register server implementations
       registerImplement(ioc: IOCContainerInterface) {
         ioc.bind(I.DBBridgeInterface, ioc.get(SupabaseBridge));
       }
     }
     ```

3. **Server Startup**

   ```typescript
   export class BootstrapServer implements ServerInterface {
     constructor() {
       const serverIOC = ServerIOC.create();
       const ioc = serverIOC.create();
       const logger = ioc(I.Logger);

       this.executor = new AsyncExecutor();
       this.IOC = ioc;
       this.logger = logger;
     }

     // Register server plugins
     use(plugin: BootstrapExecutorPlugin): this {
       this.executor.use(plugin);
       return this;
     }

     // Execute startup tasks
     execNoError(task?: PromiseTask) {
       const context = {
         logger: this.logger,
         root: this.root,
         ioc: this.IOC.implemention!,
         IOC: this.IOC
       };
       return this.executor.execNoError(context, task);
     }
   }
   ```

### 3. IOC Container Usage

#### 3.1 Get Service Instance

```typescript
// Use in components
function UserProfile() {
  const userService = IOC(UserService);
  const i18nService = IOC(I.I18nServiceInterface);

  // Use services...
}
```

#### 3.2 Register New Service

```typescript
// 1. Define service interface
interface MyServiceInterface {
  doSomething(): void;
}

// 2. Add IOC identifier
export const IOCIdentifier = {
  MyService: Symbol('MyService')
} as const;

// 3. Implement service
@injectable()
class MyService implements MyServiceInterface {
  doSomething() {
    // Implementation...
  }
}

// 4. Register in IOC registrar
class ClientIOCRegister {
  registerImplement(ioc: IOCContainerInterface) {
    ioc.bind(I.MyService, ioc.get(MyService));
  }
}
```

### 2. Naming Conventions

- **File Naming**:
  - Component files: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
  - Utility files: `camelCase.ts` (e.g., `formatDate.ts`)
  - Type files: `PascalCase.types.ts` (e.g., `User.types.ts`)
  - Style files: `camelCase.css` (e.g., `buttonStyles.css`)

- **Directory Naming**:
  - All lowercase, using hyphens (e.g., `user-profile/`)
  - Feature modules use singular form (e.g., `auth/`, not `auths/`)

## Code Style Guidelines

> 💡 These are just basic guidelines. For more TypeScript and React development guidelines, please refer to [TypeScript Development Guidelines](./typescript-guide.md)

### 1. TypeScript Guidelines

```typescript
// Use interface for object types
interface UserProfile {
  id: string;
  name: string;
  age?: number; // Optional properties use ?
}

// Use type for union types or utility types
type Theme = 'light' | 'dark' | 'pink';
type Nullable<T> = T | null;

// Use enum for constant enumerations
enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

// Function type declarations
function processUser(user: UserProfile): void {
  // Implementation
}

// Use meaningful names for generics
interface Repository<TEntity> {
  find(id: string): Promise<TEntity>;
}
```

### 2. React Guidelines

```tsx
// Use FC type for function components
interface Props {
  name: string;
  age: number;
}

const UserCard: FC<Props> = ({ name, age }) => {
  return (
    <div>
      <h3>{name}</h3>
      <p>{age}</p>
    </div>
  );
};

// Hooks guidelines
const useUser = (userId: string) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Implementation
  }, [userId]);

  return { user, loading };
};
```

## Component Development Guidelines

> 💡 These are just basic guidelines. For complete component development guide, please refer to [Component Development Guide](./component-guide.md)

### 1. Component Categories

- **Page Components**: Located in `pages/` directory
- **Business Components**: Located in corresponding business module directory
- **Common Components**: Located in `uikit/components/` directory
- **Layout Components**: Located in `uikit/layouts/` directory

### 2. Component Implementation

```tsx
// 1. Import order
import { FC, useEffect, useState } from 'react'; // React related
import { useTranslation } from 'react-i18next'; // Third-party libraries
import { UserService } from '@/services/user'; // Internal project imports
import { Button } from './Button'; // Relative path imports

// 2. Type definitions
interface Props {
  userId: string;
  onUpdate?: (user: User) => void;
}

// 3. Component implementation
export const UserProfile: FC<Props> = ({ userId, onUpdate }) => {
  // 3.1 Hooks declarations
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);

  // 3.2 Side effects
  useEffect(() => {
    // Implementation
  }, [userId]);

  // 3.3 Event handlers
  const handleUpdate = () => {
    // Implementation
  };

  // 3.4 Render methods
  const renderHeader = () => {
    return <h2>{user?.name}</h2>;
  };

  // 3.5 Return JSX
  return (
    <div>
      {renderHeader()}
      <Button onClick={handleUpdate}>{t('common.update')}</Button>
    </div>
  );
};
```

## State Management Guidelines

> 💡 These are just basic guidelines. For complete state management guide, please refer to [Store Development Guide](./store.md)

### 1. Store Implementation

```typescript
// 1. State interface definition
interface UserState extends StoreStateInterface {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

// 2. Store implementation
@injectable()
export class UserStore extends StoreInterface<UserState> {
  constructor() {
    super(() => ({
      currentUser: null,
      loading: false,
      error: null
    }));
  }

  // 3. Selector definitions
  selector = {
    currentUser: (state: UserState) => state.currentUser,
    loading: (state: UserState) => state.loading
  };

  // 4. Operation methods
  async fetchUser(id: string) {
    try {
      this.emit({ ...this.state, loading: true });
      const user = await api.getUser(id);
      this.emit({ ...this.state, currentUser: user, loading: false });
    } catch (error) {
      this.emit({
        ...this.state,
        error: error.message,
        loading: false
      });
    }
  }
}
```

### 2. Store Usage

```tsx
function UserProfile() {
  const userStore = IOC(UserStore);
  const user = useStore(userStore, userStore.selector.currentUser);
  const loading = useStore(userStore, userStore.selector.loading);

  return <div>{loading ? <Loading /> : <UserInfo user={user} />}</div>;
}
```

## Router Development Guidelines

> 💡 These are just basic guidelines. For complete router development guide, please refer to [Router Development Guide](./router.md)

### 1. Basic Guidelines

- Router configuration centrally managed in `config/app.router.ts`
- Use declarative router configuration
- Router components placed in `pages` directory
- Support route-level code splitting
- Router configuration includes metadata support

### 2. Example

```typescript
// Router configuration example
export const baseRoutes: RouteConfigValue[] = [
  {
    path: '/:lng',
    element: 'base/Layout',
    meta: {
      category: 'main'
    },
    children: [
      {
        path: 'users',
        element: 'users/UserList',
        meta: {
          title: i18nKeys.PAGE_USERS_TITLE,
          auth: true
        }
      }
    ]
  }
];
```

For more router configuration and usage examples, please refer to [Router Development Guide](./router.md).

## Internationalization Guidelines

> 💡 These are just basic guidelines. For complete internationalization guide, please refer to [Internationalization Guide](./i18n.md)

### 1. Basic Guidelines

- Use identifier constants for translation keys
- Generate translation resources through TypeScript comments
- Support multi-language routing
- Centrally manage translation files

### 2. Example

```typescript
/**
 * @description User list page title
 * @localZh 用户列表
 * @localEn User List
 */
export const PAGE_USERS_TITLE = 'page.users.title';
```

For more internationalization configuration and usage examples, please refer to [Internationalization Guide](./i18n.md).

## Theme Style Guidelines

> 💡 These are just basic guidelines. For complete theme development guide, please refer to [Theme Development Guide](./theme.md)

### 1. Basic Guidelines

- Use CSS variables for theme management
- Follow Tailwind CSS usage guidelines
- Modularize component styles
- Support multi-theme switching

### 2. Example

```css
:root {
  --color-brand: 37 99 235;
  --text-primary: 15 23 42;
}
```

For more theme configuration and usage examples, please refer to [Theme Development Guide](./theme.md).

## Testing Guidelines

> 💡 These are just basic guidelines. For complete testing guide, please refer to [Testing Guide](./testing.md)

### 1. Basic Guidelines

- Unit tests cover core logic
- Component tests focus on interaction and rendering
- Use Jest and Testing Library
- Keep tests simple and maintainable

### 2. Example

```typescript
describe('UserProfile', () => {
  it('should render user info', () => {
    const user = { id: '1', name: 'Test' };
    render(<UserProfile user={user} />);
    expect(screen.getByText(user.name)).toBeInTheDocument();
  });
});
```

For more testing examples and best practices, please refer to [Testing Guide](./testing.md).

## Documentation Guidelines

> 💡 These are just basic guidelines. For complete documentation writing guide, please refer to [Documentation Writing Guide](./documentation.md)

### 1. Code Comments

```typescript
/**
 * User Service
 *
 * @description Handles user-related business logic
 * @example
 * const userService = IOC(UserService);
 * await userService.login(credentials);
 */
@injectable()
export class UserService {
  /**
   * User login
   *
   * @param credentials - Login credentials
   * @returns Logged in user information
   * @throws {AuthError} Thrown when authentication fails
   */
  async login(credentials: Credentials): Promise<User> {
    // Implementation
  }
}
```

### 2. Documentation Structure

- **README.md**: Project overview, installation instructions, quick start
- **docs/**:
  - `zh/`: Chinese documentation
  - `en/`: English documentation
  - Organize documentation files by functional modules

### 3. Documentation Format

```markdown
# Module Name

## Overview

Brief explanation of module functionality and purpose.

## Usage

Code examples and usage instructions.

## API Documentation

Detailed API descriptions.

## Best Practices

Usage suggestions and considerations.
```

## Git Commit Guidelines

> 💡 These are just basic guidelines. For complete Git workflow, please refer to [Git Workflow Guide](./git-workflow.md)

### 1. Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **type**:
  - `feat`: New feature
  - `fix`: Bug fix
  - `docs`: Documentation updates
  - `style`: Code formatting (changes that do not affect code execution)
  - `refactor`: Code refactoring
  - `test`: Adding tests
  - `chore`: Build process or auxiliary tool changes

- **scope**: Impact scope (optional)
- **subject**: Brief description
- **body**: Detailed description (optional)
- **footer**: Breaking changes, issue closure (optional)

### 2. Example

```
feat(auth): add user role management functionality

- Add role creation and editing interface
- Implement role permission configuration
- Add role assignment functionality

Closes #123
```

## Performance Optimization Guidelines

> 💡 These are just basic guidelines. For complete performance optimization guide, please refer to [Performance Optimization Guide](./performance.md)

### 1. Code Splitting

```typescript
// Route-level code splitting
const UserModule = lazy(() => import('./pages/users'));

// Component-level code splitting
const HeavyComponent = lazy(() => import('./components/Heavy'));
```

### 2. Performance Considerations

```typescript
// Use useMemo to cache computation results
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name));
}, [users]);

// Use useCallback to cache functions
const handleUpdate = useCallback(() => {
  // Implementation
}, [dependencies]);

// Use React.memo to avoid unnecessary re-renders
const UserCard = React.memo(({ user }) => {
  return <div>{user.name}</div>;
});
```

## Security Guidelines

> 💡 These are just basic guidelines. For complete security development guide, please refer to [Security Development Guide](./security.md)

### 1. Data Handling

```typescript
// Sensitive data encryption
const encryptedData = encrypt(sensitiveData);

// XSS protection
const sanitizedHtml = sanitizeHtml(userInput);

// CSRF protection
api.defaults.headers['X-CSRF-Token'] = getCsrfToken();
```

### 2. Access Control

```typescript
// Route permissions
const PrivateRoute: FC = ({ children }) => {
  const auth = useAuth();
  return auth.isAuthenticated ? children : <Navigate to="/login" />;
};

// Operation permissions
function AdminPanel() {
  const { hasPermission } = useAuth();

  return (
    <div>
      {hasPermission('ADMIN') && (
        <button>Admin Operation</button>
      )}
    </div>
  );
}
```
