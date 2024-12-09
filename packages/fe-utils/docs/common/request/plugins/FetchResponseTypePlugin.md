## Class `FetchResponseTypePlugin`
FetchResponseTypePlugin is responsible for handling different response types
from fetch requests and converting them into a standardized adapter response.

The core idea is to provide a flexible mechanism to process various response
types such as JSON, text, blob, etc., and return a consistent response format.

Main function: Convert fetch responses into a RequestAdapterResponse based on
the specified response type in the configuration.

Main purpose: To ensure that different response types are handled correctly
and consistently across the application.

@since 

1.0.14

@example 

```typescript
const plugin = new FetchResponseTypePlugin();
const mockResponse = new Response(JSON.stringify({ key: 'value' }), {
  status: 200,
  headers: { 'Content-Type': 'application/json' }
});

const context: ExecutorContextInterface<RequestAdapterFetchConfig> = {
  returnValue: mockResponse,
  parameters: { responseType: 'json' }
};
const result = await plugin.onSuccess(context);

// => result.data is { key: 'value' }
// => result.status is 200
// => result.headers['content-type'] is 'application/json'
```


## Members

### constructor




### getResponseHeaders
Extracts headers from the fetch Response object and returns them as a record.


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  response  | `Response` |  |  | The fetch Response object from which headers are extracted. |


### handleStreamResponse
Handles the streaming response and tracks the progress.

FIXME: if the content length is not available, the progress will not be accurate.


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  response  | `Response` |  |  | The Response object containing the stream. |
|  config  | `RequestAdapterFetchConfig` |  |  | The configuration for the request adapter, which may include an onProgress callback. |


### onSuccess
Processes the successful fetch response based on the specified response type.


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  context  | `ExecutorContextInterface<RequestAdapterFetchConfig>` |  |  | The execution context containing the fetch response and configuration. |


### toAdapterResponse
Converts the raw fetch response into a standardized adapter response.


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  data  | `unknown` |  |  | The data extracted from the response based on the response type. |
|  response  | `Response` |  |  | The original fetch Response object. |
|  config  | `RequestAdapterFetchConfig` |  |  | The configuration used for the fetch request. |

