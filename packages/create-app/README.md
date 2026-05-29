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

模板列表来自 GitHub `qlover/fe-base` 的 `examples/`，随仓库内容变化。当前常见模板如下：

| 模板                  | 简介                                                                                                           |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| `react-seed`          | **Vite + React** 单页应用：集成 qlover 核心库、IOC、路由、i18n、Tailwind CSS 4 与开发态 Mock API。             |
| `next-seed`           | **Next.js 全栈** 应用：分层架构、Supabase、Ant Design、IOC，适合常规 Web 业务。                                |
| `next-oauth-wrapper`  | **Next.js OAuth 2.0 授权服务器** 示例：`shared/oauth-wrapper` 协议内核 + Supabase 持久化，可替换上游用户系统。 |
| `taro-seed`           | **Taro + React 多端** 模板：微信小程序、H5 等，含 IOC、i18n、主题与鉴权。                                      |
| `browser-plugin-seed` | **Plasmo + React 浏览器扩展**（Manifest V3）：Popup、Content Script，含路由、i18n 与鉴权。                     |

各模板详细说明见对应目录下的 `README.md`。
