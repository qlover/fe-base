import { describe, it, expect, beforeEach } from 'vitest';
import {
  MessagesStore,
  MessageStatus,
  type MessageStoreMsg
} from '@/base/focusBar/impl/MessagesStore';

// 测试用的消息类型
interface TestMessage extends MessageStoreMsg<string> {
  content?: string;
}

// 测试用的消息类（用于测试原型链保持）
class CustomMessage implements TestMessage {
  id?: string;
  content?: string;
  status?: any;
  loading: boolean = false;
  result: string | null = null;
  error: unknown = null;
  startTime: number = 0;
  endTime: number = 0;
  placeholder?: string;
  files?: File[];

  constructor(data: Partial<TestMessage> = {}) {
    Object.assign(this, data);
  }

  // 自定义方法用于测试原型链
  getDisplayContent(): string {
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
    it('应该创建一个带有默认值的消息', () => {
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

    it('应该使用提供的部分属性创建消息', () => {
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

    it('应该自动生成 ID 如果没有提供', () => {
      const message1 = store.createMessage();
      const message2 = store.createMessage();

      expect(message1.id).toBeDefined();
      expect(message2.id).toBeDefined();
      expect(message1.id).not.toBe(message2.id);
    });

    it('应该使用提供的 startTime', () => {
      const customTime = 1234567890;
      const message = store.createMessage({ startTime: customTime });

      expect(message.startTime).toBe(customTime);
    });
  });

  describe('addMessage', () => {
    it('应该添加消息到 store', () => {
      const message = {
        content: 'Hello World'
      } as TestMessage;

      const addedMessage = store.addMessage(message);

      expect(addedMessage).toBeDefined();
      expect(addedMessage.content).toBe('Hello World');
      expect(store.getMessages()).toHaveLength(1);
      expect(store.getMessages()[0]).toEqual(addedMessage);
    });

    it('应该添加多条消息', () => {
      const message1 = { content: 'Message 1' } as TestMessage;
      const message2 = { content: 'Message 2' } as TestMessage;
      const message3 = { content: 'Message 3' } as TestMessage;

      store.addMessage(message1);
      store.addMessage(message2);
      store.addMessage(message3);

      expect(store.getMessages()).toHaveLength(3);
    });

    it('应该处理 ID 已存在的情况：在原位置替换（不移动位置）', () => {
      // 添加三条消息
      store.addMessage({ id: 'msg-1', content: 'Message 1' });
      store.addMessage({ id: 'msg-2', content: 'Message 2' });
      store.addMessage({ id: 'msg-3', content: 'Message 3' });

      expect(store.getMessages()).toHaveLength(3);

      // 再次添加 ID 为 msg-2 的消息（ID 已存在）
      const updatedMessage = store.addMessage({
        id: 'msg-2',
        content: 'Message 2 Updated'
      });

      const messages = store.getMessages();

      // 消息总数不变
      expect(messages).toHaveLength(3);

      // msg-2 在原位置（第二个位置）被替换，不移动
      expect(messages[0].id).toBe('msg-1');
      expect(messages[1].id).toBe('msg-2');
      expect(messages[2].id).toBe('msg-3');

      // 验证新消息的内容
      expect(messages[1].content).toBe('Message 2 Updated');
      expect(updatedMessage.content).toBe('Message 2 Updated');
    });

    it('应该处理重复添加第一条消息的情况', () => {
      // 添加第一条消息
      store.addMessage({ id: 'msg-1', content: 'First' });

      // 添加其他消息
      store.addMessage({ id: 'msg-2', content: 'Second' });
      store.addMessage({ id: 'msg-3', content: 'Third' });

      // 再次添加 msg-1（第一条消息）
      store.addMessage({ id: 'msg-1', content: 'First Updated' });

      const messages = store.getMessages();

      // msg-1 应该保持在第一个位置，只更新内容
      expect(messages).toHaveLength(3);
      expect(messages[0].id).toBe('msg-1');
      expect(messages[1].id).toBe('msg-2');
      expect(messages[2].id).toBe('msg-3');
      expect(messages[0].content).toBe('First Updated');
    });

    it('应该处理重复添加最后一条消息的情况', () => {
      store.addMessage({ id: 'msg-1', content: 'First' });
      store.addMessage({ id: 'msg-2', content: 'Second' });
      store.addMessage({ id: 'msg-3', content: 'Third' });

      // 再次添加最后一条消息
      store.addMessage({ id: 'msg-3', content: 'Third Updated' });

      const messages = store.getMessages();

      // 位置保持不变，内容更新
      expect(messages).toHaveLength(3);
      expect(messages[0].id).toBe('msg-1');
      expect(messages[1].id).toBe('msg-2');
      expect(messages[2].id).toBe('msg-3');
      expect(messages[2].content).toBe('Third Updated');
    });

    it('应该正确合并已存在消息的属性（保留未指定的属性）', () => {
      // 添加初始消息
      store.addMessage({
        id: 'msg-1',
        content: 'Original',
        status: MessageStatus.DRAFT,
        placeholder: 'Original placeholder'
      });

      // 再次添加相同 ID 的消息，只更新部分属性
      const updated = store.addMessage({
        id: 'msg-1',
        content: 'Updated',
        status: MessageStatus.SENDING
        // placeholder 未指定
      });

      // 新消息会合并旧消息（保留未指定的属性）
      expect(updated.content).toBe('Updated');
      expect(updated.status).toBe(MessageStatus.SENDING);
      expect(updated.placeholder).toBe('Original placeholder'); // ✅ 保留了旧的 placeholder
      expect(updated.id).toBe('msg-1');
    });

    it('应该在合并时保留文件和其他复杂属性', () => {
      const file1 = new File(['content1'], 'file1.txt');
      const file2 = new File(['content2'], 'file2.txt');

      // 添加带文件的消息
      const initial = store.addMessage({
        id: 'msg-with-files',
        content: 'Message with files',
        files: [file1, file2],
        placeholder: 'Uploading...',
        status: MessageStatus.SENDING
      });

      expect(initial.files).toHaveLength(2);

      // 只更新状态和内容，不指定 files
      const updated = store.addMessage({
        id: 'msg-with-files',
        content: 'Upload complete',
        status: MessageStatus.SENT
        // files 和 placeholder 未指定
      });

      // 应该保留之前的 files 和 placeholder
      expect(updated.content).toBe('Upload complete');
      expect(updated.status).toBe(MessageStatus.SENT);
      expect(updated.files).toHaveLength(2); // ✅ 保留了文件
      expect(updated.files![0]).toBe(file1);
      expect(updated.files![1]).toBe(file2);
      expect(updated.placeholder).toBe('Uploading...'); // ✅ 保留了 placeholder
    });

    it('应该防止 UI 闪烁：更新消息时保持位置不变', () => {
      // 模拟聊天消息列表
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

      // 获取初始位置
      const beforeMessages = store.getMessages();
      expect(beforeMessages[0]).toBe(msg1);
      expect(beforeMessages[1]).toBe(msg2);
      expect(beforeMessages[2]).toBe(msg3);

      // Bot 回复完成，更新消息内容和状态
      store.addMessage({
        id: 'msg-2',
        content: 'Bot: I am fine, thank you!',
        status: MessageStatus.SENT
      });

      const afterMessages = store.getMessages();

      // 关键：消息位置应该保持不变，避免 UI 跳跃
      expect(afterMessages).toHaveLength(3);
      expect(afterMessages[0].id).toBe('msg-1');
      expect(afterMessages[1].id).toBe('msg-2'); // 位置不变
      expect(afterMessages[2].id).toBe('msg-3');

      // 但内容和状态已更新
      expect(afterMessages[1].content).toBe('Bot: I am fine, thank you!');
      expect(afterMessages[1].status).toBe(MessageStatus.SENT);
    });
  });

  describe('getMessages', () => {
    it('应该返回空数组当没有消息时', () => {
      expect(store.getMessages()).toEqual([]);
    });

    it('应该返回所有消息', () => {
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
    it('应该通过 ID 获取消息', () => {
      store.addMessage({
        id: 'test-id',
        content: 'Test content'
      });

      const foundMessage = store.getMessageById('test-id');

      expect(foundMessage).toBeDefined();
      expect(foundMessage?.id).toBe('test-id');
      expect(foundMessage?.content).toBe('Test content');
    });

    it('应该返回 undefined 当消息不存在时', () => {
      const foundMessage = store.getMessageById('non-existent-id');

      expect(foundMessage).toBeUndefined();
    });

    it('应该在多条消息中找到正确的消息', () => {
      store.addMessage({ id: 'id-1', content: 'Message 1' });
      store.addMessage({ id: 'id-2', content: 'Message 2' });
      store.addMessage({ id: 'id-3', content: 'Message 3' });

      const foundMessage = store.getMessageById('id-2');

      expect(foundMessage?.content).toBe('Message 2');
    });
  });

  describe('updateMessage', () => {
    it('应该更新存在的消息', () => {
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

    it('应该返回 undefined 当更新不存在的消息时', () => {
      const result = store.updateMessage('non-existent-id', {
        content: 'Updated'
      });

      expect(result).toBeUndefined();
    });

    it('应该部分更新消息而不影响其他属性', () => {
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

    it('应该更新多个属性', () => {
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
    it('应该删除存在的消息', () => {
      store.addMessage({
        id: 'test-id',
        content: 'To be deleted'
      });

      expect(store.getMessages()).toHaveLength(1);

      store.deleteMessage('test-id');

      expect(store.getMessages()).toHaveLength(0);
      expect(store.getMessageById('test-id')).toBeUndefined();
    });

    it('应该不影响其他消息', () => {
      store.addMessage({ id: 'id-1', content: 'Message 1' });
      store.addMessage({ id: 'id-2', content: 'Message 2' });
      store.addMessage({ id: 'id-3', content: 'Message 3' });

      store.deleteMessage('id-2');

      expect(store.getMessages()).toHaveLength(2);
      expect(store.getMessageById('id-1')).toBeDefined();
      expect(store.getMessageById('id-2')).toBeUndefined();
      expect(store.getMessageById('id-3')).toBeDefined();
    });

    it('应该不会抛出错误当删除不存在的消息时', () => {
      expect(() => {
        store.deleteMessage('non-existent-id');
      }).not.toThrow();
    });
  });

  describe('mergeMessage', () => {
    it('应该合并普通对象消息', () => {
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
      expect(merged).not.toBe(original); // 应该是新对象
    });

    it('应该保持类实例的原型链', () => {
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

      // 验证原型链保持
      expect(merged).toBeInstanceOf(CustomMessage);
      expect((merged as CustomMessage).getDisplayContent()).toBe('Updated');

      // 验证属性更新
      expect(merged.id).toBe('test-id');
      expect(merged.content).toBe('Updated');
    });

    it('应该支持多个更新对象', () => {
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
    it('应该包含所有状态常量', () => {
      expect(MessageStatus.DRAFT).toBe('draft');
      expect(MessageStatus.SENDING).toBe('sending');
      expect(MessageStatus.SENT).toBe('sent');
      expect(MessageStatus.FAILED).toBe('failed');
      expect(MessageStatus.STOPPED).toBe('stopped');
    });

    it('应该是冻结的对象', () => {
      expect(Object.isFrozen(MessageStatus)).toBe(true);
    });
  });

  describe('isMessage', () => {
    it('应该识别有效的消息对象', () => {
      const validMessage = {
        id: 'test-id',
        content: 'Test content',
        status: MessageStatus.DRAFT
      };

      expect(store.isMessage(validMessage)).toBe(true);
    });

    it('应该识别空对象为消息', () => {
      expect(store.isMessage({})).toBe(true);
    });

    it('应该拒绝 null', () => {
      expect(store.isMessage(null)).toBe(false);
    });

    it('应该拒绝 undefined', () => {
      expect(store.isMessage(undefined)).toBe(false);
    });

    it('应该拒绝字符串', () => {
      expect(store.isMessage('not a message')).toBe(false);
    });

    it('应该拒绝数字', () => {
      expect(store.isMessage(123)).toBe(false);
    });

    it('应该拒绝布尔值', () => {
      expect(store.isMessage(true)).toBe(false);
    });

    it('应该识别数组为对象（虽然不常见）', () => {
      expect(store.isMessage([])).toBe(true);
    });

    it('应该识别类实例为消息', () => {
      const customMessage = new CustomMessage({
        id: 'test-id',
        content: 'Test'
      });

      expect(store.isMessage(customMessage)).toBe(true);
    });
  });

  describe('getMessageIndex', () => {
    it('应该返回消息的正确索引', () => {
      store.addMessage({ id: 'msg-1', content: 'Message 1' });
      store.addMessage({ id: 'msg-2', content: 'Message 2' });
      store.addMessage({ id: 'msg-3', content: 'Message 3' });

      expect(store.getMessageIndex('msg-1')).toBe(0);
      expect(store.getMessageIndex('msg-2')).toBe(1);
      expect(store.getMessageIndex('msg-3')).toBe(2);
    });

    it('应该返回 -1 当消息不存在时', () => {
      store.addMessage({ id: 'msg-1', content: 'Message 1' });

      expect(store.getMessageIndex('non-existent')).toBe(-1);
    });

    it('应该返回 -1 当消息列表为空时', () => {
      expect(store.getMessageIndex('any-id')).toBe(-1);
    });

    it('应该在删除消息后更新索引', () => {
      store.addMessage({ id: 'msg-1', content: 'Message 1' });
      store.addMessage({ id: 'msg-2', content: 'Message 2' });
      store.addMessage({ id: 'msg-3', content: 'Message 3' });

      // 删除中间的消息
      store.deleteMessage('msg-2');

      expect(store.getMessageIndex('msg-1')).toBe(0);
      expect(store.getMessageIndex('msg-2')).toBe(-1);
      expect(store.getMessageIndex('msg-3')).toBe(1); // 索引从 2 变为 1
    });
  });

  describe('getMessageByIndex', () => {
    it('应该通过索引获取消息', () => {
      const msg1 = store.addMessage({ id: 'msg-1', content: 'Message 1' });
      const msg2 = store.addMessage({ id: 'msg-2', content: 'Message 2' });
      const msg3 = store.addMessage({ id: 'msg-3', content: 'Message 3' });

      expect(store.getMessageByIndex(0)?.id).toBe(msg1.id);
      expect(store.getMessageByIndex(1)?.id).toBe(msg2.id);
      expect(store.getMessageByIndex(2)?.id).toBe(msg3.id);
    });

    it('应该支持负索引（从末尾开始）', () => {
      store.addMessage({ id: 'msg-1', content: 'Message 1' });
      store.addMessage({ id: 'msg-2', content: 'Message 2' });
      const msg3 = store.addMessage({ id: 'msg-3', content: 'Message 3' });

      // -1 表示最后一个元素
      expect(store.getMessageByIndex(-1)?.id).toBe(msg3.id);
      // -2 表示倒数第二个元素
      expect(store.getMessageByIndex(-2)?.id).toBe('msg-2');
      // -3 表示倒数第三个元素
      expect(store.getMessageByIndex(-3)?.id).toBe('msg-1');
    });

    it('应该返回 undefined 当索引超出范围时', () => {
      store.addMessage({ id: 'msg-1', content: 'Message 1' });

      expect(store.getMessageByIndex(10)).toBeUndefined();
      expect(store.getMessageByIndex(-10)).toBeUndefined();
    });

    it('应该返回 undefined 当消息列表为空时', () => {
      expect(store.getMessageByIndex(0)).toBeUndefined();
    });
  });

  describe('resetMessages', () => {
    it('应该重置消息列表', () => {
      // 添加一些初始消息
      store.addMessage({ id: 'msg-1', content: 'Message 1' });
      store.addMessage({ id: 'msg-2', content: 'Message 2' });

      expect(store.getMessages()).toHaveLength(2);

      // 重置为新的消息列表
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

    it('应该重置为空列表', () => {
      store.addMessage({ id: 'msg-1', content: 'Message 1' });
      store.addMessage({ id: 'msg-2', content: 'Message 2' });

      store.resetMessages([]);

      expect(store.getMessages()).toHaveLength(0);
    });

    it('应该对每条消息调用 createMessage', () => {
      const partialMessages = [
        { content: 'Message 1' }, // 没有 id 和其他必需字段
        { content: 'Message 2' }
      ] as TestMessage[];

      store.resetMessages(partialMessages);

      const messages = store.getMessages();

      // createMessage 应该为每条消息补充默认值
      expect(messages[0].id).toBeDefined();
      expect(messages[0].status).toBe(MessageStatus.DRAFT);
      expect(messages[0].loading).toBe(false);
      expect(messages[1].id).toBeDefined();
      expect(messages[1].status).toBe(MessageStatus.DRAFT);
    });

    it('应该保留消息中已有的属性', () => {
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
    it('应该返回空数组当没有消息时', () => {
      const json = store.toJson();

      expect(json).toEqual([]);
      expect(Array.isArray(json)).toBe(true);
    });

    it('应该将消息列表转换为 JSON', () => {
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

    it('应该返回普通对象而不是消息实例', () => {
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

      // toJson 应该返回普通对象，不保留原型链
      expect(json[0]).not.toBeInstanceOf(CustomMessage);
      expect(Object.getPrototypeOf(json[0])).toBe(Object.prototype);
    });

    it('应该深拷贝，修改返回值不应影响原始数据', () => {
      store.addMessage({
        id: 'msg-1',
        content: 'Original',
        status: MessageStatus.DRAFT
      });

      const json = store.toJson();

      // 修改 JSON 数据
      json[0].content = 'Modified';
      json[0].status = MessageStatus.SENT;

      // 原始数据应该不变
      const originalMessage = store.getMessageById('msg-1');
      expect(originalMessage?.content).toBe('Original');
      expect(originalMessage?.status).toBe(MessageStatus.DRAFT);
    });

    it('应该处理包含复杂对象的消息', () => {
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

      // Error 对象会被序列化为空对象（JSON.stringify 的默认行为）
      expect(json[0].error).toEqual({});
    });
  });

  describe('startStreaming / stopStreaming', () => {
    it('应该启动流式传输', () => {
      store.startStreaming();

      expect(store.state.streaming).toBe(true);
    });

    it('应该停止流式传输', () => {
      store.startStreaming();
      expect(store.state.streaming).toBe(true);

      store.stopStreaming();
      expect(store.state.streaming).toBe(false);
    });

    it('应该处理连续启动', () => {
      store.startStreaming();
      store.startStreaming();
      store.startStreaming();

      expect(store.state.streaming).toBe(true);
    });

    it('应该处理连续停止', () => {
      store.startStreaming();

      store.stopStreaming();
      store.stopStreaming();
      store.stopStreaming();

      expect(store.state.streaming).toBe(false);
    });

    it('应该在未启动时也能停止', () => {
      // 初始状态应该没有 streaming 或为 false
      expect(store.state.streaming).toBeFalsy();

      // 直接停止不应该报错
      expect(() => {
        store.stopStreaming();
      }).not.toThrow();

      expect(store.state.streaming).toBe(false);
    });

    it('应该支持流式传输开关切换', () => {
      // 开启
      store.startStreaming();
      expect(store.state.streaming).toBe(true);

      // 关闭
      store.stopStreaming();
      expect(store.state.streaming).toBe(false);

      // 再次开启
      store.startStreaming();
      expect(store.state.streaming).toBe(true);

      // 再次关闭
      store.stopStreaming();
      expect(store.state.streaming).toBe(false);
    });
  });

  describe('updateMessage - 多个更新对象', () => {
    it('应该支持传入多个更新对象', () => {
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

    it('应该按顺序应用多个更新（后面的覆盖前面的）', () => {
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

      // 最后的更新应该生效
      expect(updatedMessage?.content).toBe('Third update');
    });

    it('应该处理空的更新对象数组', () => {
      store.addMessage({
        id: 'msg-1',
        content: 'Original',
        status: MessageStatus.DRAFT
      });

      const updatedMessage = store.updateMessage('msg-1');

      // 没有更新，消息应该保持不变
      expect(updatedMessage?.content).toBe('Original');
      expect(updatedMessage?.status).toBe(MessageStatus.DRAFT);
    });
  });

  describe('边界情况和错误处理', () => {
    it('应该处理 createMessage 时的边界时间值', () => {
      const message1 = store.createMessage({ startTime: 0 });
      expect(message1.startTime).toBe(0);

      const message2 = store.createMessage({ endTime: 0 });
      expect(message2.endTime).toBe(0);
    });

    it('应该处理消息内容为空的情况', () => {
      const message = store.addMessage({
        content: ''
      });

      expect(message.content).toBe('');
      expect(store.getMessages()).toHaveLength(1);
    });

    it('应该处理消息 ID 为空字符串的情况', () => {
      const message = store.addMessage({
        id: '',
        content: 'Test'
      });

      expect(message.id).toBe('');
      expect(store.getMessageById('')).toBeDefined();
    });

    it('应该处理复杂的嵌套对象', () => {
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
      expect((complexMessage.result as any).data.nested.deep.value).toBe(
        'test'
      );
    });
  });

  describe('集成测试：完整的消息生命周期', () => {
    it('应该支持完整的消息发送流程', () => {
      // 1. 创建并添加消息（发送中）
      const sendingMessage = store.addMessage({
        id: 'msg-1',
        content: 'Hello World',
        status: MessageStatus.SENDING,
        loading: true
      });

      expect(sendingMessage.status).toBe(MessageStatus.SENDING);
      expect(sendingMessage.loading).toBe(true);

      // 2. 更新为发送成功
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

    it('应该支持消息发送失败的场景', () => {
      // 1. 添加发送中的消息
      store.addMessage({
        id: 'msg-2',
        content: 'Failed message',
        status: MessageStatus.SENDING,
        loading: true
      });

      // 2. 更新为失败状态
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

    it('应该支持管理多条消息', () => {
      // 添加多条消息
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

      // 更新其中一条
      store.updateMessage('msg-2', {
        status: MessageStatus.SENT,
        loading: false
      });

      // 删除一条
      store.deleteMessage('msg-1');

      expect(store.getMessages()).toHaveLength(2);
      expect(store.getMessageById('msg-1')).toBeUndefined();
      expect(store.getMessageById('msg-2')?.status).toBe(MessageStatus.SENT);
      expect(store.getMessageById('msg-3')?.status).toBe(MessageStatus.DRAFT);
    });

    it('应该支持流式传输场景', () => {
      // 开始流式传输
      store.startStreaming();

      // 添加流式消息
      const streamingMessage = store.addMessage({
        id: 'streaming-msg',
        content: 'Streaming...',
        status: MessageStatus.SENDING,
        loading: true
      });

      expect(store.state.streaming).toBe(true);
      expect(streamingMessage.status).toBe(MessageStatus.SENDING);

      // 更新流式内容
      store.updateMessage('streaming-msg', {
        content: 'Streaming... more content'
      });

      // 停止流式传输
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

    it('应该支持批量操作：重置、添加、更新', () => {
      // 1. 重置为初始消息
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

      // 2. 添加新消息
      store.addMessage({ id: 'new-1', content: 'New message 1' });
      store.addMessage({ id: 'new-2', content: 'New message 2' });

      expect(store.getMessages()).toHaveLength(3);

      // 3. 批量更新
      store.updateMessage('initial-1', { status: MessageStatus.STOPPED });
      store.updateMessage('new-1', { status: MessageStatus.SENDING });

      // 4. 转换为 JSON 并验证
      const json = store.toJson();
      expect(json).toHaveLength(3);
      expect(json[0].status).toBe(MessageStatus.STOPPED);
      expect(json[1].status).toBe(MessageStatus.SENDING);
    });

    it('应该支持使用索引访问消息', () => {
      store.addMessage({ id: 'msg-1', content: 'First' });
      store.addMessage({ id: 'msg-2', content: 'Second' });
      store.addMessage({ id: 'msg-3', content: 'Third' });

      // 通过索引访问
      const firstMessage = store.getMessageByIndex(0);
      expect(firstMessage?.content).toBe('First');

      // 查找索引
      const secondIndex = store.getMessageIndex('msg-2');
      expect(secondIndex).toBe(1);

      // 使用负索引访问最后一条消息
      const lastMessage = store.getMessageByIndex(-1);
      expect(lastMessage?.content).toBe('Third');

      // 删除中间消息后索引应该更新
      store.deleteMessage('msg-2');
      expect(store.getMessageIndex('msg-3')).toBe(1);
    });
  });
});
