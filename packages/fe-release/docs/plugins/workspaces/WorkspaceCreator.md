## `src/plugins/workspaces/WorkspaceCreator` (Module)

**Type:** `module src/plugins/workspaces/WorkspaceCreator`

---

### `WorkspaceCreator` (Class)

**Type:** `class WorkspaceCreator`

---

#### `new WorkspaceCreator` (Constructor)

**Type:** `() => WorkspaceCreator`

---

#### `readJson` (Method)

**Type:** `(path: string) => Record<string, unknown>`

#### Parameters

| Name   | Type     | Optional | Default | Since | Deprecated | Description |
| ------ | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `path` | `string` | ❌       | -       | -     | -          |             |

---

##### `readJson` (CallSignature)

**Type:** `Record<string, unknown>`

#### Parameters

| Name   | Type     | Optional | Default | Since | Deprecated | Description |
| ------ | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `path` | `string` | ❌       | -       | -     | -          |             |

---

#### `toWorkspace` (Method)

**Type:** `(workspace: Partial<WorkspaceValue>, rootPath: string) => WorkspaceValue`

#### Parameters

| Name        | Type                      | Optional | Default | Since | Deprecated | Description |
| ----------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `Partial<WorkspaceValue>` | ❌       | -       | -     | -          |             |
| `rootPath`  | `string`                  | ❌       | -       | -     | -          |             |

---

##### `toWorkspace` (CallSignature)

**Type:** `WorkspaceValue`

#### Parameters

| Name        | Type                      | Optional | Default | Since | Deprecated | Description |
| ----------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `workspace` | `Partial<WorkspaceValue>` | ❌       | -       | -     | -          |             |
| `rootPath`  | `string`                  | ❌       | -       | -     | -          |             |

---
