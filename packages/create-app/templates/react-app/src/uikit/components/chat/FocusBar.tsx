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
  const disabledSend = useStore(messagesStore, (state) => state.disabledSend);
  const lastMessage = useMemo(() => messages.at(-1), [messages]);

  const inputText = message?.content as string;
  const loading = lastMessage?.loading;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl+Enter 发送
      if (e.key === 'Enter' && e.ctrlKey) {
        if (!disabledSend && !lastMessage?.loading) {
          bridge.send();
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
          disabled={loading}
          value={inputText}
          onKeyDown={handleKeyDown}
          onChange={(e) => bridge.onChangeContent(e.target.value)}
        />
      </div>
      <div data-testid="FocusBarFooter" className="flex gap-2">
        <Button
          loading={loading}
          disabled={disabledSend}
          data-testid="FocusBar-Button-Send"
          onClick={() => bridge.send()}
        >
          Send
        </Button>

        <Button
          loading={loading}
          disabled={disabledSend}
          data-testid="FocusBar-Button-SendStream"
          onClick={() => bridge.sendStream()}
        >
          Send stream
        </Button>
      </div>
    </div>
  );
}
