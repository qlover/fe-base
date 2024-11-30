## Class `FetchRequest`


## Members

### constructor
Creates a new FetchRequest instance
Automatically detects and configures fetch implementation

Core Idea: Simplify HTTP requests with built-in fetch support.
Main Function: Initialize fetch requests with optional configuration.
Main Purpose: Provide a flexible and extensible HTTP request utility.

**@throws** 

When fetch is not available

**@example** 

```typescript
const fetchRequest = new FetchRequest({ baseURL: 'https://api.example.com' });
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `Partial<FetchRequestConfig>` | {} |  | Request configuration options  |


### composeRequestInit
Composes RequestInit object from configuration
Extracts and formats fetch-specific options

Core Idea: Convert configuration into fetch-compatible format.
Main Function: Prepare RequestInit object for fetch API.
Main Purpose: Ensure correct request setup for fetch execution.

**@example** 

```typescript
const requestInit = fetchRequest.composeRequestInit(config);
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `FetchRequestConfig` |  |  | Full request configuration  |


### request
Core request implementation
Merges configurations and executes fetch request

Core Idea: Execute HTTP requests with merged configurations.
Main Function: Perform fetch requests using provided configurations.
Main Purpose: Facilitate HTTP communication with error handling.

**@throws** 

When fetcher is not available

**@example** 

```typescript
const response = await fetchRequest.request({ url: '/data' });
```


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  config  | `FetchRequestConfig` |  |  | Request configuration  |


## Class `FetchRequestError`
Custom error class for fetch request failures
Extends ExecutorError to maintain error chain compatibility

@example 

```typescript
throw new FetchRequestError(
  FetchRequestErrorID.RESPONSE_NOT_OK,
  'Server responded with 404'
);
```


## Members

### constructor


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  id  | `string` |  |  |   |
|  originalError  | `string \| Error` |  |  |   |


## Enum `FetchRequestErrorID`
Error IDs for different fetch request failure scenarios
Used to identify specific error types in error handling


