import { describe, expect, it } from 'vitest';
import { ExecutorError } from '@qlover/fe-corekit/executor';
import {
  isStableApiErrorId,
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
    expect(stable.cause).toEqual({ source: 'SupabasePGRSTError', cause: { code: 'PGRST116' } });
  });
});
