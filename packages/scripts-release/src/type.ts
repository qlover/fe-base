import { Env } from '@qlover/env-loader';
import { ExecutorContext } from '@qlover/fe-utils';
import Config from './ReleaseContext';
import ReleaseContext from './ReleaseContext';
import { FeReleaseConfig } from '@qlover/scripts-context';
export interface ExecutorReleaseContext
  extends ExecutorContext<ReleaseContext> {
  returnValue: ReleaseReturnValue;
}

export type ReleaseReturnValue = {
  githubToken?: string;
  [key: string]: unknown;
};

export interface ReleaseOptions {
  config: Config;

  path?: string;
  mode?: string;
  releaseBranch?: string;
  releaseEnv?: string;

  env?: Env;
  packageJson?: Record<string, unknown>;

  releaseIt?: ReleaseItInstanceType;

  npmToken?: string;

  [key: string]: unknown;
}

export type ReleaseItInstanceType = (
  options: Record<string, unknown>
) => Promise<Record<string, unknown>>;

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export interface ReleaseConfig extends FeReleaseConfig {
  /**
   * package.json
   */
  packageJson?: Record<string, unknown>;

  releaseIt?: ReleaseItInstanceType;

  [key: string]: unknown;
}

export type ReleaseContextOptions = Partial<ReleaseContext>;
