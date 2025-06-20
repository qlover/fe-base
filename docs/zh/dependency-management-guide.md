# Monorepo 子包打包依赖策略指南

## 概述

在 monorepo 项目中使用 Vite 打包子包时，最核心的问题是：**哪些依赖应该打包进 bundle，哪些应该保持外部化？** 这直接影响包的体积、用户的安装体验和潜在的依赖冲突。

## 核心问题

当你将子包打包后，面临的关键决策是：

1. **全部打包**：将所有依赖都打包进最终的 bundle 中
2. **部分打包**：选择性地打包某些依赖，其他保持外部化
3. **全部外部化**：所有依赖都不打包，由用户项目提供

## 依赖类型详解

在了解打包策略之前，需要先理解 `package.json` 中三种依赖类型的区别：

### dependencies
**定义**：运行时必需的依赖，用户安装你的包时会自动安装

**特点**：
- 安装你的包时，npm/pnpm 会自动安装这些依赖
- 这些依赖会出现在用户项目的 `node_modules` 中
- 影响用户项目的依赖树和包体积

**使用场景**：
```json
{
  "dependencies": {
    "lodash": "^4.17.21",    // 你的代码直接使用的工具库
    "dayjs": "^1.11.10",     // 运行时需要的日期库
    "chalk": "^5.3.0"        // CLI 工具需要的着色库
  }
}
```

**用户安装效果**：
```bash
npm install your-package
# 会同时安装 lodash, dayjs, chalk
```

### devDependencies
**定义**：开发和构建时需要的依赖，不会安装到用户项目中

**特点**：
- 只在开发时使用，不会被用户安装
- 用于构建、测试、代码格式化等开发流程
- 不影响最终打包的代码

**使用场景**：
```json
{
  "devDependencies": {
    "vite": "^6.1.0",           // 构建工具
    "typescript": "^5.4.5",     // 类型检查
    "@types/node": "^22.9.0",   // 类型定义
    "vitest": "^3.0.5",         // 测试框架
    "eslint": "^9.13.0"         // 代码检查
  }
}
```

**用户安装效果**：
```bash
npm install your-package
# 不会安装任何 devDependencies 中的包
```

### peerDependencies
**定义**：期望由用户项目提供的依赖，不会自动安装

**特点**：
- 不会被自动安装，需要用户手动安装
- 用于避免重复安装大型库
- 确保版本一致性和单例模式

**使用场景**：
```json
{
  "peerDependencies": {
    "react": ">=16.8.0",        // 期望用户项目已有 React
    "react-dom": ">=16.8.0",    // 期望用户项目已有 ReactDOM
    "eslint": ">=8.0.0"         // ESLint 插件期望用户已安装 ESLint
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true          // 标记为可选依赖
    }
  }
}
```

**用户安装效果**：
```bash
npm install your-package
# 会显示 peer dependency 警告，需要用户手动安装
npm install react react-dom  # 用户需要手动安装
```

### 依赖类型与打包的关系

```markdown
// 打包时的处理方式

dependencies:
- 可以选择打包或外部化
- 如果外部化，用户会自动获得这些依赖

devDependencies:
- 永远不会被打包到最终产物中
- 只用于开发和构建过程

peerDependencies:
- 通常需要外部化
- 用户必须手动安装这些依赖
```

## 依赖打包策略

### 什么是依赖打包？

```markdown
// 打包前的代码
import { debounce } from 'lodash'
import axios from 'axios'

export function myFunction() {
  return debounce(() => axios.get('/api'), 300)
}
```

```markdown
// 全部打包后的结果
// lodash 和 axios 的代码都被打包进了最终文件
// 用户安装你的包时不需要额外安装 lodash 和 axios

// 部分外部化的结果  
// 只有 lodash 被打包，axios 保持外部引用
// 用户需要在自己项目中安装 axios
```

### 场景分析：不同类型包的打包策略

#### 1. Node.js CLI 工具和脚本

**特点**：
- 运行在 Node.js 环境
- 用户通过命令行调用
- 需要快速启动，减少依赖安装

**依赖分类策略**：

```json
{
  "dependencies": {
    // ✅ 小型工具库 - 全部打包
    "chalk": "^5.3.0",           // 4KB - 着色库
    "nanoid": "^5.0.0",          // 2KB - ID生成
    "picocolors": "^1.0.0",      // 1KB - 轻量着色
    "cross-spawn": "^7.0.3",     // 6KB - 跨平台进程
    
    // ❌ 大型库 - 外部化让用户安装
    "commander": "^11.0.0",      // 50KB+ - 命令行框架
    "inquirer": "^9.2.0",        // 200KB+ - 交互式命令行
    "axios": "^1.6.0",           // 100KB+ - HTTP客户端
    "ora": "^7.0.0"              // 依赖链复杂
  }
}
```

**Vite 配置**：
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/cli.ts',
      formats: ['cjs'], // CLI 工具只需要 CommonJS
      fileName: 'cli'
    },
    rollupOptions: {
      external: [
        // Node.js 内置模块
        'fs', 'path', 'process', 'child_process', 'os', 'url',
        // 大型第三方库
        'commander', 'inquirer', 'axios', 'ora',
        // 动态导入的模块
        /^node:/
      ]
    },
    target: 'node14' // 指定 Node.js 版本
  }
})
```

**实际效果**：
```bash
# 用户安装
npm install -g your-cli-tool
npm install commander inquirer  # 需要额外安装大型依赖

# 包体积对比
# 全部打包: ~500KB
# 选择性打包: ~50KB
```

#### 2. 通用工具库（NPM 包）

**特点**：
- 在各种项目中使用
- 需要最大兼容性
- 用户希望即装即用

**依赖分类策略**：

```json
{
  "dependencies": {
    // ✅ 核心功能依赖 - 全部打包
    "tslib": "^2.8.1",           // TypeScript 运行时
    "dayjs": "^1.11.10",         // 日期处理
    "lodash-es": "^4.17.21",     // 工具函数
    
    // ❌ 可选功能依赖 - 外部化
    "zod": "^3.22.0"             // 验证库，用户可能有自己的选择
  },
  "peerDependencies": {
    // 环境相关的大型依赖
    "typescript": ">=4.5.0"      // 类型检查，开发时依赖
  },
  "peerDependenciesMeta": {
    "typescript": { "optional": true }
  }
}
```

**Vite 配置**：
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs', 'umd'], // 多格式支持
      name: 'MyUtils'
    },
    rollupOptions: {
      external: ['zod'], // 只外部化可选依赖
      output: {
        globals: {
          'zod': 'z'
        }
      }
    }
  }
})
```

#### 3. 前端组件库

**特点**：
- 依赖特定框架
- 需要 Tree-shaking
- 体积敏感

**依赖分类策略**：

```json
{
  "dependencies": {
    // ✅ 小型工具依赖 - 打包
    "clsx": "^2.0.0",            // 2KB - 类名工具
    "nanoid": "^5.0.0",          // 2KB - ID生成
    
    // ❌ 样式和动画库 - 根据大小决定
    "framer-motion": "^10.0.0"   // 100KB+ - 外部化
  },
  "peerDependencies": {
    // 框架依赖必须外部化
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  }
}
```

**Vite 配置**：
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es'], // 现代前端项目主要用 ES 模块
    },
    rollupOptions: {
      external: [
        'react', 'react-dom', 'react/jsx-runtime',
        'framer-motion' // 大型动画库外部化
      ],
      output: {
        // 保持目录结构，支持 Tree-shaking
        preserveModules: true,
        dir: 'dist'
      }
    }
  }
})
```

#### 4. CDN 部署的库

**特点**：
- 通过 `<script>` 标签引入
- 需要 UMD 格式
- 必须自包含

**依赖分类策略**：

```json
{
  "dependencies": {
    // ✅ 所有依赖都要打包 - CDN 版本必须自包含
    "lodash": "^4.17.21",
    "dayjs": "^1.11.10",
    "axios": "^1.6.0"
  }
}
```

**Vite 配置**：
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['umd', 'iife'], // CDN 专用格式
      name: 'MyLibrary', // 全局变量名
      fileName: (format) => `my-library.${format}.js`
    },
    rollupOptions: {
      // CDN 版本不外部化任何依赖
      external: [],
      output: {
        // 压缩版本
        compact: true
      }
    }
  }
})
```

**部署配置**：
```typescript
// 同时构建多个版本
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // CDN 完整版
        'cdn': './src/index.ts',
        // NPM 版本（外部化依赖）
        'npm': './src/index.ts'
      },
      external: (id, parentId, isResolved) => {
        // 根据构建目标决定外部化策略
        if (parentId?.includes('cdn')) {
          return false // CDN 版本不外部化
        }
        return ['react', 'vue'].includes(id) // NPM 版本外部化框架
      }
    }
  }
})
```

#### 5. Node.js 服务端库

**特点**：
- 运行在服务器环境
- 性能和安全性敏感
- 依赖版本控制重要

**依赖分类策略**：

```json
{
  "dependencies": {
    // ✅ 核心小型依赖 - 打包
    "mime-types": "^2.1.35",     // 8KB - MIME类型
    "ms": "^2.1.3",              // 1KB - 时间解析
    
    // ❌ 大型或安全敏感依赖 - 外部化
    "express": "^4.18.0",        // 200KB+ - Web框架
    "jsonwebtoken": "^9.0.0",    // 安全相关，版本敏感
    "bcrypt": "^5.1.0",          // 原生模块，编译复杂
    "mongoose": "^7.0.0"         // 500KB+ - 数据库ORM
  }
}
```

**Vite 配置**：
```typescript
// vite.config.ts  
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['cjs'], // 服务端主要用 CommonJS
    },
    rollupOptions: {
      external: [
        // Node.js 内置模块
        ...builtinModules,
        // 大型框架和库
        'express', 'fastify', 'koa',
        // 数据库相关
        'mongoose', 'sequelize', 'typeorm',
        // 安全相关
        'jsonwebtoken', 'bcrypt', 'passport',
        // 原生模块
        /\.node$/
      ]
    },
    target: 'node16'
  }
})
```

### 高级打包策略

#### 条件导出 (Conditional Exports)

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.es.js",    // ES 模块版本
      "require": "./dist/index.cjs.js",  // CommonJS 版本
      "browser": "./dist/index.umd.js"   // 浏览器版本
    },
    "./cdn": {
      "default": "./dist/index.cdn.js"   // CDN 完整版本
    }
  }
}
```

#### 动态依赖加载

```typescript
// 可选依赖的动态加载
export async function withOptionalDep() {
  try {
    const { default: optionalLib } = await import('optional-dependency')
    return optionalLib.someFunction()
  } catch {
    console.warn('Optional dependency not available, using fallback')
    return fallbackImplementation()
  }
}
```

#### Bundle 分析和优化

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      filename: 'bundle-analysis.html',
      open: true
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 手动分割大型依赖
          'vendor-utils': ['lodash', 'dayjs'],
          'vendor-ui': ['react', 'react-dom']
        }
      }
    }
  }
})
```

### 1. Node.js 脚本库的打包策略

**特点**：CLI 工具、构建脚本、服务端库

**推荐策略**：
```json
{
  "dependencies": {
    // 小型工具库 - 建议打包
    "chalk": "^5.3.0",
    "nanoid": "^5.0.0",
    
    // 大型库 - 建议外部化，让用户安装
    "commander": "^11.0.0",
    "axios": "^1.6.0"
  }
}
```

**原因分析**：
- ✅ **小型库打包**：减少用户安装步骤，避免版本冲突
- ✅ **大型库外部化**：避免包体积过大，用户可能已经安装了这些库

### 2. 通用开发库的打包策略

**特点**：工具函数、组件库、SDK

**推荐策略**：
```json
{
  "dependencies": {
    // 核心小型依赖 - 打包
    "tslib": "^2.8.1"
  },
  "peerDependencies": {
    // 框架依赖 - 完全外部化
    "react": ">=16.8.0"
  }
}
```

**原因分析**：
- ✅ **工具函数全部打包**：提供完整的功能，用户即装即用
- ✅ **框架依赖外部化**：避免重复安装，保持版本一致性

### 3. 内部共享库的打包策略

**特点**：仅在 monorepo 内部使用

**推荐策略**：
```json
{
  "dependencies": {
    // 可以自由选择打包或外部化
    "lodash": "^4.17.21"
  }
}
```

## 打包配置实例

### 场景一：工具函数库（全部打包）

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      // 不配置 external，所有依赖都会被打包
    }
  }
})
```

**结果**：用户只需 `npm install your-package`，所有功能开箱即用

### 场景二：React 组件库（框架外部化）

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['react', 'react-dom'], // 框架依赖外部化
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
```

**结果**：用户需要确保项目中已安装 React

### 场景三：CLI 工具（选择性打包）

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['cjs'] // CLI 通常只需要 CommonJS
    },
    rollupOptions: {
      external: [
        // Node.js 内置模块必须外部化
        'fs', 'path', 'process',
        // 大型依赖外部化
        'commander', 'inquirer'
        // 小型依赖不在 external 中，会被打包
      ]
    }
  }
})
```

## 判断标准

### 应该打包的依赖

✅ **建议打包**：
- 包体积 < 50KB 的工具库
- 你的库特有的依赖
- 用户不太可能单独使用的依赖
- 版本要求不严格的稳定库

**示例**：`dayjs`, `nanoid`, `chalk`, `lodash-es`

### 应该外部化的依赖

✅ **建议外部化**：
- 大型框架和库（React, Vue, Express）
- 用户项目中常见的依赖
- 需要单例模式的库
- Node.js 内置模块

**示例**：`react`, `vue`, `axios`, `commander`, `fs`, `path`

## 实际应用建议

### 对于你的项目包类型

```markdown
// CLI 工具类（fe-scripts, fe-release, create-app）
dependencies: 小型工具库打包，大型库外部化
devDependencies: 所有构建工具

// 工具库类（logger, env-loader, scripts-context）  
dependencies: 核心小型依赖打包
peerDependencies: 可选的环境依赖

// 开发工具类（eslint-plugin-fe-dev, fe-standard）
dependencies: ESLint 相关小型插件打包
peerDependencies: ESLint 本身外部化
```

## 验证打包结果

### 检查包体积
```bash
# 查看打包后的文件大小
ls -lh dist/

# 分析包内容
npm pack --dry-run
```

### 测试依赖关系
```bash
# 创建测试项目
mkdir test-project && cd test-project
npm init -y

# 安装你的包
npm install ../your-package

# 测试是否能正常使用
node -e "console.log(require('your-package'))"
```

## 常见问题

### Q: 什么时候选择全部打包？
**A**: 当你的库是独立的工具函数集合，用户希望即装即用时

### Q: 什么时候选择外部化？
**A**: 当依赖是大型框架、用户可能已经安装、或需要版本一致性时

### Q: 如何处理 monorepo 内部依赖？
**A**: 
```json
{
  "dependencies": {
    "@qlover/logger": "workspace:*"  // 开发时的引用
  }
}
```
打包时这些内部依赖通常会被打包进去，因为它们不是外部可获得的

### Q: TypeScript 类型文件怎么处理？
**A**: 类型文件不参与运行时打包，通过 `vite-plugin-dts` 单独生成

---

*核心原则：平衡包体积、用户体验和依赖管理的复杂性* 