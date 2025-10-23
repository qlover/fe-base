## `src/core/ui/UIBridgeInterface` (Module)

**Type:** `unknown`

---

### `UIBridgeInterface` (Interface)

**Type:** `unknown`

UI Bridge Interface for connecting business logic with UI layer functionality

Core concept:
Provides a standardized bridge pattern implementation that allows business logic
to interact with UI components without direct dependencies. This enables better
separation of concerns and more flexible UI integration.

Main features:

- UI Layer Integration:
  - Support React hooks integration in implementation classes
  - Enable direct UI component method calls (e.g., Antd components)
  - Maintain type safety through generic typing

- Bridge Pattern Benefits:
  - Decouples business logic from UI implementation
  - Allows swapping UI implementations without changing business code
  - Facilitates testing through UI mock implementations

Business rules:

- Each bridge implementation should handle one specific UI concern
- Bridge instances should be created and managed by IoC container
- UI instances must be set before any bridge methods are called

**Example:** Basic Dialog Component Bridge

```tsx
class DialogBridge implements UIBridgeInterface<Dialog> {
  private dialog: Dialog;

  setUIBridge(ui: Dialog): void {
    this.dialog = ui;
  }

  showDialog(content: string): void {
    this.dialog.show(content);
  }
}
```

**Example:** React Hook Bridge

```tsx
interface UseCounterReturn {
  count: number;
  increment: () => void;
}

class CounterBridge implements UIBridgeInterface<UseCounterReturn> {
  private counter: UseCounterReturn;

  setUIBridge(ui: UseCounterReturn): void {
    this.counter = ui;
  }

  getCurrentCount(): number {
    return this.counter.count;
  }

  incrementCounter(): void {
    this.counter.increment();
  }
}
```

---

#### `getUIBridge` (Method)

**Type:** `() => null \| T`

---

##### `getUIBridge` (CallSignature)

**Type:** `null \| T`

---

#### `setUIBridge` (Method)

**Type:** `(ui: T) => void`

#### Parameters

| Name                                          | Type | Optional | Default | Since | Deprecated | Description                   |
| --------------------------------------------- | ---- | -------- | ------- | ----- | ---------- | ----------------------------- |
| `ui`                                          | `T`  | ❌       | -       | -     | -          | The UI instance to be bridged |
| Type is determined by the generic parameter T |

---

##### `setUIBridge` (CallSignature)

**Type:** `void`

Set the UI instance for this bridge

This method must be called before any other bridge methods can be used.
The provided UI instance will be stored and used for all subsequent
UI operations through this bridge.

**Throws:**

When ui parameter is null or undefined

**Example:**

```tsx
const dialog = new Dialog();
const bridge = new DialogBridge();
bridge.setUIBridge(dialog);
```

#### Parameters

| Name                                          | Type | Optional | Default | Since | Deprecated | Description                   |
| --------------------------------------------- | ---- | -------- | ------- | ----- | ---------- | ----------------------------- |
| `ui`                                          | `T`  | ❌       | -       | -     | -          | The UI instance to be bridged |
| Type is determined by the generic parameter T |

---
