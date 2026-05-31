'use client';

import {
  CheckCircleOutlined,
  CopyOutlined,
  ExperimentOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { clsx } from 'clsx';
import { useLocale } from 'next-intl';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { Link } from '@/i18n/routing';
import { OAuthWrapperGateway } from '@/impls/OAuthWrapperGateway';
import { readAppApiJson } from '@/uikit/components-app/developer/apps/readAppApiJson';
import { usePageI18nMapping } from '@/uikit/context/PageI18nContext';
import { useIOC } from '@/uikit/hook/useIOC';
import { useUserAuth } from '@/uikit/hook/useUserAuth';
import {
  buildAuthorizeUrl,
  parseOAuthCallbackUrl,
  randomStateValue,
  type OAuthCallbackParams
} from '@/uikit/utils/oauthPlaygroundUtils';
import type {
  OAuthClientDetail,
  OAuthClientListItem,
  OAuthAuthorizePageData
} from '@qlover/oauth-wrapper';
import {
  computePkceS256Challenge,
  generatePkceVerifier
} from '@qlover/oauth-wrapper';
import type { OAuthPlaygroundI18nInterface } from '@config/i18n-mapping/oauthPlaygroundI18n';
import { ROUTE_LOGIN, ROUTE_OAUTH_TOKEN, ROUTE_USERINFO } from '@config/route';

const labelClass =
  'text-secondary-text mb-1.5 block text-xs font-medium uppercase tracking-wide';
const inputClass =
  'border-primary-border text-primary-text placeholder:text-tertiary-text focus:border-brand focus:ring-brand w-full rounded-lg border bg-bg-container px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-offset-0';
const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand text-on-brand font-medium hover:bg-brand-hover transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed';
const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-primary-border bg-primary text-primary-text font-medium hover:bg-elevated transition disabled:opacity-60 disabled:cursor-not-allowed';

type ValidateResult =
  | { valid: true; data: OAuthAuthorizePageData }
  | { valid: false; error: { errorKey: string; message: string } };

function PlaygroundAlert(props: {
  variant: 'error' | 'success' | 'warning' | 'info';
  children: ReactNode;
  onClose?: () => void;
}) {
  const { variant, children, onClose } = props;
  const styles = {
    error:
      'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300',
    success:
      'bg-green-50 dark:bg-green-900/25 border-green-500 text-green-800 dark:text-green-300',
    warning:
      'bg-amber-50 dark:bg-amber-950/30 border-amber-500 text-amber-900 dark:text-amber-200',
    info: 'bg-brand/5 border-brand/40 text-primary-text'
  }[variant];

  return (
    <div
      data-testid="PlaygroundAlert"
      role="alert"
      className={clsx(
        'border-l-4 p-3 rounded-lg text-sm flex items-start gap-2',
        styles
      )}
    >
      {variant === 'error' && (
        <ExclamationCircleOutlined className="mt-0.5 shrink-0" />
      )}
      {variant === 'success' && (
        <CheckCircleOutlined className="mt-0.5 shrink-0" />
      )}
      {variant === 'warning' && (
        <ExclamationCircleOutlined className="mt-0.5 shrink-0" />
      )}
      {variant === 'info' && <InfoCircleOutlined className="mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-secondary-text hover:text-primary-text shrink-0"
          aria-label="Close"
        >
          ï¿?        </button>
      )}
    </div>
  );
}

function PlaygroundSection(props: {
  title: string;
  step: number;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      data-testid="PlaygroundSection"
      className="border-b border-primary-border last:border-b-0"
    >
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 bg-elevated/50">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-sm font-semibold">
            {props.step}
          </span>
          <h3 className="text-base font-semibold text-primary-text truncate">
            {props.title}
          </h3>
        </div>
        {props.extra}
      </div>
      <div className="px-5 sm:px-6 py-5 space-y-4">{props.children}</div>
    </section>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre
      data-testid="JsonBlock"
      className="mt-2 max-h-64 overflow-auto rounded-lg bg-secondary border border-primary-border p-3 text-xs font-mono text-primary-text"
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export function OAuthPlayground() {
  const tt = usePageI18nMapping<OAuthPlaygroundI18nInterface>();
  const locale = useLocale();
  const { success, loading: authLoading, user } = useUserAuth();
  const consentGateway = useIOC(OAuthWrapperGateway);

  const [clients, setClients] = useState<OAuthClientListItem[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientId, setClientId] = useState<string>();
  const [clientDetail, setClientDetail] = useState<OAuthClientDetail | null>(
    null
  );
  const [redirectUri, setRedirectUri] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [state, setState] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [pkceOptionalEnabled, setPkceOptionalEnabled] = useState(false);
  const [pkceVerifier, setPkceVerifier] = useState('');
  const [pkceChallenge, setPkceChallenge] = useState('');
  const [pkceLoading, setPkceLoading] = useState(false);

  const [validateResult, setValidateResult] = useState<ValidateResult | null>(
    null
  );
  const [validating, setValidating] = useState(false);

  const [consentLoading, setConsentLoading] = useState(false);
  const [callback, setCallback] = useState<OAuthCallbackParams | null>(null);
  const [redirectPreview, setRedirectPreview] = useState<string | null>(null);

  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenResponse, setTokenResponse] = useState<unknown>(null);

  const [userinfoLoading, setUserinfoLoading] = useState(false);
  const [userinfoResponse, setUserinfoResponse] = useState<unknown>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const pkceRequired = clientDetail != null && !clientDetail.confidential;
  const pkceActive = pkceRequired || pkceOptionalEnabled;

  const regeneratePkce = useCallback(async () => {
    setPkceLoading(true);
    try {
      const verifier = generatePkceVerifier(64);
      const challenge = await computePkceS256Challenge(verifier);
      setPkceVerifier(verifier);
      setPkceChallenge(challenge);
      setValidateResult(null);
    } finally {
      setPkceLoading(false);
    }
  }, []);

  const loadClients = useCallback(async () => {
    setClientsLoading(true);
    try {
      const list = await readAppApiJson<OAuthClientListItem[]>(
        await fetch('/api/clients', { credentials: 'include' })
      );
      setClients(list);
      if (list.length > 0 && !clientId) {
        setClientId(list[0].client_id);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to load clients'
      );
    } finally {
      setClientsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (success) {
      void loadClients();
    }
  }, [success, loadClients]);

  useEffect(() => {
    if (!clientId || !success) {
      setClientDetail(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const detail = await readAppApiJson<OAuthClientDetail>(
          await fetch(`/api/clients/${encodeURIComponent(clientId)}`, {
            credentials: 'include'
          })
        );
        if (cancelled) return;
        setClientDetail(detail);
        setRedirectUri(detail.redirect_uris[0] ?? '');
        setSelectedScopes([...detail.scopes]);
        setValidateResult(null);
        setCallback(null);
        setTokenResponse(null);
        setUserinfoResponse(null);
        setPkceOptionalEnabled(false);
        if (!detail.confidential) {
          void regeneratePkce();
        } else {
          setPkceVerifier('');
          setPkceChallenge('');
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(
            err instanceof Error ? err.message : 'Failed to load client'
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clientId, success, regeneratePkce]);

  useEffect(() => {
    if (pkceRequired && !pkceVerifier) {
      void regeneratePkce();
    }
  }, [pkceRequired, pkceVerifier, regeneratePkce]);

  const authorizeUrl = useMemo(() => {
    if (!clientId || !redirectUri) return '';
    return buildAuthorizeUrl(origin, locale, {
      clientId,
      redirectUri,
      scopes: selectedScopes,
      state: state || undefined,
      codeChallenge: pkceActive ? pkceChallenge : undefined,
      codeChallengeMethod: pkceActive ? 'S256' : undefined
    });
  }, [
    clientId,
    redirectUri,
    selectedScopes,
    state,
    origin,
    locale,
    pkceActive,
    pkceChallenge
  ]);

  const scopeParam = selectedScopes.join(' ');

  const validateParams = useCallback(async () => {
    if (!clientId || !redirectUri) return;
    setValidating(true);
    setErrorMessage(null);
    setValidateResult(null);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri
    });
    if (scopeParam) params.set('scope', scopeParam);
    if (state.trim()) params.set('state', state.trim());
    if (pkceActive && pkceChallenge) {
      params.set('code_challenge', pkceChallenge);
      params.set('code_challenge_method', 'S256');
    }

    try {
      const result = await readAppApiJson<ValidateResult>(
        await fetch(`/api/oauth/playground/validate?${params.toString()}`, {
          credentials: 'include'
        })
      );
      setValidateResult(result);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setValidating(false);
    }
  }, [clientId, redirectUri, scopeParam, state, pkceActive, pkceChallenge]);

  const submitConsent = useCallback(
    async (action: 'allow' | 'deny') => {
      if (!clientId || !redirectUri) return;
      setConsentLoading(true);
      setErrorMessage(null);
      setCallback(null);
      setRedirectPreview(null);
      setTokenResponse(null);
      setUserinfoResponse(null);

      try {
        const redirectUrl = await consentGateway.submit({
          action,
          client_id: clientId,
          redirect_uri: redirectUri,
          scope: scopeParam || undefined,
          state: state.trim() || undefined,
          ...(pkceActive && pkceChallenge
            ? {
                code_challenge: pkceChallenge,
                code_challenge_method: 'S256' as const
              }
            : {})
        });
        setRedirectPreview(redirectUrl);
        setCallback(parseOAuthCallbackUrl(redirectUrl));
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Consent submission failed'
        );
      } finally {
        setConsentLoading(false);
      }
    },
    [
      clientId,
      redirectUri,
      scopeParam,
      state,
      consentGateway,
      pkceActive,
      pkceChallenge
    ]
  );

  const exchangeToken = useCallback(async () => {
    if (!callback?.code || !clientId || !redirectUri) {
      setErrorMessage('Authorization code is required');
      return;
    }
    if (pkceActive) {
      if (!pkceVerifier.trim()) {
        setErrorMessage('code_verifier is required for PKCE');
        return;
      }
    } else if (!clientSecret.trim()) {
      setErrorMessage('client_secret is required');
      return;
    }
    setTokenLoading(true);
    setErrorMessage(null);
    try {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: callback.code,
        redirect_uri: redirectUri,
        client_id: clientId
      });
      if (pkceActive) {
        body.set('code_verifier', pkceVerifier.trim());
      } else {
        body.set('client_secret', clientSecret.trim());
      }
      const res = await fetch(ROUTE_OAUTH_TOKEN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
      const result = await readAppApiJson(res);
      setTokenResponse({ status: res.status, body: result });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Token exchange failed'
      );
    } finally {
      setTokenLoading(false);
    }
  }, [callback, clientId, redirectUri, clientSecret, pkceActive, pkceVerifier]);

  const fetchUserinfo = useCallback(async () => {
    const accessToken =
      tokenResponse &&
      typeof tokenResponse === 'object' &&
      tokenResponse !== null &&
      'body' in tokenResponse &&
      typeof (tokenResponse as { body: unknown }).body === 'object' &&
      (tokenResponse as { body: { access_token?: string } }).body?.access_token;

    if (!accessToken) {
      setErrorMessage('No access_token in token response');
      return;
    }

    setUserinfoLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(ROUTE_USERINFO, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const result = await readAppApiJson(res);
      setUserinfoResponse({ status: res.status, body: result });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Userinfo failed');
    } finally {
      setUserinfoLoading(false);
    }
  }, [tokenResponse]);

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const currentStep = useMemo(() => {
    if (userinfoResponse) return 4;
    if (tokenResponse) return 3;
    if (callback) return 2;
    if (validateResult?.valid) return 1;
    return 0;
  }, [validateResult, callback, tokenResponse, userinfoResponse]);

  const stepTitles = [
    tt.stepSession,
    tt.stepClient,
    tt.stepAuthorize,
    tt.stepToken,
    tt.stepUserinfo
  ];

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
    setValidateResult(null);
  };

  const hasAccessToken =
    tokenResponse &&
    typeof tokenResponse === 'object' &&
    tokenResponse !== null &&
    'body' in tokenResponse &&
    (tokenResponse as { body: { access_token?: string } }).body?.access_token;

  return (
    <div data-testid="OAuthPlayground" className="flex flex-1 flex-col">
      <div className="flex flex-1 items-start justify-center px-4 py-8 sm:py-12">
        <div
          data-testid="OAuthPlayground"
          className="w-full max-w-3xl bg-primary rounded-2xl shadow-xl border border-primary-border overflow-hidden"
        >
          <div className="p-6 sm:p-8 border-b border-primary-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xl shrink-0">
                <ExperimentOutlined />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-semibold text-primary-text">
                  {tt.title}
                </h1>
                <p className="text-sm text-secondary-text mt-1 leading-relaxed">
                  {tt.intro}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <PlaygroundAlert variant="info">
                <span>{tt.demoNote}</span>
              </PlaygroundAlert>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {stepTitles.map((title, index) => (
                <span
                  data-testid="OAuthPlayground"
                  key={title}
                  className={clsx(
                    'text-xs px-3 py-1 rounded-full border font-medium transition-colors',
                    index <= currentStep
                      ? 'bg-brand/10 text-brand border-brand/30'
                      : 'bg-elevated text-secondary-text border-primary-border'
                  )}
                >
                  {index + 1}. {title}
                </span>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="px-5 sm:px-6 pt-5">
              <PlaygroundAlert
                variant="error"
                onClose={() => setErrorMessage(null)}
              >
                {errorMessage}
              </PlaygroundAlert>
            </div>
          )}

          <PlaygroundSection title={tt.stepSession} step={1}>
            {authLoading ? (
              <p className="text-secondary-text text-sm flex items-center gap-2">
                <LoadingOutlined spin /> Loading...
              </p>
            ) : success && user ? (
              <p className="text-primary-text text-sm flex items-center gap-2">
                <CheckCircleOutlined className="text-green-500 shrink-0" />
                <span>
                  {tt.signedInAs}{' '}
                  <strong className="font-semibold">{user.email}</strong>
                </span>
              </p>
            ) : (
              <PlaygroundAlert variant="warning">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span>{tt.loginRequired}</span>
                  <Link href={ROUTE_LOGIN} className={primaryButtonClass}>
                    {tt.goLogin}
                  </Link>
                </div>
              </PlaygroundAlert>
            )}
          </PlaygroundSection>

          <PlaygroundSection
            title={tt.stepClient}
            step={2}
            extra={
              <button
                type="button"
                className={clsx(secondaryButtonClass, 'text-sm py-1.5 px-3')}
                onClick={() => void loadClients()}
                disabled={!success || clientsLoading}
              >
                <ReloadOutlined />
              </button>
            }
          >
            <div>
              <label htmlFor="playground-client" className={labelClass}>
                {tt.clientLabel}
              </label>
              <select
                id="playground-client"
                className={inputClass}
                disabled={!success || clientsLoading}
                value={clientId ?? ''}
                onChange={(e) => setClientId(e.target.value)}
              >
                {clients.length === 0 && <option value="">No clients</option>}
                {clients.map((c) => (
                  <option
                    data-testid="OAuthPlayground"
                    key={c.client_id}
                    value={c.client_id}
                  >
                    {c.client_name} ({c.client_id})
                  </option>
                ))}
              </select>
            </div>

            {clientDetail && (
              <div className="space-y-4 rounded-xl bg-elevated border border-primary-border p-4">
                <p className="text-sm text-primary-text">
                  <span className={labelClass}>{tt.clientType}</span>{' '}
                  <span
                    className={clsx(
                      'inline-block text-xs px-2 py-0.5 rounded-full font-medium ml-1',
                      clientDetail.confidential
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300'
                    )}
                  >
                    {clientDetail.confidential ? 'Confidential' : 'Public'}
                  </span>
                  {pkceActive && (
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full font-medium ml-2 bg-brand/10 text-brand border border-brand/30">
                      {tt.pkceEnabled}
                    </span>
                  )}
                </p>

                <div className="rounded-lg border border-primary-border p-4 space-y-3 bg-primary/50">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-primary-text">
                      {tt.pkceTitle}
                    </p>
                    {clientDetail.confidential && (
                      <label className="flex items-center gap-2 text-sm text-primary-text cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pkceOptionalEnabled}
                          onChange={(e) => {
                            const enabled = e.target.checked;
                            setPkceOptionalEnabled(enabled);
                            setValidateResult(null);
                            if (enabled) {
                              void regeneratePkce();
                            } else {
                              setPkceVerifier('');
                              setPkceChallenge('');
                            }
                          }}
                          className="w-4 h-4 rounded border-primary-border text-brand focus:ring-brand"
                        />
                        {tt.pkceOptional}
                      </label>
                    )}
                  </div>
                  {pkceActive ? (
                    <>
                      <p className="text-xs text-secondary-text">
                        {tt.pkceHint}
                      </p>
                      <div>
                        <p className={labelClass}>{tt.pkceVerifier}</p>
                        <textarea
                          readOnly
                          value={pkceVerifier}
                          rows={2}
                          className={clsx(inputClass, 'font-mono text-xs')}
                        />
                      </div>
                      <div>
                        <p className={labelClass}>{tt.pkceChallenge}</p>
                        <textarea
                          readOnly
                          value={pkceChallenge}
                          rows={2}
                          className={clsx(inputClass, 'font-mono text-xs')}
                        />
                      </div>
                      <button
                        type="button"
                        className={secondaryButtonClass}
                        disabled={pkceLoading}
                        onClick={() => void regeneratePkce()}
                      >
                        {pkceLoading && <LoadingOutlined spin />}
                        {tt.pkceRegenerate}
                      </button>
                    </>
                  ) : (
                    <p className="text-xs text-secondary-text">
                      Enable optional PKCE to test S256 with a confidential
                      client, or select a public client.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="playground-redirect" className={labelClass}>
                    {tt.redirectLabel}
                  </label>
                  <select
                    id="playground-redirect"
                    className={inputClass}
                    value={redirectUri}
                    onChange={(e) => {
                      setRedirectUri(e.target.value);
                      setValidateResult(null);
                    }}
                  >
                    {clientDetail.redirect_uris.map((uri) => (
                      <option
                        data-testid="OAuthPlayground"
                        key={uri}
                        value={uri}
                      >
                        {uri}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className={labelClass}>{tt.scopeLabel}</p>
                  <div className="space-y-2">
                    {clientDetail.scopes.map((scope) => (
                      <label
                        data-testid="OAuthPlayground"
                        key={scope}
                        className="flex items-center gap-2 text-sm text-primary-text cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedScopes.includes(scope)}
                          onChange={() => toggleScope(scope)}
                          className="w-4 h-4 rounded border-primary-border text-brand focus:ring-brand"
                        />
                        <code className="text-xs font-mono bg-secondary px-2 py-0.5 rounded">
                          {scope}
                        </code>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="playground-state" className={labelClass}>
                    {tt.stateLabel}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id="playground-state"
                      type="text"
                      className={inputClass}
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="optional"
                    />
                    <button
                      type="button"
                      className={secondaryButtonClass}
                      onClick={() => setState(randomStateValue())}
                    >
                      {tt.randomState}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className={secondaryButtonClass}
                  disabled={
                    !success || validating || (pkceActive && !pkceChallenge)
                  }
                  onClick={() => void validateParams()}
                >
                  {validating && <LoadingOutlined spin />}
                  {tt.validate}
                </button>

                {validateResult?.valid && (
                  <PlaygroundAlert variant="success">
                    {tt.validOk}
                  </PlaygroundAlert>
                )}
                {validateResult && !validateResult.valid && (
                  <PlaygroundAlert variant="error">
                    <p>{validateResult.error.message}</p>
                    <p className="text-xs mt-1 opacity-80 font-mono">
                      {validateResult.error.errorKey}
                    </p>
                  </PlaygroundAlert>
                )}

                {authorizeUrl && (
                  <div>
                    <p className={labelClass}>{tt.authorizeUrl}</p>
                    <div className="flex gap-2">
                      <textarea
                        readOnly
                        value={authorizeUrl}
                        rows={3}
                        className={clsx(
                          inputClass,
                          'font-mono text-xs resize-y'
                        )}
                      />
                      <button
                        type="button"
                        title={tt.copy}
                        className={secondaryButtonClass}
                        onClick={() => void copyText(authorizeUrl)}
                      >
                        <CopyOutlined />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </PlaygroundSection>

          <PlaygroundSection title={tt.stepAuthorize} step={3}>
            <p className="text-sm text-secondary-text">
              {validateResult?.valid
                ? validateResult.data.clientName
                : tt.validate}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={primaryButtonClass}
                disabled={!success || !validateResult?.valid || consentLoading}
                onClick={() => void submitConsent('allow')}
              >
                {consentLoading && <LoadingOutlined spin />}
                {tt.allow}
              </button>
              <button
                type="button"
                className={secondaryButtonClass}
                disabled={!success || !validateResult?.valid || consentLoading}
                onClick={() => void submitConsent('deny')}
              >
                {tt.deny}
              </button>
            </div>

            {redirectPreview && (
              <div className="rounded-xl bg-secondary border border-primary-border p-4 space-y-2">
                <p className={labelClass}>{tt.callback}</p>
                <textarea
                  readOnly
                  value={redirectPreview}
                  rows={2}
                  className={clsx(inputClass, 'font-mono text-xs')}
                />
                {callback && <JsonBlock value={callback} />}
              </div>
            )}
          </PlaygroundSection>

          <PlaygroundSection title={tt.stepToken} step={4}>
            {pkceActive ? (
              <div>
                <p className={labelClass}>{tt.pkceVerifier}</p>
                <textarea
                  readOnly
                  value={pkceVerifier}
                  rows={2}
                  className={clsx(inputClass, 'font-mono text-xs')}
                />
                <p className="text-xs text-secondary-text mt-2">
                  {tt.pkceHint}
                </p>
              </div>
            ) : (
              <div>
                <label htmlFor="playground-secret" className={labelClass}>
                  {tt.secretLabel}
                </label>
                <input
                  id="playground-secret"
                  type="password"
                  autoComplete="off"
                  className={inputClass}
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="client_secret"
                />
              </div>
            )}
            <button
              type="button"
              className={primaryButtonClass}
              disabled={
                !callback?.code ||
                tokenLoading ||
                (pkceActive ? !pkceVerifier.trim() : !clientSecret.trim())
              }
              onClick={() => void exchangeToken()}
            >
              {tokenLoading && <LoadingOutlined spin />}
              {tt.exchange}
            </button>
            {tokenResponse != null && (
              <div>
                <p className={labelClass}>{tt.response}</p>
                <JsonBlock value={tokenResponse} />
              </div>
            )}
          </PlaygroundSection>

          <PlaygroundSection title={tt.stepUserinfo} step={5}>
            <button
              type="button"
              className={primaryButtonClass}
              disabled={!hasAccessToken || userinfoLoading}
              onClick={() => void fetchUserinfo()}
            >
              {userinfoLoading && <LoadingOutlined spin />}
              {tt.fetchUserinfo}
            </button>
            {userinfoResponse != null && (
              <div>
                <p className={labelClass}>{tt.response}</p>
                <JsonBlock value={userinfoResponse} />
              </div>
            )}
          </PlaygroundSection>

          <div className="px-5 sm:px-6 py-4 bg-amber-50 dark:bg-amber-950/30 border-t border-primary-border">
            <p className="text-sm text-primary-text flex items-start gap-2">
              <InfoCircleOutlined className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>{tt.simulatedNote}</span>
            </p>
          </div>
        </div>
      </div>

      <footer className="text-center text-sm text-secondary-text py-6 border-t border-primary-border bg-primary">
        <p>ï¿?2026 {tt.title}</p>
      </footer>
    </div>
  );
}
