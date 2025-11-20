import { useStore } from '@brain-toolkit/react-kit';
import { Button, Input } from 'antd';
import { useCallback, useMemo } from 'react';
import type {
  ChatMessageBridgeInterface,
  ChatMessageStoreStateInterface
} from './chatMessage/interface';

const { TextArea } = Input;

export interface FocusBarProps {
  bridge: ChatMessageBridgeInterface<string>;
}

const selectors = {
  historyMessages: (state: ChatMessageStoreStateInterface<string>) =>
    state.messages,
  draftMessages: (state: ChatMessageStoreStateInterface<string>) =>
    state.draftMessages,
  streaming: (state: ChatMessageStoreStateInterface<string>) => state.streaming
};
export function FocusBar({ bridge }: FocusBarProps) {
  const messagesStore = bridge.getMessageStore();
  const historyMessages = useStore(messagesStore, selectors.historyMessages);
  const draftMessages = useStore(messagesStore, selectors.draftMessages);
  const disabledSend = useStore(messagesStore, (state) => state.disabledSend);
  const streaming = useStore(messagesStore, selectors.streaming);

  const firstDraft = useMemo(
    () => bridge.getFirstDraftMessage(draftMessages),
    [draftMessages, bridge]
  );

  const sendingMessage = useMemo(
    () => bridge.getSendingMessage(historyMessages),
    [historyMessages, bridge]
  );

  const disabledSendButton = useMemo(
    () => bridge.getDisabledSend({ firstDraft, sendingMessage, disabledSend }),
    [firstDraft, sendingMessage, disabledSend]
  );

  const inputText = firstDraft?.content ?? '';
  const loading = sendingMessage?.loading || firstDraft?.loading;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl+Enter 发送
      if (e.key === 'Enter' && e.ctrlKey) {
        bridge.send();
      }
    },
    [bridge]
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
          disabled={loading}
          data-testid="FocusBar-Button-Send"
          onClick={() => {
            if (!disabledSendButton) {
              bridge.send();
              return;
            }

            bridge.stop();
          }}
        >
          {streaming ? 'stop' : loading ? 'loading' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
