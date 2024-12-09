## Interface `RequestAdapterInterface`
Request adapter interface

This interface defines the contract for request adapters.
Adapters are responsible for handling the specific details of a request,
such as URL construction, headers, and response handling.


## Members

### config
The configuration for the request adapter.




### getConfig
Retrieves the current configuration of the request adapter.

**@example** 

```typescript
const config = adapter.getConfig();
```




### request
Sends a request using the specified options and returns a promise with the response.

**@example** 

```typescript
adapter.request({ url: '/users', method: 'GET' }).then(response => console.log(response));
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  options  | `RequestAdpaterConfig<Request>` |  |  | The configuration options for the request. |


## TypeAlias `RequestAdapterResponse`

`Object`

Request adapter response

This type defines the structure of a response from a request adapter.
It includes the response data, status, headers, and the original request configuration.



## TypeAlias `RequestAdpaterConfig`

`Object`

Request adapter configuration

This type defines the configuration options for a request adapter.
It includes properties for URL, method, headers, and other request details.
The main purpose is to provide a flexible structure for configuring HTTP requests.

@since 

1.0.14


