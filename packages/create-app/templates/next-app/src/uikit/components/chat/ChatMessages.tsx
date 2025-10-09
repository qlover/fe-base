import { useEffect, useRef } from 'react';
import { MessageType } from './ChatActionInterface';
import { useStore } from '../../hook/useStore';
import type {
  ChatActionInterface,
  ChatStateInterface,
  MessageInterface
} from './ChatActionInterface';

function MessageItem({ message }: { message: MessageInterface }) {
  return (
    <div
      data-testid="MessageItem"
      className={`flex ${
        message.role === MessageType.USER ? 'justify-end' : 'justify-start'
      } mb-4`}
    >
      <div
        data-testid="MessageItemContent"
        className={`max-w-[70%] rounded-lg p-3 ${
          message.role === MessageType.USER
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-700'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div className="mt-1 text-xs opacity-70">
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

export function ChatMessages({
  chatAction
}: {
  chatAction: ChatActionInterface<ChatStateInterface>;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages } = useStore(chatAction);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div data-testid="ChatMessages" className="flex-1 overflow-y-auto p-4">
      {messages.map((message: MessageInterface) => (
        <MessageItem
          data-testid="MessageItem"
          key={message.id}
          message={message}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
