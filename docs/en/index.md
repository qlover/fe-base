# fe-base English Documentation

Welcome to the fe-base Frontend Base Toolkit! This is the complete English development documentation.

## 📋 Documentation Navigation

### 🏗️ Build System Guide

Comprehensive understanding of fe-base's monorepo architecture and build system:

- **[Build System Overview](./builder-guide/index.md)** - Overall architecture and tech stack introduction
- **[Project Build System](./builder-guide/project-build-system.md)** - Monorepo architecture, pnpm workspace, build commands
- **[Dependency Management](./builder-guide/dependency-management.md)** - Dependency types, local package management, bundling strategies
- **[Build Formats Configuration](./builder-guide/build-formats-config.md)** - Output format selection, build tool configuration, optimization strategies

### 📝 Development Standards

Project development standards and best practices:

- **[Commit Convention](./commit-convention.md)** - Git commit message standards and tool configuration
- **[Testing Guide](./testing-guide.md)** - Testing strategies, tool usage, and best practices
- **[Build Formats Guide](./build-formats.md)** - Package format selection and configuration guide

### 🚀 Project Management

Project release, package management, and extension:

- **[Project Release](./project-release.md)** - Version management, release process, and automation
- **[How to Add a Subpackage](./how-to-add-a-subpackage.md)** - New package creation, configuration, and release process

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

### Using Toolkits

```bash
# Install core toolkit
pnpm add @qlover/fe-corekit

# Install development scripts
pnpm add @qlover/fe-scripts

# Install logging tool
pnpm add @qlover/logger
```

## 📦 Package List

### Core Toolkits
- **[@qlover/fe-corekit](../../packages/fe-corekit/README.md)** - Frontend core toolkit providing storage, serialization, request features
- **[@qlover/fe-scripts](../../packages/fe-scripts/README.md)** - Frontend development script tools
- **[@qlover/logger](../../packages/logger/README.md)** - Flexible logging system

### Development Tools
- **[@qlover/fe-code2markdown](../../packages/fe-code2markdown/README.md)** - Code to Markdown documentation generation tool
- **[@qlover/fe-release](../../packages/fe-release/README.md)** - Project release management tool
- **[@qlover/create-app](../../packages/create-app/README.md)** - Application scaffolding generation tool

### Configuration and Standards
- **[@qlover/fe-standard](../../packages/fe-standard/README.md)** - Frontend development standards and specifications
- **[@qlover/eslint-plugin-fe-dev](../../packages/eslint-plugin-fe-dev/README.md)** - Frontend development ESLint plugin
- **[@qlover/env-loader](../../packages/env-loader/README.md)** - Environment variable loading tool

### Support Tools
- **[@qlover/scripts-context](../../packages/scripts-context/README.md)** - Script execution context tool
- **[@qlover/corekit-bridge](../../packages/corekit-bridge/README.md)** - Core toolkit bridge
- **[@qlover/corekit-node](../../packages/corekit-node/README.md)** - Node.js environment core tools

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
# Add change record
pnpm changeset

# Release version
pnpm changeset version
pnpm changeset publish
```

## ❓ FAQ

### Build Related
- **Build Failures** - See [Project Build System](./builder-guide/project-build-system.md#common-issues)
- **Dependency Issues** - See [Dependency Management](./builder-guide/dependency-management.md#common-questions)
- **Format Configuration** - See [Build Formats Configuration](./builder-guide/build-formats-config.md#common-questions)

### Development Related
- **How to Add New Package** - See [How to Add a Subpackage](./how-to-add-a-subpackage.md)
- **Testing Related** - See [Testing Guide](./testing-guide.md)
- **Commit Standards** - See [Commit Convention](./commit-convention.md)

## 🌐 Other Languages

- **[中文文档](../zh/)** - 完整的中文开发文档

## 🤝 Contributing

We welcome all forms of contributions:

1. **Report Issues** - Submit in [GitHub Issues](https://github.com/qlover/fe-base/issues)
2. **Improve Documentation** - Help improve documentation content
3. **Code Contributions** - Submit Pull Requests
4. **Feature Suggestions** - Propose new feature ideas

## 📞 Getting Help

- **GitHub Issues** - [https://github.com/qlover/fe-base/issues](https://github.com/qlover/fe-base/issues)
- **Documentation Issues** - If the documentation is unclear, please let us know
- **Community Discussion** - Exchange experiences with other developers

---

**Get Started** 👉 [Build System Guide](./builder-guide/) | [Project Release](./project-release.md) | [How to Add Subpackage](./how-to-add-a-subpackage.md) 