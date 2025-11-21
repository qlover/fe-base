import { useStore } from '@brain-toolkit/react-kit';
import { useCallback, type ComponentType } from 'react';
import type { ChatMessageI18nInterface } from '@config/i18n/chatMessageI18n';
import { MessageItem, type MessageItemProps } from './MessageItem';
import type {
  ChatMessage,
  ChatMessageBridgeInterface
} from '@qlover/corekit-bridge';

export type MessageComponentType<
  T,
  MessageType extends ChatMessage<T>
> = ComponentType<MessageItemProps<T, MessageType>>;

export type GetMessageComponent<T, MessageType extends ChatMessage<T>> = (
  props: MessageItemProps<T, MessageType>
) => MessageComponentType<T, MessageType>;

export interface MessagesListProps<T, MessageType extends ChatMessage<T>> {
  bridge: ChatMessageBridgeInterface<T>;
  tt: ChatMessageI18nInterface;

  /**
   * Get message component
   *
   * @default `MessageItem`
   *
   * @type `ComponentType<MessageItemProps<MessageType>>`
   */
  getMessageComponent?: GetMessageComponent<T, MessageType>;

  /**
   * Get message unique identifier
   *
   * @default `(message.id ?? '') + (message.startTime ?? 0) + index`
   *
   * @param message Message
   * @param index Message index
   * @returns Message unique identifier
   */
  getMessageKey?(message: MessageType, index: number): string;
}

export function MessagesList<T = string>({
  bridge,
  tt,
  getMessageComponent,
  getMessageKey
}: MessagesListProps<T, ChatMessage<T>>) {
  const messagesStore = bridge.getMessageStore();
  const messages = useStore(messagesStore, (state) => state.messages);

  const _getMessageKey = useCallback(
    (message: ChatMessage<T>, index: number): string => {
      return (
        getMessageKey?.(message, index) ||
        String((message.id ?? '') + (message.startTime ?? 0) + index)
      );
    },
    [getMessageKey]
  );

  return (
    <div
      data-testid="MessagesList"
      className="flex-1 overflow-y-auto p-4 space-y-2"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-text-secondary">
            <p className="text-base mb-1">{tt.empty}</p>
            <p className="text-sm">{tt.start}</p>
          </div>
        </div>
      ) : (
        messages.map((message, index) => {
          const key = _getMessageKey(message, index);
          const props = { message, index, bridge, tt };
          const Component = getMessageComponent?.(props) || MessageItem;

          return <Component data-testid="MessageItem" key={key} {...props} />;
        })
      )}
    </div>
  );
}
