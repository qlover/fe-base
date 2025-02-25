# fe-base

This project serves as a foundational setup for frontend development, incorporating various tools and configurations to streamline the development process.

## Features

- **TypeScript + ESLint + Prettier**: Ensures consistent code formatting and quality.
- **Commitlint**: Enforces commit message conventions.
- **Jest**: Provides a robust testing framework.
- **Rimraf**: A tool for cleaning up file directories.
- **CI/CD Automation**: Utilizes GitHub workflows for continuous integration and deployment.
  - **Release-it**: Automates the release process to npm and GitHub.
- **TS-Node**: Enables TypeScript support in Node.js environments.
- **Dotenv**: Loads environment variables from `.env` files.

## Scripts

To add development scripts, run the following command:

```bash
yarn add @qlover/fe-scripts --dev
```

## CI/CD

### Release

#### 📌 1. 代码变更 PR（Feature PR）

触发方式：开发者创建 PR 并合并到 master

- 操作：
  - 开发者提交代码
  - 创建 PR → 代码审核 → 合并到 master
  - ✅ 产物：master 分支包含最新代码

#### 📌 2. GitHub Actions 自动检测变更并创建 Release PR

步骤：

- 检测哪些包发生了变更

```bash
git diff --name-only HEAD^ HEAD | grep packages/
```

- 为每个变更的包创建 Release PR

```bash
fe-release -p ./packages/xxx -P -V
```

- 自动添加 `release:[包名]` 标签

fe-release 自动添加 `release:[包名]` 标签

✅ 产物: release:[包名] PR，包含 changelog 和新版本号

#### 📌 3. 合并 Release PR

步骤：

- 自动合并， 设置 fe-config autoMergePr 为 true
- 手动合并
