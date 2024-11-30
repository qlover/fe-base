## Class `ExecutorError`
Custom error class for executor operations.

This class provides a structured way to handle errors that occur during executor operations.
It extends the standard Error class to include an error identification string, which can be used
to categorize and manage errors more effectively.

@example 

```typescript
try {
  // some executor operation
} catch (error) {
  throw new ExecutorError('EXECUTOR_ERROR', error);
}
```


## Members

### constructor
Constructs a new ExecutorError.

if originalError is a string, it will be used as the error message.
if originalError is an Error object, its message will be used as the error message.
if originalError is not provided, the error message will be the id.


#### Parameters
| Name | Type | Default | Since | Description |
|------|------|---------|-------|------------|
|  id  | `string` |  |  | A unique identifier for the error, used for categorization and tracking. |
|  originalError  | `string \| Error` |  |  | The original error message or Error object that triggered this error.<br>                       This parameter is optional. |

