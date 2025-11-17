import { useStore } from '@brain-toolkit/react-kit';
import { useCallback, type ComponentType } from 'react';
import type { FocusBarBridgeInterface } from '@/base/focusBar/interface/FocusBarBridgeInterface';
import type { MessageInterface } from '@/base/focusBar/interface/MessagesStoreInterface';
import { MessageItem } from './MessageItem';
import type { MessageItemProps } from './MessageItemProps';

export type MessageComponentType<MessageType extends MessageInterface> =
  ComponentType<MessageItemProps<MessageType>>;

export type GetMessageComponent<MessageType extends MessageInterface> = (
  props: MessageItemProps<MessageType>
) => MessageComponentType<MessageType>;

export interface MessagesListProps<MessageType extends MessageInterface> {
  bridge: FocusBarBridgeInterface<MessageType>;

  /**
   * 获取消息组件
   *
   * @default `MessageItem`
   *
   * @type `ComponentType<MessageItemProps<MessageType>>`
   */
  getMessageComponent?: GetMessageComponent<MessageType>;

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

export function MessagesList<MessageType extends MessageInterface>({
  bridge,
  getMessageComponent,
  getMessageKey
}: MessagesListProps<MessageType>) {
  const messagesStore = bridge.messageSender.messages;
  const messages = useStore(messagesStore, (state) => state.messages);

  const _getMessageKey = useCallback(
    (message: MessageType, index: number): string => {
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
