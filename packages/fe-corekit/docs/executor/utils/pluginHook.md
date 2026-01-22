## `src/executor/utils/pluginHook` (Module)

**Type:** `module src/executor/utils/pluginHook`

---

### `normalizeHookNames` (Function)

**Type:** `(hookNames: string \| string[]) => ExecutorPluginNameType[]`

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description                             |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `hookNames` | `string \| string[]` | ❌       | -       | -     | -          | Single hook name or array of hook names |

---

#### `normalizeHookNames` (CallSignature)

**Type:** `ExecutorPluginNameType[]`

Normalize hook names to array format

Shared utility to ensure hook names are always in array format for iteration.
Used by both sync and async versions.

**Returns:**

Array of hook names

#### Parameters

| Name        | Type                 | Optional | Default | Since | Deprecated | Description                             |
| ----------- | -------------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `hookNames` | `string \| string[]` | ❌       | -       | -     | -          | Single hook name or array of hook names |

---

### `runPluginHook` (Function)

**Type:** `(plugin: ExecutorPluginInterface<Ctx>, hookName: string, context: ExecutorContextInterface<unknown, unknown, HookRuntimes>, args: unknown[]) => unknown \| Promise<unknown>`

#### Parameters

| Name       | Type                                                       | Optional | Default | Since | Deprecated | Description                              |
| ---------- | ---------------------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `plugin`   | `ExecutorPluginInterface<Ctx>`                             | ❌       | -       | -     | -          | Plugin instance containing the hook      |
| `hookName` | `string`                                                   | ❌       | -       | -     | -          | Name of the hook function to execute     |
| `context`  | `ExecutorContextInterface<unknown, unknown, HookRuntimes>` | ❌       | -       | -     | -          | Execution context to pass to the hook    |
| `args`     | `unknown[]`                                                | ❌       | -       | -     | -          | Additional arguments to pass to the hook |

---

#### `runPluginHook` (CallSignature)

**Type:** `unknown \| Promise<unknown>`

Execute a plugin hook function

Core concept:
Universal hook execution that works with both sync and async hooks.
Automatically handles undefined hooks and returns appropriate values.

Key features:

- Type safety: Ensures hook is a function before execution
- Sync/Async support: Returns sync value or Promise based on hook implementation
- Safe execution: Returns undefined if hook doesn't exist
- No overhead: Direct function call without wrapper logic

Execution flow:

1. Check if hook exists and is a function
2. If not, return undefined
3. Otherwise, execute hook with context and args
4. Return result (can be sync value or Promise)

**Returns:**

Hook execution result (sync value or Promise) or undefined if hook doesn't exist

**Example:** Async usage

```typescript
const result = await PluginUtil.runHook(plugin, 'onBefore', context, data);
```

**Example:** Sync usage

```typescript
const result = PluginUtil.runHook(plugin, 'onBefore', context, data);
```

#### Parameters

| Name       | Type                                                       | Optional | Default | Since | Deprecated | Description                              |
| ---------- | ---------------------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `plugin`   | `ExecutorPluginInterface<Ctx>`                             | ❌       | -       | -     | -          | Plugin instance containing the hook      |
| `hookName` | `string`                                                   | ❌       | -       | -     | -          | Name of the hook function to execute     |
| `context`  | `ExecutorContextInterface<unknown, unknown, HookRuntimes>` | ❌       | -       | -     | -          | Execution context to pass to the hook    |
| `args`     | `unknown[]`                                                | ❌       | -       | -     | -          | Additional arguments to pass to the hook |

---

### `runPluginsHookAsync` (Function)

**Type:** `(plugins: ExecutorPluginInterface<ExecutorContextInterface<Params, unknown, HookRuntimes>>[], hookName: string, context: ExecutorContextInterface<Params, unknown, HookRuntimes>, args: unknown[]) => Promise<Result \| undefined>`

#### Parameters

| Name       | Type                                                                                 | Optional | Default | Since | Deprecated | Description                                                      |
| ---------- | ------------------------------------------------------------------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `plugins`  | `ExecutorPluginInterface<ExecutorContextInterface<Params, unknown, HookRuntimes>>[]` | ❌       | -       | -     | -          | Array of plugins to execute (accepts any compatible plugin type) |
| `hookName` | `string`                                                                             | ❌       | -       | -     | -          | Name of the hook function to execute                             |
| `context`  | `ExecutorContextInterface<Params, unknown, HookRuntimes>`                            | ❌       | -       | -     | -          | Execution context containing data and runtime information        |
| `args`     | `unknown[]`                                                                          | ❌       | -       | -     | -          | Additional arguments to pass to the hook function                |

---

#### `runPluginsHookAsync` (CallSignature)

**Type:** `Promise<Result \| undefined>`

Execute a single plugin hook asynchronously for all plugins

Core concept:
Sequential async plugin execution with chain breaking and return value handling

Execution flow:

1. Reset hook runtimes
2. Iterate through plugins
3. Check if plugin is enabled for the hook
4. Execute plugin hook with await
5. Handle plugin results and chain breaking conditions
6. Continue to next plugin or break chain

Key features:

- Plugin enablement checking
- Chain breaking support
- Return value management
- Fully async execution with await

Type Parameters:

- Uses flexible type constraints to work with any ExecutorPluginInterface subtype
- Accepts plugins with any Ctx that extends ExecutorContextInterface<unknown, unknown>
- Returns Params type based on the context's parameter type

Why flexible types?

- LifecycleExecutor has class-level Ctx generic (ExecutorContextInterface<unknown, unknown>)
- runHook has method-level Params generic
- These are independent type parameters that TypeScript can't automatically relate
- Flexible constraint allows safe type coercion at call site

**Returns:**

Promise resolving to the result of the hook function execution

**Example:**

```typescript
const result = await runPluginsHookAsync(plugins, 'onBefore', context, data);
```

#### Parameters

| Name       | Type                                                                                 | Optional | Default | Since | Deprecated | Description                                                      |
| ---------- | ------------------------------------------------------------------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `plugins`  | `ExecutorPluginInterface<ExecutorContextInterface<Params, unknown, HookRuntimes>>[]` | ❌       | -       | -     | -          | Array of plugins to execute (accepts any compatible plugin type) |
| `hookName` | `string`                                                                             | ❌       | -       | -     | -          | Name of the hook function to execute                             |
| `context`  | `ExecutorContextInterface<Params, unknown, HookRuntimes>`                            | ❌       | -       | -     | -          | Execution context containing data and runtime information        |
| `args`     | `unknown[]`                                                                          | ❌       | -       | -     | -          | Additional arguments to pass to the hook function                |

---

### `runPluginsHooksAsync` (Function)

**Type:** `(plugins: ExecutorPluginInterface<ExecutorContextInterface<Params, unknown, HookRuntimes>>[], hookNames: string \| string[], context: ExecutorContextInterface<Params, unknown, HookRuntimes>, args: unknown[]) => Promise<Result \| undefined>`

#### Parameters

| Name        | Type                                                                                 | Optional | Default | Since | Deprecated | Description                                                    |
| ----------- | ------------------------------------------------------------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `plugins`   | `ExecutorPluginInterface<ExecutorContextInterface<Params, unknown, HookRuntimes>>[]` | ❌       | -       | -     | -          | Array of plugins to execute                                    |
| `hookNames` | `string \| string[]`                                                                 | ❌       | -       | -     | -          | Single hook name or array of hook names to execute in sequence |
| `context`   | `ExecutorContextInterface<Params, unknown, HookRuntimes>`                            | ❌       | -       | -     | -          | Execution context containing data and runtime information      |
| `args`      | `unknown[]`                                                                          | ❌       | -       | -     | -          | Additional arguments to pass to the hook functions             |

---

#### `runPluginsHooksAsync` (CallSignature)

**Type:** `Promise<Result \| undefined>`

Execute multiple plugin hooks in sequence asynchronously

Core concept:
Sequential execution of multiple hooks with chain breaking support

Execution flow:

1. Convert hookNames to array if single value
2. Iterate through hook names
3. Execute each hook using runPluginHookAsync
4. Track last return value
5. Check for chain breaking after each hook

**Returns:**

Promise resolving to the result of the last executed hook function

**Example:**

```typescript
const result = await runPluginHooksAsync(
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
