## `src/core/ui/UINotificationInterface` (Module)

**Type:** `module src/core/ui/UINotificationInterface`

---

### `NotificationOptions` (Interface)

**Type:** `interface NotificationOptions`

Configuration options for UI notifications

These options control the behavior and lifecycle of notifications,
allowing customization of timing, error handling, and cleanup actions.

---

#### `duration` (Property)

**Type:** `number`

Display duration in milliseconds

Controls how long the notification remains visible before auto-closing.
If not specified, the notification will use the system default duration.

---

#### `error` (Property)

**Type:** `unknown`

Error object for error notifications

When provided, the notification will be styled as an error message
and may include additional error details in the display.
Supports any error type for flexible error handling.

**Example:**

```typescript
error: new Error('Failed to save data');
```

---

#### `onClose` (Property)

**Type:** `Object`

Callback function executed when notification closes

Useful for cleanup tasks or triggering subsequent actions after
the user has been notified. Called regardless of whether the
notification was closed automatically or manually.

**Example:**

```typescript
onClose: () => {
  // Refresh data or update UI state
  refreshData();
};
```

---

### `UINotificationInterface` (Interface)

**Type:** `interface UINotificationInterface`

Interface for displaying UI notifications

Provides a standardized way to show notifications across the application,
supporting various message types (success, error, info, warning) and
customizable display options.

Core features:

- Consistent notification styling and positioning
- Automatic stacking of multiple notifications
- Support for HTML/React elements in message content
- Configurable display duration and animations
- Error message formatting and display

**Example:** Success notification

```typescript
notify('Data saved successfully', { duration: 3000 });
```

**Example:** Error notification

```typescript
notify('Failed to save', {
  error: new Error('Network error'),
  duration: 5000,
  onClose: () => logError('Save failed')
});
```

---

#### `notify` (Method)

**Type:** `(message: unknown, options: NotificationOptions) => void`

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description                                 |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `message` | `unknown`             | ❌       | -       | -     | -          | Content to display in the notification      |
| `options` | `NotificationOptions` | ✅       | -       | -     | -          | Optional configuration for the notification |

---

##### `notify` (CallSignature)

**Type:** `void`

Display a notification message

Shows a notification with the specified message and options.
The message can be a string, error object, or a complex object
that will be appropriately formatted for display.

**Example:** Simple message

```typescript
notify('Operation completed');
```

**Example:** Complex notification

```typescript
notify('Save failed', {
  error: error,
  duration: 5000,
  onClose: () => retryOperation()
});
```

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description                                 |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `message` | `unknown`             | ❌       | -       | -     | -          | Content to display in the notification      |
| `options` | `NotificationOptions` | ✅       | -       | -     | -          | Optional configuration for the notification |

---
