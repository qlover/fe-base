import { useStore } from '@brain-toolkit/react-kit';
import { Button, Input } from 'antd';
import { useMemo } from 'react';
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

  const lastMessage = useMemo(() => {
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }, [messages]);

  const disabledButton = useMemo(() => {
    return lastMessage?.loading || bridge.store.getDisabledSend();
  }, [disabledSend, inputText, lastMessage]);

  return (
    <div data-testid="FocusBar">
      <div data-testid="FocusBarHeader">
        <pre>{JSON.stringify(messages, null, 2)}</pre>
      </div>
      <div data-testid="FocusBarMain">
        <TextArea
          disabled={lastMessage?.loading}
          value={inputText}
          onChange={(e) => bridge.onChangeText(e.target.value)}
        />
      </div>
      <div data-testid="FocusBarFooter">
        <Button
          loading={lastMessage?.loading}
          disabled={disabledButton}
          data-testid="FocusBar-Button-Send"
          onClick={() => bridge.send()}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
