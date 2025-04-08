import type ReleaseContext from '../../interface/ReleaseContext';
import type { DeepPartial, ExecutorReleaseContext } from '../../type';
import merge from 'lodash/merge';
import baseOptions from './base.template.json';
import Plugin from '../../Plugin';

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

export default class ReleaseIt extends Plugin<ReleaseItProps> {
  constructor(
    readonly context: ReleaseContext,
    props?: ReleaseItProps
  ) {
    super(context, 'releaseIt', props);
  }

  onBefore(_context: ExecutorReleaseContext): void | Promise<void> {
    // override releaseIt options
    this.context.setConfig({
      [this.pluginName]: this.initReleaseOptions(
        this.props
      ) as DeepPartial<ReleaseItProps>
    });
  }

  /**
   * TODO:
   * @see `packages/create-app/src/Compose.ts`
   */
  private replaceTemplate(
    targetFileContent: string,
    context: Record<string, unknown>
  ): string {
    Object.keys(context).forEach((key) => {
      const value = context[key];

      targetFileContent = targetFileContent.replace(
        new RegExp(`\\[TPL:${key}\\]`, 'g'),
        typeof value === 'string' ? value : JSON.stringify(value)
      );
    });

    return targetFileContent;
  }

  initReleaseOptions<T extends ReleaseItProps>(defaultOpts?: T): T {
    // replace pkgName to json
    const optString = this.replaceTemplate(JSON.stringify(baseOptions), {
      projectName: this.context.releasePackageName,
      publishPath: this.context.releasePublishPath
    });

    return merge(JSON.parse(optString), defaultOpts);
  }
}
