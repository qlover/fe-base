import { describe, expect, it } from 'vitest';
import {
  API_INVALID_CREDENTIALS,
  API_SUPABASE_AUTH_ERROR
} from '@config/i18n-identifier/api';
import { supabaseAuthErrorI18n } from '@config/i18n-mapping/supabaseAuthErrorI18n';

describe('supabaseAuthErrorI18n', () => {
  it('maps invalid_credentials to the api i18n key', () => {
    expect(supabaseAuthErrorI18n.invalid_credentials).toBe(
      API_INVALID_CREDENTIALS
    );
  });

  it('maps generic SupabaseAuthApiError', () => {
    expect(supabaseAuthErrorI18n.SupabaseAuthApiError).toBe(
      API_SUPABASE_AUTH_ERROR
    );
  });
});
