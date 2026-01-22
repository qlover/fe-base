import { type MessageStoreMsg } from '../impl/MessageStore';
import { type GatewayOptions } from './MessageGetwayInterface';
import { type MessageSenderContext } from './MessageSenderPlugin';

export interface SenderGatewayInterface<
  MessageType extends MessageStoreMsg<unknown, unknown>
> {
  createGatewayOptions(
    gatewayOptions: GatewayOptions<MessageType>,
    context?: MessageSenderContext<MessageType>
  ): GatewayOptions<MessageType>;
}
