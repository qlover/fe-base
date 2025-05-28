# 如何增加一个子包

本文档详细介绍如何在 fe-base 项目中添加新的子包，包括手动创建和使用 nx 工具创建两种方式。

## 📋 目录

- [创建方式选择](#-创建方式选择)
- [手动创建子包](#-手动创建子包)
- [使用 nx 创建](#-使用-nx-创建)
- [配置文件详解](#-配置文件详解)
- [最佳实践](#-最佳实践)
- [常见问题](#-常见问题)

## 🎯 创建方式选择

### 手动创建 vs nx 创建

| 特性         | 手动创建                | nx 创建             |
| ------------ | ----------------------- | ------------------- |
| **灵活性**   | ⭐⭐⭐⭐⭐ 完全自定义   | ⭐⭐⭐ 基于模板     |
| **速度**     | ⭐⭐ 需要手动配置       | ⭐⭐⭐⭐⭐ 快速生成 |
| **学习成本** | ⭐⭐⭐ 需要了解配置     | ⭐⭐⭐⭐ 相对简单   |
| **定制化**   | ⭐⭐⭐⭐⭐ 任意构建工具 | ⭐⭐⭐ 预设选项     |

**推荐选择**：

- 🚀 **快速开发**: 使用 nx 创建
- 🔧 **特殊需求**: 手动创建（如需要特定构建工具）

## 🛠️ 手动创建子包

### 第一步：创建包目录结构

```bash
# 在 packages 目录下创建新包
cd packages
mkdir my-new-package
cd my-new-package

# 创建标准目录结构
mkdir src
mkdir __tests__
mkdir __mocks__
mkdir dist
```

### 第二步：创建核心配置文件

#### 2.1 创建 package.json

```bash
# 创建 package.json
touch package.json
```

```json
{
  "name": "@qlover/my-new-package",
  "version": "0.1.0",
  "type": "module",
  "private": false,
  "description": "你的包描述",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": [
    "dist",
    "package.json",
    "README.md",
    "README_EN.md",
    "CHANGELOG.md"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/qlover/fe-base.git",
    "directory": "packages/my-new-package"
  },
  "homepage": "https://github.com/qlover/fe-base#readme",
  "keywords": ["frontend toolkit", "my-new-package", "你的关键词"],
  "author": "你的名字",
  "license": "ISC",
  "publishConfig": {
    "access": "public"
  },
  "devDependencies": {
    "typescript": "workspace:*",
    "tsup": "workspace:*",
    "vitest": "workspace:*"
  }
}
```

#### 2.2 创建 TypeScript 配置

```bash
# 创建 tsconfig.json
touch tsconfig.json
```

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "__tests__", "**/*.test.ts"]
}
```

#### 2.3 创建构建配置

```bash
# 创建 tsup.config.ts
touch tsup.config.ts
```

```typescript
import { defineConfig } from 'tsup';

export default defineConfig([
  // 主构建配置
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: false,
    sourcemap: true,
    clean: true,
    minify: process.env.NODE_ENV === 'production',
    outDir: 'dist'
  },
  // 类型定义构建
  {
    entry: ['src/index.ts'],
    format: 'esm',
    dts: true,
    outDir: 'dist'
  }
]);
```

### 第三步：创建源码文件

#### 3.1 创建主入口文件

```bash
# 创建 src/index.ts
touch src/index.ts
```

```typescript
// src/index.ts
/**
 * @qlover/my-new-package
 *
 * 你的包描述
 *
 * @author 你的名字
 * @version 0.1.0
 */

// 导出主要功能
export { MyMainClass } from './my-main-class';
export { myUtilFunction } from './utils';

// 导出类型定义
export type { MyMainClassOptions, MyUtilOptions } from './types';

// 默认导出
export { MyMainClass as default } from './my-main-class';
```

#### 3.2 创建核心功能文件

```bash
# 创建核心类文件
touch src/my-main-class.ts
touch src/utils.ts
touch src/types.ts
```

```typescript
// src/types.ts
export interface MyMainClassOptions {
  // 配置选项
  enabled?: boolean;
  timeout?: number;
}

export interface MyUtilOptions {
  // 工具函数选项
  debug?: boolean;
}
```

```typescript
// src/my-main-class.ts
import type { MyMainClassOptions } from './types';

export class MyMainClass {
  private options: Required<MyMainClassOptions>;

  constructor(options: MyMainClassOptions = {}) {
    this.options = {
      enabled: true,
      timeout: 5000,
      ...options
    };
  }

  public doSomething(): string {
    if (!this.options.enabled) {
      return 'disabled';
    }
    return 'success';
  }
}
```

```typescript
// src/utils.ts
import type { MyUtilOptions } from './types';

export function myUtilFunction(input: string, options: MyUtilOptions = {}): string {
  const { debug = false } = options;
  
  if (debug) {
    console.log('Processing:', input);
  }
  
  return input.toUpperCase();
}
```

### 第四步：创建测试文件

#### 4.1 创建单元测试

```bash
# 创建测试文件
touch __tests__/my-main-class.test.ts
touch __tests__/utils.test.ts
```

```typescript
// __tests__/my-main-class.test.ts
import { describe, it, expect } from 'vitest';
import { MyMainClass } from '../src/my-main-class';

describe('MyMainClass', () => {
  it('should create instance with default options', () => {
    const instance = new MyMainClass();
    expect(instance).toBeInstanceOf(MyMainClass);
  });

  it('should return success when enabled', () => {
    const instance = new MyMainClass({ enabled: true });
    expect(instance.doSomething()).toBe('success');
  });

  it('should return disabled when disabled', () => {
    const instance = new MyMainClass({ enabled: false });
    expect(instance.doSomething()).toBe('disabled');
  });
});
```

```typescript
// __tests__/utils.test.ts
import { describe, it, expect, vi } from 'vitest';
import { myUtilFunction } from '../src/utils';

describe('myUtilFunction', () => {
  it('should convert string to uppercase', () => {
    expect(myUtilFunction('hello')).toBe('HELLO');
  });

  it('should log debug info when debug is enabled', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    myUtilFunction('test', { debug: true });
    
    expect(consoleSpy).toHaveBeenCalledWith('Processing:', 'test');
    consoleSpy.mockRestore();
  });
});
```

### 第五步：创建文档文件

#### 5.1 创建 README.md

```bash
touch README.md
```

```markdown
# @qlover/my-new-package

你的包的简短描述

## 安装

```bash
npm install @qlover/my-new-package
# 或
pnpm add @qlover/my-new-package
```

## 使用

```typescript
import { MyMainClass } from '@qlover/my-new-package';

const instance = new MyMainClass({
  enabled: true,
  timeout: 3000
});

console.log(instance.doSomething()); // 'success'
```

## API

### MyMainClass

主要功能类

#### 构造函数

```typescript
new MyMainClass(options?: MyMainClassOptions)
```

#### 方法

- `doSomething(): string` - 执行主要功能

## 许可证

ISC
```

#### 5.2 创建 CHANGELOG.md

```bash
touch CHANGELOG.md
```

```markdown
# @qlover/my-new-package

## [0.1.0] - 2024-01-01

### Added
- 初始版本
- 添加 MyMainClass 类
- 添加工具函数
```

### 第六步：构建和测试

```bash
# 安装依赖
pnpm install

# 构建包
pnpm build

# 运行测试
pnpm test

# 检查构建产物
ls dist/
# 应该看到：index.js, index.cjs, index.d.ts
```

## 🚀 使用 nx 创建

### 安装 nx 生成器

```bash
# 如果还没有安装 nx
pnpm add -D @nx/js

# 生成新的库
nx generate @nx/js:library my-new-package --directory=packages/my-new-package
```

### nx 生成的目录结构

```
packages/my-new-package/
├── src/
│   ├── index.ts
│   └── lib/
│       └── my-new-package.ts
├── project.json
├── tsconfig.json
├── tsconfig.lib.json
├── README.md
└── .eslintrc.json
```

### 自定义 nx 生成的包

#### 修改 project.json

```json
{
  "name": "my-new-package",
  "sourceRoot": "packages/my-new-package/src",
  "projectType": "library",
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "packages/my-new-package/dist",
        "main": "packages/my-new-package/src/index.ts",
        "tsConfig": "packages/my-new-package/tsconfig.lib.json",
        "assets": ["packages/my-new-package/*.md"]
      }
    },
    "test": {
      "executor": "@nx/vite:test",
      "outputs": ["{options.reportsDirectory}"],
      "options": {
        "passWithNoTests": true,
        "reportsDirectory": "coverage/packages/my-new-package"
      }
    }
  }
}
```

## 📋 配置文件详解

### package.json 关键字段

| 字段 | 说明 | 示例 |
|------|------|------|
| `name`    | 包名，必须以 `@qlover/` 开头 | `@qlover/my-package` |
| `version` | 版本号，遵循语义化版本 | `0.1.0` |
| `type`    | 模块类型，设为 `module` | `module` |
| `main`    | CommonJS 入口 | `./dist/index.cjs` |
| `module`  | ES Module 入口 | `./dist/index.js` |
| `types`   | TypeScript 类型定义 | `./dist/index.d.ts` |
| `exports` | 现代模块导出配置 | 见上面示例 |

### tsconfig.json 配置

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "__tests__"]
}
```

### tsup.config.ts 配置选项

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: process.env.NODE_ENV === 'production',
  splitting: false,
  outDir: 'dist',
  target: 'es2020',
  platform: 'neutral'
});
```

## 📁 目录结构规范

### 推荐的包结构

```
@qlover/package-name/
├── src/                    # 源码目录
│   ├── index.ts           # 主入口文件
│   ├── types.ts           # 类型定义
│   ├── utils.ts           # 工具函数
│   └── components/        # 组件目录（如果有）
├── __tests__/             # 测试目录
│   ├── index.test.ts      # 主测试文件
│   └── utils.test.ts      # 工具测试文件
├── __mocks__/             # Mock 文件
├── dist/                  # 构建产物（自动生成）
├── docs/                  # 文档目录（可选）
├── examples/              # 示例代码（可选）
├── package.json           # 包配置
├── tsconfig.json          # TS 配置
├── tsup.config.ts         # 构建配置
├── README.md              # 说明文档
├── README_EN.md           # 英文文档（可选）
└── CHANGELOG.md           # 变更日志
```

## 🎯 最佳实践

### 1. 命名规范

- **包名**: 使用 kebab-case，如 `@qlover/my-package`
- **文件名**: 使用 kebab-case，如 `my-component.ts`
- **类名**: 使用 PascalCase，如 `MyComponent`
- **函数名**: 使用 camelCase，如 `myFunction`

### 2. 导出规范

```typescript
// ✅ 推荐：命名导出 + 默认导出
export { MyClass } from './my-class';
export { myFunction } from './utils';
export type { MyOptions } from './types';
export { MyClass as default } from './my-class';

// ❌ 避免：只有默认导出
export default {
  MyClass,
  myFunction
};
```

### 3. 类型定义

```typescript
// ✅ 推荐：详细的类型定义
export interface MyClassOptions {
  /** 是否启用功能 */
  enabled?: boolean;
  /** 超时时间（毫秒） */
  timeout?: number;
}

// ❌ 避免：any 类型
export interface MyClassOptions {
  options?: any;
}
```

### 4. 文档规范

```typescript
/**
 * 我的工具类
 * 
 * @example
 * ```typescript
 * const instance = new MyClass({ enabled: true });
 * console.log(instance.doSomething());
 * ```
 */
export class MyClass {
  /**
   * 执行某个操作
   * 
   * @param input - 输入参数
   * @returns 处理结果
   */
  public doSomething(input: string): string {
    return input;
  }
}
```

### 5. 测试覆盖

```typescript
// 测试所有公共 API
describe('MyClass', () => {
  // 正常情况
  it('should work with valid input', () => {});
  
  // 边界情况
  it('should handle empty input', () => {});
  
  // 错误情况
  it('should throw error with invalid input', () => {});
});
```

## ❓ 常见问题

### Q: 包名应该如何命名？

**A**: 包名必须以 `@qlover/` 开头，使用 kebab-case 格式：

```bash
✅ @qlover/fe-corekit
✅ @qlover/ui-components
✅ @qlover/data-utils

❌ @qlover/FeCorekit
❌ @qlover/UI_Components
```

### Q: 如何在包之间添加依赖？

**A**: 使用 `workspace:*` 语法：

```json
{
  "dependencies": {
    "@qlover/other-package": "workspace:*"
  }
}
```

### Q: 构建失败怎么办？

**A**: 检查以下几点：

1. 确保 TypeScript 配置正确
2. 检查依赖是否已安装
3. 确保源码没有语法错误
4. 查看构建日志中的具体错误信息

### Q: 如何发布包？

**A**: 使用项目的发布流程：

```bash
# 添加变更记录
pnpm changeset

# 发布
pnpm changeset publish
```

### Q: 如何在本地测试包？

**A**: 可以使用 workspace 依赖：

```bash
# 在其他包中添加依赖
pnpm add @qlover/my-new-package@workspace:*

# 或者在根目录构建后测试
pnpm build
pnpm test
```

### Q: 包的版本如何管理？

**A**: 使用 Changesets 进行版本管理：

1. 开发完成后运行 `pnpm changeset`
2. 选择变更类型（patch/minor/major）
3. 填写变更描述
4. 提交代码
5. 发布时运行 `pnpm changeset publish`

## 📚 相关文档

- [项目构建与依赖管理](./project-builder.md)
- [测试指南](./testing-guide.md)
- [打包格式指南](./build-formats.md)
- [项目发布](./project-release.md)
