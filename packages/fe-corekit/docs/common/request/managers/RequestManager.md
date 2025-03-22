## Class `RequestManager`
Represents a manager for handling HTTP requests.

This interface defines a manager that contains an adapter and an executor.
It provides methods for adding plugins to the executor and making requests.

Why this is an abstract class?

- Because the Executor can be overridden at runtime, the type cannot be fixed,
  so we need to reasonably flexibly control it.
- So we need to redefine the request type when implementing the current class.

@since 

1.2.2


## Members

### constructor


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  adapter  |  | `RequestAdapterInterface<Config>` |  |  |
|  executor  |  | `AsyncExecutor<unknown>` | ... |  |


### request
Executes a request with the given configuration.

This method need to be overridden by the subclass, override type definition of request method.

Of course, you can also override its logic.


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  config  | The configuration for the request. | `unknown` |  |  |


### usePlugin
Adds a plugin to the executor.

**@since** 

1.2.2


#### Parameters
| Name | Description | Type | Default | Since |
|------|------|---------|-------|------------|
|  plugin  | The plugin to be used by the executor. | `ExecutorPlugin<unknown> \| ExecutorPlugin<unknown>[]` |  |  |

