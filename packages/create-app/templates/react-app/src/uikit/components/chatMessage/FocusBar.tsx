import { SendOutlined, StopOutlined } from '@ant-design/icons';
import { useStore } from '@brain-toolkit/react-kit';
import { Button, Input } from 'antd';
import { useCallback, useMemo } from 'react';
import type { ChatMessageI18nInterface } from '@config/i18n/chatMessageI18n';
import type { ChatMessageBridgeInterface } from '@qlover/corekit-bridge';

const { TextArea } = Input;

export interface FocusBarProps {
  bridge: ChatMessageBridgeInterface<string>;
  tt: ChatMessageI18nInterface;
}

export function FocusBar({ bridge, tt }: FocusBarProps) {
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
      // Ctrl+Enter to send
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        if (!disabledSendButton) {
          bridge.send();
        }
      }
    },
    [bridge, disabledSendButton]
  );

  const handleSend = useCallback(() => {
    if (!disabledSendButton) {
      bridge.send();
      return;
    }
    bridge.stop();
  }, [bridge, disabledSendButton]);

  const buttonText = streaming ? tt.stop : loading ? tt.loading : tt.send;

  const buttonIcon = streaming ? (
    <StopOutlined />
  ) : loading ? null : (
    <SendOutlined />
  );

  return (
    <div
      data-testid="FocusBar"
      className="border-t border-primary p-4 bg-secondary"
    >
      <div data-testid="FocusBarMain" className="mb-2">
        <TextArea
          ref={bridge.setRef.bind(bridge)}
          autoFocus
          value={inputText}
          onKeyDown={handleKeyDown}
          onChange={(e) => bridge.onChangeContent(e.target.value)}
          placeholder={tt.inputPlaceholder}
          autoSize={{ minRows: 2, maxRows: 6 }}
          className="resize-none"
          disabled={loading && !streaming}
        />
      </div>

      <div data-testid="FocusBarFooter" className="flex justify-end gap-2">
        <Button
          type="primary"
          icon={buttonIcon}
          loading={loading && !streaming}
          danger={streaming}
          data-testid="FocusBar-Button-Send"
          onClick={handleSend}
          disabled={!inputText.trim() && !streaming}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
