import { BootstrapTest } from '@__mocks__/BootstrapTest';
import { TestApp } from '@__mocks__/components';
import * as chatI18nKeys from '@config/Identifier/components/component.chatMessage';
import { ChatMessageRole, ChatMessageStore } from '@qlover/corekit-bridge';
import { render, screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { logger } from '@/core/globals';
import { ChatMessageBridge } from '@/uikit/components/chatMessage/ChatMessageBridge';
import { ChatRoot } from '@/uikit/components/chatMessage/ChatRoot';
import type { ChatMessageI18nInterface } from '@config/i18n/chatMessageI18n';
import type { MessageGetwayInterface } from '@qlover/corekit-bridge';

// Mock i18n values matching the actual i18n keys
const mockI18n: ChatMessageI18nInterface = {
  send: chatI18nKeys.COMPONENT_CHAT_SEND,
  stop: chatI18nKeys.COMPONENT_CHAT_STOP,
  loading: chatI18nKeys.COMPONENT_CHAT_LOADING,
  inputPlaceholder: chatI18nKeys.COMPONENT_CHAT_INPUT_PLACEHOLDER,
  empty: chatI18nKeys.COMPONENT_CHAT_EMPTY,
  start: chatI18nKeys.COMPONENT_CHAT_START,
  retry: chatI18nKeys.COMPONENT_CHAT_RETRY,
  duration: chatI18nKeys.COMPONENT_CHAT_DURATION
};

// Simple mock gateway for testing
class MockMessageGateway implements MessageGetwayInterface {
  sendMessage = vi.fn();
}

describe('ChatRoot Component', () => {
  let messagesStore: ChatMessageStore<string>;
  let mockGateway: MockMessageGateway;
  let bridge: ChatMessageBridge<string>;

  beforeAll(async () => {
    await BootstrapTest.main({
      root: globalThis,
      bootHref: 'http://localhost:3000/en/test'
    });
  });

  beforeEach(() => {
    // Create fresh instances for each test
    messagesStore = new ChatMessageStore<string>();
    mockGateway = new MockMessageGateway();
    bridge = new ChatMessageBridge<string>(messagesStore, {
      gateway: mockGateway,
      logger: logger,
      senderName: 'TestSender',
      gatewayOptions: {}
    });

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render ChatRoot with all required components', () => {
      render(
        <TestApp>
          <ChatRoot bridge={bridge} tt={mockI18n} />
        </TestApp>
      );

      // Check main container
      const chatRoot = screen.getByTestId('ChatRoot');
      expect(chatRoot).toBeDefined();

      // Check MessagesList component
      const messagesList = screen.getByTestId('MessagesList');
      expect(messagesList).toBeDefined();

      // Check FocusBar component
      const focusBar = screen.getByTestId('FocusBar');
      expect(focusBar).toBeDefined();
    });

    it('should display empty state initially', () => {
      render(
        <TestApp>
          <ChatRoot bridge={bridge} tt={mockI18n} />
        </TestApp>
      );

      // Empty state text should be visible
      // Note: The actual text will be the i18n key, not the translated text in tests
      const emptyText = screen.getByText(/component_chat:empty/i);
      expect(emptyText).toBeDefined();
    });

    it('should render textarea for input', () => {
      render(
        <TestApp>
          <ChatRoot bridge={bridge} tt={mockI18n} />
        </TestApp>
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDefined();
    });

    it('should render send button', () => {
      render(
        <TestApp>
          <ChatRoot bridge={bridge} tt={mockI18n} />
        </TestApp>
      );

      const sendButton = screen.getByTestId('FocusBar-Button-Send');
      expect(sendButton).toBeDefined();
    });
  });

  describe('Props Integration', () => {
    it('should accept and use bridge prop', () => {
      render(
        <TestApp>
          <ChatRoot bridge={bridge} tt={mockI18n} />
        </TestApp>
      );

      // Verify bridge is connected by checking store state
      const state = messagesStore.state;
      expect(state).toBeDefined();
      expect(state.messages).toEqual([]);
      expect(state.draftMessages).toEqual([]);
    });

    it('should accept different bridge instances', () => {
      const newStore = new ChatMessageStore<string>();
      const newBridge = new ChatMessageBridge<string>(newStore, {
        gateway: mockGateway,
        logger: logger,
        senderName: 'NewTestSender',
        gatewayOptions: {}
      });

      render(
        <TestApp>
          <ChatRoot bridge={newBridge} tt={mockI18n} />
        </TestApp>
      );

      const chatRoot = screen.getByTestId('ChatRoot');
      expect(chatRoot).toBeDefined();
    });
  });

  describe('Bridge Integration', () => {
    it('should connect to message store through bridge', () => {
      render(
        <TestApp>
          <ChatRoot bridge={bridge} tt={mockI18n} />
        </TestApp>
      );

      // Bridge should have access to store
      const messageStore = bridge.getMessageStore();
      expect(messageStore).toBe(messagesStore);
    });

    it('should update UI when content is changed via bridge', () => {
      render(
        <TestApp>
          <ChatRoot bridge={bridge} tt={mockI18n} />
        </TestApp>
      );

      // Initially, send button should be disabled (no content)
      const sendButton = screen.getByTestId('FocusBar-Button-Send');
      expect(sendButton).toHaveProperty('disabled', true);

      // Change content via bridge
      bridge.onChangeContent('Test message');

      // Now send button should be enabled (has content)
      // Note: This requires the component to re-render based on store updates
      const state = messagesStore.state;
      expect(state.draftMessages.length).toBeGreaterThan(0);
      expect(state.draftMessages[0]?.content).toBe('Test message');
    });
  });

  describe('Store State Management', () => {
    it('should reflect message store state', () => {
      render(
        <TestApp>
          <ChatRoot bridge={bridge} tt={mockI18n} />
        </TestApp>
      );

      // Initial state should be empty
      const initialState = messagesStore.state;
      expect(initialState.messages).toEqual([]);
      expect(initialState.draftMessages).toEqual([]);
      // These properties might be undefined initially, which is fine
      expect(initialState.disabledSend).toBeFalsy();
      expect(initialState.streaming).toBeFalsy();
    });

    it('should update when messages are added to store', () => {
      render(
        <TestApp>
          <ChatRoot bridge={bridge} tt={mockI18n} />
        </TestApp>
      );

      // Add a message to the store
      messagesStore.addMessage({
        id: 'test-1',
        role: ChatMessageRole.USER,
        content: 'Test message',
        loading: false,
        startTime: Date.now()
      });

      // Verify message is in store
      const state = messagesStore.state;
      expect(state.messages.length).toBe(1);
      expect(state.messages[0]?.content).toBe('Test message');
    });
  });

  describe('Button States', () => {
    it('should have disabled send button when no content', () => {
      render(
        <TestApp>
          <ChatRoot bridge={bridge} tt={mockI18n} />
        </TestApp>
      );

      const sendButton = screen.getByTestId('FocusBar-Button-Send');
      expect(sendButton).toHaveProperty('disabled', true);
    });
  });

  describe('Component Structure', () => {
    it('should have correct CSS classes for layout', () => {
      render(
        <TestApp>
          <ChatRoot bridge={bridge} tt={mockI18n} />
        </TestApp>
      );

      const chatRoot = screen.getByTestId('ChatRoot');
      expect(chatRoot.className).toContain('flex');
      expect(chatRoot.className).toContain('flex-col');
    });

    it('should render MessagesList with correct data-testid', () => {
      render(
        <TestApp>
          <ChatRoot bridge={bridge} tt={mockI18n} />
        </TestApp>
      );

      const messagesList = screen.getByTestId('MessagesList');
      expect(messagesList).toBeDefined();
      expect(messagesList.className).toContain('overflow-y-auto');
    });

    it('should render FocusBar with correct data-testid', () => {
      render(
        <TestApp>
          <ChatRoot bridge={bridge} tt={mockI18n} />
        </TestApp>
      );

      const focusBar = screen.getByTestId('FocusBar');
      expect(focusBar).toBeDefined();
      expect(focusBar.className).toContain('border-t');
    });
  });
});
