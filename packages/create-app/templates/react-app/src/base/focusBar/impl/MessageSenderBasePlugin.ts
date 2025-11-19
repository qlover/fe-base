import type {
  MessageSenderContext,
  MessageSenderPlugin
} from './MessageSenderExecutor';
import type { MessageStoreMsg } from './MessagesStore';
import type { ExecutorContext } from '@qlover/fe-corekit';

export abstract class MessageSenderBasePlugin<
  T extends MessageStoreMsg<any> = MessageStoreMsg<any>
> implements MessageSenderPlugin<T>
{
  abstract readonly pluginName: string;

  protected mergeRuntimeMessage(
    context: ExecutorContext<MessageSenderContext>,
    message: MessageStoreMsg<any, unknown>
  ): MessageStoreMsg<any, unknown> {
    const { currentMessage, store } = context.parameters;
    const mergedMessage = store.mergeMessage(currentMessage, message);

    context.parameters.currentMessage = mergedMessage;

    return mergedMessage;
  }

  protected asyncReturnValue(
    context: ExecutorContext<MessageSenderContext>,
    returnValue: unknown
  ): unknown {
    context.returnValue = returnValue;
    return returnValue;
  }

  protected openAddedToStore(
    context: ExecutorContext<MessageSenderContext>
  ): void {
    context.parameters.addedToStore = true;
  }

  protected closeAddedToStore(
    context: ExecutorContext<MessageSenderContext>
  ): void {
    context.parameters.addedToStore = false;
  }
}
