import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ChatMessage,
  ChatMessageRole
} from '@/base/focusBar/chatMessage/ChatMessage';
import { ChatMessageStore } from '@/base/focusBar/chatMessage/ChatMessageStore';
import { ChatSenderStrategy } from '@/base/focusBar/chatMessage/ChatSenderStrategy';
import type { MessageSenderContext } from '@/base/focusBar/impl/MessageSenderExecutor';
import { MessageStatus } from '@/base/focusBar/impl/MessagesStore';
import { SendFailureStrategy } from '@/base/focusBar/impl/SenderStrategyPlugin';
import type { MessageGetwayInterface } from '@/base/focusBar/interface/MessageGetwayInterface';

describe('ChatSenderStrategy', () => {
  let strategy: ChatSenderStrategy;
  let store: ChatMessageStore<string>;
  let mockGateway: MessageGetwayInterface;

  beforeEach(() => {
    strategy = new ChatSenderStrategy(SendFailureStrategy.KEEP_FAILED);
    store = new ChatMessageStore<string>();
    mockGateway = {
      sendMessage: vi.fn().mockResolvedValue({ result: 'Success' })
    };
  });

  describe('构造函数和基本属性', () => {
    it('应该正确初始化', () => {
      expect(strategy).toBeInstanceOf(ChatSenderStrategy);
      expect(strategy.pluginName).toBe('SenderStrategyPlugin');
    });
  });

  describe('isAssistantMessage', () => {
    it('应该识别 ASSISTANT 角色的消息', () => {
      const assistantMessage = new ChatMessage<string>({
        role: ChatMessageRole.ASSISTANT,
        content: 'AI response'
      });

      const result = strategy.isAssistantMessage(store, assistantMessage);

      expect(result).toBe(true);
    });

    it('应该拒绝 USER 角色的消息', () => {
      const userMessage = new ChatMessage<string>({
        role: ChatMessageRole.USER,
        content: 'User question'
      });

      const result = strategy.isAssistantMessage(store, userMessage);

      expect(result).toBe(false);
    });

    it('应该拒绝 SYSTEM 角色的消息', () => {
      const systemMessage = new ChatMessage<string>({
        role: ChatMessageRole.SYSTEM,
        content: 'System prompt'
      });

      const result = strategy.isAssistantMessage(store, systemMessage);

      expect(result).toBe(false);
    });

    it('应该拒绝非 ChatMessage 对象', () => {
      const invalidMessage = { role: ChatMessageRole.ASSISTANT } as any;

      const result = strategy.isAssistantMessage(store, invalidMessage);

      expect(result).toBe(false);
    });
  });

  describe('sliceMessages', () => {
    beforeEach(() => {
      store.addMessage({ id: 'msg-1', content: 'Message 1' });
      store.addMessage({ id: 'msg-2', content: 'Message 2' });
      store.addMessage({ id: 'msg-3', content: 'Message 3' });
      store.addMessage({ id: 'msg-4', content: 'Message 4' });
      store.addMessage({ id: 'msg-5', content: 'Message 5' });
    });

    it('应该删除指定索引后面的所有消息', () => {
      strategy.sliceMessages(store, 2);

      const messages = store.getMessages();
      expect(messages).toHaveLength(4); // 保留索引 0,1,2,3
      expect(messages[0].id).toBe('msg-1');
      expect(messages[1].id).toBe('msg-2');
      expect(messages[2].id).toBe('msg-3');
      expect(messages[3].id).toBe('msg-4');
    });

    it('应该在索引为 0 时保留前两条消息', () => {
      strategy.sliceMessages(store, 0);

      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0].id).toBe('msg-1');
      expect(messages[1].id).toBe('msg-2');
    });

    it('应该在索引为最后一个时保留所有消息', () => {
      strategy.sliceMessages(store, 4);

      const messages = store.getMessages();
      expect(messages).toHaveLength(5);
    });

    it('应该处理空消息列表', () => {
      const emptyStore = new ChatMessageStore<string>();
      strategy.sliceMessages(emptyStore, 0);

      expect(emptyStore.getMessages()).toHaveLength(0);
    });

    it('应该正确删除消息', () => {
      const initialCount = store.getMessages().length;

      strategy.sliceMessages(store, 1);

      // 应该保留索引 0,1,2（前3条消息）
      expect(store.getMessages().length).toBeLessThan(initialCount);
    });
  });

  describe('handleBefore_KEEP_FAILED', () => {
    it('应该处理新消息（不在列表中）', () => {
      const currentMessage = new ChatMessage<string>({
        id: 'new-msg',
        content: 'New message'
      });

      const parameters: MessageSenderContext<ChatMessage<string>> = {
        currentMessage,
        store,
        gateway: mockGateway
      } as any;

      const result = strategy['handleBefore_KEEP_FAILED'](parameters);

      expect(result).toBeInstanceOf(ChatMessage);
      expect(result.content).toBe('New message');
    });

    it('应该处理重试消息并清除后续消息', () => {
      // 添加消息历史
      store.addMessage({ id: 'user-msg', content: 'Question' });
      store.addMessage({
        id: 'assistant-msg',
        content: 'Answer',
        role: ChatMessageRole.ASSISTANT
      });
      store.addMessage({ id: 'user-msg-2', content: 'Follow up' });

      const retryMessage = new ChatMessage<string>({
        id: 'user-msg',
        content: 'Question'
      });

      const parameters: MessageSenderContext<ChatMessage<string>> = {
        currentMessage: retryMessage,
        store,
        gateway: mockGateway
      } as any;

      strategy['handleBefore_KEEP_FAILED'](parameters);

      // 应该删除 user-msg 后面的所有消息
      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe('user-msg');
    });

    it('应该在重试时删除包括 assistant 响应在内的后续消息', () => {
      store.addMessage({ id: 'msg-1', content: 'Message 1' });
      store.addMessage({ id: 'msg-2', content: 'Message 2' });
      store.addMessage({
        id: 'assistant-1',
        content: 'Assistant 1',
        role: ChatMessageRole.ASSISTANT
      });
      store.addMessage({ id: 'msg-3', content: 'Message 3' });

      const retryMessage = new ChatMessage<string>({
        id: 'msg-2',
        content: 'Message 2'
      });

      const parameters: MessageSenderContext<ChatMessage<string>> = {
        currentMessage: retryMessage,
        store,
        gateway: mockGateway
      } as any;

      strategy['handleBefore_KEEP_FAILED'](parameters);

      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages.find((m) => m.id === 'assistant-1')).toBeUndefined();
      expect(messages.find((m) => m.id === 'msg-3')).toBeUndefined();
    });

    it('应该处理消息没有 ID 的情况', () => {
      const messageWithoutId = new ChatMessage<string>({
        content: 'No ID message'
      });

      const parameters: MessageSenderContext<ChatMessage<string>> = {
        currentMessage: messageWithoutId,
        store,
        gateway: mockGateway
      } as any;

      const result = strategy['handleBefore_KEEP_FAILED'](parameters);

      expect(result).toBeInstanceOf(ChatMessage);
    });

    it('应该处理消息在列表末尾的情况', () => {
      store.addMessage({ id: 'msg-1', content: 'Message 1' });
      store.addMessage({ id: 'msg-2', content: 'Message 2' });
      store.addMessage({ id: 'last-msg', content: 'Last message' });

      const retryMessage = new ChatMessage<string>({
        id: 'last-msg',
        content: 'Last message'
      });

      const parameters: MessageSenderContext<ChatMessage<string>> = {
        currentMessage: retryMessage,
        store,
        gateway: mockGateway
      } as any;

      strategy['handleBefore_KEEP_FAILED'](parameters);

      // 应该保留所有消息（因为后面没有消息）
      expect(store.getMessages()).toHaveLength(3);
    });
  });

  describe('handleSuccess_KEEP_FAILED', () => {
    beforeEach(() => {
      store.addMessage({ id: 'user-msg', content: 'User question' });
    });

    it('应该在成功后添加 assistant 响应消息', () => {
      const successData = new ChatMessage<string>({
        id: 'user-msg',
        content: 'User question',
        status: MessageStatus.SENT,
        result: new ChatMessage<string>({
          id: 'assistant-msg',
          content: 'AI response',
          role: ChatMessageRole.ASSISTANT
        })
      });

      const parameters: MessageSenderContext<ChatMessage<string>> = {
        currentMessage: successData,
        store,
        gateway: mockGateway
      } as any;

      strategy['handleSuccess_KEEP_FAILED'](parameters, successData);

      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[1].role).toBe(ChatMessageRole.ASSISTANT);
      expect(messages[1].content).toBe('AI response');
    });

    it('应该替换现有的 assistant 消息', () => {
      store.addMessage({
        id: 'old-assistant',
        content: 'Old response',
        role: ChatMessageRole.ASSISTANT
      });

      const successData = new ChatMessage<string>({
        id: 'user-msg',
        content: 'User question',
        status: MessageStatus.SENT,
        result: new ChatMessage<string>({
          id: 'new-assistant',
          content: 'New response',
          role: ChatMessageRole.ASSISTANT
        })
      });

      const parameters: MessageSenderContext<ChatMessage<string>> = {
        currentMessage: successData,
        store,
        gateway: mockGateway
      } as any;

      strategy['handleSuccess_KEEP_FAILED'](parameters, successData);

      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[1].id).toBe('new-assistant');
      expect(messages[1].content).toBe('New response');
      expect(messages.find((m) => m.id === 'old-assistant')).toBeUndefined();
    });

    it('应该在替换 assistant 消息后删除后续消息', () => {
      store.addMessage({
        id: 'old-assistant',
        content: 'Old response',
        role: ChatMessageRole.ASSISTANT
      });
      store.addMessage({
        id: 'extra-msg',
        content: 'Extra message'
      });

      const successData = new ChatMessage<string>({
        id: 'user-msg',
        content: 'User question',
        status: MessageStatus.SENT,
        result: new ChatMessage<string>({
          id: 'new-assistant',
          content: 'New response',
          role: ChatMessageRole.ASSISTANT
        })
      });

      const parameters: MessageSenderContext<ChatMessage<string>> = {
        currentMessage: successData,
        store,
        gateway: mockGateway
      } as any;

      strategy['handleSuccess_KEEP_FAILED'](parameters, successData);

      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages.find((m) => m.id === 'extra-msg')).toBeUndefined();
    });

    it('应该处理后续消息不是 assistant 的情况', () => {
      store.addMessage({
        id: 'next-user-msg',
        content: 'Next user message',
        role: ChatMessageRole.USER
      });

      const successData = new ChatMessage<string>({
        id: 'user-msg',
        content: 'User question',
        status: MessageStatus.SENT,
        result: new ChatMessage<string>({
          id: 'assistant-msg',
          content: 'AI response',
          role: ChatMessageRole.ASSISTANT
        })
      });

      const parameters: MessageSenderContext<ChatMessage<string>> = {
        currentMessage: successData,
        store,
        gateway: mockGateway
      } as any;

      strategy['handleSuccess_KEEP_FAILED'](parameters, successData);

      // 不应该修改现有的用户消息
      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0].id).toBe('user-msg');
      expect(messages[1].id).toBe('next-user-msg');
    });

    it('应该处理 result 不是 assistant 消息的情况', () => {
      const successData = new ChatMessage<string>({
        id: 'user-msg',
        content: 'User question',
        status: MessageStatus.SENT,
        result: new ChatMessage<string>({
          id: 'user-result',
          content: 'User result',
          role: ChatMessageRole.USER
        })
      });

      const parameters: MessageSenderContext<ChatMessage<string>> = {
        currentMessage: successData,
        store,
        gateway: mockGateway
      } as any;

      const messageCountBefore = store.getMessages().length;
      strategy['handleSuccess_KEEP_FAILED'](parameters, successData);

      // 不应该添加非 assistant 消息
      expect(store.getMessages().length).toBe(messageCountBefore);
    });

    it('应该处理 result 为 null 的情况', () => {
      const successData = new ChatMessage<string>({
        id: 'user-msg',
        content: 'User question',
        status: MessageStatus.SENT,
        result: null
      });

      const parameters: MessageSenderContext<ChatMessage<string>> = {
        currentMessage: successData,
        store,
        gateway: mockGateway
      } as any;

      const messageCountBefore = store.getMessages().length;
      strategy['handleSuccess_KEEP_FAILED'](parameters, successData);

      expect(store.getMessages().length).toBe(messageCountBefore);
    });

    it('应该处理消息不在列表中的情况', () => {
      const successData = new ChatMessage<string>({
        id: 'non-existent-msg',
        content: 'Non-existent',
        status: MessageStatus.SENT,
        result: new ChatMessage<string>({
          id: 'assistant-msg',
          content: 'AI response',
          role: ChatMessageRole.ASSISTANT
        })
      });

      const parameters: MessageSenderContext<ChatMessage<string>> = {
        currentMessage: successData,
        store,
        gateway: mockGateway
      } as any;

      const messageCountBefore = store.getMessages().length;
      strategy['handleSuccess_KEEP_FAILED'](parameters, successData);

      // 消息不在列表中，不应该添加
      expect(store.getMessages().length).toBe(messageCountBefore);
    });
  });

  describe('集成测试', () => {
    it('应该完整处理消息发送流程', () => {
      // 1. 添加用户消息
      const userMessage = new ChatMessage<string>({
        id: 'user-1',
        content: 'Hello AI'
      });
      store.addMessage(userMessage);

      // 2. Before 处理
      const beforeParams: MessageSenderContext<ChatMessage<string>> = {
        currentMessage: userMessage,
        store,
        gateway: mockGateway
      } as any;

      strategy['handleBefore_KEEP_FAILED'](beforeParams);

      // 3. Success 处理
      const successData = new ChatMessage<string>({
        ...userMessage,
        status: MessageStatus.SENT,
        result: new ChatMessage<string>({
          id: 'assistant-1',
          content: 'Hello! How can I help?',
          role: ChatMessageRole.ASSISTANT
        })
      });

      strategy['handleSuccess_KEEP_FAILED'](beforeParams, successData);

      // 验证结果
      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0].id).toBe('user-1');
      expect(messages[1].id).toBe('assistant-1');
      expect(messages[1].role).toBe(ChatMessageRole.ASSISTANT);
    });

    it('应该处理重试失败消息的流程', () => {
      // 1. 初始对话
      store.addMessage({
        id: 'user-1',
        content: 'First question',
        status: MessageStatus.SENT
      });
      store.addMessage({
        id: 'assistant-1',
        content: 'First answer',
        role: ChatMessageRole.ASSISTANT,
        status: MessageStatus.SENT
      });
      store.addMessage({
        id: 'user-2',
        content: 'Second question',
        status: MessageStatus.FAILED,
        error: new Error('Network error')
      });

      expect(store.getMessages()).toHaveLength(3);

      // 2. 重试失败的消息
      const retryMessage = new ChatMessage<string>({
        id: 'user-2',
        content: 'Second question'
      });

      const beforeParams: MessageSenderContext<ChatMessage<string>> = {
        currentMessage: retryMessage,
        store,
        gateway: mockGateway
      } as any;

      strategy['handleBefore_KEEP_FAILED'](beforeParams);

      // 应该保留前两条消息和重试消息
      expect(store.getMessages()).toHaveLength(3);

      // 3. 重试成功
      const successData = new ChatMessage<string>({
        id: 'user-2',
        content: 'Second question',
        status: MessageStatus.SENT,
        result: new ChatMessage<string>({
          id: 'assistant-2',
          content: 'Second answer',
          role: ChatMessageRole.ASSISTANT
        })
      });

      strategy['handleSuccess_KEEP_FAILED'](beforeParams, successData);

      // 验证最终结果
      const messages = store.getMessages();
      expect(messages).toHaveLength(4);
      expect(messages[2].id).toBe('user-2');
      expect(messages[3].id).toBe('assistant-2');
      expect(messages[3].role).toBe(ChatMessageRole.ASSISTANT);
    });

    it('应该处理多轮对话', () => {
      const conversations = [
        { user: 'Hello', assistant: 'Hi there!' },
        { user: 'How are you?', assistant: 'I am doing well, thanks!' },
        { user: 'What can you do?', assistant: 'I can help with many tasks!' }
      ];

      conversations.forEach((conv, index) => {
        // 添加用户消息
        const userId = `user-${index + 1}`;
        store.addMessage({
          id: userId,
          content: conv.user
        });

        // 模拟成功响应
        const successData = new ChatMessage<string>({
          id: userId,
          content: conv.user,
          status: MessageStatus.SENT,
          result: new ChatMessage<string>({
            id: `assistant-${index + 1}`,
            content: conv.assistant,
            role: ChatMessageRole.ASSISTANT
          })
        });

        const params: MessageSenderContext<ChatMessage<string>> = {
          currentMessage: successData,
          store,
          gateway: mockGateway
        } as any;

        strategy['handleSuccess_KEEP_FAILED'](params, successData);
      });

      // 验证对话历史
      const messages = store.getMessages();
      expect(messages).toHaveLength(6); // 3轮对话 = 6条消息

      // 验证角色交替
      for (let i = 0; i < messages.length; i++) {
        if (i % 2 === 0) {
          expect(messages[i].role).toBe(ChatMessageRole.USER);
        } else {
          expect(messages[i].role).toBe(ChatMessageRole.ASSISTANT);
        }
      }
    });

    it('应该处理编辑中间消息并重新生成后续对话', () => {
      // 初始对话
      store.addMessage({ id: 'user-1', content: 'Question 1' });
      store.addMessage({
        id: 'assistant-1',
        content: 'Answer 1',
        role: ChatMessageRole.ASSISTANT
      });
      store.addMessage({ id: 'user-2', content: 'Question 2' });
      store.addMessage({
        id: 'assistant-2',
        content: 'Answer 2',
        role: ChatMessageRole.ASSISTANT
      });

      expect(store.getMessages()).toHaveLength(4);

      // 编辑第一个用户消息并重新发送
      const editedMessage = new ChatMessage<string>({
        id: 'user-1',
        content: 'Edited question 1'
      });

      const beforeParams: MessageSenderContext<ChatMessage<string>> = {
        currentMessage: editedMessage,
        store,
        gateway: mockGateway
      } as any;

      strategy['handleBefore_KEEP_FAILED'](beforeParams);

      // 应该删除第一个消息后的所有消息
      expect(store.getMessages()).toHaveLength(1);

      // 重新生成响应
      const successData = new ChatMessage<string>({
        id: 'user-1',
        content: 'Edited question 1',
        status: MessageStatus.SENT,
        result: new ChatMessage<string>({
          id: 'assistant-1-new',
          content: 'New answer 1',
          role: ChatMessageRole.ASSISTANT
        })
      });

      strategy['handleSuccess_KEEP_FAILED'](beforeParams, successData);

      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('Edited question 1');
      expect(messages[1].content).toBe('New answer 1');
    });
  });

  describe('边界情况', () => {
    it('应该处理空消息列表', () => {
      const emptyStore = new ChatMessageStore<string>();

      const message = new ChatMessage<string>({
        id: 'msg-1',
        content: 'First message'
      });

      const params: MessageSenderContext<ChatMessage<string>> = {
        currentMessage: message,
        store: emptyStore,
        gateway: mockGateway
      } as any;

      expect(() => {
        strategy['handleBefore_KEEP_FAILED'](params);
      }).not.toThrow();
    });

    it('应该处理消息没有 ID 的情况', () => {
      const messageWithoutId = new ChatMessage<string>({
        content: 'No ID'
      });

      const params: MessageSenderContext<ChatMessage<string>> = {
        currentMessage: messageWithoutId,
        store,
        gateway: mockGateway
      } as any;

      expect(() => {
        strategy['handleBefore_KEEP_FAILED'](params);
      }).not.toThrow();
    });

    it('应该处理空内容的消息', () => {
      const emptyMessage = new ChatMessage<string>({
        id: 'empty-msg',
        content: ''
      });

      store.addMessage(emptyMessage);

      const params: MessageSenderContext<ChatMessage<string>> = {
        currentMessage: emptyMessage,
        store,
        gateway: mockGateway
      } as any;

      expect(() => {
        strategy['handleBefore_KEEP_FAILED'](params);
      }).not.toThrow();
    });

    it('应该处理特殊字符内容', () => {
      const specialMessage = new ChatMessage<string>({
        id: 'special-msg',
        content: '🚀 Test\n\t"quotes" & symbols!'
      });

      store.addMessage(specialMessage);

      const params: MessageSenderContext<ChatMessage<string>> = {
        currentMessage: specialMessage,
        store,
        gateway: mockGateway
      } as any;

      strategy['handleBefore_KEEP_FAILED'](params);

      expect(store.getMessages()).toHaveLength(1);
      expect(store.getMessages()[0].content).toBe(
        '🚀 Test\n\t"quotes" & symbols!'
      );
    });

    it('应该处理非常长的消息列表', () => {
      // 添加大量消息
      for (let i = 0; i < 1000; i++) {
        store.addMessage({
          id: `msg-${i}`,
          content: `Message ${i}`
        });
      }

      expect(store.getMessages()).toHaveLength(1000);

      // 在中间位置重试
      const retryMessage = new ChatMessage<string>({
        id: 'msg-500',
        content: 'Message 500'
      });

      const params: MessageSenderContext<ChatMessage<string>> = {
        currentMessage: retryMessage,
        store,
        gateway: mockGateway
      } as any;

      strategy['handleBefore_KEEP_FAILED'](params);

      // 应该保留前501条消息
      expect(store.getMessages()).toHaveLength(501);
    });
  });

  describe('与策略模式的兼容性', () => {
    it('应该作为 ExecutorPlugin 正常工作', () => {
      expect(strategy.pluginName).toBeDefined();
      expect(typeof strategy.onBefore).toBe('function');
      expect(typeof strategy.onSuccess).toBe('function');
      expect(typeof strategy.onError).toBe('function');
    });

    it('应该能处理不同的发送策略', () => {
      // KEEP_FAILED 策略已测试
      // 这里验证策略方法是正确暴露的
      expect(strategy['handleBefore_KEEP_FAILED']).toBeDefined();
      expect(strategy['handleSuccess_KEEP_FAILED']).toBeDefined();
    });
  });
});
