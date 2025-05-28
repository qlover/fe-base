# 项目发布指南

本文档详细介绍 fe-base 项目的发布流程、配置和最佳实践。

## 📋 发布概述

fe-base 使用自动化发布流程，基于 [@qlover/fe-release](https://www.npmjs.com/package/@qlover/fe-release) 工具实现。发布流程分为三个主要步骤：

1. **MergePR 阶段** - 自动检测包变更并添加标签
2. **ReleasePR 阶段** - 生成 changelog 和版本号
3. **发布阶段** - 自动发布到 GitHub 和 npm

## 🔄 发布流程详解

### 第一步：创建功能分支和 Pull Request

#### 1.1 创建功能分支

```bash
# 从 master 分支创建功能分支
git checkout master
git pull origin master
git checkout -b feature/your-feature-name

# 进行开发工作
# ... 修改代码 ...

# 提交更改 (遵循提交规范)
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature-name
```

> 💡 **提交规范**: 请参考 [提交规范指南](./commit-convention.md) 了解详细的提交信息格式要求。

#### 1.2 创建 Pull Request

在 GitHub 上创建 Pull Request，目标分支为 `master`。

#### 1.3 添加版本递增标签（可选）

在 PR 上添加以下标签来控制版本号递增：

- `increment:major` - 主版本号递增 (1.0.0 → 2.0.0)
- `increment:minor` - 次版本号递增 (1.0.0 → 1.1.0)  
- `increment:patch` - 补丁版本号递增 (1.0.0 → 1.0.1) **[默认]**

### 第二步：MergePR 自动化处理

当 PR 合并到 master 分支时，GitHub Actions 会自动执行以下操作：

#### 2.1 检测包变更

系统会自动分析 `packages/` 目录下的文件变更，为每个有修改的包添加标签：

```
changes:packages/fe-corekit
changes:packages/fe-scripts
```

#### 2.2 质量检查

```bash
# 自动执行的检查流程
pnpm lint      # 代码规范检查
pnpm test      # 运行测试套件
pnpm build     # 构建所有包
```

#### 2.3 生成 ReleasePR

如果所有检查通过，系统会：
- 自动生成每个包的 changelog
- 更新版本号
- 创建 ReleasePR

### 第三步：发布到仓库

#### 3.1 自动合并 ReleasePR

根据 `fe-config.json` 中的 `autoMergeReleasePR` 配置：

```json
{
  "release": {
    "autoMergeReleasePR": true  // 自动合并 ReleasePR
  }
}
```

#### 3.2 发布到 GitHub 和 npm

ReleasePR 合并后，系统会自动：
- 创建 Git 标签
- 发布 GitHub Release
- 发布包到 npm 仓库

## ⚙️ 发布配置

### fe-config.json 配置详解

```json
{
  "protectedBranches": ["master", "develop"],
  "release": {
    "autoMergeReleasePR": true,
    "githubPR": {
      "commitArgs": ["--no-verify"],
      "pushChangedLabels": true
    },
    "changelog": {
      "formatTemplate": "\n- ${scopeHeader} ${commitlint.message} ${commitLink} ${prLink}",
      "commitBody": true,
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

#### 配置项说明

- **protectedBranches**: 受保护的分支列表
- **autoMergeReleasePR**: 是否自动合并 ReleasePR
- **commitArgs**: Git 提交时的额外参数
- **pushChangedLabels**: 是否推送变更标签
- **formatTemplate**: changelog 格式模板
- **types**: 提交类型配置，控制 changelog 的分组和显示

### GitHub Actions 配置

#### release.yml 工作流

```yaml
name: Release sub packages

on:
  pull_request:
    branches: [master]
    types: [closed]
    paths: [packages/**]

jobs:
  release-pull-request:
    # 当 PR 合并且不包含 CI-Release 标签时执行
    if: |
      github.event.pull_request.merged == true && 
      !contains(github.event.pull_request.labels.*.name, 'CI-Release')
    
  release:
    # 当 PR 合并且包含 CI-Release 标签时执行
    if: |
      github.event.pull_request.merged == true && 
      contains(github.event.pull_request.labels.*.name, 'CI-Release')
```

### 环境变量配置

需要在 GitHub 仓库设置中配置以下 Secrets：

```bash
# GitHub Personal Access Token (用于创建 PR 和 Release)
PAT_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# npm 发布令牌 (用于发布到 npm)
NPM_TOKEN=npm_xxxxxxxxxxxxxxxxxxxx
```

## 📝 Commit 规范

### Conventional Commits

项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### 提交类型

| 类型 | 描述 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(fe-corekit): add resize animation` |
| `fix` | 修复 bug | `fix(fe-corekit): resolve memory leak` |
| `docs` | 文档更新 | `docs(fe-corekit): update API documentation` |
| `style` | 代码格式 | `style(fe-corekit): fix code formatting` |
| `refactor` | 重构 | `refactor(fe-corekit): optimize performance` |
| `test` | 测试相关 | `test(fe-corekit): add unit tests` |
| `chore` | 构建/工具 | `chore(fe-corekit): update dependencies` |

#### 作用域 (Scope)

作用域应该是包名（不包含 `@qlover/` 前缀）：

- `fe-corekit` - 核心工具包
- `fe-scripts` - 脚本工具
- `logger` - 日志工具
- `code2markdown` - 代码转换工具

#### 示例

```bash
# 功能开发
feat(fe-corekit): add new utility function
fix(logger): resolve console output issue

# 文档更新
docs(fe-scripts): update README with new examples
docs: update project documentation

# 构建相关
chore: update build configuration
chore(fe-corekit): bump dependencies
```

### 使用 Commitizen

项目配置了 Commitizen 来帮助生成规范的提交信息：

```bash
# 使用交互式提交
pnpm commit

# 或者使用 git cz (如果全局安装了 commitizen)
git cz
```

## 🏷️ 标签管理

### 自动标签

系统会自动为有变更的包添加标签：

```
changes:packages/fe-corekit    # 包变更标签
increment:minor                   # 版本递增标签
CI-Release                       # 发布标签 (系统自动添加)
```

### 手动标签管理

如果某个包不需要发布，可以手动移除对应的 `changes:` 标签：

1. 在 GitHub PR 页面找到标签
2. 点击标签旁的 ❌ 移除
3. 该包将不会包含在此次发布中

## 📦 包发布策略

### 独立版本管理

每个包都有独立的版本号，互不影响：

```
@qlover/fe-corekit@1.2.0
@qlover/fe-scripts@0.5.1
@qlover/logger@2.1.0
```

### 依赖关系处理

- **内部依赖**: 包间依赖会自动更新版本号
- **外部依赖**: 需要手动管理版本范围

### 发布范围控制

可以通过标签控制哪些包参与发布：

```bash
# 只发布 fe-corekit 包
# 移除其他包的 changes: 标签，保留 changes:packages/fe-corekit
```

## 🔍 发布状态监控

### GitHub Actions 状态

在 GitHub 仓库的 Actions 页面可以查看：

- ✅ 构建状态
- ✅ 测试结果  
- ✅ 发布状态
- ❌ 失败原因

### npm 发布状态

检查包是否成功发布到 npm：

```bash
# 检查包版本
npm view @qlover/fe-corekit versions --json

# 检查最新版本
npm view @qlover/fe-corekit version
```

### GitHub Release

在 GitHub 仓库的 Releases 页面查看：

- 📋 Release Notes
- 📦 发布的包列表
- 🏷️ Git 标签
- 📅 发布时间

## 🚨 故障排除

### 常见问题

#### 1. 发布失败：权限不足

**错误信息**:
```
npm ERR! 403 Forbidden - PUT https://registry.npmjs.org/@qlover/fe-corekit
```

**解决方案**:
- 检查 `NPM_TOKEN` 是否正确配置
- 确认 npm 账户有发布权限
- 验证包名是否已被占用

#### 2. GitHub Actions 失败

**错误信息**:
```
Error: Resource not accessible by integration
```

**解决方案**:
- 检查 `PAT_TOKEN` 权限设置
- 确认 token 包含 `repo` 和 `write:packages` 权限

#### 3. 版本冲突

**错误信息**:
```
npm ERR! 409 Conflict - PUT https://registry.npmjs.org/@qlover/fe-corekit
```

**解决方案**:
- 检查是否尝试发布已存在的版本
- 手动更新版本号或使用 changeset

#### 4. 构建失败

**错误信息**:
```
Build failed with exit code 1
```

**解决方案**:
- 检查 TypeScript 编译错误
- 确认所有依赖已正确安装
- 查看详细的构建日志

### 手动发布流程

如果自动发布失败，可以手动执行发布：

```bash
# 1. 创建 changeset
pnpm changeset

# 2. 更新版本号
pnpm changeset version

# 3. 构建包
pnpm build

# 4. 发布到 npm
pnpm changeset publish

# 5. 创建 Git 标签
git tag @qlover/fe-corekit@x.x.x
git push origin --tags
```

### 回滚发布

如果需要回滚已发布的版本：

```bash
# 撤销 npm 发布 (24小时内)
npm unpublish @qlover/fe-corekit@x.x.x

# 删除 Git 标签
git tag -d @qlover/fe-corekit@x.x.x
git push origin :refs/tags/@qlover/fe-corekit@x.x.x

# 删除 GitHub Release (手动在 GitHub 上操作)
```

## 🎯 最佳实践

### 1. 发布前检查清单

- [ ] 代码已通过所有测试
- [ ] 文档已更新
- [ ] 提交信息符合 [提交规范](./commit-convention.md)
- [ ] CHANGELOG 格式正确
- [ ] 版本号符合语义化版本规范
- [ ] 依赖关系已正确配置

### 2. 版本管理策略

- **补丁版本** (patch): 向后兼容的 bug 修复
- **次版本** (minor): 向后兼容的新功能
- **主版本** (major): 不向后兼容的重大更改

### 3. 发布时机

- **定期发布**: 每周或每两周发布一次
- **紧急修复**: 重要 bug 修复立即发布
- **功能发布**: 新功能完成后发布

### 4. 回滚策略

如果发布出现问题，可以：

```bash
# 1. 撤回 npm 包 (24小时内)
npm unpublish @qlover/fe-corekit@x.x.x

# 2. 发布修复版本
npm version patch
npm publish

# 3. 更新文档说明问题
```

## 🔗 相关链接

- [提交规范指南](./commit-convention.md)
- [@qlover/fe-release 文档](https://www.npmjs.com/package/@qlover/fe-release)
- [Conventional Commits 规范](https://www.conventionalcommits.org/)
- [语义化版本规范](https://semver.org/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [npm 发布指南](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

## 📞 支持

如果在发布过程中遇到问题：

1. 查看 [GitHub Issues](https://github.com/qlover/fe-base/issues)
2. 查看 GitHub Actions 执行日志
3. 联系项目维护者
4. 参考 [@qlover/fe-release](https://www.npmjs.com/package/@qlover/fe-release) 文档

## 📦 发布示例

### 成功发布的输出示例

```bash
# 发布成功后的输出
✅ Published packages:
@qlover/fe-corekit@1.2.0
@qlover/fe-scripts@0.5.1
@qlover/logger@2.1.0

🏷️  Created tags:
@qlover/fe-corekit@1.2.0
@qlover/fe-scripts@0.5.1
@qlover/logger@2.1.0

🚀 GitHub releases created successfully
📦 npm packages published successfully
```

### 查看发布状态

```bash
# 查看包的所有版本
npm view @qlover/fe-corekit versions --json

# 查看包的最新版本
npm view @qlover/fe-corekit version

# 查看包的详细信息
npm view @qlover/fe-corekit
```

## 🧪 测试发布

### 本地测试

在发布前，建议在本地进行完整测试：

```bash
# 安装依赖
pnpm install

# 运行所有测试
pnpm test

# 构建所有包
pnpm build

# 测试特定包
pnpm --filter @qlover/fe-corekit test

# 预览 changelog
pnpm changeset status
```

### 发布预检查

```bash
# 检查包的发布配置
npm pack --dry-run

# 检查包的内容
npm view @qlover/fe-corekit

# 验证包的依赖
npm ls @qlover/fe-corekit
```

## 📊 发布统计

### 发布频率建议

- **补丁版本 (patch)**: 每周 1-2 次
- **次版本 (minor)**: 每月 1-2 次  
- **主版本 (major)**: 每季度或半年 1 次

### 发布质量检查

每次发布前确保：

- [ ] 所有测试通过
- [ ] 代码覆盖率达标
- [ ] 文档已更新
- [ ] CHANGELOG 准确描述变更
- [ ] 版本号符合语义化版本规范
- [ ] 破坏性变更已在文档中说明

## 📚 相关文档

- [提交规范指南](./commit-convention.md)
- [如何增加一个子包](./how-to-add-a-subpackage.md)
- [项目构建与依赖管理](./project-builder.md)
- [测试指南](./testing-guide.md)
