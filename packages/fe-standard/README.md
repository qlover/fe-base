# @qlover/fe-standard

前端开发标准和规范，确保代码质量的一致性。

👉 中文文档 | [English Docs](./README_EN.md)

## 安装

```bash
npm install --save-dev @qlover/fe-standard
# 或
pnpm add -D @qlover/fe-standard
```

## 内容

本包包含：

1. **ESLint 配置**
   - base.json - 基础 ESLint 配置
   - base.ts.json - TypeScript ESLint 配置

2. **代码风格指南**
   - 命名约定
   - 文件组织
   - 最佳实践

## 使用

### ESLint 配置

在你的 `.eslintrc` 中扩展配置：

```json
{
  "extends": ["@qlover/fe-standard/config/base.json"]
}
```

对于 TypeScript 项目：

```json
{
  "extends": ["@qlover/fe-standard/config/base.ts.json"]
}
```

## 特性

- 跨项目的一致代码风格
- TypeScript 支持
- 现代 JavaScript 标准
- 最佳实践强制执行

## 许可证

ISC
