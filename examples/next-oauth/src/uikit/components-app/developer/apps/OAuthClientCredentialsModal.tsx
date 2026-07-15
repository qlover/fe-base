'use client';

import { Button } from '@/uikit/components/Button';
import { DeveloperOverlayModal } from '@/uikit/components-app/developer/DeveloperOverlayModal';
import { oauthLabelClass } from '@config/component';
import { CopyableCredential } from './CopyableCredential';

export interface OAuthCredentials {
  clientId: string;
  clientSecret?: string;
  confidential: boolean;
}

export function OAuthClientCredentialsModal(props: {
  open: boolean;
  credentials: OAuthCredentials | null;
  title: string;
  clientIdLabel: string;
  clientSecretLabel: string;
  secretWarning: string;
  publicClientNote?: string;
  confirmLabel: string;
  onCopyClientId: () => void;
  onCopySecret: () => void;
  onClose: () => void;
}) {
  const {
    open,
    credentials,
    title,
    clientIdLabel,
    clientSecretLabel,
    secretWarning,
    publicClientNote,
    confirmLabel,
    onCopyClientId,
    onCopySecret,
    onClose
  } = props;

  return (
    <DeveloperOverlayModal
      open={open}
      title={title}
      onClose={onClose}
      maxWidthClass="max-w-lg"
      closeOnBackdrop={false}
      footer={
        <div className="flex justify-end">
          <Button variant="primary" onClick={onClose}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {credentials && (
        <div className="space-y-4">
          <div>
            <label className={oauthLabelClass}>{clientIdLabel}</label>
            <CopyableCredential
              value={credentials.clientId}
              onCopy={onCopyClientId}
            />
          </div>
          {credentials.confidential && credentials.clientSecret ? (
            <div>
              <label className={oauthLabelClass}>{clientSecretLabel}</label>
              <CopyableCredential
                value={credentials.clientSecret}
                onCopy={onCopySecret}
              />
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                {secretWarning}
              </p>
            </div>
          ) : (
            <p className="text-sm text-secondary-text rounded-lg bg-elevated border border-primary-border p-3">
              {publicClientNote ??
                'Public client: no client_secret. Use PKCE in your SPA or mobile app.'}
            </p>
          )}
        </div>
      )}
    </DeveloperOverlayModal>
  );
}
