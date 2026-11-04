import { describe, expect, it } from 'vitest';
import { ExecutorError } from '@qlover/fe-corekit/executor';
import {
  isStableApiErrorId,
  toClientFacingExecutorError,
  toStableApiExecutorError
} from '../src/server/utils/normalizeApiExecutorError';
import { API_SERVER_ERROR } from '../src/common/config/i18nIdentifiers';

describe('normalizeApiExecutorError', () => {
  it('keeps stable i18n ids', () => {
    expect(isStableApiErrorId('next_kit:api_server_error')).toBe(true);
    expect(isStableApiErrorId('common:v:zod_failed')).toBe(true);
    expect(isStableApiErrorId('authorization_pending')).toBe(true);
    expect(isStableApiErrorId('SupabasePGRSTError')).toBe(false);
  });

  it('maps infrastructure ids to API_SERVER_ERROR', () => {
    const error = new ExecutorError('SupabasePGRSTError', { code: 'PGRST116' });
    const stable = toStableApiExecutorError(error);
    expect(stable.id).toBe(API_SERVER_ERROR);
    expect(stable.cause).toEqual({
      source: 'SupabasePGRSTError',
      cause: { code: 'PGRST116' }
    });
  });

  it('strips server-error diagnostics for the client envelope in production', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const error = new ExecutorError('SupabasePGRSTError', {
        code: 'PGRST116'
      });
      const client = toClientFacingExecutorError(error);
      expect(client.id).toBe(API_SERVER_ERROR);
      expect(client.cause).toBeUndefined();
    } finally {
      process.env.NODE_ENV = prev;
    }
  });

  it('keeps business ExecutorError causes for the client envelope', () => {
    const error = new ExecutorError('api:not_authorized', {
      reason: 'missing_session'
    });
    const client = toClientFacingExecutorError(error);
    expect(client.id).toBe('api:not_authorized');
    expect(client.cause).toEqual({ reason: 'missing_session' });
  });
});
