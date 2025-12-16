# TypeScript 配置指南

## 项目结构

本项目使用 TypeScript Project References 来管理多包（monorepo）的类型检查和构建。

## 配置文件说明

### 1. `tsconfig.base.json` - 基础配置

包含所有子项目共享的 TypeScript 编译选项，如：
- 目标版本（target）
- 模块系统（module）
- 严格模式（strict）
- 其他编译器选项

所有子项目都应该继承这个基础配置。

### 2. `tsconfig.json` - 根配置

根目录的配置文件，主要作用：
- 继承 `tsconfig.base.json`
- 使用 `references` 字段引用所有子项目
- 使用 `files: []` 表示根配置本身不包含任何文件
- 用于协调整个项目的类型检查

### 3. 子项目配置 `packages/*/tsconfig.json`

每个子项目的配置特点：
- 继承 `../../tsconfig.base.json`
- 启用 `composite: true`（必需，用于 Project References）
- 设置 `rootDir` 和 `outDir`
- 配置独立的 `tsBuildInfoFile`
- 可以覆盖基础配置中的特定选项

### 4. `tsconfig.make.json` - 构建脚本配置

专门用于 `make` 目录和根目录工具脚本的配置：
- 包含 `make` 目录和 `vitest.config.ts`
- 引用需要的子项目（如 `fe-release`）
- 排除 `create-app/templates` 目录

## 使用方法

### 类型检查（不生成文件）

```bash
# 检查所有项目
pnpm tsc --noEmit

# 或使用 npx
npx tsc --noEmit
```

### 构建所有项目

```bash
# 增量构建
pnpm tsc --build

# 强制重新构建
pnpm tsc --build --force

# 清理构建产物
pnpm tsc --build --clean
```

### 构建特定项目

```bash
# 构建单个项目及其依赖
pnpm tsc --build packages/fe-corekit
```

### 查看构建顺序（不实际构建）

```bash
pnpm tsc --build --dry
```

## 排除目录说明

以下目录被排除在类型检查之外：
- `**/node_modules/*` - 依赖包
- `**/dist` - 构建输出
- `**/build` - 构建输出
- `packages/create-app/templates` - 项目模板（包含示例代码，不需要检查）

## 添加新的子包

当添加新的子包时，需要：

1. 在新包目录下创建 `tsconfig.json`：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": ".",
    "outDir": "dist",
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.tsbuildinfo"
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules"]
}
```

2. 在根目录 `tsconfig.json` 的 `references` 数组中添加新包的引用：

```json
{
  "references": [
    // ... 其他引用
    { "path": "./packages/your-new-package" }
  ]
}
```

## 项目依赖关系

如果一个子项目依赖另一个子项目，需要在该项目的 `tsconfig.json` 中添加 `references`：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    // ... 其他选项
  },
  "references": [
    { "path": "../other-package" }
  ]
}
```

## 优势

使用 Project References 的好处：
1. **更快的类型检查**：只检查修改过的项目
2. **更好的代码组织**：清晰的项目依赖关系
3. **增量构建**：只重新构建需要的部分
4. **强制依赖顺序**：确保依赖项先于依赖者构建
5. **更好的编辑器支持**：IDE 可以更好地理解项目结构

## 构建工具集成

### 在 Composite 项目中使用 tsup

本项目使用 **tsup**（或其他打包工具如 rollup）进行包构建，而不是 `tsc`。但我们仍然在 `tsconfig.json` 中启用 `composite: true` 以获得 IDE 性能优势。

#### 为什么在使用 tsup 时保留 Composite？

尽管 tsup 不使用 TypeScript 的增量编译：
1. **IDE 性能**：VSCode 的 TypeScript Language Server 从 composite 模式中受益
2. **更快的类型检查**：跨包类型检查显著加快
3. **更好的导航**："转到定义"跳转到源文件而不是 `.d.ts`
4. **清晰的依赖关系**：强制显式声明包依赖关系

#### tsup 的 DTS 生成配置

当 tsup 使用 `dts: true` 生成 `.d.ts` 文件时，它内部会使用 TypeScript 编译器。为避免与 `composite: true` 冲突，需要如下配置 tsup：

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: 'esm',
    dts: {
      compilerOptions: {
        composite: false  // 在 dts 生成时禁用 composite
      }
    },
    outDir: 'dist'
  }
]);
```

**为什么在 tsup 中禁用 composite？**

TypeScript 的 `composite: true` 要求严格的文件列表验证。当 tsup 生成声明文件时，可能会遇到文件解析问题。仅在 dts 生成时禁用 `composite`：
- ✅ 保留 IDE 优势（主 `tsconfig.json` 仍有 `composite: true`）
- ✅ 允许 tsup 正常生成 `.d.ts` 文件
- ✅ 不影响最终构建产物

#### 构建 vs 类型检查

```bash
# 类型检查（使用带 composite: true 的 tsconfig.json）
pnpm tsc --noEmit

# 构建包（使用 tsup/rollup，dts 生成时 composite: false）
pnpm nx run-many --target=build --all
```

### 配置总结

| 场景 | 配置 | 用途 |
|------|------|------|
| **IDE 类型检查** | `tsconfig.json` 的 `composite: true` | 快速的跨包类型检查 |
| **包构建** | `tsup.config.ts` 使用打包工具 | 生产环境构建 |
| **DTS 生成** | `dts: { compilerOptions: { composite: false } }` | 生成类型声明文件 |
| **包依赖关系** | `tsconfig.json` 的 `references` | 声明包间依赖关系 |

## 注意事项

1. 启用 `composite: true` 后，TypeScript 会生成 `.tsbuildinfo` 文件用于增量编译
2. 跨项目引用时，TypeScript 会使用编译后的 `.d.ts` 文件而不是源文件
3. 修改 `tsconfig.json` 后，建议运行 `tsc --build --clean` 清理旧的构建信息
4. `tsconfig.json` 中的 `composite` 设置用于 IDE/类型检查；tsup 使用自己的配置进行构建
5. 如果在 dts 生成时遇到 `TS6307` 错误，请确保在 tsup 的 dts 选项中设置了 `composite: false`

