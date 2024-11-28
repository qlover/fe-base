## RequestExecutor

Base request executor class that provides HTTP request functionality
Built on top of AsyncExecutor for plugin support and error handling

Features:
- Supports all standard HTTP methods
- Plugin-based request modification
- Configurable request options
- Type-safe request configuration

@example
```typescript
// Basic usage
const executor = new RequestExecutor(config, new AsyncExecutor());

// GET request
const data = await executor.get({
  url: '/api/users',
  params: { id: 123 }
});

// POST request with body
const result = await executor.post({
  url: '/api/users',
  body: JSON.stringify({ name: 'John' })
});
```

## Members

### constructor
Creates a new RequestExecutor instance


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `Cfg` |  |  | Base request configuration  |
|  executor  | `AsyncExecutor` |  |  | AsyncExecutor instance for request handling  |


### delete
Performs HTTP DELETE request


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  options  | `Cfg` |  |  | Request configuration  |


### get
Performs HTTP GET request


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  options  | `Cfg` |  |  | Request configuration  |


### getConfig
Returns the current request configuration




### head
Performs HTTP HEAD request


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  options  | `Cfg` |  |  | Request configuration  |


### options
Performs HTTP OPTIONS request


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  options  | `Cfg` |  |  | Request configuration  |


### patch
Performs HTTP PATCH request


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  options  | `Cfg` |  |  | Request configuration  |


### post
Performs HTTP POST request


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  options  | `Cfg` |  |  | Request configuration  |


### put
Performs HTTP PUT request


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  options  | `Cfg` |  |  | Request configuration  |


### request
Core request method that handles all HTTP requests
Should be implemented by concrete classes

**@throws**
When not implemented


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `Cfg` |  |  | Request configuration  |


