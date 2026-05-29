import { injectable } from '@shared/container';
import { createAdminClient } from '@shared/supabase/admin';
import { BaseRepo } from './BaseRepo';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase service role bridge
 */
@injectable()
export class SupabaseServiceRoleBridge extends BaseRepo {
  /**
   * @override
   */
  public async getSupabase(): Promise<SupabaseClient> {
    return await createAdminClient();
  }
}
