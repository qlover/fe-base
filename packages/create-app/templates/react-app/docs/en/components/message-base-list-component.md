# MessageBaseList Component Documentation

## 📋 Component Overview

`MessageBaseList` is a simple one-way message component for testing message gateway functionality. Users send messages and wait for gateway responses with displayed results.

## ✨ Features

- ✅ Send messages to gateway
- ✅ Real-time message status display (sending, success, failure)
- ✅ Beautiful chat interface styling
- ✅ Full internationalization support (Chinese/English)
- ✅ Error handling and retry mechanism
- ✅ Responsive design

## 🎨 Interface Features

### Message Display

- **User Messages**: Blue bubble, right-aligned
- **Gateway Responses**:
  - **Processing**: Gray background with animated loading dots
  - **Success**: Green background with response result
  - **Failure**: Red background with error message

### Empty State

When there are no messages, displays friendly hint text to guide users to send their first message.

## 🔧 Usage

### Using in a Page

```tsx
import { MessageBaseList } from '@/uikit/components/MessageBaseList';

export default function MessagePage() {
  return (
    <div className="min-h-screen bg-primary py-8 px-4 sm:px-6 lg:px-8">
      <MessageBaseList />
    </div>
  );
}
```

## 🌐 Internationalization Configuration

### File Structure

- **Identifier Definitions**: `config/Identifier/components/component.messageBaseList.ts`
- **i18n Configuration**: `config/i18n/messageBaseListI18n.ts`

### Supported Text

| Text Item | Chinese | English |
|-----------|---------|---------|
| Title | 消息网关测试 | Message Gateway Test |
| Description | 发送消息并等待网关响应 | Send messages and wait for gateway response |
| Empty State | 暂无消息 | No messages yet |
| User Label | 你 | You |
| Gateway Label | 网关 | Gateway |
| Processing | 处理中... | Processing... |
| Failed Label | 网关（失败） | Gateway (Failed) |
| Gateway Response | 网关响应 | Gateway Response |
| Send Button | 发送 | Send |

## 🧪 Testing Features

### Simulated Gateway Behavior

The component includes a built-in `MessageBaseApi` class that simulates real gateway behavior:

- **Normal Response**: 200-1000ms delay, returns confirmation message
- **Trigger Errors**:
  - Send messages containing "error" or "Failed"
  - Random network errors (when delay is divisible by 5)

### Testing Suggestions

```
# Normal messages
Hello World

# Trigger errors
error
Failed
test error message
```

## 📦 Core Dependencies

### @qlover/corekit-bridge

- `MessagesStore` - Message state management
- `MessageSender` - Message sender
- `SenderStrategyPlugin` - Send strategy plugin
- `SendFailureStrategy.KEEP_FAILED` - Strategy to keep failed messages

### Features

1. **Automatic State Management**: Message loading, success, and failure states automatically update
2. **Failed Message Retention**: Failed messages remain in the list for error review
3. **Duplicate Send Prevention**: Input and button disabled during sending

## 🎯 Styling System

### Tailwind CSS Classes

Component uses project theme system:

- `bg-primary` - Primary background
- `bg-secondary` - Secondary background
- `bg-base` - Base background
- `text-text` - Primary text color
- `text-text-secondary` - Secondary text color
- `border-primary` - Primary border color

### Responsive Design

- Message max width: 70% (adapts to different screens)
- Message list max height: 96 (approx. 384px)
- Message list min height: 64 (approx. 256px)
- Auto scroll: overflow-y-auto

## 💡 Use Cases

1. **Development Debugging**: Test message gateway functionality
2. **Demonstrations**: Show message sending and response flow
3. **Integration Testing**: Verify message system integration
4. **User Training**: Teaching and training purposes

## 🔄 State Flow

```
User enters message
    ↓
Click send / Enter
    ↓
messagesSender.send()
    ↓
Message state: loading = true
    ↓
Call MessageBaseApi.sendMessage()
    ↓
[Success] → status: SENT, result: response content
[Failure] → status: FAILED, error: error message
    ↓
UI auto-updates display
```

## 📝 Notes

1. **Clear Input**: Input automatically clears after successful send
2. **Disable Control**: Input and send button disabled during sending
3. **Error Handling**: Uses `(message as any).error` to access error info (type-safe)
4. **Style Compatibility**: Uses `wrap-break-word` instead of `break-words`

## 🚀 Future Extensions

Possible feature expansion directions:

- [ ] Support image and file sending
- [ ] Support message editing and deletion
- [ ] Support message search
- [ ] Support message export
- [ ] Support custom gateway API
- [ ] Support WebSocket real-time communication

## 🎉 Summary

`MessageBaseList` is a fully-featured, beautifully styled message component with complete internationalization support, perfect for testing and demonstrating message gateway functionality.

