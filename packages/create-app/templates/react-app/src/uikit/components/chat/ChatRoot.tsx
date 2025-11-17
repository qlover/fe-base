import { useFactory } from '@brain-toolkit/react-kit';
import { useState } from 'react';
import { FocusBarStore } from '@/base/focusBar/impl/FocusBarStore';
import { MessageSender } from '@/base/focusBar/impl/MessageSender';
import { MessagesStore } from '@/base/focusBar/impl/MessagesStore';
import {
  SenderStrategyPlugin,
  SendFailureStrategy
} from '@/base/focusBar/impl/SenderStrategyPlugin';
import type { FocusBarStateInterface } from '@/base/focusBar/interface/FocusBarStoreInterface';
import type {
  MessageInterface,
  MessagesStateInterface
} from '@/base/focusBar/interface/MessagesStoreInterface';
import { FocusBar } from './FocusBar';
import { FocusBarBridge } from './FocusBarBridge';
import { MessageApi } from './MessageApi';
import { MessagesList } from './messagesList/MessagesList';

function createFocusBarState(): FocusBarStateInterface {
  return {
    inputText: '',
    disabledSend: false
  };
}

function createMessagesState(): MessagesStateInterface<
  MessageInterface<unknown>
> {
  return {
    messages: []
  };
}

export function ChatRoot() {
  const focusBarStore = useFactory(FocusBarStore, createFocusBarState);
  const messagesStore = useFactory(MessagesStore, createMessagesState);
  const messageApi = useFactory(MessageApi);

  const [messageSender] = useState(() => {
    return new MessageSender(messagesStore, {
      gateway: messageApi
    }).use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED));
  });

  const bridge = useFactory(FocusBarBridge, focusBarStore, messageSender);

  return (
    <div data-testid="ChatRoot">
      <MessagesList bridge={bridge} />
      <FocusBar bridge={bridge} />
    </div>
  );
}
