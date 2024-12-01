import loadsh from 'lodash';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { tmpdir } from 'os';
import { Shell } from './Shell.js';
import releaseIt from 'release-it';

const { isString, isPlainObject, get, set, merge } = loadsh;

class ReleaseUtil {
  static isValidString(value) {
    return value && isString(value);
  }

  static getPRNumber(output) {
    const prUrlPattern = /https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/(\d+)/;
    const match = output.match(prUrlPattern);
    return (match && match[1]) || '';
  }

  static getUserInfo(pkg, feConfig) {
    const { repository, author } = pkg;
    const localAuthor = feConfig.author || author;

    const authorName = isPlainObject(localAuthor)
      ? get(localAuthor, 'name')
      : localAuthor;

    if (!ReleaseUtil.isValidString(authorName)) {
      throw new Error('please set .fe-config.release valid author');
    }

    const repoName =
      feConfig.repository ||
      repository.url.split('/').pop()?.replace('.git', '');
    if (!ReleaseUtil.isValidString(repoName)) {
      throw new Error('please set .fe-config.release repository');
    }

    return { repoName, authorName };
  }

  static async getDryRrunPRUrl(shell, number) {
    const repoInfo = await shell.run('git remote get-url origin', {
      dryRun: false
    });

    if (!repoInfo) {
      return 'https://github.com/[username]/[repo]/pull/' + number;
    }

    return (
      repoInfo
        .replace(/\.git$/, '')
        .replace('git@github.com:', 'https://github.com/') +
      '/pull/' +
      number
    );
  }

  static getReleaseItSearchPlaces() {
    // https://github.com/release-it/release-it/blob/main/lib/config.js#L11
    return [
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
  }
}

/**
 * @param {import('../index.d.ts').FeConfig} feConfig
 * @param {import('../index.d.ts').LibReleaseOptions} context
 * @returns {import('../index.d.ts').FeConfig}
 */
function initFEConfig(feConfig, context) {
  feConfig = merge({}, context.feConfig);

  if (context.options.path) {
    set(feConfig, 'release.publishPath', context.options.path);
  }

  return feConfig;
}

export class Release {
  /**
   * @param {import('../index.d.ts').LibReleaseOptions} context
   */
  constructor(context) {
    this.feConfig = initFEConfig(context.feConfig, context);
    this.context = context;

    this._releaseItOutput = {
      name: '',
      changelog: '',
      latestVersion: '',
      version: ''
    };
  }

  get options() {
    return this.context.options;
  }

  get logger() {
    return this.context.logger;
  }

  get shell() {
    return this.context.shell;
  }

  get env() {
    return this.context.env;
  }

  getUserInfo() {
    const pkg = this.getPkg();
    const userInfo = ReleaseUtil.getUserInfo(pkg, this.feConfig);

    if (!userInfo.repoName || !userInfo.authorName) {
      throw new Error('Not round repo or owner!!!');
    }

    return userInfo;
  }

  get dryRun() {
    return !!this.context.dryRun;
  }

  get releaseBranch() {
    return this.options.releaseBranch;
  }

  get releaseEnv() {
    return this.options.releaseEnv;
  }

  get autoMergeReleasePR() {
    return this.getReleaseFeConfig('autoMergeReleasePR', false);
  }

  setGithubToken(token) {
    this.ghToken = token;
  }

  getPublishPath() {
    return this.getReleaseFeConfig('publishPath', process.cwd());
  }

  getPkg(key) {
    const pkg = JSON.parse(readFileSync(resolve('./package.json'), 'utf-8'));
    return key ? get(pkg, key) : pkg;
  }

  /**
   * @param {keyof import('../index.d.ts').FeScriptRelease} path
   * @param {*} defaultValue
   * @returns
   */
  getReleaseFeConfig(path, defaultValue) {
    return get(this.feConfig.release, path, defaultValue);
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

  getReleaseBranch(tagName) {
    return Shell.format(this.getReleaseFeConfig('branchName', ''), {
      env: this.releaseEnv,
      branch: this.releaseBranch,
      tagName
    });
  }

  getReleasePRTitle(tagName) {
    return Shell.format(this.getReleaseFeConfig('PRTitle', ''), {
      env: this.releaseEnv,
      branch: this.releaseBranch,
      tagName,
      pkgName: this.getPkg('name')
    });
  }

  getReleasePRBody({ tagName, changelog }) {
    return Shell.format(this.getReleaseFeConfig('PRBody', ''), {
      branch: this.releaseBranch,
      env: this.releaseEnv,
      tagName,
      changelog
    });
  }

  getPRNumber(output) {
    return ReleaseUtil.getPRNumber(output);
  }

  async releaseIt(releaseItOptions) {
    this.logger.debug('Run release-it method', releaseItOptions);
    // const { default: releaseIt } = await import('release-it');
    const output = await releaseIt(releaseItOptions);
    this._releaseItOutput = output;
    return output;
  }

  /**
   * 1. no incremnt
   * 2. no changelog
   */
  async publish(releaseItOptions = {}) {
    const publishOptions = {
      ci: true,
      npm: {
        publish: true
      },
      git: {
        requireCleanWorkingDir: false,
        requireUpstream: false,
        // disablec defualt changelog
        changelog: false
      },
      // disable @release-it/conventional-changelog
      plugins: {
        '@release-it/conventional-changelog': {
          infile: false
        }
      },
      'dry-run': this.dryRun,
      verbose: true,
      increment: this.getPkg('version')
    };

    return this.releaseIt(merge(publishOptions, releaseItOptions));
  }

  /**
   * 1. create incrment
   * 2. create changelog
   * 3. no publish anything
   */
  async createChangelogAndVersion() {
    return this.releaseIt({
      ci: true,
      increment: 'patch',
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
      'dry-run': this.dryRun
    });
  }

  getChangelogAndFeatures(releaseResult) {
    if (!releaseResult) {
      this.logger.warn(
        'No release-it output found, changelog might be incomplete'
      );
    }

    return get(releaseResult, 'changelog', 'No changelog');
  }

  async checkTag() {
    // only use release-it output version, or current pkg version to create tag
    const tagName = get(
      this._releaseItOutput,
      'version',
      this.getPkg('version')
    );

    this.logger.debug('Created Tag is:', tagName);

    return { tagName };
  }

  async createReleaseBranch() {
    const { tagName } = await this.checkTag();
    const releaseBranch = this.getReleaseBranch(tagName);

    this.logger.debug('Create Release PR branch', releaseBranch);

    await this.shell.exec(`git fetch origin ${this.releaseBranch}`);
    await this.shell.exec(`git merge origin/${this.releaseBranch}`);
    await this.shell.exec(`git checkout -b ${releaseBranch}`);

    await this.shell.exec(`git push origin ${releaseBranch}`);
    // this.log.info(`PR Branch ${releaseBranch} push Successfully!`);

    return { tagName, releaseBranch };
  }

  async createPRLabel() {
    const label = this.feConfig.release.label;
    if (!label || !label.name || !label.description || !label.color) {
      throw new Error('Label is not valid, skipping creation');
    }
    const { repoName, authorName } = this.getUserInfo();

    try {
      const octokit = await this.getOctokit();

      await octokit.rest.issues.createLabel({
        owner: authorName,
        repo: repoName,
        name: label.name,
        description: label.description,
        color: label.color.replace('#', '') // remove # prefix
      });
    } catch (error) {
      if (error.status === 422) {
        this.logger.warn(`Label ${label.name} already exists, skipping!`);
        return;
      }
      this.logger.error('Create PR label Failed', error);
      throw error;
    }
  }

  /**
   * create Release PR
   * @param {string} tagName
   * @param {string} releaseBranch
   * @returns {Promise<string>}
   */
  async createReleasePR(tagName, releaseBranch, releaseResult) {
    await this.createPRLabel();

    const changelog = this.getChangelogAndFeatures(
      releaseResult || this._releaseItOutput
    );

    const title = this.getReleasePRTitle(tagName);
    const body = this.getReleasePRBody({ tagName, changelog });
    const { repoName, authorName } = this.getUserInfo();

    if (this.dryRun) {
      this.logger.info(`[DRY RUN] Would create PR with:`, {
        title,
        base: this.releaseBranch,
        head: releaseBranch,
        labels: [this.feConfig.release.label.name]
      });
      return '999999';
    }

    // create temp file to record original content (for debug)
    const tempFile = join(tmpdir(), `pr-body-${Date.now()}.md`);
    writeFileSync(tempFile, body, 'utf8');
    this.logger.debug('PR body saved to:', tempFile);

    try {
      const octokit = await this.getOctokit();

      try {
        // create PR
        const response = await octokit.rest.pulls.create({
          owner: authorName,
          repo: repoName,
          title,
          body,
          base: this.releaseBranch,
          head: releaseBranch
        });

        // add label
        if (this.feConfig.release.label?.name) {
          await octokit.rest.issues.addLabels({
            owner: authorName,
            repo: repoName,
            issue_number: response.data.number,
            labels: [this.feConfig.release.label.name]
          });
        }

        const prNumber = response.data.number.toString();
        if (!prNumber) {
          throw new Error('CreateReleasePR Failed, prNumber is empty');
        }

        return prNumber;
      } finally {
        // clean up temp file
        if (tempFile) {
          try {
            unlinkSync(tempFile);
          } catch {
            this.logger.warn('Failed to clean up temporary file:', tempFile);
          }
        }
      }
    } catch (error) {
      if (error.status === 422 && error.message.includes('already exists')) {
        this.logger.warn('PR already exists');
        const match = error.message.match(/pull request #(\d+)/);
        return match ? match[1] : undefined;
      }
      this.logger.error('Failed to create PR', error);
      throw error;
    }
  }

  async autoMergePR(prNumber) {
    if (!prNumber) {
      this.logger.error('Failed to create Pull Request.', prNumber);
      return;
    }

    const { repoName, authorName } = this.getUserInfo();
    const mergeMethod = this.getReleaseFeConfig('autoMergeType', 'squash');

    if (!this.dryRun) {
      const octokit = await this.getOctokit();
      await octokit.pulls.merge({
        owner: authorName,
        repo: repoName,
        pull_number: prNumber,
        merge_method: mergeMethod
      });
    } else {
      this.logger.info(
        `[DRY RUN] Would merge PR #${prNumber} with method '${mergeMethod}' in repo ${authorName}/${repoName}`
      );
    }
  }

  async checkedPR(prNumber, releaseBranch) {
    try {
      const { repoName, authorName } = this.getUserInfo();
      const octokit = await this.getOctokit();

      // 获取 PR 信息
      await octokit.rest.pulls.get({
        owner: authorName,
        repo: repoName,
        pull_number: prNumber
      });

      // 删除远程分支
      await octokit.rest.git.deleteRef({
        owner: authorName,
        repo: repoName,
        ref: `heads/${releaseBranch}`
      });

      this.logger.info(`Branch ${releaseBranch} has been deleted`);
    } catch (error) {
      if (error.status === 404) {
        this.logger.warn(
          `PR #${prNumber} or branch ${releaseBranch} not found`
        );
        return;
      }
      this.logger.error('Failed to check PR or delete branch', error);
      throw error;
    }
  }

  /**
   * carese npm auth
   * tip `npm login`
   */
  async checkNpmAuth() {
    await this.shell.exec(
      `echo "//registry.npmjs.org/:_authToken=${this.npmToken}" > .npmrc`,
      {
        dryRun: false
      }
    );
  }

  async checkPublishPath() {
    const publishPath = this.getPublishPath();
    if (publishPath && existsSync(publishPath)) {
      // switch to publish path
      process.chdir(publishPath);
    }

    this.logger.debug('Current path:', process.cwd());
  }
}
