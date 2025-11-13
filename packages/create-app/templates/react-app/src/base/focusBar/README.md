# FocusBar 架构设计文档

> 一个灵活、可测试、职责清晰的聊天输入框组件

---

## 📋 目录

- [架构概览](#架构概览)
- [核心概念](#核心概念)
- [错误处理机制](#错误处理机制)
- [层级职责](#层级职责)
- [完整数据流](#完整数据流)
- [使用示例](#使用示例)
- [设计原则](#设计原则)
- [目录结构](#目录结构)

---

## 🏗️ 架构概览

FocusBar 采用三层架构设计，每层职责清晰、互不耦合：

```
┌─────────────────────────────────────────┐
│  Layer 3: Bridge (入口适配层)            │
│  - 适配不同输入入口                       │
│  - 处理 UI 相关逻辑                      │
└────────────────┬────────────────────────┘
                 │
┌────────────────┴────────────────────────┐
│  Layer 2: Service (业务逻辑层)           │
│  - 编排业务流程                          │
│  - 协调 Store 和 Gateway                │
└────────┬───────────────┬────────────────┘
         │               │
         ↓               ↓
┌─────────────┐   ┌──────────────┐
│   Store     │   │   Gateway    │
│  (本地数据)  │   │  (远程通信)   │
└─────────────┘   └──────────────┘
```

---

## 🎯 核心概念

### 为什么需要这个架构？

**核心问题：**
1. 聊天输入框有多种输入方式（文本、文件、语音、回复等）
2. 每种输入方式的处理逻辑不同
3. 需要本地状态管理和远程数据同步
4. 要求高可测试性和可扩展性

**解决方案：**
- **分层架构** - 每层职责单一
- **依赖接口** - 任何层都可替换
- **状态驱动** - 响应式更新 UI

---

## 🛡️ 错误处理机制

FocusBar 采用 **Result + Event** 模式处理错误，不抛出异常，类型安全。

### 核心设计原则

**❌ 不使用 try-catch 和异常抛出**
- Service 方法不抛出错误
- 返回 Result 对象（成功或失败）
- 通过 Event 对象发布错误事件

**✅ Result 模式**

```typescript
// 所有异步方法返回 Result
type Result<T> = SuccessResult<T> | FailureResult;

interface SuccessResult<T> {
  success: true;
  data: T;
  error: null;
}

interface FailureResult {
  success: false;
  data: null;
  error: Error;
  code?: string;  // 错误码
}
```

**✅ Event 模式**

```typescript
// Service 提供 events 对象
service.events.on('sendError', (event) => {
  console.error(event.error);
  showToast('发送失败');
});

service.events.on('afterSend', (event) => {
  console.log('发送成功:', event.data);
});
```

---

### Result 对象详解

#### 1. Result 类型定义

```typescript
/**
 * 成功结果
 */
export interface SuccessResult<T> {
  success: true;
  data: T;
  error: null;
}

/**
 * 失败结果
 */
export interface FailureResult {
  success: false;
  data: null;
  error: Error;
  code?: string;  // 可选的错误码
}

/**
 * Result 联合类型
 */
export type Result<T> = SuccessResult<T> | FailureResult;
```

#### 2. Result 工具类

```typescript
export class ResultUtils {
  /**
   * 创建成功结果
   */
  static success<T>(data: T): SuccessResult<T> {
    return {
      success: true,
      data,
      error: null
    };
  }
  
  /**
   * 创建失败结果
   */
  static failure(error: Error, code?: string): FailureResult {
    return {
      success: false,
      data: null,
      error,
      code
    };
  }
  
  /**
   * 从 Promise 创建 Result（自动捕获异常）
   */
  static async fromPromise<T>(promise: Promise<T>): Promise<Result<T>> {
    try {
      const data = await promise;
      return ResultUtils.success(data);
    } catch (error) {
      return ResultUtils.failure(error as Error);
    }
  }
}
```

#### 3. 使用 Result

```typescript
// Service 方法返回 Result
async sendMessage(message: Partial<Message>): Promise<Result<Message>> {
  // 内部处理所有错误，不抛出
  const result = await ResultUtils.fromPromise(
    this.gateway.send(message)
  );
  
  if (result.success) {
    return ResultUtils.success(result.data);
  } else {
    return ResultUtils.failure(result.error, 'SEND_FAILED');
  }
}

// 调用方检查 Result
const result = await service.sendMessage({ content: 'Hello' });

if (result.success) {
  console.log('发送成功:', result.data);  // ✅ data 是 Message 类型
} else {
  console.error('发送失败:', result.error);  // ✅ error 是 Error 类型
  console.log('错误码:', result.code);  // 'SEND_FAILED'
}
```

---

### Event 对象详解

#### 1. Event 类型定义

```typescript
/**
 * Service 事件类型
 */
export type ServiceEventType = 
  | 'beforeSend' | 'afterSend' | 'sendError'
  | 'beforeUpload' | 'afterUpload' | 'uploadError'
  | 'beforeDelete' | 'afterDelete' | 'deleteError'
  | 'beforeEdit' | 'afterEdit' | 'editError';

/**
 * 事件数据
 */
export interface ServiceEventData<T = any> {
  type: ServiceEventType;
  data?: T;
  error?: Error;
  timestamp: number;
}
```

#### 2. ServiceEvent 类实现

```typescript
export class ServiceEvent {
  private listeners = new Map<ServiceEventType, Set<(data: ServiceEventData) => void>>();
  
  /**
   * 监听事件
   */
  on(event: ServiceEventType, handler: (data: ServiceEventData) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }
  
  /**
   * 取消监听
   */
  off(event: ServiceEventType, handler: (data: ServiceEventData) => void): void {
    this.listeners.get(event)?.delete(handler);
  }
  
  /**
   * 触发事件
   */
  emit(event: ServiceEventType, data?: any, error?: Error): void {
    const eventData: ServiceEventData = {
      type: event,
      data,
      error,
      timestamp: Date.now()
    };
    
    this.listeners.get(event)?.forEach(handler => {
      try {
        handler(eventData);
      } catch (err) {
        console.error('Event handler error:', err);
      }
    });
  }
  
  /**
   * 一次性监听
   */
  once(event: ServiceEventType, handler: (data: ServiceEventData) => void): void {
    const wrappedHandler = (data: ServiceEventData) => {
      handler(data);
      this.off(event, wrappedHandler);
    };
    this.on(event, wrappedHandler);
  }
  
  /**
   * 清除所有监听
   */
  clear(): void {
    this.listeners.clear();
  }
}
```

#### 3. 使用 Event

```typescript
// Service 暴露 events 对象
class FocusBarService {
  readonly events = new ServiceEvent();
  
  async sendMessage(message) {
    // 1. 触发 beforeSend 事件
    this.events.emit('beforeSend', message);
    
    try {
      // 2. 执行发送
      const result = await this.gateway.send(message);
      
      // 3. 触发 afterSend 事件
      this.events.emit('afterSend', result);
      
      return ResultUtils.success(result);
    } catch (error) {
      // 4. 触发 sendError 事件
      this.events.emit('sendError', message, error);
      
      return ResultUtils.failure(error);
    }
  }
}

// 外部监听事件
service.events.on('sendError', (event) => {
  // 错误日志
  logger.error('Send failed:', event.error);
  
  // 错误上报
  errorReporter.report(event.error);
  
  // 用户提示
  message.error('发送失败');
});

service.events.on('afterSend', (event) => {
  // 成功提示
  message.success('发送成功');
  
  // 埋点统计
  analytics.track('message_sent', { messageId: event.data.id });
});
```

---

### 错误处理流程

```
用户操作
    ↓
Bridge.sendInput()
    ↓
Service.sendMessage()
    ├─ emit('beforeSend')     ← 触发前置事件
    ├─ Gateway.send()         ← 可能失败
    │    ↓
    │  成功？
    │    ├─ YES → emit('afterSend')  ← 触发成功事件
    │    │         return Result.success()
    │    │
    │    └─ NO → emit('sendError')   ← 触发错误事件
    │              return Result.failure()
    ↓
Bridge 检查 Result
    ├─ success? → 清空输入框
    └─ failure? → 保留输入内容

事件监听器（外部）
    ├─ sendError → 显示错误提示、上报错误
    └─ afterSend → 显示成功提示、埋点统计
```

---

### 完整示例：发送消息的错误处理

```typescript
// ========== 1. Service 实现 ==========
class FocusBarService {
  readonly events = new ServiceEvent();
  
  async sendMessage(messageData: Partial<Message>): Promise<Result<Message>> {
    // 1️⃣ 触发 beforeSend 事件
    this.events.emit('beforeSend', messageData);
    
    // 2️⃣ 创建本地消息
    const localMessage = this.store.addMessage({
      ...messageData,
      status: 'sending'
    });
    
    // 3️⃣ 调用 Gateway
    const sendResult = await ResultUtils.fromPromise(
      this.gateway.send(localMessage)
    );
    
    // 4️⃣ 处理结果
    if (sendResult.success) {
      // 成功：更新状态
      const sentMessage = this.store.updateMessage(localMessage.id, {
        ...sendResult.data,
        status: 'sent'
      });
      
      // 触发成功事件
      this.events.emit('afterSend', sentMessage);
      
      return ResultUtils.success(sentMessage);
      
    } else {
      // 失败：更新状态
      this.store.updateMessage(localMessage.id, {
        status: 'failed',
        error: sendResult.error.message
      });
      
      // 触发错误事件
      this.events.emit('sendError', localMessage, sendResult.error);
      
      return ResultUtils.failure(sendResult.error, 'SEND_FAILED');
    }
  }
}

// ========== 2. Bridge 调用 ==========
class FocusBarBridge {
  constructor(service: ServiceInterface) {
    // 设置事件监听
    service.events.on('sendError', (event) => {
      message.error('发送失败，请重试');
      errorReporter.report(event.error);
    });
    
    service.events.on('afterSend', (event) => {
      message.success('发送成功');
    });
  }
  
  async sendInput(text: string): Promise<Message | null> {
    // 前置校验
    if (!text.trim()) {
      message.error('请输入内容');
      return null;
    }
    
    // 调用 Service（不需要 try-catch）
    const result = await this.service.sendMessage({ content: text });
    
    // 检查 Result
    if (result.success) {
      return result.data;
    } else {
      // 错误已在事件监听器中处理
      return null;
    }
  }
}

// ========== 3. React 组件使用 ==========
function ChatComponent() {
  const service = useMemo(() => new FocusBarService(store, gateway), []);
  
  // 监听事件
  useEffect(() => {
    service.events.on('sendError', (event) => {
      console.error('Send error:', event.error);
    });
    
    service.events.on('afterSend', (event) => {
      setInputValue(''); // 清空输入框
    });
    
    return () => service.events.clear();
  }, [service]);
  
  const bridge = useMemo(() => new FocusBarBridge(service), [service]);
  
  const handleSend = async () => {
    // 不需要 try-catch
    const result = await bridge.sendInput(inputValue);
    if (result) {
      console.log('Sent:', result);
    }
  };
  
  return (
    <div>
      <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
      <Button onClick={handleSend}>发送</Button>
    </div>
  );
}
```

---

### 错误码设计

为了更好地处理不同类型的错误，我们定义了错误码：

```typescript
/**
 * 错误码枚举
 */
export const ErrorCode = {
  // 通用错误
  UNKNOWN: 'UNKNOWN',
  NOT_FOUND: 'NOT_FOUND',
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  
  // 发送相关
  SEND_FAILED: 'SEND_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  
  // 文件相关
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_TYPE_NOT_SUPPORTED: 'FILE_TYPE_NOT_SUPPORTED',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  
  // 编辑相关
  EDIT_FAILED: 'EDIT_FAILED',
  DELETE_FAILED: 'DELETE_FAILED',
  
  // 草稿相关
  NO_DRAFT: 'NO_DRAFT',
  SAVE_DRAFT_FAILED: 'SAVE_DRAFT_FAILED'
} as const;

// 使用错误码
const result = await service.sendMessage({ content: 'Hello' });

if (!result.success) {
  switch (result.code) {
    case ErrorCode.NETWORK_ERROR:
      message.error('网络错误，请检查网络连接');
      break;
    case ErrorCode.SEND_FAILED:
      message.error('发送失败，请稍后重试');
      break;
    default:
      message.error('未知错误');
  }
}
```

---

### Result + Event 的优势

| 特性 | 传统 try-catch | Result + Event |
|------|---------------|----------------|
| **类型安全** | ❌ error 是 any | ✅ 强类型检查 |
| **错误处理** | 分散，容易遗漏 | ✅ 集中统一 |
| **代码简洁** | 到处 try-catch | ✅ 无需 try-catch |
| **灵活性** | 低 | ✅ 高（事件监听） |
| **可测试性** | 一般 | ✅ 易于测试 |
| **错误追踪** | 困难 | ✅ 事件流清晰 |

**示例对比：**

```typescript
// ❌ 传统方式：到处 try-catch
async function sendMessage() {
  try {
    const result = await service.sendMessage({ content: 'Hello' });
    message.success('发送成功');
    return result;
  } catch (error: any) {
    message.error('发送失败');
    logger.error(error);
    throw error;
  }
}

// ✅ Result + Event：简洁清晰
async function sendMessage() {
  const result = await service.sendMessage({ content: 'Hello' });
  
  if (result.success) {
    return result.data;
  } else {
    return null;
  }
  
  // 错误提示由事件监听器统一处理
}
```

---

## 📚 层级职责

### Layer 1: Store（本地数据层）

**职责：管理应用的本地数据**

```typescript
interface StoreInterface<T> {
  // 查询
  getMessages(): T[];
  getMessage(id: string): T | undefined;
  
  // 修改
  addMessage(message: T): T;
  updateMessage(id: string, changes: Partial<T>): T | undefined;
  removeMessage(id: string): void;
  
  // 订阅
  subscribe(listener: (state: State) => void): () => void;
}
```

**特点：**
- ✅ 纯数据操作，无业务逻辑
- ✅ 负责本地持久化（localStorage/IndexedDB）
- ✅ 发布订阅模式，通知状态变化
- ✅ 可独立测试

**示例：**
```typescript
class MemoryStore implements StoreInterface {
  private messages: Message[] = [];
  
  addMessage(message: Message) {
    this.messages.push(message);
    this.saveToLocalStorage();  // Store 负责本地持久化
    this.notify();               // 通知订阅者
    return message;
  }
}
```

---

### Layer 1: Gateway（远程通信层）

**职责：与外部系统通信**

```typescript
interface MessageGatewayInterface<T> {
  // 发送消息到服务器
  send(message: T): Promise<T>;
  
  // 从服务器获取消息
  fetch?(id: string): Promise<T | null>;
  
  // 上传文件到云存储
  upload?(file: File): Promise<string>;
  
  // 删除服务器上的消息
  delete?(id: string): Promise<void>;
}
```

**特点：**
- ✅ 只负责外部通信（HTTP/WebSocket）
- ✅ **不负责本地数据存储**
- ✅ 可选配置（纯本地应用不需要）
- ✅ 可替换实现（HTTP/WebSocket/Mock）

**重要：Gateway vs Store**
```
Store    = 本地数据（内存 + localStorage）
Gateway  = 远程通信（HTTP/WebSocket）

不是重复！而是本地 vs 远程的区别
```

**示例：**
```typescript
class HttpGateway implements MessageGatewayInterface {
  async send(message: Message): Promise<Message> {
    // 发送到服务器，获取服务器返回的数据
    const response = await fetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify(message)
    });
    return response.json();
  }
  
  async upload(file: File): Promise<string> {
    // 上传到 OSS 或文件服务器
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const { url } = await response.json();
    return url;
  }
}
```

---

### Layer 2: Service（业务逻辑层）

**职责：编排业务逻辑，协调 Store 和 Gateway**

```typescript
interface ServiceInterface<T> {
  getStore(): StoreInterface<T>;
  
  // 统一的业务方法
  sendMessage(message: Partial<T>): Promise<T>;
  resendMessage(id: string): Promise<T>;
  deleteMessage(id: string): Promise<void>;
  editMessage(id: string, changes: Partial<T>): void;
}
```

**特点：**
- ✅ 管理消息的完整生命周期（draft → sending → sent/failed）
- ✅ 协调本地数据和远程同步
- ✅ 不包含 UI 逻辑
- ✅ 可配置钩子函数

**示例：**
```typescript
class FocusBarService implements ServiceInterface {
  constructor(
    private store: StoreInterface,
    private options: { gateway?: Gateway } = {}
  ) {}
  
  async sendMessage(messageData: Partial<Message>): Promise<Message> {
    // 1. 先存本地（Store 负责）
    const localMessage = this.store.addMessage({
      ...messageData,
      status: 'draft'
    });
    
    // 2. 更新为发送中
    this.store.updateMessage(localMessage.id, { status: 'sending' });
    
    try {
      // 3. 如果配置了 Gateway，发送到服务器
      if (this.options.gateway) {
        const serverMessage = await this.options.gateway.send(localMessage);
        
        // 4. 用服务器返回的数据更新本地
        return this.store.updateMessage(localMessage.id, {
          ...serverMessage,
          status: 'sent'
        });
      } else {
        // 纯本地，直接标记为成功
        return this.store.updateMessage(localMessage.id, {
          status: 'sent'
        });
      }
    } catch (error) {
      // 5. 失败时更新状态
      this.store.updateMessage(localMessage.id, {
        status: 'failed',
        error: error.message
      });
      throw error;
    }
  }
}
```

---

### Layer 3: Bridge（入口适配层）

**职责：适配不同的输入入口，处理 UI 逻辑**

```typescript
interface BridgeInterface<T> {
  getService(): ServiceInterface<T>;
  
  // 多样化的入口方法
  sendInput(text: string): Promise<T>;
  sendFile(file: File): Promise<T>;
  sendFiles(files: File[]): Promise<T[]>;
  sendVoice(audio: Blob, duration: number): Promise<T>;
  sendReply(text: string, replyToId: string): Promise<T>;
  
  // 其他操作
  resendMessage(id: string): Promise<T>;
  deleteMessage(id: string): Promise<void>;
}
```

**特点：**
- ✅ 每种入口有独立的处理逻辑
- ✅ 处理 UI 相关逻辑（弹窗、提示、校验）
- ✅ 数据转换和预处理
- ✅ 最终调用 Service 的统一方法

**为什么需要 Bridge？**

**问题：** Service 只有一个 `sendMessage` 方法，但实际有多种输入方式：

- 输入框发送文本 → 需要 trim、校验、确认
- 文件上传 → 需要先上传文件、校验大小、生成缩略图
- 语音录制 → 需要转码、压缩、生成时长
- 回复消息 → 需要关联原消息、格式化引用

每种入口的**前置处理完全不同**，Bridge 就是做这个适配工作的。

**示例：**
```typescript
class FocusBarBridge implements BridgeInterface {
  constructor(
    private service: ServiceInterface,
    private options: BridgeOptions = {}
  ) {}
  
  // 入口1: 文本输入
  async sendInput(text: string): Promise<Message> {
    // 1. 文本特有的处理
    const trimmed = text.trim();
    
    if (!trimmed) {
      this.showToast('请输入内容', 'error');
      throw new Error('Empty input');
    }
    
    if (trimmed.length > 500) {
      this.showToast('内容不能超过 500 字', 'error');
      throw new Error('Text too long');
    }
    
    // 2. 显示确认弹窗（可配置）
    if (this.options.confirmBeforeSend) {
      const confirmed = await this.showConfirm(`确定发送吗？`);
      if (!confirmed) throw new Error('Cancelled');
    }
    
    // 3. 转换为统一格式，调用 Service
    try {
      const message = await this.service.sendMessage({
        content: trimmed,
        type: 'text'
      });
      
      this.showToast('发送成功', 'success');
      return message;
    } catch (error) {
      this.showToast('发送失败', 'error');
      throw error;
    }
  }
  
  // 入口2: 文件上传
  async sendFile(file: File): Promise<Message> {
    // 1. 文件特有的处理
    if (file.size > 10 * 1024 * 1024) {
      this.showToast('文件不能超过 10MB', 'error');
      throw new Error('File too large');
    }
    
    try {
      // 2. 先上传文件（文件入口特有）
      this.showToast('正在上传...', 'info');
      const fileUrl = await this.uploadFile(file);
      
      // 3. 生成缩略图（如果是图片）
      let thumbnail: string | undefined;
      if (file.type.startsWith('image/')) {
        thumbnail = await this.generateThumbnail(file);
      }
      
      // 4. 转换为统一格式，调用 Service
      const message = await this.service.sendMessage({
        content: file.name,
        type: 'file',
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        thumbnail
      });
      
      this.showToast('文件发送成功', 'success');
      return message;
    } catch (error) {
      this.showToast('文件上传失败', 'error');
      throw error;
    }
  }
  
  // 入口3: 语音录制
  async sendVoice(audioBlob: Blob, duration: number): Promise<Message> {
    if (duration < 1) {
      this.showToast('录音时间太短', 'error');
      throw new Error('Voice too short');
    }
    
    try {
      // 音频转码压缩（语音入口特有）
      const compressed = await this.compressAudio(audioBlob);
      const voiceUrl = await this.uploadAudio(compressed);
      
      // 调用 Service
      const message = await this.service.sendMessage({
        content: '[语音消息]',
        type: 'voice',
        voiceUrl,
        duration
      });
      
      this.showToast('语音发送成功', 'success');
      return message;
    } catch (error) {
      this.showToast('语音发送失败', 'error');
      throw error;
    }
  }
}
```

---

## 🔄 完整数据流

### 场景：用户在输入框输入 "Hello World" 并点击发送

```
时间轴    用户操作          Bridge              Service            Store              Gateway
───────┼─────────────────┼──────────────────┼─────────────────┼─────────────────┼──────────────
0ms    │ 输入 "Hello"     │                  │                 │                 │
       │                 │                  │                 │                 │
100ms  │ 点击发送按钮      │                  │                 │                 │
       │                 │                  │                 │                 │
       ├────────────────→│ sendInput()      │                 │                 │
       │                 │                  │                 │                 │
       │                 │ 1️⃣ 校验内容       │                 │                 │
       │                 │   trim() ✅       │                 │                 │
       │                 │   检查长度 ✅      │                 │                 │
       │                 │   敏感词 ✅        │                 │                 │
       │                 │                  │                 │                 │
150ms  │ 显示确认弹窗      │ 2️⃣ showConfirm() │                 │                 │
       │←─────────────────│                  │                 │                 │
       │                 │                  │                 │                 │
200ms  │ 点击"确定"        │                  │                 │                 │
       ├────────────────→│                  │                 │                 │
       │                 │                  │                 │                 │
       │                 │ 3️⃣ 调用 Service   │                 │                 │
       │                 ├─────────────────→│ sendMessage()   │                 │
       │                 │                  │                 │                 │
       │                 │                  │ 4️⃣ 创建草稿      │                 │
       │                 │                  ├────────────────→│ addMessage()    │
       │                 │                  │                 │ status='draft'  │
       │                 │                  │                 │                 │
       │                 │                  │                 │ 5️⃣ 保存到本地    │
       │                 │                  │                 │ localStorage ✅  │
       │                 │                  │                 │                 │
       │                 │                  │                 │ 6️⃣ emit(state)  │
       │                 │                  │                 │ 通知订阅者       │
       │                 │                  │                 │                 │
250ms  │ 🔄 UI 重渲染      │                  │                 │                 │
       │ 显示消息（灰色）   │                  │                 │                 │
       │←─────────────────┴──────────────────┴─────────────────│                 │
       │                 │                  │                 │                 │
       │                 │                  │ 7️⃣ 更新为发送中   │                 │
       │                 │                  ├────────────────→│ updateMessage() │
       │                 │                  │                 │ status='sending'│
       │                 │                  │                 │                 │
       │                 │                  │                 │ 8️⃣ emit(state)  │
300ms  │ 🔄 UI 重渲染      │                  │                 │                 │
       │ 显示加载动画      │                  │                 │                 │
       │←─────────────────┴──────────────────┴─────────────────│                 │
       │                 │                  │                 │                 │
       │                 │                  │ 9️⃣ 调用 Gateway  │                 │
       │                 │                  ├─────────────────┴─────────────────→│
       │                 │                  │                                    │ send()
       │                 │                  │                                    │ POST /api/messages
       │                 │                  │                                    │
       │                 │                  │           ⏳ 等待服务器响应...     │
       │                 │                  │                                    │
1200ms │                 │                  │←────────────────────────────────────│
       │                 │                  │ 服务器返回:                         │
       │                 │                  │ { id: "msg-456", content: "Hello" }│
       │                 │                  │                 │                 │
       │                 │                  │ 🔟 更新为成功     │                 │
       │                 │                  ├────────────────→│ updateMessage() │
       │                 │                  │                 │ id='msg-456'    │
       │                 │                  │                 │ status='sent'   │
       │                 │                  │                 │                 │
       │                 │                  │                 │ 1️⃣1️⃣ emit(state)│
1250ms │ 🔄 UI 重渲染      │                  │                 │                 │
       │ 显示成功（蓝勾）   │                  │                 │                 │
       │ 清空输入框       │                  │                 │                 │
       │←─────────────────┴──────────────────┴─────────────────│                 │
       │                 │                  │                 │                 │
       │                 │ 1️⃣2️⃣ 成功提示    │                 │                 │
       │ ✅ "发送成功"     │                  │                 │                 │
       │←─────────────────│                  │                 │                 │
```

### 状态变化时间线

```
时间    Store 状态                         UI 显示
─────┼──────────────────────────────────┼──────────────────────────
0ms   │ messages: []                     │ 空列表，输入框有内容
      │                                  │
250ms │ messages: [{                     │ 消息出现（灰色草稿状态）
      │   id: "temp-1",                  │ 输入框保留内容
      │   content: "Hello World",        │
      │   status: "draft"                │
      │ }]                               │
      │                                  │
300ms │ messages: [{                     │ 消息变为加载状态
      │   id: "temp-1",                  │ 显示 spinner 动画
      │   status: "sending"              │
      │ }]                               │
      │                                  │
      │ ⏳ 等待服务器响应...              │ 持续显示 loading
      │                                  │
1250ms│ messages: [{                     │ 消息变为成功状态
      │   id: "msg-456",  ← 服务器 ID    │ 显示蓝色勾号
      │   content: "Hello World",        │ 输入框已清空
      │   status: "sent",                │
      │   sentAt: 1234567890             │
      │ }]                               │
```

---

## 💻 使用示例

### 基础使用（纯本地，无服务器）

```typescript
import { MemoryStore, FocusBarService, FocusBarBridge } from '@/focusbar';

// 1. 创建 Store
const store = new MemoryStore();

// 2. 创建 Service（不传 Gateway，纯本地）
const service = new FocusBarService(store);

// 3. 创建 Bridge
const bridge = new FocusBarBridge(service, {
  showConfirm: (msg) => window.confirm(msg),
  showToast: (msg, type) => console.log(`[${type}] ${msg}`)
});

// 4. 使用不同的入口
await bridge.sendInput('Hello World');       // 发送文本
await bridge.sendFile(file);                 // 发送文件
await bridge.sendVoice(audioBlob, 10);       // 发送语音
```

### 接入服务器

```typescript
import { 
  MemoryStore, 
  FocusBarService, 
  FocusBarBridge,
  HttpGateway 
} from '@/focusbar';

// 1. 创建 Store
const store = new MemoryStore();

// 2. 创建 Gateway
const gateway = new HttpGateway('/api');

// 3. 创建 Service（传入 Gateway）
const service = new FocusBarService(store, { gateway });

// 4. 创建 Bridge
const bridge = new FocusBarBridge(service);

// 5. 使用（和纯本地完全一样！）
await bridge.sendInput('Hello World');
```

### React 组件中使用

```typescript
import React, { useMemo, useState } from 'react';
import { useStore } from '@brain-toolkit/react-kit';
import { Modal, message } from 'antd';

function ChatComponent() {
  const [inputValue, setInputValue] = useState('');
  
  // 1. 创建完整架构
  const store = useMemo(() => new MemoryStore(), []);
  const gateway = useMemo(() => new HttpGateway('/api'), []);
  const service = useMemo(() => 
    new FocusBarService(store, { gateway }),
    [store, gateway]
  );
  const bridge = useMemo(() => 
    new FocusBarBridge(service, {
      showConfirm: (msg) => Modal.confirm({ content: msg }),
      showToast: (msg, type) => message[type](msg)
    }),
    [service]
  );
  
  // 2. 订阅状态
  const state = useStore(service.getStore());
  
  // 3. 事件处理
  const handleSend = async () => {
    try {
      await bridge.sendInput(inputValue);
      setInputValue('');  // 成功后清空
    } catch (error) {
      // 错误已在 Bridge 中处理
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await bridge.sendFile(file);
    }
  };
  
  return (
    <div>
      {/* 消息列表 */}
      <MessageList messages={state.messages} />
      
      {/* 输入框 */}
      <Input 
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onPressEnter={handleSend}
      />
      
      {/* 工具栏 */}
      <Button onClick={handleSend}>发送</Button>
      <input type="file" onChange={handleFileUpload} />
    </div>
  );
}
```

### 自定义实现

```typescript
// 自定义 Store（使用 IndexedDB）
class IndexedDBStore implements StoreInterface {
  // 实现 StoreInterface 的所有方法
}

// 自定义 Gateway（使用 WebSocket）
class WebSocketGateway implements MessageGatewayInterface {
  async send(message) {
    // WebSocket 实现
  }
}

// 使用自定义实现
const store = new IndexedDBStore();
const gateway = new WebSocketGateway('ws://localhost:8080');
const service = new FocusBarService(store, { gateway });
```

---

## 🎯 设计原则

### 1. 依赖倒置原则

**每层都依赖接口，不依赖具体实现**

```typescript
// ✅ Service 依赖接口
class Service {
  constructor(
    private store: StoreInterface,      // 接口
    private gateway: GatewayInterface   // 接口
  ) {}
}

// ❌ 不要这样
class Service {
  constructor(
    private store: MemoryStore,         // 具体实现
    private gateway: HttpGateway        // 具体实现
  ) {}
}
```

### 2. 单一职责原则

**每层只做一件事**

- Store → 只管数据
- Gateway → 只管通信
- Service → 只管业务逻辑
- Bridge → 只管入口适配

### 3. 开闭原则

**对扩展开放，对修改关闭**

```typescript
// 想换数据存储？实现新的 Store
class ReduxStore implements StoreInterface { }

// 想换通信方式？实现新的 Gateway
class WebSocketGateway implements GatewayInterface { }

// 想改业务逻辑？继承 Service
class CustomService extends FocusBarService { }

// 不需要修改原有代码！
```

### 4. 接口隔离原则

**接口最小化，可选配置**

```typescript
// Gateway 的方法都是可选的
interface MessageGatewayInterface {
  send(message: T): Promise<T>;      // 必选
  fetch?(id: string): Promise<T>;    // 可选
  upload?(file: File): Promise<string>; // 可选
}
```

### 5. 关注点分离

**UI 逻辑 vs 业务逻辑**

```typescript
// Bridge - UI 逻辑（弹窗、提示）
class Bridge {
  async sendInput(text: string) {
    if (!text.trim()) {
      this.showToast('请输入内容', 'error');  // UI 逻辑
      return;
    }
    await this.service.sendMessage({ content: text });
  }
}

// Service - 业务逻辑（状态管理）
class Service {
  async sendMessage(message) {
    this.store.addMessage(message);           // 业务逻辑
    await this.gateway.send(message);         // 业务逻辑
    this.store.updateMessage(message.id, { status: 'sent' });
  }
}
```

---

## 📦 目录结构

```
focusbar/
├── README.md                    # 本文档
├── index.ts                     # 主入口
│
├── interface/                   # 接口定义（只有类型，无实现）
│   ├── MessageInterface.ts      # 消息数据接口
│   ├── StoreInterface.ts        # Store 接口
│   ├── GatewayInterface.ts      # Gateway 接口
│   ├── ServiceInterface.ts      # Service 接口
│   ├── BridgeInterface.ts       # Bridge 接口
│   └── index.ts
│
├── store/                       # Store 实现
│   ├── MemoryStore.ts           # 内存 Store
│   ├── IndexedDBStore.ts        # IndexedDB Store（可选）
│   └── index.ts
│
├── gateway/                     # Gateway 实现
│   ├── HttpGateway.ts           # HTTP Gateway
│   ├── WebSocketGateway.ts      # WebSocket Gateway（可选）
│   ├── MockGateway.ts           # Mock Gateway（用于测试）
│   └── index.ts
│
├── service/                     # Service 实现
│   ├── FocusBarService.ts       # 默认 Service 实现
│   └── index.ts
│
├── bridge/                      # Bridge 实现
│   ├── FocusBarBridge.ts        # 默认 Bridge 实现
│   └── index.ts
│
├── ui/                          # UI 组件（可选）
│   ├── react/                   # React 组件
│   │   ├── FocusBar.tsx
│   │   └── useFocusBar.ts
│   └── vue/                     # Vue 组件（如需要）
│
└── __tests__/                   # 测试文件
    ├── Store.test.ts
    ├── Gateway.test.ts
    ├── Service.test.ts
    └── Bridge.test.ts
```

---

## 🧪 测试示例

### 测试 Store

```typescript
describe('MemoryStore', () => {
  it('should add and retrieve message', () => {
    const store = new MemoryStore();
    const message = store.addMessage({ content: 'Hello' });
    
    expect(store.getMessages()).toHaveLength(1);
    expect(store.getMessage(message.id)).toEqual(message);
  });
  
  it('should notify subscribers when state changes', () => {
    const store = new MemoryStore();
    const listener = jest.fn();
    
    store.subscribe(listener);
    store.addMessage({ content: 'Hello' });
    
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
```

### 测试 Service

```typescript
describe('FocusBarService', () => {
  it('should work without gateway (local only)', async () => {
    const store = new MemoryStore();
    const service = new FocusBarService(store);
    
    const message = await service.sendMessage({ content: 'Hello' });
    
    expect(message.status).toBe('sent');
    expect(store.getMessages()).toHaveLength(1);
  });
  
  it('should sync with gateway', async () => {
    const store = new MemoryStore();
    const gateway = new MockGateway();
    const service = new FocusBarService(store, { gateway });
    
    const message = await service.sendMessage({ content: 'Hello' });
    
    // 验证本地和远程都已更新
    expect(message.status).toBe('sent');
    expect(message.id).toBeDefined();
  });
});
```

---

## ❓ 常见问题

### Q1: 为什么不直接用 MVC？

**A:** MVC 的 Model 太重（数据 + 逻辑 + 持久化混在一起），我们的架构将其拆分为：
- Store（数据）
- Service（逻辑）
- Gateway（外部通信）

职责更清晰，更易测试。

### Q2: 为什么需要 Bridge？Service 不够吗？

**A:** Service 只有统一的 `sendMessage` 方法，但实际有多种输入方式：
- 输入框 → 需要 trim、校验
- 文件上传 → 需要先上传、生成缩略图
- 语音 → 需要转码、压缩

Bridge 就是做这个**入口适配**工作的。

### Q3: Gateway 和 Store 不是重复吗？

**A:** 不是！
- **Store** = 本地数据（内存 + localStorage）
- **Gateway** = 远程通信（HTTP/WebSocket）

这是**本地 vs 远程**的区别，不是重复。

### Q4: 什么时候不需要 Gateway？

**A:** 纯本地应用不需要：
```typescript
const service = new FocusBarService(store);  // 不传 gateway
```

### Q5: 可以只用 Service，不用 Bridge 吗？

**A:** 可以！如果你的场景简单，只有一个输入入口：
```typescript
const service = new FocusBarService(store, { gateway });
await service.sendMessage({ content: 'Hello' });
```

---

## 🚀 下一步

1. ✅ 理解架构设计
2. ✅ 实现基础接口
3. ⏳ 实现 Store
4. ⏳ 实现 Gateway
5. ⏳ 实现 Service
6. ⏳ 实现 Bridge
7. ⏳ 编写测试
8. ⏳ 完善文档

---

## 📝 变更记录

- 2024-01-XX: 初始架构设计
- 2024-01-XX: 将 Adapter 重命名为 Gateway

---

## 📧 联系方式

如有问题或建议，请联系开发团队。

