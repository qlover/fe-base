# ChatMessage 重构说明

## 重构内容

将 ChatMessage 从独立页面重构为可复用组件，集成到 MessagePage 中，并通过 props 传递国际化对象 `tt`，确保组件的高度可复用性。

## 改动说明

### 1. ChatRoot 组件改造

**文件：** `src/uikit/components/chatMessage/ChatRoot.tsx`

**改动：**

- 移除了内部的 `ChatMessageStore`、`MessageApi` 和 `ChatMessageBridge` 创建逻辑
- 改为接收 `bridge` 和 `tt`（国际化对象）作为 props
- 添加了 `ChatRootProps` 接口定义
- 移除了内部的 `useI18nInterface` 调用

**改造前：**

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

**改造后：**

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

### 2. MessagePage 集成 ChatRoot

**文件：** `src/pages/base/MessagePage.tsx`

**改动：**

- 在 MessagePage 中使用 `useI18nInterface` 获取国际化对象 `tt`
- 在 MessagePage 中创建 `ChatMessageStore`、`MessageApi` 和 `ChatMessageBridge`
- 将 `bridge` 和 `tt` 通过 props 传递给 `ChatRoot` 组件
- 同时集成了 `MessageBaseList` 组件

**实现：**

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

### 3. 子组件改造（MessagesList、FocusBar、MessageItem）

**改动：**

- 移除了所有子组件内部的 `useI18nInterface` 调用
- 改为通过 props 接收 `tt` 参数
- 更新了各组件的 Props 接口定义

**示例 - MessagesList：**

```typescript
// 改造前
export function MessagesList({ bridge, ... }: MessagesListProps) {
  const tt = useI18nInterface(chatMessageI18n);
  // ...
}

// 改造后
export interface MessagesListProps {
  bridge: ChatMessageBridgeInterface<T>;
  tt: ChatMessageI18nInterface;
  // ...
}

export function MessagesList({ bridge, tt, ... }: MessagesListProps) {
  // 直接使用传入的 tt
}
```

### 4. 删除独立的 ChatMessagePage

**删除的文件：**

- `src/pages/base/ChatMessagePage.tsx`
- `config/Identifier/pages/page.chat.ts`
- `config/i18n/chatI18n.ts`

**更新的文件：**

- `config/app.router.ts` - 移除了 `/chat` 路由配置
- `config/Identifier/pages/index.ts` - 移除了 `page.chat` 导出

## 重构优势

### 1. 提高组件复用性

- `ChatRoot` 现在是一个纯展示组件，可以在任何地方使用
- `bridge` 和 `tt` 的创建和配置由父组件控制，更加灵活
- 父组件可以自定义国际化内容，支持不同语言环境

### 2. 简化路由结构

- 减少了不必要的路由层级
- 将聊天功能直接集成到消息页面中，符合业务逻辑

### 3. 更好的关注点分离

- `ChatRoot` 及其子组件只关注 UI 展示
- 业务逻辑（store、api、bridge）在页面层管理
- 国际化配置在页面层统一管理
- 更容易测试和维护

### 4. 减少样板代码

- 不需要为聊天功能创建单独的页面
- 不需要为页面创建单独的 i18n 配置
- 子组件不需要重复调用 `useI18nInterface`

### 5. 提升性能

- 减少了 hook 调用次数（多个子组件共享同一个 `tt` 对象）
- 避免了重复的国际化配置解析

## 使用示例

### 基本用法

如果需要在其他地方使用 `ChatRoot`：

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
  // 获取国际化对象
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
        // 可以自定义其他选项
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

### 自定义国际化

如果需要使用自定义的国际化配置：

```typescript
import { useState } from 'react';
import type { ChatMessageI18nInterface } from '@config/i18n/chatMessageI18n';

// 自定义的国际化对象
const customI18n: ChatMessageI18nInterface = {
  title: 'custom.chat.title',
  empty: 'custom.chat.empty',
  start: 'custom.chat.start',
  // ... 其他配置
};

function MyCustomChatPage() {
  const tt = useI18nInterface(customI18n);
  // ... 其他逻辑

  return <ChatRoot bridge={bridge} tt={tt} />;
}
```

## 注意事项

1. `ChatRoot` 组件需要通过 props 接收两个必需参数：
   - `bridge`: `ChatMessageBridge` 实例
   - `tt`: `ChatMessageI18nInterface` 国际化对象

2. `bridge` 的创建和配置应该在父组件中完成

3. 确保 `bridge` 使用 `useState` 创建，避免重复初始化

4. 国际化对象 `tt` 应该在父组件使用 `useI18nInterface` 获取，然后传递给 `ChatRoot`

5. `ChatRoot` 依赖的所有子组件（`MessagesList`、`FocusBar`、`MessageItem`）都通过 props 接收 `bridge` 和 `tt`

6. 所有子组件都不再自己调用 `useI18nInterface`，而是使用父组件传递的 `tt`

## 相关文档

- [ChatMessage 组件文档](./chat-message-component.md)
- [MessagePage 简化说明](./message-page-简化说明.md)
- [开发指南](./development-guide.md)
