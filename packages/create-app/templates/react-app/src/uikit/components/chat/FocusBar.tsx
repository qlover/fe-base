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
  const draftMessages = useStore(
    messagesStore,
    (state) => state.draftMessages
  );
  const disabledSend = useStore(messagesStore, (state) => state.disabledSend);
  const lastMessage = useMemo(() => messages.at(-1), [messages]);
  const lastDraft = useMemo(() => draftMessages.at(-1), [draftMessages]);

  const inputText = (lastDraft?.content as string) ?? '';
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
