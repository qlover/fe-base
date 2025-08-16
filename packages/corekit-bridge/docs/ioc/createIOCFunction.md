## `src/core/ioc/createIOCFunction` (Module)

**Type:** `unknown`

---

### `createIOCFunction` (Function)

**Type:** `(impl: IOCContainerInterface) => IOCFunctionInterface<IdentifierMap>`

#### Parameters

| Name   | Type                    | Optional | Default | Since | Deprecated | Description                  |
| ------ | ----------------------- | -------- | ------- | ----- | ---------- | ---------------------------- |
| `impl` | `IOCContainerInterface` | ❌       | -       | -     | -          | IOC container implementation |

---

#### `createIOCFunction` (CallSignature)

**Type:** `IOCFunctionInterface<IdentifierMap>`

Creates an IOC function factory

Creates an IOC function for retrieving and managing dependency-injected service instances.
Supports service retrieval using strings, Symbols, or class constructors as identifiers.

**Example:**

```typescript
// Basic usage
const ioc = createIOCFunction(container);
const service = ioc(ServiceClass);

// Using type mapping
interface MyServices {
  logger: Logger;
  config: Config;
}
const ioc = createIOCFunction<MyServices>(container);
const logger = ioc('logger');
```

**Returns:**

Enhanced IOC function that includes:

- Direct invocation for service instance retrieval
- implemention property to get current container implementation
- implement method to update container implementation
- get method as an alias for function invocation

#### Parameters

| Name   | Type                    | Optional | Default | Since | Deprecated | Description                  |
| ------ | ----------------------- | -------- | ------- | ----- | ---------- | ---------------------------- |
| `impl` | `IOCContainerInterface` | ❌       | -       | -     | -          | IOC container implementation |

---
