import { useFactory, useStore } from '@brain-toolkit/react-kit';
import { messageBaseListI18n } from '@config/i18n/messageBaseListI18n';
import { I } from '@config/IOCIdentifier';
import {
  MessageSender,
  MessagesStore,
  MessageStatus,
  SenderStrategyPlugin,
  SendFailureStrategy,
  ThreadUtil
} from '@qlover/corekit-bridge';
import { Button, Input } from 'antd';
import { random } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { useI18nInterface } from '../hooks/useI18nInterface';
import { useIOC } from '../hooks/useIOC';
import type {
  MessageGetwayInterface,
  MessagesStateInterface,
  MessageStoreMsg
} from '@qlover/corekit-bridge';

interface MessageBaseMsg extends MessageStoreMsg<string, unknown> {}

function createMessagesState(): MessagesStateInterface<MessageBaseMsg> {
  return {
    messages: []
  };
}

class MessageBaseApi implements MessageGetwayInterface {
  public async sendMessage<M extends MessageStoreMsg<string>>(
    message: M
  ): Promise<unknown> {
    const times = random(200, 1000);

    await ThreadUtil.sleep(times);

    const messageContent = message.content ?? '';
    if (messageContent.includes('Failed') || messageContent.includes('error')) {
      throw new Error('Failed to send message');
    }

    if (times % 5 === 0) {
      throw new Error(`Network error(${times})`);
    }

    // Return object response to demonstrate formatting
    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      delay: `${times}ms`,
      echo: message.content,
      data: {
        message: 'Message received successfully',
        processed: true,
        metadata: {
          length: message.content?.length || 0,
          type: 'text'
        }
      }
    };
  }
}

export function MessageBaseList() {
  const [inputValue, setInputValue] = useState('');
  const logger = useIOC(I.Logger);
  const tt = useI18nInterface(messageBaseListI18n);
  const messagesStore = useFactory(
    MessagesStore<MessageBaseMsg>,
    createMessagesState
  );
  const messageBaseApi = useFactory(MessageBaseApi);

  const [messagesSender] = useState(() =>
    new MessageSender<MessageBaseMsg>(messagesStore, {
      gateway: messageBaseApi,
      logger
    }).use(new SenderStrategyPlugin(SendFailureStrategy.KEEP_FAILED))
  );

  const messages = useStore(messagesStore, (state) => state.messages);

  const loadingMessage = useMemo(() => {
    return messages.find((message) => message.loading);
  }, [messages]);

  const onSend = useCallback(() => {
    messagesSender.send({
      content: inputValue
    });
    setInputValue('');
  }, [inputValue, messagesSender]);

  /**
   * Render message result with proper formatting
   * - For objects/arrays: display as formatted JSON
   * - For strings: display as plain text
   */
  const renderResult = (result: unknown) => {
    if (!result) return null;

    // Check if result is an object or array
    if (typeof result === 'object') {
      try {
        const jsonString = JSON.stringify(result, null, 2);
        return (
          <pre
            data-testid="MessageResultJson"
            className="text-xs font-mono bg-green-100 p-2 rounded mt-1 overflow-x-auto whitespace-pre-wrap"
          >
            {jsonString}
          </pre>
        );
      } catch {
        return String(result);
      }
    }

    // For strings and other primitives
    return <span data-testid="MessageResultText">{String(result)}</span>;
  };

  return (
    <div data-testid="MessageBaseList" className="max-w-4xl mx-auto">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text mb-2">{tt.title}</h1>
        <p className="text-sm text-text-secondary">{tt.description}</p>
      </div>

      {/* Messages Container */}
      <div className="bg-secondary rounded-lg shadow-sm border border-primary mb-4">
        <div
          data-testid="MessageBaseListItems"
          className="flex flex-col gap-3 p-4 max-h-96 min-h-64 overflow-y-auto"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-text-secondary">
              <div className="text-center">
                <p className="text-base mb-1">{tt.noMessages}</p>
                <p className="text-sm">{tt.getStarted}</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                data-testid="MessageBaseListItem"
                className="space-y-2"
              >
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-[70%] bg-blue-500 text-white rounded-lg px-4 py-2 shadow-sm">
                    <div className="text-sm font-medium mb-1">{tt.user}</div>
                    <div className="wrap-break-word">{message.content}</div>
                  </div>
                </div>

                {/* Gateway Response */}
                <div className="flex justify-start">
                  <div className="max-w-[70%]">
                    {message.loading ? (
                      <div className="bg-base rounded-lg px-4 py-2 shadow-sm border border-primary">
                        <div className="text-sm font-medium text-text-secondary mb-1">
                          {tt.gateway}
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <div className="flex gap-1">
                            <span
                              className="animate-bounce inline-block w-1.5 h-1.5 bg-text-secondary rounded-full"
                              style={{ animationDelay: '0ms' }}
                            ></span>
                            <span
                              className="animate-bounce inline-block w-1.5 h-1.5 bg-text-secondary rounded-full"
                              style={{ animationDelay: '150ms' }}
                            ></span>
                            <span
                              className="animate-bounce inline-block w-1.5 h-1.5 bg-text-secondary rounded-full"
                              style={{ animationDelay: '300ms' }}
                            ></span>
                          </div>
                          <span className="text-sm">{tt.processing}</span>
                        </div>
                      </div>
                    ) : message.status === MessageStatus.FAILED ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 shadow-sm">
                        <div className="text-sm font-medium text-red-800 mb-1">
                          {tt.gatewayFailed}
                        </div>
                        <div className="text-red-600 text-sm">
                          ❌ {(message as any).error?.message || tt.sendFailed}
                        </div>
                      </div>
                    ) : message.result ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 shadow-sm">
                        <div className="text-sm font-medium text-green-800 mb-1">
                          ✓ {tt.gatewayResponse}
                        </div>
                        <div className="text-green-900">
                          {renderResult(message.result)}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-secondary rounded-lg shadow-sm border border-primary p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onPressEnter={onSend}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={tt.inputPlaceholder}
            size="large"
            className="flex-1"
            disabled={loadingMessage?.loading}
          />
          <Button
            disabled={!inputValue || loadingMessage?.loading}
            loading={loadingMessage?.loading}
            type="primary"
            size="large"
            onClick={onSend}
          >
            {tt.sendButton}
          </Button>
        </div>
        <div className="mt-2 text-xs text-text-secondary">{tt.errorTip}</div>
      </div>
    </div>
  );
}
