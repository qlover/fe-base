## Interface `RequestAdapterConfig`
Request adapter configuration

This type defines the configuration options for a request adapter.
It includes properties for URL, method, headers, and other request details.
The main purpose is to provide a flexible structure for configuring HTTP requests.

@since 

1.0.14


## Members

### baseURL
Base URL for all requests
Will be prepended to the request URL

**@example** 

```typescript
baseURL: 'https://api.example.com'
// url = /users/1 => https://api.example.com/users/1
// url = users/1 => https://api.example.com/users/1
```




### data
Request body data

Mapping fetch 
`body`

**@typeParam** RequestData

The type of the request body data.

**@example** 

```typescript
data: { name: 'John Doe' }
```




### headers
Request headers

**@example** 

```typescript
headers: { 'Content-Type': 'application/json' }
```




### method
HTTP request methods supported by the executor
Follows standard HTTP method definitions

**@see** 

https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods

**@example** 

```typescript
method: 'GET'
```




### params
URL query parameters
Will be serialized and appended to the URL

**@example** 

```typescript
params: { search: 'query' }
```




### requestId
Request ID, used to identify the request in the abort plugin.




### responseType
Response type

Specifies the type of data that the server will respond with.

**@example** 

```typescript
responseType: 'json'
```




### url
Request URL path
Will be combined with baseURL if provided

Processed by FetchURLPlugin during request

**@todo** 

Change to URL | Request, add attribute 
`input`

**@example** 

```typescript
url: '/users/1'
```




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
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  options  | The configuration options for the request. | `RequestAdapterConfig<Request>` |  |  |


## Interface `RequestAdapterResponse`
Request adapter response

This type defines the structure of a response from a request adapter.
It includes the response data, status, headers, and the original request configuration.


## Members

### config




### data




### headers




### response




### status




### statusText



