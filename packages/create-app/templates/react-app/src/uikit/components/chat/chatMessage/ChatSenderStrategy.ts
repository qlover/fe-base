import type { MessageSenderContext } from '@/base/focusBar/impl/MessageSenderExecutor';
import { SenderStrategyPlugin } from '@/base/focusBar/impl/SenderStrategyPlugin';
import { ChatMessageRoleType, type ChatMessage } from './ChatMessage';
import type { ChatMessageStore } from './ChatMessageStore';

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
      store.isMessage(message) && message.role === ChatMessageRoleType.ASSISTANT
    );
  }

  protected override handleBefore_KEEP_FAILED(
    parameters: MessageSenderContext<ChatMessage<string>>
  ): ChatMessage<string> {
    const store = parameters.store as ChatMessageStore<string>;

    // 重置当前消息为空消息
    store.resetCurrentMessage();

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
