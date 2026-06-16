'use client';

import {
  ApiOutlined,
  ExperimentOutlined,
  RocketOutlined
} from '@ant-design/icons';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { usePageI18nMapping } from '@/uikit/context/PageI18nContext';
import { API_OAUTH_VERIFY, API_REFERENCE } from '@config/apiRoutes';
import type { OAuthDocsI18nInterface } from '@config/i18n-mapping/oauthDocsI18n';
import {
  ROUTE_DEVELOPER_APPS,
  ROUTE_OAUTH_AUTHORIZE,
  ROUTE_OAUTH_PLAYGROUND,
  ROUTE_OAUTH_TOKEN,
  ROUTE_OAUTH_USERINFO
} from '@config/route';
import type { ReactNode } from 'react';

const sectionClass = 'scroll-mt-24';
const headingClass =
  'text-lg font-semibold text-primary-text border-b border-primary-border pb-2 mb-4';
const proseClass = 'text-secondary-text text-sm leading-relaxed mb-4';
const codeBlockClass =
  'rounded-lg border border-primary-border bg-elevated p-4 overflow-x-auto';
const codeLineClass = 'text-sm font-mono text-secondary-text whitespace-pre';

function CodeBlock({ children }: { children: string }) {
  return (
    <pre data-testid="CodeBlock" className={codeBlockClass}>
      <code className={codeLineClass}>{children}</code>
    </pre>
  );
}

function DocSection({
  id,
  title,
  children
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      data-testid="DocSection"
      id={id}
      className={clsx(sectionClass, 'mb-10')}
    >
      <h2 className={headingClass}>{title}</h2>
      {children}
    </section>
  );
}

function EndpointTable({
  rows
}: {
  rows: { method: string; path: string; label: string; desc: string }[];
}) {
  return (
    <div
      data-testid="EndpointTable"
      className="overflow-x-auto rounded-xl border border-primary-border"
    >
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead className="bg-elevated text-secondary-text">
          <tr>
            <th className="px-4 py-3 font-medium">Method</th>
            <th className="px-4 py-3 font-medium">Path</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-primary-border">
          {rows.map((row) => (
            <tr
              data-testid="EndpointTable"
              key={row.path}
              className="text-primary-text"
            >
              <td className="px-4 py-3 font-mono text-brand">{row.method}</td>
              <td className="px-4 py-3 font-mono">{row.path}</td>
              <td className="px-4 py-3">{row.label}</td>
              <td className="px-4 py-3 text-secondary-text">{row.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const linkButtonClass =
  'inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary-border bg-primary text-primary-text text-sm font-medium hover:bg-elevated transition';

export function OAuthDocsContent() {
  const tt = usePageI18nMapping<OAuthDocsI18nInterface>();

  const flowSteps = [
    tt.flowStep1,
    tt.flowStep2,
    tt.flowStep3,
    tt.flowStep4,
    tt.flowStep5
  ];

  return (
    <article
      data-testid="OAuthDocsContent"
      className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12"
    >
      <header className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-text mb-3">
          {tt.title}
        </h1>
        <p className={proseClass}>{tt.intro}</p>
        <div className="flex flex-wrap gap-3">
          <Link href={ROUTE_OAUTH_PLAYGROUND} className={linkButtonClass}>
            <ExperimentOutlined />
            {tt.linkPlayground}
          </Link>
          <a
            href={API_REFERENCE}
            className={linkButtonClass}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ApiOutlined />
            {tt.linkApi}
          </a>
          <Link href={ROUTE_DEVELOPER_APPS} className={linkButtonClass}>
            <RocketOutlined />
            {tt.linkDeveloper}
          </Link>
        </div>
      </header>

      <DocSection id="architecture" title={tt.sectionArchitecture}>
        <p className={proseClass}>{tt.architectureBody}</p>
      </DocSection>

      <DocSection id="demo" title={tt.sectionDemo}>
        <p className={proseClass}>{tt.demoBody}</p>
      </DocSection>

      <DocSection id="overview" title={tt.sectionOverview}>
        <p className={proseClass}>{tt.overviewBody}</p>
      </DocSection>

      <DocSection id="flow" title={tt.sectionFlow}>
        <ol className="list-decimal list-inside space-y-2 text-sm text-secondary-text">
          {flowSteps.map((step) => (
            <li
              data-testid="OAuthDocsContent"
              key={step}
              className="leading-relaxed"
            >
              {step}
            </li>
          ))}
        </ol>
      </DocSection>

      <DocSection id="endpoints" title={tt.sectionEndpoints}>
        <EndpointTable
          rows={[
            {
              method: 'POST',
              path: API_OAUTH_VERIFY,
              label: tt.endpointVerify,
              desc: tt.endpointVerifyDesc
            },
            {
              method: 'GET',
              path: ROUTE_OAUTH_AUTHORIZE,
              label: tt.endpointAuthorize,
              desc: tt.endpointAuthorizeDesc
            },
            {
              method: 'POST',
              path: ROUTE_OAUTH_TOKEN,
              label: tt.endpointToken,
              desc: tt.endpointTokenDesc
            },
            {
              method: 'GET',
              path: ROUTE_OAUTH_USERINFO,
              label: tt.endpointUserinfo,
              desc: tt.endpointUserinfoDesc
            }
          ]}
        />
      </DocSection>

      <DocSection id="authorize" title={tt.sectionAuthorize}>
        <p className={proseClass}>{tt.authorizeParams}</p>
        <CodeBlock>{`GET ${ROUTE_OAUTH_AUTHORIZE}?response_type=code
  &client_id=YOUR_CLIENT_ID
  &redirect_uri=https%3A%2F%2Fapp.example%2Fcallback
  &scope=openid%20profile
  &state=RANDOM_STATE
  &code_challenge=CHALLENGE
  &code_challenge_method=S256`}</CodeBlock>
      </DocSection>

      <DocSection id="token" title={tt.sectionToken}>
        <h3 className="text-sm font-semibold text-primary-text mb-2">
          {tt.tokenAuthCode}
        </h3>
        <CodeBlock>{`POST ${ROUTE_OAUTH_TOKEN}
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=AUTH_CODE
&redirect_uri=https%3A%2F%2Fapp.example%2Fcallback
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&code_verifier=VERIFIER`}</CodeBlock>
        <h3 className="text-sm font-semibold text-primary-text mb-2 mt-6">
          {tt.tokenRefresh}
        </h3>
        <CodeBlock>{`POST ${ROUTE_OAUTH_TOKEN}
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&refresh_token=REFRESH_TOKEN
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET`}</CodeBlock>
        <p className={clsx(proseClass, 'mt-4 text-xs')}>
          {`// 200 OK\n{\n  "access_token": "...",\n  "token_type": "Bearer",\n  "expires_in": 3600,\n  "refresh_token": "...",\n  "scope": "openid profile"\n}`}
        </p>
      </DocSection>

      <DocSection id="pkce" title={tt.sectionPkce}>
        <p className={proseClass}>{tt.pkceBody}</p>
      </DocSection>

      <DocSection id="userinfo" title={tt.sectionUserinfo}>
        <p className={proseClass}>{tt.userinfoBody}</p>
        <CodeBlock>{`GET ${ROUTE_OAUTH_USERINFO}
Authorization: Bearer ACCESS_TOKEN`}</CodeBlock>
      </DocSection>

      <DocSection id="errors" title={tt.sectionErrors}>
        <p className={proseClass}>{tt.errorsBody}</p>
      </DocSection>
    </article>
  );
}
