# @qlover/create-app

从 GitHub 仓库的 `examples/` 拉取模板列表，下载并解压模板到本地目录；生成后会把模板中 `workspace:*` 依赖解析为 npm 上的具体版本（失败时回退为 `latest`），以便项目可独立安装。

👉 中文文档 | [English Docs](./README_EN.md)

## TL;DR

```bash
npx @qlover/create-app@latest
```

## 安装

```bash
npm install -g @qlover/create-app
```

## 使用方法

推荐使用 npx（避免全局安装）：

```bash
npx @qlover/create-app
```

也可以全局安装后直接运行二进制：

```bash
create-app
```

## 交互流程

运行后会依次询问：

- **Project name**：项目目录名（若目录已存在会提示更换）
- **Template name**：模板名（从 GitHub `qlover/fe-base` 的 `examples/` 动态获取）

## CLI 参数

- **`-v, --version`**：输出版本号
- **`-d, --dry-run`**：不写入文件（用于预览生成过程）
- **`-V, --verbose`**：输出更多信息

示例：

```bash
npx @qlover/create-app@latest --dry-run --verbose
```

## 特性

- 快速项目脚手架
- 交互式命令行界面
- 模板来自 GitHub `examples/`，无需在本地维护模板清单
- 创建后自动处理模板中的 `workspace:*` 依赖（解析为 npm 最新版本；失败时回退为 `latest`）

## 可用模板

模板列表来自 GitHub，随仓库内容变化。通常会包含类似：

- `react-seed`
- `next-seed`
- `taro-seed`
- `browser-plugin-seed`
