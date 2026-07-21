## `src/core/resources/impl/createResourceSearchStore` (Module)

**Type:** `module src/core/resources/impl/createResourceSearchStore`

---

### `createResourceSearchStore` (Function)

**Type:** `(resourceName: GatewayServiceName, store: ResourceSearchStore<TItem, Criteria, string> \| Partial<ResourceSearchStoreStateOptions<TItem, Criteria>>) => ResourceSearchStore<TItem, Criteria>`

#### Parameters

| Name                                                                                                   | Type                                                                                                        | Optional | Default | Since | Deprecated | Description                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `resourceName`                                                                                         | `GatewayServiceName`                                                                                        | ❌       | -       | -     | -          | Namespaced store id (usually matches [GatewayServiceName](../../gateway-service/impl/GatewayService.md#gatewayservicename-typealias) / `serviceName`) |
| `store`                                                                                                | `ResourceSearchStore<TItem, Criteria, string> \| Partial<ResourceSearchStoreStateOptions<TItem, Criteria>>` | ✅       | -       | -     | -          | Pass a ready-made store, or a partial [ResourceSearchStoreStateOptions](./ResourceSearchStore.md#resourcesearchstorestateoptions-interface) to seed   |
| [ResourceSearchStoreState](./ResourceSearchStore.md#resourcesearchstorestate-class) via `defaultState` |

---

#### `createResourceSearchStore` (CallSignature)

**Type:** `ResourceSearchStore<TItem, Criteria>`

Return an existing [ResourceSearchStore](./ResourceSearchStore.md#resourcesearchstore-class) or create one with `defaultState` built from optional seed options.

**Returns:**

A concrete [ResourceSearchStore](./ResourceSearchStore.md#resourcesearchstore-class) instance

**Example:** Share one store between tests and production wiring

```typescript
const store = createResourceSearchStore('feed', {
  criteria: { pageSize: 20 },
  stageRefs: []
});
const scroll = new ResourceScroll(gateway, { store });
```

#### Parameters

| Name                                                                                                   | Type                                                                                                        | Optional | Default | Since | Deprecated | Description                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `resourceName`                                                                                         | `GatewayServiceName`                                                                                        | ❌       | -       | -     | -          | Namespaced store id (usually matches [GatewayServiceName](../../gateway-service/impl/GatewayService.md#gatewayservicename-typealias) / `serviceName`) |
| `store`                                                                                                | `ResourceSearchStore<TItem, Criteria, string> \| Partial<ResourceSearchStoreStateOptions<TItem, Criteria>>` | ✅       | -       | -     | -          | Pass a ready-made store, or a partial [ResourceSearchStoreStateOptions](./ResourceSearchStore.md#resourcesearchstorestateoptions-interface) to seed   |
| [ResourceSearchStoreState](./ResourceSearchStore.md#resourcesearchstorestate-class) via `defaultState` |

---
