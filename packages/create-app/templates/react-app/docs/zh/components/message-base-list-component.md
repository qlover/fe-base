# MessageBaseList 组件文档

## 📋 组件概述

`MessageBaseList` 是一个简单的单向消息组件，用于测试消息网关（Gateway）功能。用户发送消息后，等待网关响应并显示结果。

## ✨ 功能特性

- ✅ 发送消息到网关
- ✅ 实时显示消息状态（发送中、成功、失败）
- ✅ 美观的聊天界面样式
- ✅ 完整的国际化支持（中英文）
- ✅ 错误处理和重试机制
- ✅ 响应式设计

## 🎨 界面特点

### 消息显示

- **用户消息**：蓝色气泡，右对齐
- **网关响应**：
  - **处理中**：灰色背景，带动画加载点
  - **成功**：绿色背景，显示响应结果
  - **失败**：红色背景，显示错误信息

### 空状态

当没有消息时，显示友好的提示文本，引导用户发送第一条消息。

## 🔧 使用方式

### 在页面中使用

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

## 🌐 国际化配置

### 文件结构

- **标识符定义**：`config/Identifier/components/component.messageBaseList.ts`
- **i18n 配置**：`config/i18n/messageBaseListI18n.ts`

### 支持的文本

| 文本项   | 中文                   | 英文                                        |
| -------- | ---------------------- | ------------------------------------------- |
| 标题     | 消息网关测试           | Message Gateway Test                        |
| 描述     | 发送消息并等待网关响应 | Send messages and wait for gateway response |
| 空状态   | 暂无消息               | No messages yet                             |
| 用户标签 | 你                     | You                                         |
| 网关标签 | 网关                   | Gateway                                     |
| 处理中   | 处理中...              | Processing...                               |
| 失败标签 | 网关（失败）           | Gateway (Failed)                            |
| 网关响应 | 网关响应               | Gateway Response                            |
| 发送按钮 | 发送                   | Send                                        |

## 🧪 测试功能

### 模拟网关行为

组件内置了 `MessageBaseApi` 类，模拟真实的网关行为：

- **正常响应**：200-1000ms 延迟，返回确认消息
- **触发错误**：
  - 发送包含 "error" 或 "Failed" 的消息
  - 随机网络错误（延迟能被 5 整除时）

### 测试建议

```
# 正常消息
Hello World

# 触发错误
error
Failed
test error message
```

## 📦 依赖的核心功能

### @qlover/corekit-bridge

- `MessagesStore` - 消息状态管理
- `MessageSender` - 消息发送器
- `SenderStrategyPlugin` - 发送策略插件
- `SendFailureStrategy.KEEP_FAILED` - 保留失败消息的策略

### 功能特点

1. **自动状态管理**：消息的加载、成功、失败状态自动更新
2. **失败保留**：失败的消息会保留在列表中，方便查看错误
3. **防重复发送**：发送中时禁用输入和按钮

## 🎯 样式系统

### Tailwind CSS 类

组件使用了项目的主题系统：

- `bg-primary` - 主背景色
- `bg-secondary` - 次级背景色
- `bg-base` - 基础背景色
- `text-text` - 主文本色
- `text-text-secondary` - 次级文本色
- `border-primary` - 主边框色

### 响应式设计

- 消息最大宽度：70%（适应不同屏幕）
- 消息列表最大高度：96（约 384px）
- 消息列表最小高度：64（约 256px）
- 自动滚动：overflow-y-auto

## 💡 使用场景

1. **开发调试**：测试消息网关功能
2. **演示展示**：展示消息发送和响应流程
3. **集成测试**：验证消息系统集成是否正常
4. **用户培训**：教学和培训用途

## 🔄 状态流转

```
用户输入消息
    ↓
点击发送 / 回车
    ↓
messagesSender.send()
    ↓
消息状态: loading = true
    ↓
调用 MessageBaseApi.sendMessage()
    ↓
[成功] → status: SENT, result: 响应内容
[失败] → status: FAILED, error: 错误信息
    ↓
UI 自动更新显示
```

## 📝 注意事项

1. **清空输入**：发送成功后自动清空输入框
2. **禁用控制**：发送中时禁用输入和发送按钮
3. **错误处理**：使用 `(message as any).error` 访问错误信息（类型安全）
4. **样式兼容**：使用 `wrap-break-word` 替代 `break-words`

## 🚀 未来扩展

可能的功能扩展方向：

- [ ] 支持图片、文件发送
- [ ] 支持消息编辑和删除
- [ ] 支持消息搜索
- [ ] 支持消息导出
- [ ] 支持自定义网关 API
- [ ] 支持 WebSocket 实时通信

## 🎉 总结

`MessageBaseList` 是一个功能完整、样式美观的消息组件，完全支持国际化，适合用于测试和展示消息网关功能。
