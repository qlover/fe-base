## Class `RequestAdapterFetch`
Request adapter interface

This interface defines the contract for request adapters.
Adapters are responsible for handling the specific details of a request,
such as URL construction, headers, and response handling.


## Members

### constructor
Creates a new FetchRequest instance
Automatically detects and configures fetch implementation

- Core Idea: Simplify HTTP requests with built-in fetch support.
- Main Function: Initialize fetch requests with optional configuration.
- Main Purpose: Provide a flexible and extensible HTTP request utility.

**@throws** 

When fetch is not available

**@example** 

```typescript
const fetchRequest = new FetchRequest({ baseURL: 'https://api.example.com' });
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  config  | Request configuration options | `Partial<RequestAdapterFetchConfig<unknown>>` | {} |  |


### getConfig




### getResponseHeaders
Extracts headers from the fetch Response object and returns them as a record.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  response  | The fetch Response object from which headers are extracted. | `Response` |  |  |


### parametersToRequest


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  parameters  |  | `RequestAdapterFetchConfig<unknown>` |  |  |


### request
Core request implementation
Merges configurations and executes fetch request

- Core Idea: Execute HTTP requests with merged configurations.
- Main Function: Perform fetch requests using provided configurations.
- Main Purpose: Facilitate HTTP communication with error handling.

**@throws** 

When fetcher is not available

**@example** 

```typescript
const response = await fetchRequest.request({ url: '/data' });
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  config  | Request configuration | `RequestAdapterFetchConfig<Request>` |  |  |


### toAdapterResponse
Converts the raw fetch response into a standardized adapter response.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  data  | The data extracted from the response based on the response type. | `unknown` |  |  |
|  response  | The original fetch Response object. | `Response` |  |  |
|  config  | The configuration used for the fetch request. | `RequestAdapterFetchConfig<Request>` |  |  |


### usePlugin


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  plugin  |  | `ExecutorPlugin<unknown, unknown>` |  |  |


## TypeAlias `RequestAdapterFetchConfig`

`Omit<globalThis.RequestInit, "headers"> & RequestAdapterConfig<Request> & Object`

Request adapter fetch configuration

This type defines the configuration options for a request adapter.
It includes properties for URL, method, headers, and other request details.
The main purpose is to provide a flexible structure for configuring HTTP requests.

@since 

1.0.14


