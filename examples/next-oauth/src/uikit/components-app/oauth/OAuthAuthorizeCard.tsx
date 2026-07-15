'use client';

import {
  ArrowPathIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  LockClosedIcon,
  QuestionMarkCircleIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import { AppUserGateway } from '@/impls/AppUserGateway';
import { Button } from '@/uikit/components/Button';
import { useIOC } from '@/uikit/hook/useIOC';
import type { OAuthAuthorizeI18nInterface } from '@config/i18n-mapping/OAuthAuthorizeI18n';
import { resolveScopeLabel } from '@config/i18n-mapping/OAuthAuthorizeI18n';
import type { OAuthAuthorizePageData } from '@qlover/oauth-wrapper';

export interface OAuthAuthorizeCardProps {
  tt: OAuthAuthorizeI18nInterface;
  authorizeData: OAuthAuthorizePageData;
}

export function OAuthAuthorizeCard({
  tt,
  authorizeData
}: OAuthAuthorizeCardProps) {
  const userGateway = useIOC(AppUserGateway);
  const [extraOpen, setExtraOpen] = useState(false);
  const [trust, setTrust] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scopeLabels = useMemo(
    () =>
      authorizeData.scopes.map((scope) => ({
        scope,
        label: resolveScopeLabel(tt, scope)
      })),
    [authorizeData.scopes, tt]
  );

  const scopeParam = authorizeData.scopes.join(' ');

  const submitConsent = useCallback(
    async (action: 'allow' | 'deny') => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const redirectUrl = await userGateway.submitOAuthConsent({
          action,
          client_id: authorizeData.clientId,
          redirect_uri: authorizeData.redirectUri,
          scope: scopeParam || undefined,
          state: authorizeData.state,
          trust: action === 'allow' ? trust : undefined,
          code_challenge: authorizeData.codeChallenge,
          code_challenge_method: authorizeData.codeChallengeMethod
        });

        window.location.assign(redirectUrl);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : tt.errorConsent);
        setLoading(false);
      }
    },
    [authorizeData, userGateway, scopeParam, trust, tt.errorConsent]
  );

  const handleAllow = () => {
    void submitConsent('allow');
  };

  const handleDeny = () => {
    if (!window.confirm(tt.denyConfirm)) {
      return;
    }
    void submitConsent('deny');
  };

  return (
    <div
      data-testid="OAuthAuthorizeCard"
      className="max-w-lg w-full bg-primary rounded-2xl shadow-xl border border-primary-border overflow-hidden"
    >
      {errorMessage && (
        <div
          role="alert"
          className="mx-6 mt-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-3 rounded text-sm text-red-700 dark:text-red-300"
        >
          <ExclamationCircleIcon className="inline h-4 w-4 mr-2" />
          {errorMessage}
        </div>
      )}

      <div className="p-6 border-b border-primary-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand overflow-hidden shrink-0">
            {authorizeData.logoUri ? (
              // eslint-disable-next-line @next/next/no-img-element -- third-party app logos use arbitrary URLs
              <img
                src={authorizeData.logoUri}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <Squares2X2Icon className="h-6 w-6" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary-text">
              {tt.heading}
            </h2>
            <p className="text-sm text-secondary-text">{tt.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="bg-elevated rounded-lg p-4">
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <p className="text-xs text-secondary-text uppercase tracking-wide">
                {tt.appLabel}
              </p>
              <p className="font-semibold text-lg text-primary-text truncate">
                {authorizeData.clientName}
              </p>
              {authorizeData.clientUri && (
                <p className="text-sm text-secondary-text truncate">
                  {authorizeData.clientUri}
                </p>
              )}
            </div>
            <span className="bg-brand/10 text-brand text-xs px-2 py-1 rounded-full shrink-0">
              {tt.oauthBadge}
            </span>
          </div>
        </div>

        <div>
          <button
            type="button"
            className="flex w-full justify-between items-center cursor-pointer text-left"
            onClick={() => setExtraOpen((open) => !open)}
            aria-expanded={extraOpen}
          >
            <p className="text-sm font-medium flex items-center gap-1 text-primary-text">
              <LockClosedIcon className="h-4 w-4" />
              {tt.permissionsLabel}
            </p>
            <ChevronDownIcon
              className={clsx(
                'h-3 w-3 text-secondary-text transition-transform',
                extraOpen && 'rotate-180'
              )}
            />
          </button>
          <div className="mt-2 space-y-2 pl-1">
            {scopeLabels.map(({ scope, label }) => (
              <div
                data-testid="OAuthAuthorizeCard"
                key={scope}
                className="flex items-start gap-2"
              >
                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span className="text-sm text-primary-text">{label}</span>
              </div>
            ))}
          </div>
          <div
            className={clsx(
              'mt-2 pl-5 text-xs text-secondary-text border-l-2 border-brand/40',
              !extraOpen && 'hidden'
            )}
          >
            <p>{tt.extraPermNote}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 gap-2">
          <div className="flex items-center min-w-0">
            <input
              type="checkbox"
              id="trustCheckbox"
              checked={trust}
              onChange={(e) => setTrust(e.target.checked)}
              className="w-4 h-4 text-brand rounded focus:ring-brand shrink-0"
            />
            <label
              htmlFor="trustCheckbox"
              className="ml-2 text-sm text-primary-text"
            >
              {tt.trustOption}
            </label>
          </div>
          <QuestionMarkCircleIcon
            className="h-3.5 w-3.5 text-secondary-text shrink-0"
            title={tt.trustTooltip}
          />
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-3 rounded text-sm text-primary-text">
          <InformationCircleIcon className="inline h-4 w-4 text-amber-600 mr-2" />
          {tt.safetyNote}
        </div>
      </div>

      <div className="p-6 border-t border-primary-border bg-elevated flex flex-col sm:flex-row gap-3">
        <Button
          id="denyBtn"
          variant="secondary"
          className="flex-1"
          disabled={loading}
          onClick={handleDeny}
        >
          {tt.deny}
        </Button>
        <Button
          id="allowBtn"
          variant="primary"
          className="flex-1"
          disabled={loading}
          onClick={handleAllow}
        >
          {tt.allow}
          {loading && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
        </Button>
      </div>
    </div>
  );
}
