import Plugin from '../Plugin';
import ReleaseContext from '../interface/ReleaseContext';

export default class CheckEnvironment extends Plugin {
  readonly pluginName = 'check-environment';

  constructor(context: ReleaseContext) {
    super(context);

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
}
