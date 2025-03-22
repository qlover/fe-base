## Class `FetchURLPlugin`
Plugin for URL manipulation and response handling
Provides URL composition and response status checking

- Core Idea: Simplify URL handling and response validation.
- Main Function: Manage URL construction and check response status.
- Main Purpose: Ensure correct URL formation and response handling.

Features:
- URL normalization
- Base URL handling
- Query parameter management
- Response status validation

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

**@example** 

```typescript
const url = urlPlugin.appendQueryParams(
  'https://api.example.com/users',
  { role: 'admin', status: 'active' }
);
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  url  | Base URL | `string` |  |  |
|  params  | Parameters to append | `Record<string, unknown>` | {} |  |


### buildUrl
Builds complete URL from configuration.

Handles base URL, path normalization, and query parameters.

**@example** 

```typescript
const completeUrl = urlPlugin.buildUrl(config);
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  config  | Request configuration | `RequestAdapterConfig<unknown>` |  |  |


### connectBaseURL
Combines base URL with path.

Ensures proper slash handling

**@example** 

```typescript
const fullUrl = urlPlugin.connectBaseURL('/users', 'https://api.example.com');
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  url  | URL path | `string` |  |  |
|  baseURL  | Base URL | `string` |  |  |


### isFullURL
Checks if URL is absolute (starts with http:// or https://)

**@example** 

```typescript
const isAbsolute = urlPlugin.isFullURL('https://example.com');
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  url  | URL to check | `string` |  |  |


### onBefore
Pre-request hook that builds complete URL

**@example** 

```typescript
urlPlugin.onBefore(config);
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  config  | Request configuration | `ExecutorContext<RequestAdapterConfig<unknown>>` |  |  |


### onError
Error handling hook
Wraps non-RequestError errors

**@example** 

```typescript
const error = urlPlugin.onError(new Error('Network Error'));
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  error  | Original error | `ExecutorContext<unknown>` |  |  |


### onSuccess
Success hook that validates response status
Throws error for non-OK responses

**@throws** 

If response is not OK

**@example** 

```typescript
const response = urlPlugin.onSuccess(fetchResponse);
```


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  result  | Fetch response | `ExecutorContext<unknown>` |  |  |

