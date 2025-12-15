/**
 * @file MessagesStore test suite
 *
 * Comprehensive tests for MessagesStore functionality including:
 * - Message creation with default values and custom properties
 * - Message CRUD operations (add, get, update, delete)
 * - Message state management and transitions
 * - Message querying and filtering
 * - Streaming state management
 * - Message serialization and JSON export
 * - Prototype chain preservation for custom message classes
 * - Edge cases and error handling
 * - Complete message lifecycle integration tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  MessagesStore,
  MessageStatus,
  MessageStatusType,
  type MessageStoreMsg
} from '../../src/core/message-sender';

/**
 * Test message type for MessagesStore tests
 *
 * Extends base MessageStoreMsg with optional content field
 */
interface TestMessage extends MessageStoreMsg<string> {
  content?: string;
}

/**
 * Custom message class for testing prototype chain preservation
 *
 * Implements TestMessage with additional custom methods
 * to verify that class instances maintain their prototype chain
 * after store operations
 */
class CustomMessage implements TestMessage {
  public id?: string;
  public content?: string;
  public status?: MessageStatusType;
  public loading: boolean = false;
  public result: string | null = null;
  public error: unknown = null;
  public startTime: number = 0;
  public endTime: number = 0;
  public placeholder?: string;
  public files?: File[];

  constructor(data: Partial<TestMessage> = {}) {
    Object.assign(this, data);
  }

  /**
   * Custom method to test prototype chain preservation
   *
   * Returns display content or fallback text
   */
  public getDisplayContent(): string {
    return this.content || 'No content';
  }
}

describe('MessagesStore', () => {
  let store: MessagesStore<TestMessage>;

  beforeEach(() => {
    store = new MessagesStore(() => ({
      messages: []
    }));
  });

  describe('createMessage', () => {
    it('should create message with default values', () => {
      const message = store.createMessage();

      expect(message).toBeDefined();
      expect(message.id).toBeDefined();
      expect(message.status).toBe(MessageStatus.DRAFT);
      expect(message.loading).toBe(false);
      expect(message.result).toBeNull();
      expect(message.error).toBeNull();
      expect(message.startTime).toBeDefined();
      expect(message.endTime).toBe(0);
    });

    it('should create message with provided partial properties', () => {
      const partialMessage: Partial<TestMessage> = {
        id: 'test-id-1',
        content: 'Test content',
        status: MessageStatus.SENDING,
        loading: true
      };

      const message = store.createMessage(partialMessage);

      expect(message.id).toBe('test-id-1');
      expect(message.content).toBe('Test content');
      expect(message.status).toBe(MessageStatus.SENDING);
      expect(message.loading).toBe(true);
    });

    it('should auto-generate ID if not provided', () => {
      const message1 = store.createMessage();
      const message2 = store.createMessage();

      expect(message1.id).toBeDefined();
      expect(message2.id).toBeDefined();
      expect(message1.id).not.toBe(message2.id);
    });

    it('should use provided startTime', () => {
      const customTime = 1234567890;
      const message = store.createMessage({ startTime: customTime });

      expect(message.startTime).toBe(customTime);
    });
  });

  describe('addMessage', () => {
    it('should add message to store', () => {
      const message = {
        content: 'Hello World'
      } as TestMessage;

      const addedMessage = store.addMessage(message);

      expect(addedMessage).toBeDefined();
      expect(addedMessage.content).toBe('Hello World');
      expect(store.getMessages()).toHaveLength(1);
      expect(store.getMessages()[0]).toEqual(addedMessage);
    });

    it('should add multiple messages', () => {
      const message1 = { content: 'Message 1' } as TestMessage;
      const message2 = { content: 'Message 2' } as TestMessage;
      const message3 = { content: 'Message 3' } as TestMessage;

      store.addMessage(message1);
      store.addMessage(message2);
      store.addMessage(message3);

      expect(store.getMessages()).toHaveLength(3);
    });

    it('should handle case when ID already exists: replace at original position (keep order)', () => {
      // add three messages
      store.addMessage({ id: 'msg-1', content: 'Message 1' });
      store.addMessage({ id: 'msg-2', content: 'Message 2' });
      store.addMessage({ id: 'msg-3', content: 'Message 3' });

      expect(store.getMessages()).toHaveLength(3);

      // add message with existing ID msg-2
      const updatedMessage = store.addMessage({
        id: 'msg-2',
        content: 'Message 2 Updated'
      });

      const messages = store.getMessages();

      // total count unchanged
      expect(messages).toHaveLength(3);

      // msg-2 replaced at original position (second position), not moved
      expect(messages[0].id).toBe('msg-1');
      expect(messages[1].id).toBe('msg-2');
      expect(messages[2].id).toBe('msg-3');

      // verify new message content
      expect(messages[1].content).toBe('Message 2 Updated');
      expect(updatedMessage.content).toBe('Message 2 Updated');
    });

    it('should handle re-adding first message', () => {
      // add first message
      store.addMessage({ id: 'msg-1', content: 'First' });

      // add other messages
      store.addMessage({ id: 'msg-2', content: 'Second' });
      store.addMessage({ id: 'msg-3', content: 'Third' });

      // re-add msg-1 (first message)
      store.addMessage({ id: 'msg-1', content: 'First Updated' });

      const messages = store.getMessages();

      // msg-1 should stay at first position, only content updated
      expect(messages).toHaveLength(3);
      expect(messages[0].id).toBe('msg-1');
      expect(messages[1].id).toBe('msg-2');
      expect(messages[2].id).toBe('msg-3');
      expect(messages[0].content).toBe('First Updated');
    });

    it('should handle re-adding last message', () => {
      store.addMessage({ id: 'msg-1', content: 'First' });
      store.addMessage({ id: 'msg-2', content: 'Second' });
      store.addMessage({ id: 'msg-3', content: 'Third' });

      // re-add last message
      store.addMessage({ id: 'msg-3', content: 'Third Updated' });

      const messages = store.getMessages();

      // position unchanged, content updated
      expect(messages).toHaveLength(3);
      expect(messages[0].id).toBe('msg-1');
      expect(messages[1].id).toBe('msg-2');
      expect(messages[2].id).toBe('msg-3');
      expect(messages[2].content).toBe('Third Updated');
    });

    it('should correctly merge existing message properties (retain unspecified properties)', () => {
      // add initial message
      store.addMessage({
        id: 'msg-1',
        content: 'Original',
        status: MessageStatus.DRAFT,
        placeholder: 'Original placeholder'
      });

      // re-add message with same ID, only update some properties
      const updated = store.addMessage({
        id: 'msg-1',
        content: 'Updated',
        status: MessageStatus.SENDING
        // placeholder not specified
      });

      // new message merges with old message (retains unspecified properties)
      expect(updated.content).toBe('Updated');
      expect(updated.status).toBe(MessageStatus.SENDING);
      expect(updated.placeholder).toBe('Original placeholder'); // ✅ retained old placeholder
      expect(updated.id).toBe('msg-1');
    });

    it('should retain files and other complex properties when merging', () => {
      const file1 = new File(['content1'], 'file1.txt');
      const file2 = new File(['content2'], 'file2.txt');

      // add message with files
      const initial = store.addMessage({
        id: 'msg-with-files',
        content: 'Message with files',
        files: [file1, file2],
        placeholder: 'Uploading...',
        status: MessageStatus.SENDING
      });

      expect(initial.files).toHaveLength(2);

      // only update status and content, don't specify files
      const updated = store.addMessage({
        id: 'msg-with-files',
        content: 'Upload complete',
        status: MessageStatus.SENT
        // files and placeholder not specified
      });

      // should retain previous files and placeholder
      expect(updated.content).toBe('Upload complete');
      expect(updated.status).toBe(MessageStatus.SENT);
      expect(updated.files).toHaveLength(2); // ✅ retained files
      expect(updated.files![0]).toBe(file1);
      expect(updated.files![1]).toBe(file2);
      expect(updated.placeholder).toBe('Uploading...'); // ✅ retained placeholder
    });

    it('should prevent UI flicker: maintain position when updating message', () => {
      // simulate chat message list
      const msg1 = store.addMessage({ id: 'msg-1', content: 'User: Hello' });
      const msg2 = store.addMessage({
        id: 'msg-2',
        content: 'Bot: Thinking...',
        status: MessageStatus.SENDING
      });
      const msg3 = store.addMessage({
        id: 'msg-3',
        content: 'User: How are you?'
      });

      // get initial positions
      const beforeMessages = store.getMessages();
      expect(beforeMessages[0]).toBe(msg1);
      expect(beforeMessages[1]).toBe(msg2);
      expect(beforeMessages[2]).toBe(msg3);

      // bot reply complete, update message content and status
      store.addMessage({
        id: 'msg-2',
        content: 'Bot: I am fine, thank you!',
        status: MessageStatus.SENT
      });

      const afterMessages = store.getMessages();

      // key: message position should remain unchanged, avoid UI jump
      expect(afterMessages).toHaveLength(3);
      expect(afterMessages[0].id).toBe('msg-1');
      expect(afterMessages[1].id).toBe('msg-2'); // position unchanged
      expect(afterMessages[2].id).toBe('msg-3');

      // but content and status updated
      expect(afterMessages[1].content).toBe('Bot: I am fine, thank you!');
      expect(afterMessages[1].status).toBe(MessageStatus.SENT);
    });
  });

  describe('getMessages', () => {
    it('should return empty array when no messages', () => {
      expect(store.getMessages()).toEqual([]);
    });

    it('should return all messages', () => {
      const message1 = store.addMessage({
        content: 'Message 1'
      });
      const message2 = store.addMessage({
        content: 'Message 2'
      });

      const messages = store.getMessages();

      expect(messages).toHaveLength(2);
      expect(messages[0].id).toBe(message1.id);
      expect(messages[1].id).toBe(message2.id);
    });
  });

  describe('getMessageById', () => {
    it('should get message by ID', () => {
      store.addMessage({
        id: 'test-id',
        content: 'Test content'
      });

      const foundMessage = store.getMessageById('test-id');

      expect(foundMessage).toBeDefined();
      expect(foundMessage?.id).toBe('test-id');
      expect(foundMessage?.content).toBe('Test content');
    });

    it('should return undefined when message does not exist', () => {
      const foundMessage = store.getMessageById('non-existent-id');

      expect(foundMessage).toBeUndefined();
    });

    it('should find correct message among multiple messages', () => {
      store.addMessage({ id: 'id-1', content: 'Message 1' });
      store.addMessage({ id: 'id-2', content: 'Message 2' });
      store.addMessage({ id: 'id-3', content: 'Message 3' });

      const foundMessage = store.getMessageById('id-2');

      expect(foundMessage?.content).toBe('Message 2');
    });
  });

  describe('updateMessage', () => {
    it('should update existing message', () => {
      store.addMessage({
        id: 'test-id',
        content: 'Original content',
        status: MessageStatus.DRAFT
      });

      const updatedMessage = store.updateMessage('test-id', {
        content: 'Updated content',
        status: MessageStatus.SENT
      });

      expect(updatedMessage).toBeDefined();
      expect(updatedMessage?.content).toBe('Updated content');
      expect(updatedMessage?.status).toBe(MessageStatus.SENT);
    });

    it('should return undefined when updating non-existent message', () => {
      const result = store.updateMessage('non-existent-id', {
        content: 'Updated'
      });

      expect(result).toBeUndefined();
    });

    it('should partially update message without affecting other properties', () => {
      store.addMessage({
        id: 'test-id',
        content: 'Original content',
        status: MessageStatus.DRAFT,
        loading: false
      });

      const updatedMessage = store.updateMessage('test-id', {
        loading: true
      });

      expect(updatedMessage?.content).toBe('Original content');
      expect(updatedMessage?.status).toBe(MessageStatus.DRAFT);
      expect(updatedMessage?.loading).toBe(true);
    });

    it('should update multiple properties', () => {
      store.addMessage({
        id: 'test-id',
        content: 'Original',
        status: MessageStatus.DRAFT,
        loading: false
      });

      const updatedMessage = store.updateMessage('test-id', {
        content: 'Updated',
        status: MessageStatus.SENT,
        loading: true,
        endTime: 123456
      });

      expect(updatedMessage?.content).toBe('Updated');
      expect(updatedMessage?.status).toBe(MessageStatus.SENT);
      expect(updatedMessage?.loading).toBe(true);
      expect(updatedMessage?.endTime).toBe(123456);
    });
  });

  describe('deleteMessage', () => {
    it('should delete existing message', () => {
      store.addMessage({
        id: 'test-id',
        content: 'To be deleted'
      });

      expect(store.getMessages()).toHaveLength(1);

      store.deleteMessage('test-id');

      expect(store.getMessages()).toHaveLength(0);
      expect(store.getMessageById('test-id')).toBeUndefined();
    });

    it('should not affect other messages', () => {
      store.addMessage({ id: 'id-1', content: 'Message 1' });
      store.addMessage({ id: 'id-2', content: 'Message 2' });
      store.addMessage({ id: 'id-3', content: 'Message 3' });

      store.deleteMessage('id-2');

      expect(store.getMessages()).toHaveLength(2);
      expect(store.getMessageById('id-1')).toBeDefined();
      expect(store.getMessageById('id-2')).toBeUndefined();
      expect(store.getMessageById('id-3')).toBeDefined();
    });

    it('should not throw error when deleting non-existent message', () => {
      expect(() => {
        store.deleteMessage('non-existent-id');
      }).not.toThrow();
    });
  });

  describe('mergeMessage', () => {
    it('should merge ordinary object message', () => {
      const original = store.createMessage({
        id: 'test-id',
        content: 'Original',
        status: MessageStatus.DRAFT,
        loading: false
      });

      const updates: Partial<TestMessage> = {
        content: 'Updated',
        loading: true
      };

      const merged = store.mergeMessage(original, updates);

      expect(merged.id).toBe('test-id');
      expect(merged.content).toBe('Updated');
      expect(merged.status).toBe(MessageStatus.DRAFT);
      expect(merged.loading).toBe(true);
      expect(merged).not.toBe(original); // should be new object
    });

    it('should preserve class instance prototype chain', () => {
      const customMessage = new CustomMessage({
        id: 'test-id',
        content: 'Original',
        loading: false,
        result: null,
        startTime: Date.now(),
        endTime: 0
      });

      const updates: Partial<TestMessage> = {
        content: 'Updated'
      };

      const merged = store.mergeMessage(customMessage as TestMessage, updates);

      // verify prototype chain preserved
      expect(merged).toBeInstanceOf(CustomMessage);
      expect((merged as CustomMessage).getDisplayContent()).toBe('Updated');

      // verify property updates
      expect(merged.id).toBe('test-id');
      expect(merged.content).toBe('Updated');
    });

    it('should support multiple update objects', () => {
      const original = store.createMessage({
        id: 'test-id',
        content: 'Original',
        status: MessageStatus.DRAFT
      });

      const update1: Partial<TestMessage> = {
        content: 'Update 1'
      };

      const update2: Partial<TestMessage> = {
        loading: true
      };

      const update3: Partial<TestMessage> = {
        status: MessageStatus.SENT
      };

      const merged = store.mergeMessage(original, update1, update2, update3);

      expect(merged.content).toBe('Update 1');
      expect(merged.loading).toBe(true);
      expect(merged.status).toBe(MessageStatus.SENT);
      expect(merged.id).toBe('test-id');
    });
  });

  describe('MessageStatus', () => {
    it('should contain all status constants', () => {
      expect(MessageStatus.DRAFT).toBe('draft');
      expect(MessageStatus.SENDING).toBe('sending');
      expect(MessageStatus.SENT).toBe('sent');
      expect(MessageStatus.FAILED).toBe('failed');
      expect(MessageStatus.STOPPED).toBe('stopped');
    });

    it('should be frozen object', () => {
      expect(Object.isFrozen(MessageStatus)).toBe(true);
    });
  });

  describe('isMessage', () => {
    it('should identify valid message object', () => {
      const validMessage = {
        id: 'test-id',
        content: 'Test content',
        status: MessageStatus.DRAFT
      };

      expect(store.isMessage(validMessage)).toBe(true);
    });

    it('should identify empty object as message', () => {
      expect(store.isMessage({})).toBe(true);
    });

    it('should reject null', () => {
      expect(store.isMessage(null)).toBe(false);
    });

    it('should reject undefined', () => {
      expect(store.isMessage(undefined)).toBe(false);
    });

    it('should reject string', () => {
      expect(store.isMessage('not a message')).toBe(false);
    });

    it('should reject number', () => {
      expect(store.isMessage(123)).toBe(false);
    });

    it('should reject boolean', () => {
      expect(store.isMessage(true)).toBe(false);
    });

    it('should identify array as object (although not common)', () => {
      expect(store.isMessage([])).toBe(true);
    });

    it('should identify class instance as message', () => {
      const customMessage = new CustomMessage({
        id: 'test-id',
        content: 'Test'
      });

      expect(store.isMessage(customMessage)).toBe(true);
    });
  });

  describe('getMessageIndex', () => {
    it('should return correct index of message', () => {
      store.addMessage({ id: 'msg-1', content: 'Message 1' });
      store.addMessage({ id: 'msg-2', content: 'Message 2' });
      store.addMessage({ id: 'msg-3', content: 'Message 3' });

      expect(store.getMessageIndex('msg-1')).toBe(0);
      expect(store.getMessageIndex('msg-2')).toBe(1);
      expect(store.getMessageIndex('msg-3')).toBe(2);
    });

    it('should return -1 when message does not exist', () => {
      store.addMessage({ id: 'msg-1', content: 'Message 1' });

      expect(store.getMessageIndex('non-existent')).toBe(-1);
    });

    it('should return -1 when message list is empty', () => {
      expect(store.getMessageIndex('any-id')).toBe(-1);
    });

    it('should update index after deleting message', () => {
      store.addMessage({ id: 'msg-1', content: 'Message 1' });
      store.addMessage({ id: 'msg-2', content: 'Message 2' });
      store.addMessage({ id: 'msg-3', content: 'Message 3' });

      // delete middle message
      store.deleteMessage('msg-2');

      expect(store.getMessageIndex('msg-1')).toBe(0);
      expect(store.getMessageIndex('msg-2')).toBe(-1);
      expect(store.getMessageIndex('msg-3')).toBe(1); // index changed from 2 to 1
    });
  });

  describe('getMessageByIndex', () => {
    it('should get message by index', () => {
      const msg1 = store.addMessage({ id: 'msg-1', content: 'Message 1' });
      const msg2 = store.addMessage({ id: 'msg-2', content: 'Message 2' });
      const msg3 = store.addMessage({ id: 'msg-3', content: 'Message 3' });

      expect(store.getMessageByIndex(0)?.id).toBe(msg1.id);
      expect(store.getMessageByIndex(1)?.id).toBe(msg2.id);
      expect(store.getMessageByIndex(2)?.id).toBe(msg3.id);
    });

    it('should support negative index (from end)', () => {
      store.addMessage({ id: 'msg-1', content: 'Message 1' });
      store.addMessage({ id: 'msg-2', content: 'Message 2' });
      const msg3 = store.addMessage({ id: 'msg-3', content: 'Message 3' });

      // -1 represents last element
      expect(store.getMessageByIndex(-1)?.id).toBe(msg3.id);
      // -2 represents second last element
      expect(store.getMessageByIndex(-2)?.id).toBe('msg-2');
      // -3 represents third last element
      expect(store.getMessageByIndex(-3)?.id).toBe('msg-1');
    });

    it('should return undefined when index is out of range', () => {
      store.addMessage({ id: 'msg-1', content: 'Message 1' });

      expect(store.getMessageByIndex(10)).toBeUndefined();
      expect(store.getMessageByIndex(-10)).toBeUndefined();
    });

    it('should return undefined when message list is empty', () => {
      expect(store.getMessageByIndex(0)).toBeUndefined();
    });
  });

  describe('resetMessages', () => {
    it('should reset message list', () => {
      // add some initial messages
      store.addMessage({ id: 'msg-1', content: 'Message 1' });
      store.addMessage({ id: 'msg-2', content: 'Message 2' });

      expect(store.getMessages()).toHaveLength(2);

      // reset to new message list
      const newMessages: TestMessage[] = [
        {
          id: 'new-msg-1',
          content: 'New Message 1',
          status: MessageStatus.SENT,
          loading: false,
          result: null,
          error: null,
          startTime: Date.now(),
          endTime: 0
        },
        {
          id: 'new-msg-2',
          content: 'New Message 2',
          status: MessageStatus.DRAFT,
          loading: false,
          result: null,
          error: null,
          startTime: Date.now(),
          endTime: 0
        }
      ];

      store.resetMessages(newMessages);

      const messages = store.getMessages();
      expect(messages).toHaveLength(2);
      expect(messages[0].id).toBe('new-msg-1');
      expect(messages[1].id).toBe('new-msg-2');
      expect(store.getMessageById('msg-1')).toBeUndefined();
      expect(store.getMessageById('msg-2')).toBeUndefined();
    });

    it('should reset to empty list', () => {
      store.addMessage({ id: 'msg-1', content: 'Message 1' });
      store.addMessage({ id: 'msg-2', content: 'Message 2' });

      store.resetMessages([]);

      expect(store.getMessages()).toHaveLength(0);
    });

    it('should call createMessage for each message', () => {
      const partialMessages = [
        { content: 'Message 1' }, // no id and other required fields
        { content: 'Message 2' }
      ] as TestMessage[];

      store.resetMessages(partialMessages);

      const messages = store.getMessages();

      // createMessage should add default values for each message
      expect(messages[0].id).toBeDefined();
      expect(messages[0].status).toBe(MessageStatus.DRAFT);
      expect(messages[0].loading).toBe(false);
      expect(messages[1].id).toBeDefined();
      expect(messages[1].status).toBe(MessageStatus.DRAFT);
    });

    it('should retain existing properties in message', () => {
      const messagesWithProperties: TestMessage[] = [
        {
          id: 'msg-1',
          content: 'Message 1',
          status: MessageStatus.SENT,
          loading: false,
          result: 'Success',
          error: null,
          startTime: 123456,
          endTime: 789012
        }
      ];

      store.resetMessages(messagesWithProperties);

      const messages = store.getMessages();
      expect(messages[0].id).toBe('msg-1');
      expect(messages[0].status).toBe(MessageStatus.SENT);
      expect(messages[0].result).toBe('Success');
      expect(messages[0].startTime).toBe(123456);
      expect(messages[0].endTime).toBe(789012);
    });
  });

  describe('toJson', () => {
    it('should return empty array when no messages', () => {
      const json = store.toJson();

      expect(json).toEqual([]);
      expect(Array.isArray(json)).toBe(true);
    });

    it('should convert message list to JSON', () => {
      store.addMessage({
        id: 'msg-1',
        content: 'Message 1',
        status: MessageStatus.SENT
      });

      store.addMessage({
        id: 'msg-2',
        content: 'Message 2',
        status: MessageStatus.DRAFT
      });

      const json = store.toJson();

      expect(json).toHaveLength(2);
      expect(json[0].id).toBe('msg-1');
      expect(json[0].content).toBe('Message 1');
      expect(json[1].id).toBe('msg-2');
      expect(json[1].content).toBe('Message 2');
    });

    it('should return ordinary object instead of message instance', () => {
      const customMessage = new CustomMessage({
        id: 'msg-1',
        content: 'Test',
        loading: false,
        result: null,
        error: null,
        startTime: Date.now(),
        endTime: 0
      });

      store.addMessage(customMessage as TestMessage);

      const json = store.toJson();

      // toJson should return ordinary object, not preserving prototype chain
      expect(json[0]).not.toBeInstanceOf(CustomMessage);
      expect(Object.getPrototypeOf(json[0])).toBe(Object.prototype);
    });

    it('should deep copy, modifying returned value should not affect original data', () => {
      store.addMessage({
        id: 'msg-1',
        content: 'Original',
        status: MessageStatus.DRAFT
      });

      const json = store.toJson();

      // modify JSON data
      json[0].content = 'Modified';
      json[0].status = MessageStatus.SENT;

      // original data should remain unchanged
      const originalMessage = store.getMessageById('msg-1');
      expect(originalMessage?.content).toBe('Original');
      expect(originalMessage?.status).toBe(MessageStatus.DRAFT);
    });

    it('should handle message with complex object', () => {
      store.addMessage({
        id: 'msg-1',
        content: 'Message with complex data',
        status: MessageStatus.SENT,
        result: {
          data: 'test data',
          nested: {
            value: 123
          }
        },
        error: new Error('Test error')
      });

      const json = store.toJson();

      expect(json[0].result).toEqual({
        data: 'test data',
        nested: {
          value: 123
        }
      });

      // Error object will be serialized to empty object (default behavior of JSON.stringify)
      expect(json[0].error).toEqual({});
    });
  });

  describe('startStreaming / stopStreaming', () => {
    it('should start streaming', () => {
      store.startStreaming();

      expect(store.state.streaming).toBe(true);
    });

    it('should stop streaming', () => {
      store.startStreaming();
      expect(store.state.streaming).toBe(true);

      store.stopStreaming();
      expect(store.state.streaming).toBe(false);
    });

    it('should handle continuous start', () => {
      store.startStreaming();
      store.startStreaming();
      store.startStreaming();

      expect(store.state.streaming).toBe(true);
    });

    it('should handle continuous stop', () => {
      store.startStreaming();

      store.stopStreaming();
      store.stopStreaming();
      store.stopStreaming();

      expect(store.state.streaming).toBe(false);
    });

    it('should be able to stop when not started', () => {
      // initial state should not have streaming or be false
      expect(store.state.streaming).toBeFalsy();

      // direct stop should not throw an error
      expect(() => {
        store.stopStreaming();
      }).not.toThrow();

      expect(store.state.streaming).toBe(false);
    });

    it('should support streaming toggle', () => {
      store.startStreaming();
      expect(store.state.streaming).toBe(true);

      // close
      store.stopStreaming();
      expect(store.state.streaming).toBe(false);

      // reopen
      store.startStreaming();
      expect(store.state.streaming).toBe(true);

      // close again
      store.stopStreaming();
      expect(store.state.streaming).toBe(false);
    });
  });

  describe('updateMessage - multiple update objects', () => {
    it('should support passing multiple update objects', () => {
      store.addMessage({
        id: 'msg-1',
        content: 'Original',
        status: MessageStatus.DRAFT,
        loading: false
      });

      const update1: Partial<TestMessage> = {
        content: 'Updated content'
      };

      const update2: Partial<TestMessage> = {
        status: MessageStatus.SENDING
      };

      const update3: Partial<TestMessage> = {
        loading: true
      };

      const updatedMessage = store.updateMessage(
        'msg-1',
        update1,
        update2,
        update3
      );

      expect(updatedMessage?.content).toBe('Updated content');
      expect(updatedMessage?.status).toBe(MessageStatus.SENDING);
      expect(updatedMessage?.loading).toBe(true);
    });

    it('should apply multiple updates in order (last one overrides previous)', () => {
      store.addMessage({
        id: 'msg-1',
        content: 'Original',
        status: MessageStatus.DRAFT
      });

      const update1: Partial<TestMessage> = {
        content: 'First update'
      };

      const update2: Partial<TestMessage> = {
        content: 'Second update'
      };

      const update3: Partial<TestMessage> = {
        content: 'Third update'
      };

      const updatedMessage = store.updateMessage(
        'msg-1',
        update1,
        update2,
        update3
      );

      // last update should take effect
      expect(updatedMessage?.content).toBe('Third update');
    });

    it('should handle empty update object array', () => {
      store.addMessage({
        id: 'msg-1',
        content: 'Original',
        status: MessageStatus.DRAFT
      });

      const updatedMessage = store.updateMessage('msg-1');

      // no updates, message should remain unchanged
      expect(updatedMessage?.content).toBe('Original');
      expect(updatedMessage?.status).toBe(MessageStatus.DRAFT);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle createMessage edge time values', () => {
      const message1 = store.createMessage({ startTime: 0 });
      expect(message1.startTime).toBe(0);

      const message2 = store.createMessage({ endTime: 0 });
      expect(message2.endTime).toBe(0);
    });

    it('should handle message content is empty', () => {
      const message = store.addMessage({
        content: ''
      });

      expect(message.content).toBe('');
      expect(store.getMessages()).toHaveLength(1);
    });

    it('should handle message ID is empty string', () => {
      const message = store.addMessage({
        id: '',
        content: 'Test'
      });

      expect(message.id).toBe('');
      expect(store.getMessageById('')).toBeDefined();
    });

    it('should handle complex nested object', () => {
      const complexMessage = store.addMessage({
        id: 'complex',
        content: 'Complex message',
        result: {
          data: {
            nested: {
              deep: {
                value: 'test'
              }
            }
          },
          array: [1, 2, 3],
          map: new Map([['key', 'value']])
        }
      });

      expect(complexMessage.result).toBeDefined();
      expect(
        (
          complexMessage.result as {
            data: { nested: { deep: { value: string } } };
          }
        ).data.nested.deep.value
      ).toBe('test');
    });
  });

  describe('integration test: complete message lifecycle', () => {
    it('should support complete message sending flow', () => {
      const sendingMessage = store.addMessage({
        id: 'msg-1',
        content: 'Hello World',
        status: MessageStatus.SENDING,
        loading: true
      });

      expect(sendingMessage.status).toBe(MessageStatus.SENDING);
      expect(sendingMessage.loading).toBe(true);

      const sentMessage = store.updateMessage('msg-1', {
        status: MessageStatus.SENT,
        loading: false,
        result: 'Success',
        endTime: Date.now()
      });

      expect(sentMessage?.status).toBe(MessageStatus.SENT);
      expect(sentMessage?.loading).toBe(false);
      expect(sentMessage?.result).toBe('Success');
      expect(sentMessage?.endTime).toBeGreaterThan(0);
    });

    it('should support message sending failed scenario', () => {
      store.addMessage({
        id: 'msg-2',
        content: 'Failed message',
        status: MessageStatus.SENDING,
        loading: true
      });

      // 2. update to failed status
      const failedMessage = store.updateMessage('msg-2', {
        status: MessageStatus.FAILED,
        loading: false,
        error: new Error('Network error'),
        endTime: Date.now()
      });

      expect(failedMessage?.status).toBe(MessageStatus.FAILED);
      expect(failedMessage?.loading).toBe(false);
      expect(failedMessage?.error).toBeInstanceOf(Error);
    });

    it('should support managing multiple messages', () => {
      store.addMessage({
        id: 'msg-1',
        content: 'Message 1',
        status: MessageStatus.SENT
      });

      store.addMessage({
        id: 'msg-2',
        content: 'Message 2',
        status: MessageStatus.SENDING
      });

      store.addMessage({
        id: 'msg-3',
        content: 'Message 3',
        status: MessageStatus.DRAFT
      });

      expect(store.getMessages()).toHaveLength(3);

      // update one of them
      store.updateMessage('msg-2', {
        status: MessageStatus.SENT,
        loading: false
      });

      // delete one of them
      store.deleteMessage('msg-1');

      expect(store.getMessages()).toHaveLength(2);
      expect(store.getMessageById('msg-1')).toBeUndefined();
      expect(store.getMessageById('msg-2')?.status).toBe(MessageStatus.SENT);
      expect(store.getMessageById('msg-3')?.status).toBe(MessageStatus.DRAFT);
    });

    it('should support streaming scenario', () => {
      store.startStreaming();

      // add streaming message
      const streamingMessage = store.addMessage({
        id: 'streaming-msg',
        content: 'Streaming...',
        status: MessageStatus.SENDING,
        loading: true
      });

      expect(store.state.streaming).toBe(true);
      expect(streamingMessage.status).toBe(MessageStatus.SENDING);

      // update streaming content
      store.updateMessage('streaming-msg', {
        content: 'Streaming... more content'
      });

      // stop streaming
      store.stopStreaming();
      store.updateMessage('streaming-msg', {
        status: MessageStatus.SENT,
        loading: false,
        endTime: Date.now()
      });

      expect(store.state.streaming).toBe(false);
      expect(store.getMessageById('streaming-msg')?.status).toBe(
        MessageStatus.SENT
      );
    });

    it('should support batch operations: reset, add, update', () => {
      // 1. reset to initial messages
      store.resetMessages([
        {
          id: 'initial-1',
          content: 'Initial message 1',
          status: MessageStatus.SENT,
          loading: false,
          result: null,
          error: null,
          startTime: Date.now(),
          endTime: 0
        }
      ]);

      expect(store.getMessages()).toHaveLength(1);

      // 2. add new messages
      store.addMessage({ id: 'new-1', content: 'New message 1' });
      store.addMessage({ id: 'new-2', content: 'New message 2' });

      expect(store.getMessages()).toHaveLength(3);

      // 3. batch update
      store.updateMessage('initial-1', { status: MessageStatus.STOPPED });
      store.updateMessage('new-1', { status: MessageStatus.SENDING });

      // 4. convert to JSON and verify
      const json = store.toJson();
      expect(json).toHaveLength(3);
      expect(json[0].status).toBe(MessageStatus.STOPPED);
      expect(json[1].status).toBe(MessageStatus.SENDING);
    });

    it('should support accessing message by index', () => {
      store.addMessage({ id: 'msg-1', content: 'First' });
      store.addMessage({ id: 'msg-2', content: 'Second' });
      store.addMessage({ id: 'msg-3', content: 'Third' });

      // access by index
      const firstMessage = store.getMessageByIndex(0);
      expect(firstMessage?.content).toBe('First');

      // find index
      const secondIndex = store.getMessageIndex('msg-2');
      expect(secondIndex).toBe(1);

      // access last message by negative index
      const lastMessage = store.getMessageByIndex(-1);
      expect(lastMessage?.content).toBe('Third');

      // index should be updated after deleting middle message
      store.deleteMessage('msg-2');
      expect(store.getMessageIndex('msg-3')).toBe(1);
    });
  });
});
