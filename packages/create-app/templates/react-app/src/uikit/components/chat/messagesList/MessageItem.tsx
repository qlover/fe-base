import { ReloadOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { useMemo } from 'react';
import { type MessageStoreMsg } from '@/base/focusBar/impl/MessagesStore';
import type { MessageItemProps } from './MessageItemProps';

export function MessageItem<MessageType extends MessageStoreMsg<unknown>>({
  message,
  bridge,
  index
}: MessageItemProps<MessageType>) {
  const messageText = useMemo(() => {
    return message.content as string;
  }, [message.content]);

  const durtaion = useMemo(() => {
    return message.endTime ? message.endTime - message.startTime : 0;
  }, [message.endTime, message.startTime]);

  const errorMessage = useMemo(() => {
    return message.error instanceof Error ? message.error.message : null;
  }, [message.error]);

  return (
    <div
      data-testid="MessageItem"
      data-message-id={message.id}
      data-message-index={index}
      className="w-full flex justify-end"
    >
      <div className="flex flex-col my-1 p-1 border border-cyan-600 rounded-xl w-[80%]">
        <div className="flex items-center gap-2">
          {message.loading ? (
            <Spin size="small" />
          ) : (
            <ReloadOutlined
              disabled={message.loading}
              onClick={() => bridge?.send(message)}
            />
          )}
          <span data-testid="MessageContent">{messageText}</span>
        </div>
        <div className="text-right">{durtaion}ms</div>

        {errorMessage && (
          <div data-testid="MessageError" className="text-red-500">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
