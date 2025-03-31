import { Env } from '@qlover/env-loader';
import { ExecutorContext } from '@qlover/fe-corekit';
import Config from './interface/ReleaseContext';
import ReleaseContext from './interface/ReleaseContext';
import { FeReleaseConfig } from '@qlover/scripts-context';
import { CheckEnvironmentCiOptions } from './plugins/CheckEnvironment';
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

export interface ReleaseConfig
  extends FeReleaseConfig,
    CheckEnvironmentCiOptions {
  releaseIt?: ReleaseItInstanceType;

  /**
   * 是否发布一个PR
   */
  pullRequest?: boolean;
  /**
   * Whether to skip checking the package.json file
   *
   * @default `false`
   */
  skipCheckPackage?: boolean;

  [key: string]: unknown;
}

export type ReleaseContextOptions = Partial<ReleaseContext>;
