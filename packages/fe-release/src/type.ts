import type { ExecutorContext } from '@qlover/fe-corekit';
import type ReleaseContext from './implments/ReleaseContext';
import type { GithubPRProps } from './plugins/githubPR/GithubPR';
import type {
  ScriptContextInterface,
  ScriptSharedInterface
} from '@qlover/scripts-context';
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

export interface ReleaseConfig extends ScriptSharedInterface {
  githubPR?: GithubPRProps;
  workspaces?: WorkspacesProps;
}

export interface ReleaseContextOptions<T extends ReleaseConfig = ReleaseConfig>
  extends ScriptContextInterface<T> {}

export type StepOption<T> = {
  label: string;
  enabled?: boolean;
  task: () => Promise<T>;
};

export type PackageJson = Record<string, unknown>;

export interface TemplateContext extends ReleaseContextOptions, WorkspaceValue {
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
