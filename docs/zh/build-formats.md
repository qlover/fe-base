# 打包格式指南

本文档详细介绍 fe-base 项目的打包策略、输出格式选择和配置方案。

## 打包格式概述

### 主要输出格式

#### 1. **CommonJS (CJS)**
- **用途**: Node.js 服务器端环境
- **特点**: 同步加载，使用 `require()` 和 `module.exports`
- **文件扩展名**: `.cjs` 或 `.js`

```javascript
// 输出示例
module.exports = {
  ElementResizer: class ElementResizer { /* ... */ }
};

// 使用示例
const { ElementResizer } = require('@fe-base/element-sizer');
```

#### 2. **ES Modules (ESM)**
- **用途**: 现代浏览器、Node.js (>=14)、打包工具
- **特点**: 静态分析、Tree-shaking 友好
- **文件扩展名**: `.mjs` 或 `.js`

```javascript
// 输出示例
export class ElementResizer { /* ... */ }
export default ElementResizer;

// 使用示例
import { ElementResizer } from '@fe-base/element-sizer';
```

#### 3. **Universal Module Definition (UMD)**
- **用途**: 浏览器直接引用、兼容多种模块系统
- **特点**: 自适应 AMD、CommonJS、全局变量
- **文件扩展名**: `.umd.js`

```javascript
// 输出示例
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.BrainToolkit = {}));
}(this, function (exports) { /* ... */ }));

// 使用示例
<script src="https://unpkg.com/@fe-base/element-sizer/dist/index.umd.js"></script>
<script>
  const resizer = new BrainToolkit.ElementResizer({ /* ... */ });
</script>
```

## 使用场景选择

### 服务器端包 (Server-side)

**推荐格式**: CJS + ESM

```json
// package.json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

**构建配置**:

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  target: 'node14',
  platform: 'node'
});
```

### 浏览器端包 (Browser-only)

**推荐格式**: ESM + UMD

```json
// package.json
{
  "main": "./dist/index.umd.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.umd.js"
    }
  }
}
```

**构建配置**:

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'umd'],
  dts: true,
  clean: true,
  target: 'es2015',
  platform: 'browser',
  globalName: 'BrainToolkit'
});
```

### 通用包 (Universal)

**推荐格式**: CJS + ESM + UMD

```json
// package.json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "browser": "./dist/index.umd.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "browser": "./dist/index.umd.js"
    }
  }
}
```

**构建配置**:

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig([
  // Node.js 环境
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    target: 'node14',
    platform: 'node'
  },
  // 浏览器环境
  {
    entry: ['src/index.ts'],
    format: ['umd'],
    clean: false,
    target: 'es2015',
    platform: 'browser',
    globalName: 'BrainToolkit',
    minify: true
  }
]);
```

## 构建工具配置

### tsup 配置 (推荐)

tsup 是基于 esbuild 的快速构建工具，适合库的打包。

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  // 入口文件
  entry: ['src/index.ts'],
  
  // 输出格式
  format: ['cjs', 'esm', 'umd'],
  
  // 生成类型定义文件
  dts: true,
  
  // 清理输出目录
  clean: true,
  
  // 代码分割
  splitting: false,
  
  // 源码映射
  sourcemap: true,
  
  // 压缩代码
  minify: false,
  
  // 目标环境
  target: 'es2018',
  
  // 外部依赖
  external: ['react', 'vue'],
  
  // 全局变量名 (UMD)
  globalName: 'BrainToolkit',
  
  // 自定义 esbuild 选项
  esbuildOptions(options) {
    options.banner = {
      js: '/* Brain Toolkit */'
    };
  }
});
```

### Rollup 配置

```typescript
// rollup.config.ts
import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default defineConfig([
  // ESM 构建
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        declaration: true,
        declarationDir: 'dist'
      })
    ],
    external: ['react', 'vue']
  },
  
  // CJS 构建
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript()
    ],
    external: ['react', 'vue']
  },
  
  // UMD 构建
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'BrainToolkit',
      sourcemap: true
    },
    plugins: [
      nodeResolve({ browser: true }),
      commonjs(),
      typescript(),
      terser()
    ]
  }
]);
```

## package.json 配置详解

### 基础字段

```json
{
  "name": "@fe-base/element-sizer",
  "version": "0.2.0",
  "type": "module",
  
  // 主入口 (CJS)
  "main": "./dist/index.cjs",
  
  // ES 模块入口
  "module": "./dist/index.js",
  
  // 浏览器入口
  "browser": "./dist/index.umd.js",
  
  // TypeScript 类型定义
  "types": "./dist/index.d.ts"
}
```

### exports 字段 (推荐)

```json
{
  "exports": {
    // 包根目录
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "browser": "./dist/index.umd.js"
    },
    
    // 子路径导出
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.js",
      "require": "./dist/utils.cjs"
    },
    
    // 包信息
    "./package.json": "./package.json"
  }
}
```

### 发布文件配置

```json
{
  "files": [
    "dist",
    "package.json",
    "README.md",
    "CHANGELOG.md"
  ]
}
```

## 打包注意事项

### 1. 依赖处理

#### 外部依赖 (External Dependencies)

```typescript
// tsup.config.ts
export default defineConfig({
  external: [
    // 运行时依赖，不打包进 bundle
    'react',
    'vue',
    'lodash'
  ]
});
```

#### 内联依赖 (Bundled Dependencies)

```typescript
// 小型工具库可以内联
export default defineConfig({
  noExternal: [
    'tiny-utility',
    'small-helper'
  ]
});
```

### 2. Tree-shaking 优化

```json
// package.json
{
  "sideEffects": false,  // 标记为无副作用
  "module": "./dist/index.js"
}
```

```typescript
// 确保使用 ES 模块语法
export { ElementResizer } from './element-resizer';
export { default as ElementResizer } from './element-resizer';
```

### 3. 代码分割

```typescript
// tsup.config.ts
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    utils: 'src/utils/index.ts'
  },
  splitting: true,  // 启用代码分割
  format: ['esm']   // 仅 ESM 支持分割
});
```

### 4. 环境变量处理

```typescript
// tsup.config.ts
export default defineConfig({
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version),
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
});
```

### 5. 浏览器兼容性

```typescript
// tsup.config.ts
export default defineConfig({
  target: 'es2015',  // 支持 ES2015+
  format: ['esm', 'umd'],
  
  // 为旧浏览器提供 polyfill
  esbuildOptions(options) {
    options.supported = {
      'dynamic-import': false
    };
  }
});
```

## 验证构建结果

### 1. 检查输出文件

```bash
# 查看构建产物
ls -la dist/

# 检查文件大小
du -h dist/*

# 分析 bundle 内容
npx bundle-analyzer dist/index.js
```

### 2. 测试不同环境

```javascript
// test-cjs.js (Node.js)
const { ElementResizer } = require('./dist/index.cjs');
console.log('CJS:', typeof ElementResizer);

// test-esm.mjs (Node.js)
import { ElementResizer } from './dist/index.js';
console.log('ESM:', typeof ElementResizer);

// test-umd.html (Browser)
<script src="./dist/index.umd.js"></script>
<script>
  console.log('UMD:', typeof BrainToolkit.ElementResizer);
</script>
```

### 3. 自动化测试

```json
// package.json
{
  "scripts": {
    "test:build": "npm run build && npm run test:formats",
    "test:formats": "node scripts/test-formats.js"
  }
}
```

```javascript
// scripts/test-formats.js
import { execSync } from 'child_process';

// 测试 CJS
try {
  execSync('node -e "require(\'./dist/index.cjs\')"');
  console.log('✅ CJS format works');
} catch (error) {
  console.error('❌ CJS format failed:', error.message);
}

// 测试 ESM
try {
  execSync('node -e "import(\'./dist/index.js\')"');
  console.log('✅ ESM format works');
} catch (error) {
  console.error('❌ ESM format failed:', error.message);
}
```

## 常见问题

### Q: 什么时候需要 UMD 格式？
A: 当你的包需要通过 `<script>` 标签直接在浏览器中使用，或者需要兼容 AMD 模块系统时。

### Q: 如何选择 target 版本？
A: 根据目标环境决定：
- Node.js 包：`node14` 或更高
- 现代浏览器：`es2018` 或 `es2020`
- 兼容旧浏览器：`es2015` 或 `es5`

### Q: 是否需要同时提供所有格式？
A: 不一定。根据实际使用场景选择：
- 纯 Node.js 包：CJS + ESM
- 纯浏览器包：ESM + UMD
- 通用包：CJS + ESM + UMD

### Q: 如何处理 CSS 和静态资源？
A: 使用专门的插件处理：

```typescript
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  
  // 复制静态文件
  publicDir: 'src/assets',
  
  // 处理 CSS
  esbuildOptions(options) {
    options.loader = {
      '.css': 'text'
    };
  }
});
```

### Q: 如何优化 bundle 大小？
A: 
1. 使用 Tree-shaking
2. 标记 `sideEffects: false`
3. 合理设置 `external` 依赖
4. 启用代码压缩
5. 使用动态导入进行代码分割 