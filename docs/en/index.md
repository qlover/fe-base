# fe-base English Documentation

Welcome to fe-base frontend toolkit! This is the complete English development documentation.

## 📋 Documentation Navigation

### 🏗️ Build System Guide

Comprehensive understanding of fe-base's monorepo architecture and build system:

- **[Build System Overview](./builder-guide/index.md)** - Overall architecture and tech stack introduction
- **[Project Build System](./builder-guide/project-build-system.md)** - Monorepo architecture, pnpm workspace, build commands
- **[Dependency Management Strategy](./builder-guide/dependency-management.md)** - Dependency types, local package management, bundling strategies
- **[Build Format Configuration](./builder-guide/build-formats-config.md)** - Output format selection, build tool configuration, optimization strategies

### 📝 Development Standards

Project development standards and best practices:

- **[Commit Convention](./commit-convention.md)** - Git commit message standards and tool configuration
- **[Testing Guide](./testing-guide.md)** - Testing strategies, tool usage and best practices
- **[Code Comments](./code-comments-guide.md)** - Code Comments, Format Usage Guide

### 🚀 Project Management

Project release, package management and extension:

- **[Project Release](./project-release.md)** - Version management, release process and automation
- **[How to Add a Subpackage](./how-to-add-a-subpackage.md)** - New package creation, configuration and release process

## 🎯 Quick Start

### Environment Setup

```bash
# Ensure environment requirements
node --version  # >= 18.19.0
pnpm --version  # >= 8.0.0
```

### Project Initialization

```bash
# Clone the project
git clone https://github.com/qlover/fe-base.git
cd fe-base

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Using the Toolkit

```bash
# Install core toolkit
pnpm add @qlover/fe-corekit

# Install development scripts
pnpm add @qlover/fe-scripts

# Install logging tools
pnpm add @qlover/logger
```

## 📦 Package List

### Core Toolkit

- **[@qlover/fe-corekit](../../packages/fe-corekit/README.md)** - Frontend core utility library providing storage, serialization, request functions
- **[@qlover/corekit-node](../../packages/corekit-node/README.md)** - Node.js environment core tools
- **[@qlover/corekit-bridge](../../packages/corekit-bridge/README.md)** - Core toolkit bridge
- **[@qlover/logger](../../packages/logger/README.md)** - Flexible logging system

### Development Tools

- **[@qlover/fe-scripts](../../packages/fe-scripts/README.md)** - Frontend development script toolkit
- **[@qlover/fe-code2markdown](../../packages/fe-code2markdown/README.md)** - Code to Markdown documentation generation tool
- **[@qlover/fe-release](../../packages/fe-release/README.md)** - Project release management tool
- **[@qlover/create-app](../../packages/create-app/README.md)** - Application scaffolding generation tool

### Configuration and Standards

- **[@qlover/fe-standard](../../packages/fe-standard/README.md)** - Frontend development standards and specifications
- **[@qlover/eslint-plugin-fe-dev](../../packages/eslint-plugin-fe-dev/README.md)** - Frontend development ESLint plugin
- **[@qlover/env-loader](../../packages/env-loader/README.md)** - Environment variable loading tool

### Support Tools

- **[@qlover/scripts-context](../../packages/scripts-context/README.md)** - Script execution context tool

## 🔧 Common Commands

### Development Commands

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build --filter @qlover/fe-corekit

# Code linting
pnpm lint

# Format code
pnpm prettier

# Run tests
pnpm test
```

### Release Commands

```bash
# Add changelog
pnpm changeset

# Release version
pnpm changeset version
pnpm changeset publish
```

## ❓ Frequently Asked Questions

### Build Related

- **Build failures** - See [Project Build System](./builder-guide/project-build-system.md#frequently-asked-questions)
- **Dependency issues** - See [Dependency Management Strategy](./builder-guide/dependency-management.md#frequently-asked-questions)
- **Format configuration** - See [Build Format Configuration](./builder-guide/build-formats-config.md#frequently-asked-questions)

### Development Related

- **How to add new packages** - See [How to Add a Subpackage](./how-to-add-a-subpackage.md)
- **Testing related** - See [Testing Guide](./testing-guide.md)
- **Commit standards** - See [Commit Convention](./commit-convention.md)

## 🌐 Other Language Versions

- **[🇨🇳 中文文档](../zh/index.md)** - Complete Chinese documentation
- **[🏠 Back to Root](../../README.md)** - Return to project root directory

## 🤝 Contributing

We welcome all forms of contributions:

1. **Report Issues** - Submit in [GitHub Issues](https://github.com/qlover/fe-base/issues)
2. **Improve Documentation** - Help improve documentation content
3. **Code Contributions** - Submit Pull Requests
4. **Feature Suggestions** - Propose new feature ideas

## 📞 Getting Help

- **GitHub Issues** - [https://github.com/qlover/fe-base/issues](https://github.com/qlover/fe-base/issues)
- **Documentation Issues** - If the documentation is unclear, please let us know
- **Usage Discussion** - Exchange experiences with other community developers

---

**Get Started** 👉 [Build System Guide](./builder-guide/) | [Project Release](./project-release.md) | [How to Add Subpackage](./how-to-add-a-subpackage.md)
