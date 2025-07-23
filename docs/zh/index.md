# fe-base 中文文档

欢迎使用 fe-base 前端基础工具包！这里是完整的中文开发文档。

## 📋 文档导航

### 🏗️ 构建系统指南

全面了解 fe-base 的 monorepo 架构和构建系统：

- **[构建系统概览](./builder-guide/index.md)** - 整体架构和技术栈介绍
- **[项目构建系统](./builder-guide/project-build-system.md)** - monorepo 架构、pnpm workspace、构建命令
- **[依赖管理策略](./builder-guide/dependency-management.md)** - 依赖类型、本地包管理、打包策略
- **[打包格式配置](./builder-guide/build-formats-config.md)** - 输出格式选择、构建工具配置、优化策略

### 📝 开发规范

项目开发的标准和最佳实践：

- **[提交规范](./commit-convention.md)** - Git 提交信息规范和工具配置
- **[测试指南](./testing-guide.md)** - 测试策略、工具使用和最佳实践
- **[代码注释](./code-comments-guide.md)** - 代码注释，格式使用指南

### 🚀 项目管理

项目发布、包管理和扩展：

- **[项目发布](./project-release.md)** - 版本管理、发布流程和自动化
- **[如何增加一个子包](./how-to-add-a-subpackage.md)** - 新包创建、配置和发布流程

## 🎯 快速开始

### 环境准备

```bash
# 确保环境要求
node --version  # >= 18.19.0
pnpm --version  # >= 8.0.0
```

### 项目初始化

```bash
# 克隆项目
git clone https://github.com/qlover/fe-base.git
cd fe-base

# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 运行测试
pnpm test
```

### 使用工具包

```bash
# 安装核心工具包
pnpm add @qlover/fe-corekit

# 安装开发脚本
pnpm add @qlover/fe-scripts

# 安装日志工具
pnpm add @qlover/logger
```

## 📦 包列表

### 核心工具包

- **[@qlover/fe-corekit](../../packages/fe-corekit/README.md)** - 前端核心工具库，提供存储、序列化、请求等功能
- **[@qlover/corekit-node](../../packages/corekit-node/README.md)** - Node.js 环境核心工具
- **[@qlover/corekit-bridge](../../packages/corekit-bridge/README.md)** - 核心工具包桥接器
- **[@qlover/logger](../../packages/logger/README.md)** - 灵活的日志记录系统

### 开发工具

- **[@qlover/fe-scripts](../../packages/fe-scripts/README.md)** - 前端开发脚本工具集
- **[@qlover/code2markdown](../../packages/fe-code2markdown/README.md)** - 代码转 Markdown 文档生成工具
- **[@qlover/fe-release](../../packages/fe-release/README.md)** - 项目发布管理工具
- **[@qlover/create-app](../../packages/create-app/README.md)** - 应用脚手架生成工具

### 配置和标准

- **[@qlover/fe-standard](../../packages/fe-standard/README.md)** - 前端开发标准和规范
- **[@qlover/eslint-plugin-fe-dev](../../packages/eslint-plugin-fe-dev/README.md)** - 前端开发 ESLint 插件
- **[@qlover/env-loader](../../packages/env-loader/README.md)** - 环境变量加载工具

### 支持工具

- **[@qlover/scripts-context](../../packages/scripts-context/README.md)** - 脚本执行上下文工具

## 🔧 常用命令

### 开发命令

```bash
# 构建所有包
pnpm build

# 构建指定包
pnpm build --filter @qlover/fe-corekit

# 代码检查
pnpm lint

# 格式化代码
pnpm prettier

# 运行测试
pnpm test
```

### 发布命令

```bash
# 添加变更记录
pnpm changeset

# 发布版本
pnpm changeset version
pnpm changeset publish
```

## ❓ 常见问题

### 构建相关

- **构建失败** - 查看 [项目构建系统](./builder-guide/project-build-system.md#常见问题)
- **依赖问题** - 查看 [依赖管理策略](./builder-guide/dependency-management.md#常见问题)
- **格式配置** - 查看 [打包格式配置](./builder-guide/build-formats-config.md#常见问题)

### 开发相关

- **如何添加新包** - 查看 [如何增加一个子包](./how-to-add-a-subpackage.md)
- **测试相关** - 查看 [测试指南](./testing-guide.md)
- **提交规范** - 查看 [提交规范](./commit-convention.md)

## 🌐 其他语言版本

- **[🇺🇸 English Documentation](../en/index.md)** - Complete English documentation
- **[🏠 返回根目录](../../README.md)** - 返回项目根目录

## 🤝 参与贡献

我们欢迎各种形式的贡献：

1. **报告问题** - 在 [GitHub Issues](https://github.com/qlover/fe-base/issues) 中提交
2. **改进文档** - 帮助完善文档内容
3. **代码贡献** - 提交 Pull Request
4. **功能建议** - 提出新的功能想法

## 📞 获取帮助

- **GitHub Issues** - [https://github.com/qlover/fe-base/issues](https://github.com/qlover/fe-base/issues)
- **文档问题** - 如果文档不清楚，请告诉我们
- **使用交流** - 与社区其他开发者交流经验

---

**开始使用** 👉 [构建系统指南](./builder-guide/) | [项目发布](./project-release.md) | [如何增加子包](./how-to-add-a-subpackage.md)
