import { useFactory } from '@brain-toolkit/react-kit';
import {
  ChatMessageStore,
  ChatSenderStrategy,
  SendFailureStrategy
} from '@qlover/corekit-bridge';
import { useState } from 'react';
import { logger } from '@/core/globals';
import { ChatMessageBridge } from './ChatMessageBridge';
import { FocusBar } from './FocusBar';
import { MessageApi } from './MessageApi';
import { MessagesList } from './messagesList/MessagesList';

export function ChatRoot() {
  const messagesStore = useFactory(ChatMessageStore<string>);
  const messageApi = useFactory(MessageApi, messagesStore);

  const [bridge] = useState(() => {
    return (
      new ChatMessageBridge<string>(messagesStore, {
        gateway: messageApi,
        logger: logger,
        senderName: 'ChatSender',
        gatewayOptions: { stream: true }
      })
        // 发送策略
        .use(new ChatSenderStrategy(SendFailureStrategy.KEEP_FAILED, logger))
    );
  });

  return (
    <div data-testid="ChatRoot">
      <MessagesList bridge={bridge} />
      <FocusBar bridge={bridge} />
    </div>
  );
}
