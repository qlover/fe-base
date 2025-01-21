import Plugin from '../Plugin';
import ReleaseContext from '../ReleaseContext';

export default class CheckEnvironment extends Plugin {
  readonly pluginName = 'check-environment';

  constructor(context: ReleaseContext) {
    super(context);

    this.hasReleaseIt();

    this.hasGithubToken();
  }

  hasReleaseIt(): boolean {
    if (this.env.get('FE_RELEASE') === 'false') {
      throw new Error('Skip Release');
    }

    return true;
  }

  hasGithubToken(): boolean {
    const token = this.env.get('GITHUB_TOKEN') || this.env.get('PAT_TOKEN');
    if (!token) {
      throw new Error(
        'GITHUB_TOKEN or PAT_TOKEN environment variable is not set.'
      );
    }

    return true;
  }
}
