## `src/feConfig` (Module)

**Type:** `module src/feConfig`

---

### `FeConfig` (Interface)

**Type:** `interface FeConfig`

---

#### `author` (Property)

**Type:** `string \| Object`

**Default:** `package.json -> autor`

Use author name when create merge PR

---

#### `cleanFiles` (Property)

**Type:** `string[]`

**Default:** `ts
["dist","node_modules","yarn.lock","package-lock.json",".eslintcache","*.log"]
`

Run `fe-clean` to includes files

---

#### `commitlint` (Property)

**Type:** `UserConfig`

**Default:** `ts
{ "extends": ["@commitlint/config-conventional"] }
`

commitlint config

---

#### `envOrder` (Property)

**Type:** `string[]`

**Default:** `ts
['.env.local', '.env']
`

---

#### `protectedBranches` (Property)

**Type:** `string[]`

**Default:** `ts
["master", "develop", "main"]
`

Run `fe-clean-branch` to exclude branches

---

#### `repository` (Property)

**Type:** `string \| Object`

**Default:** `package.json -> repository`

Use repo info when create merge PR

---

### `defaultFeConfig` (Variable)

**Type:** `FeConfig`

**Default:** `{}`

---
