import Plugin from '../Plugin';

export default class GithubChangelog extends Plugin {
  override async onExec(): Promise<void> {
    const workspaces = this.context.workspaces!;

    this.context.setWorkspaces(
      workspaces.map((workspace) => ({
        ...workspace,
        changelog: 'githubpr-changelog'
      }))
    );
  }
}
