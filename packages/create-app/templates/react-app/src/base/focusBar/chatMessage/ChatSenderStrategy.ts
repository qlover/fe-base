import { ChatMessageRole, type ChatMessage } from './ChatMessage';
import { SenderStrategyPlugin } from '../impl/SenderStrategyPlugin';
import type { ChatMessageStore } from './ChatMessageStore';
import type { MessageSenderContext } from '../impl/MessageSenderExecutor';

export class ChatSenderStrategy extends SenderStrategyPlugin {
  sliceMessages(store: ChatMessageStore<string>, index: number): void {
    // 删除 nextMessage 后面的所有消息
    const allMessages = store.getMessages();
    const nextMessageIndex = index + 1;
    // 保留从开始到 nextMessage（包含）的所有消息
    const newMessages = allMessages.slice(0, nextMessageIndex + 1);
    store.resetMessages(newMessages);
  }

  isAssistantMessage(
    store: ChatMessageStore<string>,
    message: ChatMessage<string>
  ): boolean {
    return (
      store.isMessage(message) && message.role === ChatMessageRole.ASSISTANT
    );
  }

  protected override handleBefore_KEEP_FAILED(
    parameters: MessageSenderContext<ChatMessage<string>>
  ): ChatMessage<string> {
    const store = parameters.store as ChatMessageStore<string>;
    const { currentMessage } = parameters;

    // 🔧 重试逻辑：如果消息已经在列表中，清空该消息后面的所有消息
    if (currentMessage.id) {
      const messageIndex = store.getMessageIndex(currentMessage.id);
      if (messageIndex !== -1) {
        // 找到了消息，说明是重试操作
        // 删除该消息后面的所有消息（包括之前的 assistant 响应）
        const allMessages = store.getMessages();
        const messagesToRemove = allMessages.slice(messageIndex + 1);
        messagesToRemove.forEach((msg) => {
          if (msg.id) {
            store.deleteMessage(msg.id);
          }
        });
      }
    }

    // store.resetCurrentMessage();

    const result = super.handleBefore_KEEP_FAILED(parameters);

    return result as ChatMessage<string>;
  }

  protected override handleSuccess_KEEP_FAILED(
    parameters: MessageSenderContext<ChatMessage<string>>,
    successData: ChatMessage<string>
  ): ChatMessage<string> | undefined {
    const store = parameters.store as ChatMessageStore<string>;

    const updatedMessage = super.handleSuccess_KEEP_FAILED(
      parameters,
      successData
    );

    // if chatMessage has result, update the currentMessage
    const resultData = successData.result as ChatMessage<string>;
    if (this.isAssistantMessage(store, resultData)) {
      // 找到 successData 在列表中的索引
      const currentIndex = store.getMessageIndex(successData.id!);

      if (currentIndex !== -1) {
        const nextMessage = store.getMessageByIndex(currentIndex + 1);

        // 如果后面有消息且是 ASSISTANT，替换它
        if (nextMessage && this.isAssistantMessage(store, nextMessage)) {
          store.updateMessage(nextMessage.id!, resultData);
          this.sliceMessages(store, currentIndex);
        }
        // 如果后面没有消息（successData 是最后一个），添加新消息
        else if (!nextMessage) {
          store.addMessage(resultData);
        }
        // 如果后面有消息但不是 ASSISTANT，不做任何操作
      }
    }

    return updatedMessage as ChatMessage<string>;
  }
}
