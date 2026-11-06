import { ClientSeo } from '@qlover/next-kit/client';
import { ChangelogContent } from '@/uikit/components-pages/ChangelogContent';
import { PagesRoutePage } from '@/uikit/components-pages/PagesRoutePage';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { githubChangelogUrl } from '@config/common';
import { i18nConfig } from '@config/i18n';
import {
  changelogI18n,
  changelogI18nNamespace
} from '@config/i18n-mapping/changelogI18n';
import type { PagesRouteParamsType } from '@server/render/PagesRouteParams';
import { PagesRouteParams } from '@server/render/PagesRouteParams';
import type { NextOauthChangelogReleaseType } from '@server/render/readNextOauthChangelog';
import { readNextOauthChangelog } from '@server/render/readNextOauthChangelog';
import { version as appVersion } from '../../../package.json';
import type { GetStaticPropsContext } from 'next';

interface ChangelogPageProps {
  readonly messages: Record<string, string>;
  readonly releases: NextOauthChangelogReleaseType[];
  readonly currentVersion: string;
}

/**
 * 公开更新日志页：SSG 读取包内 CHANGELOG.md。
 */
export default function ChangelogPage({
  releases,
  currentVersion
}: ChangelogPageProps) {
  const seoMetadata = useI18nMapping(changelogI18n);
  const tt = {
    title: seoMetadata.title,
    description: seoMetadata.description,
    current: seoMetadata.current,
    viewOnGithub: seoMetadata.viewOnGithub
  };

  return (
    <PagesRoutePage
      data-testid="ChangelogPage"
      tt={{ title: seoMetadata.title, adminTitle: seoMetadata.adminTitle }}
      showAdminButton={false}
      showAuthButton
      authButtonLoginOnly
      mainProps={{ className: 'flex flex-1 flex-col bg-primary' }}
    >
      <ClientSeo i18nInterface={seoMetadata} />
      <ChangelogContent
        releases={releases}
        currentVersion={currentVersion}
        githubUrl={githubChangelogUrl}
        tt={tt}
      />
    </PagesRoutePage>
  );
}

export async function getStaticProps({
  params
}: GetStaticPropsContext<PagesRouteParamsType>) {
  const pageParams = new PagesRouteParams(params);
  const messages = await pageParams.getI18nMessages(changelogI18nNamespace);
  const releases = await readNextOauthChangelog();

  return {
    props: {
      messages,
      releases,
      currentVersion: appVersion
    }
  };
}

export async function getStaticPaths() {
  return {
    paths: i18nConfig.supportedLngs.map((locale) => ({
      params: { locale }
    })),
    fallback: false
  };
}
