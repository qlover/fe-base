# @qlover/create-app

Fetches template names from the GitHub repo `examples/`, downloads and extracts the selected template into a new directory, then replaces `workspace:*` dependencies with concrete versions from the npm registry (falls back to `latest` on failure).

> 中文: [README.md](./README.md)

## TL;DR

```bash
npx @qlover/create-app@latest
```

## Installation

```bash
npm install -g @qlover/create-app
```

## Usage

Recommended (via npx):

```bash
npx @qlover/create-app
```

Or run the global binary after installing:

```bash
create-app
```

## Interactive flow

The CLI will ask for:

- **Project name**: the target directory name (must not already exist)
- **Template name**: fetched dynamically from GitHub `qlover/fe-base` under `examples/`

## CLI options

- **`-v, --version`**: show version
- **`-d, --dry-run`**: do not write anything (preview the generation steps)
- **`-V, --verbose`**: show more information

Example:

```bash
npx @qlover/create-app@latest --dry-run --verbose
```

## Features

- Quick project scaffolding
- Interactive CLI interface
- Template list is fetched from GitHub `examples/` (no local template registry)
- Post-processing: replace `workspace:*` in generated `package.json` files with the latest npm versions (or `latest`)

## Available Templates

The template list is fetched from `examples/` in the GitHub repo `qlover/fe-base` and may change over time. Common templates:

| Template              | Description                                                                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react-seed`          | **Vite + React** SPA with qlover core libraries, IOC, routing, i18n, Tailwind CSS 4, and dev Mock API.                                                            |
| `next-seed`           | **Next.js full-stack** app with layered architecture, Supabase, Ant Design, and IOC for typical web apps.                                                         |
| `next-oauth-wrapper`  | **Next.js OAuth 2.0 authorization server** example: reusable `shared/oauth-wrapper` protocol kernel plus Supabase persistence; upstream user system is swappable. |
| `taro-seed`           | **Taro + React multi-platform** template (WeChat mini program, H5, etc.) with IOC, i18n, theme, and auth.                                                         |
| `browser-plugin-seed` | **Plasmo + React browser extension** (Manifest V3): popup, content scripts, routing, i18n, and auth.                                                              |

See each template’s `README.md` for full details.
