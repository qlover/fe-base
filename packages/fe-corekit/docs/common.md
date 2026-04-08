## `src/common` (Module)

**Type:** `module src/common`

---

### `Intersection` (TypeAlias)

**Type:** `type Intersection<T1, T2>`

**Since:** `1.0.14`

Create an intersection type containing only common properties

This utility type extracts properties that exist in both types and creates
a new type with those properties. The resulting type contains a union of
the property types from both input types.

Use cases:

- Finding common properties between types
- Type merging with overlap handling
- API response type composition
- Shared interface extraction

**Example:** Basic usage

```ts
type User = { id: number; name: string; email: string };
type Admin = { id: number; name: string; role: string };
type Common = Intersection<User, Admin>;
// { id: number | number; name: string | string }
// Simplifies to: { id: number; name: string }
```

**Example:** API response merging

```ts
type APIResponse = { status: number; data: unknown; timestamp: string };
type CachedResponse = { status: number; data: unknown; cached: boolean };
type SharedFields = Intersection<APIResponse, CachedResponse>;
// { status: number; data: unknown }
```

**Example:** Type compatibility checking

```ts
type FormData = { username: string; email: string; password: string };
type UserProfile = { username: string; email: string; bio: string };
type EditableFields = Intersection<FormData, UserProfile>;
// { username: string; email: string }
```

---

### `PartialDeep` (TypeAlias)

**Type:** `type PartialDeep<T>`

**Since:** `3.0.0`

Create a deeply partial type with optional nested properties

This utility type recursively makes all properties optional, including
nested object properties. Unlike TypeScript's built-in `Partial<T>`,
this type applies the optional modifier to all levels of nesting.

Use cases:

- Partial updates for nested objects
- Optional configuration objects
- Flexible API request payloads
- Form state management with partial data

**Example:** Basic usage

```ts
type Config = {
  server: {
    host: string;
    port: number;
    ssl: {
      enabled: boolean;
      cert: string;
    };
  };
  database: {
    url: string;
  };
};

type PartialConfig = PartialDeep<Config>;
// All properties are optional, including nested ones:
// {
//   server?: {
//     host?: string;
//     port?: number;
//     ssl?: {
//       enabled?: boolean;
//       cert?: string;
//     };
//   };
//   database?: {
//     url?: string;
//   };
// }
```

**Example:** Partial updates

```ts
interface User {
  profile: {
    name: string;
    email: string;
    settings: {
      theme: string;
      notifications: boolean;
    };
  };
}

function updateUser(userId: string, updates: PartialDeep<User>) {
  // Can update any nested property without providing all fields
}

updateUser('123', {
  profile: {
    settings: {
      theme: 'dark' // Only update theme, other fields remain unchanged
    }
  }
});
```

**Example:** Form state management

```ts
interface FormState {
  user: {
    name: string;
    contact: {
      email: string;
      phone: string;
    };
  };
}

type PartialFormState = PartialDeep<FormState>;

const formState: PartialFormState = {
  user: {
    contact: {
      email: 'user@example.com'
      // phone is optional
    }
    // name is optional
  }
};
```

---

### `ValueOf` (TypeAlias)

**Type:** `type ValueOf<T>`

**Since:** `1.0.14`

Extract all possible value types from an object type

This utility type creates a union of all property value types from an object,
which is useful for type narrowing, validation, and working with object values
in a type-safe manner.

Use cases:

- Type narrowing for object values
- Creating union types from object properties
- Validating values against allowed object values
- Generic constraints for value types

**Example:** Basic usage

```ts
type User = { id: number; name: string; active: boolean };
type UserValue = ValueOf<User>; // number | string | boolean

function processValue(value: UserValue) {
  // value can be number, string, or boolean
}
```

**Example:** With nested objects

```ts
type Config = {
  database: { host: string; port: number };
  cache: { enabled: boolean; ttl: number };
};
type ConfigValue = ValueOf<Config>;
// { host: string; port: number } | { enabled: boolean; ttl: number }
```

**Example:** Type validation

```ts
type Status = { pending: 'pending'; active: 'active'; done: 'done' };
type StatusValue = ValueOf<Status>; // 'pending' | 'active' | 'done'

function isValidStatus(value: string): value is StatusValue {
  return ['pending', 'active', 'done'].includes(value);
}
```

---
