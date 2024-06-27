import { Shell } from './shell.js';
import { Logger } from './logger.js';

const ContentTpl = {
  PR_TITLE_TPL: '[From bot] Release {mainBranch} v{tagName} from {env}',
  PR_BODY_TPL: 'This PR includes version bump to v{tagName}',
  RELEASE_BRANCH: '{env}-release-v{tagName}',

  getReleaseBranch(tagName, env) {
    return ContentTpl.RELEASE_BRANCH.replace('{env}', env).replace(
      '{tagName}',
      tagName
    );
  },
  getPRtitle(mainBranch, tagName, env) {
    return ContentTpl.PR_TITLE_TPL.replace('{mainBranch}', mainBranch)
      .replace('{tagName}', tagName)
      .replace('{env}', env);
  },
  getPRBody(tagName) {
    return ContentTpl.PR_BODY_TPL.replace('{tagName}', tagName);
  }
};

export class Release {
  /**
   * @param {Object} config
   * @param {import('@octokit/rest').Octokit} config.octokit
   * @param {string} config.prBranch
   * @param {string} config.owner
   * @param {string} config.repo
   * @param {string} config.pkgVersion
   * @param {string} config.ghToken
   */
  constructor(config) {
    const { prBranch, owner, repo, ghToken } = config;

    this.octokit = config.octokit;

    this.mainBranch = prBranch;
    this.owner = owner;
    this.repo = repo;
    this.pkgVersion = config.pkgVersion;
    this.ghToken = ghToken;

    this.log = new Logger();
    this.shell = new Shell();
    this.npmToken = process.env.NPM_TOKEN;
    this.env = process.env.NODE_ENV;
  }

  getPRNumber(output) {
    const prUrlPattern = /https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/(\d+)/;
    const match = output.match(prUrlPattern);
    return (match && match[1]) || '';
  }

  async publish() {
    if (process.env.RELEASE === 'false') {
      this.log.log('Skip Release');
      return;
    }

    this.log.log('Publishing to NPM and GitHub...');

    await this.shell.exec(
      `echo "${this.ghToken}" | gh auth login --with-token`
    );

    await this.shell.exec(
      `echo "//registry.npmjs.org/:_authToken=${this.npmToken}" > .npmrc`
    );

    await this.shell.exec('npx release-it --ci');

    // await this.shell.exec('npx release-it --ci', {
    //   env: {
    //     ...process.env,
    //     // NPM_TOKEN: this.npmToken,
    //     // GITHUB_TOKEN: this.ghToken
    //   }
    // });

    this.log.log('Publishing to NPM successfully');
  }

  async checkTag() {
    // .release-it git push is false, push tags
    const tagResult = await this.shell.exec(`git tag`, { silent: true });

    let tags = tagResult.toString().trim().split('\n');
    tags = tags.map((item) => item.replace(/v/g, '')).sort();

    this.log.log('All Tags:', tags);

    // FIXME: Tagname can be modified through configuration
    const tagName = tags.length ? tags[tags.length - 1] : this.pkgVersion;
    this.log.log('Created Tag is:', tagName);

    return { tagName };
  }

  async createReleaseBranch() {
    const { tagName } = await this.checkTag();

    // create a release branch, use new tagName as release branch name
    const releaseBranch = ContentTpl.getReleaseBranch(tagName, this.env);

    this.log.log('Create Release PR branch', releaseBranch);

    await this.shell.exec(`git merge origin/${this.mainBranch}`);
    await this.shell.exec(`git checkout -b ${releaseBranch}`);

    try {
      await this.shell.exec(`git push origin ${releaseBranch}`);
    } catch (error) {
      this.log.error(error);
    }

    return { tagName, releaseBranch };
  }

  async createReleasePR(tagName, releaseBranch) {
    this.log.log('Create Release PR', tagName, releaseBranch);

    const title = ContentTpl.getPRtitle(this.mainBranch, tagName, this.env);
    const body = ContentTpl.getPRBody(tagName);
    const command = `gh pr create --title "${title}" --body "${body}" --base ${this.mainBranch} --head ${releaseBranch}`;

    const output = await this.shell.exec(command);

    if (output.includes('already exists:')) {
      this.log.log('already PR');
    }

    const prNumber = this.getPRNumber(output);

    if (!prNumber) {
      this.log.log('Created PR Failed');
      // process.exit(1);
      return;
    }
    this.log.log('Created PR Successfully');

    return prNumber;
  }

  async autoMergePR(prNumber) {
    if (!prNumber) {
      this.log.log('Failed to create Pull Request.', prNumber);
      return;
    }

    if (!this.repo || !this.owner) {
      this.log.log('Not round repo or owner!!!');
      process.exit(1);
    }

    this.log.log(`Merging PR #${prNumber} ...`);

    await this.octokit.pulls.merge({
      owner: this.owner,
      repo: this.repo,
      pull_number: prNumber,
      merge_method: 'merge' // 合并方式，可以是 merge, squash 或 rebase
    });

    this.log.log('Merged successfully');
  }

  async checkedPR(prNumber, releaseBranch) {
    await this.shell.exec(`gh pr view ${prNumber}`);
    // this.shell.exec(`git checkout ${this.mainBranch}`);
    // this.shell.exec(`git branch -d ${releaseBranch}`);
    await this.shell.exec(`git push origin --delete ${releaseBranch}`);
  }
}
