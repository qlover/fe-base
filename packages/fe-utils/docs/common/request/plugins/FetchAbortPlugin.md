## Class `FetchAbortPlugin`
Plugin for handling request cancellation
Provides abort functionality for fetch requests

- Core Idea: Enhance request management with cancellation capabilities.
- Main Function: Allow requests to be aborted programmatically.
- Main Purpose: Improve control over network requests and resource management.

Features:
- Request cancellation support
- Automatic cleanup of aborted requests
- Multiple concurrent request handling
- Custom abort callbacks

**Not Support**
- Abort signal from outside

@implements 


@example 

```typescript
// Basic usage
const abortPlugin = new AbortPlugin();
const client = new FetchRequest();
client.executor.use(abortPlugin);

// Abort specific request
const config = { url: '/api/data' };
abortPlugin.abort(config);

// Abort all pending requests
abortPlugin.abortAll();
```


## Members

### constructor




### abort
Aborts a specific request
Triggers abort callback if provided

**@example** 

```typescript
abortPlugin.abort({
  url: '/api/data',
  onAbort: (config) => {
    console.log('Request aborted:', config.url);
  }
});
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  config  | Configuration of request to abort | `RequestAdapterFetchConfig` |  |  |


### abortAll
Aborts all pending requests
Clears all stored controllers

**@example** 

```typescript
// Cancel all requests when component unmounts
useEffect(() => {
  return () => abortPlugin.abortAll();
}, []);
```




### generateRequestKey
Generates unique key for request identification
Combines method, URL, params, and body to create unique identifier

**@example** 

```typescript
const key = abortPlugin.generateRequestKey(config);
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  config  | Request configuration | `RequestAdapterFetchConfig` |  |  |


### isSameAbortError
Determines if the given error is an abort error.

- Identify errors that are related to request abortion.
- Check error properties to determine if it's an abort error.
- Provide a unified method to recognize abort errors.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  error  | The error to check | `Error` |  |  |


### onBefore
Pre-request hook that sets up abort handling
Creates new AbortController and cancels any existing request with same key

**@example** 

```typescript
const modifiedConfig = abortPlugin.onBefore(config);
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  context  |  | `ExecutorContextInterface<unknown>` |  |  |


### onError
Error handling hook for abort scenarios
Processes different types of abort errors and cleans up resources

**@example** 

```typescript
const error = abortPlugin.onError(new Error('AbortError'), config);
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  context  |  | `ExecutorContextInterface<unknown>` |  |  |


### onSuccess
Hook executed after successful task completion
Can transform the task result


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  _  |  | `unknown` |  |  |
|  config  |  | `RequestAdapterFetchConfig` |  |  |

