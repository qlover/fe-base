# fe-base

Frontend Base Toolkit - A Powerful Collection of Tools Designed for Frontend Applications

English  | [中文](./README.md)

## 📋 Project Overview

fe-base is a collection of toolkits designed specifically for frontend applications, adopting a monorepo architecture to provide modular frontend solutions. The project includes multiple practical toolkits ranging from core utility libraries to development scripts, from logging systems to code generation tools.

## ✨ Features

- 🎯 **Modular Design** - Monorepo architecture based on pnpm workspace
- 🔧 **TypeScript Support** - Complete type definitions and intelligent hints
- 📦 **Independent Publishing** - Each package can be installed and used independently
- 🚀 **Modern Toolchain** - Uses modern tools like Vite, ESLint, Prettier
- 🔄 **Automated Release** - Version management and release process based on Changesets
- 🧪 **Test Coverage** - Integrated Vitest testing framework
- 🛠️ **Development Tools** - Provides complete development toolchain and scripts

## 🚀 Quick Start

### Requirements

- Node.js >= 18.19.0
- pnpm >= 8.0.0

### Installation & Usage

```bash
# Install core toolkit
npm install @qlover/fe-corekit

# Install development scripts
npm install @qlover/fe-scripts

# Install logging tool
npm install @qlover/logger

# Or use pnpm
pnpm add @qlover/fe-corekit @qlover/fe-scripts @qlover/logger
```

### Developer Installation

```bash
# Clone the project
git clone https://github.com/qlover/fe-base.git
cd fe-base

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

## 📦 Package List

| Package | Version | Description |
| ------- | ------- | ----------- |
| [@qlover/fe-corekit](./packages/fe-corekit/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/fe-corekit) | Frontend core toolkit providing storage, serialization, request features |
| [@qlover/fe-scripts](./packages/fe-scripts/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/fe-scripts) | Frontend development script tools including clean, commit, check commands |
| [@qlover/fe-code2markdown](./packages/fe-code2markdown/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/fe-code2markdown) | Code to Markdown documentation generation tool |
| [@qlover/fe-release](./packages/fe-release/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/fe-release) | Project release management tool |
| [@qlover/logger](./packages/logger/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/logger) | Flexible logging system |
| [@qlover/env-loader](./packages/env-loader/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/env-loader) | Environment variable loading tool |
| [@qlover/fe-standard](./packages/fe-standard/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/fe-standard) | Frontend development standards and specifications |
| [@qlover/eslint-plugin-fe-dev](./packages/eslint-plugin-fe-dev/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/eslint-plugin-fe-dev) | Frontend development ESLint plugin |
| [@qlover/scripts-context](./packages/scripts-context/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/scripts-context) | Script execution context tool |
| [@qlover/corekit-bridge](./packages/corekit-bridge/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/corekit-bridge) | Core toolkit bridge |
| [@qlover/corekit-node](./packages/corekit-node/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/corekit-node) | Node.js environment core tools |
| [@qlover/create-app](./packages/create-app/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/create-app) | Application scaffolding generation tool |

## 📚 Documentation

### Complete Documentation
- **[🇺🇸 English Documentation](./docs/en/)** - Complete English development documentation
- **[🇨🇳 中文文档](./docs/zh/)** - 完整的中文开发文档

### Core Guides
- **[🏗️ Build System Guide](./docs/en/builder-guide/)** - Monorepo architecture and build process
- **[📝 Development Standards](./docs/en/commit-convention.md)** - Commit conventions and code standards
- **[🚀 Project Release](./docs/en/project-release.md)** - Version management and release process
- **[➕ How to Add Subpackage](./docs/en/how-to-add-a-subpackage.md)** - New package creation guide

## 🔧 Common Commands

```bash
# Build all packages
pnpm build

# Code linting and formatting
pnpm lint
pnpm prettier

# Run tests
pnpm test

# Clean build artifacts
pnpm clean:build

# Commit code (using commitizen)
pnpm commit

# Release version
pnpm changeset
pnpm changeset version
pnpm changeset publish
```

## 🤝 Contributing

We welcome all forms of contributions:

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`pnpm commit`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

For detailed contribution guidelines, please check the [complete documentation](./docs/).

## 📄 License

[ISC](./LICENSE)

---

**Get Started** 👉 [English Docs](./docs/en/) | [中文文档](./docs/zh/) 