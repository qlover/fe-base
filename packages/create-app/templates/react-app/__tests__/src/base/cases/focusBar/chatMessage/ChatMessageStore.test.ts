import { describe, it, expect, beforeEach } from 'vitest';
import {
  ChatMessage,
  ChatMessageRole
} from '@/base/focusBar/chatMessage/ChatMessage';
import {
  ChatMessageStore,
  DraftMode
} from '@/base/focusBar/chatMessage/ChatMessageStore';
import type { ChatMessageStoreStateInterface } from '@/base/focusBar/chatMessage/interface';
import { MessageStatus } from '@/base/focusBar/impl/MessagesStore';

describe('DraftMode', () => {
  it('应该定义所有模式常量', () => {
    expect(DraftMode.STACK).toBe('stack');
    expect(DraftMode.QUEUE).toBe('queue');
  });

  it('模式常量应该是只读的', () => {
    expect(Object.isFrozen(DraftMode)).toBe(true);
  });
});

describe('ChatMessageStore', () => {
  let store: ChatMessageStore<string>;

  beforeEach(() => {
    store = new ChatMessageStore<string>();
  });

  describe('构造函数', () => {
    it('应该使用默认初始状态', () => {
      expect(store.getMessages()).toEqual([]);
      expect(store.getDraftMessages()).toEqual([]);
      expect(store['state'].disabledSend).toBe(false);
    });

    it('应该支持自定义初始状态', () => {
      const customInitialState =
        (): ChatMessageStoreStateInterface<string> => ({
          messages: [
            new ChatMessage({ id: 'msg-1', content: 'Initial message' })
          ],
          draftMessages: [
            new ChatMessage({ id: 'draft-1', content: 'Draft message' })
          ],
          disabledSend: true
        });

      const customStore = new ChatMessageStore<string>(customInitialState);

      expect(customStore.getMessages()).toHaveLength(1);
      expect(customStore.getDraftMessages()).toHaveLength(1);
      expect(customStore['state'].disabledSend).toBe(true);
    });

    it('应该默认使用 QUEUE 模式', () => {
      expect(store['draftMode']).toBe(DraftMode.QUEUE);
    });
  });

  describe('createMessage', () => {
    it('应该创建 ChatMessage 实例', () => {
      const message = store.createMessage({
        content: 'Test content'
      });

      expect(message).toBeInstanceOf(ChatMessage);
      expect(message.content).toBe('Test content');
    });

    it('应该为消息生成唯一 ID', () => {
      const message1 = store.createMessage({ content: 'Message 1' });
      const message2 = store.createMessage({ content: 'Message 2' });

      expect(message1.id).toBeDefined();
      expect(message2.id).toBeDefined();
      expect(message1.id).not.toBe(message2.id);
    });

    it('应该保留提供的 ID', () => {
      const message = store.createMessage({
        id: 'custom-id',
        content: 'Test'
      });

      expect(message.id).toBe('custom-id');
    });

    it('应该设置默认的消息属性', () => {
      const message = store.createMessage();

      expect(message.loading).toBe(false);
      expect(message.result).toBeNull();
      expect(message.error).toBeNull();
      expect(message.role).toBe(ChatMessageRole.USER);
    });
  });

  describe('isMessage', () => {
    it('应该识别 ChatMessage 实例', () => {
      const message = new ChatMessage({ content: 'Test' });
      expect(store.isMessage(message)).toBe(true);
    });

    it('应该拒绝非 ChatMessage 对象', () => {
      expect(store.isMessage({})).toBe(false);
      expect(store.isMessage(null)).toBe(false);
      expect(store.isMessage(undefined)).toBe(false);
      expect(store.isMessage('string')).toBe(false);
      expect(store.isMessage(123)).toBe(false);
      expect(store.isMessage({ id: '1', content: 'fake' })).toBe(false);
    });
  });

  describe('getDraftMessages', () => {
    it('应该返回空数组（初始状态）', () => {
      expect(store.getDraftMessages()).toEqual([]);
    });

    it('应该返回所有草稿消息', () => {
      store.addDraftMessage({ content: 'Draft 1' });
      store.addDraftMessage({ content: 'Draft 2' });

      const drafts = store.getDraftMessages();
      expect(drafts).toHaveLength(2);
    });

    it('应该处理 undefined draftMessages', () => {
      // 手动设置状态为 undefined（边界情况）
      const currentState = store['state'];
      // @ts-ignore
      currentState.draftMessages = undefined;
      expect(store.getDraftMessages()).toEqual([]);
    });
  });

  describe('addDraftMessage', () => {
    it('应该添加草稿消息', () => {
      store.addDraftMessage({ content: 'New draft' });

      const drafts = store.getDraftMessages();
      expect(drafts).toHaveLength(1);
      expect(drafts[0].content).toBe('New draft');
    });

    it('应该自动设置 DRAFT 状态', () => {
      store.addDraftMessage({ content: 'Draft' });

      const draft = store.getDraftMessages()[0];
      expect(draft.status).toBe(MessageStatus.DRAFT);
    });

    it('应该在 STACK 模式下追加到末尾', () => {
      store['draftMode'] = DraftMode.STACK;

      store.addDraftMessage({ content: 'First' });
      store.addDraftMessage({ content: 'Second' });
      store.addDraftMessage({ content: 'Third' });

      const drafts = store.getDraftMessages();
      expect(drafts[0].content).toBe('First');
      expect(drafts[1].content).toBe('Second');
      expect(drafts[2].content).toBe('Third');
    });

    it('应该在 QUEUE 模式下追加到末尾', () => {
      store['draftMode'] = DraftMode.QUEUE;

      store.addDraftMessage({ content: 'First' });
      store.addDraftMessage({ content: 'Second' });
      store.addDraftMessage({ content: 'Third' });

      const drafts = store.getDraftMessages();
      expect(drafts[0].content).toBe('First');
      expect(drafts[1].content).toBe('Second');
      expect(drafts[2].content).toBe('Third');
    });

    it('应该正确添加草稿消息到 store', () => {
      const initialCount = store.getDraftMessages().length;

      store.addDraftMessage({ content: 'Test' });

      expect(store.getDraftMessages()).toHaveLength(initialCount + 1);
      expect(store.getDraftMessages().some((d) => d.content === 'Test')).toBe(
        true
      );
    });

    it('应该保留消息的其他属性', () => {
      store.addDraftMessage({
        id: 'draft-1',
        content: 'Draft',
        role: ChatMessageRole.USER,
        placeholder: 'Typing...',
        files: [new File(['test'], 'test.txt')]
      });

      const draft = store.getDraftMessages()[0];
      expect(draft.id).toBe('draft-1');
      expect(draft.role).toBe(ChatMessageRole.USER);
      expect(draft.placeholder).toBe('Typing...');
      expect(draft.files).toHaveLength(1);
    });
  });

  describe('deleteDraftMessage', () => {
    beforeEach(() => {
      store.addDraftMessage({ id: 'draft-1', content: 'Draft 1' });
      store.addDraftMessage({ id: 'draft-2', content: 'Draft 2' });
      store.addDraftMessage({ id: 'draft-3', content: 'Draft 3' });
    });

    it('应该删除指定的草稿消息', () => {
      store.deleteDraftMessage('draft-2');

      const drafts = store.getDraftMessages();
      expect(drafts).toHaveLength(2);
      expect(drafts.find((d) => d.id === 'draft-2')).toBeUndefined();
    });

    it('应该保留其他草稿消息', () => {
      store.deleteDraftMessage('draft-2');

      const drafts = store.getDraftMessages();
      expect(drafts.find((d) => d.id === 'draft-1')).toBeDefined();
      expect(drafts.find((d) => d.id === 'draft-3')).toBeDefined();
    });

    it('应该正确删除草稿消息', () => {
      const initialCount = store.getDraftMessages().length;

      store.deleteDraftMessage('draft-2');

      expect(store.getDraftMessages()).toHaveLength(initialCount - 1);
    });

    it('应该处理不存在的消息 ID', () => {
      const initialCount = store.getDraftMessages().length;

      store.deleteDraftMessage('non-existent');

      // 不应该改变数组长度
      expect(store.getDraftMessages()).toHaveLength(initialCount);
    });

    it('应该能删除第一个消息', () => {
      store.deleteDraftMessage('draft-1');

      const drafts = store.getDraftMessages();
      expect(drafts).toHaveLength(2);
      expect(drafts[0].id).toBe('draft-2');
    });

    it('应该能删除最后一个消息', () => {
      store.deleteDraftMessage('draft-3');

      const drafts = store.getDraftMessages();
      expect(drafts).toHaveLength(2);
      expect(drafts[1].id).toBe('draft-2');
    });
  });

  describe('updateDraftMessage', () => {
    beforeEach(() => {
      store.addDraftMessage({
        id: 'draft-1',
        content: 'Original content',
        role: ChatMessageRole.USER
      });
    });

    it('应该更新草稿消息', () => {
      const updated = store.updateDraftMessage('draft-1', {
        content: 'Updated content'
      });

      expect(updated).toBeDefined();
      expect(updated?.content).toBe('Updated content');
    });

    it('应该保留未更新的属性', () => {
      store.updateDraftMessage('draft-1', {
        placeholder: 'Loading...'
      });

      const draft = store.getDraftMessages()[0];
      expect(draft.content).toBe('Original content');
      expect(draft.placeholder).toBe('Loading...');
      expect(draft.role).toBe(ChatMessageRole.USER);
    });

    it('应该正确更新草稿消息', () => {
      const updated = store.updateDraftMessage('draft-1', {
        content: 'Updated'
      });

      expect(updated).toBeDefined();
      expect(updated?.content).toBe('Updated');
    });

    it('应该返回 undefined 对于不存在的消息', () => {
      const result = store.updateDraftMessage('non-existent', {
        content: 'New content'
      });

      expect(result).toBeUndefined();
    });

    it('应该在消息不存在时不改变草稿列表', () => {
      const initialCount = store.getDraftMessages().length;

      store.updateDraftMessage('non-existent', {
        content: 'New content'
      });

      expect(store.getDraftMessages()).toHaveLength(initialCount);
    });

    it('应该支持更新多个属性', () => {
      const updated = store.updateDraftMessage('draft-1', {
        content: 'New content',
        loading: true,
        placeholder: 'Sending...',
        error: new Error('Test error')
      });

      expect(updated?.content).toBe('New content');
      expect(updated?.loading).toBe(true);
      expect(updated?.placeholder).toBe('Sending...');
      expect(updated?.error).toBeInstanceOf(Error);
    });
  });

  describe('resetDraftMessages', () => {
    beforeEach(() => {
      store.addDraftMessage({ content: 'Draft 1' });
      store.addDraftMessage({ content: 'Draft 2' });
      store.addDraftMessage({ content: 'Draft 3' });
    });

    it('应该清空所有草稿消息', () => {
      store.resetDraftMessages();

      expect(store.getDraftMessages()).toEqual([]);
    });

    it('应该用新消息替换草稿消息', () => {
      const newMessages = [
        new ChatMessage({ id: 'new-1', content: 'New 1' }),
        new ChatMessage({ id: 'new-2', content: 'New 2' })
      ];

      store.resetDraftMessages(newMessages);

      const drafts = store.getDraftMessages();
      expect(drafts).toHaveLength(2);
      expect(drafts[0].content).toBe('New 1');
      expect(drafts[1].content).toBe('New 2');
    });

    it('应该正确重置草稿消息', () => {
      expect(store.getDraftMessages().length).toBeGreaterThan(0);

      store.resetDraftMessages();

      expect(store.getDraftMessages()).toHaveLength(0);
    });

    it('应该将新消息转换为 ChatMessage 实例', () => {
      const plainObjects = [{ id: 'msg-1', content: 'Message 1' } as any];

      store.resetDraftMessages(plainObjects);

      const drafts = store.getDraftMessages();
      expect(drafts[0]).toBeInstanceOf(ChatMessage);
    });

    it('应该接受空数组', () => {
      store.resetDraftMessages([]);

      expect(store.getDraftMessages()).toEqual([]);
    });
  });

  describe('getDarftMessageById', () => {
    beforeEach(() => {
      store.addDraftMessage({ id: 'draft-1', content: 'Draft 1' });
      store.addDraftMessage({ id: 'draft-2', content: 'Draft 2' });
    });

    it('应该根据 ID 查找草稿消息', () => {
      const draft = store.getDarftMessageById('draft-1');

      expect(draft).toBeDefined();
      expect(draft?.id).toBe('draft-1');
      expect(draft?.content).toBe('Draft 1');
    });

    it('应该返回 null 对于不存在的 ID', () => {
      const draft = store.getDarftMessageById('non-existent');

      expect(draft).toBeNull();
    });

    it('应该返回正确的消息实例', () => {
      const draft = store.getDarftMessageById('draft-2');

      expect(draft).toBeInstanceOf(ChatMessage);
      expect(draft?.content).toBe('Draft 2');
    });
  });

  describe('getFirstDraftMessage', () => {
    it('应该在空列表时返回 null', () => {
      expect(store.getFirstDraftMessage()).toBeNull();
    });

    it('应该在 STACK 模式下返回最后添加的消息', () => {
      store['draftMode'] = DraftMode.STACK;

      store.addDraftMessage({ id: 'draft-1', content: 'First' });
      store.addDraftMessage({ id: 'draft-2', content: 'Second' });
      store.addDraftMessage({ id: 'draft-3', content: 'Third' });

      const first = store.getFirstDraftMessage();
      expect(first?.id).toBe('draft-3');
      expect(first?.content).toBe('Third');
    });

    it('应该在 QUEUE 模式下返回最早添加的消息', () => {
      store['draftMode'] = DraftMode.QUEUE;

      store.addDraftMessage({ id: 'draft-1', content: 'First' });
      store.addDraftMessage({ id: 'draft-2', content: 'Second' });
      store.addDraftMessage({ id: 'draft-3', content: 'Third' });

      // QUEUE 模式：新消息追加到末尾，getFirstDraftMessage 返回 at(0)
      // 所以最早添加的消息（First）会在第一个位置
      const first = store.getFirstDraftMessage();
      expect(first?.id).toBe('draft-1');
      expect(first?.content).toBe('First');
    });
  });

  describe('shiftFirstDraftMessage', () => {
    it('应该在空列表时返回 null', () => {
      expect(store.shiftFirstDraftMessage()).toBeNull();
    });

    it('应该在 STACK 模式下移除并返回最后一个消息', () => {
      store['draftMode'] = DraftMode.STACK;

      store.addDraftMessage({ id: 'draft-1', content: 'First' });
      store.addDraftMessage({ id: 'draft-2', content: 'Second' });
      store.addDraftMessage({ id: 'draft-3', content: 'Third' });

      // STACK: 数组是 [First, Second, Third]
      // getFirstDraftMessage 返回 at(-1) = Third
      // sliceDraftMessages 返回 slice(0, -1) = [First, Second] (移除最后一个 Third)
      const shifted = store.shiftFirstDraftMessage();

      expect(shifted?.id).toBe('draft-3'); // 返回最后一个
      expect(store.getDraftMessages()).toHaveLength(2);
      // 移除的应该是 Third（最后一个）
      expect(store.getDraftMessages().every((d) => d.id !== 'draft-3')).toBe(
        true
      );
      // First 仍然在列表中
      expect(store.getDraftMessages().some((d) => d.id === 'draft-1')).toBe(
        true
      );
    });

    it('应该在 QUEUE 模式下移除并返回最早添加的消息', () => {
      store['draftMode'] = DraftMode.QUEUE;

      store.addDraftMessage({ id: 'draft-1', content: 'First' });
      store.addDraftMessage({ id: 'draft-2', content: 'Second' });
      store.addDraftMessage({ id: 'draft-3', content: 'Third' });

      // QUEUE: 数组是 [First, Second, Third] (新消息追加到末尾)
      // getFirstDraftMessage 返回 at(0) = First
      // sliceDraftMessages 返回 slice(1) = [Second, Third] (移除第一个 First)
      const shifted = store.shiftFirstDraftMessage();

      expect(shifted?.id).toBe('draft-1'); // 返回第一个（最早添加的）
      expect(store.getDraftMessages()).toHaveLength(2);
      // 移除的应该是 First（第一个，最早添加的）
      expect(store.getDraftMessages().every((d) => d.id !== 'draft-1')).toBe(
        true
      );
      // Third 仍然在列表中
      expect(store.getDraftMessages().some((d) => d.id === 'draft-3')).toBe(
        true
      );
    });

    it('应该正确移除草稿消息', () => {
      store.addDraftMessage({ content: 'Test' });
      const initialCount = store.getDraftMessages().length;

      store.shiftFirstDraftMessage();

      expect(store.getDraftMessages()).toHaveLength(initialCount - 1);
    });

    it('应该能连续 shift 直到列表为空', () => {
      store.addDraftMessage({ id: 'draft-1' });
      store.addDraftMessage({ id: 'draft-2' });

      const first = store.shiftFirstDraftMessage();
      const second = store.shiftFirstDraftMessage();
      const third = store.shiftFirstDraftMessage();

      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      expect(third).toBeNull();
      expect(store.getDraftMessages()).toHaveLength(0);
    });
  });

  describe('changeDisabledSend', () => {
    it('应该更新 disabledSend 状态', () => {
      store.changeDisabledSend(true);

      expect(store['state'].disabledSend).toBe(true);
    });

    it('应该能从 true 切换到 false', () => {
      store.changeDisabledSend(true);
      store.changeDisabledSend(false);

      expect(store['state'].disabledSend).toBe(false);
    });

    it('应该正确设置 disabledSend 状态', () => {
      expect(store['state'].disabledSend).toBe(false);

      store.changeDisabledSend(true);
      expect(store['state'].disabledSend).toBe(true);

      store.changeDisabledSend(false);
      expect(store['state'].disabledSend).toBe(false);
    });
  });

  describe('getReadySendMessage', () => {
    beforeEach(() => {
      store.addDraftMessage({ id: 'draft-1', content: 'Draft 1' });
      store.addDraftMessage({ id: 'draft-2', content: 'Draft 2' });
      store.addMessage({ id: 'msg-1', content: 'Message 1' });
    });

    it('应该返回草稿消息如果消息在草稿中', () => {
      const message = new ChatMessage<string>({ id: 'draft-1' });
      const ready = store.getReadySendMessage(message);

      expect(ready?.id).toBe('draft-1');
      expect(ready?.content).toBe('Draft 1');
    });

    it('应该返回历史消息如果消息不在草稿中', () => {
      const message = new ChatMessage<string>({ id: 'msg-1' });
      const ready = store.getReadySendMessage(message);

      expect(ready?.id).toBe('msg-1');
      expect(ready?.content).toBe('Message 1');
    });

    it('应该返回并移除第一个草稿消息如果没有指定消息', () => {
      const draftsCountBefore = store.getDraftMessages().length;
      const ready = store.getReadySendMessage();

      expect(ready).not.toBeNull();
      expect(store.getDraftMessages().length).toBe(draftsCountBefore - 1);
    });

    it('应该返回 null 如果没有草稿消息且未指定消息', () => {
      store.resetDraftMessages();

      const ready = store.getReadySendMessage();

      expect(ready).toBeNull();
    });

    it('应该处理无效的消息对象', () => {
      const invalidMessage = {} as ChatMessage<string>;
      const ready = store.getReadySendMessage(invalidMessage);

      // 应该 fallback 到 shift 第一个草稿
      expect(ready).not.toBeNull();
    });

    it('应该处理没有 ID 的消息', () => {
      const messageWithoutId = new ChatMessage({ content: 'No ID' });
      const ready = store.getReadySendMessage(messageWithoutId);

      // 应该 fallback 到 shift 第一个草稿
      expect(ready).not.toBeNull();
    });
  });

  describe('继承的方法', () => {
    it('应该支持 addMessage', () => {
      store.addMessage({ content: 'Test message' });

      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('Test message');
    });

    it('应该支持 updateMessage', () => {
      store.addMessage({ id: 'msg-1', content: 'Original' });
      store.updateMessage('msg-1', { content: 'Updated' });

      const message = store.getMessageById('msg-1');
      expect(message?.content).toBe('Updated');
    });

    it('应该支持 deleteMessage', () => {
      store.addMessage({ id: 'msg-1', content: 'To delete' });
      store.deleteMessage('msg-1');

      expect(store.getMessages()).toHaveLength(0);
    });

    it('应该支持 getMessages', () => {
      store.addMessage({ content: 'Message 1' });
      store.addMessage({ content: 'Message 2' });

      expect(store.getMessages()).toHaveLength(2);
    });
  });

  describe('状态管理', () => {
    it('应该正确管理草稿消息状态', () => {
      expect(store.getDraftMessages()).toHaveLength(0);

      store.addDraftMessage({ content: 'Draft' });
      expect(store.getDraftMessages()).toHaveLength(1);

      store.resetDraftMessages();
      expect(store.getDraftMessages()).toHaveLength(0);
    });

    it('应该正确管理历史消息和草稿消息', () => {
      store.addMessage({ content: 'History message' });
      store.addDraftMessage({ content: 'Draft message' });

      expect(store.getMessages()).toHaveLength(1);
      expect(store.getDraftMessages()).toHaveLength(1);
    });

    it('应该独立管理不同类型的消息', () => {
      store.addMessage({ id: 'msg-1', content: 'Message 1' });
      store.addDraftMessage({ id: 'draft-1', content: 'Draft 1' });

      expect(store.getMessageById('msg-1')).toBeDefined();
      expect(store.getDarftMessageById('draft-1')).toBeDefined();

      // 历史消息中找不到草稿
      expect(store.getMessageById('draft-1')).toBeUndefined();
    });
  });

  describe('边界情况和错误处理', () => {
    it('应该处理大量草稿消息', () => {
      for (let i = 0; i < 1000; i++) {
        store.addDraftMessage({ id: `draft-${i}`, content: `Draft ${i}` });
      }

      expect(store.getDraftMessages()).toHaveLength(1000);
      expect(store.getFirstDraftMessage()).not.toBeNull();
    });

    it('应该处理快速连续的操作', () => {
      for (let i = 0; i < 100; i++) {
        store.addDraftMessage({ id: `draft-${i}` });
        store.deleteDraftMessage(`draft-${i}`);
      }

      expect(store.getDraftMessages()).toHaveLength(0);
    });

    it('应该处理空字符串 ID', () => {
      store.addDraftMessage({ id: '', content: 'Empty ID' });

      const draft = store.getDarftMessageById('');
      expect(draft).not.toBeNull();
    });

    it('应该处理特殊字符的内容', () => {
      const specialContent = '🚀 Test\n\t"quotes" & symbols!';
      store.addDraftMessage({ content: specialContent });

      const draft = store.getFirstDraftMessage();
      expect(draft?.content).toBe(specialContent);
    });

    it('应该在 STACK 和 QUEUE 模式间切换正常工作', () => {
      store['draftMode'] = DraftMode.STACK;
      store.addDraftMessage({ id: 'stack-1', content: 'Stack 1' });

      store['draftMode'] = DraftMode.QUEUE;
      store.addDraftMessage({ id: 'queue-1', content: 'Queue 1' });

      // 应该能正常获取消息
      expect(store.getDraftMessages()).toHaveLength(2);
    });
  });

  describe('实际使用场景', () => {
    it('应该能模拟用户输入草稿并发送', () => {
      // 用户输入第一条消息
      store.addDraftMessage({ content: 'Hello' });
      expect(store.getDraftMessages()).toHaveLength(1);

      // 用户继续输入
      const firstDraft = store.getFirstDraftMessage();
      store.updateDraftMessage(firstDraft!.id!, {
        content: 'Hello, how are you?'
      });

      // 准备发送
      const readyMessage = store.getReadySendMessage();
      expect(readyMessage?.content).toBe('Hello, how are you?');
      expect(store.getDraftMessages()).toHaveLength(0);

      // 添加到历史消息
      store.addMessage(readyMessage!);
      expect(store.getMessages()).toHaveLength(1);
    });

    it('应该能处理多条草稿消息队列', () => {
      // 用户快速输入多条消息
      store.addDraftMessage({ id: 'msg-1', content: 'Message 1' });
      store.addDraftMessage({ id: 'msg-2', content: 'Message 2' });
      store.addDraftMessage({ id: 'msg-3', content: 'Message 3' });

      const initialDraftCount = store.getDraftMessages().length;
      expect(initialDraftCount).toBe(3);

      // 使用 getReadySendMessage 来获取准备发送的消息
      // 这个方法内部调用 shiftFirstDraftMessage
      const msg1 = store.getReadySendMessage();
      const msg2 = store.getReadySendMessage();
      const msg3 = store.getReadySendMessage();

      // 所有消息都应该被取出
      expect(msg1).not.toBeNull();
      expect(msg2).not.toBeNull();
      expect(msg3).not.toBeNull();

      // 草稿列表应该为空
      expect(store.getDraftMessages()).toHaveLength(0);

      // 第四次调用应该返回 null（没有更多草稿）
      const msg4 = store.getReadySendMessage();
      expect(msg4).toBeNull();

      // 将获取的消息添加到历史
      if (msg1) store.addMessage({ ...msg1, status: MessageStatus.SENT });
      if (msg2) store.addMessage({ ...msg2, status: MessageStatus.SENT });
      if (msg3) store.addMessage({ ...msg3, status: MessageStatus.SENT });

      // 历史消息应该至少有3条
      expect(store.getMessages().length).toBeGreaterThanOrEqual(3);
    });

    it('应该能处理发送禁用状态', () => {
      // 正在发送消息，禁用发送
      store.changeDisabledSend(true);
      expect(store['state'].disabledSend).toBe(true);

      // 用户仍然可以输入草稿
      store.addDraftMessage({ content: 'Draft during sending' });
      expect(store.getDraftMessages()).toHaveLength(1);

      // 发送完成，启用发送
      store.changeDisabledSend(false);
      expect(store['state'].disabledSend).toBe(false);
    });

    it('应该能处理重试失败的消息', () => {
      // 添加失败的消息
      store.addMessage({
        id: 'failed-msg',
        content: 'Failed message',
        status: MessageStatus.FAILED,
        error: new Error('Network error')
      });

      // 将失败消息作为草稿重试
      const failedMsg = store.getMessageById('failed-msg');
      store.addDraftMessage({
        ...failedMsg,
        status: MessageStatus.DRAFT,
        error: null
      });

      expect(store.getDraftMessages()).toHaveLength(1);
      expect(store.getDraftMessages()[0].status).toBe(MessageStatus.DRAFT);
    });

    it('应该能处理草稿保存和恢复', () => {
      // 用户输入草稿
      store.addDraftMessage({ id: 'draft-1', content: 'Unsaved draft' });

      // 保存草稿
      const savedDrafts = store.getDraftMessages();
      expect(savedDrafts).toHaveLength(1);

      // 清空（模拟页面刷新）
      store.resetDraftMessages();
      expect(store.getDraftMessages()).toHaveLength(0);

      // 恢复草稿
      store.resetDraftMessages(savedDrafts);
      expect(store.getDraftMessages()).toHaveLength(1);
      expect(store.getDraftMessages()[0].content).toBe('Unsaved draft');
    });
  });
});
