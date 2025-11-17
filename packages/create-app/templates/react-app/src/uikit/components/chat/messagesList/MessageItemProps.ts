import type { FocusBarBridgeInterface } from '@/base/focusBar/interface/FocusBarBridgeInterface';
import type { MessageInterface } from '@/base/focusBar/interface/MessagesStoreInterface';

export interface MessageItemProps<MessageType extends MessageInterface> {
  message: MessageType;
  index: number;
  bridge?: FocusBarBridgeInterface<MessageType>;
}
