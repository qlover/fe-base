## AbortPlugin

Plugin for handling request cancellation
Provides abort functionality for fetch requests

Features:
- Request cancellation support
- Automatic cleanup of aborted requests
- Multiple concurrent request handling
- Custom abort callbacks

Core Idea: Enhance request management with cancellation capabilities.
Main Function: Allow requests to be aborted programmatically.
Main Purpose: Improve control over network requests and resource management.

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

Core Idea: Provide a mechanism to cancel specific requests.
Main Function: Abort a request and execute any associated callbacks.
Main Purpose: Allow precise control over individual request lifecycles.

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
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `FetchRequestConfig` |  |  | Configuration of request to abort  |


### abortAll
Aborts all pending requests
Clears all stored controllers

Core Idea: Provide a mechanism to cancel all active requests.
Main Function: Abort all requests and clear associated resources.
Main Purpose: Allow bulk cancellation of requests, useful in cleanup scenarios.

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

Core Idea: Uniquely identify requests for management.
Main Function: Generate a consistent key for each request.
Main Purpose: Facilitate request tracking and cancellation.

**@example**
```typescript
const key = abortPlugin.generateRequestKey(config);
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `FetchRequestConfig` |  |  | Request configuration  |


### onBefore
Pre-request hook that sets up abort handling
Creates new AbortController and cancels any existing request with same key

Core Idea: Prepare requests for potential cancellation.
Main Function: Attach abort controllers to requests.
Main Purpose: Enable request cancellation and resource cleanup.

**@example**
```typescript
const modifiedConfig = abortPlugin.onBefore(config);
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `FetchRequestConfig` |  |  | Request configuration  |


### onError
Error handling hook for abort scenarios
Processes different types of abort errors and cleans up resources

Core Idea: Handle errors resulting from request cancellation.
Main Function: Identify and process abort-related errors.
Main Purpose: Ensure proper error handling and resource cleanup.

**@example**
```typescript
const error = abortPlugin.onError(new Error('AbortError'), config);
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  error  | `Error` |  |  | Original error  |
|  config  | `FetchRequestConfig` |  |  | Request configuration  |


