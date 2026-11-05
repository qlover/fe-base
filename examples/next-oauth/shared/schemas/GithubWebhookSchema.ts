import { z } from 'zod';

/**
 * GitHub Webhook 事件名（请求头 `X-GitHub-Event`）中本应用处理的部分。
 */
export const GithubWebhookEvent = {
  ping: 'ping',
  issues: 'issues'
} as const;

/**
 * Issue 关闭原因（`issue.state_reason`）。
 */
export const GithubIssueStateReason = {
  completed: 'completed',
  notPlanned: 'not_planned',
  duplicate: 'duplicate',
  reopened: 'reopened'
} as const;

/**
 * `issues` 事件载荷：只取状态同步需要的字段。
 */
export const githubIssueEventSchema = z.object({
  action: z.string().min(1),
  issue: z.object({
    number: z.number().int().positive(),
    state_reason: z.string().nullable().optional()
  }),
  repository: z.object({
    full_name: z.string().min(1)
  })
});

export type GithubIssueEventType = z.infer<typeof githubIssueEventSchema>;

/** Webhook 处理结果。 */
export const githubWebhookResultSchema = z.object({
  ok: z.literal(true),
  event: z.string(),
  updated: z.number().int().nonnegative()
});

export type GithubWebhookResultType = z.infer<typeof githubWebhookResultSchema>;
