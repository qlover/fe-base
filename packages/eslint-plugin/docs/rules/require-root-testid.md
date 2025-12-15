## `require-root-testid` (Module)

**Type:** `module require-root-testid`

ESLint rule that enforces the presence of
`data-testid`
attribute on root elements of TSX components

This rule ensures that all root elements in React components have a
`data-testid`
attribute,
which is essential for testing purposes. The rule automatically fixes violations by adding
a
`data-testid`
attribute with the component name as the value.

## Rule Details

The rule checks for root JSX elements in component functions. A root element is defined as:

- An element directly returned from a function (in a return statement)
- An element that is the body of an arrow function expression

When a root element is missing the
`data-testid`
attribute, the rule will:

1. Report an error
2. Automatically fix it by adding
   `data-testid="ComponentName"`
   where ComponentName is
   derived from the component function name or JSX element name

## Examples

Examples of **incorrect** code for this rule:

```tsx
function Component() {
  return <div>Content</div>;
}

const ArrowComponent = () => {
  return <div className="test">Content</div>;
};
```

Examples of **correct** code for this rule:

```tsx
function Component() {
  return <div data-testid="Component">Content</div>;
}

const ArrowComponent = () => {
  return (
    <div data-testid="ArrowComponent" className="test">
      Content
    </div>
  );
};
```

## Options

This rule accepts an options object with the following properties:

###

`exclude`

**Type:**
`string | string[] | RegExp | ((componentName: string) => boolean) | Array<string | RegExp | ((componentName: string) => boolean)>`

**Default:**
`undefined`

Components to exclude from testid requirement. This option allows you to specify which
components should be exempt from requiring a
`data-testid`
attribute on their root elements.
The matching is performed against the JSX element name (e.g.,
`<ConfigProvider>`
,
`<Provider>`
)
rather than the component function name.

**Supported formats:**

1. **Array of strings**: Exact match or endsWith match

```ts
exclude: ['ConfigProvider', 'Provider'];
```

- Matches:
  `<ConfigProvider>`
  ,
  `<Provider>`
  ,
  `<MyProvider>`

- Does not match:
  `<Config>`
  ,
  `<MyConfigProvider>`
  (unless ends with 'Provider')

2. **RegExp**: Regular expression pattern

```ts
exclude: /Provider$/;
```

- Matches any component name ending with 'Provider'

3. **String**: Treated as regex if wrapped in slashes, otherwise exact/endsWith match

```ts
exclude: '/Provider$/'; // Regex pattern
exclude: 'Provider'; // Exact match or endsWith
```

4. **Function**: Custom matching logic

```ts
exclude: (name: string) => name.includes('Provider');
```

5. **Array of mixed types**: Combine multiple matchers

```ts
exclude: ['ConfigProvider', /Provider$/, (name) => name.includes('Provider')];
```

**Configuration examples:**

Exclude all Provider components:

```json
{
  "rules": {
    "@your-plugin/require-root-testid": [
      "error",
      {
        "exclude": "/Provider$/"
      }
    ]
  }
}
```

Exclude specific components:

```json
{
  "rules": {
    "@your-plugin/require-root-testid": [
      "error",
      {
        "exclude": ["ConfigProvider", "ThemeProvider"]
      }
    ]
  }
}
```

Exclude components with custom function:

```json
{
  "rules": {
    "@your-plugin/require-root-testid": [
      "error",
      {
        "exclude": ["ConfigProvider", "/Provider$/"]
      }
    ]
  }
}
```

## When Not To Use It

If you are not using test IDs in your testing strategy or if you have a different approach
to selecting elements in tests, you can disable this rule.

## Implementation Notes

- The rule uses automatic fixing to add
  `data-testid`
  attributes
- The testid value is derived from the component function name, or falls back to the JSX
  element name, or defaults to 'component'
- Exclusion matching is performed against JSX element names, not component function names
- The rule handles both function declarations and arrow function components
- JSX member expressions (e.g.,
  `<Antd.ConfigProvider>`
  ) are supported

**See:**

- [Rule source](../../src/rules/require-root-testid.ts)

- [Test source](../../__tests__/rules/require-root-testid.test.ts)

---

### `RULE_NAME` (Variable)

**Type:** `"require-root-testid"`

**Default:** `'require-root-testid'`

---

### `requireRootTestid` (Variable)

**Type:** `RuleModule<"missingTestId", Options, unknown, RuleListener>`

**Default:** `{}`

ESLint rule implementation for require-root-testid

---
