'use client';

import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { OAuthAuthorizeI18nInterface } from '@config/i18n-mapping/OAuthAuthorizeI18n';

export interface OAuthAuthorizeErrorCardProps {
  tt: OAuthAuthorizeI18nInterface;
  message: string;
}

export function OAuthAuthorizeErrorCard({
  tt,
  message
}: OAuthAuthorizeErrorCardProps) {
  return (
    <div
      data-testid="OAuthAuthorizeErrorCard"
      className="max-w-lg w-full bg-primary rounded-2xl shadow-xl border border-primary-border overflow-hidden p-6"
    >
      <div className="flex items-start gap-3">
        <ExclamationCircleOutlined className="text-red-500 text-xl mt-0.5 shrink-0" />
        <div>
          <h2 className="text-xl font-semibold text-primary-text mb-2">
            {tt.heading}
          </h2>
          <p className="text-sm text-secondary-text">{message}</p>
        </div>
      </div>
    </div>
  );
}
