# Build System Guide

Welcome to the fe-base project's build system guide. This guide will help you comprehensively understand and master project building, packaging, and dependency management.

## 📖 Guide Overview

fe-base adopts a modern monorepo architecture, using pnpm workspace to manage multiple related packages. This guide is divided into the following sections:

### 🏗️ [Project Build System](./project-build-system.md)
Understanding fe-base's build architecture and daily development workflows

**Main Content**:
- Monorepo architecture introduction
- pnpm Workspace configuration and usage
- Build command explanations
- Development workflow best practices
- Build-related troubleshooting

**Target Audience**:
- New developers joining the project
- Contributors who need to understand build processes
- Team members looking to optimize development efficiency

### 📦 [Dependency Management Strategies](./dependency-management.md)
Mastering complex dependency management strategies and best practices

**Main Content**:
- Dependency types explained (dependencies, devDependencies, peerDependencies)
- Local package dependency management
- Dependency bundling strategy decisions
- Dependency classification for different scenarios
- Version management and conflict resolution

**Target Audience**:
- Package maintainers
- Developers who need to publish npm packages
- Developers concerned with package size and performance

### ⚙️ [Build Formats & Configuration](./build-formats-config.md)
In-depth understanding of packaging format selection and tool configuration

**Main Content**:
- Output format explanations (CJS, ESM, UMD)
- Use case selection guide
- Build tool configuration (tsup, Vite, Rollup)
- package.json configuration best practices
- Build optimization techniques

**Target Audience**:
- Library developers
- Package maintainers who need to support multiple environments
- Developers concerned with compatibility

## 🚀 Quick Start

If you're new to this project, we recommend reading in the following order:

1. **New Developers**:
   ```
   Project Build System → Dependency Management Strategies → Build Formats & Configuration
   ```

2. **Experienced Developers**:
   ```
   Dependency Management Strategies → Build Formats & Configuration → Project Build System (Reference)
   ```

3. **Package Maintainers**:
   ```
   Dependency Management Strategies → Build Formats & Configuration → Project Build System (Deep Dive)
   ```

## 📋 Common Scenarios Quick Reference

### I want to...

- **Set up development environment** → [Project Build System - Development Workflow](./project-build-system.md#development-workflow)
- **Add new dependencies** → [Dependency Management Strategies - Dependency Type Selection](./dependency-management.md#dependency-types-explained)
- **Publish a new package** → [Build Formats & Configuration - Use Case Selection](./build-formats-config.md#use-case-selection)
- **Resolve build errors** → [Project Build System - Common Issues](./project-build-system.md#common-issues)
- **Optimize package size** → [Dependency Management Strategies - Bundling Strategies](./dependency-management.md#dependency-bundling-strategies)
- **Configure multi-format output** → [Build Formats & Configuration - Build Tool Configuration](./build-formats-config.md#build-tool-configuration)

## 🛠️ Core Concepts

Before getting started, understanding the following core concepts will be helpful:

### Monorepo
An architectural pattern that manages multiple related packages in one repository, providing unified dependency management and build processes.

### Workspace
pnpm's workspace functionality that allows managing multiple packages in a single repository while sharing dependencies.

### Dependency Externalization
Not including certain dependencies in the final bundle during packaging, but requiring the user environment to provide these dependencies.

### Tree-shaking
An optimization technique where build tools automatically remove unused code, reducing final package size.

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

## 🤝 Contributing

If you find errors or areas for improvement in the documentation, please:

1. Submit an Issue to report problems
2. Submit a Pull Request to improve documentation
3. Provide suggestions in team discussions

## 📞 Getting Help

When encountering problems, you can:

1. Check the "Common Issues" section of the relevant chapter
2. Search the project's Issues
3. Seek help from team members
4. Refer to official documentation and community resources

---

**Start your build journey!** Choose the guide section that best fits your current needs and begin reading. 