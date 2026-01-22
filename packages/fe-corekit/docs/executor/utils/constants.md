## `src/executor/utils/constants` (Module)

**Type:** `module src/executor/utils/constants`

---

### `ExecutorErrorType` (TypeAlias)

**Type:** `unknown \| unknown`

Type for executor error type constants

---

### `DEFAULT_HOOK_ON_BEFORE` (Variable)

**Type:** `"onBefore"`

Default hook name for pre-execution hooks

Used to execute plugins before the main task execution.
Plugins can modify input data or perform validation.

---

### `DEFAULT_HOOK_ON_ERROR` (Variable)

**Type:** `"onError"`

Default hook name for error handling hooks

Used to execute plugins when an error occurs during execution.
Plugins can handle or transform errors.

---

### `DEFAULT_HOOK_ON_EXEC` (Variable)

**Type:** `"onExec"`

Default hook name for main execution hooks

Used to execute plugins that modify or wrap the main task.
Only the first plugin's onExec hook is used.

---

### `DEFAULT_HOOK_ON_FINALLY` (Variable)

**Type:** `"onFinally"`

Default hook name for finally hooks

Used to execute plugins after the task execution, regardless of success or failure.
Plugins can perform cleanup operations or perform final actions.

---

### `DEFAULT_HOOK_ON_SUCCESS` (Variable)

**Type:** `"onSuccess"`

Default hook name for post-execution hooks

Used to execute plugins after successful task execution.
Plugins can process results or perform cleanup operations.

---

### `EXECUTOR_ASYNC_ERROR` (Variable)

**Type:** `"UNKNOWN_ASYNC_ERROR"`

Error type constant for asynchronous execution errors

Used when an error occurs during asynchronous task execution
or asynchronous plugin hook execution.

---

### `EXECUTOR_SYNC_ERROR` (Variable)

**Type:** `"UNKNOWN_SYNC_ERROR"`

Error type constant for synchronous execution errors

Used when an error occurs during synchronous task execution
or synchronous plugin hook execution.

---
