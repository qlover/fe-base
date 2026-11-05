import { z } from 'zod';
import { userFeedbackAdminItemSchema } from './UserFeedbackSchema';

/**
 * 概览时间范围（天）：1 = 今天（北京时间 0 点起），7 / 30 = 滚动窗口。
 */
export const AdminOverviewRange = {
  today: 1,
  week: 7,
  month: 30
} as const;

export type AdminOverviewRangeType =
  (typeof AdminOverviewRange)[keyof typeof AdminOverviewRange];

export const adminOverviewQuerySchema = z.object({
  range: z
    .enum(['1', '7', '30'])
    .default('7')
    .transform((value): AdminOverviewRangeType => {
      return Number(value) as AdminOverviewRangeType;
    })
});

export type AdminOverviewQueryType = z.infer<typeof adminOverviewQuerySchema>;

const countSchema = z.number().int().nonnegative();

/**
 * 模板域 KPI（无学习 / 反馈指标）。
 */
export const adminOverviewMetricsSchema = z.object({
  signups: countSchema,
  activeUsers: countSchema,
  feedback: countSchema
});

export type AdminOverviewMetricsType = z.infer<
  typeof adminOverviewMetricsSchema
>;

export const AdminOverviewTrendGranularity = {
  hour: 'hour',
  day: 'day'
} as const;

export type AdminOverviewTrendGranularityType =
  (typeof AdminOverviewTrendGranularity)[keyof typeof AdminOverviewTrendGranularity];

export const adminOverviewTrendSchema = z.object({
  granularity: z.enum([
    AdminOverviewTrendGranularity.hour,
    AdminOverviewTrendGranularity.day
  ]),
  points: z.array(
    z.object({
      /** 桶起点（北京时间本地时刻，`YYYY-MM-DDTHH:mm`） */
      bucket: z.string(),
      activeUsers: countSchema,
      signups: countSchema
    })
  )
});

export type AdminOverviewTrendType = z.infer<typeof adminOverviewTrendSchema>;

export const adminOverviewFailuresSchema = z.object({
  last24h: countSchema,
  previous24h: countSchema,
  top: z.array(
    z.object({
      category: z.string(),
      type: z.string(),
      count: countSchema,
      lastAt: z.string()
    })
  )
});

export type AdminOverviewFailuresType = z.infer<
  typeof adminOverviewFailuresSchema
>;

export const adminOverviewFeedbackTodoSchema = z.object({
  openTotal: countSchema,
  /** 待处理超过 48 小时 */
  openStale: countSchema
});

export type AdminOverviewFeedbackTodoType = z.infer<
  typeof adminOverviewFeedbackTodoSchema
>;

/** 配置检查项（oauth 模板域） */
export const AdminOverviewCheckKey = {
  encryptionKey: 'encryptionKey',
  serviceRoleKey: 'serviceRoleKey',
  openai: 'openai',
  mailProvider: 'mailProvider',
  mailResendApiKey: 'mailResendApiKey'
} as const;

export type AdminOverviewCheckKeyType =
  (typeof AdminOverviewCheckKey)[keyof typeof AdminOverviewCheckKey];

/** ok 正常；warn 需要处理；off 功能未启用（非错误） */
export const AdminOverviewCheckState = {
  ok: 'ok',
  warn: 'warn',
  off: 'off'
} as const;

export type AdminOverviewCheckStateType =
  (typeof AdminOverviewCheckState)[keyof typeof AdminOverviewCheckState];

export const adminOverviewCheckSchema = z.object({
  key: z.enum([
    AdminOverviewCheckKey.encryptionKey,
    AdminOverviewCheckKey.serviceRoleKey,
    AdminOverviewCheckKey.openai,
    AdminOverviewCheckKey.mailProvider,
    AdminOverviewCheckKey.mailResendApiKey
  ]),
  state: z.enum([
    AdminOverviewCheckState.ok,
    AdminOverviewCheckState.warn,
    AdminOverviewCheckState.off
  ])
});

export type AdminOverviewCheckType = z.infer<typeof adminOverviewCheckSchema>;

/**
 * 概览响应：各模块按当前用户权限裁剪，无权限的模块为 null。
 */
export const adminOverviewSchema = z.object({
  range: z.union([z.literal(1), z.literal(7), z.literal(30)]),
  generatedAt: z.string(),
  metrics: z
    .object({
      current: adminOverviewMetricsSchema,
      previous: adminOverviewMetricsSchema
    })
    .nullable(),
  trend: adminOverviewTrendSchema.nullable(),
  feedbackTodo: adminOverviewFeedbackTodoSchema.nullable(),
  latestFeedback: z.array(userFeedbackAdminItemSchema).nullable(),
  failures: adminOverviewFailuresSchema.nullable(),
  checks: z.array(adminOverviewCheckSchema).nullable()
});

export type AdminOverviewType = z.infer<typeof adminOverviewSchema>;
