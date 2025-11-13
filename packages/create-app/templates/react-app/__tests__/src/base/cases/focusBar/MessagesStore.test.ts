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
  });
});
