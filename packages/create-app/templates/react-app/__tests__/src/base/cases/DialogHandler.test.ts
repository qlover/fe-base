/**
 * DialogHandler test suite
 *
 * Coverage:
 * 1. constructor       - Constructor initialization
 * 2. setters          - Message, Modal, Notification setters
 * 3. formatErrorMessage - Error message formatting
 * 4. notification methods - success, error, info, warn
 * 5. confirm method   - Modal confirmation
 * 6. edge cases       - Null/undefined handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DialogHandler } from '@/base/cases/DialogHandler';
import type {
  MessageApi,
  ModalApi,
  NotificationApi
} from '@brain-toolkit/antd-theme-override/react';

describe('DialogHandler', () => {
  let dialogHandler: DialogHandler;
  let mockMessage: MessageApi;
  let mockModal: ModalApi;
  let mockNotification: NotificationApi;

  beforeEach(() => {
    // Create mock APIs
    mockMessage = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn()
    } as unknown as MessageApi;

    mockModal = {
      confirm: vi.fn()
    } as unknown as ModalApi;

    mockNotification = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn()
    } as unknown as NotificationApi;

    // Initialize DialogHandler
    dialogHandler = new DialogHandler();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with empty antds object', () => {
      expect(dialogHandler).toBeInstanceOf(DialogHandler);
      expect((dialogHandler as any).antds).toEqual({});
    });
  });

  describe('setters', () => {
    it('should set message api', () => {
      dialogHandler.setMessage(mockMessage);
      expect((dialogHandler as any).antds.message).toBe(mockMessage);
    });

    it('should set modal api', () => {
      dialogHandler.setModal(mockModal);
      expect((dialogHandler as any).antds.modal).toBe(mockModal);
    });

    it('should set notification api', () => {
      dialogHandler.setNotification(mockNotification);
      expect((dialogHandler as any).antds.notification).toBe(mockNotification);
    });
  });

  describe('formatErrorMessage', () => {
    it('should format Error object', () => {
      const error = new Error('test error');
      const result = (dialogHandler as any).formatErrorMessage(error);
      expect(result).toBe('test error');
    });

    it('should format string error', () => {
      const result = (dialogHandler as any).formatErrorMessage('test error');
      expect(result).toBe('test error');
    });

    it('should handle unknown error type', () => {
      const result = (dialogHandler as any).formatErrorMessage({});
      expect(result).toBe('An unknown error occurred');
    });
  });

  describe('notification methods', () => {
    beforeEach(() => {
      dialogHandler.setMessage(mockMessage);
    });

    describe('success', () => {
      it('should call message.success with content', () => {
        dialogHandler.success('test success');
        expect(mockMessage.success).toHaveBeenCalledWith({
          content: 'test success'
        });
      });

      it('should pass through options', () => {
        const options = { duration: 5000 };
        dialogHandler.success('test success', options);
        expect(mockMessage.success).toHaveBeenCalledWith({
          content: 'test success',
          ...options
        });
      });
    });

    describe('error', () => {
      it('should call message.error with content', () => {
        dialogHandler.error('test error');
        expect(mockMessage.error).toHaveBeenCalledWith({
          content: 'test error'
        });
      });

      it('should format error from options', () => {
        const error = new Error('formatted error');
        const options = { error };
        dialogHandler.error('test error', options);
        expect(mockMessage.error).toHaveBeenCalledWith({
          content: 'formatted error',
          error
        });
      });

      it('should pass through additional options', () => {
        const error = new Error('formatted error');
        const options = { error, duration: 5000 };
        dialogHandler.error('test error', options);
        expect(mockMessage.error).toHaveBeenCalledWith({
          content: 'formatted error',
          error,
          duration: 5000
        });
      });
    });

    describe('info', () => {
      it('should call message.info with content', () => {
        dialogHandler.info('test info');
        expect(mockMessage.info).toHaveBeenCalledWith({
          content: 'test info'
        });
      });

      it('should pass through options', () => {
        const options = { duration: 5000 };
        dialogHandler.info('test info', options);
        expect(mockMessage.info).toHaveBeenCalledWith({
          content: 'test info',
          ...options
        });
      });
    });

    describe('warn', () => {
      it('should call message.warning with content', () => {
        dialogHandler.warn('test warning');
        expect(mockMessage.warning).toHaveBeenCalledWith({
          content: 'test warning'
        });
      });

      it('should pass through options', () => {
        const options = { duration: 5000 };
        dialogHandler.warn('test warning', options);
        expect(mockMessage.warning).toHaveBeenCalledWith({
          content: 'test warning',
          ...options
        });
      });
    });
  });

  describe('confirm', () => {
    beforeEach(() => {
      dialogHandler.setModal(mockModal);
    });

    it('should call modal.confirm with options', () => {
      const options = {
        title: 'Confirm',
        content: 'Are you sure?',
        onOk: vi.fn(),
        onCancel: vi.fn()
      };
      dialogHandler.confirm(options);
      expect(mockModal.confirm).toHaveBeenCalledWith(options);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined message api', () => {
      expect(() => dialogHandler.success('test')).not.toThrow();
      expect(() => dialogHandler.error('test')).not.toThrow();
      expect(() => dialogHandler.info('test')).not.toThrow();
      expect(() => dialogHandler.warn('test')).not.toThrow();
    });

    it('should handle undefined modal api', () => {
      const options = {
        title: 'test',
        content: 'test content'
      };
      expect(() => dialogHandler.confirm(options)).not.toThrow();
    });

    it('should handle undefined notification api', () => {
      expect(() =>
        dialogHandler.setNotification(undefined as any)
      ).not.toThrow();
    });
  });
});
