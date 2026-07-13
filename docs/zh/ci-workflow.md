# CI 工作流程指南

## 概述

我们的 CI 系统使用 `general-check.yml` 做质量检查，使用 `release.yml` 做发布。

## 工作流触发条件

`general-check.yml` 在以下情况下触发：

- 创建新的 PR
- 更新现有的 PR
- 重新打开 PR

带 **`CI-Release`** 标签的 PR 会跳过 `general-check`。

## 工作流行为

### 基本检查

对于所有非 `CI-Release` 的 PR，都会运行：

- 代码 lint 检查
- 单元测试
- 构建流程
- 重新构建流程

变更包检测由 `fe-release` 在发布阶段通过 **git diff** 完成，不再在 PR 上打 `changes:*` 标签。

## 常见开发流程

1. 功能开发：

   ```
   feature 分支 -> develop (PR)
   └── 运行: lint, test, build, rebuild
   ```

2. 版本发布：
   ```
   develop 合并（PR 带 CI-Release）
   └── create-release-pr: fe-release version → release/* → master
   └── 合并发布 PR 到 master → publish
   ```

## 重要说明

1. 所有普通 PR 都会进行相同的基本质量检查（lint、test、build）。
2. 发布范围由 `fe-release` 的 git diff 决定，不依赖 PR label。
3. 需要发布时，在合并到 develop **之前**给 PR 打上 `CI-Release`。
4. 若已合并但未打标签，可手动运行 **Release sub packages** 工作流。
