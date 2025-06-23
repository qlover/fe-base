# Build System Guide

Welcome to the fe-base project build system guide. This guide will help you comprehensively understand and master the project's build, packaging, and dependency management.

## 📖 Guide Overview

fe-base adopts a modern monorepo architecture, using pnpm workspace to manage multiple related packages. This guide is divided into the following sections:

### 🏗️ [Project Build System](./project-build-system.md)

Understand fe-base's build architecture and daily development workflow

**Main Content**:

- Monorepo architecture introduction
- pnpm Workspace configuration and usage
- Build command detailed explanation
- Development workflow best practices
- Build-related troubleshooting

**Target Audience**:

- New developers joining the project
- Contributors needing to understand the build process
- Team members wanting to optimize development efficiency

### 📦 [Dependency Management Strategy](./dependency-management.md)

Master complex dependency management strategies and best practices

**Main Content**:

- Dependency type detailed explanation (dependencies, devDependencies, peerDependencies)
- Local package dependency management
- Dependency bundling strategy decisions
- Dependency classification for different scenarios
- Version management and conflict resolution

**Target Audience**:

- Package maintainers
- Developers needing to publish npm packages
- Developers concerned about package size and performance

### ⚙️ [Build Formats & Configuration](./build-formats-config.md)

Deep dive into build format selection and tool configuration

**Main Content**:

- Output format detailed explanation (CJS, ESM, UMD)
- Usage scenario selection guide
- Build tool configuration (tsup, Vite, Rollup)
- package.json configuration best practices
- Build optimization techniques

**Target Audience**:

- Library developers
- Package maintainers needing multi-environment support
- Developers concerned about compatibility

## 🚀 Quick Start

If you're encountering this project for the first time, we recommend reading in the following order:

1. **New Developers**:

   ```
   Project Build System → Dependency Management Strategy → Build Formats & Configuration
   ```

2. **Experienced Developers**:

   ```
   Dependency Management Strategy → Build Formats & Configuration → Project Build System (Reference)
   ```

3. **Package Maintainers**:
   ```
   Dependency Management Strategy → Build Formats & Configuration → Project Build System (Deep Dive)
   ```

## 📋 Common Scenario Quick Reference

### I want to...

- **Set up development environment** → [Project Build System - Development Workflow](./project-build-system.md#development-workflow)
- **Add new dependencies** → [Dependency Management Strategy - Dependency Type Selection](./dependency-management.md#dependency-types-detailed)
- **Publish a new package** → [Build Formats & Configuration - Usage Scenario Selection](./build-formats-config.md#usage-scenario-selection)
- **Resolve build errors** → [Project Build System - Common Issues](./project-build-system.md#common-issues)
- **Optimize package size** → [Dependency Management Strategy - Bundling Strategy](./dependency-management.md#dependency-bundling-strategy)
- **Configure multi-format output** → [Build Formats & Configuration - Build Tool Configuration](./build-formats-config.md#build-tool-configuration)

## 🛠️ Core Concepts

Before getting started, understanding the following core concepts will be helpful:

### Monorepo

An architectural pattern for managing multiple related packages in a single repository, providing unified dependency management and build processes.

### Workspace

pnpm's workspace functionality that allows managing multiple packages in a single repository while sharing dependencies.

### Dependency Externalization

Not including certain dependencies in the final bundle during packaging, but requiring the user environment to provide these dependencies.

### Tree-shaking

An optimization technique where build tools automatically remove unused code, reducing final bundle size.

## 📚 Related Resources

### Official Documentation

- [pnpm Workspace](https://pnpm.io/workspaces)
- [tsup Documentation](https://tsup.egoist.dev/)
- [Vite Library Mode](https://vitejs.dev/guide/build.html#library-mode)

### Toolchain

- [pnpm](https://pnpm.io/) - Package manager
- [nx](https://nx.dev/) - Build system
- [tsup](https://tsup.egoist.dev/) - TypeScript build tool
- [Vite](https://vitejs.dev/) - Modern build tool

### Community Resources

- [npm Package Publishing Best Practices](https://docs.npmjs.com/packages-and-modules/)
- [JavaScript Module System Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

## 🤝 Contributing Guide

If you find errors or areas for improvement in the documentation, please:

1. Submit an Issue to report problems
2. Submit a Pull Request to improve documentation
3. Provide suggestions in team discussions

## 📞 Getting Help

When encountering problems, you can:

1. Check the "Common Issues" section of the corresponding chapter
2. Search the project's Issues
3. Seek help from team members
4. Refer to official documentation and community resources

---

## 🌐 Other Language Versions

- **[🇨🇳 中文](../../zh/builder-guide/)** - Chinese version of this guide
- **[🏠 Back to Home](../index.md)** - Return to English documentation home

**Start your build journey!** Choose the guide section that best fits your current needs to begin reading.
