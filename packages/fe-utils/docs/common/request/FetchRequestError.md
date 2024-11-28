## FetchRequestError

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


### captureStackTrace
Create .stack property on a target object


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  targetObject  | `object` |  |  |   |
|  constructorOpt  | `Function` |  |  |   |


