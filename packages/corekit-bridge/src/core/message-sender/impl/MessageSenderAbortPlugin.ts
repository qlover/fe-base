import {
  AbortManager,
  AbortManagerConfig,
  AbortPlugin,
  AbortPluginOptions,
  ExecutorContext,
} from '@qlover/fe-corekit';
import { MessageSenderContextOptions } from './MessageSenderExecutor';
import { MessageStoreMsg } from './MessageStore';

export class MessageSenderAbortManager<
  MessageType extends MessageStoreMsg<unknown, unknown>,
  Config extends AbortManagerConfig & MessageType
> extends AbortManager<Config> {
  public override generateAbortedId(config?: Config | undefined): string {
    if (config?.id) {
      return config.id;
    }

    return super.generateAbortedId(config);
  }
}

export class MessageSenderAbortPlugin<
  MessageType extends MessageStoreMsg<unknown, unknown>,
  Config extends AbortManagerConfig & MessageType
> extends AbortPlugin<Config> {
  constructor(options?: AbortPluginOptions<Config>) {
    super({
      ...options,
      abortManager:
        options?.abortManager ??
        new MessageSenderAbortManager<MessageType, Config>(
          'MessageSenderAbortManager'
        ),
      getConfig:
        options?.getConfig ??
        ((parameters) =>
          ((parameters as MessageSenderContextOptions<MessageType>)
            .gatewayOptions as Config) ?? (parameters as Config))
    });
  }

  protected override assignSignalToContext(
    context: ExecutorContext<
      MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>
    >,
    signal: AbortSignal
  ): void {
    super.assignSignalToContext(context, signal);

    if (
      'gatewayOptions' in context.parameters &&
      typeof context.parameters.gatewayOptions === 'object' &&
      context.parameters.gatewayOptions !== null
    ) {
      Object.assign(context.parameters.gatewayOptions, { signal });
    }
  }
}
