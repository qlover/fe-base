## Class `RequestAdapterFetch`
Request adapter interface

This interface defines the contract for request adapters.
Adapters are responsible for handling the specific details of a request,
such as URL construction, headers, and response handling.


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
|  config  | `Partial<RequestAdapterFetchConfig<any>>` | {} |  | Request configuration options |


### getConfig




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
|  config  | `RequestAdapterFetchConfig<Request>` |  |  | Request configuration |


### usePlugin


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  plugin  | `ExecutorPlugin<unknown, unknown>` |  |  |  |


## TypeAlias `RequestAdapterFetchConfig`

`RequestInit & RequestAdpaterConfig<Request> & Object`

Request adapter fetch configuration

This type defines the configuration options for a request adapter.
It includes properties for URL, method, headers, and other request details.
The main purpose is to provide a flexible structure for configuring HTTP requests.

@since 

1.0.14


