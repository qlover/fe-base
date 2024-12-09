## Class `RequestAdapterAxios`
Axios request adapter

Only base config is supported

@since 

1.0.14


## Members

### constructor


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `Partial<AxiosRequestConfig<any>>` | {} |  |  |


### getConfig




### request
Sends a request using the specified options and returns a promise with the response.

**@example** 

```typescript
adapter.request({ url: '/users', method: 'GET' }).then(response => console.log(response));
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `AxiosRequestConfig<Request>` |  |  | The configuration options for the request. |

