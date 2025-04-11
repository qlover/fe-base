import type ReleaseContext from '../ReleaseContext';
import merge from 'lodash/merge';
import baseOptions from './base.template.json';
import { SharedReleaseOptions } from '../../interface/ShreadReleaseOptions';
import TemplateJson from '../TemplateJson';

export interface ReleaseItProps extends ReleaseItInstanceOptions {
  /**
   * Receive the `release-it` instance
   */
  releaseIt: ReleaseItInstanceType;
}

export type ReleaseItInstanceType = (
  options: ReleaseItInstanceOptions
) => Promise<ReleaseItInstanceResult>;

export type ReleaseItInstanceOptions = Record<string, unknown>;
export type ReleaseItInstanceResult = {
  changelog: string;
  version: string;
};

export default class ReleaseIt {
  private releaseItInstance: ReleaseItInstanceType;
  private templateOptions: ReleaseItInstanceOptions;
  private templateJson: TemplateJson;

  constructor(
    private context: ReleaseContext,
    props?: ReleaseItProps
  ) {
    const { releaseIt, ...rest } = props || {};

    if (!releaseIt) {
      throw new Error('releaseIt is not set');
    }

    this.templateOptions = merge({}, baseOptions, rest);
    this.releaseItInstance = releaseIt;
    this.templateJson = new TemplateJson();
  }

  /**
   * Run release-it in the publish path
   *
   * Because `release-it` only support signle publish path,
   * so we need to change the current working directory to the publish path.
   *
   * @note This method will change the current working directory to the publish path.
   * @param options - The options for the release-it process.
   * @returns The output from the release-it process.
   */
  async run(
    options?: ReleaseItInstanceOptions
  ): Promise<ReleaseItInstanceResult> {
    if (!this.context.releasePublishPath) {
      throw new Error('publishPath is not set');
    }

    const lastDir = process.cwd();

    try {
      this.context.logger.debug(
        'Switch to publish path to:',
        this.context.releasePublishPath
      );
      process.chdir(this.context.releasePublishPath);

      return await this.releaseItInstance(options!);
    } finally {
      this.context.logger.debug('Switch back to:', lastDir);
      process.chdir(lastDir);
    }
  }

  getOptions(
    context?: SharedReleaseOptions,
    mergeOptions?: Partial<ReleaseItInstanceOptions>
  ): ReleaseItInstanceOptions {
    const options = merge({}, this.templateOptions, mergeOptions);

    if (context && Object.keys(context).length > 0) {
      return this.templateJson.format(
        options,
        context as Record<string, unknown>
      );
    }

    return options;
  }

  publishNpm(): Promise<ReleaseItInstanceResult> {
    return this.run(
      this.getOptions(this.context.getTemplateContext(), {
        ci: true,
        npm: {
          publish: true,
          publishPath: this.context.releasePackageName
        },
        git: {
          requireCleanWorkingDir: false,
          requireUpstream: false,
          changelog: false
        },
        plugins: {
          '@release-it/conventional-changelog': {
            infile: false
          }
        },
        'dry-run': this.context.dryRun,
        verbose: true,
        increment: this.context.getPkg('version')
      })
    );
  }

  createChangelog(): Promise<ReleaseItInstanceResult> {
    return this.run(
      this.getOptions(this.context.getTemplateContext(), {
        ci: true,
        increment: this.context.getConfig('pullRequest.increment') as string,
        npm: {
          publish: false
        },
        git: {
          requireCleanWorkingDir: false,
          tag: false,
          push: false
        },
        github: {
          release: false
        },
        verbose: true,
        'dry-run': this.context.dryRun
      })
    );
  }
}
