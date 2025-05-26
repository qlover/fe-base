## Class `RequestTransaction`
Represents a transaction for managing HTTP requests.

Now 
`RequestTransaction`
 and 
`RequestScheduler`
 have the same purpose, only different in form.

If you want to override the return type of the request, you can use 
`RequestTransaction`
.

If you don't consider type, you can also use 
`requestScheduler`
, just manually declare the return type.

If you have the need to override the response or execution context, it is recommended to use 
`RequestTransaction`
,
because it can match the type through typescript.

The 
`request`
 method of 
`RequestTransaction`
 can do the following:
1. Directly declare the return type through generics
2. Declare the config type through generics
3. Declare the request parameters and return values through 
`RequestTransactionInterface`


Currently, it does not support passing parameters through generics, but you can use 
`RequestTransactionInterface`
.

@example Directly declare the return type through generics

```typescript
const client = new RequestTransaction<CustomConfig>(new RequestAdapterFetch());

client
  .request<{
    list: string[];
  }>({ url: 'https://api.example.com/data', method: 'GET', hasCatchError: true })
  .then((response) => {
    console.log(response.data.list);
  });
```

@example Declare the config type through generics

```typescript
const client = new RequestTransaction<
  RequestAdapterConfig & { hasCatchError?: boolean }
>(new RequestAdapterFetch());

client.request({
  url: 'https://api.example.com/data',
  method: 'GET',
  hasCatchError: true,
  data: { name: 'John Doe' }
});
```

@example You can also extend the config type

```typescript
interface CustomConfig extends RequestAdapterConfig {
  hasCatchError?: boolean;
}

const client = new RequestTransaction<CustomConfig>(new RequestAdapterFetch());

client.request({
  url: 'https://api.example.com/data',
  method: 'GET',
  hasCatchError: true,
  data: { name: 'John Doe' }
});
```

@example Directly declare the request parameters and return values through `RequestTransactionInterface`

```typescript
interface CustomConfig extends RequestAdapterConfig {
  hasCatchError?: boolean;
}
interface CustomResponse<T = unknown>
  extends RequestAdapterResponse<unknown, T> {
  catchError?: unknown;
}

const client = new RequestTransaction<CustomConfig>(new RequestAdapterFetch());

client
  .request<
    RequestTransactionInterface<
      CustomConfig,
      CustomResponse<{ list?: string[] }>
    >
  >({ url: 'https://api.example.com/data', method: 'GET', hasCatchError: true })
  .then((response) => {
    console.log(response.catchError);
    // => (property) CustomResponse<T = unknown>.catchError?: unknown
    console.log(response.data.list);
    // => (property) list?: string[] | undefined
  });
```

@example Finally, you can also use `RequestTransaction` to create a complete api client

```typescript
// catch plugin
interface CatchPluginConfig {
  hasCatchError?: boolean;
}
interface CatchPluginResponseData {
  catchError?: unknown;
}

// The main api client configuration
// You can inherit multiple config types from other plugins
interface ApiClientConfig extends RequestAdapterConfig, CatchPluginConfig {}

// The main api client response type
// You can inherit multiple response types from other plugins
interface ApiClientResponse<T = unknown>
  extends RequestAdapterResponse<unknown, T>,
    CatchPluginResponseData {}

// Independently declare a specific method Transaction
interface ApiTestTransaction
  extends RequestTransactionInterface<
    ApiClientConfig,
    ApiClientResponse<{ list: string[] }>
  > {}
class ApiClient extends RequestTransaction<ApiClientConfig> {
  // If you don't require displaying the return type of the method
  // Automatically deduce: Promise<ApiClientResponse<{ list: string[] }>>
  test() {
    return this.request<ApiTestTransaction>({
      url: 'https://api.example.com/data',
      method: 'GET',
      hasCatchError: true
    });
  }

  // Displayly declare
  test2(data: ApiTestTransaction['request']): Promise<ApiTestTransaction['response']> {
    return this.request({
      url: 'https://api.example.com/data',
      method: 'GET',
      hasCatchError: true,
      data
    });
  }
}

// Call the test method

const req = new ApiClient(new RequestAdapterFetch());

req.test().then((response) => {
  console.log(response.catchError);
  // => (property) CustomResponse<T = unknown>.catchError?: unknown
  console.log(response.data.list);
  // => (property) list?: string[] | undefined
});
```


If you are not satisfied with 
`RequestTransaction`
, you can completely rewrite your own 
`RequestTransaction`
.

Only need to inherit 
`RequestManager`
 and override the 
`request`
 method.

Finally, if you don't need typescript support, then it's basically the same as 
`RequestScheduler`
,
except that some of the shortcuts have different parameters.

@since 

1.2.2


## Members

### delete
Sends a DELETE request


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  url  | The URL to send the request to | `string` |  |  |
|  config  | Additional configuration options | `Omit<Config, "method" \| "url">` |  |  |


### get
Sends a GET request


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  url  | The URL to send the request to | `string` |  |  |
|  config  | Additional configuration options | `Omit<Config, "method" \| "url">` |  |  |


### patch
Sends a PATCH request


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  url  | The URL to send the request to | `string` |  |  |
|  data  | The data to be sent in the request body | `Transaction extends RequestTransactionInterface<Config, unknown> ? Transaction<Transaction>["request"]["data"] : Config["data"]` |  |  |
|  config  | Additional configuration options | `Omit<Config, "method" \| "url" \| "data">` |  |  |


### post
Sends a POST request


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  url  | The URL to send the request to | `string` |  |  |
|  data  | The data to be sent in the request body | `Transaction extends RequestTransactionInterface<Config, unknown> ? Transaction<Transaction>["request"]["data"] : Config["data"]` |  |  |
|  config  | Additional configuration options | `Omit<Config, "method" \| "url" \| "data">` |  |  |


### put
Sends a PUT request


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  url  | The URL to send the request to | `string` |  |  |
|  data  | The data to be sent in the request body | `Transaction extends RequestTransactionInterface<Config, unknown> ? Transaction<Transaction>["request"]["data"] : Config["data"]` |  |  |
|  config  | Additional configuration options | `Omit<Config, "method" \| "url" \| "data">` |  |  |


### request
Makes an HTTP request with flexible type definitions


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  config  | Request configuration object | `Transaction extends RequestTransactionInterface<Config, unknown> ? Transaction<Transaction>["request"] : Config` |  |  |

