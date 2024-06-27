const { Shell } = require('./shell.js');
const { Logger } = require('./logger.js');

const ContentTpl = {
  PR_TITLE_TPL: '[From bot] Release {mainBranch} v{tagName} from {env}',
  PR_BODY_TPL: 'This PR includes version bump to v{tagName}',

  getPRtitle(mainBranch, tagName, env) {
    return ContentTpl.PR_TITLE_TPL.replace('{mainBranch}', mainBranch)
      .replace('{tagName}', tagName)
      .replace('{env}', env);
  },

  getPRBody(tagName) {
    return ContentTpl.PR_BODY_TPL.replace('{tagName}', tagName);
  }
};

class Release {
  /**
   * @param {Object} config
   * @param {string} config.prBranch
   * @param {string} config.owner
   * @param {string} config.repo
   * @param {string} config.pkgVersion
   * @param {import('@octokit/rest').Octokit} config.octokit
   */
  constructor(config) {
    const { prBranch = 'master', owner, repo } = config;

    this.log = new Logger();
    this.shell = new Shell();
    this.mainBranch = prBranch;
    this.owner = owner;
    this.repo = repo;
    this.octokit = config.octokit;
    this.ghToken = this.octokit.auth;
  }

  getPRNumber(output) {
    const prUrlPattern = /https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/(\d+)/;
    const match = output.match(prUrlPattern);
    return (match && match[1]) || '';
  }

  publish() {
    if (process.env.RELEASE === 'false') {
      this.log.log('Skip Release');
      return;
    }

    this.log.log('Publishing to NPM and GitHub...');
    this.shell.exec(`echo "${this.ghToken}" | gh auth login --with-token`);

    this.shell.exec(
      `echo "//registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}" > .npmrc`
    );

    this.shell.exec('npx release-it --ci', {
      env: {
        ...process.env,
        NPM_TOKEN: process.env.NPM_TOKEN,
        GITHUB_TOKEN: this.ghToken
      }
    });

    this.log.log('Publishing to NPM successfully');
  }

  checkTag() {
    // .release-it git push is false, push tags
    const tagResult = this.shell.exec(`git tag`, { stdio: null });

    let tags = tagResult.toString().trim().split('\n');
    tags = tags.map((item) => item.replace(/v/g, '')).sort();

    this.log.log('All Tags:', tags);

    // FIXME: Tagname can be modified through configuration
    const tagName = tags.length ? tags[tags.length - 1] : this.pkgVersion;
    this.log.log('Created Tag is:', tagName);

    return { tagName };
  }

  createReleaseBranch() {
    const { tagName } = this.checkTag();
    const env = process.env.NODE_ENV || 'development';

    // create a release branch, use new tagName as release branch name
    const releaseBranch =
      env === 'production'
        ? `release-v${tagName}`
        : `${env}-release-v${tagName}`;

    this.log.log('Create Release PR branch', releaseBranch);

    this.shell.exec(`git merge origin/${this.mainBranch}`);
    this.shell.exec(`git checkout -b ${releaseBranch}`);
    this.shell.exec(`git push origin ${releaseBranch}`, { catchError: false });

    return { tagName, releaseBranch };
  }

  createReleasePR(tagName, releaseBranch) {
    this.log.log('Create Release PR', tagName, releaseBranch);

    const title = ContentTpl.getPRtitle(
      this.mainBranch,
      tagName,
      process.env.NODE_ENV
    );
    const body = ContentTpl.getPRBody(tagName);
    const command = `gh pr create --title "${title}" --body "${body}" --base ${this.mainBranch} --head ${releaseBranch}`;

    const output = this.shell
      .exec(command, {
        stdio: null,
        catchError: false
      })
      .toString();

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

  checkedPR(prNumber, releaseBranch) {
    this.shell.exec(`gh pr view ${prNumber}`);
    // this.shell.exec(`git checkout ${this.mainBranch}`);
    // this.shell.exec(`git branch -d ${releaseBranch}`);
    this.shell.exec(`git push origin --delete ${releaseBranch}`);
  }
}

module.exports = { Release };
