import { useStore } from '@brain-toolkit/react-kit';
import { Button, Input } from 'antd';
import { useCallback, useMemo } from 'react';
import type { FocusBarBridgeInterface } from '@/base/focusBar/interface/FocusBarBridgeInterface';

const { TextArea } = Input;

export interface FocusBarProps {
  bridge: FocusBarBridgeInterface;
}

export function FocusBar({ bridge }: FocusBarProps) {
  const messagesStore = bridge.messageSender.messages;
  const messages = useStore(messagesStore, (state) => state.messages);
  const inputText = useStore(bridge.store, (state) => state.inputText);
  const disabledSend = useStore(bridge.store, (state) => state.disabledSend);

  const lastMessage = useMemo(() => messages.at(-1), [messages]);

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
          disabled={lastMessage?.loading}
          value={inputText}
          onKeyDown={handleKeyDown}
          onChange={(e) => bridge.onChangeText(e.target.value)}
        />
      </div>
      <div data-testid="FocusBarFooter">
        <Button
          loading={lastMessage?.loading}
          disabled={disabledSend}
          data-testid="FocusBar-Button-Send"
          onClick={() => bridge.send()}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
