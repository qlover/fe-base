# Next.js Full-Stack Application Documentation

## Introduction

This is a full-stack application template based on Next.js, implementing a clear layered architecture using an interface-driven design pattern. This template provides a complete full-stack development solution, including server-side API, client-side state management, authentication and authorization, internationalization, and other core features.

### Key Features

- 🏗️ **Full-Stack Architecture**: Based on Next.js app router and API routes
- 🔌 **Interface-Driven**: Complete interface-oriented programming practice
- 🎨 **Theme Customization**: Theme system based on Tailwind CSS
- 🌍 **Internationalization**: Multi-language support based on next-intl
- 🔄 **Dependency Injection**: TypeScript-based IOC container
- 🛡️ **Authentication**: Complete authentication and authorization solution
- 📡 **Layered Design**: Clear front-end and back-end layered architecture
- 🎮 **State Management**: Controller pattern-based state management
- 🔗 **Data Access**: Flexible database access layer

## Quick Start

```bash
# Install dependencies
pnpm install

# Development environment startup
pnpm dev
# cross-env APP_ENV=localhost next dev --turbopack --port 3100
# Automatically loads .env.localhost -> .env

# Staging environment startup
pnpm dev:staging
# cross-env APP_ENV=staging next dev --turbopack --port 3100
# Automatically loads .env.staging -> .env

# Build production version
pnpm build
```

## Architecture Overview

### 1. Client-Side Architecture

#### Interface Definitions (src/base/port)

- AppUserApiInterface: User API interface
- AsyncStateInterface: Asynchronous state interface
- RouterInterface: Router management interface

#### Core Implementation

- Controller Layer: State and business logic management
- Service Layer: API calls and data processing
- UI Components: Reusable presentation components

### 2. Server-Side Architecture

#### Interface Definitions (src/server/port)

- ServerAuthInterface: Authentication interface
- DBBridgeInterface: Database operation interface
- UserRepositoryInterface: User repository interface
- ValidatorInterface: Data validation interface

#### Core Implementation

- API Route Layer: Request handling and response
- Service Layer: Business logic implementation
- Data Access Layer: Repository and database interaction

## Development Guide

### 1. API Development Process

1. Define interface (src/server/port)
2. Implement validator (src/server/validators)
3. Implement service layer (src/server/services)
4. Implement data access (src/server/repositorys)
5. Create API route (src/app/api)

### 2. Page Development Process

1. Create page component (src/app/[locale])
2. Implement page controller
3. Add API service
4. Register IOC container

### 3. Best Practices

#### Interface-First Development

- Define interfaces before implementing concrete classes
- Maintain single responsibility for interfaces
- Use dependency injection to manage dependencies

#### Layering Principles

- Maintain clear boundaries between layers
- Communicate between layers through interfaces
- Avoid direct cross-layer calls

#### State Management

- Use controllers to manage complex state
- Maintain state immutability
- Unified state update process

## Core Feature Documentation

### Basic Architecture

- [Project Structure](./project-structure.md)
- [Development Guidelines](./development-guide.md)
- [Environment Configuration](./env.md)

### Server-Side Development

- [API Development Guide](./api.md)
- [Authentication & Authorization](./auth.md)
- [Data Access Layer](./database.md)
- [Validator Development](./validator.md)

### Client-Side Development

- [Page Development Guide](./page.md)
- [Component Development](./component.md)

### Feature Modules

- [Internationalization Development](./i18n.md)
- [Theme System](./theme.md)
- [Router Management](./router.md)

## FAQ

### 1. Development Environment Setup

- Node.js >= 16
- pnpm >= 8.0
- VSCode + recommended extensions recommended

### 2. Development Related

- Interface design specifications
- Dependency injection usage
- Controller development guidelines

### 3. Deployment Related

- Environment variable configuration
- Build optimization
- Deployment process

## Changelog

View [CHANGELOG.md](../../CHANGELOG.md) for detailed update history.

## Support and Help

- Submit Issues
- View Wiki
- Join Discussions

## License

This project is open-sourced under the [ISC License](../../LICENSE).
