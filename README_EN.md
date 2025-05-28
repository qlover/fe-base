# fe-base

Frontend Toolkit - Powerful frontend tools collection for modern applications

## 📖 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Quick Start](#-quick-start)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Basic Usage](#basic-usage)
- [Package List](#-package-list)
- [Development Guide](#-development-guide)
  - [Project Build and Dependency Management](./docs/en/project-builder.md)
  - [Commit Convention](./docs/en/commit-convention.md)
  - [Project Release](./docs/en/project-release.md)
  - [How to Add a Subpackage](./docs/en/how-to-add-a-subpackage.md)
  - [Testing Guide](./docs/en/testing-guide.md)
  - [Build Formats Guide](./docs/en/build-formats.md)
- [Script Commands](#-script-commands)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [Version Release](#-version-release)
- [FAQ](#-faq)
- [License](#-license)

## 📋 Project Overview

fe-base is a collection of tools specifically designed for frontend applications, using a monorepo architecture to provide modular frontend solutions. The project includes everything from core utility libraries to development scripts, from logging systems to code generation tools.

## ✨ Features

- 🎯 **Modular Design** - Monorepo architecture based on pnpm workspace
- 🔧 **TypeScript Support** - Complete type definitions and intelligent hints
- 📦 **Independent Publishing** - Each package can be installed and used independently
- 🚀 **Modern Toolchain** - Using modern tools like Vite, ESLint, Prettier
- 🔄 **Automated Release** - Version management and release process based on Changesets
- 🧪 **Test Coverage** - Integrated Vitest testing framework
- 🛠️ **Development Tools** - Complete development toolchain and scripts

## 🚀 Quick Start

### Requirements

- Node.js >= 18.19.0
- pnpm >= 8.0.0

### Installation

```bash
# Clone the project
git clone https://github.com/qlover/fe-base.git
cd fe-base

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Basic Usage

```bash
# Install core toolkit
npm install @qlover/fe-corekit

# Install development scripts
npm install @qlover/fe-scripts

# Install logger
npm install @qlover/logger

# Or use pnpm
pnpm add @qlover/fe-corekit @qlover/fe-scripts @qlover/logger
```

## 📦 Package List

| Package Name | Version | Description |
| ------------ | ------- | ----------- |
| [@qlover/fe-corekit](./packages/fe-corekit/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/fe-corekit) | Frontend core toolkit with storage, serialization, request utilities |
| [@qlover/fe-scripts](./packages/fe-scripts/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/fe-scripts) | Frontend development script tools with clean, commit, check commands |
| [@qlover/fe-code2markdown](./packages/fe-code2markdown/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/fe-code2markdown) | Code to Markdown documentation generator |
| [@qlover/fe-release](./packages/fe-release/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/fe-release) | Project release management tool |
| [@qlover/logger](./packages/logger/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/logger) | Flexible logging system |
| [@qlover/env-loader](./packages/env-loader/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/env-loader) | Environment variable loader utility |
| [@qlover/fe-standard](./packages/fe-standard/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/fe-standard) | Frontend development standards and conventions |
| [@qlover/eslint-plugin-fe-dev](./packages/eslint-plugin-fe-dev/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/eslint-plugin-fe-dev) | ESLint plugin for frontend development |
| [@qlover/scripts-context](./packages/scripts-context/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/scripts-context) | Script execution context utility |
| [@qlover/corekit-bridge](./packages/corekit-bridge/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/corekit-bridge) | Core toolkit bridge utility |
| [@qlover/corekit-node](./packages/corekit-node/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/corekit-node) | Node.js environment core utilities |
| [@qlover/create-app](./packages/create-app/README.md) | ![npm](https://img.shields.io/npm/v/@qlover/create-app) | Application scaffolding generator |

## 🛠️ Development Guide

- [Project Build and Dependency Management](./docs/en/project-builder.md)
- [Commit Convention](./docs/en/commit-convention.md)
- [Project Release](./docs/en/project-release.md)
- [How to Add a Subpackage](./docs/en/how-to-add-a-subpackage.md)
- [Testing Guide](./docs/en/testing-guide.md)
- [Build Formats Guide](./docs/en/build-formats.md)

## 📜 Script Commands

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

# Check package dependencies
pnpm check-packages

# Clean branches
pnpm clean-branch

# Release version
pnpm release
```

## 🔧 Tech Stack

- **Build Tools**: Vite, Rollup, tsup
- **Package Management**: pnpm workspace
- **Code Quality**: ESLint, Prettier, Husky
- **Testing Framework**: Vitest
- **Version Management**: Changesets
- **Task Runner**: Nx
- **Language**: TypeScript

## 📁 Project Structure

```
fe-base/
├── packages/                 # Subpackage directory
│   ├── fe-corekit/          # Frontend core toolkit
│   ├── fe-scripts/          # Development script tools
│   ├── fe-code2markdown/    # Code documentation generator
│   ├── fe-release/          # Release management tool
│   ├── logger/              # Logging system
│   ├── env-loader/          # Environment variable loader
│   ├── fe-standard/         # Development standards
│   ├── eslint-plugin-fe-dev/ # ESLint plugin
│   ├── scripts-context/     # Script context utility
│   ├── corekit-bridge/      # Core toolkit bridge
│   ├── corekit-node/        # Node.js core utilities
│   └── create-app/          # Application scaffolding
├── docs/                     # Documentation directory
│   ├── zh/                   # Chinese documentation
│   └── en/                   # English documentation
├── .github/                  # GitHub configuration
├── .changeset/               # Version change configuration
├── package.json              # Root package configuration
├── pnpm-workspace.yaml       # pnpm workspace configuration
├── fe-config.json            # Frontend tool configuration
└── README.md                 # Project description
```

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`pnpm commit`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## 📋 Version Release

This project uses [Changesets](https://github.com/changesets/changesets) for version management:

```bash
# Add change record
pnpm changeset

# Release version
pnpm changeset version
pnpm changeset publish
```

## ❓ FAQ

- [How to Add a Subpackage](./docs/en/how-to-add-a-subpackage.md)

## 📄 License

[ISC](./LICENSE)
