import { MessageStoreMsg } from '../impl/MessageStore';
import { GatewayOptions } from './MessageGetwayInterface';
import { MessageSenderContext } from './MessageSenderPlugin';

export interface SenderGatewayInterface<
  MessageType extends MessageStoreMsg<unknown, unknown>
> {
  createGatewayOptions(
    gatewayOptions: GatewayOptions<MessageType>,
    context?: MessageSenderContext<MessageType>
  ): GatewayOptions<MessageType>;
}
