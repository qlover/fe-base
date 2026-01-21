import { useFactory } from '@brain-toolkit/react-kit';
import { chatMessageI18n } from '@config/i18n/chatMessageI18n';
import {
  ChatMessageStore,
  ChatSenderStrategy,
  MessageSenderExecutor,
  SendFailureStrategy
} from '@qlover/corekit-bridge';
import { Aborter, AborterPlugin } from '@qlover/fe-corekit';
import { useState } from 'react';
import { logger } from '@/core/globals';
import { ChatMessageBridge } from '@/uikit/components/chatMessage/ChatMessageBridge';
import { ChatRoot } from '@/uikit/components/chatMessage/ChatRoot';
import { MessageApi } from '@/uikit/components/chatMessage/MessageApi';
import { MessageBaseList } from '@/uikit/components/MessageBaseList';
import { useI18nInterface } from '@/uikit/hooks/useI18nInterface';
import { useIOC } from '@/uikit/hooks/useIOC';
import type { ChatMessage, MessageSenderOptions } from '@qlover/corekit-bridge';
import type { AborterConfig } from '@qlover/fe-corekit';

// TODO: message sender getconfig type not match, need to fix
function toAborterConfig<T>(
  parameters: unknown | MessageSenderOptions<ChatMessage<T>>
): any {
  const options = parameters as MessageSenderOptions<ChatMessage<T>>;
  return {
    abortId: options.currentMessage.id,
    onAborted: options.gatewayOptions?.onAborted,
    abortTimeout: options.gatewayOptions?.timeout,
    signal: options.gatewayOptions?.signal
  } as AborterConfig;
}

export default function MessagePage() {
  const tt = useI18nInterface(chatMessageI18n);
  const messagesStore = useFactory(ChatMessageStore<string>);
  const messageApi = useFactory(MessageApi, messagesStore);
  const aborter = useIOC(Aborter);

  const [bridge] = useState(() => {
    const messageBridge = new ChatMessageBridge<string>(messagesStore, {
      gateway: messageApi,
      logger: logger,
      aborter: aborter,
      senderName: 'ChatSender',
      gatewayOptions: { stream: true },
      executor: new MessageSenderExecutor()
    });
    return messageBridge
      .use(
        new AborterPlugin<
          AborterConfig & MessageSenderOptions<ChatMessage<string>>
        >({
          aborter: aborter,
          getConfig: toAborterConfig
        })
      )
      .use(new ChatSenderStrategy(SendFailureStrategy.KEEP_FAILED, logger));
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
