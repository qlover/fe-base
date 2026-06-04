'use client';

import { oauthInputClass, oauthLabelClass } from '@config/component';
import type { FormEvent, ReactNode } from 'react';

export type OAuthClientFormValues = {
  client_name: string;
  redirect_uris: string;
  client_uri: string;
  /** `true` = confidential; `false` = public (PKCE, no secret). Immutable after create. */
  confidential: boolean;
};

export const emptyOAuthClientFormValues: OAuthClientFormValues = {
  client_name: '',
  redirect_uris: '',
  client_uri: '',
  confidential: true
};

const textareaClass = `${oauthInputClass} resize-y min-h-[5.5rem]`;

export interface OAuthClientAppFormLabels {
  appNameLabel: string;
  appNameRequired: string;
  redirectUrisLabel: string;
  redirectUrisPlaceholder: string;
  redirectUrisHint: string;
  clientUriLabel: string;
  clientTypeLabel: string;
  clientTypeConfidential: string;
  clientTypePublic: string;
  clientTypeHint: string;
  clientTypeLockedHint?: string;
}

export function OAuthClientAppForm(props: {
  formId: string;
  values: OAuthClientFormValues;
  fieldErrors?: Partial<Record<keyof OAuthClientFormValues, string>>;
  labels: OAuthClientAppFormLabels;
  onChange: (patch: Partial<OAuthClientFormValues>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  footer?: ReactNode | null;
  /** When true, client type cannot be changed (edit mode). */
  lockClientType?: boolean;
}) {
  const {
    formId,
    values,
    fieldErrors = {},
    labels,
    onChange,
    onSubmit,
    footer,
    lockClientType = false
  } = props;

  return (
    <form
      data-testid="OAuthClientAppForm"
      id={formId}
      onSubmit={onSubmit}
      className="space-y-4"
      noValidate
    >
      <div>
        <p className={oauthLabelClass}>{labels.clientTypeLabel}</p>
        <div className="flex flex-col sm:flex-row gap-3 mt-1">
          <label className="flex items-start gap-2 text-sm text-primary-text cursor-pointer">
            <input
              type="radio"
              name={`${formId}-confidential`}
              checked={values.confidential}
              disabled={lockClientType}
              onChange={() => onChange({ confidential: true })}
              className="mt-1"
            />
            <span>
              <span className="font-medium">
                {labels.clientTypeConfidential}
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm text-primary-text cursor-pointer">
            <input
              type="radio"
              name={`${formId}-confidential`}
              checked={!values.confidential}
              disabled={lockClientType}
              onChange={() => onChange({ confidential: false })}
              className="mt-1"
            />
            <span>
              <span className="font-medium">{labels.clientTypePublic}</span>
            </span>
          </label>
        </div>
        <p className="text-xs text-secondary-text mt-1">
          {lockClientType
            ? (labels.clientTypeLockedHint ?? labels.clientTypeHint)
            : labels.clientTypeHint}
        </p>
      </div>

      <div>
        <label htmlFor={`${formId}-client_name`} className={oauthLabelClass}>
          {labels.appNameLabel} <span className="text-red-500">*</span>
        </label>
        <input
          id={`${formId}-client_name`}
          name="client_name"
          type="text"
          required
          value={values.client_name}
          onChange={(e) => onChange({ client_name: e.target.value })}
          placeholder="My Application"
          className={oauthInputClass}
          aria-invalid={!!fieldErrors.client_name}
          aria-describedby={
            fieldErrors.client_name ? `${formId}-client_name-error` : undefined
          }
        />
        {fieldErrors.client_name && (
          <p
            id={`${formId}-client_name-error`}
            className="text-red-500 mt-1 text-sm"
            role="alert"
          >
            {fieldErrors.client_name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${formId}-redirect_uris`} className={oauthLabelClass}>
          {labels.redirectUrisLabel} <span className="text-red-500">*</span>
        </label>
        <textarea
          id={`${formId}-redirect_uris`}
          name="redirect_uris"
          required
          rows={3}
          value={values.redirect_uris}
          onChange={(e) => onChange({ redirect_uris: e.target.value })}
          placeholder={labels.redirectUrisPlaceholder}
          className={textareaClass}
          aria-invalid={!!fieldErrors.redirect_uris}
          aria-describedby={
            fieldErrors.redirect_uris
              ? `${formId}-redirect_uris-error`
              : `${formId}-redirect_uris-hint`
          }
        />
        {fieldErrors.redirect_uris ? (
          <p
            id={`${formId}-redirect_uris-error`}
            className="text-red-500 mt-1 text-sm"
            role="alert"
          >
            {fieldErrors.redirect_uris}
          </p>
        ) : (
          <p
            id={`${formId}-redirect_uris-hint`}
            className="text-xs text-secondary-text mt-1"
          >
            {labels.redirectUrisHint}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${formId}-client_uri`} className={oauthLabelClass}>
          {labels.clientUriLabel}
        </label>
        <input
          id={`${formId}-client_uri`}
          name="client_uri"
          type="url"
          value={values.client_uri}
          onChange={(e) => onChange({ client_uri: e.target.value })}
          placeholder="https://your-app.com"
          className={oauthInputClass}
          aria-invalid={!!fieldErrors.client_uri}
        />
        {fieldErrors.client_uri && (
          <p className="text-red-500 mt-1 text-sm" role="alert">
            {fieldErrors.client_uri}
          </p>
        )}
      </div>

      {footer ?? null}
    </form>
  );
}
