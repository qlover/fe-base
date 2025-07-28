# FE-React Template

A modern React frontend project template with integrated practical features and best practices.

[中文](./README.md)

## 🌟 Features

- 🚀 Fast development experience with Vite
- 🎨 Theme system integrated with Tailwind CSS
- 🌍 Comprehensive internationalization support (Chinese & English)
- 🔄 TypeScript-based IOC container
- 📡 Unified API request handling
- 🎮 Controller pattern for state management
- 📦 Package management with pnpm
- 🧪 Built-in test support

## 🔧 Requirements

- Node.js >= 16
- pnpm >= 8.0

## 📁 Project Structure

```tree
├── config/                 # Configuration directory
│   ├── app.router.json     # Router page configuration
│   ├── common.ts           # Application common configuration
│   ├── app.router.json     # Router configuration
│   ├── i18n.ts             # I18n configuration
│   └── theme.json          # Theme configuration
├── lib/                    # Common library directory
├── public/                 # Static resources directory
├── src/
│   ├── base/           # Base code
│   ├── core/           # Core code
│   ├── pages/          # Page components
│   ├── services/       # Service layer
│   └── uikit/          # UI component library
└── vite.config.ts      # Vite configuration file
```

## 🚀 Quick Start

### Install Dependencies

```bash
pnpm install
```

### Development Mode

```bash
pnpm dev
```

### Build Project

```bash
pnpm build
```

### Run Tests

```bash
pnpm test
```

## 📚 Documentation Guide

The project provides detailed development documentation covering all major features and best practices:

### Basic Documentation
- [Project Overview](./docs/en/index.md) - Project introduction and quick start guide
- [Project Structure](./docs/en/project-structure.md) - Detailed project directory structure explanation
- [Development Guide](./docs/en/development-guide.md) - Project development specifications and best practices
- [Environment Configuration](./docs/en/env.md) - Environment variables and configuration management
- [Global Configuration](./docs/en/global.md) - Application global configuration and settings

### Core Features
- [Bootstrap Process](./docs/en/bootstrap.md) - Application startup process and lifecycle management
- [IOC Container](./docs/en/ioc.md) - Dependency injection system usage guide
- [Router Management](./docs/en/router.md) - Router configuration and page navigation
- [State Management](./docs/en/store.md) - Application state management solution
- [Request Handling](./docs/en/request.md) - API request handling mechanism

### Feature Extensions
- [Internationalization](./docs/en/i18n.md) - Multi-language support and translation management
- [Theme System](./docs/en/theme.md) - Theme configuration and dark mode support
- [TypeScript Guide](./docs/en/typescript-guide.md) - TypeScript usage specifications and best practices

## 🔨 Core Features

### IOC Container

- TypeScript-based dependency injection system
- Support for automatic service registration and dependency management
- Complete type inference

### Environment Configuration

[Vite Environment Variables and Modes](https://vitejs.dev/guide/env-and-mode.html)

`vite dev` default NODE_ENV is 'development', it will load possible `.env[mode]` files, e.g., .env.local -> .env

`vite build` default NODE_ENV is 'production', it will load possible `.env[mode]` files, e.g., .env.production -> .env

Node.js NODE_ENV only supports development, production, test

This is completely different from mode in vite. Mode can be specified with `--mode` to load different env configurations.

For example:

```bash
vite dev --mode staging # Load .env.staging
vite dev --mode local # Load .env.local
```

### Internationalization Support

- Complete i18n solution based on i18next
- Support for Chinese (zh) and English (en) language switching
- Automatic i18n resource generation based on TypeScript comments
- URL path language detection and switching
- Built-in language switcher component

### Theme System

- Theme configuration based on Tailwind CSS
- Support for dark/light mode
- Custom design token system

### API Integration

The project provides a powerful API request handling mechanism based on a plugin architecture:

#### Request Controller

Use `RequestController` to manage API requests uniformly:

```typescript
@injectable()
export class RequestController extends StoreInterface<RequestControllerState> {
  constructor(
    @inject(FeApi) private readonly feApi: FeApi,
    @inject(UserApi) private readonly userApi: UserApi
  ) {
    super(createDefaultState);
  }

  // API call example
  async onRandomUser() {
    if (this.state.randomUserState.loading) return;

    this.setState({
      randomUserState: { loading: true, result: null, error: null }
    });

    try {
      const result = await this.userApi.getRandomUser();
      this.setState({
        randomUserState: { loading: false, result, error: null }
      });
    } catch (error) {
      this.setState({
        randomUserState: { loading: false, result: null, error }
      });
    }
  }
}
```

### Controller Pattern

Provides multiple out-of-the-box controllers:

- JSONStorageController
- RequestController
- RouterController
- UserController
- ThemeController

## 🛠️ Development Guide

### API Development Standards

1. Define interfaces in `src/base/apis`
2. Support for Mock data configuration

### Adding New Pages

1. Create page component in `src/pages`
2. Update `config/app.router.json`
3. Add corresponding controller (if needed)

### Build Optimization

The project uses Vite for building and includes the following optimizations:

#### Code Splitting

Automatic intelligent code splitting into the following main chunks:

- react-vendor: React core library
- antd-core: Ant Design core components
- antd-basic: Basic UI components
- antd-advanced: Advanced UI components
- utils: Utility functions
- i18n: Internationalization related

#### Build Optimization Configuration

```typescript
build: {
  // Chunk size warning limit set to 600kb
  chunkSizeWarningLimit: 600,
  // Use terser for code compression
  minify: 'terser',
  terserOptions: {
    compress: {
      // Remove console output and debugger statements
      drop_console: true,
      drop_debugger: true,
      // Remove specific console function calls
      pure_funcs: ['console.log', 'console.info', 'console.debug']
    }
  }
}
```

### Project Configuration

#### Environment Variables

- Use `@qlover/corekit-bridge/vite-env-config` to manage environment variables
- Automatically inject application name and version information
- Support for environment variable prefix configuration

#### Style Configuration

- Integrate Tailwind CSS
- Load Ant Design component styles on demand
- Support theme mode override

#### Development Server

```bash
# Default port 3200, configurable via environment variable
VITE_SERVER_PORT=3000 pnpm dev
```

#### Test Configuration

- Use Vitest for unit testing
- Support JSDOM environment
- Built-in test tool configuration
``` 