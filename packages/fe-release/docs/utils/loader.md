## `PluginLoader` (Module)

**Type:** `module PluginLoader`

Dynamic plugin loading and instantiation

This module provides utilities for dynamically loading and instantiating
plugins from various sources (ESM imports, file paths, package names).
It supports concurrent loading with limits and fallback mechanisms.

Core Features:

- Dynamic ESM imports
- Fallback to CommonJS require
- Concurrent loading with limits
- Plugin instantiation with context

**Example:** Basic plugin loading

```typescript
// Load plugin by name
const [name, Plugin] = await load('@scope/my-plugin');

// Load and instantiate multiple plugins
const plugins = await loaderPluginsFromPluginTuples(context, [
  tuple(MyPlugin, { option: 'value' }),
  tuple('@scope/my-plugin', { option: 'value' })
]);
```

**Example:** Custom concurrency

```typescript
// Load plugins with custom concurrency limit
const plugins = await loaderPluginsFromPluginTuples(
  context,
  pluginTuples,
  3 // Max 3 concurrent loads
);
```

---

### `load` (Function)

**Type:** `(pluginName: string) => Promise<unknown>`

#### Parameters

| Name         | Type     | Optional | Default | Since | Deprecated | Description                 |
| ------------ | -------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `pluginName` | `string` | ❌       | -       | -     | -          | Plugin name or path to load |

---

#### `load` (CallSignature)

**Type:** `Promise<unknown>`

Dynamically loads a plugin module

Attempts to load a plugin using multiple strategies:

1. Direct ESM import
2. Import from current working directory
3. Fallback to CommonJS require.resolve

**Returns:**

Promise resolving to [plugin name, plugin module]

**Throws:**

If plugin cannot be loaded by any method

**Example:** Package import

```typescript
const [name, Plugin] = await load('@scope/my-plugin');
const instance = new Plugin(context);
```

**Example:** Local file import

```typescript
const [name, Plugin] = await load('./plugins/MyPlugin');
const instance = new Plugin(context);
```

**Example:** Error handling

```typescript
try {
  const [name, Plugin] = await load('non-existent');
} catch (error) {
  console.error('Failed to load plugin:', error);
}
```

#### Parameters

| Name         | Type     | Optional | Default | Since | Deprecated | Description                 |
| ------------ | -------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `pluginName` | `string` | ❌       | -       | -     | -          | Plugin name or path to load |

---

### `loaderPluginsFromPluginTuples` (Function)

**Type:** `(context: default, pluginsTuples: unknown[], maxLimit: number) => Promise<T[]>`

#### Parameters

| Name            | Type        | Optional | Default | Since | Deprecated | Description                                  |
| --------------- | ----------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `context`       | `default`   | ❌       | -       | -     | -          | Release context for plugin initialization    |
| `pluginsTuples` | `unknown[]` | ❌       | -       | -     | -          | Array of plugin configuration tuples         |
| `maxLimit`      | `number`    | ✅       | `5`     | -     | -          | Maximum concurrent plugin loads (default: 5) |

---

#### `loaderPluginsFromPluginTuples` (CallSignature)

**Type:** `Promise<T[]>`

Loads and instantiates multiple plugins concurrently

Takes an array of plugin tuples and creates plugin instances
with the provided context. Supports both class-based and
string-based plugin specifications.

Features:

- Concurrent loading with configurable limit
- Mixed plugin types (class/string)
- Automatic context injection
- Type-safe instantiation

**Returns:**

Promise resolving to array of plugin instances

**Example:** Basic usage

```typescript
const plugins = await loaderPluginsFromPluginTuples(context, [
  tuple(MyPlugin, { option: 'value' }),
  tuple('@scope/plugin', { option: 'value' })
]);
```

**Example:** Custom concurrency

```typescript
const plugins = await loaderPluginsFromPluginTuples(
  context,
  pluginTuples,
  3 // Load max 3 plugins at once
);
```

**Example:** Type-safe loading

```typescript
interface MyPlugin extends ScriptPlugin {
  customMethod(): void;
}

const plugins = await loaderPluginsFromPluginTuples<MyPlugin>(
  context,
  pluginTuples
);

plugins.forEach((plugin) => plugin.customMethod());
```

#### Parameters

| Name            | Type        | Optional | Default | Since | Deprecated | Description                                  |
| --------------- | ----------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `context`       | `default`   | ❌       | -       | -     | -          | Release context for plugin initialization    |
| `pluginsTuples` | `unknown[]` | ❌       | -       | -     | -          | Array of plugin configuration tuples         |
| `maxLimit`      | `number`    | ✅       | `5`     | -     | -          | Maximum concurrent plugin loads (default: 5) |

---
