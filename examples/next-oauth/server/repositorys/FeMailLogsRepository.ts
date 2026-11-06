import { buildIlikeOrString } from '@qlover/next-kit/common';
import { SupabaseRepo } from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
import { FeTables } from '@config/feTables';
import type {
  FeMailLogAdminItemType,
  FeMailLogRowType,
  FeMailProviderType,
  FeMailStatusType,
  FeMailTemplateType
} from '@schemas/FeMailSchema';

function mapAdminItem(row: FeMailLogRowType): FeMailLogAdminItemType {
  return {
    id: row.id,
    toEmail: row.to_email,
    subject: row.subject,
    template: row.template,
    provider: row.provider,
    status: row.status,
    providerMessageId: row.provider_message_id ?? null,
    error: row.error ?? null,
    bodyText: row.body_text ?? null,
    userId: row.user_id ?? null,
    createdIp: row.created_ip ?? null,
    createdAt: row.created_at
  };
}

/**
 * `fe_mail_logs` 数据访问：写入审计、Admin 列表、按邮箱统计发送量。
 */
@injectable()
export class FeMailLogsRepository {
  constructor(
    @inject(SupabaseRepo)
    protected readonly supabaseBridge: SupabaseRepo<unknown>
  ) {}

  /** 写入一条邮件日志。 */
  public async insert(input: {
    toEmail: string;
    subject: string;
    template: FeMailTemplateType;
    provider: FeMailProviderType;
    status: FeMailStatusType;
    providerMessageId?: string | null;
    error?: string | null;
    bodyText?: string | null;
    userId?: string | null;
    createdIp?: string | null;
  }): Promise<void> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase.from(FeTables.mailLogs).insert({
      to_email: input.toEmail,
      subject: input.subject,
      template: input.template,
      provider: input.provider,
      status: input.status,
      provider_message_id: input.providerMessageId ?? null,
      error: input.error ?? null,
      body_text: input.bodyText ?? null,
      user_id: input.userId ?? null,
      created_ip: input.createdIp ?? null
    });
    this.supabaseBridge.throwIfError(result);
  }

  /** Admin 列表：按时间倒序，可按邮箱模糊匹配与模板过滤。 */
  public async listRecent(params: {
    limit?: number;
    email?: string;
    template?: FeMailTemplateType;
  }): Promise<FeMailLogAdminItemType[]> {
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 200);
    const supabase = this.supabaseBridge.getAdminSupabase();
    let query = supabase
      .from(FeTables.mailLogs)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    const email = params.email?.trim() ?? '';
    if (email.length > 0) {
      query = query.or(
        buildIlikeOrString({
          columns: ['to_email'],
          query: email
        })
      );
    }
    if (params.template) {
      query = query.eq('template', params.template);
    }

    const result = await query;
    this.supabaseBridge.throwIfError(result);

    return ((result.data as FeMailLogRowType[]) ?? []).map(mapAdminItem);
  }

  /** 统计某邮箱在 `sinceIso` 之后某模板的发送条数（用于频控）。 */
  public async countRecentByEmail(
    email: string,
    template: FeMailTemplateType,
    sinceIso: string
  ): Promise<number> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.mailLogs)
      .select('id', { count: 'exact', head: true })
      .eq('to_email', email)
      .eq('template', template)
      .gte('created_at', sinceIso);
    this.supabaseBridge.throwIfError(result);
    return result.count ?? 0;
  }
}
