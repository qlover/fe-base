import type { ExecutorContext } from '@qlover/fe-corekit';
import type ReleaseContext from './implments/ReleaseContext';
import type { GithubPRProps } from './plugins/githubPR/GithubPR';
import type { FeScriptContextOptions } from '@qlover/scripts-context';
import type { SharedReleaseOptions } from './interface/ShreadReleaseOptions';
import type {
  WorkspacesProps,
  WorkspaceValue
} from './plugins/workspaces/Workspaces';

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
  githubPR?: GithubPRProps;
  workspaces?: WorkspacesProps;
}

export interface ReleaseContextOptions<T extends ReleaseConfig = ReleaseConfig>
  extends Omit<FeScriptContextOptions<T>, 'constructor'> {
  shared?: SharedReleaseOptions;
}

export type StepOption<T> = {
  label: string;
  enabled?: boolean;
  task: () => Promise<T>;
};

export type PackageJson = Record<string, unknown>;

export interface TemplateContext extends SharedReleaseOptions, WorkspaceValue {
  publishPath: string;

  /**
   * @deprecated  use `releaseEnv` from `shared`
   */
  env: string;

  /**
   * @deprecated  use `sourceBranch` from `shared`
   */
  branch: string;
}
