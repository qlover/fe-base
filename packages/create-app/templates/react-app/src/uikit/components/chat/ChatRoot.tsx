import { useFactory } from '@brain-toolkit/react-kit';
import { useState } from 'react';
import { SendFailureStrategy } from '@/base/focusBar/impl/SenderStrategyPlugin';
import { ChatMessageBridge } from './chatMessage/ChatMessageBridge';
import { ChatMessageStore } from './chatMessage/ChatMessageStore';
import { ChatSenderStrategy } from './chatMessage/ChatSenderStrategy';
import { FocusBar } from './FocusBar';
import { MessageApi } from './MessageApi';
import { MessagesList } from './messagesList/MessagesList';
import type { ChatMessageStoreStateInterface } from './chatMessage/interface';

function createChatMessageState(): ChatMessageStoreStateInterface<unknown> {
  return {
    messages: [],
    currentMessage: null,
    disabledSend: false
  };
}

export function ChatRoot() {
  const messagesStore = useFactory(ChatMessageStore, createChatMessageState);
  const messageApi = useFactory(MessageApi, messagesStore);

  const [bridge] = useState(() => {
    return (
      new ChatMessageBridge(messagesStore, {
        gateway: messageApi
      })
        // 发送策略
        .use(new ChatSenderStrategy(SendFailureStrategy.KEEP_FAILED))
    );
  });

  return (
    <div data-testid="ChatRoot">
      <MessagesList bridge={bridge} />
      <FocusBar bridge={bridge} />
    </div>
  );
}
