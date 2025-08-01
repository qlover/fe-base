# CI 工作流程指南

## 概述

我们的 CI 系统使用单个工作流文件 `general-check.yml`，根据目标分支的不同执行不同的检查行为。

## 工作流触发条件

工作流在以下情况下触发：

- 创建新的 PR
- 更新现有的 PR
- 重新打开 PR

## 工作流行为

### 基本检查

对于所有 PR，无论目标分支是什么，都会运行以下检查：

- 代码 lint 检查
- 单元测试
- 构建流程
- 重新构建流程

### 包检查

包检查是额外的验证步骤，仅在以下情况运行：

- PR 的目标分支是 master
- PR 没有 'CI-Release' 标签

## 常见开发流程

一个典型的开发流程如下：

1. 功能开发：

   ```
   feature 分支 -> v0.7 (PR)
   └── 运行: lint, test, build, rebuild
   ```

2. 版本发布：
   ```
   v0.7 -> master (PR)
   ├── 运行: lint, test, build, rebuild
   └── 额外运行: 包检查
   ```

## 重要说明

1. 所有 PR 都会进行相同的基本质量检查（lint、test、build）。
2. 对于不是合并到 master 的 PR，会自动跳过包检查。
3. 如果需要跳过所有检查，可以使用 'CI-Release' 标签。
4. 工作流设计确保了所有分支的一致性检查，同时为 master 分支提供额外的验证。
