'use client';

import type { ReactNode } from 'react';
import { AccountFeedbackForm } from '@/uikit/components-app/account/AccountFeedbackForm';
import type { AccountI18nInterface } from '@config/i18n-mapping/accountI18n';

/**
 * 反馈分区：复用账户反馈表单。
 */
export function SettingsFeedbackPanel({
  tt
}: {
  readonly tt: AccountI18nInterface;
}): ReactNode {
  return (
    <div data-testid="SettingsFeedbackPanel">
      <AccountFeedbackForm tt={tt} />
    </div>
  );
}
