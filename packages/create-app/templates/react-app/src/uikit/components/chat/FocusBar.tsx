import { useStore } from '@brain-toolkit/react-kit';
import { Button, Input } from 'antd';
import { useCallback, useMemo } from 'react';
import { MessageStatus } from '@/base/focusBar/impl/MessagesStore';
import type {
  ChatMessageBridgeInterface,
  ChatMessageStoreStateInterface
} from './chatMessage/interface';

const { TextArea } = Input;

export interface FocusBarProps {
  bridge: ChatMessageBridgeInterface<unknown>;
}

const selectors = {
  historyMessages: (state: ChatMessageStoreStateInterface<unknown>) =>
    state.messages,
  draftMessages: (state: ChatMessageStoreStateInterface<unknown>) =>
    state.draftMessages
};
export function FocusBar({ bridge }: FocusBarProps) {
  const messagesStore = bridge.getMessageStore();
  const historyMessages = useStore(messagesStore, selectors.historyMessages);
  const draftMessages = useStore(messagesStore, selectors.draftMessages);
  const disabledSend = useStore(messagesStore, (state) => state.disabledSend);

  const firstDraft = useMemo(
    () => messagesStore.getFirstDraftMessage(),
    [draftMessages]
  );

  const sendingMessage = useMemo(
    () =>
      historyMessages.find((msg) => msg.status === MessageStatus.SENDING) ||
      null,
    [historyMessages]
  );

  const inputText = (firstDraft?.content as string) ?? '';
  const loading = sendingMessage?.loading || firstDraft?.loading;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl+Enter 发送
      if (e.key === 'Enter' && e.ctrlKey) {
        if (!disabledSend && !firstDraft?.loading) {
          bridge.send();
        }
      }
    },
    [disabledSend, firstDraft, bridge]
  );

  return (
    <div data-testid="FocusBar">
      <div data-testid="FocusBarMain">
        <TextArea
          ref={bridge.setRef.bind(bridge)}
          autoFocus
          value={inputText}
          onKeyDown={handleKeyDown}
          onChange={(e) => bridge.onChangeContent(e.target.value)}
        />
      </div>
      <div data-testid="FocusBarFooter" className="flex gap-2">
        <Button
          disabled={disabledSend}
          data-testid="FocusBar-Button-Send"
          onClick={() => (loading ? bridge.stop() : bridge.send())}
        >
          {loading ? 'Stop' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
