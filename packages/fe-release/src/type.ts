import type { ExecutorContext } from '@qlover/fe-corekit';
import type ReleaseContext from './interface/ReleaseContext';
import type { PublishNpmProps } from './plugins/PublishNpm';
import type { ReleasePullRequestProps } from './plugins/CreateReleasePullRequest';
import type { ReleaseItProps } from './plugins/release-it/ReleaseIt';
import type { FeScriptContextOptions } from '@qlover/scripts-context';
import type { SharedReleaseOptions } from './interface/ShreadReleaseOptions';
import type { WorkspacesProps } from './plugins/workspaces/Workspaces';

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
  publishNpm?: PublishNpmProps;

  pullRequest?: ReleasePullRequestProps;

  releaseIt: ReleaseItProps;
  workspaces?: WorkspacesProps;
}

export interface ReleaseContextOptions<T extends ReleaseConfig = ReleaseConfig>
  extends Omit<FeScriptContextOptions<T>, 'constructor'> {
  shared?: SharedReleaseOptions;
}

export type StepOption<T> = {
  label: string;
  task: () => Promise<T>;
};

export type UserInfoType = {
  repoName: string;
  authorName: string;
};

export type PackageJson = Record<string, unknown>;
