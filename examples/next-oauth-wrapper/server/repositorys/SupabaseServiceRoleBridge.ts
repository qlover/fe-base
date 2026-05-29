import { injectable } from '@shared/container';
import { createAdminClient } from '@shared/supabase/admin';
import { SupabaseBridge } from './SupabaseBridge';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase service role bridge
 */
@injectable()
export class SupabaseServiceRoleBridge extends SupabaseBridge {
  /**
   * @override
   */
  public async getSupabase(): Promise<SupabaseClient> {
    return await createAdminClient();
  }
}
