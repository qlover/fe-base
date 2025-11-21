import { useStore } from '@brain-toolkit/react-kit';
import { useCallback, type ComponentType } from 'react';
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

  /**
   * 获取消息组件
   *
   * @default `MessageItem`
   *
   * @type `ComponentType<MessageItemProps<MessageType>>`
   */
  getMessageComponent?: GetMessageComponent<T, MessageType>;

  /**
   * 获取消息唯一标识
   *
   * @default `(message.id ?? '') + (message.startTime ?? 0) + index`
   *
   * @param message 消息
   * @param index 消息索引
   * @returns 消息唯一标识
   */
  getMessageKey?(message: MessageType, index: number): string;
}

export function MessagesList<T = string>({
  bridge,
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
    <div data-testid="MessagesList">
      {messages.map((message, index) => {
        const key = _getMessageKey(message, index);
        const props = { message, index, bridge };
        const Component = getMessageComponent?.(props) || MessageItem;

        return <Component data-testid="MessageItem" key={key} {...props} />;
      })}
    </div>
  );
}
