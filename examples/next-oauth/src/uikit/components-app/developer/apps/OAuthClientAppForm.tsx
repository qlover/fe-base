'use client';

import { clsx } from 'clsx';
import { useState, type FormEvent, type ReactNode } from 'react';
import { oauthInputClass, oauthLabelClass } from '@config/component';

export type OAuthClientFormValues = {
  client_name: string;
  redirect_uris: string;
  client_uri: string;
  logo_uri: string;
  /** `true` = confidential; `false` = public (PKCE, no secret). Immutable after create. */
  confidential: boolean;
};

export const emptyOAuthClientFormValues: OAuthClientFormValues = {
  client_name: '',
  redirect_uris: '',
  client_uri: '',
  logo_uri: '',
  confidential: true
};

const textareaClass = `${oauthInputClass} resize-y min-h-[4.5rem] sm:min-h-[5.5rem]`;
const radioClass =
  'mt-0.5 h-4 w-4 shrink-0 accent-[#7c3aed] border-primary-border';

export interface OAuthClientAppFormLabels {
  appNameLabel: string;
  appNameRequired: string;
  redirectUrisLabel: string;
  redirectUrisPlaceholder: string;
  redirectUrisHint: string;
  clientUriLabel: string;
  logoUriLabel: string;
  logoUriHint: string;
  logoUriInvalid: string;
  clientTypeLabel: string;
  clientTypeConfidential: string;
  clientTypePublic: string;
  clientTypeHint: string;
  clientTypeLockedHint?: string;
}

function LogoPreview({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div
        data-testid="OAuthClientAppFormLogoPlaceholder"
        className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-primary-border bg-secondary text-xs text-secondary-text"
      >
        —
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- external logo URL from developer input
    <img
      data-testid="OAuthClientAppFormLogoPreview"
      src={src}
      alt={alt}
      className="h-12 w-12 rounded-xl border border-primary-border object-cover bg-secondary"
      onError={() => setBroken(true)}
    />
  );
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
  /** Disable all inputs (e.g. while submitting). */
  disabled?: boolean;
}) {
  const {
    formId,
    values,
    fieldErrors = {},
    labels,
    onChange,
    onSubmit,
    footer,
    lockClientType = false,
    disabled = false
  } = props;

  const logoPreviewSrc = values.logo_uri.trim();
  const fieldsDisabled = disabled;

  return (
    <form
      data-testid="OAuthClientAppForm"
      id={formId}
      onSubmit={onSubmit}
      className="space-y-3 sm:space-y-4"
      noValidate
    >
      <div>
        <p className={oauthLabelClass}>{labels.clientTypeLabel}</p>
        <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:gap-3">
          <label
            className={clsx(
              'flex items-start gap-2.5 rounded-lg border px-3 py-2 text-sm text-primary-text',
              values.confidential
                ? 'border-[#7c3aed]/40 bg-[#7c3aed]/5'
                : 'border-primary-border bg-secondary/40',
              fieldsDisabled || lockClientType
                ? 'cursor-default opacity-80'
                : 'cursor-pointer'
            )}
          >
            <input
              type="radio"
              name={`${formId}-confidential`}
              checked={values.confidential}
              disabled={lockClientType || fieldsDisabled}
              onChange={() => onChange({ confidential: true })}
              className={radioClass}
            />
            <span className="font-medium leading-snug">
              {labels.clientTypeConfidential}
            </span>
          </label>
          <label
            className={clsx(
              'flex items-start gap-2.5 rounded-lg border px-3 py-2 text-sm text-primary-text',
              !values.confidential
                ? 'border-[#7c3aed]/40 bg-[#7c3aed]/5'
                : 'border-primary-border bg-secondary/40',
              fieldsDisabled || lockClientType
                ? 'cursor-default opacity-80'
                : 'cursor-pointer'
            )}
          >
            <input
              type="radio"
              name={`${formId}-confidential`}
              checked={!values.confidential}
              disabled={lockClientType || fieldsDisabled}
              onChange={() => onChange({ confidential: false })}
              className={radioClass}
            />
            <span className="font-medium leading-snug">
              {labels.clientTypePublic}
            </span>
          </label>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-secondary-text">
          {lockClientType
            ? (labels.clientTypeLockedHint ?? labels.clientTypeHint)
            : labels.clientTypeHint}
        </p>
      </div>

      <div>
        <label htmlFor={`${formId}-client_name`} className={oauthLabelClass}>
          {labels.appNameLabel}{' '}
          <span className="text-(--fe-color-error)">*</span>
        </label>
        <input
          id={`${formId}-client_name`}
          name="client_name"
          type="text"
          required
          disabled={fieldsDisabled}
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
            className="text-(--fe-color-error) mt-1 text-sm"
            role="alert"
          >
            {fieldErrors.client_name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${formId}-redirect_uris`} className={oauthLabelClass}>
          {labels.redirectUrisLabel}{' '}
          <span className="text-(--fe-color-error)">*</span>
        </label>
        <textarea
          id={`${formId}-redirect_uris`}
          name="redirect_uris"
          required
          rows={3}
          disabled={fieldsDisabled}
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
            className="text-(--fe-color-error) mt-1 text-sm"
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
          disabled={fieldsDisabled}
          value={values.client_uri}
          onChange={(e) => onChange({ client_uri: e.target.value })}
          placeholder="https://your-app.com"
          className={oauthInputClass}
          aria-invalid={!!fieldErrors.client_uri}
        />
        {fieldErrors.client_uri && (
          <p className="text-(--fe-color-error) mt-1 text-sm" role="alert">
            {fieldErrors.client_uri}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${formId}-logo_uri`} className={oauthLabelClass}>
          {labels.logoUriLabel}
        </label>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
          <LogoPreview
            key={logoPreviewSrc}
            src={logoPreviewSrc}
            alt={values.client_name || 'App logo'}
          />
          <div className="min-w-0 flex-1">
            <input
              id={`${formId}-logo_uri`}
              name="logo_uri"
              type="url"
              disabled={fieldsDisabled}
              value={values.logo_uri}
              onChange={(e) => onChange({ logo_uri: e.target.value })}
              placeholder="https://your-app.com/logo.png"
              className={oauthInputClass}
              aria-invalid={!!fieldErrors.logo_uri}
              aria-describedby={`${formId}-logo_uri-hint`}
            />
            {fieldErrors.logo_uri ? (
              <p className="text-(--fe-color-error) mt-1 text-sm" role="alert">
                {fieldErrors.logo_uri}
              </p>
            ) : (
              <p
                id={`${formId}-logo_uri-hint`}
                className="mt-1 text-xs leading-relaxed text-secondary-text"
              >
                {labels.logoUriHint}
              </p>
            )}
          </div>
        </div>
      </div>

      {footer ?? null}
    </form>
  );
}
