# require-root-testid

Enforces the presence of `data-testid` attribute on root elements of TSX components.

## Rule Details

This rule aims to ensure that all root elements in React components have a `data-testid` attribute, which is essential for testing purposes.

### Examples

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
  return <div data-testid="ArrowComponent" className="test">Content</div>;
};
```

### Options

This rule has no options.

### When Not To Use It

If you are not using test IDs in your testing strategy or if you have a different approach to selecting elements in tests, you can disable this rule.

## Implementation

- [Rule source](../../src/rules/require-root-testid.ts)
- [Test source](../../__tests__/rules/require-root-testid.test.ts) 