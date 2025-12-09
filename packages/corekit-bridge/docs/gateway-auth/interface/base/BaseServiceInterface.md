## `src/core/gateway-auth/interface/base/BaseServiceInterface` (Module)

**Type:** `unknown`

---

### `BaseServiceInterface` (Interface)

**Type:** `unknown`

**Since:** `1.8.0`

Base service interface

Defines the standard contract for all gateway services that use async stores and gateways.
This interface provides a common foundation ensuring consistent service structure across different
gateway implementations. It abstracts the core service infrastructure, allowing services to focus
on their specific business logic while maintaining a unified interface for store and gateway access.

- Significance: Provides a common foundation for all gateway services
- Core idea: Define standard contract for services that use async stores and gateways
- Main function: Provide access to store and gateway instances
- Main purpose: Ensure consistent service structure across different gateway implementations

Core features:

- Store access: Provides access to the async store instance for state management
- Gateway access: Provides access to the gateway instance for API operations
- Service identification: Includes service name for logging and debugging

Design decisions:

- Store is required: All services must have a store for state management
- Gateway is optional: Services can work without gateway (e.g., mock services)
- Service name is readonly: Prevents accidental modification after construction

**Example:** Basic usage

```typescript
class MyService implements BaseServiceInterface<MyStore, MyGateway> {
  readonly serviceName = 'MyService';

  getStore(): MyStore {
    return this.store;
  }

  getGateway(): MyGateway | null {
    return this.gateway;
  }
}
```

---

#### `serviceName` (Property)

**Type:** `string \| symbol`

Service name identifier

Used for logging, debugging, and service identification.
Should be set during construction and remain constant.

---

#### `getGateway` (Method)

**Type:** `() => undefined \| Gateway`

---

##### `getGateway` (CallSignature)

**Type:** `undefined \| Gateway`

Get the gateway instance

Returns the gateway instance used by this service for API operations.
Returns
`null`
if no gateway was configured.

**Returns:**

The gateway instance, or
`null`
if not configured

**Example:** Access gateway methods

```typescript
const gateway = service.getGateway();
if (gateway) {
  await gateway.login(params);
}
```

**Example:** Check if gateway is available

```typescript
const gateway = service.getGateway();
if (!gateway) {
  console.warn('Gateway not configured');
}
```

---

#### `getLogger` (Method)

**Type:** `() => undefined \| LoggerInterface`

---

##### `getLogger` (CallSignature)

**Type:** `undefined \| LoggerInterface`

Get the logger instance

Returns the logger instance used by this service for logging.
Returns
`null`
if no logger was configured.

**Returns:**

The logger instance, or
`null`
if not configured

---

#### `getStore` (Method)

**Type:** `() => Store`

---

##### `getStore` (CallSignature)

**Type:** `Store`

Get the async store instance

Returns the store instance used by this service for state management.
The store provides reactive state access and subscription capabilities.

**Returns:**

The store instance for state management

**Example:** Access store state

```typescript
const store = service.getStore();
const state = store.getState();
console.log('Current state:', state);
```

**Example:** Subscribe to state changes

```typescript
const store = service.getStore();
store.observe((state) => {
  console.log('State changed:', state);
});
```

---

### `ServiceGatewayType` (TypeAlias)

**Type:** `object`

---
