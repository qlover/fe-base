import { Shell } from '../Shell.js';
import { ReleaseUtil } from './ReleaseUtil.js';
import lodash from 'lodash';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const { merge, set, get } = lodash;

export class ReleaseConfiger {
  /**
   * @param {import('@qlover/fe-scripts').ReleaseContext} context
   */
  constructor(context) {
    this.context = context;
    this.feConfig = this.initFEConfig(context.feConfig, context);
  }

  get dryRunPRNumber() {
    return '999999';
  }

  get logger() {
    return this.context.logger;
  }

  get shell() {
    return this.context.shell;
  }

  get releaseBaseBranch() {
    return this.context.options.releaseBranch;
  }

  get releaseEnv() {
    return this.context.options.releaseEnv;
  }

  /**
   * @param {import('@qlover/fe-scripts').FeConfig} feConfig
   * @param {import('@qlover/fe-scripts').ReleaseContext} context
   * @returns {import('@qlover/fe-scripts').FeConfig}
   */
  initFEConfig(feConfig, context) {
    feConfig = merge({}, context.feConfig);

    if (context.options.path) {
      set(feConfig, 'release.publishPath', context.options.path);
    }

    return feConfig;
  }

  getUserInfo() {
    const pkg = this.getPkg();
    const userInfo = ReleaseUtil.getUserInfo(pkg, this.feConfig);

    if (!userInfo.repoName || !userInfo.authorName) {
      throw new Error('Not round repo or owner!!!');
    }

    return userInfo;
  }

  getPkg(key) {
    const pkg = JSON.parse(readFileSync(resolve('./package.json'), 'utf-8'));
    return key ? get(pkg, key) : pkg;
  }

  /**
   * @param {keyof import('@qlover/fe-scripts').FeReleaseConfig} path
   * @param {*} defaultValue
   * @returns
   */
  getReleaseFeConfig(path, defaultValue) {
    return get(this.feConfig.release, path, defaultValue);
  }

  getPublishPath() {
    return this.getReleaseFeConfig('publishPath', process.cwd());
  }

  getReleaseBranch(tagName) {
    return Shell.format(this.getReleaseFeConfig('branchName', ''), {
      env: this.releaseEnv,
      branch: this.releaseBaseBranch,
      tagName
    });
  }

  getReleasePRTitle(tagName) {
    return Shell.format(this.getReleaseFeConfig('PRTitle', ''), {
      env: this.releaseEnv,
      branch: this.releaseBaseBranch,
      tagName,
      pkgName: this.getPkg('name')
    });
  }

  getReleasePRBody({ tagName, changelog }) {
    return Shell.format(this.getReleaseFeConfig('PRBody', ''), {
      branch: this.releaseBaseBranch,
      env: this.releaseEnv,
      tagName,
      changelog
    });
  }

  getPublishReleaseItOptions() {
    return {
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
      'dry-run': this.context.dryRun,
      verbose: true,
      increment: this.getPkg('version')
    };
  }

  getCreateReleasePROptions(tagName, releaseBranch, changelog) {
    const { repoName, authorName } = this.getUserInfo();
    const title = this.getReleasePRTitle(tagName);
    const body = this.getReleasePRBody({ tagName, changelog });

    return {
      owner: authorName,
      repo: repoName,
      title,
      body,
      base: this.releaseBaseBranch,
      head: releaseBranch
    };
  }

  getReleaseItChangelogOptions() {
    return {
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
      'dry-run': this.context.dryRun
    };
  }

  setOptionsFromEnv(options) {
    this.context.options = merge(this.context.options, options);
  }
}
