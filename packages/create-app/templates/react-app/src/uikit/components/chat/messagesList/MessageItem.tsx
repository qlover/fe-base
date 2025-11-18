import { ReloadOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { clsx } from 'clsx';
import { useMemo } from 'react';
import { With } from '../../With';
import {
  ChatMessageRoleType,
  type ChatMessage
} from '../chatMessage/ChatMessage';
import type { ChatMessageBridgeInterface } from '../chatMessage/interface';

export interface MessageItemProps<T, MessageType extends ChatMessage<T>> {
  message: MessageType;
  index: number;
  bridge?: ChatMessageBridgeInterface<T>;
}

export function MessageItem<T, MessageType extends ChatMessage<T>>({
  message,
  bridge,
  index
}: MessageItemProps<T, MessageType>) {
  const messageText = useMemo(() => {
    return message.content as string;
  }, [message.content]);

  const durtaion = useMemo(() => {
    return message.endTime ? message.endTime - message.startTime : 0;
  }, [message.endTime, message.startTime]);

  const errorMessage = useMemo(() => {
    return message.error instanceof Error ? message.error.message : null;
  }, [message.error]);

  const isUserMessage = message.role === ChatMessageRoleType.USER;

  return (
    <div
      data-testid="MessageItem"
      data-message-id={message.id}
      data-message-role={message.role}
      data-message-index={index}
      className={clsx('w-full flex', {
        'justify-end': isUserMessage,
        'justify-start': !isUserMessage
      })}
    >
      <div
        className={clsx(
          'flex flex-col my-1 p-1 border border-cyan-600 rounded-xl ',
          {
            'w-full': !isUserMessage,
            'w-[80%]': isUserMessage
          }
        )}
      >
        <div className="flex items-center gap-2">
          {isUserMessage && (
            <With it={message.loading} fallback={<Spin size="small" />}>
              <ReloadOutlined
                disabled={message.loading}
                onClick={() => bridge?.send(message)}
              />
            </With>
          )}
          <span data-testid="MessageContent">{messageText}</span>
        </div>

        {isUserMessage && <div className="text-right">{durtaion}ms</div>}

        {errorMessage && (
          <div data-testid="MessageError" className="text-red-500">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
