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
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  adapter  | `RequestAdapterInterface<Config>` |  |  | The request adapter interface to be used for making requests. |


### connect
Executes a CONNECT request.


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `RequestAdpaterConfig<Request>` |  |  | The configuration for the CONNECT request. |


### delete
Executes a DELETE request.


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `RequestAdpaterConfig<Request>` |  |  | The configuration for the DELETE request. |


### get
Executes a GET request.


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `RequestAdpaterConfig<Request>` |  |  | The configuration for the GET request. |


### head
Executes a HEAD request.


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `RequestAdpaterConfig<Request>` |  |  | The configuration for the HEAD request. |


### options
Executes an OPTIONS request.


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `RequestAdpaterConfig<Request>` |  |  | The configuration for the OPTIONS request. |


### patch
Executes a PATCH request.


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `RequestAdpaterConfig<Request>` |  |  | The configuration for the PATCH request. |


### post
Executes a POST request.


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `RequestAdpaterConfig<Request>` |  |  | The configuration for the POST request. |


### put
Executes a PUT request.


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `RequestAdpaterConfig<Request>` |  |  | The configuration for the PUT request. |


### request
Executes a request with the given configuration.

**@since** 

1.0.14


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `RequestAdpaterConfig<Request>` |  |  | The configuration for the request. |


### trace
Executes a TRACE request.


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `RequestAdpaterConfig<Request>` |  |  | The configuration for the TRACE request. |


### usePlugin
Adds a plugin to the request execution process.

**@since** 

1.0.14


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  plugin  | `ExecutorPlugin<unknown, unknown>` |  |  | The plugin to be used by the executor. |

