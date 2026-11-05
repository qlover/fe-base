import { randomUUID } from 'crypto';
import { SupabaseRepo } from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
import { FeTables } from '@config/feTables';
import {
  FEEDBACK_SCREENSHOT_BUCKET,
  FEEDBACK_SCREENSHOT_SIGNED_URL_EXPIRES_SEC,
  UserFeedbackGithubSyncStatus,
  UserFeedbackStatus,
  feedbackClientContextSchema,
  userFeedbackCategorySchema,
  userFeedbackGithubSyncStatusSchema,
  userFeedbackStatusSchema,
  type FeedbackClientContextType,
  type UserFeedbackAdminItemType,
  type UserFeedbackCategoryType,
  type UserFeedbackGithubSyncStatusType,
  type UserFeedbackItemPublicType,
  type UserFeedbackStatusType
} from '@schemas/UserFeedbackSchema';
import { RequestAuthUserIdService } from '@server/services/RequestAuthUserIdService';

const SELECT_OWN =
  'id,user_id,category,body,page_url,user_agent,client_context,screenshot_paths,status,created_at' as const;

const SELECT_ADMIN =
  'id,user_id,category,body,page_url,user_agent,client_context,screenshot_paths,status,created_at,github_issue_number,github_issue_url,github_sync_status,github_sync_error,fe_users(display_name)' as const;

const GITHUB_SYNC_ERROR_MAX = 500;

type FeedbackDbRowType = {
  readonly id: string;
  readonly user_id: string;
  readonly category: string;
  readonly body: string;
  readonly page_url: string | null;
  readonly user_agent: string | null;
  readonly client_context: unknown;
  readonly screenshot_paths: string[] | null;
  readonly status: string;
  readonly created_at: string;
};

type FeedbackAdminDbRowType = FeedbackDbRowType & {
  readonly github_issue_number: number | null;
  readonly github_issue_url: string | null;
  readonly github_sync_status: string | null;
  readonly github_sync_error: string | null;
  readonly fe_users:
    | { readonly display_name: string | null }
    | { readonly display_name: string | null }[]
    | null;
};

export type UserFeedbackInsertFieldsType = {
  readonly category: UserFeedbackCategoryType;
  readonly body: string;
  readonly pageUrl: string | null;
  readonly userAgent: string | null;
  readonly clientContext: FeedbackClientContextType | null;
};

export type UserFeedbackGithubSyncFieldsType = {
  readonly status: UserFeedbackGithubSyncStatusType;
  readonly issueNumber: number | null;
  readonly issueUrl: string | null;
  readonly error: string | null;
};

/**
 * 用户反馈表读写（service role + 显式 user_id 约束）。
 */
@injectable()
export class UserFeedbackRepository {
  constructor(
    @inject(SupabaseRepo)
    protected readonly supabaseBridge: SupabaseRepo<unknown>,
    @inject(RequestAuthUserIdService)
    protected readonly requestAuthUserId: RequestAuthUserIdService
  ) {}

  public async insertForCurrentUser(
    fields: UserFeedbackInsertFieldsType
  ): Promise<UserFeedbackItemPublicType> {
    const userId = await this.requestAuthUserId.requireUserId();
    const supabase = this.supabaseBridge.getAdminSupabase();
    const response = await supabase
      .from(FeTables.userFeedback)
      .insert({
        user_id: userId,
        category: fields.category,
        body: fields.body,
        page_url: fields.pageUrl,
        user_agent: fields.userAgent,
        client_context: fields.clientContext,
        screenshot_paths: null,
        status: UserFeedbackStatus.open,
        github_sync_status: UserFeedbackGithubSyncStatus.skipped
      })
      .select(SELECT_OWN)
      .single();
    this.supabaseBridge.throwIfError(response);
    return rowToPublic(response.data as FeedbackDbRowType);
  }

  public async listForCurrentUser(): Promise<UserFeedbackItemPublicType[]> {
    const userId = await this.requestAuthUserId.requireUserId();
    const supabase = this.supabaseBridge.getAdminSupabase();
    const response = await supabase
      .from(FeTables.userFeedback)
      .select(SELECT_OWN)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    this.supabaseBridge.throwIfError(response);
    return ((response.data ?? []) as FeedbackDbRowType[]).map(rowToPublic);
  }

  public async listAllForAdmin(
    limit: number
  ): Promise<UserFeedbackAdminItemType[]> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const response = await supabase
      .from(FeTables.userFeedback)
      .select(SELECT_ADMIN)
      .order('created_at', { ascending: false })
      .limit(limit);
    this.supabaseBridge.throwIfError(response);
    const rows = (response.data ?? []) as FeedbackAdminDbRowType[];
    const items: UserFeedbackAdminItemType[] = [];
    for (const row of rows) {
      const paths = screenshotPathsOf(row);
      const urls = await this.createSignedUrls(paths);
      items.push(mapAdminRow(row, urls));
    }
    return items;
  }

  public async findByIdAsAdmin(
    feedbackId: string
  ): Promise<UserFeedbackAdminItemType | null> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const response = await supabase
      .from(FeTables.userFeedback)
      .select(SELECT_ADMIN)
      .eq('id', feedbackId)
      .maybeSingle();
    this.supabaseBridge.throwIfError(response);
    const row = response.data as FeedbackAdminDbRowType | null;
    if (!row) {
      return null;
    }
    const paths = screenshotPathsOf(row);
    const urls = await this.createSignedUrls(paths);
    return mapAdminRow(row, urls);
  }

  public async findOwnedId(feedbackId: string): Promise<string | null> {
    const userId = await this.requestAuthUserId.requireUserId();
    const supabase = this.supabaseBridge.getAdminSupabase();
    const response = await supabase
      .from(FeTables.userFeedback)
      .select('id')
      .eq('id', feedbackId)
      .eq('user_id', userId)
      .maybeSingle();
    this.supabaseBridge.throwIfError(response);
    const row = response.data as { readonly id: string } | null;
    return row?.id ?? null;
  }

  public async updateScreenshotPathsAsAdmin(
    feedbackId: string,
    userId: string,
    paths: readonly string[]
  ): Promise<readonly string[]> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const response = await supabase
      .from(FeTables.userFeedback)
      .update({
        screenshot_paths: [...paths],
        updated_at: new Date().toISOString()
      })
      .eq('id', feedbackId)
      .eq('user_id', userId)
      .select('screenshot_paths')
      .single();
    this.supabaseBridge.throwIfError(response);
    const row = response.data as { readonly screenshot_paths: string[] | null };
    return row.screenshot_paths ?? [];
  }

  public async uploadScreenshotObject(
    objectPath: string,
    bytes: Buffer,
    contentType: string
  ): Promise<void> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const response = await supabase.storage
      .from(FEEDBACK_SCREENSHOT_BUCKET)
      .upload(objectPath, bytes, {
        contentType,
        upsert: false
      });
    if (response.error) {
      throw new Error(
        `feedback screenshot upload failed: ${response.error.message}`
      );
    }
  }

  public async updateGithubSyncAsAdmin(
    feedbackId: string,
    fields: UserFeedbackGithubSyncFieldsType
  ): Promise<void> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const now = new Date().toISOString();
    const response = await supabase
      .from(FeTables.userFeedback)
      .update({
        github_sync_status: fields.status,
        github_issue_number: fields.issueNumber,
        github_issue_url: fields.issueUrl,
        github_sync_error: fields.error
          ? fields.error.slice(0, GITHUB_SYNC_ERROR_MAX)
          : null,
        github_synced_at:
          fields.status === UserFeedbackGithubSyncStatus.synced ? now : null,
        updated_at: now
      })
      .eq('id', feedbackId);
    this.supabaseBridge.throwIfError(response);
  }

  public async updateStatusByIssueNumberAsAdmin(
    issueNumber: number,
    status: UserFeedbackStatusType
  ): Promise<number> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const response = await supabase
      .from(FeTables.userFeedback)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('github_issue_number', issueNumber)
      .neq('status', status)
      .select('id');
    this.supabaseBridge.throwIfError(response);
    return (response.data ?? []).length;
  }

  public async updateStatusAsAdmin(
    feedbackId: string,
    status: UserFeedbackStatusType
  ): Promise<UserFeedbackStatusType | null> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const response = await supabase
      .from(FeTables.userFeedback)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', feedbackId)
      .select('status')
      .maybeSingle();
    this.supabaseBridge.throwIfError(response);
    if (!response.data) {
      return null;
    }
    return userFeedbackStatusSchema.parse(
      (response.data as { readonly status: string }).status
    );
  }

  /**
   * @param createdBefore - 传入时只统计早于该时刻创建的待处理反馈
   */
  public async countOpenFeedback(createdBefore?: Date): Promise<number> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    let query = supabase
      .from(FeTables.userFeedback)
      .select('id', { count: 'exact', head: true })
      .eq('status', UserFeedbackStatus.open);
    if (createdBefore) {
      query = query.lt('created_at', createdBefore.toISOString());
    }
    const response = await query;
    this.supabaseBridge.throwIfError(response);
    return response.count ?? 0;
  }

  /**
   * 生成临时对象路径：`{userId}/{feedbackId}/{uuid}-{index}.jpg`
   */
  public buildScreenshotObjectPath(
    userId: string,
    feedbackId: string,
    index: number
  ): string {
    return `${userId}/${feedbackId}/${randomUUID()}-${String(index)}.jpg`;
  }

  protected async createSignedUrls(
    paths: readonly string[]
  ): Promise<string[]> {
    if (paths.length === 0) {
      return [];
    }
    const supabase = this.supabaseBridge.getAdminSupabase();
    const urls: string[] = [];
    for (const path of paths) {
      const response = await supabase.storage
        .from(FEEDBACK_SCREENSHOT_BUCKET)
        .createSignedUrl(path, FEEDBACK_SCREENSHOT_SIGNED_URL_EXPIRES_SEC);
      if (response.error || !response.data?.signedUrl) {
        continue;
      }
      urls.push(response.data.signedUrl);
    }
    return urls;
  }
}

function parseClientContext(
  value: unknown
): FeedbackClientContextType | null {
  if (value == null) {
    return null;
  }
  const parsed = feedbackClientContextSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function screenshotPathsOf(row: FeedbackDbRowType): string[] {
  return row.screenshot_paths ?? [];
}

function rowToPublic(row: FeedbackDbRowType): UserFeedbackItemPublicType {
  return {
    id: row.id,
    category: userFeedbackCategorySchema.parse(row.category),
    body: row.body,
    pageUrl: row.page_url,
    status: userFeedbackStatusSchema.parse(row.status),
    createdAt: row.created_at
  };
}

function displayNameOf(row: FeedbackAdminDbRowType): string {
  const profile = Array.isArray(row.fe_users)
    ? row.fe_users[0]
    : row.fe_users;
  const name = profile?.display_name?.trim();
  return name && name.length > 0 ? name : row.user_id.slice(0, 8);
}

/**
 * 管理端行映射（Overview / Admin 列表共用）。
 */
export function mapAdminRow(
  row: FeedbackAdminDbRowType,
  screenshotUrls: readonly string[] = []
): UserFeedbackAdminItemType {
  const paths = screenshotPathsOf(row);
  return {
    id: row.id,
    userId: row.user_id,
    displayName: displayNameOf(row),
    category: userFeedbackCategorySchema.parse(row.category),
    body: row.body,
    pageUrl: row.page_url,
    userAgent: row.user_agent,
    clientContext: parseClientContext(row.client_context),
    screenshotPaths: paths,
    screenshotUrls: [...screenshotUrls],
    status: userFeedbackStatusSchema.parse(row.status),
    githubIssueNumber: row.github_issue_number,
    githubIssueUrl: row.github_issue_url,
    githubSyncStatus: userFeedbackGithubSyncStatusSchema.parse(
      row.github_sync_status ?? UserFeedbackGithubSyncStatus.skipped
    ),
    githubSyncError: row.github_sync_error,
    createdAt: row.created_at
  };
}
