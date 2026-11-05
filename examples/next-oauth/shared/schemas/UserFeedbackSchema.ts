import { z } from 'zod';

/**
 * 用户反馈分类。
 */
export const UserFeedbackCategory = {
  bug: 'bug',
  ux: 'ux',
  feature: 'feature',
  performance: 'performance',
  content: 'content',
  other: 'other'
} as const;

export type UserFeedbackCategoryType =
  (typeof UserFeedbackCategory)[keyof typeof UserFeedbackCategory];

export const USER_FEEDBACK_CATEGORIES: readonly UserFeedbackCategoryType[] =
  Object.freeze([
    UserFeedbackCategory.bug,
    UserFeedbackCategory.ux,
    UserFeedbackCategory.feature,
    UserFeedbackCategory.performance,
    UserFeedbackCategory.content,
    UserFeedbackCategory.other
  ]);

export const userFeedbackCategorySchema = z.enum([
  UserFeedbackCategory.bug,
  UserFeedbackCategory.ux,
  UserFeedbackCategory.feature,
  UserFeedbackCategory.performance,
  UserFeedbackCategory.content,
  UserFeedbackCategory.other
]);

/**
 * 反馈 → GitHub Issue 同步状态（本切片默认 skipped）。
 */
export const UserFeedbackGithubSyncStatus = {
  pending: 'pending',
  synced: 'synced',
  failed: 'failed',
  skipped: 'skipped'
} as const;

export type UserFeedbackGithubSyncStatusType =
  (typeof UserFeedbackGithubSyncStatus)[keyof typeof UserFeedbackGithubSyncStatus];

export const userFeedbackGithubSyncStatusSchema = z.enum([
  UserFeedbackGithubSyncStatus.pending,
  UserFeedbackGithubSyncStatus.synced,
  UserFeedbackGithubSyncStatus.failed,
  UserFeedbackGithubSyncStatus.skipped
]);

/**
 * 反馈处理状态。
 */
export const UserFeedbackStatus = {
  open: 'open',
  reviewing: 'reviewing',
  resolved: 'resolved',
  closed: 'closed'
} as const;

export type UserFeedbackStatusType =
  (typeof UserFeedbackStatus)[keyof typeof UserFeedbackStatus];

export const userFeedbackStatusSchema = z.enum([
  UserFeedbackStatus.open,
  UserFeedbackStatus.reviewing,
  UserFeedbackStatus.resolved,
  UserFeedbackStatus.closed
]);

export const feedbackClientContextSchema = z
  .object({
    reportedAt: z.string().trim().min(1).max(64),
    timeZone: z.string().trim().max(120).optional(),
    language: z.string().trim().max(32).optional(),
    userAgent: z.string().trim().max(1000).optional()
  })
  .passthrough();

export type FeedbackClientContextType = z.infer<
  typeof feedbackClientContextSchema
>;

export const userFeedbackCreateBodySchema = z.object({
  category: userFeedbackCategorySchema,
  body: z.string().trim().min(1).max(4000),
  pageUrl: z.string().trim().max(2000).optional(),
  clientContext: feedbackClientContextSchema.optional()
});

export type UserFeedbackCreateBodyType = z.infer<
  typeof userFeedbackCreateBodySchema
>;

export const userFeedbackItemPublicSchema = z.object({
  id: z.string().uuid(),
  category: userFeedbackCategorySchema,
  body: z.string(),
  pageUrl: z.string().nullable(),
  status: userFeedbackStatusSchema,
  createdAt: z.string()
});

export type UserFeedbackItemPublicType = z.infer<
  typeof userFeedbackItemPublicSchema
>;

export const userFeedbackCreateOkSchema = z.object({
  ok: z.literal(true),
  item: userFeedbackItemPublicSchema
});

export type UserFeedbackCreateOkType = z.infer<
  typeof userFeedbackCreateOkSchema
>;

export const userFeedbackListPublicSchema = z.object({
  items: z.array(userFeedbackItemPublicSchema)
});

export type UserFeedbackListPublicType = z.infer<
  typeof userFeedbackListPublicSchema
>;

/** 管理端列表行。 */
export const userFeedbackAdminItemSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  displayName: z.string(),
  category: userFeedbackCategorySchema,
  body: z.string(),
  pageUrl: z.string().nullable(),
  userAgent: z.string().nullable(),
  clientContext: feedbackClientContextSchema.nullable(),
  status: userFeedbackStatusSchema,
  githubIssueNumber: z.number().int().positive().nullable(),
  githubIssueUrl: z.string().nullable(),
  githubSyncStatus: userFeedbackGithubSyncStatusSchema,
  githubSyncError: z.string().nullable(),
  createdAt: z.string()
});

export type UserFeedbackAdminItemType = z.infer<
  typeof userFeedbackAdminItemSchema
>;

export const userFeedbackAdminListSchema = z.object({
  items: z.array(userFeedbackAdminItemSchema)
});

export type UserFeedbackAdminListType = z.infer<
  typeof userFeedbackAdminListSchema
>;

export const userFeedbackAdminStatusPatchSchema = z.object({
  id: z.string().uuid(),
  status: userFeedbackStatusSchema
});

export type UserFeedbackAdminStatusPatchType = z.infer<
  typeof userFeedbackAdminStatusPatchSchema
>;

export const userFeedbackAdminStatusOkSchema = z.object({
  ok: z.literal(true),
  id: z.string().uuid(),
  status: userFeedbackStatusSchema
});

export type UserFeedbackAdminStatusOkType = z.infer<
  typeof userFeedbackAdminStatusOkSchema
>;
