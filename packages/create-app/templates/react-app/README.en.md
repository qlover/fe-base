# FE-React Template

A modern React frontend project template integrated with multiple practical features and best practices.

[中文](./README.md)

## 🌟 Highlights

- 🚀 Fast development experience based on Vite
- 🎨 Theme system integrated with Tailwind CSS
- 🌍 Complete internationalization support (Chinese and English)
- 🔄 TypeScript-based IOC container
- 📡 Unified API request handling
- 🎮 Controller pattern state management
- 📦 Package management using pnpm
- 🧪 Built-in testing support

## 🔧 Requirements

- Node.js >= 16
- pnpm >= 8.0

## 📁 Project Structure

```tree
├── config/                 # Configuration files directory
│   ├── app.router.json     # Route page configuration
│   ├── common.ts           # Application common configuration
│   ├── app.router.json     # Route configuration
│   ├── i18n.ts             # Internationalization configuration
│   └── theme.json          # Theme configuration
├── lib/                    # Common library directory
├── public/                 # Static assets directory
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
# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run E2E tests (UI mode)
pnpm test:e2e:ui
```

## 📚 Documentation Guide

The project provides detailed development documentation covering all major features and best practices:

### 🚀 Getting Started

- **[📖 Project Documentation](./docs/en/index.md)** - Architecture overview, core concepts, and complete documentation navigation
- **[Development Guide](./docs/en/development-guide.md)** - 📝 Complete page development process

### 🎯 Core Features

- **[Bootstrap Initializer](./docs/en/bootstrap.md)** - ⚡ Application startup and initialization
- **[IOC Container](./docs/en/ioc.md)** - 🔌 Dependency injection and UI separation
- **[Store State Management](./docs/en/store.md)** - 📡 How the application layer notifies the UI layer
- **[Environment Variable Management](./docs/en/env.md)** - ⚙️ Multi-environment configuration
- **[Internationalization](./docs/en/i18n.md)** - 🌍 i18n Key and translation management

### 🧪 Testing Documentation

- **[Playwright E2E Testing](./docs/en/playwright/)** - 🎭 Complete end-to-end testing documentation
  - [Overview](./docs/en/playwright/overview.md)
  - [Quick Start](./docs/en/playwright/quickstart.md)
  - [Testing Guide](./docs/en/playwright/testing-guide.md)
  - [Setup Complete](./docs/en/playwright/setup-complete.md)
- [Unit Testing Guide](./docs/en/test-guide.md) - Vitest unit testing

### 📖 Additional Documentation

- [Why Disable Global Variables](./docs/en/why-no-globals.md) - Global variable usage guidelines
- [Route Management](./docs/en/router.md) - Route configuration instructions
- [Theme System](./docs/en/theme.md) - Theme configuration and switching
- [Request Handling](./docs/en/request.md) - API request handling
- [TypeScript Guide](./docs/en/typescript-guide.md) - TypeScript conventions

## 🔨 Core Features

### IOC Container

- TypeScript-based dependency injection system
- Supports automatic service registration and dependency management
- Provides complete type inference

### Environment Configuration

[Vite Environment Variables and Modes](https://cn.vite.dev/guide/env-and-mode#env-variables-and-modes)

`vite dev` defaults NODE_ENV to development, it will load possible `.env[mode]` files, such as .env.local -> .env

`vite build` defaults NODE_ENV to production, it will load possible `.env[mode]` files, such as .env.production -> .env

Node.js NODE_ENV only supports development, production, test

This is completely different from mode in vite, mode can specify different modes through `--mode` to load different env configurations

For example:

```bash
vite dev --mode staging # Load .env.staging
vite dev --mode local # Load .env.local
```

### Internationalization Support

- Complete internationalization solution based on i18next
- Supports Chinese (zh) and English (en) bilingual switching
- Automatic internationalization resource generation based on TypeScript comments
- URL path language detection and switching
- Built-in language switching component

### Theme System

- Theme configuration based on Tailwind CSS
- Supports dark/light mode
- Custom design token system

### API Integration

The project provides a powerful API request handling mechanism based on a plugin architecture design:

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

### API Development Specifications

1. Define interfaces in `src/base/apis`
2. Support Mock data configuration

### Adding New Pages Process

1. Create page components in `src/pages`
2. Update `config/app.router.json`
3. Add corresponding controller (if needed)

### Build Optimization

The project uses Vite for building and has been optimized with the following:

#### Code Splitting

Automatic intelligent code splitting, dividing code into the following main chunks:

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
  // Use terser for code minification
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
- Support environment variable prefix configuration

#### Style Configuration

- Integrated with Tailwind CSS
- On-demand loading of Ant Design component styles
- Support theme mode override

#### Development Server

```bash
# Default port 3200, can be configured via environment variables
VITE_SERVER_PORT=3000 pnpm dev
```

#### Test Configuration

- Use Vitest for unit testing
- Support JSDOM environment
- Built-in test tool configuration
