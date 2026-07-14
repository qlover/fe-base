## `TemplateEngine` (Module)

**Type:** `module TemplateEngine`

Lightweight, safe template engine for variable interpolation.

Supports path-based value lookup (e.g. `user.name`, `items[0].id`) without
executing arbitrary JavaScript. Designed as a drop-in replacement for
simple `lodash.template` use cases in scripts and configuration formatting.

Default syntax: ES6 template-literal `${ path }`.

**Example:** Basic usage

```typescript
const engine = new TemplateEngine();
engine.render('Hello ${user.name}!', { user: { name: 'Alice' } });
// => 'Hello Alice!'
```

**Example:** Reusable compiled renderer

```typescript
const render = engine.compile('git clone ${repo.url}');
render({ repo: { url: 'https://github.com/user/repo.git' } });
```

---

### `TemplateEngine` (Class)

**Type:** `class TemplateEngine`

Lightweight template engine for safe variable interpolation.

Features:

- ES6 `${ path }` syntax by default
- Nested path access and numeric array indices
- Prototype pollution protection (`safePrototype`, enabled by default)
- Compile-once, render-many for performance

Does NOT execute `<% code %>` logic blocks or arbitrary JavaScript.

---

#### `new TemplateEngine` (Constructor)

**Type:** `(options: TemplateOptions) => TemplateEngine`

#### Parameters

| Name                                                            | Type              | Optional | Default | Since | Deprecated | Description                                    |
| --------------------------------------------------------------- | ----------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `options`                                                       | `TemplateOptions` | ✅       | `{}`    | -     | -          | Engine configuration. All fields are optional; |
| defaults to ES6 `${}` interpolation with safe prototype access. |

---

#### `compile` (Method)

**Type:** `(template: string) => RenderFn`

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description                             |
| ---------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `template` | `string` | ❌       | -       | -     | -          | Template string containing placeholders |

---

##### `compile` (CallSignature)

**Type:** `RenderFn`

Compile a template into a reusable render function.

Path parsing and validation happen once at compile time; subsequent
renders only perform value lookup and string assembly.

**Returns:**

Render function bound to the compiled template

**Throws:**

When template is not a string

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description                             |
| ---------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `template` | `string` | ❌       | -       | -     | -          | Template string containing placeholders |

---

#### `render` (Method)

**Type:** `(template: string, data: Record<string, any>) => string`

#### Parameters

| Name       | Type                  | Optional | Default | Since | Deprecated | Description                              |
| ---------- | --------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `template` | `string`              | ❌       | -       | -     | -          | Template string containing placeholders  |
| `data`     | `Record<string, any>` | ❌       | -       | -     | -          | Context object for variable substitution |

---

##### `render` (CallSignature)

**Type:** `string`

Render a template in one shot.

Convenience wrapper around `compile(template)(data)`.
Prefer <a href="#compile-method" class="tsd-kind-method">compile</a> when the same template is rendered multiple times.

#### Parameters

| Name       | Type                  | Optional | Default | Since | Deprecated | Description                              |
| ---------- | --------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `template` | `string`              | ❌       | -       | -     | -          | Template string containing placeholders  |
| `data`     | `Record<string, any>` | ❌       | -       | -     | -          | Context object for variable substitution |

---

### `TemplateOptions` (Interface)

**Type:** `interface TemplateOptions`

Template engine configuration options.

---

#### `defaultValue` (Property)

**Type:** `unknown`

Default when value is missing (undefined/null) or path is invalid.

---

#### `escapeHtml` (Property)

**Type:** `boolean`

Escape HTML entities in output. Default false.

---

#### `interpolate` (Property)

**Type:** `RegExp`

Interpolation regex with exactly one capture group for the variable path.
Defaults to <a href="#es6-property" class="tsd-kind-property">interpolatePreset.ES6</a>.

---

#### `keepUnmatched` (Property)

**Type:** `boolean`

Keep original placeholder when value is missing. Default false.

---

#### `safePrototype` (Property)

**Type:** `boolean`

Block prototype keys and only read own properties. Default true.

---

#### `stringifyObject` (Property)

**Type:** `boolean`

Serialize objects via JSON.stringify. Default true.

---

#### `variable` (Property)

**Type:** `string`

Required path prefix in templates (lodash `variable` option semantics).
e.g. `variable: 'data'` → use `${data.user.name}` with `{ user: { name } }`.

---

### `RenderFn` (TypeAlias)

**Type:** `Object`

Compiled render function returned by <a href="#compile-method" class="tsd-kind-method">TemplateEngine.compile</a>.

---

### `interpolatePreset` (Variable)

**Type:** `Object`

**Default:** `{}`

Built-in interpolation regex presets.

Pass one of these to `new TemplateEngine({ interpolate })` when you need
a syntax other than the default ES6-style delimiters.

**Example:** ES6 (default — no extra config needed)

```typescript
new TemplateEngine().render('Hello ${name}!', { name: 'World' });
```

**Example:** Lodash / EJS style

```typescript
new TemplateEngine({ interpolate: interpolatePreset.LODASH }).render(
  'Hello <%= name %>!',
  { name: 'World' }
);
```

**Example:** Mustache style

```typescript
new TemplateEngine({ interpolate: interpolatePreset.MUSTACHE }).render(
  'Hello {{ name }}!',
  { name: 'World' }
);
```

---

#### `ES6` (Property)

**Type:** `RegExp`

**Default:** `{}`

ES6 template-literal style: `${ variable }`

This is the default for <a href="#templateengine-class" class="tsd-kind-class">TemplateEngine</a>.

**Example:**

```typescript
engine.render('${user.name}', { user: { name: 'Bob' } });
```

---

#### `LODASH` (Property)

**Type:** `RegExp`

**Default:** `{}`

Lodash / EJS style: `<%= variable %>`

Useful when migrating existing lodash templates.

**Example:**

```typescript
new TemplateEngine({ interpolate: interpolatePreset.LODASH }).render(
  '<%= repo.url %>',
  { repo: { url: 'https://example.com' } }
);
```

---

#### `MUSTACHE` (Property)

**Type:** `RegExp`

**Default:** `{}`

Mustache / Handlebars style: `{{ variable }}`

**Example:**

```typescript
new TemplateEngine({ interpolate: interpolatePreset.MUSTACHE }).render(
  '{{ user.name }}',
  { user: { name: 'Alice' } }
);
```

---
