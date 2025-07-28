# Project Structure Documentation

## Directory Structure

```
src/
├── base/               # Base functionality implementation
│   ├── apis/          # API interface definitions and implementations
│   │   └── userApi/   # User-related APIs
│   ├── cases/         # Business scenario implementations
│   │   ├── AppConfig.ts           # Application configuration
│   │   ├── RouterLoader.ts        # Router loader
│   │   └── I18nKeyErrorPlugin.ts  # Internationalization error handling
│   ├── services/      # Core service implementations
│   │   ├── UserService.ts         # User service
│   │   ├── RouteService.ts        # Route service
│   │   └── I18nService.ts         # Internationalization service
│   └── types/         # Type definitions
├── core/              # Core functionality
│   ├── bootstraps/    # Startup related
│   │   └── BootstrapApp.ts        # Application bootstrapper
│   ├── registers/     # Registries
│   │   ├── RegisterCommon.ts      # Common service registration
│   │   └── RegisterGlobals.ts     # Global variable registration
│   └── IOC.ts         # IOC container
├── pages/             # Page components
│   ├── auth/          # Authentication related pages
│   │   ├── LoginPage.tsx          # Login page
│   │   └── RegisterPage.tsx       # Registration page
│   └── base/          # Base pages
│       ├── HomePage.tsx           # Home page
│       └── ErrorPage.tsx         # Error page
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

## Implemented Features

### 1. User Authentication System

#### Login Functionality

- Supports email and password login
- Remember login state
- Login state persistence
- Login error handling
- Supports third-party login (interface reserved)

```typescript
// Login service example
class UserService extends UserAuthService<UserInfo> {
  async login(credentials: LoginFormData) {
    // Login implementation
  }

  async logout() {
    // Logout implementation
  }
}
```

#### Registration Functionality

- User registration form
- Form validation
- Password strength check
- Terms of service agreement
- Registration success redirect

```typescript
// Registration functionality example
async register(params: RegisterFormData) {
  const response = await this.api.register(params);
  // Handle registration logic
}
```

### 2. Routing System

#### Features

- Configuration-based routing
- Route-level code splitting
- Route guards
- Route meta information
- Multi-language route support

```typescript
// Route configuration example
export const baseRoutes: RouteConfigValue[] = [
  {
    path: '/:lng',
    element: 'base/Layout',
    meta: {
      category: 'main'
    },
    children: [...]
  }
];
```

### 3. Internationalization System

#### Features

- Supports Chinese and English switching
- Route-level language switching
- Translation generation based on TypeScript comments
- Dynamic language pack loading
- Complete type support

### 4. Theme System

#### Features

- Supports multiple theme switching
- CSS variable driven
- Tailwind CSS integration
- Ant Design theme customization
- Responsive design

### 5. State Management

#### Features

- Store-based state management
- Reactive data flow
- State persistence
- State slicing
- Complete type support

### 6. UI Component Library

#### Implemented Components

- Layout Components
  - BaseLayout: Basic layout
  - AuthLayout: Authentication page layout
- Common Components
  - ThemeSwitcher: Theme switcher
  - LanguageSwitcher: Language switcher
  - Loading: Loading state
- Form Components
  - LoginForm: Login form
  - RegisterForm: Registration form

### 7. Tool Integration

#### Development Tools

- TypeScript support
- ESLint configuration
- Prettier formatting
- Jest testing framework
- Vite build tool

#### Auxiliary Functions

- Automatic route generation
- API request encapsulation
- Error handling
- Logging system
- Cache management

### 8. Security Features

#### Implemented

- CSRF protection
- XSS protection
- Request encryption
- Data masking
- Permission control

## Extension Points

### 1. Authentication System Extensions

- Add more third-party logins
- Implement phone number login
- Add two-factor authentication
- Implement password reset

### 2. UI Component Extensions

- Add more business components
- Extend theme system
- Add animation effects
- Optimize mobile adaptation

### 3. Feature Extensions

- Add file upload
- Implement real-time communication
- Add data visualization
- Implement offline support

## Project Dependencies

### Core Dependencies

#### React Related

- **react** (^18.3.1)
  - Core framework
  - Uses latest React 18 features
  - Supports concurrent mode and Suspense

- **react-dom** (^18.3.1)
  - React DOM renderer
  - For Web platform rendering

- **react-router-dom** (^7.1.5)
  - Route management
  - Uses latest data router features
  - Supports nested routes and route guards

#### State Management

- **@qlover/slice-store-react** (^1.0.8)
  - State management solution
  - Based on publish-subscribe pattern
  - Supports state slicing and reactive updates

- **@qlover/corekit-bridge**
  - Core functionality bridge layer
  - Provides state management and UI connection
  - Implements dependency injection and service management

#### UI Framework

- **antd** (^5.25.3)
  - UI component library
  - Uses v5 version
  - Supports theme customization and CSS-in-JS

- **@brain-toolkit/antd-theme-override** (^0.0.3)
  - Ant Design theme override tool
  - Implements dynamic theme variable switching
  - Supports custom theme configuration

#### Style Tools

- **tailwindcss** (^4.1.8)
  - Atomic CSS framework
  - For quickly building responsive interfaces
  - Integrates with theme system

- **clsx** (^2.1.1)
  - Class name management tool
  - For conditional class name concatenation
  - Provides type-safe API

#### Internationalization

- **i18next** (^24.2.0)
  - Internationalization framework
  - Supports dynamic language switching
  - Provides complete translation management

- **i18next-browser-languagedetector** (^8.0.2)
  - Browser language detection
  - Automatically detects user language preferences
  - Supports multiple detection strategies

- **i18next-http-backend** (^3.0.1)
  - Translation resource loader
  - Supports dynamic loading of translation files
  - Implements on-demand loading

#### Dependency Injection

- **inversify** (^7.1.0)
  - IoC container implementation
  - For dependency injection
  - Provides service management and registration

- **reflect-metadata** (^0.2.2)
  - Metadata reflection support
  - For decorator implementation
  - Supports dependency injection type information

### Development Dependencies

#### Build Tools

- **vite** (^6.3.5)
  - Modern build tool
  - Provides fast development server
  - Supports ESM and resource optimization

- **@vitejs/plugin-react** (^4.4.1)
  - React plugin
  - Provides React-specific optimizations
  - Supports Fast Refresh

#### Type Support

- **typescript** (^5.6.3)
  - JavaScript superset
  - Provides type checking
  - Enhances development experience

#### Code Quality

- **eslint** (^9.15.0)
  - Code checking tool
  - Ensures code quality
  - Supports custom rules

- **prettier** (^3.5.3)
  - Code formatting tool
  - Unifies code style
  - Integrates with ESLint

#### Testing Tools

- **vitest** (^3.0.5)
  - Unit testing framework
  - Deeply integrates with Vite
  - Provides fast test execution

### Custom Tool Packages

#### Logging System

- **@qlover/logger** (^0.1.1)
  - Unified log management
  - Supports different log levels
  - Provides formatted output

#### Environment Configuration

- **@qlover/env-loader**
  - Environment variable loading
  - Supports multi-environment configuration
  - Type-safe configuration access

#### Development Tools

- **@qlover/fe-scripts**
  - Development script collection
  - Provides common development commands
  - Simplifies development process

#### Code Standards

- **@qlover/fe-standard** (^0.0.4)
  - Unified code standards
  - ESLint rule set
  - TypeScript configuration

## Dependency Version Management

### Version Update Strategy

- Core dependencies: Careful updates, requires complete testing
- UI framework: Follow official LTS versions
- Tool dependencies: Regular updates to latest versions
- Custom packages: Use latest tag to track newest versions

### Dependency Check

```bash
# Check outdated dependencies
npm outdated

# Update dependencies
npm update

# Install specific version
npm install package@version
```

## Development Guide

### 1. Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production version
npm run build
```

### 2. Adding New Features

1. Add service in `src/base/services`
2. Add API in `src/base/apis`
3. Add page component in `src/pages`
4. Add route configuration in `config/app.router.ts`
5. Add common component in `src/uikit/components`

### 3. Testing

```bash
# Run all tests
npm test

# Run specific test
npm test <test-file>

# Update snapshots
npm test -- -u
```

## Important Notes

1. **Code Organization**
   - Follow directory structure standards
   - Use appropriate file naming
   - Keep code modular

2. **Performance Considerations**
   - Use code splitting appropriately
   - Optimize component rendering
   - Control dependency size

3. **Security**
   - Follow security best practices
   - Handle user data correctly
   - Protect sensitive information
