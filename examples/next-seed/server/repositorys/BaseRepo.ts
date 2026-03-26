import { inject } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import { SupabaseBridge } from './SupabaseBridge';
import type { LoggerInterface } from '@qlover/logger';
import type { SupabaseClient } from '@supabase/supabase-js';

export class BaseRepo {
  @inject(SupabaseBridge)
  protected supabaseBridge!: SupabaseBridge;

  @inject(I.Logger)
  protected logger!: LoggerInterface;

  public getSupabase(): Promise<SupabaseClient> {
    return this.supabaseBridge.getSupabase();
  }

  constructor(
    /**
     * 仓库名称
     *
     * 同时对应表名
     *
     * 例如：
     * - repoName: 'users'
     * - 表名: 'users'
     *
     * - repoName: 'posts'
     * - 表名: 'posts'
     *
     */
    public repoName: string
  ) {}
}
