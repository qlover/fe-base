# CI 工作流程指南

## 概述

我们的 CI 系统包含两个主要工作流：

- `branch-check.yml`：用于功能分支和非 master PR 的基本检查
- `general-check.yml`：用于合并到 master 的 PR 的全面检查

## 工作流触发条件

### 分支检查 (`branch-check.yml`)

这个工作流运行基本检查（lint、test、build），在以下情况触发：

- 向任何非 master 分支推送代码
- 创建/更新针对非 master 分支的 PR

示例场景：

1. 当创建从 `feature` 到 `v0.7` 的 PR 时：
   - ✅ 触发 `branch-check.yml`
   - ❌ 不触发 `general-check.yml`

2. 当向 `feature` 或 `v0.7` 推送新的提交时：
   - ✅ 触发 `branch-check.yml`
   - ❌ 不触发 `general-check.yml`

### 通用检查 (`general-check.yml`)

这个工作流运行全面检查（包括包检查），仅在以下情况触发：

- 创建/更新直接针对 master 分支的 PR
- PR 没有 'CI-Release' 标签

示例场景：

1. 当创建从 `v0.7` 到 `master` 的 PR 时：
   - ✅ 触发 `general-check.yml`
   - ❌ 不触发 `branch-check.yml`

## 常见开发流程

一个典型的开发流程如下：

1. 功能开发：

   ```
   feature 分支 -> v0.7 (PR)
   ├── 触发: branch-check.yml
   └── 运行: lint, test, build
   ```

2. 版本发布：
   ```
   v0.7 -> master (PR)
   ├── 触发: general-check.yml
   └── 运行: lint, test, build, package checks
   ```

## 重要说明

1. 针对 master 的 PR 只会触发 `general-check.yml`，确保在合并到生产环境前进行全面检查。
2. 所有其他开发工作（功能分支、版本分支）将触发 `branch-check.yml` 以获得更快的反馈。
3. 这两个工作流是互斥的 - 单个 PR 永远不会同时触发两个工作流。
4. 当功能 PR 合并到版本分支（如 v0.7）时，不会影响该版本分支到 master 的 PR 检查。
