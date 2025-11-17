import { useStore } from '@brain-toolkit/react-kit';
import { Button, Input } from 'antd';
import { useCallback, useMemo } from 'react';
import type { ChatMessageBridgeInterface } from './chatMessage/interface';

const { TextArea } = Input;

export interface FocusBarProps {
  bridge: ChatMessageBridgeInterface<unknown>;
}

export function FocusBar({ bridge }: FocusBarProps) {
  const messagesStore = bridge.getMessageStore();
  const messages = useStore(messagesStore, (state) => state.messages);
  const message = useStore(messagesStore, (state) => state.currentMessage);

  const inputText = message?.content as string;

  const disabledSend = useStore(messagesStore, (state) => state.disabledSend);

  const lastMessage = useMemo(() => messages.at(-1), [messages]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl+Enter 发送
      if (e.key === 'Enter' && e.ctrlKey) {
        if (!disabledSend && !lastMessage?.loading) {
          bridge.sendUser();
        }
      }
    },
    [disabledSend, lastMessage, bridge]
  );

  return (
    <div data-testid="FocusBar">
      <div data-testid="FocusBarMain">
        <TextArea
          ref={bridge.setRef.bind(bridge)}
          autoFocus
          disabled={lastMessage?.loading}
          value={inputText}
          onKeyDown={handleKeyDown}
          onChange={(e) => bridge.onChangeContent(e.target.value)}
        />
      </div>
      <div data-testid="FocusBarFooter">
        <Button
          loading={lastMessage?.loading}
          disabled={disabledSend}
          data-testid="FocusBar-Button-Send"
          onClick={() => bridge.sendUser()}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
