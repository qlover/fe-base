# 项目构建与依赖管理指南

本文档介绍 fe-base 项目的构建系统和依赖管理。

## 📋 目录

- [构建系统概述](#构建系统概述)
- [pnpm Workspace 管理](#-pnpm-workspace-管理)
- [构建命令详解](#-构建命令详解)
- [依赖管理策略](#-依赖管理策略)
- [常见问题](#-常见问题)

## 构建系统概述

fe-base 采用 **monorepo** 架构，即在一个仓库中管理多个相关的包。这种架构的优势：

- **统一管理**：所有包使用相同的构建工具和配置
- **依赖共享**：包之间可以直接引用，无需发布到 npm
- **版本同步**：可以统一管理所有包的版本发布

### 主要技术栈

| 工具 | 作用 | 版本 |
|------|------|------|
| **pnpm** | 包管理器，支持 workspace | >= 8.0.0 |
| **nx** | 构建系统，任务编排和缓存 | 20.6.4 |
| **tsup** | TypeScript 构建工具 | ^8.4.0 |
| **rollup** | 模块打包工具 | ^4.24.2 |
| **TypeScript** | 类型系统 | ~5.4.5 |
| **Vite** | 开发服务器和构建工具 | ^6.1.0 |

### 为什么选择这些工具？

- **pnpm**: 相比 npm/yarn，节省磁盘空间，支持 workspace 功能
- **nx**: 提供增量构建和缓存，大幅提升构建速度
- **tsup**: 基于 esbuild，构建速度快，配置简单
- **rollup**: 专业的模块打包工具，支持多种输出格式
- **TypeScript**: 提供类型安全，提升代码质量
- **Vite**: 现代化的开发工具，热更新快

## 📦 pnpm Workspace 管理

### Workspace 配置

```yaml
# pnpm-workspace.yaml
packages:
  - packages/*
```

这个配置告诉 pnpm，`packages/` 目录下的每个子目录都是一个独立的包。

### 递归构建机制

pnpm 的递归模式能够自动按依赖顺序执行构建：

```bash
# 递归构建所有包
pnpm -r run build
```

**为什么需要递归构建？**
- 包之间存在依赖关系，必须按正确顺序构建
- 如果包 A 依赖包 B，那么必须先构建包 B，再构建包 A
- pnpm 会自动分析依赖关系，确保构建顺序正确

### workspace:* 依赖机制

本地包依赖使用 `workspace:*`：

```json
{
  "dependencies": {
    "@qlover/fe-corekit": "workspace:*"
  }
}
```

**workspace:* 的工作原理：**
1. **开发阶段**：pnpm 创建软链接指向本地包
2. **发布阶段**：自动替换为具体版本号（如 `^1.2.3`）
3. **实时同步**：本地包的修改会立即反映到依赖方

**重要**：安装依赖后必须立即构建，因为本地包需要构建产物：

```bash
# ❌ 错误：只安装依赖，不构建
pnpm install

# ✅ 正确：安装后立即构建
pnpm install && pnpm build
```

**为什么必须构建？**
- TypeScript 源码需要编译成 JavaScript
- 其他包引用的是 `dist/` 目录下的构建产物，不是 `src/` 源码
- 没有构建产物会导致 "找不到模块" 错误

## 🔧 构建命令详解

### 主要构建命令

```bash
# 完整构建所有包（推荐）
pnpm build

# 增量构建（仅构建变更的包）
pnpm nx:build

# 清理构建产物
pnpm clean:build

# 构建特定包
pnpm --filter @qlover/fe-corekit build
pnpm --filter @qlover/fe-scripts build
```

### 构建脚本说明

```json
{
  "scripts": {
    "build": "pnpm -r --workspace-concurrency=4 run build && pnpm rebuild",
    "nx:build": "nx affected:build",
    "clean:build": "fe-clean -f packages/*/dist -r",
    "build:fe-release": "pnpm --filter @qlover/fe-release build",
    "build:logger": "pnpm --filter @qlover/logger build"
  }
}
```

**各命令的作用：**
- `pnpm build`: 并发构建所有包，然后重建确保依赖正确
- `pnpm nx:build`: 使用 nx 增量构建，只构建变更的包
- `pnpm clean:build`: 清理所有包的 dist 目录
- `pnpm build:fe-release`: 单独构建发布工具
- `pnpm build:logger`: 单独构建日志工具

**为什么需要 `pnpm rebuild`？**
- 确保所有包的依赖关系都是最新的
- 重新链接本地包的依赖
- 解决可能的依赖缓存问题

**什么时候用增量构建？**
- 开发阶段，只想构建修改过的包
- 大型项目中，全量构建耗时较长
- CI/CD 中，只构建受影响的包

## 🔗 依赖管理策略

### 依赖类型

1. **本地包依赖**：使用 `workspace:*`
   ```json
   {
     "dependencies": {
       "@qlover/fe-corekit": "workspace:*",
       "@qlover/logger": "workspace:*",
       "@qlover/env-loader": "workspace:*"
     }
   }
   ```
   **用途**：引用同一仓库中的其他包

2. **外部包依赖**：使用具体版本
   ```json
   {
     "dependencies": {
       "lodash": "^4.17.21",
       "commander": "^11.0.0"
     }
   }
   ```
   **用途**：引用 npm 上的第三方包

3. **开发依赖**：构建和测试工具
   ```json
   {
     "devDependencies": {
       "typescript": "~5.4.5",
       "tsup": "^8.4.0",
       "@qlover/env-loader": "workspace:*"
     }
   }
   ```
   **用途**：只在开发和构建时需要，不会打包到最终产物

### 推荐的安装流程

```bash
# 1. 安装依赖
pnpm install

# 2. 立即构建（重要！）
pnpm build

# 3. 验证构建
pnpm test
```

**为什么要按这个顺序？**
1. **先安装**：确保所有依赖都已下载
2. **再构建**：生成其他包需要的构建产物
3. **最后测试**：验证所有包都能正常工作

## ❓ 常见问题

### 1. 依赖找不到模块

**问题**：`Error: Cannot find module '@qlover/fe-corekit'`

**原因**：被依赖的包没有构建，缺少 `dist/` 目录

**解决**：
```bash
# 检查依赖包是否已构建
ls packages/fe-corekit/dist/

# 重新构建依赖包
pnpm --filter @qlover/fe-corekit build

# 或重新构建所有包
pnpm build
```

### 2. 类型定义缺失

**问题**：`TS2307: Cannot find module '@qlover/logger'`

**原因**：TypeScript 找不到类型定义文件（`.d.ts`）

**解决**：
```bash
# 重新生成类型定义
pnpm --filter @qlover/logger build
```

### 3. 构建缓存问题

**问题**：修改代码后构建产物没有更新

**原因**：构建工具使用了缓存，没有检测到文件变化

**解决**：
```bash
# 清理构建缓存
pnpm clean:build && pnpm build

# 清理 nx 缓存
nx reset
```

### 4. 依赖版本冲突

**原因**：不同包依赖了同一个库的不同版本

**解决**：
```bash
# 检查依赖树
pnpm list --filter @qlover/fe-corekit

# 检查为什么安装了某个包
pnpm why package-name

# 重新安装
rm -rf node_modules && pnpm install
```

## 🎯 最佳实践

### 开发工作流

1. **初始化项目**：
   ```bash
   pnpm install && pnpm build  # 安装依赖并构建
   ```

2. **日常开发**：
   ```bash
   pnpm nx:build              # 增量构建变更的包
   pnpm test                  # 运行测试
   ```

3. **监听模式开发**：
   ```bash
   cd packages/fe-corekit
   pnpm dev  # 启动监听模式，文件变化时自动重新构建
   ```

4. **提交前检查**：
   ```bash
   pnpm lint && pnpm build && pnpm test
   ```

### 为什么要遵循这个工作流？

- **初始化**：确保环境正确，所有依赖都能正常工作
- **增量构建**：提高开发效率，避免不必要的重复构建
- **监听模式**：实时反馈，提升开发体验
- **提交前检查**：确保代码质量，避免破坏性变更

## 📚 相关文档

- [如何增加一个子包](./how-to-add-a-subpackage.md)
- [测试指南](./testing-guide.md)
- [打包格式指南](./build-formats.md)
- [项目发布](./project-release.md)
