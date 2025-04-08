import type { ExecutorContext } from '@qlover/fe-corekit';
import type ReleaseContext from './interface/ReleaseContext';
import type { PublishNpmProps } from './plugins/PublishNpm';
import type { EnvironmentProps } from './plugins/CheckEnvironment';
import { ReleasePullRequestProps } from './plugins/CreateReleasePullRequest';
import { ReleaseItProps } from './plugins/release-it/ReleaseIt';

export interface ExecutorReleaseContext
  extends ExecutorContext<ReleaseContext> {
  returnValue: ReleaseReturnValue;
}

export type ReleaseReturnValue = {
  githubToken?: string;
  [key: string]: unknown;
};

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export interface ReleaseConfig {
  environment?: EnvironmentProps;

  publishNpm?: PublishNpmProps;

  pullRequest?: ReleasePullRequestProps;

  releaseIt: ReleaseItProps;
}

export type ReleaseContextOptions<T extends ReleaseConfig = ReleaseConfig> =
  Partial<
    Omit<
      ReleaseContext<T>,
      | 'releasePR'
      | 'releasePackageName'
      | 'env'
      | 'setConfig'
      | 'getConfig'
      | 'getPkg'
    >
  >;

export type StepOption<T> = {
  label: string;
  task: () => Promise<T>;
};

export type UserInfoType = {
  repoName: string;
  authorName: string;
};
