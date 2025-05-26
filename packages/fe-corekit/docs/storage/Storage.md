## Interface `AsyncStorage`
Interface representing an asynchronous storage mechanism.

@example 

```typescript
const storage: AsyncStorage<string, number> = ...;
await storage.setItem('key', 123);
const value = await storage.getItem('key', 0);
```


## Members

### length
The number of items stored.




### clear
Asynchronously clears all stored values.




### getItem
Asynchronously retrieves a value by key.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  key  | The key of the value to retrieve. | `Key` |  |  |
|  defaultValue  | The default value to return if the key is not found. | `T` |  |  |
|  options  | Optional parameters for retrieval. | `unknown` |  |  |


### removeItem
Asynchronously removes a value by key.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  key  | The key of the value to remove. | `Key` |  |  |
|  options  | Optional parameters for removal. | `unknown` |  |  |


### setItem
Asynchronously stores a value with the specified key.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  key  | The key to identify the stored value. | `Key` |  |  |
|  value  | The value to store. | `T` |  |  |
|  options  | Optional parameters for storage. | `unknown` |  |  |


## Interface `SyncStorage`
Interface representing a synchronous storage mechanism.

@example 

```typescript
const storage: SyncStorage<string, number> = ...;
storage.setItem('key', 123);
const value = storage.getItem('key', 0);
```


## Members

### length
The number of items stored.




### clear
Clears all stored values.




### getItem
Retrieves a value by key.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  key  | The key of the value to retrieve. | `Key` |  |  |
|  defaultValue  | The default value to return if the key is not found. | `T` |  |  |
|  options  | Optional parameters for retrieval. | `unknown` |  |  |


### removeItem
Removes a value by key.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  key  | The key of the value to remove. | `Key` |  |  |
|  options  | Optional parameters for removal. | `unknown` |  |  |


### setItem
Stores a value with the specified key.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  key  | The key to identify the stored value. | `Key` |  |  |
|  value  | The value to store. | `T` |  |  |
|  options  | Optional parameters for storage. | `unknown` |  |  |

