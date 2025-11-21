import { describe, it, expect, beforeEach } from 'vitest';
import {
  ChatMessage,
  ChatMessageRole,
  ChatMessageStore,
  MessageStatus,
  DraftMode
} from '../../src/core/message-sender';
import type { ChatMessageStoreStateInterface } from '../../src/core/message-sender';

describe('DraftMode', () => {
  it('should define all mode constants', () => {
    expect(DraftMode.STACK).toBe('stack');
    expect(DraftMode.QUEUE).toBe('queue');
  });

  it('mode constants should be readonly', () => {
    expect(Object.isFrozen(DraftMode)).toBe(true);
  });
});

describe('ChatMessageStore', () => {
  let store: ChatMessageStore<string>;

  beforeEach(() => {
    store = new ChatMessageStore<string>();
  });

  describe('constructor', () => {
    it('should use default initial state', () => {
      expect(store.getMessages()).toEqual([]);
      expect(store.getDraftMessages()).toEqual([]);
      expect(store['state'].disabledSend).toBe(false);
    });

    it('should support custom initial state', () => {
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

    it('should default to QUEUE mode', () => {
      expect(store['draftMode']).toBe(DraftMode.QUEUE);
    });
  });

  describe('createMessage', () => {
    it('should create ChatMessage instance', () => {
      const message = store.createMessage({
        content: 'Test content'
      });

      expect(message).toBeInstanceOf(ChatMessage);
      expect(message.content).toBe('Test content');
    });

    it('should generate unique ID for message', () => {
      const message1 = store.createMessage({ content: 'Message 1' });
      const message2 = store.createMessage({ content: 'Message 2' });

      expect(message1.id).toBeDefined();
      expect(message2.id).toBeDefined();
      expect(message1.id).not.toBe(message2.id);
    });

    it('should preserve provided ID', () => {
      const message = store.createMessage({
        id: 'custom-id',
        content: 'Test'
      });

      expect(message.id).toBe('custom-id');
    });

    it('should set default message properties', () => {
      const message = store.createMessage();

      expect(message.loading).toBe(false);
      expect(message.result).toBeNull();
      expect(message.error).toBeNull();
      expect(message.role).toBe(ChatMessageRole.USER);
    });
  });

  describe('isMessage', () => {
    it('should recognize ChatMessage instance', () => {
      const message = new ChatMessage({ content: 'Test' });
      expect(store.isMessage(message)).toBe(true);
    });

    it('should reject non ChatMessage objects', () => {
      expect(store.isMessage({})).toBe(false);
      expect(store.isMessage(null)).toBe(false);
      expect(store.isMessage(undefined)).toBe(false);
      expect(store.isMessage('string')).toBe(false);
      expect(store.isMessage(123)).toBe(false);
      expect(store.isMessage({ id: '1', content: 'fake' })).toBe(false);
    });
  });

  describe('getDraftMessages', () => {
    it('should return empty array (initial state)', () => {
      expect(store.getDraftMessages()).toEqual([]);
    });

    it('should return all draft messages', () => {
      store.addDraftMessage({ content: 'Draft 1' });
      store.addDraftMessage({ content: 'Draft 2' });

      const drafts = store.getDraftMessages();
      expect(drafts).toHaveLength(2);
    });

    it('should handle undefined draftMessages', () => {
      // manually set state to undefined (edge case)
      const currentState = store['state'];
      // @ts-ignore
      currentState.draftMessages = undefined;
      expect(store.getDraftMessages()).toEqual([]);
    });
  });

  describe('addDraftMessage', () => {
    it('should add draft message', () => {
      store.addDraftMessage({ content: 'New draft' });

      const drafts = store.getDraftMessages();
      expect(drafts).toHaveLength(1);
      expect(drafts[0].content).toBe('New draft');
    });

    it('should automatically set DRAFT status', () => {
      store.addDraftMessage({ content: 'Draft' });

      const draft = store.getDraftMessages()[0];
      expect(draft.status).toBe(MessageStatus.DRAFT);
    });

    it('should append to the end in STACK mode', () => {
      store['draftMode'] = DraftMode.STACK;

      store.addDraftMessage({ content: 'First' });
      store.addDraftMessage({ content: 'Second' });
      store.addDraftMessage({ content: 'Third' });

      const drafts = store.getDraftMessages();
      expect(drafts[0].content).toBe('First');
      expect(drafts[1].content).toBe('Second');
      expect(drafts[2].content).toBe('Third');
    });

    it('should append to the end in QUEUE mode', () => {
      store['draftMode'] = DraftMode.QUEUE;

      store.addDraftMessage({ content: 'First' });
      store.addDraftMessage({ content: 'Second' });
      store.addDraftMessage({ content: 'Third' });

      const drafts = store.getDraftMessages();
      expect(drafts[0].content).toBe('First');
      expect(drafts[1].content).toBe('Second');
      expect(drafts[2].content).toBe('Third');
    });

    it('should correctly add draft message to store', () => {
      const initialCount = store.getDraftMessages().length;

      store.addDraftMessage({ content: 'Test' });

      expect(store.getDraftMessages()).toHaveLength(initialCount + 1);
      expect(store.getDraftMessages().some((d) => d.content === 'Test')).toBe(
        true
      );
    });

    it('should preserve other message properties', () => {
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

    it('should delete specified draft message', () => {
      store.deleteDraftMessage('draft-2');

      const drafts = store.getDraftMessages();
      expect(drafts).toHaveLength(2);
      expect(drafts.find((d) => d.id === 'draft-2')).toBeUndefined();
    });

    it('should preserve other draft messages', () => {
      store.deleteDraftMessage('draft-2');

      const drafts = store.getDraftMessages();
      expect(drafts.find((d) => d.id === 'draft-1')).toBeDefined();
      expect(drafts.find((d) => d.id === 'draft-3')).toBeDefined();
    });

    it('should correctly delete draft message', () => {
      const initialCount = store.getDraftMessages().length;

      store.deleteDraftMessage('draft-2');

      expect(store.getDraftMessages()).toHaveLength(initialCount - 1);
    });

    it('should handle non-existent message ID', () => {
      const initialCount = store.getDraftMessages().length;

      store.deleteDraftMessage('non-existent');

      // should not change array length
      expect(store.getDraftMessages()).toHaveLength(initialCount);
    });

    it('should be able to delete first message', () => {
      store.deleteDraftMessage('draft-1');

      const drafts = store.getDraftMessages();
      expect(drafts).toHaveLength(2);
      expect(drafts[0].id).toBe('draft-2');
    });

    it('should be able to delete last message', () => {
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

    it('should update draft message', () => {
      const updated = store.updateDraftMessage('draft-1', {
        content: 'Updated content'
      });

      expect(updated).toBeDefined();
      expect(updated?.content).toBe('Updated content');
    });

    it('should preserve unchanged properties', () => {
      store.updateDraftMessage('draft-1', {
        placeholder: 'Loading...'
      });

      const draft = store.getDraftMessages()[0];
      expect(draft.content).toBe('Original content');
      expect(draft.placeholder).toBe('Loading...');
      expect(draft.role).toBe(ChatMessageRole.USER);
    });

    it('should correctly update draft message', () => {
      const updated = store.updateDraftMessage('draft-1', {
        content: 'Updated'
      });

      expect(updated).toBeDefined();
      expect(updated?.content).toBe('Updated');
    });

    it('should return undefined for non-existent message', () => {
      const result = store.updateDraftMessage('non-existent', {
        content: 'New content'
      });

      expect(result).toBeUndefined();
    });

    it('should not change draft list when message does not exist', () => {
      const initialCount = store.getDraftMessages().length;

      store.updateDraftMessage('non-existent', {
        content: 'New content'
      });

      expect(store.getDraftMessages()).toHaveLength(initialCount);
    });

    it('should support updating multiple properties', () => {
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

    it('should clear all draft messages', () => {
      store.resetDraftMessages();

      expect(store.getDraftMessages()).toEqual([]);
    });

    it('should replace draft messages with new messages', () => {
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

    it('should correctly reset draft messages', () => {
      expect(store.getDraftMessages().length).toBeGreaterThan(0);

      store.resetDraftMessages();

      expect(store.getDraftMessages()).toHaveLength(0);
    });

    it('should convert new messages to ChatMessage instance', () => {
      const plainObjects = [
        { id: 'msg-1', content: 'Message 1' } as unknown as ChatMessage<string>
      ];

      store.resetDraftMessages(plainObjects);

      const drafts = store.getDraftMessages();
      expect(drafts[0]).toBeInstanceOf(ChatMessage);
    });

    it('should accept empty array', () => {
      store.resetDraftMessages([]);

      expect(store.getDraftMessages()).toEqual([]);
    });
  });

  describe('getDarftMessageById', () => {
    beforeEach(() => {
      store.addDraftMessage({ id: 'draft-1', content: 'Draft 1' });
      store.addDraftMessage({ id: 'draft-2', content: 'Draft 2' });
    });

    it('should find draft message by ID', () => {
      const draft = store.getDarftMessageById('draft-1');

      expect(draft).toBeDefined();
      expect(draft?.id).toBe('draft-1');
      expect(draft?.content).toBe('Draft 1');
    });

    it('should return null for non-existent ID', () => {
      const draft = store.getDarftMessageById('non-existent');

      expect(draft).toBeNull();
    });

    it('should return correct message instance', () => {
      const draft = store.getDarftMessageById('draft-2');

      expect(draft).toBeInstanceOf(ChatMessage);
      expect(draft?.content).toBe('Draft 2');
    });
  });

  describe('getFirstDraftMessage', () => {
    it('should return null when list is empty', () => {
      expect(store.getFirstDraftMessage()).toBeNull();
    });

    it('should return last added message in STACK mode', () => {
      store['draftMode'] = DraftMode.STACK;

      store.addDraftMessage({ id: 'draft-1', content: 'First' });
      store.addDraftMessage({ id: 'draft-2', content: 'Second' });
      store.addDraftMessage({ id: 'draft-3', content: 'Third' });

      const first = store.getFirstDraftMessage();
      expect(first?.id).toBe('draft-3');
      expect(first?.content).toBe('Third');
    });

    it('should return earliest added message in QUEUE mode', () => {
      store['draftMode'] = DraftMode.QUEUE;

      store.addDraftMessage({ id: 'draft-1', content: 'First' });
      store.addDraftMessage({ id: 'draft-2', content: 'Second' });
      store.addDraftMessage({ id: 'draft-3', content: 'Third' });

      // QUEUE mode: new messages are appended to the end, getFirstDraftMessage returns at(0)
      // 所以最早添加的消息（First）会在第一个位置
      const first = store.getFirstDraftMessage();
      expect(first?.id).toBe('draft-1');
      expect(first?.content).toBe('First');
    });
  });

  describe('shiftFirstDraftMessage', () => {
    it('should return null when list is empty', () => {
      expect(store.shiftFirstDraftMessage()).toBeNull();
    });

    it('should remove and return last message in STACK mode', () => {
      store['draftMode'] = DraftMode.STACK;

      store.addDraftMessage({ id: 'draft-1', content: 'First' });
      store.addDraftMessage({ id: 'draft-2', content: 'Second' });
      store.addDraftMessage({ id: 'draft-3', content: 'Third' });

      // STACK: array is [First, Second, Third]
      // getFirstDraftMessage returns at(-1) = Third
      // sliceDraftMessages returns slice(0, -1) = [First, Second] (remove last Third)
      const shifted = store.shiftFirstDraftMessage();

      expect(shifted?.id).toBe('draft-3'); // return last
      expect(store.getDraftMessages()).toHaveLength(2);
      // removed should be Third (last)
      expect(store.getDraftMessages().every((d) => d.id !== 'draft-3')).toBe(
        true
      );
      // First is still in the list
      expect(store.getDraftMessages().some((d) => d.id === 'draft-1')).toBe(
        true
      );
    });

    it('should remove and return earliest added message in QUEUE mode', () => {
      store['draftMode'] = DraftMode.QUEUE;

      store.addDraftMessage({ id: 'draft-1', content: 'First' });
      store.addDraftMessage({ id: 'draft-2', content: 'Second' });
      store.addDraftMessage({ id: 'draft-3', content: 'Third' });

      // QUEUE: array is [First, Second, Third] (new messages are appended to the end)
      // getFirstDraftMessage returns at(0) = First
      // sliceDraftMessages returns slice(1) = [Second, Third] (remove first First)
      const shifted = store.shiftFirstDraftMessage();

      expect(shifted?.id).toBe('draft-1'); // return first (earliest added)
      expect(store.getDraftMessages()).toHaveLength(2);
      // removed should be First (first, earliest added)
      expect(store.getDraftMessages().every((d) => d.id !== 'draft-1')).toBe(
        true
      );
      // Third is still in the list
      expect(store.getDraftMessages().some((d) => d.id === 'draft-3')).toBe(
        true
      );
    });

    it('should correctly remove draft message', () => {
      store.addDraftMessage({ content: 'Test' });
      const initialCount = store.getDraftMessages().length;

      store.shiftFirstDraftMessage();

      expect(store.getDraftMessages()).toHaveLength(initialCount - 1);
    });

    it('should be able to shift continuously until list is empty', () => {
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
    it('should update disabledSend state', () => {
      store.changeDisabledSend(true);

      expect(store['state'].disabledSend).toBe(true);
    });

    it('should be able to switch from true to false', () => {
      store.changeDisabledSend(true);
      store.changeDisabledSend(false);

      expect(store['state'].disabledSend).toBe(false);
    });

    it('should correctly set disabledSend state', () => {
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

    it('should return draft message if message is in draft', () => {
      const message = new ChatMessage<string>({ id: 'draft-1' });
      const ready = store.getReadySendMessage(message);

      expect(ready?.id).toBe('draft-1');
      expect(ready?.content).toBe('Draft 1');
    });

    it('should return history message if message is not in draft', () => {
      const message = new ChatMessage<string>({ id: 'msg-1' });
      const ready = store.getReadySendMessage(message);

      expect(ready?.id).toBe('msg-1');
      expect(ready?.content).toBe('Message 1');
    });

    it('should return and remove first draft message if no message is specified', () => {
      const draftsCountBefore = store.getDraftMessages().length;
      const ready = store.getReadySendMessage();

      expect(ready).not.toBeNull();
      expect(store.getDraftMessages().length).toBe(draftsCountBefore - 1);
    });

    it('should return null if no draft messages and no message is specified', () => {
      store.resetDraftMessages();

      const ready = store.getReadySendMessage();

      expect(ready).toBeNull();
    });

    it('should handle invalid message object', () => {
      const invalidMessage = {} as ChatMessage<string>;
      const ready = store.getReadySendMessage(invalidMessage);

      // should fallback to shift first draft
      expect(ready).not.toBeNull();
    });

    it('should handle message without ID', () => {
      const messageWithoutId = new ChatMessage({ content: 'No ID' });
      const ready = store.getReadySendMessage(messageWithoutId);

      // should fallback to shift first draft
      expect(ready).not.toBeNull();
    });
  });

  describe('inherited methods', () => {
    it('should support addMessage', () => {
      store.addMessage({ content: 'Test message' });

      const messages = store.getMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('Test message');
    });

    it('should support updateMessage', () => {
      store.addMessage({ id: 'msg-1', content: 'Original' });
      store.updateMessage('msg-1', { content: 'Updated' });

      const message = store.getMessageById('msg-1');
      expect(message?.content).toBe('Updated');
    });

    it('should support deleteMessage', () => {
      store.addMessage({ id: 'msg-1', content: 'To delete' });
      store.deleteMessage('msg-1');

      expect(store.getMessages()).toHaveLength(0);
    });

    it('should support getMessages', () => {
      store.addMessage({ content: 'Message 1' });
      store.addMessage({ content: 'Message 2' });

      expect(store.getMessages()).toHaveLength(2);
    });
  });

  describe('state management', () => {
    it('should correctly manage draft message status', () => {
      expect(store.getDraftMessages()).toHaveLength(0);

      store.addDraftMessage({ content: 'Draft' });
      expect(store.getDraftMessages()).toHaveLength(1);

      store.resetDraftMessages();
      expect(store.getDraftMessages()).toHaveLength(0);
    });

    it('should correctly manage history and draft messages', () => {
      store.addMessage({ content: 'History message' });
      store.addDraftMessage({ content: 'Draft message' });

      expect(store.getMessages()).toHaveLength(1);
      expect(store.getDraftMessages()).toHaveLength(1);
    });

    it('should independently manage different types of messages', () => {
      store.addMessage({ id: 'msg-1', content: 'Message 1' });
      store.addDraftMessage({ id: 'draft-1', content: 'Draft 1' });

      expect(store.getMessageById('msg-1')).toBeDefined();
      expect(store.getDarftMessageById('draft-1')).toBeDefined();

      // history message does not contain draft
      expect(store.getMessageById('draft-1')).toBeUndefined();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle large number of draft messages', () => {
      for (let i = 0; i < 1000; i++) {
        store.addDraftMessage({ id: `draft-${i}`, content: `Draft ${i}` });
      }

      expect(store.getDraftMessages()).toHaveLength(1000);
      expect(store.getFirstDraftMessage()).not.toBeNull();
    });

    it('should handle rapid consecutive operations', () => {
      for (let i = 0; i < 100; i++) {
        store.addDraftMessage({ id: `draft-${i}` });
        store.deleteDraftMessage(`draft-${i}`);
      }

      expect(store.getDraftMessages()).toHaveLength(0);
    });

    it('should handle empty string ID', () => {
      store.addDraftMessage({ id: '', content: 'Empty ID' });

      const draft = store.getDarftMessageById('');
      expect(draft).not.toBeNull();
    });

    it('should handle special characters content', () => {
      const specialContent = '🚀 Test\n\t"quotes" & symbols!';
      store.addDraftMessage({ content: specialContent });

      const draft = store.getFirstDraftMessage();
      expect(draft?.content).toBe(specialContent);
    });

    it('should switch between STACK and QUEUE modes normally', () => {
      store['draftMode'] = DraftMode.STACK;
      store.addDraftMessage({ id: 'stack-1', content: 'Stack 1' });

      store['draftMode'] = DraftMode.QUEUE;
      store.addDraftMessage({ id: 'queue-1', content: 'Queue 1' });

      // should be able to get messages normally
      expect(store.getDraftMessages()).toHaveLength(2);
    });
  });

  describe('real-world scenarios', () => {
    it('should be able to simulate user input draft and send', () => {
      // user input first message
      store.addDraftMessage({ content: 'Hello' });
      expect(store.getDraftMessages()).toHaveLength(1);

      // user continue input
      const firstDraft = store.getFirstDraftMessage();
      store.updateDraftMessage(firstDraft!.id!, {
        content: 'Hello, how are you?'
      });

      // prepare to send
      const readyMessage = store.getReadySendMessage();
      expect(readyMessage?.content).toBe('Hello, how are you?');
      expect(store.getDraftMessages()).toHaveLength(0);

      // add to history messages
      store.addMessage(readyMessage!);
      expect(store.getMessages()).toHaveLength(1);
    });

    it('should be able to handle multiple draft message queue', () => {
      // user quickly input multiple messages
      store.addDraftMessage({ id: 'msg-1', content: 'Message 1' });
      store.addDraftMessage({ id: 'msg-2', content: 'Message 2' });
      store.addDraftMessage({ id: 'msg-3', content: 'Message 3' });

      const initialDraftCount = store.getDraftMessages().length;
      expect(initialDraftCount).toBe(3);

      // use getReadySendMessage to get messages to send
      // this method internally calls shiftFirstDraftMessage
      const msg1 = store.getReadySendMessage();
      const msg2 = store.getReadySendMessage();
      const msg3 = store.getReadySendMessage();

      // all messages should be extracted
      expect(msg1).not.toBeNull();
      expect(msg2).not.toBeNull();
      expect(msg3).not.toBeNull();

      // draft list should be empty
      expect(store.getDraftMessages()).toHaveLength(0);

      // fourth call should return null (no more drafts)
      const msg4 = store.getReadySendMessage();
      expect(msg4).toBeNull();

      // add the retrieved messages to history
      if (msg1) store.addMessage({ ...msg1, status: MessageStatus.SENT });
      if (msg2) store.addMessage({ ...msg2, status: MessageStatus.SENT });
      if (msg3) store.addMessage({ ...msg3, status: MessageStatus.SENT });

      // history messages should at least have 3
      expect(store.getMessages().length).toBeGreaterThanOrEqual(3);
    });

    it('should be able to handle sending disabled state', () => {
      // sending message, disable sending
      store.changeDisabledSend(true);
      expect(store['state'].disabledSend).toBe(true);

      // user can still input draft
      store.addDraftMessage({ content: 'Draft during sending' });
      expect(store.getDraftMessages()).toHaveLength(1);

      // sending completed, enable sending
      store.changeDisabledSend(false);
      expect(store['state'].disabledSend).toBe(false);
    });

    it('should be able to handle retry failed message', () => {
      // add failed message
      store.addMessage({
        id: 'failed-msg',
        content: 'Failed message',
        status: MessageStatus.FAILED,
        error: new Error('Network error')
      });

      // retry failed message as draft
      const failedMsg = store.getMessageById('failed-msg');
      store.addDraftMessage({
        ...failedMsg,
        status: MessageStatus.DRAFT,
        error: null
      });

      expect(store.getDraftMessages()).toHaveLength(1);
      expect(store.getDraftMessages()[0].status).toBe(MessageStatus.DRAFT);
    });

    it('should be able to handle draft save and restore', () => {
      // user input draft
      store.addDraftMessage({ id: 'draft-1', content: 'Unsaved draft' });

      // save draft
      const savedDrafts = store.getDraftMessages();
      expect(savedDrafts).toHaveLength(1);

      // clear (simulate page refresh)
      store.resetDraftMessages();
      expect(store.getDraftMessages()).toHaveLength(0);

      // restore draft
      store.resetDraftMessages(savedDrafts);
      expect(store.getDraftMessages()).toHaveLength(1);
      expect(store.getDraftMessages()[0].content).toBe('Unsaved draft');
    });
  });
});
