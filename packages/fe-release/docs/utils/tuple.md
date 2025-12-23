## `PluginTuple` (Module)

**Type:** `module PluginTuple`

Type-safe plugin tuple creation and handling

This module provides utilities for creating and handling tuples that
represent plugin configurations. It ensures type safety when working
with plugin constructors and their parameters.

Core Features:

- Type-safe plugin class handling
- Constructor parameter inference
- Plugin tuple creation

**Example:** Basic usage

```typescript
class MyPlugin extends ScriptPlugin {
  constructor(context: ScriptContext, config: { option: string }) {
    super(context);
  }
}

const pluginTuple = tuple(MyPlugin, { option: 'value' });
// [MyPlugin, { option: 'value' }]
```

**Example:** Plugin name string

```typescript
const pluginTuple = tuple('MyPlugin', { option: 'value' });
// ['MyPlugin', { option: 'value' }]
```

---

### `PluginClass` (TypeAlias)

**Type:** `Object`

Plugin class constructor type

Represents a constructor for a class that extends ScriptPlugin.
Supports generic constructor arguments.

**Example:**

```typescript
class MyPlugin extends ScriptPlugin {
  constructor(context: ScriptContext, config: { option: string }) {
    super(context);
  }
}

const PluginCtor: PluginClass = MyPlugin;
```

---

### `PluginConstructorParams` (TypeAlias)

**Type:** `type PluginConstructorParams<T>`

Plugin constructor parameters type

Extracts the constructor parameter types for a plugin class,
excluding the first parameter (context). Uses TypeScript's
conditional types and inference to extract parameter types.

**Example:**

```typescript
class MyPlugin extends ScriptPlugin {
  constructor(
    context: ScriptContext,
    config: { option: string },
    extra: number
  ) {
    super(context);
  }
}

// Type: [{ option: string }, number]
type Params = PluginConstructorParams<typeof MyPlugin>;
```

---

### `PluginTuple` (TypeAlias)

**Type:** `type PluginTuple<T>`

Plugin configuration tuple type

Represents a tuple containing a plugin class (or name) and its
constructor arguments. Used for plugin registration and loading.

**Example:**

```typescript
class MyPlugin extends ScriptPlugin {
  constructor(context: ScriptContext, config: { option: string }) {
    super(context);
  }
}

// Type: [typeof MyPlugin, { option: string }]
type Tuple = PluginTuple<typeof MyPlugin>;

// Type: [string, { option: string }]
type StringTuple = PluginTuple<'MyPlugin'>;
```

---

### `tuple` (Function)

**Type:** `(plugin: string \| T, args: PluginConstructorParams<T>) => PluginTuple<T>`

#### Parameters

| Name     | Type                         | Optional | Default | Since | Deprecated | Description                  |
| -------- | ---------------------------- | -------- | ------- | ----- | ---------- | ---------------------------- |
| `plugin` | `string \| T`                | ❌       | -       | -     | -          | Plugin class or name         |
| `args`   | `PluginConstructorParams<T>` | ❌       | -       | -     | -          | Plugin constructor arguments |

---

#### `tuple` (CallSignature)

**Type:** `PluginTuple<T>`

Creates a type-safe plugin configuration tuple

Helper function for creating tuples that represent plugin
configurations with proper type inference for constructor
arguments.

**Returns:**

Plugin configuration tuple

**Example:** Class-based plugin

```typescript
class MyPlugin extends ScriptPlugin {
  constructor(
    context: ScriptContext,
    config: { option: string },
    extra: number
  ) {
    super(context);
  }
}

const config = tuple(MyPlugin, { option: 'value' }, 42);
// [MyPlugin, { option: 'value' }, 42]
```

**Example:** String-based plugin

```typescript
const config = tuple('MyPlugin', { option: 'value' });
// ['MyPlugin', { option: 'value' }]
```

#### Parameters

| Name     | Type                         | Optional | Default | Since | Deprecated | Description                  |
| -------- | ---------------------------- | -------- | ------- | ----- | ---------- | ---------------------------- |
| `plugin` | `string \| T`                | ❌       | -       | -     | -          | Plugin class or name         |
| `args`   | `PluginConstructorParams<T>` | ❌       | -       | -     | -          | Plugin constructor arguments |

---
