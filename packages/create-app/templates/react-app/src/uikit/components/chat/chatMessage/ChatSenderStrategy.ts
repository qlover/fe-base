import type { MessageSenderContext } from '@/base/focusBar/impl/MessageSender';
import { SenderStrategyPlugin } from '@/base/focusBar/impl/SenderStrategyPlugin';
import { ChatMessageRoleType, type ChatMessage } from './ChatMessage';

export class ChatSenderStrategy extends SenderStrategyPlugin {
  protected override handleAddNoOnSuccess(
    parameters: MessageSenderContext<ChatMessage<any, unknown>>,
    successData: ChatMessage<string>
  ): ChatMessage<string> | undefined {
    const { messages } = parameters;

    const updatedMessage = super.handleAddNoOnSuccess(parameters, successData);

    // if chatMessage has result, update the currentMessage
    const resultData = successData.result;
    if (
      messages.isMessage(resultData) &&
      resultData.role === ChatMessageRoleType.ASSISTANT
    ) {
      // 找到 successData 在列表中的索引
      const currentIndex = messages.getMessageIndex(successData.id!);

      if (currentIndex !== -1) {
        const nextMessage = messages.getMessageByIndex(currentIndex + 1);

        // 如果后面有消息且是 ASSISTANT，替换它
        if (
          nextMessage &&
          messages.isMessage(nextMessage) &&
          (nextMessage as ChatMessage<any>).role ===
            ChatMessageRoleType.ASSISTANT
        ) {
          messages.updateMessage(nextMessage.id!, resultData);

          // 删除 nextMessage 后面的所有消息
          const allMessages = messages.getMessages();
          const nextMessageIndex = currentIndex + 1;
          // 保留从开始到 nextMessage（包含）的所有消息
          const newMessages = allMessages.slice(0, nextMessageIndex + 1);
          messages.resetMessages(newMessages);
        }
        // 如果后面没有消息（successData 是最后一个），添加新消息
        else if (!nextMessage) {
          messages.addMessage(resultData);
        }
        // 如果后面有消息但不是 ASSISTANT，不做任何操作
      }
    }

    return updatedMessage as ChatMessage<string>;
  }
}
