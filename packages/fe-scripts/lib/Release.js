import loadsh from 'lodash';
import { existsSync } from 'fs';
import releaseIt from 'release-it';
import { ReleaseConfiger } from './release/ReleaseConfiguter.js';
import { ReleasePRManager } from './release/ReleasePRManager.js';

const { get, merge } = loadsh;

export class Release {
  /**
   * @param {import('@qlover/fe-scripts').ReleaseContext} context
   */
  constructor(context) {
    this.configer = new ReleaseConfiger(context);
    this.prManager = new ReleasePRManager(this.configer);
  }

  get logger() {
    return this.configer.logger;
  }
  get shell() {
    return this.configer.shell;
  }

  /**
   * 1. no incremnt
   * 2. no changelog
   */
  async publish(releaseItOptions = {}) {
    const publishOptions = this.configer.getPublishReleaseItOptions();
    return this.releaseIt(merge(publishOptions, releaseItOptions));
  }

  async createReleasePR(tagName, releaseBranch, releaseResult) {
    const changelog = this.getChangelogAndFeatures(releaseResult);

    const label = await this.prManager.createReleasePRLabel();

    return this.prManager.createReleasePR({
      tagName,
      releaseBranch,
      changelog,
      label
    });
  }

  async autoMergePR(prNumber, releaseBranch) {
    return this.prManager.autoMergePR(prNumber, releaseBranch);
  }

  async checkedPR(prNumber, releaseBranch) {
    return this.prManager.checkedPR(prNumber, releaseBranch);
  }

  get autoMergeReleasePR() {
    return this.configer.getReleaseFeConfig('autoMergeReleasePR', false);
  }

  getChangelogAndFeatures(releaseResult) {
    if (!releaseResult) {
      this.logger.warn(
        'No release-it output found, changelog might be incomplete'
      );
    }

    return get(releaseResult, 'changelog', 'No changelog');
  }

  async releaseIt(releaseItOptions) {
    this.logger.debug('Run release-it method', releaseItOptions);
    // const { default: releaseIt } = await import('release-it');
    const output = await releaseIt(releaseItOptions);
    this._releaseItOutput = output;
    return output;
  }

  /**
   * 1. create incrment
   * 2. create changelog
   * 3. no publish anything
   */
  async createChangelogAndVersion() {
    return this.releaseIt(this.configer.getReleaseItChangelogOptions());
  }

  async createReleaseBranch() {
    const { tagName } = await this.checkTag();
    const releaseBranch = this.configer.getReleaseBranch(tagName);

    this.logger.debug('Create Release PR branch', releaseBranch);

    await this.shell.exec(
      `git fetch origin ${this.configer.releaseBaseBranch}`
    );
    await this.shell.exec(
      `git merge origin/${this.configer.releaseBaseBranch}`
    );
    await this.shell.exec(`git checkout -b ${releaseBranch}`);

    await this.shell.exec(`git push origin ${releaseBranch}`);
    // this.log.info(`PR Branch ${releaseBranch} push Successfully!`);

    return { tagName, releaseBranch };
  }

  async checkTag() {
    // only use release-it output version, or current pkg version to create tag
    const tagName =
      get(this._releaseItOutput, 'version') || this.configer.getPkg('version');

    this.logger.debug('Created Tag is:', tagName);

    return { tagName };
  }

  /**
   * carese npm auth
   * tip `npm login`
   */
  async checkNpmAuth() {
    if (!this.npmToken) {
      throw new Error('NPM_TOKEN is not set.');
    }

    await this.shell.exec(
      `echo "//registry.npmjs.org/:_authToken=${this.npmToken}" > .npmrc`
    );
  }

  async checkPublishPath() {
    const publishPath = this.configer.getPublishPath();
    if (publishPath && existsSync(publishPath)) {
      // switch to publish path
      process.chdir(publishPath);
    }

    this.logger.debug('Current path:', process.cwd());
  }

  setNPMToken(npmToken) {
    this.npmToken = npmToken;
  }
}
