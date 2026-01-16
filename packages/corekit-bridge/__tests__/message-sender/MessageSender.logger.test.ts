/**
 * @file MessageSender logger integration tests
 *
 * Tests for logger integration and senderName configuration
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MessageSender,
  MessagesStore,
  type MessageGetwayInterface
} from '../../src/core/message-sender';
import type { LoggerInterface } from '@qlover/logger';
import type { TestMessage } from './MessageSender.test-utils';
import {
  createTestStore,
  createMockGateway
} from './MessageSender.test-utils';

describe('MessageSender - logger integration', () => {
  let store: MessagesStore<TestMessage>;
  let mockGateway: MessageGetwayInterface;

  beforeEach(() => {
    store = createTestStore();
    mockGateway = createMockGateway();
  });

  describe('Logger integration', () => {
    it('should log when message is sent successfully', async () => {
      const mockLogger: LoggerInterface = {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn(),
        fatal: vi.fn(),
        trace: vi.fn(),
        addAppender: vi.fn(),
        context: vi.fn()
      };

      const serviceWithLogger = new MessageSender(store, {
        gateway: mockGateway,
        logger: mockLogger
      });

      const result = await serviceWithLogger.send({ content: 'Test' });

      expect(mockLogger.info).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('success')
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining(result.id!)
      );
    });

    it('should log when message is sent failed', async () => {
      const mockLogger: LoggerInterface = {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn(),
        fatal: vi.fn(),
        trace: vi.fn(),
        addAppender: vi.fn(),
        context: vi.fn()
      };

      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      const serviceWithLogger = new MessageSender(store, {
        gateway: mockGateway,
        logger: mockLogger
      });

      const result = await serviceWithLogger.send({ content: 'Test' });

      expect(mockLogger.debug).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('failed')
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining(result.id!)
      );
    });

    it('should include custom senderName in log', async () => {
      const mockLogger: LoggerInterface = {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn(),
        fatal: vi.fn(),
        trace: vi.fn(),
        addAppender: vi.fn(),
        context: vi.fn()
      };

      const customSenderName = 'CustomSender';

      const serviceWithCustomName = new MessageSender(store, {
        gateway: mockGateway,
        logger: mockLogger,
        senderName: customSenderName
      });

      await serviceWithCustomName.send({ content: 'Test' });

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining(customSenderName)
      );
    });

    it('should include message duration in log', async () => {
      const mockLogger: LoggerInterface = {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn(),
        fatal: vi.fn(),
        trace: vi.fn(),
        addAppender: vi.fn(),
        context: vi.fn()
      };

      const serviceWithLogger = new MessageSender(store, {
        gateway: mockGateway,
        logger: mockLogger
      });

      await serviceWithLogger.send({ content: 'Test' });

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('speed')
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringMatching(/\d+ms/)
      );
    });

    it('should work normally without logger', async () => {
      const serviceWithoutLogger = new MessageSender(store, {
        gateway: mockGateway
      });

      await expect(
        serviceWithoutLogger.send({ content: 'Test' })
      ).resolves.toBeDefined();
    });
  });

  describe('senderName configuration', () => {
    it('should use default senderName', () => {
      const defaultService = new MessageSender(store, {
        gateway: mockGateway
      });

      expect(defaultService['senderName']).toBe('MessageSender');
    });

    it('should use custom senderName', () => {
      const customName = 'MyCustomSender';

      const customService = new MessageSender(store, {
        gateway: mockGateway,
        senderName: customName
      });

      expect(customService['senderName']).toBe(customName);
    });

    it('should use senderName in error message', async () => {
      const mockLogger: LoggerInterface = {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn(),
        fatal: vi.fn(),
        trace: vi.fn(),
        addAppender: vi.fn(),
        context: vi.fn()
      };

      const customName = 'TestSender';

      mockGateway.sendMessage = vi.fn().mockRejectedValue(new Error('Failed'));

      const customService = new MessageSender(store, {
        gateway: mockGateway,
        senderName: customName,
        logger: mockLogger
      });

      await customService.send({ content: 'Test' });

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining(`[${customName}]`)
      );
    });
  });
});
