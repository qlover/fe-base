## Class `RequestAdapterAxios`
Axios request adapter

Only base config is supported

@since 

1.0.14


## Members

### constructor


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  axios  |  | `AxiosStatic` |  |  |
|  config  |  | `AxiosRequestConfig<any>` | {} |  |


### getConfig




### request
Sends a request using the specified options and returns a promise with the response.

**@example** 

```typescript
adapter.request({ url: '/users', method: 'GET' }).then(response => console.log(response));
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  config  | The configuration options for the request. | `Transaction["request"]` |  |  |

