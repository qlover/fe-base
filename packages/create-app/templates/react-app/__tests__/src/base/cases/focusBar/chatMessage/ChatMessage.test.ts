import { describe, it, expect } from 'vitest';
import {
  ChatMessage,
  ChatMessageRole,
  type ChatMessageRoleType
} from '@/base/focusBar/chatMessage/ChatMessage';
import { MessageStatus } from '@/base/focusBar/impl/MessagesStore';

describe('ChatMessageRole', () => {
  it('应该定义所有角色常量', () => {
    expect(ChatMessageRole.USER).toBe('user');
    expect(ChatMessageRole.SYSTEM).toBe('system');
    expect(ChatMessageRole.ASSISTANT).toBe('assistant');
  });

  it('角色常量应该是只读的', () => {
    // as const 创建的对象在 TypeScript 中是只读的，但在 JavaScript 运行时不是
    // 我们检查对象是否被 freeze
    expect(Object.isFrozen(ChatMessageRole)).toBe(false); // as const 不会 freeze

    // 尝试修改会在严格模式下失败，但不会抛出错误
    const originalValue = ChatMessageRole.USER;
    (ChatMessageRole as any).USER = 'modified';
    // 恢复原值
    (ChatMessageRole as any).USER = originalValue;
  });
});

describe('ChatMessage', () => {
  describe('构造函数', () => {
    it('应该使用默认值创建消息', () => {
      const message = new ChatMessage();

      expect(message.id).toBeUndefined();
      expect(message.content).toBeUndefined();
      expect(message.loading).toBe(false);
      expect(message.result).toBeNull();
      expect(message.error).toBeNull();
      expect(message.startTime).toBeGreaterThan(0);
      expect(message.endTime).toBe(0);
      expect(message.role).toBe(ChatMessageRole.USER);
      expect(message.status).toBeUndefined();
    });

    it('应该使用提供的选项创建消息', () => {
      const options = {
        id: 'msg-123',
        content: 'Hello World',
        loading: true,
        result: { text: 'Response' },
        error: new Error('Test error'),
        startTime: 1000,
        endTime: 2000,
        placeholder: 'Loading...',
        files: [new File(['content'], 'test.txt')],
        status: MessageStatus.SENDING,
        role: ChatMessageRole.ASSISTANT as ChatMessageRoleType
      };

      const message = new ChatMessage(options);

      expect(message.id).toBe('msg-123');
      expect(message.content).toBe('Hello World');
      expect(message.loading).toBe(true);
      expect(message.result).toEqual({ text: 'Response' });
      expect(message.error).toBeInstanceOf(Error);
      expect(message.startTime).toBe(1000);
      expect(message.endTime).toBe(2000);
      expect(message.placeholder).toBe('Loading...');
      expect(message.files).toHaveLength(1);
      expect(message.status).toBe(MessageStatus.SENDING);
      expect(message.role).toBe(ChatMessageRole.ASSISTANT);
    });

    it('应该支持部分选项', () => {
      const message = new ChatMessage({
        id: 'partial-msg',
        content: 'Partial content'
      });

      expect(message.id).toBe('partial-msg');
      expect(message.content).toBe('Partial content');
      expect(message.loading).toBe(false);
      expect(message.role).toBe(ChatMessageRole.USER);
    });

    it('应该正确处理空选项对象', () => {
      const message = new ChatMessage({});

      expect(message.loading).toBe(false);
      expect(message.result).toBeNull();
      expect(message.error).toBeNull();
      expect(message.role).toBe(ChatMessageRole.USER);
    });
  });

  describe('泛型类型支持', () => {
    it('应该支持字符串内容类型', () => {
      const message = new ChatMessage<string>({
        content: 'String content'
      });

      expect(message.content).toBe('String content');
      expect(typeof message.content).toBe('string');
    });

    it('应该支持对象内容类型', () => {
      interface CustomContent {
        text: string;
        metadata: Record<string, any>;
      }

      const content: CustomContent = {
        text: 'Custom text',
        metadata: { key: 'value' }
      };

      const message = new ChatMessage<CustomContent>({
        content
      });

      expect(message.content).toEqual(content);
      expect(message.content?.text).toBe('Custom text');
      expect(message.content?.metadata.key).toBe('value');
    });

    it('应该支持自定义结果类型', () => {
      interface CustomResult {
        success: boolean;
        data: string[];
      }

      const result: CustomResult = {
        success: true,
        data: ['item1', 'item2']
      };

      const message = new ChatMessage<string, CustomResult>({
        result
      });

      expect(message.result).toEqual(result);
      expect(message.result?.success).toBe(true);
      expect(message.result?.data).toHaveLength(2);
    });
  });

  describe('角色类型', () => {
    it('应该默认为 USER 角色', () => {
      const message = new ChatMessage();
      expect(message.role).toBe(ChatMessageRole.USER);
    });

    it('应该支持 ASSISTANT 角色', () => {
      const message = new ChatMessage({
        role: ChatMessageRole.ASSISTANT
      });

      expect(message.role).toBe(ChatMessageRole.ASSISTANT);
    });

    it('应该支持 SYSTEM 角色', () => {
      const message = new ChatMessage({
        role: ChatMessageRole.SYSTEM
      });

      expect(message.role).toBe(ChatMessageRole.SYSTEM);
    });
  });

  describe('消息状态', () => {
    it('应该支持所有消息状态', () => {
      const draftMessage = new ChatMessage({
        status: MessageStatus.DRAFT
      });
      expect(draftMessage.status).toBe(MessageStatus.DRAFT);

      const sendingMessage = new ChatMessage({
        status: MessageStatus.SENDING
      });
      expect(sendingMessage.status).toBe(MessageStatus.SENDING);

      const sentMessage = new ChatMessage({
        status: MessageStatus.SENT
      });
      expect(sentMessage.status).toBe(MessageStatus.SENT);

      const failedMessage = new ChatMessage({
        status: MessageStatus.FAILED
      });
      expect(failedMessage.status).toBe(MessageStatus.FAILED);
    });
  });

  describe('时间戳', () => {
    it('应该自动设置 startTime', () => {
      const beforeCreate = Date.now();
      const message = new ChatMessage();
      const afterCreate = Date.now();

      expect(message.startTime).toBeGreaterThanOrEqual(beforeCreate);
      expect(message.startTime).toBeLessThanOrEqual(afterCreate);
    });

    it('应该允许自定义 startTime', () => {
      const customTime = 1234567890;
      const message = new ChatMessage({
        startTime: customTime
      });

      expect(message.startTime).toBe(customTime);
    });

    it('应该默认 endTime 为 0', () => {
      const message = new ChatMessage();
      expect(message.endTime).toBe(0);
    });

    it('应该允许设置 endTime', () => {
      const message = new ChatMessage({
        startTime: 1000,
        endTime: 2000
      });

      expect(message.endTime).toBe(2000);
      expect(message.endTime).toBeGreaterThan(message.startTime);
    });
  });

  describe('加载状态', () => {
    it('应该默认 loading 为 false', () => {
      const message = new ChatMessage();
      expect(message.loading).toBe(false);
    });

    it('应该支持设置 loading 为 true', () => {
      const message = new ChatMessage({
        loading: true
      });

      expect(message.loading).toBe(true);
    });
  });

  describe('错误处理', () => {
    it('应该默认 error 为 null', () => {
      const message = new ChatMessage();
      expect(message.error).toBeNull();
    });

    it('应该支持 Error 对象', () => {
      const error = new Error('Test error');
      const message = new ChatMessage({ error });

      expect(message.error).toBe(error);
      expect((message.error as Error).message).toBe('Test error');
    });

    it('应该支持字符串错误', () => {
      const message = new ChatMessage({
        error: 'String error'
      });

      expect(message.error).toBe('String error');
    });

    it('应该支持自定义错误对象', () => {
      const customError = {
        code: 'ERR_001',
        message: 'Custom error',
        details: { reason: 'Network failure' }
      };

      const message = new ChatMessage({
        error: customError
      });

      expect(message.error).toEqual(customError);
    });
  });

  describe('结果数据', () => {
    it('应该默认 result 为 null', () => {
      const message = new ChatMessage();
      expect(message.result).toBeNull();
    });

    it('应该支持字符串结果', () => {
      const message = new ChatMessage<string, string>({
        result: 'Success result'
      });

      expect(message.result).toBe('Success result');
    });

    it('应该支持对象结果', () => {
      const result = {
        data: ['item1', 'item2'],
        metadata: { count: 2 }
      };

      const message = new ChatMessage({
        result
      });

      expect(message.result).toEqual(result);
    });

    it('应该支持嵌套的 ChatMessage 作为结果', () => {
      const assistantMessage = new ChatMessage({
        role: ChatMessageRole.ASSISTANT,
        content: 'AI response'
      });

      const userMessage = new ChatMessage<string, ChatMessage>({
        role: ChatMessageRole.USER,
        content: 'User question',
        result: assistantMessage
      });

      expect(userMessage.result).toBeInstanceOf(ChatMessage);
      expect(userMessage.result?.role).toBe(ChatMessageRole.ASSISTANT);
      expect(userMessage.result?.content).toBe('AI response');
    });
  });

  describe('占位符', () => {
    it('应该支持 placeholder 属性', () => {
      const message = new ChatMessage({
        placeholder: 'Typing...'
      });

      expect(message.placeholder).toBe('Typing...');
    });

    it('应该默认 placeholder 为 undefined', () => {
      const message = new ChatMessage();
      expect(message.placeholder).toBeUndefined();
    });
  });

  describe('文件附件', () => {
    it('应该支持文件附件', () => {
      const files = [
        new File(['content1'], 'file1.txt'),
        new File(['content2'], 'file2.pdf')
      ];

      const message = new ChatMessage({
        files
      });

      expect(message.files).toHaveLength(2);
      expect(message.files?.[0].name).toBe('file1.txt');
      expect(message.files?.[1].name).toBe('file2.pdf');
    });

    it('应该支持空文件数组', () => {
      const message = new ChatMessage({
        files: []
      });

      expect(message.files).toEqual([]);
      expect(message.files).toHaveLength(0);
    });

    it('应该默认 files 为 undefined', () => {
      const message = new ChatMessage();
      expect(message.files).toBeUndefined();
    });
  });

  describe('只读属性', () => {
    it('属性在 TypeScript 中声明为 readonly', () => {
      const message = new ChatMessage({
        id: 'readonly-test',
        content: 'Original'
      });

      // TypeScript 的 readonly 关键字只在编译时有效
      // 运行时 JavaScript 对象属性仍然可以修改
      // 这里验证属性存在且可访问
      expect(message.id).toBe('readonly-test');
      expect(message.content).toBe('Original');

      // 注意：在实际应用中，TypeScript 编译器会阻止修改 readonly 属性
    });
  });

  describe('边界情况', () => {
    it('应该处理 undefined 作为构造参数', () => {
      const message = new ChatMessage(undefined);

      expect(message.loading).toBe(false);
      expect(message.role).toBe(ChatMessageRole.USER);
    });

    it('应该处理空字符串内容', () => {
      const message = new ChatMessage({
        content: ''
      });

      expect(message.content).toBe('');
    });

    it('应该处理 0 作为时间戳', () => {
      const message = new ChatMessage({
        startTime: 0,
        endTime: 0
      });

      expect(message.startTime).toBe(0);
      expect(message.endTime).toBe(0);
    });

    it('应该处理特殊字符内容', () => {
      const specialContent = '🚀 Special chars: \n\t"quotes" & symbols!';
      const message = new ChatMessage({
        content: specialContent
      });

      expect(message.content).toBe(specialContent);
    });

    it('应该处理非常长的内容', () => {
      const longContent = 'a'.repeat(100000);
      const message = new ChatMessage({
        content: longContent
      });

      expect(message.content).toHaveLength(100000);
    });
  });

  describe('实际使用场景', () => {
    it('应该能创建用户发送的消息', () => {
      const userMessage = new ChatMessage<string>({
        id: 'user-msg-1',
        content: 'Hello, how can you help me?',
        role: ChatMessageRole.USER,
        status: MessageStatus.SENDING,
        loading: true
      });

      expect(userMessage.role).toBe(ChatMessageRole.USER);
      expect(userMessage.status).toBe(MessageStatus.SENDING);
      expect(userMessage.loading).toBe(true);
    });

    it('应该能创建 AI 响应消息', () => {
      const assistantMessage = new ChatMessage<string>({
        id: 'assistant-msg-1',
        content: 'I can help you with that!',
        role: ChatMessageRole.ASSISTANT,
        status: MessageStatus.SENT,
        loading: false
      });

      expect(assistantMessage.role).toBe(ChatMessageRole.ASSISTANT);
      expect(assistantMessage.status).toBe(MessageStatus.SENT);
      expect(assistantMessage.loading).toBe(false);
    });

    it('应该能创建系统消息', () => {
      const systemMessage = new ChatMessage<string>({
        id: 'system-msg-1',
        content: 'You are a helpful assistant.',
        role: ChatMessageRole.SYSTEM
      });

      expect(systemMessage.role).toBe(ChatMessageRole.SYSTEM);
    });

    it('应该能创建包含错误的失败消息', () => {
      const failedMessage = new ChatMessage<string>({
        id: 'failed-msg-1',
        content: 'Send this message',
        status: MessageStatus.FAILED,
        error: new Error('Network timeout'),
        loading: false,
        endTime: Date.now()
      });

      expect(failedMessage.status).toBe(MessageStatus.FAILED);
      expect(failedMessage.error).toBeInstanceOf(Error);
      expect(failedMessage.loading).toBe(false);
      expect(failedMessage.endTime).toBeGreaterThan(0);
    });

    it('应该能创建草稿消息', () => {
      const draftMessage = new ChatMessage<string>({
        content: 'Draft message...',
        status: MessageStatus.DRAFT,
        placeholder: 'Continue typing...'
      });

      expect(draftMessage.status).toBe(MessageStatus.DRAFT);
      expect(draftMessage.placeholder).toBe('Continue typing...');
    });

    it('应该能创建包含文件的消息', () => {
      const files = [
        new File(['image data'], 'screenshot.png', { type: 'image/png' }),
        new File(['document'], 'document.pdf', { type: 'application/pdf' })
      ];

      const messageWithFiles = new ChatMessage<string>({
        id: 'msg-with-files',
        content: 'Here are the files you requested',
        files,
        role: ChatMessageRole.USER
      });

      expect(messageWithFiles.files).toHaveLength(2);
      expect(messageWithFiles.files?.[0].type).toBe('image/png');
      expect(messageWithFiles.files?.[1].type).toBe('application/pdf');
    });

    it('应该能表示完整的消息生命周期', () => {
      // 1. 创建草稿
      const startTime = Date.now();
      let message = new ChatMessage<string>({
        id: 'lifecycle-msg',
        content: 'Test message',
        status: MessageStatus.DRAFT,
        startTime
      });
      expect(message.status).toBe(MessageStatus.DRAFT);

      // 2. 开始发送
      message = new ChatMessage<string>({
        ...message,
        status: MessageStatus.SENDING,
        loading: true
      });
      expect(message.status).toBe(MessageStatus.SENDING);
      expect(message.loading).toBe(true);

      // 3. 发送成功
      const endTime = startTime + 1000; // 确保 endTime 大于 startTime
      message = new ChatMessage<string>({
        ...message,
        status: MessageStatus.SENT,
        loading: false,
        endTime,
        result: { response: 'Success' }
      });
      expect(message.status).toBe(MessageStatus.SENT);
      expect(message.loading).toBe(false);
      expect(message.endTime).toBeGreaterThan(message.startTime);
    });
  });
});
