import loadsh from 'lodash';
import { readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { cosmiconfigSync } from 'cosmiconfig';
import { fileURLToPath } from 'url';
import { Shell } from './Shell.js';

const { isString, isPlainObject, get } = loadsh;
const pkg = JSON.parse(readFileSync(resolve('./package.json'), 'utf-8'));

function isValidString(value) {
  return value && isString(value);
}

// https://github.com/release-it/release-it/blob/main/lib/config.js#L11
const searchPlaces = [
  'package.json',
  '.release-it.json',
  '.release-it.js',
  '.release-it.ts',
  '.release-it.cjs',
  '.release-it.yaml',
  '.release-it.yml'
  // FIXME:
  // '.release-it.toml'
];

class ReleaseBase {
  /**
   * @param {object} config
   * @param {boolean} config.isCreateRelease
   * @param {import('../index.js').FeConfig} config.feConfig
   * @param {import('@qlover/fe-utils').Logger} config.log
   * @param {Shell} config.shell
   */
  constructor(config = {}) {
    this.feConfig = config.feConfig || {};
    this.log = config.log;
    this.shell = config.shell;

    // other config
    this.isCreateRelease = !!config.isCreateRelease;
    this.ghToken = '';
    this.npmToken = '';
    this.branch = '';
    this.userInfo = this.getUserInfo();
    this.pkgVersion = pkg.version;
  }

  getRelease(path, defaultValue) {
    return get(this.feConfig.release, path, defaultValue);
  }

  getUserInfo() {
    const { repository, author } = pkg;
    const localAuthor = this.feConfig.author || author;

    // check author
    const authorName = isPlainObject(localAuthor)
      ? get(localAuthor, 'name')
      : localAuthor;

    if (!isValidString(authorName)) {
      throw new Error('please set .fe-scripts valid author');
    }

    const repoName =
      this.feConfig.repository || repository.url.split('/').pop();
    // check repo
    if (!isValidString(repoName)) {
      throw new Error('please set .fe-scripts repository');
    }

    return { repoName, authorName };
  }

  async getOctokit() {
    if (this.octokit) {
      return this.octokit;
    }

    const { Octokit } = await import('@octokit/rest');

    const octokit = new Octokit({ auth: this.ghToken });

    this.octokit = octokit;

    return octokit;
  }

  /**
   * @see https://github.com/release-it/release-it/blob/main/lib/config.js#L29
   * @returns
   * TODO:
   *  If the release it of the project is configured, merge it with the local default one
   *  Directly return a config configuration file path
   */
  getReleaseItConfig() {
    const explorer = cosmiconfigSync('release-it', { searchPlaces });
    const result = explorer.search(resolve());

    // find!
    if (result) {
      return;
    }

    // this json copy with release-it default json
    return join(dirname(fileURLToPath(import.meta.url)), '../.release-it.json');
  }

  getReleaseBranch(tagName) {
    return Shell.format(this.getRelease('branchName', ''), {
      env: this.env,
      branch: this.branch,
      tagName
    });
  }

  getReleasePRTitle(tagName) {
    return Shell.format(this.getRelease('PRTitle', ''), {
      env: this.env,
      branch: this.branch,
      tagName
    });
  }

  getReleasePRBody(tagName) {
    return Shell.format(this.getRelease('PRBody', ''), {
      tagName
    });
  }
}

export class Release {
  constructor(config) {
    this.config = new ReleaseBase(config);
  }

  /**
   * @returns {import('@qlover/fe-utils').Logger}
   */
  get log() {
    return this.config.log;
  }

  /**
   * @returns {Shell}
   */
  get shell() {
    return this.config.shell;
  }

  get releaseItEnv() {
    return {
      ...process.env,
      NPM_TOKEN: this.config.npmToken,
      GITHUB_TOKEN: this.config.ghToken
    };
  }

  getPRNumber(output) {
    const prUrlPattern = /https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/(\d+)/;
    const match = output.match(prUrlPattern);
    return (match && match[1]) || '';
  }

  componseReleaseItCommand() {
    const releaseItConfig = this.config.getReleaseItConfig();
    // search
    const command = ['npx release-it'];

    command.push('--ci');

    // 1. no publish npm
    // 2. no publish github/release/tag
    if (this.config.isCreateRelease) {
      command.push(
        '--no-git.tag --no-git.push --no-npm.publish --no-github.release'
        // '--no-npm.publish --no-git.tag --no-git.push --no-github.publish --no-github.release'
      );
    }
    // use current pkg, no publish npm and publish github
    else {
      command.push('--no-increment');
    }

    if (releaseItConfig) {
      command.push(`--config ${releaseItConfig}`);
    }

    return command.join(' ');
  }

  async releaseIt() {
    await this.shell.exec(
      `echo "//registry.npmjs.org/:_authToken=${this.config.npmToken}" > .npmrc`
    );

    await this.shell.exec(this.componseReleaseItCommand(), {
      env: this.releaseItEnv,
      silent: false
    });
  }

  async checkTag() {
    const lastTag = await this.shell.exec(
      `git tag --sort=-creatordate | head -n 1`,
      {
        silent: true
      }
    );
    const tagName = lastTag || this.config.pkgVersion;
    this.log.log('Created Tag is:', tagName);

    return { tagName };
  }

  async createReleaseBranch() {
    const { tagName } = await this.checkTag();

    // create a release branch, use new tagName as release branch name
    const releaseBranch = this.config.getReleaseBranch(tagName);

    this.log.log('Create Release PR branch', releaseBranch);

    await this.shell.exec(`git merge origin/${this.config.branch}`);
    await this.shell.exec(`git checkout -b ${releaseBranch}`);

    try {
      await this.shell.exec(`git push origin ${releaseBranch}`);
      this.log.info(`PR Branch ${releaseBranch} push Successfully!`);
    } catch (error) {
      this.log.error(error);
    }

    return { tagName, releaseBranch };
  }

  async createPRLabel() {
    try {
      const label = this.config.feConfig.release.label;
      await this.shell.exec(
        'gh label create "${name}" --description "${description}" --color "${color}"',
        {},
        label
      );
    } catch (error) {
      this.log.error('create pr label', error);
    }
  }

  async createReleasePR(tagName, releaseBranch) {
    this.log.log('Create Release PR', tagName, releaseBranch);

    await this.shell.exec(
      `echo "${this.config.ghToken}" | gh auth login --with-token`
    );

    await this.createPRLabel();

    const title = this.config.getReleasePRTitle(tagName);
    const body = this.config.getReleasePRBody(tagName);
    const label = this.config.feConfig.release.label;
    const command = `gh pr create --title "${title}" --body "${body}" --base ${this.config.branch} --head ${releaseBranch} --label "${label.name}"`;

    let output = '';
    try {
      output = await this.shell.run(command);
    } catch (error) {
      if (error.toString().includes('already exists:')) {
        this.log.warn('already PR');
        output = error.toString();
      } else {
        throw error;
      }
    }

    const prNumber = this.getPRNumber(output);

    if (!prNumber) {
      this.log.error('Created PR Failed');
      // process.exit(1);
      return;
    }
    this.log.log(output);
    this.log.info('Created PR Successfully');

    return prNumber;
  }

  async autoMergePR(prNumber) {
    if (!prNumber) {
      this.log.error('Failed to create Pull Request.', prNumber);
      return;
    }

    const userInfo = this.config.userInfo;
    if (!userInfo.repoName || !userInfo.authorName) {
      this.log.error('Not round repo or owner!!!');
      process.exit(1);
    }

    this.log.log(`Merging PR #${prNumber} ...`);

    const octokit = await this.config.getOctokit();
    await octokit.pulls.merge({
      owner: userInfo.authorName,
      repo: userInfo.repoName,
      pull_number: prNumber,
      merge_method: this.config.getRelease('autoMergeType', 'merge')
    });

    this.log.info('Merged successfully');
  }

  async checkedPR(prNumber, releaseBranch) {
    await this.shell.exec(`gh pr view ${prNumber}`);
    // this.shell.exec(`git checkout ${this.mainBranch}`);
    // this.shell.exec(`git branch -d ${releaseBranch}`);
    await this.shell.exec(`git push origin --delete ${releaseBranch}`);

    this.log.info(`Branch ${releaseBranch} has been deleted`);
  }
}
