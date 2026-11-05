import { injectable } from '@shared/container';
import {
  UserFeedbackCategory,
  type UserFeedbackAdminItemType,
  type UserFeedbackCategoryType
} from '@schemas/UserFeedbackSchema';
import type { GithubIssueCreateInputType } from '@server/interfaces/GithubIssueGatewayInterface';

export type FeedbackReporterContactType = {
  readonly email: string | null;
  readonly phone: string | null;
};

const TITLE_MAX = 256;
const BODY_MAX = 6000;
const NOT_BOUND = '（未绑定）';
const NOT_RECORDED = '（未记录）';

const CATEGORY_LABELS: Readonly<Record<UserFeedbackCategoryType, string>> =
  Object.freeze({
    [UserFeedbackCategory.bug]: '功能异常',
    [UserFeedbackCategory.ux]: '体验优化',
    [UserFeedbackCategory.feature]: '功能建议',
    [UserFeedbackCategory.performance]: '速度卡顿',
    [UserFeedbackCategory.content]: '内容有误',
    [UserFeedbackCategory.other]: '其他'
  });

/**
 * 反馈快照 → 固定模板 Issue 标题 / 正文 / 标签（不读仓库 ISSUE_TEMPLATE）。
 */
@injectable()
export class FeedbackIssueContentBuilder {
  public build(
    source: UserFeedbackAdminItemType,
    contact: FeedbackReporterContactType
  ): GithubIssueCreateInputType {
    const categoryLabel = CATEGORY_LABELS[source.category];
    const summary = Array.from(source.body.replace(/\s+/g, ' ').trim())
      .slice(0, 60)
      .join('');
    const title = Array.from(`[反馈][${categoryLabel}] ${summary}`.trim())
      .slice(0, TITLE_MAX)
      .join('');

    const safeBody = source.body.replace(/@/g, '@\u200b');
    const lines = [
      `## 用户反馈`,
      '',
      safeBody,
      '',
      '---',
      '',
      `- **反馈 ID**：\`${source.id}\``,
      `- **分类**：${categoryLabel}`,
      `- **提交人**：${source.displayName}`,
      `- **邮箱**：${contact.email ?? NOT_BOUND}`,
      `- **手机**：${contact.phone ?? NOT_BOUND}`,
      `- **页面**：${source.pageUrl ?? NOT_RECORDED}`,
      `- **UA**：${source.userAgent ?? NOT_RECORDED}`,
      `- **时间**：${source.createdAt}`,
      '',
      '_截图仅在管理后台查看，不会同步到本 Issue。_'
    ];
    const body = Array.from(lines.join('\n')).slice(0, BODY_MAX).join('');

    return {
      title,
      body,
      labels: [`type:${source.category}`, 'feedback']
    };
  }
}
