# Development Guidelines

## Table of Contents

1. [Project Structure Standards](#project-structure-standards)
2. [Code Style Standards](#code-style-standards)
3. [Component Development Standards](#component-development-standards)
4. [State Management Standards](#state-management-standards)
5. [Router Development Standards](#router-development-standards)
6. [Internationalization Development Standards](#internationalization-development-standards)
7. [Theme Style Standards](#theme-style-standards)
8. [Testing Standards](#testing-standards)
9. [Documentation Standards](#documentation-standards)

## Project Structure Standards

> 💡 Only basic standards are listed here. For complete project structure documentation, please refer to [Project Structure Documentation](./project-structure.md)

### 1. Directory Structure

```
src/
├── base/               # Base functionality implementation
│   ├── cases/         # Business scenario implementations
│   ├── services/      # Core service implementations
│   └── types/         # Type definitions
├── core/              # Core functionality
│   ├── bootstraps/    # Startup related
│   ├── registers/     # Registries
│   └── IOC.ts         # IOC container
├── pages/             # Page components
│   ├── auth/          # Authentication related pages
│   └── base/          # Base pages
├── styles/            # Style files
│   └── css/
│       ├── themes/    # Theme related
│       └── antd-themes/ # Ant Design themes
├── uikit/             # UI component library
│   ├── components/    # Common components
│   ├── contexts/      # React Contexts
│   ├── hooks/         # Custom Hooks
│   └── providers/     # Provider components
└── App.tsx            # Application entry
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

## Code Style Standards

> 💡 Only basic standards are listed here. For more TypeScript and React development standards, please refer to [TypeScript Development Standards](./typescript-guide.md)

### 1. TypeScript Standards

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

### 2. React Standards

```tsx
// Function components use FC type
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

// Hooks standards
const useUser = (userId: string) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Implementation
  }, [userId]);

  return { user, loading };
};
```

## Component Development Standards

> 💡 Only basic standards are listed here. For complete component development guide, please refer to [Component Development Guide](./component-guide.md)

### 1. Component Categories

- **Page Components**: Located in `pages/` directory
- **Business Components**: Located in corresponding business module directories
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

## State Management Standards

> 💡 Only basic standards are listed here. For complete state management guide, please refer to [Store Development Guide](./store.md)

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

## Router Development Standards

> 💡 Only basic standards are listed here. For complete router development guide, please refer to [Router Development Guide](./router.md)

### 1. Basic Standards

- Route configurations are centrally managed in `config/app.router.ts`
- Use declarative route configuration
- Route components are placed in the `pages` directory
- Support route-level code splitting
- Route configurations include metadata support

### 2. Example

```typescript
// Route configuration example
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

For more route configuration and usage examples, please refer to [Router Development Guide](./router.md).

## Internationalization Development Standards

> 💡 Only basic standards are listed here. For complete internationalization development guide, please refer to [Internationalization Development Guide](./i18n.md)

### 1. Basic Standards

- Use identifier constants to manage translation keys
- Generate translation resources through TypeScript comments
- Support multi-language routes
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

For more internationalization configuration and usage examples, please refer to [Internationalization Development Guide](./i18n.md).

## Theme Style Standards

> 💡 Only basic standards are listed here. For complete theme development guide, please refer to [Theme Development Guide](./theme.md)

### 1. Basic Standards

- Use CSS variables to manage themes
- Follow Tailwind CSS usage standards
- Modularize component styles
- Support multiple theme switching

### 2. Example

```css
:root {
  --color-brand: 37 99 235;
  --text-primary: 15 23 42;
}
```

For more theme configuration and usage examples, please refer to [Theme Development Guide](./theme.md).

## Testing Standards

> 💡 Only basic standards are listed here. For complete testing guide, please refer to [Testing Development Guide](./testing.md)

### 1. Basic Standards

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

For more testing examples and best practices, please refer to [Testing Development Guide](./testing.md).

## Documentation Standards

> 💡 Only basic standards are listed here. For complete documentation writing guide, please refer to [Documentation Writing Guide](./documentation.md)

### 1. Code Comments

```typescript
/**
 * User service
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
   * @returns Logged-in user information
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
  - Organize documentation files by feature modules

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

## Git Commit Standards

> 💡 Only basic standards are listed here. For complete Git workflow, please refer to [Git Workflow Guide](./git-workflow.md)

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
  - `style`: Code formatting (changes that don't affect code execution)
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

## Performance Optimization Standards

> 💡 Only basic standards are listed here. For complete performance optimization guide, please refer to [Performance Optimization Guide](./performance.md)

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

## Security Standards

> 💡 Only basic standards are listed here. For complete security development guide, please refer to [Security Development Guide](./security.md)

### 1. Data Handling

```typescript
// Sensitive data encryption
const encryptedData = encrypt(sensitiveData);

// XSS protection
const sanitizedHtml = sanitizeHtml(userInput);

// CSRF protection
api.defaults.headers['X-CSRF-Token'] = getCsrfToken();
```

### 2. Permission Control

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
