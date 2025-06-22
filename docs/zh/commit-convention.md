# 提交规范指南

本文档详细介绍 fe-base 项目的提交信息规范，基于 [Conventional Commits](https://www.conventionalcommits.org/) 标准。

## 📋 规范概述

### 为什么需要提交规范？

1. **自动化 CHANGELOG 生成** - 根据提交类型自动生成版本日志
2. **语义化版本控制** - 自动确定版本号递增类型
3. **提高代码可读性** - 清晰的提交历史便于代码审查
4. **团队协作效率** - 统一的格式降低沟通成本
5. **CI/CD 集成** - 支持自动化发布流程

### 基本格式

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## 🏷️ 提交类型 (Type)

### 主要类型

| 类型 | 描述 | CHANGELOG 显示 |
|------|------|----------------|
| `feat` | 新功能 | ✨ Features |
| `fix` | Bug 修复 | 🐞 Bug Fixes |
| `docs` | 文档更新 | 📝 Documentation |
| `refactor` | 代码重构 | ♻️ Refactors |
| `perf` | 性能优化 | 🚀 Performance |
| `build` | 构建系统或外部依赖变更 | 🚧 Build |

### 辅助类型

| 类型 | 描述 | CHANGELOG 显示 |
|------|------|----------------|
| `test` | 测试相关 | 🚨 Tests (隐藏) |
| `chore` | 其他杂项 | 🔧 Chores (隐藏) |
| `style` | 代码格式化 | 🎨 Styles (隐藏) |
| `ci` | CI/CD 配置 | 🔄 CI (隐藏) |
| `revert` | 回滚提交 | ⏪ Reverts (隐藏) |
| `release` | 发布相关 | 🔖 Releases (隐藏) |

### 特殊类型

| 类型 | 描述 | 版本影响 |
|------|------|----------|
| `BREAKING CHANGE` | 破坏性变更 | Major |

## 🎯 作用域 (Scope)

作用域用于指明提交影响的范围，使用小写字母。当前项目支持的作用域包括：

### 包作用域

- `fe-corekit` - 前端核心工具库
- `corekit-bridge` - 核心工具包桥接器
- `corekit-node` - Node.js 环境核心工具
- `logger` - 日志工具
- `fe-scripts` - 前端开发脚本
- `fe-code2markdown` - 代码转文档工具
- `fe-release` - 发布管理工具
- `create-app` - 应用脚手架
- `fe-standard` - 前端开发标准
- `eslint-plugin-fe-dev` - ESLint 插件
- `env-loader` - 环境变量加载器
- `scripts-context` - 脚本上下文工具

### 功能作用域

```bash
feat(animation): add fade transition effect
fix(utils): correct type definitions
docs(api): update method documentation
perf(serializer): optimize JSON parsing performance
```

### 配置作用域

```bash
build(rollup): update bundle configuration
ci(github): add release workflow
chore(deps): update dependencies
style(eslint): fix linting warnings
```

### 通用作用域

```bash
docs(readme): update installation guide
style(lint): fix eslint warnings
test(setup): configure vitest environment
chore(workspace): update pnpm workspace config
```

## 📝 描述 (Description)

### 编写原则

1. **使用祈使句** - "add feature" 而不是 "added feature"
2. **首字母小写** - "add new component" 而不是 "Add new component"
3. **不要句号结尾** - "fix bug" 而不是 "fix bug."
4. **简洁明了** - 控制在 50 个字符以内
5. **描述做了什么** - 而不是为什么做

### 好的描述示例

```bash
✅ add storage utility functions
✅ fix memory leak in event listeners
✅ update installation documentation
✅ refactor logger logic for better performance
✅ remove deprecated API methods
```

### 不好的描述示例

```bash
❌ Added new feature
❌ Fixed some bugs
❌ Updated stuff
❌ Changes
❌ WIP
```

## 📄 提交体 (Body)

### 何时使用

- 需要解释**为什么**做这个变更
- 变更比较复杂，需要详细说明
- 包含破坏性变更的详细信息

### 格式要求

- 与标题之间空一行
- 每行不超过 72 个字符
- 使用祈使句
- 可以包含多个段落

### 示例

```bash
feat(fe-corekit): add JSONStorage class

Add JSON storage utility with automatic serialization and expiration support.
This feature provides a unified interface for storing complex objects in
localStorage, sessionStorage, or custom storage backends.

The implementation includes:
- Automatic JSON serialization/deserialization
- TTL (time-to-live) support for cache expiration
- Pluggable storage backends
- TypeScript type safety
```

## 🔗 页脚 (Footer)

### 破坏性变更

```bash
feat(fe-corekit): change Logger constructor signature

BREAKING CHANGE: The Logger constructor now requires a configuration object.
Migration: `new Logger()` -> `new Logger({ level: 'info' })`
```

### 关联 Issue

```bash
fix(fe-scripts): resolve clean command timing issue

Fixes #123
Closes #456
Refs #789
```

### 共同作者

```bash
feat(logger): add structured logging support

Co-authored-by: John Doe <john@example.com>
Co-authored-by: Jane Smith <jane@example.com>
```

## 🛠️ 工具配置

### Commitizen 配置

项目已配置 Commitizen 来帮助生成规范的提交信息。

#### 安装和使用

```bash
# 使用项目配置的 commitizen
pnpm commit

# 或者全局安装后使用
npm install -g commitizen
git cz
```

### 配置文件

项目使用 `fe-config.json` 统一管理提交规范配置：

```json
{
  "release": {
    "changelog": {
      "types": [
        { "type": "feat", "section": "#### ✨ Features", "hidden": false },
        { "type": "fix", "section": "#### 🐞 Bug Fixes", "hidden": false },
        { "type": "docs", "section": "#### 📝 Documentation", "hidden": false },
        { "type": "refactor", "section": "#### ♻️ Refactors", "hidden": false },
        { "type": "perf", "section": "#### 🚀 Performance", "hidden": false },
        { "type": "build", "section": "#### 🚧 Build", "hidden": false },
        { "type": "chore", "section": "#### 🔧 Chores", "hidden": true },
        { "type": "test", "section": "#### 🚨 Tests", "hidden": true },
        { "type": "style", "section": "#### 🎨 Styles", "hidden": true },
        { "type": "ci", "section": "#### 🔄 CI", "hidden": true },
        { "type": "revert", "section": "#### ⏪ Reverts", "hidden": true },
        { "type": "release", "section": "#### 🔖 Releases", "hidden": true }
      ]
    }
  }
}
```

## 📊 提交示例

### 功能开发

```bash
feat(fe-corekit): add JSONStorage with TTL support
```

### Bug 修复

```bash
fix(fe-scripts): resolve memory leak in clean command
```

### 文档更新

```bash
docs(logger): add usage examples for structured logging
```

### 性能优化

```bash
perf(fe-corekit): reduce memory footprint by 30%
```

### 测试

```bash
test(logger): add unit tests for log level filtering
```

### 重构

```bash
refactor(fe-scripts): extract common utilities
```

## 🔄 提交工作流

### 单个功能提交

```bash
feat(fe-corekit): add storage utility functions
test(fe-corekit): add tests for storage utilities
docs(fe-corekit): update API documentation
```

### 复杂功能的多次提交

```bash
feat(fe-corekit): add basic storage interface
feat(fe-corekit): implement JSONStorage class
feat(fe-corekit): add TTL support for storage
test(fe-corekit): add comprehensive storage tests
docs(fe-corekit): add storage usage examples
```

### 修复相关的提交

```bash
fix(fe-scripts): resolve memory leak in clean command
test(fe-scripts): add regression test for memory leak
```

### 破坏性变更

```bash
feat(logger): redesign Logger API for better extensibility

BREAKING CHANGE: Logger constructor signature has changed.
- Before: new Logger(level)
- After: new Logger({ level, format, output })

Migration guide:
- new Logger('info') -> new Logger({ level: 'info' })
- new Logger('debug') -> new Logger({ level: 'debug' })
```

## ❌ 常见错误

### 类型错误

```bash
❌ chore(fe-corekit): add new storage feature  # 应该用 feat
❌ feat(fe-corekit): fix typo                  # 应该用 fix
❌ fix(fe-corekit): add error handling         # 应该用 feat
```

**正确写法：**
```bash
✅ feat(fe-corekit): add storage feature
✅ fix(fe-corekit): resolve typo in error message
✅ feat(fe-corekit): add error handling for storage operations
```

### 作用域错误

```bash
❌ feat(packages/fe-corekit): add feature    # 不需要路径
❌ feat(FE-COREKIT): add feature             # 不要大写
❌ feat(fe_corekit): add feature             # 不要下划线
```

**正确写法：**
```bash
✅ feat(fe-corekit): add storage feature
✅ fix(logger): resolve log level issue
✅ docs(fe-scripts): update command examples
```

### 描述错误

```bash
❌ feat(fe-corekit): Added new feature.      # 不要过去式和句号
❌ feat(fe-corekit): Add New Feature         # 不要首字母大写
❌ feat(fe-corekit): add feature and fix bug # 不要在一个提交中做多件事
```

**正确写法：**
```bash
✅ feat(fe-corekit): add storage feature
✅ fix(logger): resolve memory leak
✅ docs(fe-scripts): update API examples
```

## 🎯 最佳实践

### 提交频率

- **小而频繁** - 每个提交只做一件事
- **逻辑完整** - 确保每个提交都是可工作的状态
- **及时提交** - 不要积累太多变更

### 提交时机

```bash
# 开发新功能时
$ git commit -m "feat(fe-corekit): add storage interface"
$ git commit -m "feat(fe-corekit): implement JSONStorage"
$ git commit -m "test(fe-corekit): add storage tests"

# 修复 Bug 时
$ git commit -m "fix(logger): resolve level filtering issue"

# 更新文档时
$ git commit -m "docs(readme): update installation guide"
```

### 提交修正

如果提交信息有误，可以使用以下方法修正：

```bash
# 修改最后一次提交信息
git commit --amend -m "feat(fe-corekit): add storage utilities"

# 交互式修改历史提交
git rebase -i HEAD~3
```

### 合并提交

在功能分支开发完成后，可以考虑合并相关提交：

```bash
# 交互式 rebase 合并提交
git rebase -i main

# 示例：将多个提交合并为一个
pick abc1234 feat(fe-corekit): add storage interface
squash def5678 feat(fe-corekit): implement JSONStorage  
squash ghi9012 feat(fe-corekit): add error handling
```

## 📚 相关资源

- [Conventional Commits 官方文档](https://www.conventionalcommits.org/)
- [Angular 提交规范](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Commitizen 工具](https://github.com/commitizen/cz-cli)
- [Semantic Release](https://github.com/semantic-release/semantic-release)

## 📞 支持

如果在使用提交规范时遇到问题：

1. 查看 [项目 Issues](https://github.com/qlover/fe-base/issues)
2. 参考本文档的故障排除部分
3. 联系项目维护者
4. 查看 commitlint 错误信息获取具体指导 

## 🌐 其他语言版本

- **[🇺🇸 English](../en/commit-convention.md)** - English version of this document
- **[🏠 返回首页](./index.md)** - 返回中文文档首页 