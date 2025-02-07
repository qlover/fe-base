import Plugin from '../Plugin';
import ReleaseContext from '../interface/ReleaseContext';
import { ExecutorReleaseContext, ReleaseItInstanceType } from '../type';

export default class CheckEnvironment extends Plugin {
  readonly pluginName = 'check-environment';

  constructor(context: ReleaseContext, releaseIt?: ReleaseItInstanceType) {
    super(context);

    if (!releaseIt) {
      throw new Error('releaseIt is not required');
    }

    this.hasReleaseIt();

    this.hasGithubToken();
  }

  hasReleaseIt(): boolean {
    if (this.getEnv('FE_RELEASE') === 'false') {
      throw new Error('Skip Release');
    }

    return true;
  }

  hasGithubToken(): boolean {
    const token = this.getEnv('GITHUB_TOKEN') || this.getEnv('PAT_TOKEN');
    if (!token) {
      throw new Error(
        'GITHUB_TOKEN or PAT_TOKEN environment variable is not set.'
      );
    }

    this.setConfig({ githubToken: token });

    return true;
  }

  onBefore(_context: ExecutorReleaseContext): void | Promise<void> {
    this.logger.verbose('CheckEnvironment onBefore');
  }
}
