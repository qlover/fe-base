# ChatMessage 聊天组件系统

## 📋 概述

ChatMessage 是一个完整的聊天组件系统，支持实时对话、流式输出、错误处理等功能。适合用于 AI 对话、客服聊天等场景。

## ✨ 核心功能

- ✅ **流式输出**：支持逐字显示 AI 回复（类似 ChatGPT）
- ✅ **停止控制**：可随时停止正在生成的消息
- ✅ **重试机制**：失败消息可一键重试
- ✅ **草稿管理**：自动保存输入中的草稿消息
- ✅ **加载状态**：清晰的消息发送和接收状态
- ✅ **错误处理**：完善的错误提示和处理
- ✅ **快捷键**：Ctrl+Enter 快速发送
- ✅ **国际化**：完整的中英文支持
- ✅ **响应式设计**：适配不同屏幕尺寸

## 📁 文件结构

```
src/uikit/components/chatMessage/
├── ChatRoot.tsx              # 根组件（组装所有部分）
├── MessagesList.tsx          # 消息列表组件
├── MessageItem.tsx           # 单个消息项组件
├── FocusBar.tsx             # 输入栏组件
├── ChatMessageBridge.ts     # 桥接层（连接UI和逻辑）
└── MessageApi.ts            # API层（模拟/真实后端）

config/
├── Identifier/components/component.chatMessage.ts  # i18n 标识符
├── i18n/chatMessageI18n.ts                        # 组件 i18n 配置
├── Identifier/pages/page.chat.ts                  # 页面 i18n 标识符
└── i18n/chatI18n.ts                               # 页面 i18n 配置

src/pages/base/
└── ChatMessagePage.tsx       # 聊天页面
```

## 🎯 核心概念

### 1. ChatMessageBridge（桥接层）

连接 UI 和数据层的桥梁，处理：

- 消息发送逻辑
- 草稿管理
- 状态控制
- 停止机制

### 2. MessageApi（网关层）

模拟后端 API，支持三种模式：

#### 流式模式 (stream: true)

```typescript
{
  stream: true; // 逐字输出，可停止
}
```

#### 可中断普通模式

```typescript
{
  stream: false; // 一次性返回，可停止
}
```

#### 快速普通模式

```typescript
// 不传 options，一次性返回，不可停止
```

### 3. ChatMessageStore（状态管理）

管理所有消息状态：

- `messages` - 历史消息列表
- `draftMessages` - 草稿消息列表
- `streaming` - 是否正在流式输出
- `disabledSend` - 是否禁用发送

## 🚀 使用方式

### 基本使用

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

### 访问路径

- `/en/chat` - 英文
- `/zh/chat` - 中文

## 🎨 界面设计

### 消息样式

**用户消息**：

- 蓝色背景
- 右对齐
- 最大宽度 80%
- 显示耗时
- 带重试按钮

**AI 消息**：

- 浅色背景 + 边框
- 左对齐
- 最大宽度 85%
- 支持流式显示
- 显示加载状态

### 输入栏

- 自动调整高度（2-6 行）
- Ctrl+Enter 发送
- 禁用状态控制
- 发送/停止按钮切换

## 📝 关键API

### ChatMessageBridge 方法

```typescript
interface ChatMessageBridgeInterface<T> {
  // 发送消息
  send(message?: ChatMessage<T>): Promise<ChatMessage<T>>;

  // 停止发送
  stop(messageId?: string): boolean;

  // 停止所有
  stopAll(): void;

  // 更新内容
  onChangeContent(content: T): void;

  // 获取消息存储
  getMessageStore(): ChatMessageStore<T>;

  // 获取第一个草稿消息
  getFirstDraftMessage(): ChatMessage<T> | null;

  // 获取正在发送的消息
  getSendingMessage(): ChatMessage<T> | null;

  // 是否禁用发送
  getDisabledSend(): boolean;
}
```

### MessageApi 模式

```typescript
class MessageApi {
  async sendMessage<M>(message: M, options?: GatewayOptions<M>): Promise<M>;
}

interface GatewayOptions<M> {
  stream?: boolean; // 是否流式
  signal?: AbortSignal; // 停止信号
  onConnected?: () => void; // 连接成功
  onChunk?: (msg: M) => void; // 流式块回调
  onProgress?: (p: number) => void; // 进度回调
  onComplete?: (msg: M) => void; // 完成回调
  onAborted?: (msg: M) => void; // 停止回调
  onError?: (err: any) => void; // 错误回调
}
```

## 🔧 自定义配置

### 1. 切换发送模式

```typescript
// 修改 ChatRoot.tsx
const [bridge] = useState(() => {
  return new ChatMessageBridge<string>(messagesStore, {
    gateway: messageApi,
    logger: logger,
    senderName: 'ChatSender',
    gatewayOptions: {
      stream: true // 改为 false 使用普通模式
    }
  }).use(new ChatSenderStrategy(SendFailureStrategy.KEEP_FAILED, logger));
});
```

### 2. 自定义消息组件

```typescript
<MessagesList
  bridge={bridge}
  getMessageComponent={(props) => CustomMessageItem}
/>
```

### 3. 连接真实 API

修改 `MessageApi.ts`：

```typescript
async sendMessage<M>(message: M, options?: GatewayOptions<M>): Promise<M> {
  // 替换为真实 API 调用
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify(message),
    signal: options?.signal
  });

  // 处理流式响应
  if (options?.stream) {
    const reader = response.body?.getReader();
    // ... 处理流式数据
  }

  return response.json();
}
```

## 💡 使用建议

### 测试功能

**正常消息**：

```
Hello
你好
测试消息
```

**触发错误**：

```
error
Failed
test error
```

**查看流式效果**：

- 发送任意消息
- 观察逐字输出效果
- 点击停止按钮测试中断

### 快捷键

- `Ctrl + Enter` - 发送消息
- 输入中自动保存草稿

## 🎯 适用场景

1. **AI 对话应用**：类似 ChatGPT 的对话界面
2. **客服系统**：实时客服聊天
3. **问答系统**：Q&A 交互
4. **代码助手**：代码生成和解释
5. **教学助手**：在线学习辅导

## 🔄 消息流转

```
用户输入 → 草稿消息
    ↓
点击发送/Ctrl+Enter
    ↓
Bridge.send()
    ↓
MessageSender → MessageApi
    ↓
[流式模式]
  onConnected → onChunk(逐字) → onComplete

[普通模式]
  onConnected → onComplete

[错误]
  onError

[停止]
  onAborted
    ↓
更新 ChatMessageStore
    ↓
UI 自动更新
```

## 📊 状态管理

### 消息状态

- `DRAFT` - 草稿
- `SENDING` - 发送中
- `SENT` - 已发送
- `FAILED` - 失败
- `STOPPED` - 已停止

### 消息角色

- `USER` - 用户消息
- `ASSISTANT` - AI/助手消息
- `SYSTEM` - 系统消息

## 🎉 总结

ChatMessage 是一个功能完整、设计优雅的聊天组件系统，开箱即用，支持流式输出、错误处理、状态管理等核心功能。可以直接用于生产环境，也可以根据需要进行扩展和定制。
