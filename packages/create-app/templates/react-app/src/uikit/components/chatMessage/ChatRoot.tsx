import type { ChatMessageI18nInterface } from '@config/i18n/chatMessageI18n';
import { FocusBar } from './FocusBar';
import { MessagesList } from './MessagesList';
import type { ChatMessageBridge } from './ChatMessageBridge';

export interface ChatRootProps {
  bridge: ChatMessageBridge<string>;
  tt: ChatMessageI18nInterface;
}

export function ChatRoot({ bridge, tt }: ChatRootProps) {
  return (
    <div
      data-testid="ChatRoot"
      className="flex flex-col h-full max-w-5xl mx-auto bg-primary rounded-lg shadow-lg overflow-hidden"
    >
      <MessagesList bridge={bridge} tt={tt} />
      <FocusBar bridge={bridge} tt={tt} />
    </div>
  );
}
