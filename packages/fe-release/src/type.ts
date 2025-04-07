import type { ExecutorContext } from '@qlover/fe-corekit';
import type ReleaseContext from './interface/ReleaseContext';
import type { PublishNpmProps } from './plugins/PublishNpm';
import type { EnvironmentProps } from './plugins/CheckEnvironment';
import { ReleasePullRequestProps } from './plugins/CreateReleasePullRequest';

export interface ExecutorReleaseContext
  extends ExecutorContext<ReleaseContext> {
  returnValue: ReleaseReturnValue;
}

export type ReleaseReturnValue = {
  githubToken?: string;
  [key: string]: unknown;
};

export type ReleaseItInstanceOptions = Record<string, unknown>;
export type ReleaseItInstanceResult = {
  changelog: string;
  version: string;
};
export type ReleaseItInstanceType = (
  options: ReleaseItInstanceOptions
) => Promise<ReleaseItInstanceResult>;

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export interface ReleaseConfig {
  environment?: EnvironmentProps;

  publishNpm?: PublishNpmProps;

  pullRequest?: ReleasePullRequestProps;

  releaseIt: ReleaseItInstanceType;
}

export type ReleaseContextOptions<T extends ReleaseConfig = ReleaseConfig> =
  Partial<
    Omit<
      ReleaseContext<T>,
      | 'releasePR'
      | 'setConfig'
      | 'getConfig'
      | 'getInitEnv'
      | 'getEnv'
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
