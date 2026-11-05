'use client';

import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import type { NextOauthChangelogReleaseType } from '@server/render/readNextOauthChangelog';

const EXPANDED_RELEASES = 3;

/**
 * Changelog 页展示文案。
 */
export interface ChangelogContentTtType {
  readonly title: string;
  readonly description: string;
  readonly current: string;
  readonly viewOnGithub: string;
}

/**
 * {@link ChangelogContent} 属性。
 */
export interface ChangelogContentProps {
  readonly releases: readonly NextOauthChangelogReleaseType[];
  readonly currentVersion: string;
  readonly githubUrl: string;
  readonly tt: ChangelogContentTtType;
}

/**
 * 公开更新日志：按版本折叠展示 CHANGELOG 正文。
 */
export function ChangelogContent({
  releases,
  currentVersion,
  githubUrl,
  tt
}: ChangelogContentProps) {
  return (
    <article
      data-testid="ChangelogContent"
      className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12"
    >
      <header className="mb-8">
        <h1 className="mb-3 text-2xl font-bold text-primary-text sm:text-3xl">
          {tt.title}
        </h1>
        <p className="text-sm leading-relaxed text-secondary-text">
          {tt.description}
          <span className="text-tertiary-text"> · </span>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:text-brand-hover"
          >
            {tt.viewOnGithub}
          </a>
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {releases.map((release, index) => (
          <details
            key={release.version}
            id={`v${release.version}`}
            data-testid="ChangelogRelease"
            open={index < EXPANDED_RELEASES}
            className="group rounded-xl border border-primary-border bg-bg-container"
          >
            <summary
              className={clsx(
                'flex cursor-pointer list-none items-center gap-2 px-4 py-3 sm:px-5',
                '[&::-webkit-details-marker]:hidden'
              )}
            >
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-tertiary-text transition-transform group-open:rotate-90" />
              <span className="font-mono text-base font-semibold text-primary-text">
                v{release.version}
              </span>
              {release.version === currentVersion ? (
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                  {tt.current}
                </span>
              ) : null}
            </summary>
            <pre
              className={clsx(
                'overflow-x-auto border-t border-primary-border px-4 py-4 sm:px-5',
                'whitespace-pre-wrap font-sans text-sm leading-relaxed text-secondary-text'
              )}
            >
              {release.body}
            </pre>
          </details>
        ))}
      </div>
    </article>
  );
}
