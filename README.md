# fe-base

## 构建与依赖管理

pnpm [递归模式](https://pnpm.io/cli/recursive) 自动按依赖顺序执行 build 命令

当前项目采用 pnpm recursive 和 `worksapce:*` 结合

### 命令结构

- `pnpm` 包管理器，支持 monorepo
- `-r` 或 `--recursive` 递归模式，表示对所有 workspace 下的包都执行后面的命令
- `run build` 在每个包里执行 npm run build（即 package.json 里的 build 脚本）

### 它做了什么？

- 遍历你的所有子包（比如 packages/\*）。
- 检查每个包的 package.json 里有没有 build 脚本。
- 自动分析依赖关系（比如 A 依赖 B），先 build 被依赖的包（B），再 build 依赖它的包（A）。
- 保证 build 顺序正确，不会出现“依赖包还没 build，当前包 build 失败”的问题。

### 前提条件

需要在本地相互依赖的包请使用 `workspace:*`, 而不是具体的版本号

如果不需要参与本地多包构建，可以使用固定版本号, 比如一些没有发生代码修改的包，可以直接使用

`pnpm install` 处理 `workspace:*` 的机制, 只在 monorepo/workspace 内部有效，用于本地开发和构建时自动链接本地包

当你在某个包的 package.json 里写：

```
{
  "dependencies": {
    "@qlover/fe-corekit": "workspace:*"
  }
}
```

执行 `pnpm install` 时，pnpm 会自动识别 `workspace:*`，并将依赖指向本地 workspace 里的对应包，而不是去 `npm registry` 下载。

- pnpm 会在 `node_modules` 里为所有 `workspace:*` 依赖创建指向本地 workspace 包的软链接（symlink），而不是去 npm registry 下载远程包。
- 这样，依赖方包在 `node_modules` 里访问到的其实就是本地包的内容（如 `packages/xxx` 目录）。
- 需要注意的是，pnpm install 只做依赖软链接，不会自动构建（build）这些本地包。
- 如果依赖包的 `main`、`module`、`types` 等字段指向 `dist` 目录，而 `dist` 还没有生成（即还没 build），那么依赖方在 build 时会找不到文件，导致构建失败。

**结论：**

- `pnpm install` 只负责把 `workspace:*` 依赖软链接到本地包，不会自动 build。
- 第一次 install 后，必须手动（或在 CI 里）执行 `pnpm -r run build`，才能保证所有包的 dist 产物都存在，依赖链才完整。

> **建议：**  
> 每次 `pnpm install` 后，务必执行一次 `pnpm -r run build`，以确保所有包的 dist 产物已生成，避免依赖链断裂导致的 build 失败。

### 致命问题

发布到 npm 不能出现 `workspace:*`, 上传到 npm（发布包）时, `workspace:*` 绝不能出现在最终发布的包的依赖里，否则下游用户 npm install 时会报错，因为 npm registry 上没有 `workspace:*` 这个版本。

需要注意什么？
不要手动直接上传 `workspace:*` 依赖的包到 npm，一定要用 pnpm/yarn/changesets 的官方发布命令。

如果你用的是 npm publish（而不是 pnpm/yarn/changesets），它不会自动替换 `workspace:*`，这会导致你发布的包依赖不合法，下游无法安装。
