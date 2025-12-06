import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ChatMessage,
  ChatMessageRole,
  ChatMessageStore,
  ChatSenderStrategy,
  MessageStatus,
  SendFailureStrategy
} from '../../src/core/message-sender';
import type {
  MessageSenderContextOptions,
  MessageGetwayInterface
} from '../../src/core/message-sender';

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

  describe('constructor and basic properties', () => {
    it('should correctly initialize', () => {
      expect(strategy).toBeInstanceOf(ChatSenderStrategy);
      expect(strategy.pluginName).toBe('SenderStrategyPlugin');
    });
  });

  describe('isAssistantMessage', () => {
    it('should recognize assistant message', () => {
      const assistantMessage = new ChatMessage<string>({
        role: ChatMessageRole.ASSISTANT,
        content: 'AI response'
      });

      const result = strategy.isAssistantMessage(store, assistantMessage);

      expect(result).toBe(true);
    });

    it('should reject user message', () => {
      const userMessage = new ChatMessage<string>({
        role: ChatMessageRole.USER,
        content: 'User question'
      });

      const result = strategy.isAssistantMessage(store, userMessage);

      expect(result).toBe(false);
    });

    it('should reject system message', () => {
      const systemMessage = new ChatMessage<string>({
        role: ChatMessageRole.SYSTEM,
        content: 'System prompt'
      });

      const result = strategy.isAssistantMessage(store, systemMessage);

      expect(result).toBe(false);
    });

    it('should reject non ChatMessage object', () => {
      const invalidMessage = {
        role: ChatMessageRole.ASSISTANT
      } as unknown as ChatMessage<string>;

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

    it('should delete all messages after the specified index', () => {
      strategy.sliceMessages(store, 2);

      const messages = store.getMessages();
      expect(messages).toHaveLength(4); // keep messages with index 0,1,2,3
      expect(messages[0].id).toBe('msg-1');
      expect(messages[1].id).toBe('msg-2');
      expect(messages[2].id).toBe('msg-3');
      expect(messages[3].id).toBe('msg-4');
    });

    it('should keep the first two messages when the index is 0', () => {
      strategy.sliceMessages(store, 0);

      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0].id).toBe('msg-1');
      expect(messages[1].id).toBe('msg-2');
    });

    it('should keep all messages when the index is the last', () => {
      strategy.sliceMessages(store, 4);

      const messages = store.getMessages();
      expect(messages).toHaveLength(5);
    });

    it('should handle empty message list', () => {
      const emptyStore = new ChatMessageStore<string>();
      strategy.sliceMessages(emptyStore, 0);

      expect(emptyStore.getMessages()).toHaveLength(0);
    });

    it('should correctly delete message', () => {
      const initialCount = store.getMessages().length;

      strategy.sliceMessages(store, 1);

      // keep messages with index 0,1,2 (first 3 messages)
      expect(store.getMessages().length).toBeLessThan(initialCount);
    });
  });

  describe('handleBefore_KEEP_FAILED', () => {
    it('should handle new message (not in list)', () => {
      const currentMessage = new ChatMessage<string>({
        id: 'new-msg',
        content: 'New message'
      });

      const parameters: MessageSenderContextOptions<ChatMessage<string>> = {
        currentMessage,
        store,
        gateway: mockGateway
      } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

      const result = strategy['handleBefore_KEEP_FAILED'](parameters);

      expect(result).toBeInstanceOf(ChatMessage);
      expect(result.content).toBe('New message');
    });

    it('should handle retry message and clear subsequent messages', () => {
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

      const parameters: MessageSenderContextOptions<ChatMessage<string>> = {
        currentMessage: retryMessage,
        store,
        gateway: mockGateway
      } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

      strategy['handleBefore_KEEP_FAILED'](parameters);

      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe('user-msg');
    });

    it('should delete all messages after the retry message including assistant response', () => {
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

      const parameters: MessageSenderContextOptions<ChatMessage<string>> = {
        currentMessage: retryMessage,
        store,
        gateway: mockGateway
      } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

      strategy['handleBefore_KEEP_FAILED'](parameters);

      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages.find((m) => m.id === 'assistant-1')).toBeUndefined();
      expect(messages.find((m) => m.id === 'msg-3')).toBeUndefined();
    });

    it('should handle message without ID', () => {
      const messageWithoutId = new ChatMessage<string>({
        content: 'No ID message'
      });

      const parameters: MessageSenderContextOptions<ChatMessage<string>> = {
        currentMessage: messageWithoutId,
        store,
        gateway: mockGateway
      } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

      const result = strategy['handleBefore_KEEP_FAILED'](parameters);

      expect(result).toBeInstanceOf(ChatMessage);
    });

    it('should handle message at the end of the list', () => {
      store.addMessage({ id: 'msg-1', content: 'Message 1' });
      store.addMessage({ id: 'msg-2', content: 'Message 2' });
      store.addMessage({ id: 'last-msg', content: 'Last message' });

      const retryMessage = new ChatMessage<string>({
        id: 'last-msg',
        content: 'Last message'
      });

      const parameters: MessageSenderContextOptions<ChatMessage<string>> = {
        currentMessage: retryMessage,
        store,
        gateway: mockGateway
      } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

      strategy['handleBefore_KEEP_FAILED'](parameters);

      // keep all messages (because there are no messages after)
      expect(store.getMessages()).toHaveLength(3);
    });
  });

  describe('handleSuccess_KEEP_FAILED', () => {
    beforeEach(() => {
      store.addMessage({ id: 'user-msg', content: 'User question' });
    });

    it('should add assistant response message after success', () => {
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

      const parameters: MessageSenderContextOptions<ChatMessage<string>> = {
        currentMessage: successData,
        store,
        gateway: mockGateway
      } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

      strategy['handleSuccess_KEEP_FAILED'](parameters, successData);

      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[1].role).toBe(ChatMessageRole.ASSISTANT);
      expect(messages[1].content).toBe('AI response');
    });

    it('should replace existing assistant message', () => {
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

      const parameters: MessageSenderContextOptions<ChatMessage<string>> = {
        currentMessage: successData,
        store,
        gateway: mockGateway
      } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

      strategy['handleSuccess_KEEP_FAILED'](parameters, successData);

      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[1].id).toBe('new-assistant');
      expect(messages[1].content).toBe('New response');
      expect(messages.find((m) => m.id === 'old-assistant')).toBeUndefined();
    });

    it('should delete subsequent messages after replacing assistant message', () => {
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

      const parameters: MessageSenderContextOptions<ChatMessage<string>> = {
        currentMessage: successData,
        store,
        gateway: mockGateway
      } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

      strategy['handleSuccess_KEEP_FAILED'](parameters, successData);

      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages.find((m) => m.id === 'extra-msg')).toBeUndefined();
    });

    it('should handle subsequent message is not assistant', () => {
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

      const parameters: MessageSenderContextOptions<ChatMessage<string>> = {
        currentMessage: successData,
        store,
        gateway: mockGateway
      } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

      strategy['handleSuccess_KEEP_FAILED'](parameters, successData);

      // should not modify existing user message
      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0].id).toBe('user-msg');
      expect(messages[1].id).toBe('next-user-msg');
    });

    it('should handle result is not assistant message', () => {
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

      const parameters: MessageSenderContextOptions<ChatMessage<string>> = {
        currentMessage: successData,
        store,
        gateway: mockGateway
      } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

      const messageCountBefore = store.getMessages().length;
      strategy['handleSuccess_KEEP_FAILED'](parameters, successData);

      // should not add non assistant message
      expect(store.getMessages().length).toBe(messageCountBefore);
    });

    it('should handle result is null', () => {
      const successData = new ChatMessage<string>({
        id: 'user-msg',
        content: 'User question',
        status: MessageStatus.SENT,
        result: null
      });

      const parameters: MessageSenderContextOptions<ChatMessage<string>> = {
        currentMessage: successData,
        store,
        gateway: mockGateway
      } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

      const messageCountBefore = store.getMessages().length;
      strategy['handleSuccess_KEEP_FAILED'](parameters, successData);

      expect(store.getMessages().length).toBe(messageCountBefore);
    });

    it('should handle message not in list', () => {
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

      const parameters: MessageSenderContextOptions<ChatMessage<string>> = {
        currentMessage: successData,
        store,
        gateway: mockGateway
      } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

      const messageCountBefore = store.getMessages().length;
      strategy['handleSuccess_KEEP_FAILED'](parameters, successData);

      // should not add message not in list
      expect(store.getMessages().length).toBe(messageCountBefore);
    });
  });

  describe('integration test', () => {
    it('should handle complete message sending process', () => {
      // 1. add user message
      const userMessage = new ChatMessage<string>({
        id: 'user-1',
        content: 'Hello AI'
      });
      store.addMessage(userMessage);

      // 2. handle before
      const beforeParams: MessageSenderContextOptions<ChatMessage<string>> = {
        currentMessage: userMessage,
        store,
        gateway: mockGateway
      } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

      strategy['handleBefore_KEEP_FAILED'](beforeParams);

      // 3. handle success
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

      // verify result
      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0].id).toBe('user-1');
      expect(messages[1].id).toBe('assistant-1');
      expect(messages[1].role).toBe(ChatMessageRole.ASSISTANT);
    });

    it('should handle retry failed message process', () => {
      // 1. initial conversation
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

      // 2. retry failed message
      const retryMessage = new ChatMessage<string>({
        id: 'user-2',
        content: 'Second question'
      });

      const beforeParams: MessageSenderContextOptions<ChatMessage<string>> = {
        currentMessage: retryMessage,
        store,
        gateway: mockGateway
      } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

      strategy['handleBefore_KEEP_FAILED'](beforeParams);

      // should keep first two messages and retry message
      expect(store.getMessages()).toHaveLength(3);

      // 3. retry success
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

      // verify final result
      const messages = store.getMessages();
      expect(messages).toHaveLength(4);
      expect(messages[2].id).toBe('user-2');
      expect(messages[3].id).toBe('assistant-2');
      expect(messages[3].role).toBe(ChatMessageRole.ASSISTANT);
    });

    it('should handle multiple rounds of conversation', () => {
      const conversations = [
        { user: 'Hello', assistant: 'Hi there!' },
        { user: 'How are you?', assistant: 'I am doing well, thanks!' },
        { user: 'What can you do?', assistant: 'I can help with many tasks!' }
      ];

      conversations.forEach((conv, index) => {
        // add user message
        const userId = `user-${index + 1}`;
        store.addMessage({
          id: userId,
          content: conv.user
        });

        // mock success response
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

        const params: MessageSenderContextOptions<ChatMessage<string>> = {
          currentMessage: successData,
          store,
          gateway: mockGateway
        } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

        strategy['handleSuccess_KEEP_FAILED'](params, successData);
      });

      // verify conversation history
      const messages = store.getMessages();
      expect(messages).toHaveLength(6); // 3 rounds = 6 messages

      // verify role alternation
      for (let i = 0; i < messages.length; i++) {
        if (i % 2 === 0) {
          expect(messages[i].role).toBe(ChatMessageRole.USER);
        } else {
          expect(messages[i].role).toBe(ChatMessageRole.ASSISTANT);
        }
      }
    });

    it('should handle edit middle message and regenerate subsequent conversation', () => {
      // initial conversation
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

      // edit first user message and resend
      const editedMessage = new ChatMessage<string>({
        id: 'user-1',
        content: 'Edited question 1'
      });

      const beforeParams: MessageSenderContextOptions<ChatMessage<string>> = {
        currentMessage: editedMessage,
        store,
        gateway: mockGateway
      } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

      strategy['handleBefore_KEEP_FAILED'](beforeParams);

      // should delete all messages after the first message
      expect(store.getMessages()).toHaveLength(1);

      // regenerate response
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

  describe('edge cases', () => {
    it('should handle empty message list', () => {
      const emptyStore = new ChatMessageStore<string>();

      const message = new ChatMessage<string>({
        id: 'msg-1',
        content: 'First message'
      });

      const params: MessageSenderContextOptions<ChatMessage<string>> = {
        currentMessage: message,
        store: emptyStore,
        gateway: mockGateway
      } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

      expect(() => {
        strategy['handleBefore_KEEP_FAILED'](params);
      }).not.toThrow();
    });

    it('should handle message without ID', () => {
      const messageWithoutId = new ChatMessage<string>({
        content: 'No ID'
      });

      const params: MessageSenderContextOptions<ChatMessage<string>> = {
        currentMessage: messageWithoutId,
        store,
        gateway: mockGateway
      } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

      expect(() => {
        strategy['handleBefore_KEEP_FAILED'](params);
      }).not.toThrow();
    });

    it('should handle empty content message', () => {
      const emptyMessage = new ChatMessage<string>({
        id: 'empty-msg',
        content: ''
      });

      store.addMessage(emptyMessage);

      const params: MessageSenderContextOptions<ChatMessage<string>> = {
        currentMessage: emptyMessage,
        store,
        gateway: mockGateway
      } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

      expect(() => {
        strategy['handleBefore_KEEP_FAILED'](params);
      }).not.toThrow();
    });

    it('should handle special character content', () => {
      const specialMessage = new ChatMessage<string>({
        id: 'special-msg',
        content: '🚀 Test\n\t"quotes" & symbols!'
      });

      store.addMessage(specialMessage);

      const params: MessageSenderContextOptions<ChatMessage<string>> = {
        currentMessage: specialMessage,
        store,
        gateway: mockGateway
      } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

      strategy['handleBefore_KEEP_FAILED'](params);

      expect(store.getMessages()).toHaveLength(1);
      expect(store.getMessages()[0].content).toBe(
        '🚀 Test\n\t"quotes" & symbols!'
      );
    });

    it('should handle very long message list', () => {
      // add大量消息
      for (let i = 0; i < 1000; i++) {
        store.addMessage({
          id: `msg-${i}`,
          content: `Message ${i}`
        });
      }

      expect(store.getMessages()).toHaveLength(1000);

      // retry in the middle position
      const retryMessage = new ChatMessage<string>({
        id: 'msg-500',
        content: 'Message 500'
      });

      const params: MessageSenderContextOptions<ChatMessage<string>> = {
        currentMessage: retryMessage,
        store,
        gateway: mockGateway
      } as unknown as MessageSenderContextOptions<ChatMessage<string>>;

      strategy['handleBefore_KEEP_FAILED'](params);

      // should keep first 501 messages
      expect(store.getMessages()).toHaveLength(501);
    });
  });

  describe('compatibility with strategy pattern', () => {
    it('should work as ExecutorPlugin normally', () => {
      expect(strategy.pluginName).toBeDefined();
      expect(typeof strategy.onBefore).toBe('function');
      expect(typeof strategy.onSuccess).toBe('function');
      expect(typeof strategy.onError).toBe('function');
    });

    it('should handle different send strategies', () => {
      // KEEP_FAILED strategy has been tested
      // here to verify the strategy methods are correctly exposed
      expect(strategy['handleBefore_KEEP_FAILED']).toBeDefined();
      expect(strategy['handleSuccess_KEEP_FAILED']).toBeDefined();
    });
  });
});
