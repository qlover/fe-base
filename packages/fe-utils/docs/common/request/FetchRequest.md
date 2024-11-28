## FetchRequest



## Members

### constructor
Creates a new FetchRequest instance
Automatically detects and configures fetch implementation

Core Idea: Simplify HTTP requests with built-in fetch support.
Main Function: Initialize fetch requests with optional configuration.
Main Purpose: Provide a flexible and extensible HTTP request utility.

**@throws**
When fetch is not available

**@example**
```typescript
const fetchRequest = new FetchRequest({ baseURL: 'https://api.example.com' });
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `Partial<FetchRequestConfig>` | {} |  | Request configuration options  |


### composeRequestInit
Composes RequestInit object from configuration
Extracts and formats fetch-specific options

Core Idea: Convert configuration into fetch-compatible format.
Main Function: Prepare RequestInit object for fetch API.
Main Purpose: Ensure correct request setup for fetch execution.

**@example**
```typescript
const requestInit = fetchRequest.composeRequestInit(config);
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `FetchRequestConfig` |  |  | Full request configuration  |


### delete
Performs HTTP DELETE request


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  options  | `FetchRequestConfig` |  |  | Request configuration  |


### get
Performs HTTP GET request


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  options  | `FetchRequestConfig` |  |  | Request configuration  |


### getConfig
Returns the current request configuration




### head
Performs HTTP HEAD request


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  options  | `FetchRequestConfig` |  |  | Request configuration  |


### options
Performs HTTP OPTIONS request


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  options  | `FetchRequestConfig` |  |  | Request configuration  |


### patch
Performs HTTP PATCH request


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  options  | `FetchRequestConfig` |  |  | Request configuration  |


### post
Performs HTTP POST request


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  options  | `FetchRequestConfig` |  |  | Request configuration  |


### put
Performs HTTP PUT request


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  options  | `FetchRequestConfig` |  |  | Request configuration  |


### request
Core request implementation
Merges configurations and executes fetch request

Core Idea: Execute HTTP requests with merged configurations.
Main Function: Perform fetch requests using provided configurations.
Main Purpose: Facilitate HTTP communication with error handling.

**@throws**
When fetcher is not available

**@example**
```typescript
const response = await fetchRequest.request({ url: '/data' });
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `FetchRequestConfig` |  |  | Request configuration  |


