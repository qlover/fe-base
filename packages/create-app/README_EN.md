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

The template list comes from GitHub and may change over time. Common examples include:

- `react-seed`
- `next-seed`
- `taro-seed`
- `browser-plugin-seed`
