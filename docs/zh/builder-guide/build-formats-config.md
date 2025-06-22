# 打包格式与配置

本文档详细介绍 fe-base 项目中的打包格式选择、工具配置和最佳实践。

## 📋 目录

- [打包格式详解](#打包格式详解)
- [构建工具配置](#构建工具配置)
- [package.json 配置](#package.json-配置)
- [高级配置技巧](#高级配置技巧)
- [性能优化](#性能优化)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

## 打包格式详解

### 格式对比

| 格式 | 使用场景 | 优点 | 缺点 |
|------|----------|------|------|
| **CJS** (CommonJS) | Node.js, 旧版浏览器 | 兼容性好，动态导入 | 体积较大，无 tree-shaking |
| **ESM** (ES Modules) | 现代浏览器, Node.js | tree-shaking, 静态分析 | 旧环境需要转换 |
| **UMD** (Universal) | CDN, 浏览器直接使用 | 通用兼容性 | 体积最大，配置复杂 |
| **IIFE** (立即执行) | 浏览器直接使用 | 简单，隔离作用域 | 不支持模块化 |

### 格式选择指南

#### 1. Node.js 包
```json
{
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",    // ESM 优先
      "require": "./dist/index.cjs"    // CJS 兼容
    }
  }
}
```

#### 2. 浏览器库
```json
{
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "unpkg": "dist/index.umd.js",
  "jsdelivr": "dist/index.umd.js",
  "types": "dist/index.d.ts"
}
```

#### 3. React 组件库
```json
{
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "sideEffects": false  // 启用 tree-shaking
}
```

### 格式特性详解

#### 1. CommonJS (CJS)
```javascript
// 导出
module.exports = {
  hello: 'world'
};

// 导入
const { hello } = require('./module');
```

**特点**：
- ✅ Node.js 原生支持
- ✅ 动态导入 (`require()`)
- ✅ 循环依赖处理
- ❌ 无 tree-shaking
- ❌ 异步加载复杂

#### 2. ES Modules (ESM)
```javascript
// 导出
export const hello = 'world';
export default { hello };

// 导入
import { hello } from './module';
import defaultExport from './module';
```

**特点**：
- ✅ 静态分析
- ✅ tree-shaking
- ✅ 异步导入 (`import()`)
- ✅ 现代浏览器原生支持
- ❌ 需要工具转换用于旧环境

#### 3. UMD (Universal Module Definition)
```javascript
// 自动适应环境
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['dependency'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('dependency'));
  } else {
    root.myModule = factory(root.dependency);
  }
}(this, function (dependency) {
  return { /* ... */ };
}));
```

**特点**：
- ✅ 通用兼容性
- ✅ AMD/CJS/全局变量
- ✅ 适合 CDN 分发
- ❌ 体积较大
- ❌ 配置复杂

#### 4. IIFE (Immediately Invoked Function Expression)
```javascript
var myModule = (function () {
  var privateVar = 'private';
  
  return {
    publicMethod: function () {
      return privateVar;
    }
  };
})();
```

**特点**：
- ✅ 作用域隔离
- ✅ 无需构建工具
- ✅ 浏览器直接使用
- ❌ 不支持模块化
- ❌ 全局命名空间污染

## 构建工具配置

### tsup 配置

#### 1. 基础配置
```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';
import pkg from './package.json';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  target: ['node18', 'es2020'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: Object.keys(pkg.peerDependencies || {})
});
```

#### 2. 多入口配置
```typescript
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
    utils: 'src/utils/index.ts'
  },
  format: ['cjs', 'esm'],
  dts: {
    entry: {
      index: 'src/index.ts',
      utils: 'src/utils/index.ts'
    }
  }
});
```

#### 3. 环境特定配置
```typescript
export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  minify: !options.watch,
  sourcemap: options.watch ? 'inline' : true,
  dts: !options.watch,
  clean: !options.watch
}));
```

### Rollup 配置

#### 1. 基础配置
```typescript
// rollup.config.js
import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig({
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/index.mjs',
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    typescript(),
    nodeResolve(),
    commonjs()
  ],
  external: ['react', 'react-dom']
});
```

#### 2. 多包配置
```typescript
// rollup.config.js
import { readdirSync } from 'fs';
import { join } from 'path';

const packagesDir = 'packages';
const packages = readdirSync(packagesDir);

export default packages.map(pkg => ({
  input: join(packagesDir, pkg, 'src/index.ts'),
  output: [
    {
      file: join(packagesDir, pkg, 'dist/index.cjs'),
      format: 'cjs'
    },
    {
      file: join(packagesDir, pkg, 'dist/index.mjs'),
      format: 'esm'
    }
  ],
  plugins: [
    typescript({
      tsconfig: join(packagesDir, pkg, 'tsconfig.json')
    }),
    nodeResolve(),
    commonjs()
  ]
}));
```

## package.json 配置

### 入口点配置详解

#### 1. 传统入口点
```json
{
  "main": "dist/index.cjs",          // CommonJS 入口
  "module": "dist/index.mjs",        // ES Modules 入口
  "browser": "dist/index.umd.js",    // 浏览器入口
  "types": "dist/index.d.ts",        // TypeScript 类型定义
  "unpkg": "dist/index.umd.js",      // CDN 入口
  "jsdelivr": "dist/index.umd.js"    // CDN 入口
}
```

#### 2. 现代 exports 配置
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "browser": "./dist/index.umd.js"
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    },
    "./package.json": "./package.json"
  }
}
```

#### 3. 条件导出配置
```json
{
  "exports": {
    ".": {
      "node": {
        "import": "./dist/index.node.mjs",
        "require": "./dist/index.node.cjs"
      },
      "browser": {
        "import": "./dist/index.browser.mjs",
        "require": "./dist/index.browser.cjs"
      },
      "default": "./dist/index.mjs"
    }
  }
}
```

#### 4. 完整的 package.json 配置示例
```json
{
  "name": "@qlover/my-package",
  "version": "1.0.0",
  "description": "A sample package",
  "keywords": ["utility", "typescript"],
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "files": [
    "dist",
    "README.md",
    "CHANGELOG.md"
  ],
  "engines": {
    "node": ">=18.0.0"
  },
  "sideEffects": false,
  "publishConfig": {
    "access": "public"
  }
}
```

### 重要字段说明

#### 1. `sideEffects` 字段
```json
{
  // 无副作用，支持 tree-shaking
  "sideEffects": false,
  
  // 或指定有副作用的文件
  "sideEffects": [
    "dist/polyfills.js",
    "*.css"
  ]
}
```

#### 2. `engines` 字段
```json
{
  "engines": {
    "node": ">=18.0.0",      // 最低 Node.js 版本
    "npm": ">=8.0.0",        // 最低 npm 版本
    "pnpm": ">=8.0.0"        // 最低 pnpm 版本
  }
}
```

#### 3. `files` 字段
```json
{
  "files": [
    "dist",              // 构建产物
    "src",               // 源码（可选）
    "README.md",         // 文档
    "CHANGELOG.md",      // 变更日志
    "LICENSE"            // 许可证
  ]
}
```

## 高级配置技巧

### 环境特定构建

#### 1. Node.js vs 浏览器构建
```typescript
// tsup.config.ts
export default defineConfig([
  // Node.js 版本
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    platform: 'node',
    target: 'node18',
    outDir: 'dist/node',
    external: ['fs', 'path']
  },
  // 浏览器版本
  {
    entry: ['src/index.browser.ts'],
    format: ['esm', 'umd'],
    platform: 'browser',
    target: 'es2020',
    outDir: 'dist/browser',
    globalName: 'MyLib'
  }
]);
```

#### 2. 开发 vs 生产构建
```typescript
export default defineConfig((options) => {
  const isDev = options.watch;
  
  return {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    minify: !isDev,
    sourcemap: isDev ? 'inline' : true,
    dts: !isDev,  // 开发时跳过类型生成
    onSuccess: isDev ? 'echo "Build completed"' : undefined
  };
});
```

### 代码分割策略

#### 1. 手动代码分割
```typescript
// src/index.ts
export { default as utils } from './utils';
export { default as helpers } from './helpers';

// 用户可以按需导入
import { utils } from 'my-package';
```

#### 2. 动态导入支持
```typescript
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  splitting: true,
  target: 'es2020',
  // 生成多个 chunk 文件
});
```

### 类型定义优化

#### 1. 类型定义生成配置
```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,      // 解析外部类型
    only: false,        // 同时生成 JS 和 .d.ts
    entry: ['src/index.ts', 'src/utils.ts']  // 多个入口点
  }
});
```

#### 2. 类型定义分离
```json
{
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/esm/index.mjs",
      "require": "./dist/cjs/index.cjs"
    }
  }
}
```

## 性能优化

### 构建性能优化

#### 1. 增量构建
```typescript
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  watch: process.env.NODE_ENV === 'development',
  // 开发时启用监听模式
});
```

#### 2. 并行构建
```bash
# package.json
{
  "scripts": {
    "build": "run-p build:*",
    "build:cjs": "tsup --format cjs",
    "build:esm": "tsup --format esm",
    "build:types": "tsc --emitDeclarationOnly"
  }
}
```

#### 3. 缓存优化
```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  // 启用 esbuild 缓存
  esbuildOptions: (options) => {
    options.cache = true;
  }
});
```

### 输出优化

#### 1. 文件体积优化
```typescript
export default defineConfig([
  // 开发版本
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    minify: false,
    outExtension: () => ({ js: '.development.mjs' })
  },
  // 生产版本
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    minify: true,
    outExtension: () => ({ js: '.production.mjs' })
  }
]);
```

#### 2. Tree-shaking 优化
```typescript
// 确保代码支持 tree-shaking
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  treeshake: true,
  // 标记为无副作用
  esbuildOptions: (options) => {
    options.treeShaking = true;
  }
});
```

## 最佳实践

### 构建配置最佳实践

#### 1. 统一的配置模板
```typescript
// scripts/build-config.ts
import { defineConfig, type Options } from 'tsup';
import pkg from '../package.json';

export function createBuildConfig(options: Partial<Options> = {}): Options {
  return {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    target: ['node18', 'es2020'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: Object.keys(pkg.peerDependencies || {}),
    outExtension: ({ format }) => ({
      js: format === 'cjs' ? '.cjs' : '.mjs'
    }),
    ...options
  };
}
```

#### 2. 包类型特定配置
```typescript
// packages/cli/tsup.config.ts
import { createBuildConfig } from '../../scripts/build-config';

export default defineConfig(
  createBuildConfig({
    format: ['cjs'],
    bundle: true,
    minify: true,
    outExtension: () => ({ js: '.cjs' })
  })
);
```

#### 3. 环境变量配置
```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  env: {
    NODE_ENV: 'production',
    PACKAGE_VERSION: process.env.npm_package_version
  }
});
```

### 发布配置最佳实践

#### 1. 发布前验证
```json
{
  "scripts": {
    "prepublishOnly": "pnpm build && pnpm test",
    "prepack": "clean-package",
    "postpack": "clean-package restore"
  }
}
```

#### 2. 文件包含策略
```json
{
  "files": [
    "dist",
    "!dist/**/*.test.*",
    "!dist/**/*.spec.*",
    "README.md",
    "CHANGELOG.md"
  ]
}
```

#### 3. 版本兼容性标识
```json
{
  "engines": {
    "node": ">=18.0.0"
  },
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead"
  ]
}
```

## 常见问题

### 构建配置问题

#### Q: 构建后的文件无法正确导入
**原因**：入口点配置不正确或格式不匹配

**解决方案**：
```json
{
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

#### Q: TypeScript 类型定义缺失
**原因**：没有生成或配置类型定义文件

**解决方案**：
```typescript
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,  // 生成类型定义
  // 或者
  dts: {
    entry: ['src/index.ts'],
    resolve: true
  }
});
```

### 格式兼容性问题

#### Q: ESM 模块在 CommonJS 环境中无法使用
**原因**：没有提供 CommonJS 格式的构建产物

**解决方案**：
```typescript
export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    outExtension: () => ({ js: '.cjs' })
  },
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    outExtension: () => ({ js: '.mjs' })
  }
]);
```

#### Q: UMD 格式在浏览器中报错
**原因**：全局变量名冲突或外部依赖配置错误

**解决方案**：
```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['umd'],
  globalName: 'MyUniqueLibName',  // 使用唯一的全局变量名
  external: ['react'],
  esbuildOptions: (options) => {
    options.globalName = 'MyUniqueLibName';
  }
});
```

### 性能问题

#### Q: 构建速度很慢
**原因**：没有利用缓存或并行构建

**解决方案**：
```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  // 启用缓存
  esbuildOptions: (options) => {
    options.cache = true;
  }
});
```

```json
{
  "scripts": {
    "build": "run-p build:cjs build:esm",
    "build:cjs": "tsup --format cjs",
    "build:esm": "tsup --format esm"
  }
}
```

#### Q: 构建产物体积过大
**原因**：没有启用 tree-shaking 或包含了不必要的依赖

**解决方案**：
```typescript
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  treeshake: true,
  minify: true,
  external: ['lodash', 'react']  // 外部化大型依赖
});
```

```json
{
  "sideEffects": false  // 标记为无副作用
}
```

## 📚 相关文档

- [项目构建系统](./project-build-system.md) - 了解构建系统架构
- [依赖管理策略](./dependency-management.md) - 学习依赖管理
- [构建指南首页](./index.md) - 返回指南首页

## 🔗 外部资源

- [tsup 官方文档](https://tsup.egoist.dev/)
- [Rollup 官方文档](https://rollupjs.org/)
- [Vite 库模式文档](https://vitejs.dev/guide/build.html#library-mode)
- [Node.js ES Modules 文档](https://nodejs.org/api/esm.html)

---

*正确的打包配置是库成功发布的关键。根据使用场景选择合适的格式，提供最佳的开发体验。*

## 🌐 其他语言版本

- **[🇺🇸 English](../../en/builder-guide/build-formats-config.md)** - English version of this document
- **[🏠 返回首页](../index.md)** - 返回中文文档首页

### Vite 配置（库模式）

#### 基础 Vite 库配置
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyLib',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        switch (format) {
          case 'es': return 'index.mjs';
          case 'cjs': return 'index.cjs';
          case 'umd': return 'index.umd.js';
          default: return `index.${format}.js`;
        }
      }
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  },
  plugins: [
    dts({
      insertTypesEntry: true
    })
  ]
});
```

#### 多包 Vite 配置
```typescript
// packages/*/vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';
import pkg from './package.json';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: pkg.name.replace('@qlover/', ''),
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: Object.keys(pkg.peerDependencies || {})
    }
  }
});
```
