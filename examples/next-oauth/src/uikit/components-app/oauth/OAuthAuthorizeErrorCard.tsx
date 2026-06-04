'use client';

import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

export interface OAuthAuthorizeErrorCardProps {
  heading: ReactNode;
  message: ReactNode;
}

export function OAuthAuthorizeErrorCard({
  heading,
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
            {heading}
          </h2>
          <p className="text-sm text-secondary-text">{message}</p>
        </div>
      </div>
    </div>
  );
}
