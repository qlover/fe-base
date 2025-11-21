import {
  ThreadUtil,
  MessageStatus,
  ChatMessageRole
} from '@qlover/corekit-bridge';
import { random } from 'lodash';
import type {
  MessageStoreMsg,
  ChatMessageStore,
  MessageGetwayInterface,
  GatewayOptions
} from '@qlover/corekit-bridge';

export class MessageApi implements MessageGetwayInterface {
  constructor(protected messagesStore: ChatMessageStore<unknown>) {
    this.messagesStore = messagesStore;
  }

  /**
   * Send message (supports both normal and streaming modes)
   * - If options.stream === true, use streaming mode (progressive output)
   * - If options provided but stream !== true, use interruptible normal mode
   * - If no options, use fast normal mode (non-interruptible)
   */
  async sendMessage<M extends MessageStoreMsg<string>>(
    message: M,
    options?: GatewayOptions<M>
  ): Promise<M> {
    const messageContent = message.content ?? '';

    // Check if error simulation is needed
    if (messageContent.includes('Failed') || messageContent.includes('error')) {
      const error = new Error('Failed to send message');
      await options?.onError?.(error);
      throw error;
    }

    // Determine which mode to use
    if (options?.stream === true) {
      // Streaming mode: progressive output
      return this.sendStreamMode(message, options);
    } else if (options) {
      // Interruptible normal mode: one-time return, but supports stop
      return this.sendInterruptibleMode(message, options);
    } else {
      // Fast normal mode: non-interruptible
      return this.sendNormalMode(message);
    }
  }

  /**
   * Streaming send mode
   * - Simulates character-by-character output
   */
  private async sendStreamMode<M extends MessageStoreMsg<string>>(
    message: M,
    options: GatewayOptions<M>
  ): Promise<M> {
    const messageContent = message.content ?? '';

    // Simulate generated reply content
    const responseText = `Hello! You sent: ${messageContent}. This is a streaming response that will be sent word by word to simulate real streaming behavior.`;
    const words = responseText.split(' ');

    // Create initial assistant message
    const assistantMessageId =
      ChatMessageRole.ASSISTANT + message.id + Date.now();
    let accumulatedContent = '';

    try {
      // Simulate connection establishment - call onConnected
      await ThreadUtil.sleep(random(200, 500));

      // Note: Framework will automatically intercept this call, trigger plugin system, then call user's original callback
      await options.onConnected?.();

      // Send word by word
      for (let i = 0; i < words.length; i++) {
        // Check if cancelled
        if (options.signal?.aborted) {
          throw new DOMException('Request aborted', 'AbortError');
        }

        // Accumulate content
        accumulatedContent += (i > 0 ? ' ' : '') + words[i];

        // Create message object for current chunk
        const chunkMessage = this.messagesStore.createMessage({
          ...message,
          id: assistantMessageId,
          role: ChatMessageRole.ASSISTANT,
          content: accumulatedContent,
          error: null,
          loading: true,
          status: MessageStatus.SENDING,
          startTime: message.startTime,
          endTime: 0,
          result: null
        }) as unknown as M;

        // Call onChunk callback
        await options.onChunk?.(chunkMessage);

        // Calculate progress
        const progress = ((i + 1) / words.length) * 100;
        await options.onProgress?.(progress);

        // Simulate network delay (random delay)
        await ThreadUtil.sleep(random(100, 300));
      }

      // Create final completed message
      const finalMessage = this.messagesStore.createMessage({
        ...message,
        id: assistantMessageId,
        role: ChatMessageRole.ASSISTANT,
        content: accumulatedContent,
        error: null,
        loading: false,
        status: MessageStatus.SENT,
        startTime: message.startTime,
        endTime: Date.now(),
        result: null
      }) as unknown as M;

      // Call completion callback
      await options.onComplete?.(finalMessage);

      return finalMessage;
    } catch (error) {
      // Check if it's a stop error
      if (
        error instanceof DOMException &&
        error.name === 'AbortError' &&
        typeof options.onAborted === 'function'
      ) {
        // Call onAborted callback
        // Note: The message here contains accumulated content
        const abortedMessage = this.messagesStore.createMessage({
          ...message,
          id: assistantMessageId,
          role: ChatMessageRole.ASSISTANT,
          content: accumulatedContent,
          error: null,
          loading: false,
          status: MessageStatus.STOPPED,
          startTime: message.startTime,
          endTime: Date.now(),
          result: null
        }) as unknown as M;

        await options.onAborted(abortedMessage);
      } else {
        // Other errors, call onError callback
        await options.onError?.(error);
      }

      throw error;
    }
  }

  /**
   * Interruptible normal mode
   * - Returns complete message at once (no character-by-character output)
   * - Supports stop control (via signal)
   * - Supports event callbacks (onComplete, onAborted, onError)
   */
  private async sendInterruptibleMode<M extends MessageStoreMsg<string>>(
    message: M,
    options: GatewayOptions<M>
  ): Promise<M> {
    const messageContent = message.content ?? '';

    // Simulate connection establishment - call onConnected
    await options.onConnected?.();

    // Simulate random delay
    const times = random(200, 1000);

    // Check if cancelled during delay
    const startTime = Date.now();
    while (Date.now() - startTime < times) {
      if (options.signal?.aborted) {
        // Cancelled, create stopped message
        const abortedMessage = this.messagesStore.createMessage({
          ...message,
          id: ChatMessageRole.ASSISTANT + message.id,
          role: ChatMessageRole.ASSISTANT,
          content: '', // Content not generated yet
          error: null,
          loading: false,
          status: MessageStatus.STOPPED,
          endTime: Date.now(),
          result: null
        }) as unknown as M;

        // Call onAborted
        await options.onAborted?.(abortedMessage);
        throw new DOMException('Request aborted', 'AbortError');
      }

      // Check every 50ms
      await ThreadUtil.sleep(50);
    }

    // Check if error simulation is needed
    if (messageContent.includes('Failed') || messageContent.includes('error')) {
      const error = new Error('Failed to send message');
      await options.onError?.(error);
      throw error;
    }

    if (times % 5 === 0) {
      const error = new Error(`Network error(${times})`);
      await options.onError?.(error);
      throw error;
    }

    const endTime = Date.now();
    const finalMessage = this.messagesStore.createMessage({
      ...message,
      id: ChatMessageRole.ASSISTANT + message.id,
      role: ChatMessageRole.ASSISTANT,
      content: `(${endTime - message.startTime}ms) Hello! You sent: ${message.content}`,
      error: null,
      loading: false,
      status: MessageStatus.SENT,
      endTime: endTime,
      result: null
    }) as unknown as M;

    // Call onComplete
    await options.onComplete?.(finalMessage);

    return finalMessage;
  }

  /**
   * Fast normal mode
   * - Returns complete message at once
   * - Non-interruptible (doesn't check signal)
   */
  private async sendNormalMode<M extends MessageStoreMsg<string>>(
    message: M
  ): Promise<M> {
    const times = random(200, 1000);
    await ThreadUtil.sleep(times);

    const messageContent = message.content ?? '';
    if (messageContent.includes('Failed') || messageContent.includes('error')) {
      throw new Error('Failed to send message');
    }

    if (times % 5 === 0) {
      throw new Error(`Network error(${times})`);
    }

    const endTime = Date.now();
    return this.messagesStore.createMessage({
      ...message,
      id: ChatMessageRole.ASSISTANT + message.id,
      role: ChatMessageRole.ASSISTANT,
      content: `(${endTime - message.startTime}ms) Hello! You sent: ${message.content}`,
      error: null,
      loading: false,
      status: MessageStatus.SENT,
      endTime: endTime,
      result: null
    }) as unknown as M;
  }
}
