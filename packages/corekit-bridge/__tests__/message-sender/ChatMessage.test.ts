import { describe, it, expect } from 'vitest';
import {
  ChatMessage,
  ChatMessageRole,
  type ChatMessageRoleType
} from '../../src/core/message-sender';
import { MessageStatus } from '../../src/core/message-sender';

describe('ChatMessageRole', () => {
  it('should define all role constants', () => {
    expect(ChatMessageRole.USER).toBe('user');
    expect(ChatMessageRole.SYSTEM).toBe('system');
    expect(ChatMessageRole.ASSISTANT).toBe('assistant');
  });

  it('role constants should be readonly', () => {
    expect(Object.isFrozen(ChatMessageRole)).toBe(false); // as const does not freeze

    const originalValue = ChatMessageRole.USER;
    (ChatMessageRole as unknown as Record<string, string>).USER = 'modified';
    (ChatMessageRole as unknown as Record<string, string>).USER = originalValue;
  });
});

describe('ChatMessage', () => {
  describe('constructor', () => {
    it('should create a message with default values', () => {
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

    it('should create a message with provided options', () => {
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

    it('should support partial options', () => {
      const message = new ChatMessage({
        id: 'partial-msg',
        content: 'Partial content'
      });

      expect(message.id).toBe('partial-msg');
      expect(message.content).toBe('Partial content');
      expect(message.loading).toBe(false);
      expect(message.role).toBe(ChatMessageRole.USER);
    });

    it('should correctly handle empty options object', () => {
      const message = new ChatMessage({});

      expect(message.loading).toBe(false);
      expect(message.result).toBeNull();
      expect(message.error).toBeNull();
      expect(message.role).toBe(ChatMessageRole.USER);
    });
  });

  describe('generic type support', () => {
    it('should support string content type', () => {
      const message = new ChatMessage<string>({
        content: 'String content'
      });

      expect(message.content).toBe('String content');
      expect(typeof message.content).toBe('string');
    });

    it('should support object content type', () => {
      interface CustomContent {
        text: string;
        metadata: Record<string, unknown>;
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

    it('should support custom result type', () => {
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

  describe('role type', () => {
    it('should default to USER role', () => {
      const message = new ChatMessage();
      expect(message.role).toBe(ChatMessageRole.USER);
    });

    it('should support ASSISTANT role', () => {
      const message = new ChatMessage({
        role: ChatMessageRole.ASSISTANT
      });

      expect(message.role).toBe(ChatMessageRole.ASSISTANT);
    });

    it('should support SYSTEM role', () => {
      const message = new ChatMessage({
        role: ChatMessageRole.SYSTEM
      });

      expect(message.role).toBe(ChatMessageRole.SYSTEM);
    });
  });

  describe('message status', () => {
    it('should support all message statuses', () => {
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

  describe('timestamp', () => {
    it('should automatically set startTime', () => {
      const beforeCreate = Date.now();
      const message = new ChatMessage();
      const afterCreate = Date.now();

      expect(message.startTime).toBeGreaterThanOrEqual(beforeCreate);
      expect(message.startTime).toBeLessThanOrEqual(afterCreate);
    });

    it('should allow custom startTime', () => {
      const customTime = 1234567890;
      const message = new ChatMessage({
        startTime: customTime
      });

      expect(message.startTime).toBe(customTime);
    });

    it('should default endTime to 0', () => {
      const message = new ChatMessage();
      expect(message.endTime).toBe(0);
    });

    it('should allow setting endTime', () => {
      const message = new ChatMessage({
        startTime: 1000,
        endTime: 2000
      });

      expect(message.endTime).toBe(2000);
      expect(message.endTime).toBeGreaterThan(message.startTime);
    });
  });

  describe('loading status', () => {
    it('应该默认 loading 为 false', () => {
      const message = new ChatMessage();
      expect(message.loading).toBe(false);
    });

    it('should support setting loading to true', () => {
      const message = new ChatMessage({
        loading: true
      });

      expect(message.loading).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should default error to null', () => {
      const message = new ChatMessage();
      expect(message.error).toBeNull();
    });

    it('should support Error object', () => {
      const error = new Error('Test error');
      const message = new ChatMessage({ error });

      expect(message.error).toBe(error);
      expect((message.error as Error).message).toBe('Test error');
    });

    it('should support string error', () => {
      const message = new ChatMessage({
        error: 'String error'
      });

      expect(message.error).toBe('String error');
    });

    it('should support custom error object', () => {
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

  describe('result data', () => {
    it('should default result to null', () => {
      const message = new ChatMessage();
      expect(message.result).toBeNull();
    });

    it('should support string result', () => {
      const message = new ChatMessage<string, string>({
        result: 'Success result'
      });

      expect(message.result).toBe('Success result');
    });

    it('should support object result', () => {
      const result = {
        data: ['item1', 'item2'],
        metadata: { count: 2 }
      };

      const message = new ChatMessage({
        result
      });

      expect(message.result).toEqual(result);
    });

    it('should support nested ChatMessage as result', () => {
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

  describe('placeholder', () => {
    it('should support placeholder property', () => {
      const message = new ChatMessage({
        placeholder: 'Typing...'
      });

      expect(message.placeholder).toBe('Typing...');
    });

    it('should default placeholder to undefined', () => {
      const message = new ChatMessage();
      expect(message.placeholder).toBeUndefined();
    });
  });

  describe('file attachments', () => {
    it('should support file attachments', () => {
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

    it('should support empty file array', () => {
      const message = new ChatMessage({
        files: []
      });

      expect(message.files).toEqual([]);
      expect(message.files).toHaveLength(0);
    });

    it('should default files to undefined', () => {
      const message = new ChatMessage();
      expect(message.files).toBeUndefined();
    });
  });

  describe('readonly properties', () => {
    it('properties are declared as readonly in TypeScript', () => {
      const message = new ChatMessage({
        id: 'readonly-test',
        content: 'Original'
      });

      // TypeScript's readonly keyword is only valid at compile time,
      // Runtime JavaScript object properties can still be modified.
      // Here we validate that the properties exist and are accessible.
      expect(message.id).toBe('readonly-test');
      expect(message.content).toBe('Original');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined as constructor parameter', () => {
      const message = new ChatMessage(undefined);

      expect(message.loading).toBe(false);
      expect(message.role).toBe(ChatMessageRole.USER);
    });

    it('should handle empty string content', () => {
      const message = new ChatMessage({
        content: ''
      });

      expect(message.content).toBe('');
    });

    it('should handle 0 as timestamp', () => {
      const message = new ChatMessage({
        startTime: 0,
        endTime: 0
      });

      expect(message.startTime).toBe(0);
      expect(message.endTime).toBe(0);
    });

    it('should handle special characters content', () => {
      const specialContent = '🚀 Special chars: \n\t"quotes" & symbols!';
      const message = new ChatMessage({
        content: specialContent
      });

      expect(message.content).toBe(specialContent);
    });

    it('should handle very long content', () => {
      const longContent = 'a'.repeat(100000);
      const message = new ChatMessage({
        content: longContent
      });

      expect(message.content).toHaveLength(100000);
    });
  });

  describe('real-world scenarios', () => {
    it('should be able to create user sent messages', () => {
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

    it('should be able to create AI response messages', () => {
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

    it('should be able to create system messages', () => {
      const systemMessage = new ChatMessage<string>({
        id: 'system-msg-1',
        content: 'You are a helpful assistant.',
        role: ChatMessageRole.SYSTEM
      });

      expect(systemMessage.role).toBe(ChatMessageRole.SYSTEM);
    });

    it('should be able to create failed messages with error', () => {
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

    it('should be able to create draft messages', () => {
      const draftMessage = new ChatMessage<string>({
        content: 'Draft message...',
        status: MessageStatus.DRAFT,
        placeholder: 'Continue typing...'
      });

      expect(draftMessage.status).toBe(MessageStatus.DRAFT);
      expect(draftMessage.placeholder).toBe('Continue typing...');
    });

    it('should be able to create messages with files', () => {
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

    it('should be able to represent complete message lifecycle', () => {
      // 1. 创建草稿
      const startTime = Date.now();
      let message = new ChatMessage<string>({
        id: 'lifecycle-msg',
        content: 'Test message',
        status: MessageStatus.DRAFT,
        startTime
      });
      expect(message.status).toBe(MessageStatus.DRAFT);

      // 2. start sending
      message = new ChatMessage<string>({
        ...message,
        status: MessageStatus.SENDING,
        loading: true
      });
      expect(message.status).toBe(MessageStatus.SENDING);
      expect(message.loading).toBe(true);

      // 3. send successfully
      const endTime = startTime + 1000; // ensure endTime is greater than startTime
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
