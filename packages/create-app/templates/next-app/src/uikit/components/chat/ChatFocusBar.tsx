import { SendOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { useCallback, useRef } from 'react';
import { useStore } from '../../hook/useStore';
import type {
  FocusBarActionInterface,
  FocusBarStateInterface
} from './FocusBarActionInterface';

export function ChatFocusBar({
  focusBarAction
}: {
  focusBarAction: FocusBarActionInterface<FocusBarStateInterface>;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { inputValue } = useStore(focusBarAction);
  const sendState = useStore(focusBarAction, (state) => state.sendState);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      focusBarAction.setInputValue(e.target.value);
    },
    [focusBarAction]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        focusBarAction.sendMessage(inputValue);
      }
    },
    [focusBarAction, inputValue]
  );

  const sending = sendState.loading;

  return (
    <div
      data-testid="ChatFocusBarInput"
      className="flex items-end gap-2 p-4 bg-elevated border-t border-c-border"
    >
      <Input.TextArea
        ref={inputRef}
        disabled={sending}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        rows={1}
      />
      <Button
        data-testid="ChatFocusBarSendButton"
        onClick={() => {
          focusBarAction.sendMessage(inputValue);
        }}
        type="primary"
        className="flex items-center justify-center !h-10 !w-10 !rounded-full !bg-c-brand !text-white hover:!bg-c-brand-hover transition-colors"
        icon={<SendOutlined />}
        loading={sending}
        disabled={sending}
      />
    </div>
  );
}
