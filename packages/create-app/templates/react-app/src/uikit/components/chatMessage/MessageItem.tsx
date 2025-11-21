import { ReloadOutlined } from '@ant-design/icons';
import { ChatMessageRole } from '@qlover/corekit-bridge';
import { Spin, Button } from 'antd';
import { clsx } from 'clsx';
import { useMemo } from 'react';
import type { ChatMessageI18nInterface } from '@config/i18n/chatMessageI18n';
import type {
  ChatMessage,
  ChatMessageBridgeInterface
} from '@qlover/corekit-bridge';

export interface MessageItemProps<T, MessageType extends ChatMessage<T>> {
  message: MessageType;
  index: number;
  bridge?: ChatMessageBridgeInterface<T>;
  tt: ChatMessageI18nInterface;
}

export function MessageItem<T, MessageType extends ChatMessage<T>>({
  message,
  bridge,
  index,
  tt
}: MessageItemProps<T, MessageType>) {
  const messageText = useMemo(() => {
    return message.content as string;
  }, [message.content]);

  const duration = useMemo(() => {
    return message.endTime ? message.endTime - message.startTime : 0;
  }, [message.endTime, message.startTime]);

  const errorMessage = useMemo(() => {
    return message.error instanceof Error ? message.error.message : null;
  }, [message.error]);

  const isUserMessage = message.role === ChatMessageRole.USER;
  const isAssistant = message.role === ChatMessageRole.ASSISTANT;

  return (
    <div
      data-testid="MessageItem"
      data-message-id={message.id}
      data-message-role={message.role}
      data-message-index={index}
      className={clsx('w-full flex mb-3', {
        'justify-end': isUserMessage,
        'justify-start': !isUserMessage
      })}
    >
      <div
        className={clsx('flex flex-col px-4 py-3 rounded-xl shadow-sm', {
          'max-w-[80%] bg-blue-500 text-white': isUserMessage,
          'max-w-[85%] bg-secondary border border-primary': isAssistant
        })}
      >
        {/* Message content */}
        <div className="flex items-start gap-2">
          {isUserMessage && !message.loading && (
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined className="text-white" />}
              disabled={message.loading}
              onClick={() => bridge?.send(message)}
              className="flex-shrink-0 hover:bg-blue-600"
              title={tt.retry}
            />
          )}

          <div
            data-testid="MessageContent"
            className={clsx('flex-1 whitespace-pre-wrap break-words', {
              'text-white': isUserMessage,
              'text-text': isAssistant
            })}
          >
            {message.loading && <Spin size="small" className="mr-2" />}
            {messageText}
          </div>
        </div>

        {/* Duration for user messages */}
        {isUserMessage && duration > 0 && (
          <div className="text-right text-xs mt-1 opacity-80">
            {tt.duration}: {duration}ms
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div
            data-testid="MessageError"
            className="mt-2 text-sm p-2 bg-red-100 text-red-700 rounded border border-red-200"
          >
            ❌ {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
