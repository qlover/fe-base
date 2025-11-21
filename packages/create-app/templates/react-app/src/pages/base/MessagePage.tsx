import { useFactory } from '@brain-toolkit/react-kit';
import { chatMessageI18n } from '@config/i18n/chatMessageI18n';
import {
  ChatMessageStore,
  ChatSenderStrategy,
  SendFailureStrategy
} from '@qlover/corekit-bridge';
import { useState } from 'react';
import { logger } from '@/core/globals';
import { ChatMessageBridge } from '@/uikit/components/chatMessage/ChatMessageBridge';
import { ChatRoot } from '@/uikit/components/chatMessage/ChatRoot';
import { MessageApi } from '@/uikit/components/chatMessage/MessageApi';
import { MessageBaseList } from '@/uikit/components/MessageBaseList';
import { useI18nInterface } from '@/uikit/hooks/useI18nInterface';

export default function MessagePage() {
  const tt = useI18nInterface(chatMessageI18n);
  const messagesStore = useFactory(ChatMessageStore<string>);
  const messageApi = useFactory(MessageApi, messagesStore);

  const [bridge] = useState(() => {
    return new ChatMessageBridge<string>(messagesStore, {
      gateway: messageApi,
      logger: logger,
      senderName: 'ChatSender',
      gatewayOptions: { stream: true }
    }).use(new ChatSenderStrategy(SendFailureStrategy.KEEP_FAILED, logger));
  });

  return (
    <div
      data-testid="MessagePage"
      className="min-h-screen bg-primary py-8 px-4 sm:px-6 lg:px-8"
    >
      <MessageBaseList />

      <ChatRoot bridge={bridge} tt={tt} />
    </div>
  );
}
