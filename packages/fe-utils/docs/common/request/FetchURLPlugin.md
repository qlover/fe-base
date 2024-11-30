## Class `FetchURLPlugin`
Plugin for URL manipulation and response handling
Provides URL composition and response status checking

Features:
- URL normalization
- Base URL handling
- Query parameter management
- Response status validation

Core Idea: Simplify URL handling and response validation.
Main Function: Manage URL construction and check response status.
Main Purpose: Ensure correct URL formation and response handling.

@implements 


@example 

```typescript
// Basic usage
const urlPlugin = new FetchURLPlugin();
const client = new FetchRequest();
client.executor.use(urlPlugin);

// Request with base URL and params
await client.get({
  baseURL: 'https://api.example.com',
  url: '/users',
  params: { role: 'admin' }
});
```


## Members

### constructor




### appendQueryParams
Appends query parameters to URL
Handles existing query parameters in URL

Core Idea: Add query parameters to URLs.
Main Function: Construct URLs with appended query parameters.
Main Purpose: Facilitate dynamic URL query construction.

**@example** 

```typescript
const url = urlPlugin.appendQueryParams(
  'https://api.example.com/users',
  { role: 'admin', status: 'active' }
);
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  url  | `string` |  |  | Base URL  |
|  params  | `Record<string, string>` | {} |  | Parameters to append  |


### buildUrl
Builds complete URL from configuration
Handles base URL, path normalization, and query parameters

Core Idea: Construct full URLs from configuration.
Main Function: Generate complete URLs for requests.
Main Purpose: Ensure accurate URL formation for HTTP requests.

**@example** 

```typescript
const completeUrl = urlPlugin.buildUrl(config);
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `FetchRequestConfig` |  |  | Request configuration  |


### connectBaseURL
Combines base URL with path
Ensures proper slash handling

Core Idea: Concatenate base URL and path.
Main Function: Form complete URLs from base and path.
Main Purpose: Simplify URL construction with base paths.

**@example** 

```typescript
const fullUrl = urlPlugin.connectBaseURL('/users', 'https://api.example.com');
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  url  | `string` |  |  | URL path  |
|  baseURL  | `string` |  |  | Base URL  |


### isFullURL
Checks if URL is absolute (starts with http:// or https://)

Core Idea: Determine if a URL is fully qualified.
Main Function: Identify absolute URLs.
Main Purpose: Ensure correct URL handling in requests.

**@example** 

```typescript
const isAbsolute = urlPlugin.isFullURL('https://example.com');
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  url  | `string` |  |  | URL to check  |


### onBefore
Pre-request hook that builds complete URL

Core Idea: Prepare request URLs before execution.
Main Function: Construct and set complete URLs in configuration.
Main Purpose: Ensure requests are sent to the correct endpoints.

**@example** 

```typescript
urlPlugin.onBefore(config);
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `FetchRequestConfig` |  |  | Request configuration  |


### onError
Error handling hook
Wraps non-FetchRequestError errors

Core Idea: Standardize error handling for requests.
Main Function: Convert errors to FetchRequestError format.
Main Purpose: Ensure consistent error handling across requests.

**@example** 

```typescript
const error = urlPlugin.onError(new Error('Network Error'));
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  error  | `Error` |  |  | Original error  |


### onSuccess
Success hook that validates response status
Throws error for non-OK responses

Core Idea: Ensure response status is acceptable.
Main Function: Validate response status codes.
Main Purpose: Detect and handle unsuccessful HTTP responses.

**@throws** 

If response is not OK

**@example** 

```typescript
const response = urlPlugin.onSuccess(fetchResponse);
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  result  | `Response` |  |  | Fetch response  |

