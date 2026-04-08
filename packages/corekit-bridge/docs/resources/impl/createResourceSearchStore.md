## `src/core/resources/impl/createResourceSearchStore` (Module)

**Type:** `module src/core/resources/impl/createResourceSearchStore`

---

### `createResourceSearchStore` (Function)

**Type:** `(resourceName: GatewayServiceName, store: ResourceSearchStore<TItem, Criteria, string> \| Partial<ResourceSearchStoreStateOptions<TItem, Criteria>>) => ResourceSearchStore<TItem, Criteria>`

#### Parameters

| Name                                                                                                                                     | Type                                                                                                        | Optional | Default | Since | Deprecated | Description                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `resourceName`                                                                                                                           | `GatewayServiceName`                                                                                        | ❌       | -       | -     | -          | Namespaced store id (usually matches <a href="../../gateway-service/impl/GatewayService.md#gatewayservicename-typealias" class="tsd-kind-type-alias">GatewayServiceName</a> / `serviceName`) |
| `store`                                                                                                                                  | `ResourceSearchStore<TItem, Criteria, string> \| Partial<ResourceSearchStoreStateOptions<TItem, Criteria>>` | ✅       | -       | -     | -          | Pass a ready-made store, or a partial <a href="./ResourceSearchStore.md#resourcesearchstorestateoptions-interface" class="tsd-kind-interface">ResourceSearchStoreStateOptions</a> to seed    |
| <a href="./ResourceSearchStore.md#resourcesearchstorestate-class" class="tsd-kind-class">ResourceSearchStoreState</a> via `defaultState` |

---

#### `createResourceSearchStore` (CallSignature)

**Type:** `ResourceSearchStore<TItem, Criteria>`

Return an existing <a href="./ResourceSearchStore.md#resourcesearchstore-class" class="tsd-kind-class">ResourceSearchStore</a> or create one with `defaultState` built from optional seed options.

**Returns:**

A concrete <a href="./ResourceSearchStore.md#resourcesearchstore-class" class="tsd-kind-class">ResourceSearchStore</a> instance

**Example:** Share one store between tests and production wiring

```typescript
const store = createResourceSearchStore('feed', {
  criteria: { pageSize: 20 },
  stageRefs: []
});
const scroll = new ResourceScroll(gateway, { store });
```

#### Parameters

| Name                                                                                                                                     | Type                                                                                                        | Optional | Default | Since | Deprecated | Description                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `resourceName`                                                                                                                           | `GatewayServiceName`                                                                                        | ❌       | -       | -     | -          | Namespaced store id (usually matches <a href="../../gateway-service/impl/GatewayService.md#gatewayservicename-typealias" class="tsd-kind-type-alias">GatewayServiceName</a> / `serviceName`) |
| `store`                                                                                                                                  | `ResourceSearchStore<TItem, Criteria, string> \| Partial<ResourceSearchStoreStateOptions<TItem, Criteria>>` | ✅       | -       | -     | -          | Pass a ready-made store, or a partial <a href="./ResourceSearchStore.md#resourcesearchstorestateoptions-interface" class="tsd-kind-interface">ResourceSearchStoreStateOptions</a> to seed    |
| <a href="./ResourceSearchStore.md#resourcesearchstorestate-class" class="tsd-kind-class">ResourceSearchStoreState</a> via `defaultState` |

---
