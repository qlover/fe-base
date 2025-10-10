# Next.js Full-Stack Application Template

A full-stack application template based on Next.js, implementing a clear front-end and back-end layered architecture using an interface-driven design pattern.

[中文](./README.md)

## 🌟 Key Features

- 🏗️ Full-stack application architecture based on Next.js
- 🔌 Interface-Driven Development pattern
- 🎨 Theme system integrated with Tailwind CSS
- 🌍 Comprehensive internationalization support (English & Chinese)
- 🔄 TypeScript-based IOC container
- 🛡️ Complete authentication and authorization system
- 📡 Layered API architecture (Controllers, Services, Repositories)
- 🎮 State management and page controller pattern
- 🔗 SQL database bridging layer
- 📦 Package management with pnpm

## 🔧 Requirements

- Node.js >= 16
- pnpm >= 8.0

## 📁 Project Structure

```tree
├── config/                     # Configuration directory
│   ├── i18n/                  # Internationalization config
│   ├── Identifier/            # Dependency injection identifiers
│   ├── common.ts              # Common app configuration
│   ├── IOCIdentifier.ts       # IOC container configuration
│   └── theme.ts               # Theme configuration
├── public/                    # Static assets directory
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── [locale]/        # Internationalized routes
│   │   ├── api/            # API route handlers
│   │   └── layout.tsx      # Application layout
│   ├── base/               # Client-side base code
│   │   ├── port/          # Client interface definitions
│   │   ├── cases/         # Business case implementations
│   │   ├── services/      # Client service implementations
│   │   └── types/         # Type definitions
│   ├── server/            # Server-side code
│   │   ├── port/         # Server interface definitions
│   │   ├── services/     # Service implementations
│   │   ├── repositorys/  # Data repositories
│   │   ├── validators/   # Request validators
│   │   └── sqlBridges/   # Database bridging layer
│   ├── uikit/            # UI component library
│   │   ├── components/   # Reusable components
│   │   ├── context/     # React Context
│   │   └── hook/        # React Hooks
│   └── styles/          # Style files
└── next.config.ts       # Next.js configuration file
```

## 🚀 Quick Start

### Install Dependencies

```bash
pnpm install
```

### Development Mode

```bash
pnpm dev
# cross-env APP_ENV=localhost next dev --turbopack --port 3100
# Automatically loads .env.localhost -> .env

pnpm dev:staging
# cross-env APP_ENV=staging next dev --turbopack --port 3100
# Automatically loads .env.staging -> .env
```

### Build Project

```bash
pnpm build
```

## 📚 Documentation Guide

The project provides detailed development documentation covering all major features and best practices:

### Basic Documentation

- [Project Overview](./docs/en/index.md) - Project introduction and quick start guide
- [Project Structure](./docs/en/project-structure.md) - Detailed project directory structure explanation
- [Development Guide](./docs/en/development-guide.md) - Project development standards and best practices
- [Environment Configuration](./docs/en/env.md) - Environment variables and configuration management
- [Global Configuration](./docs/en/global.md) - Application global configuration and settings

### Core Features

- [Bootstrap Process](./docs/en/bootstrap.md) - Application startup process and lifecycle management
- [IOC Container](./docs/en/ioc.md) - Dependency injection system usage guide
- [Router Management](./docs/en/router.md) - Route configuration and page navigation
- [State Management](./docs/en/store.md) - Application state management solution
- [Request Handling](./docs/en/request.md) - API request handling mechanism

### Feature Extensions

- [Internationalization](./docs/en/i18n.md) - Multi-language support and translation management
- [Theme System](./docs/en/theme.md) - Theme configuration and dark mode support
- [TypeScript Guide](./docs/en/typescript-guide.md) - TypeScript usage standards and best practices

## 🔨 Architecture Design

### Interface-Driven Design Pattern

The project adopts an interface-driven design pattern, achieving decoupling and testability through interface definitions:

#### Client Interfaces (src/base/port)

- **AppUserApiInterface**: User authentication related API interface
- **AdminPageInterface**: Admin page base interface
- **AsyncStateInterface**: Asynchronous state management interface
- **RouterInterface**: Router management interface
- **I18nServiceInterface**: Internationalization service interface

#### Server Interfaces (src/server/port)

- **ServerAuthInterface**: Server authentication interface
- **DBBridgeInterface**: Database operation bridging interface
- **UserRepositoryInterface**: User data repository interface
- **ValidatorInterface**: Data validation interface
- **ParamsHandlerInterface**: Parameter handling interface
