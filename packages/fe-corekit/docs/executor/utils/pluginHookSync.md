## `src/executor/utils/pluginHookSync` (Module)

**Type:** `module src/executor/utils/pluginHookSync`

---

### `runPluginsHookSync` (Function)

**Type:** `(plugins: ExecutorPluginInterface<ExecutorContextInterface<Params, unknown, HookRuntimes>>[], hookName: string, context: ExecutorContextInterface<Params, unknown, HookRuntimes>, args: unknown[]) => Result \| undefined`

#### Parameters

| Name       | Type                                                                                 | Optional | Default | Since | Deprecated | Description                                                      |
| ---------- | ------------------------------------------------------------------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `plugins`  | `ExecutorPluginInterface<ExecutorContextInterface<Params, unknown, HookRuntimes>>[]` | ❌       | -       | -     | -          | Array of plugins to execute (accepts any compatible plugin type) |
| `hookName` | `string`                                                                             | ❌       | -       | -     | -          | Name of the hook function to execute                             |
| `context`  | `ExecutorContextInterface<Params, unknown, HookRuntimes>`                            | ❌       | -       | -     | -          | Execution context containing data and runtime information        |
| `args`     | `unknown[]`                                                                          | ❌       | -       | -     | -          | Additional arguments to pass to the hook function                |

---

#### `runPluginsHookSync` (CallSignature)

**Type:** `Result \| undefined`

Execute a single plugin hook synchronously for all plugins

Core concept:
Sequential sync plugin execution with chain breaking and return value handling.
This is the synchronous version of runPluginsHookAsync.

Execution flow:

1. Reset hook runtimes
2. Iterate through plugins
3. Check if plugin is enabled for the hook
4. Execute plugin hook immediately (no await)
5. Handle plugin results and chain breaking conditions
6. Continue to next plugin or break chain

Key features:

- Plugin enablement checking
- Chain breaking support
- Return value management
- Fully sync execution (no Promise overhead)

Type Parameters:

- Uses flexible type constraints to work with any ExecutorPluginInterface subtype
- Returns Result type based on the hook's return value

**Returns:**

Result of the hook function execution

**Example:**

```typescript
const result = runPluginsHookSync(plugins, 'onBefore', context, data);
```

#### Parameters

| Name       | Type                                                                                 | Optional | Default | Since | Deprecated | Description                                                      |
| ---------- | ------------------------------------------------------------------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `plugins`  | `ExecutorPluginInterface<ExecutorContextInterface<Params, unknown, HookRuntimes>>[]` | ❌       | -       | -     | -          | Array of plugins to execute (accepts any compatible plugin type) |
| `hookName` | `string`                                                                             | ❌       | -       | -     | -          | Name of the hook function to execute                             |
| `context`  | `ExecutorContextInterface<Params, unknown, HookRuntimes>`                            | ❌       | -       | -     | -          | Execution context containing data and runtime information        |
| `args`     | `unknown[]`                                                                          | ❌       | -       | -     | -          | Additional arguments to pass to the hook function                |

---

### `runPluginsHooksSync` (Function)

**Type:** `(plugins: ExecutorPluginInterface<ExecutorContextInterface<Params, unknown, HookRuntimes>>[], hookNames: string \| string[], context: ExecutorContextInterface<Params, unknown, HookRuntimes>, args: unknown[]) => Result \| undefined`

#### Parameters

| Name        | Type                                                                                 | Optional | Default | Since | Deprecated | Description                                                    |
| ----------- | ------------------------------------------------------------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `plugins`   | `ExecutorPluginInterface<ExecutorContextInterface<Params, unknown, HookRuntimes>>[]` | ❌       | -       | -     | -          | Array of plugins to execute                                    |
| `hookNames` | `string \| string[]`                                                                 | ❌       | -       | -     | -          | Single hook name or array of hook names to execute in sequence |
| `context`   | `ExecutorContextInterface<Params, unknown, HookRuntimes>`                            | ❌       | -       | -     | -          | Execution context containing data and runtime information      |
| `args`      | `unknown[]`                                                                          | ❌       | -       | -     | -          | Additional arguments to pass to the hook functions             |

---

#### `runPluginsHooksSync` (CallSignature)

**Type:** `Result \| undefined`

Execute multiple plugin hooks in sequence synchronously

Core concept:
Sequential execution of multiple hooks with chain breaking support.
This is the synchronous version of runPluginsHooksAsync.

Execution flow:

1. Convert hookNames to array if single value
2. Iterate through hook names
3. Execute each hook using runPluginsHookSync
4. Track last return value
5. Check for chain breaking after each hook

**Returns:**

Result of the last executed hook function

**Example:**

```typescript
const result = runPluginsHooksSync(
  plugins,
  ['onBefore', 'onValidate'],
  context
);
```

#### Parameters

| Name        | Type                                                                                 | Optional | Default | Since | Deprecated | Description                                                    |
| ----------- | ------------------------------------------------------------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `plugins`   | `ExecutorPluginInterface<ExecutorContextInterface<Params, unknown, HookRuntimes>>[]` | ❌       | -       | -     | -          | Array of plugins to execute                                    |
| `hookNames` | `string \| string[]`                                                                 | ❌       | -       | -     | -          | Single hook name or array of hook names to execute in sequence |
| `context`   | `ExecutorContextInterface<Params, unknown, HookRuntimes>`                            | ❌       | -       | -     | -          | Execution context containing data and runtime information      |
| `args`      | `unknown[]`                                                                          | ❌       | -       | -     | -          | Additional arguments to pass to the hook functions             |

---
