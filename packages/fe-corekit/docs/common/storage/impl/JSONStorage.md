## Class `JSONStorage`
Represents a storage mechanism for JSON-serializable data.

This class provides a way to store, retrieve, and manage JSON data
with optional expiration times. It can operate with a provided
synchronous storage backend or use an internal store.

The main purpose of this class is to facilitate the storage of
complex data structures in a serialized JSON format, allowing
for easy retrieval and management.

inner serializer is used by default, which is 
`JSONSerializer`
.

@since 

1.0.17

@example 

A simple example of how to use the JSONStorage class


```typescript
const storage = new JSONStorage();
storage.setItem('key', { data: 'value' }, 3600);
const value = storage.getItem('key');
// => { data: 'value' }
```

@example 

If need persistent storage, you can use 
`localStorage`
 or 
`sessionStorage`



```typescript
const storage = new JSONStorage(localStorage);
storage.setItem('key', { data: 'value' }, 3600);
const value = storage.getItem('key');
// => { data: 'value' }
```

@example 

Or use custom serializer and storage


```typescript
// use native JSON
const customSerializer = {
  serialize: JSON.stringify,
  deserialize: JSON.parse,
};

// can use localStorage or sessionStorage
const customStorage = {
  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value);
  },
  getItem: (key: string) => {
    return localStorage.getItem(key);
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  },
};

const storage = new JSONStorage(customStorage, customSerializer);
storage.setItem('key', { data: 'value' }, 3600);
const value = storage.getItem('key');
```


## Members

### constructor
Initializes a new instance of the JSONStorage class.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  storage  | An optional synchronous storage backend to use. | `SyncStorage<string, string>` |  |  |
|  serializer  | The serializer used to serialize and deserialize the data.<br><br>**serializer and deserialize is only support sync operation** | `Serializer<unknown, string>` | ... |  |


### clear
Clears all stored items.




### getItem
Retrieves a stored value by its key.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  key  | The key of the value to retrieve. | `string` |  |  |
|  defaultValue  | An optional default value to return if the key is not found. | `T` |  |  |


### removeItem
Removes a stored item by its key.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  key  | The key of the item to remove. | `string` |  |  |


### setItem
Stores a value with an optional expiration time.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  key  | The key under which the value is stored. | `string` |  |  |
|  value  | The value to store, which must be JSON-serializable. | `T` |  |  |
|  expire  | Optional expiration time in milliseconds. | `number` |  |  |

