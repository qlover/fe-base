import { useStore } from '@brain-toolkit/react-kit';
import { Button, Input } from 'antd';
import { useCallback, useMemo } from 'react';
import type { ChatMessageBridgeInterface } from './chatMessage/interface';

const { TextArea } = Input;

export interface FocusBarProps {
  bridge: ChatMessageBridgeInterface<string>;
}

export function FocusBar({ bridge }: FocusBarProps) {
  const messagesStore = bridge.getMessageStore();

  const {
    messages: historyMessages,
    draftMessages,
    disabledSend,
    streaming
  } = useStore(messagesStore);

  const firstDraft = useMemo(
    () => bridge.getFirstDraftMessage(draftMessages),
    [bridge, draftMessages]
  );

  const sendingMessage = useMemo(
    () => bridge.getSendingMessage(historyMessages),
    [bridge, historyMessages]
  );

  const disabledSendButton = useMemo(
    () => bridge.getDisabledSend({ firstDraft, sendingMessage, disabledSend }),
    [bridge, firstDraft, sendingMessage, disabledSend]
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
