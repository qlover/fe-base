## Class `RequestScheduler`
Represents a scheduler for managing HTTP requests.

This class provides a unified API for making HTTP requests with support for plugins,
streaming responses, and request cancellation. Future enhancements may include caching,
upload/download progress, retries, timeouts, and mock data.

@since 

1.0.14

@example 

Create a Adapter


```typescript
class MockRequestAdapter implements RequestAdapterInterface<any> {
config: any;

constructor(config: any = {}) {
  this.config = config;
}

getConfig(): any {
  return this.config;
}
async request<Request, Response>(
  config: any
): Promise<RequestAdapterResponse<Response, Request>> {
  const sendConfig = { ...this.config, ...config };
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    status: 200,
    statusText: 'ok',
    headers: {},
    data: sendConfig.data,
    config: sendConfig
  };
}

```

@example 

Execute a request using the adapter


```typescript
const adapter = new MockRequestAdapter();
const scheduler = new RequestScheduler();
const reqData = 'mock response';
const response = await scheduler.request({ url: '/test', data: reqData });
// => response.data is 'mock response'
```


## Members

### constructor
Initializes a new instance of the RequestScheduler class.

**@since** 

1.0.14


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  adapter  | The request adapter interface to be used for making requests. | `RequestAdapterInterface<Config>` |  |  |


### connect
Executes a CONNECT request.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  url  |  | `string` |  |  |
|  config  | The configuration for the CONNECT request. | `RequestAdapterConfig<Request>` |  |  |


### delete
Executes a DELETE request.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  url  |  | `string` |  |  |
|  config  | The configuration for the DELETE request. | `RequestAdapterConfig<Request>` |  |  |


### get
Executes a GET request.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  url  |  | `string` |  |  |
|  config  | The configuration for the GET request. | `RequestAdapterConfig<Request>` |  |  |


### head
Executes a HEAD request.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  url  |  | `string` |  |  |
|  config  | The configuration for the HEAD request. | `RequestAdapterConfig<Request>` |  |  |


### options
Executes an OPTIONS request.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  url  |  | `string` |  |  |
|  config  | The configuration for the OPTIONS request. | `RequestAdapterConfig<Request>` |  |  |


### patch
Executes a PATCH request.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  url  |  | `string` |  |  |
|  config  | The configuration for the PATCH request. | `RequestAdapterConfig<Request>` |  |  |


### post
Executes a POST request.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  url  |  | `string` |  |  |
|  config  | The configuration for the POST request. | `RequestAdapterConfig<Request>` |  |  |


### put
Executes a PUT request.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  url  |  | `string` |  |  |
|  config  | The configuration for the PUT request. | `RequestAdapterConfig<Request>` |  |  |


### request
Executes a request with the given configuration.

**@since** 

1.0.14


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  config  | The configuration for the request. | `RequestAdapterConfig<Request>` |  |  |


### trace
Executes a TRACE request.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  url  |  | `string` |  |  |
|  config  | The configuration for the TRACE request. | `RequestAdapterConfig<Request>` |  |  |


### usePlugin
Adds a plugin to the request execution process.

**@since** 

1.0.14


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  plugin  | The plugin to be used by the executor. | `ExecutorPlugin<unknown, unknown>` |  |  |

