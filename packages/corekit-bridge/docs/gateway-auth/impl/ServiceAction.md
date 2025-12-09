## `src/core/gateway-auth/impl/ServiceAction` (Module)

**Type:** `unknown`

---

### `ServiceActionType` (TypeAlias)

**Type:** `unknown`

Service action type

- Significance: Type-safe union of all predefined service action names
- Core idea: Extract action names from ServiceAction constants as a type
- Main function: Provide type safety for action names in plugins and services
- Main purpose: Ensure only valid action names are used

This type represents all possible service action names:

- `'login'`

- `'logout'`

- `'register'`

- `'getUserInfo'`

- `'refreshUserInfo'`

**Example:** Type-safe action usage

```typescript
function handleAction(action: ServiceActionType) {
  switch (action) {
    case ServiceAction.LOGIN:
      // Handle login
      break;
    case ServiceAction.LOGOUT:
      // Handle logout
      break;
  }
}
```

---

### `ServiceAction` (Variable)

**Type:** `Readonly<Object>`

**Default:** `{}`

Predefined service action constants

- Significance: Provides standardized action names for gateway service operations
- Core idea: Define common action names as constants to ensure consistency
- Main function: Identify actions for plugin hooks and executor context
- Main purpose: Enable type-safe action identification across services

Core features:

- Immutable constants: Uses
  `Object.freeze`
  to prevent modification
- Standardized names: Ensures consistent action naming across services
- Plugin integration: Used to generate hook names (e.g.,
  `onLoginBefore`
  ,
  `onLogoutSuccess`
  )
- Type safety: Used to create
  `ServiceActionType`
  union type

Action names:

- `LOGIN`
  : User login action ('login')
- `LOGOUT`
  : User logout action ('logout')
- `REGISTER`
  : User registration action ('register')
- `GET_USER_INFO`
  : Get user information action ('getUserInfo')
- `REFRESH_USER`
  : Refresh user information action ('refreshUserInfo')

**Example:** Usage in service

```typescript
await service.execute(ServiceAction.LOGIN, params);
await service.execute(ServiceAction.LOGOUT);
```

**Example:** Usage in plugin

```typescript
executor.use({
  onLoginBefore: (context) => {
    // Called when LOGIN action is executed
    console.log('Action:', context.parameters.actionName); // 'login'
  },
  onLogoutSuccess: (context) => {
    // Called when LOGOUT action succeeds
  }
});
```

**Example:** Type checking

```typescript
function handleAction(action: ServiceActionType) {
  switch (action) {
    case ServiceAction.LOGIN:
      // Handle login
      break;
    case ServiceAction.LOGOUT:
      // Handle logout
      break;
  }
}
```

---
