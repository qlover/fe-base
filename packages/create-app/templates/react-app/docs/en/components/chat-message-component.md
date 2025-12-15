# ChatMessage Chat Component System

## 📋 Overview

ChatMessage is a complete chat component system that supports real-time conversations, streaming output, error handling, and more. Suitable for AI dialogue, customer service chat, and other scenarios.

## ✨ Core Features

- ✅ **Streaming Output**: Supports character-by-character AI reply display (like ChatGPT)
- ✅ **Stop Control**: Can stop message generation at any time
- ✅ **Retry Mechanism**: Failed messages can be retried with one click
- ✅ **Draft Management**: Automatically saves draft messages being input
- ✅ **Loading States**: Clear message sending and receiving states
- ✅ **Error Handling**: Comprehensive error prompts and handling
- ✅ **Shortcuts**: Ctrl+Enter for quick send
- ✅ **Internationalization**: Full Chinese/English support
- ✅ **Responsive Design**: Adapts to different screen sizes

## 📁 File Structure

```
src/uikit/components/chatMessage/
├── ChatRoot.tsx              # Root component (assembles all parts)
├── MessagesList.tsx          # Message list component
├── MessageItem.tsx           # Single message item component
├── FocusBar.tsx             # Input bar component
├── ChatMessageBridge.ts     # Bridge layer (connects UI and logic)
└── MessageApi.ts            # API layer (mock/real backend)

config/
├── Identifier/components/component.chatMessage.ts  # i18n identifiers
├── i18n/chatMessageI18n.ts                        # Component i18n config
├── Identifier/pages/page.chat.ts                  # Page i18n identifiers
└── i18n/chatI18n.ts                               # Page i18n config

src/pages/base/
└── ChatMessagePage.tsx       # Chat page
```

## 🎯 Core Concepts

### 1. ChatMessageBridge (Bridge Layer)

Bridge connecting UI and data layer, handles:

- Message sending logic
- Draft management
- State control
- Stop mechanism

### 2. MessageApi (Gateway Layer)

Simulates backend API, supports three modes:

#### Streaming Mode (stream: true)

```typescript
{
  stream: true; // Character-by-character output, stoppable
}
```

#### Interruptible Normal Mode

```typescript
{
  stream: false; // One-time return, stoppable
}
```

#### Fast Normal Mode

```typescript
// No options passed, one-time return, non-stoppable
```

### 3. ChatMessageStore (State Management)

Manages all message states:

- `messages` - History message list
- `draftMessages` - Draft message list
- `streaming` - Whether streaming output is in progress
- `disabledSend` - Whether sending is disabled

## 🚀 Usage

### Basic Usage

```typescript
import { ChatRoot } from '@/uikit/components/chatMessage/ChatRoot';

export default function ChatMessagePage() {
  return (
    <div className="h-screen">
      <ChatRoot />
    </div>
  );
}
```

### Access Paths

- `/en/chat` - English
- `/zh/chat` - Chinese

## 🎨 Interface Design

### Message Styles

**User Messages**:

- Blue background
- Right-aligned
- Max width 80%
- Shows duration
- Has retry button

**AI Messages**:

- Light background + border
- Left-aligned
- Max width 85%
- Supports streaming display
- Shows loading state

### Input Bar

- Auto-adjusts height (2-6 rows)
- Ctrl+Enter to send
- Disabled state control
- Send/Stop button toggle

## 📝 Key APIs

### ChatMessageBridge Methods

```typescript
interface ChatMessageBridgeInterface<T> {
  // Send message
  send(message?: ChatMessage<T>): Promise<ChatMessage<T>>;

  // Stop sending
  stop(messageId?: string): boolean;

  // Stop all
  stopAll(): void;

  // Update content
  onChangeContent(content: T): void;

  // Get message store
  getMessageStore(): ChatMessageStore<T>;

  // Get first draft message
  getFirstDraftMessage(): ChatMessage<T> | null;

  // Get sending message
  getSendingMessage(): ChatMessage<T> | null;

  // Is send disabled
  getDisabledSend(): boolean;
}
```

### MessageApi Modes

```typescript
class MessageApi {
  async sendMessage<M>(message: M, options?: GatewayOptions<M>): Promise<M>;
}

interface GatewayOptions<M> {
  stream?: boolean; // Whether streaming
  signal?: AbortSignal; // Stop signal
  onConnected?: () => void; // Connection success
  onChunk?: (msg: M) => void; // Streaming chunk callback
  onProgress?: (p: number) => void; // Progress callback
  onComplete?: (msg: M) => void; // Completion callback
  onAborted?: (msg: M) => void; // Stop callback
  onError?: (err: any) => void; // Error callback
}
```

## 🔧 Custom Configuration

### 1. Switch Send Mode

```typescript
// Modify ChatRoot.tsx
const [bridge] = useState(() => {
  return new ChatMessageBridge<string>(messagesStore, {
    gateway: messageApi,
    logger: logger,
    senderName: 'ChatSender',
    gatewayOptions: {
      stream: true // Change to false for normal mode
    }
  }).use(new ChatSenderStrategy(SendFailureStrategy.KEEP_FAILED, logger));
});
```

### 2. Custom Message Component

```typescript
<MessagesList
  bridge={bridge}
  getMessageComponent={(props) => CustomMessageItem}
/>
```

### 3. Connect Real API

Modify `MessageApi.ts`:

```typescript
async sendMessage<M>(message: M, options?: GatewayOptions<M>): Promise<M> {
  // Replace with real API call
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify(message),
    signal: options?.signal
  });

  // Handle streaming response
  if (options?.stream) {
    const reader = response.body?.getReader();
    // ... process streaming data
  }

  return response.json();
}
```

## 💡 Usage Tips

### Test Features

**Normal Messages**:

```
Hello
你好
Test message
```

**Trigger Errors**:

```
error
Failed
test error
```

**See Streaming Effect**:

- Send any message
- Watch character-by-character output
- Click stop button to test interruption

### Shortcuts

- `Ctrl + Enter` - Send message
- Auto-save draft while typing

## 🎯 Use Cases

1. **AI Dialogue Apps**: ChatGPT-like dialogue interface
2. **Customer Service**: Real-time customer service chat
3. **Q&A Systems**: Q&A interaction
4. **Code Assistant**: Code generation and explanation
5. **Teaching Assistant**: Online learning tutoring

## 🔄 Message Flow

```
User Input → Draft Message
    ↓
Click Send/Ctrl+Enter
    ↓
Bridge.send()
    ↓
MessageSender → MessageApi
    ↓
[Streaming Mode]
  onConnected → onChunk(word-by-word) → onComplete

[Normal Mode]
  onConnected → onComplete

[Error]
  onError

[Stop]
  onAborted
    ↓
Update ChatMessageStore
    ↓
UI Auto-updates
```

## 📊 State Management

### Message States

- `DRAFT` - Draft
- `SENDING` - Sending
- `SENT` - Sent
- `FAILED` - Failed
- `STOPPED` - Stopped

### Message Roles

- `USER` - User message
- `ASSISTANT` - AI/Assistant message
- `SYSTEM` - System message

## 🎉 Summary

ChatMessage is a fully-featured, elegantly designed chat component system, ready to use out of the box, supporting streaming output, error handling, state management, and other core features. Can be used directly in production or extended and customized as needed.
