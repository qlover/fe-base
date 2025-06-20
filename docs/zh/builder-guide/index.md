# 构建系统指南

欢迎来到 fe-base 项目的构建系统指南。本指南将帮助你全面了解和掌握项目的构建、打包和依赖管理。

## 📖 指南概述

fe-base 采用现代化的 monorepo 架构，使用 pnpm workspace 管理多个相关包。本指南分为以下几个部分：

### 🏗️ [项目构建系统](./project-build-system.md)
了解 fe-base 的构建架构和日常开发流程

**主要内容**：
- Monorepo 架构介绍
- pnpm Workspace 配置和使用
- 构建命令详解
- 开发工作流最佳实践
- 构建相关问题排查

**适合人群**：
- 新加入项目的开发者
- 需要了解构建流程的贡献者
- 想要优化开发效率的团队成员

### 📦 [依赖管理策略](./dependency-management.md)
掌握复杂的依赖管理策略和最佳实践

**主要内容**：
- 依赖类型详解（dependencies, devDependencies, peerDependencies）
- 本地包依赖管理
- 依赖打包策略决策
- 不同场景的依赖分类
- 版本管理和冲突解决

**适合人群**：
- 包维护者
- 需要发布 npm 包的开发者
- 关注包体积和性能的开发者

### ⚙️ [打包格式与配置](./build-formats-config.md)
深入了解打包格式选择和工具配置

**主要内容**：
- 输出格式详解（CJS, ESM, UMD）
- 使用场景选择指南
- 构建工具配置（tsup, Vite, Rollup）
- package.json 配置最佳实践
- 构建优化技巧

**适合人群**：
- 库开发者
- 需要支持多环境的包维护者
- 关注兼容性的开发者

## 🚀 快速开始

如果你是第一次接触本项目，建议按以下顺序阅读：

1. **新手开发者**：
   ```
   项目构建系统 → 依赖管理策略 → 打包格式与配置
   ```

2. **有经验的开发者**：
   ```
   依赖管理策略 → 打包格式与配置 → 项目构建系统（参考）
   ```

3. **包维护者**：
   ```
   依赖管理策略 → 打包格式与配置 → 项目构建系统（深入）
   ```

## 📋 常见场景速查

### 我想要...

- **设置开发环境** → [项目构建系统 - 开发工作流](./project-build-system.md#开发工作流)
- **添加新的依赖** → [依赖管理策略 - 依赖类型选择](./dependency-management.md#依赖类型详解)
- **发布一个新包** → [打包格式与配置 - 使用场景选择](./build-formats-config.md#使用场景选择)
- **解决构建错误** → [项目构建系统 - 常见问题](./project-build-system.md#常见问题)
- **优化包体积** → [依赖管理策略 - 打包策略](./dependency-management.md#依赖打包策略)
- **配置多格式输出** → [打包格式与配置 - 构建工具配置](./build-formats-config.md#构建工具配置)

## 🛠️ 核心概念

在开始之前，了解以下核心概念会很有帮助：

### Monorepo
一个仓库管理多个相关包的架构模式，提供统一的依赖管理和构建流程。

### Workspace
pnpm 的工作空间功能，允许在单个仓库中管理多个包，并共享依赖。

### 依赖外部化
在打包时不将某些依赖包含在最终 bundle 中，而是要求用户环境提供这些依赖。

### Tree-shaking
构建工具自动移除未使用代码的优化技术，减少最终包体积。

## 📚 相关资源

### 官方文档
- [pnpm Workspace](https://pnpm.io/workspaces)
- [tsup 文档](https://tsup.egoist.dev/)
- [Vite 库模式](https://vitejs.dev/guide/build.html#library-mode)

### 工具链
- [pnpm](https://pnpm.io/) - 包管理器
- [nx](https://nx.dev/) - 构建系统
- [tsup](https://tsup.egoist.dev/) - TypeScript 构建工具
- [Vite](https://vitejs.dev/) - 现代构建工具

### 社区资源
- [npm 包发布最佳实践](https://docs.npmjs.com/packages-and-modules/)
- [JavaScript 模块系统指南](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

## 🤝 贡献指南

如果你发现文档中有错误或需要改进的地方，欢迎：

1. 提交 Issue 报告问题
2. 提交 Pull Request 改进文档
3. 在团队讨论中提出建议

## 📞 获取帮助

遇到问题时，你可以：

1. 查看对应章节的"常见问题"部分
2. 搜索项目的 Issues
3. 向团队成员寻求帮助
4. 参考官方文档和社区资源

---

**开始你的构建之旅吧！** 选择最适合你当前需求的指南章节开始阅读。
