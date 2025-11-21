# ChatMessage Refactoring Guide

## Refactoring Overview

Refactored ChatMessage from a standalone page to a reusable component, integrated into MessagePage. Passed the internationalization object `tt` through props to ensure high component reusability.

## Changes

### 1. ChatRoot Component Refactoring

**File:** `src/uikit/components/chatMessage/ChatRoot.tsx`

**Changes:**
- Removed internal creation of `ChatMessageStore`, `MessageApi`, and `ChatMessageBridge`
- Changed to accept `bridge` and `tt` (internationalization object) as props
- Added `ChatRootProps` interface definition
- Removed internal `useI18nInterface` call

**Before:**
```typescript
export function ChatRoot() {
  const messagesStore = useFactory(ChatMessageStore<string>);
  const messageApi = useFactory(MessageApi, messagesStore);
  const [bridge] = useState(() => {
    return new ChatMessageBridge<string>(messagesStore, {
      gateway: messageApi,
      logger: logger,
      senderName: 'ChatSender',
      gatewayOptions: { stream: true }
    }).use(new ChatSenderStrategy(SendFailureStrategy.KEEP_FAILED, logger));
  });
  
  return (
    <div data-testid="ChatRoot">
      <MessagesList bridge={bridge} />
      <FocusBar bridge={bridge} />
    </div>
  );
}
```

**After:**
```typescript
export interface ChatRootProps {
  bridge: ChatMessageBridge<string>;
  tt: ChatMessageI18nInterface;
}

export function ChatRoot({ bridge, tt }: ChatRootProps) {
  return (
    <div data-testid="ChatRoot">
      <MessagesList bridge={bridge} tt={tt} />
      <FocusBar bridge={bridge} tt={tt} />
    </div>
  );
}
```

### 2. Integrating ChatRoot into MessagePage

**File:** `src/pages/base/MessagePage.tsx`

**Changes:**
- Use `useI18nInterface` to get the internationalization object `tt` in MessagePage
- Create `ChatMessageStore`, `MessageApi`, and `ChatMessageBridge` in MessagePage
- Pass both `bridge` and `tt` to `ChatRoot` component via props
- Also integrated the `MessageBaseList` component

**Implementation:**
```typescript
import { useFactory } from '@brain-toolkit/react-kit';
import { chatMessageI18n } from '@config/i18n/chatMessageI18n';
import {
  ChatMessageStore,
  ChatSenderStrategy,
  SendFailureStrategy
} from '@qlover/corekit-bridge';
import { useState } from 'react';
import { logger } from '@/core/globals';
import { ChatMessageBridge } from '@/uikit/components/chatMessage/ChatMessageBridge';
import { ChatRoot } from '@/uikit/components/chatMessage/ChatRoot';
import { MessageApi } from '@/uikit/components/chatMessage/MessageApi';
import { MessageBaseList } from '@/uikit/components/MessageBaseList';
import { useI18nInterface } from '@/uikit/hooks/useI18nInterface';

export default function MessagePage() {
  const tt = useI18nInterface(chatMessageI18n);
  const messagesStore = useFactory(ChatMessageStore<string>);
  const messageApi = useFactory(MessageApi, messagesStore);

  const [bridge] = useState(() => {
    return new ChatMessageBridge<string>(messagesStore, {
      gateway: messageApi,
      logger: logger,
      senderName: 'ChatSender',
      gatewayOptions: { stream: true }
    }).use(new ChatSenderStrategy(SendFailureStrategy.KEEP_FAILED, logger));
  });

  return (
    <div
      data-testid="MessagePage"
      className="min-h-screen bg-primary py-8 px-4 sm:px-6 lg:px-8"
    >
      <MessageBaseList />
      <ChatRoot bridge={bridge} tt={tt} />
    </div>
  );
}
```

### 3. Child Component Refactoring (MessagesList, FocusBar, MessageItem)

**Changes:**
- Removed internal `useI18nInterface` calls from all child components
- Changed to accept `tt` parameter via props
- Updated Props interface definitions for each component

**Example - MessagesList:**
```typescript
// Before
export function MessagesList({ bridge, ... }: MessagesListProps) {
  const tt = useI18nInterface(chatMessageI18n);
  // ...
}

// After
export interface MessagesListProps {
  bridge: ChatMessageBridgeInterface<T>;
  tt: ChatMessageI18nInterface;
  // ...
}

export function MessagesList({ bridge, tt, ... }: MessagesListProps) {
  // Use the passed tt directly
}
```

### 4. Removed Standalone ChatMessagePage

**Deleted Files:**
- `src/pages/base/ChatMessagePage.tsx`
- `config/Identifier/pages/page.chat.ts`
- `config/i18n/chatI18n.ts`

**Updated Files:**
- `config/app.router.ts` - Removed `/chat` route configuration
- `config/Identifier/pages/index.ts` - Removed `page.chat` export

## Advantages of Refactoring

### 1. Improved Component Reusability
- `ChatRoot` is now a pure presentational component that can be used anywhere
- Creation and configuration of `bridge` and `tt` are controlled by parent component for better flexibility
- Parent component can customize internationalization content, supporting different language environments

### 2. Simplified Routing Structure
- Reduced unnecessary routing layers
- Directly integrated chat functionality into message page, aligning with business logic

### 3. Better Separation of Concerns
- `ChatRoot` and its child components focus only on UI presentation
- Business logic (store, api, bridge) is managed at the page level
- Internationalization configuration is centrally managed at the page level
- Easier to test and maintain

### 4. Reduced Boilerplate
- No need to create a separate page for chat functionality
- No need to create separate i18n configuration for the page
- Child components don't need to repeatedly call `useI18nInterface`

### 5. Performance Improvement
- Reduced number of hook calls (multiple child components share the same `tt` object)
- Avoided redundant internationalization configuration parsing

## Usage Example

### Basic Usage

If you need to use `ChatRoot` elsewhere:

```typescript
import { useFactory } from '@brain-toolkit/react-kit';
import { chatMessageI18n } from '@config/i18n/chatMessageI18n';
import {
  ChatMessageStore,
  ChatSenderStrategy,
  SendFailureStrategy
} from '@qlover/corekit-bridge';
import { useState } from 'react';
import { logger } from '@/core/globals';
import { useI18nInterface } from '@/uikit/hooks/useI18nInterface';
import { ChatMessageBridge } from '@/uikit/components/chatMessage/ChatMessageBridge';
import { ChatRoot } from '@/uikit/components/chatMessage/ChatRoot';
import { MessageApi } from '@/uikit/components/chatMessage/MessageApi';

function MyCustomChatPage() {
  // Get internationalization object
  const tt = useI18nInterface(chatMessageI18n);
  
  const messagesStore = useFactory(ChatMessageStore<string>);
  const messageApi = useFactory(MessageApi, messagesStore);

  const [bridge] = useState(() => {
    return new ChatMessageBridge<string>(messagesStore, {
      gateway: messageApi,
      logger: logger,
      senderName: 'MyCustomSender',
      gatewayOptions: { 
        stream: true,
        // Can customize other options
      }
    }).use(new ChatSenderStrategy(SendFailureStrategy.KEEP_FAILED, logger));
  });

  return (
    <div>
      <h1>My Custom Chat</h1>
      <ChatRoot bridge={bridge} tt={tt} />
    </div>
  );
}
```

### Custom Internationalization

If you need to use custom internationalization configuration:

```typescript
import { useState } from 'react';
import type { ChatMessageI18nInterface } from '@config/i18n/chatMessageI18n';

// Custom internationalization object
const customI18n: ChatMessageI18nInterface = {
  title: 'custom.chat.title',
  empty: 'custom.chat.empty',
  start: 'custom.chat.start',
  // ... other configurations
};

function MyCustomChatPage() {
  const tt = useI18nInterface(customI18n);
  // ... other logic
  
  return <ChatRoot bridge={bridge} tt={tt} />;
}
```

## Notes

1. `ChatRoot` component requires two required parameters via props:
   - `bridge`: `ChatMessageBridge` instance
   - `tt`: `ChatMessageI18nInterface` internationalization object

2. Creation and configuration of `bridge` should be done in the parent component

3. Ensure `bridge` is created using `useState` to avoid re-initialization

4. Internationalization object `tt` should be obtained using `useI18nInterface` in the parent component, then passed to `ChatRoot`

5. All child components (`MessagesList`, `FocusBar`, `MessageItem`) used by `ChatRoot` receive both `bridge` and `tt` via props

6. All child components no longer call `useI18nInterface` themselves, but use the `tt` passed from the parent component

## Related Documentation

- [ChatMessage Component Documentation](./chat-message-component.md)
- [MessagePage Simplification Guide](./message-page-简化说明.md)
- [Development Guide](./development-guide.md)

