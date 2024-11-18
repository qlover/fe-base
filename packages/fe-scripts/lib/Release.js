import loadsh from 'lodash';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { Shell } from './Shell.js';
import { cosmiconfigSync } from 'cosmiconfig';
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

export class ReleaseItOutputParser {
  static async getChangelogAndFeatures(releaseItOutput) {
    const chunk = releaseItOutput.split('### Features');
    const changelog = get(chunk, 0, 'No changelog').trim();
    const features = get(chunk, 1, 'No features').trim();
    return {
      changelog,
      features
    };
  }

  static parse(output) {
    const result = {
      name: '',
      changelog: '',
      latestVersion: '',
      version: ''
    };

    // match version info and package name
    const versionMatch = output.match(
      /Let's release (.+?) \(([\d.]+)\.\.\.([\d.]+)\)/
    );
    if (versionMatch) {
      result.name = versionMatch[1].trim();
      result.latestVersion = versionMatch[2];
      result.version = versionMatch[3];
    }

    // match changelog
    const lines = output.split('\n');
    const changelogStartIndex = lines.findIndex(
      (line) => line.trim() === 'Changelog:'
    );
    if (changelogStartIndex !== -1) {
      const changelogLines = [];
      let i = changelogStartIndex + 1;

      // collect until "! npm version" or file end
      while (i < lines.length && !lines[i].startsWith('! npm version')) {
        if (lines[i].trim()) {
          // only add non-empty lines
          changelogLines.push(lines[i]);
        }
        i++;
      }

      result.changelog = changelogLines.join('\n').trim();
    }

    return result;
  }
}

class ReleaseBase {
  /**
   * @param {object} config
   * @param {boolean} config.isCreateRelease
   * @param {import('../index.js').FeConfig} config.feConfig
   * @param {import('@qlover/fe-utils').Logger} config.log
   * @param {Shell} config.shell
   */
  constructor(config = {}) {
    this.feConfig = this.initConfig(config);
    this.log = config.log;
    this.shell = config.shell;

    // other config
    this.isCreateRelease = !!config.isCreateRelease;
    this.ghToken = '';
    this.npmToken = '';
    this.branch = '';
  }

  get userInfo() {
    const pkg = this.getPkg();
    return ReleaseUtil.getUserInfo(pkg, this.feConfig);
  }

  getPublishPath() {
    return this.getReleaseFeConfig('publishPath', process.cwd());
  }

  getPkg(key) {
    const pkg = JSON.parse(readFileSync(resolve('./package.json'), 'utf-8'));
    return key ? get(pkg, key) : pkg;
  }

  initConfig(config) {
    const feConfig = merge({}, config.feConfig);

    if (config.publishPath) {
      set(feConfig, 'release.publishPath', config.publishPath);
    }

    return feConfig;
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
      env: this.env,
      branch: this.branch,
      tagName
    });
  }

  getReleasePRTitle(tagName) {
    return Shell.format(this.getReleaseFeConfig('PRTitle', ''), {
      env: this.env,
      branch: this.branch,
      tagName,
      pkgName: this.getPkg('name')
    });
  }

  getReleasePRBody({ tagName, changelog }) {
    return Shell.format(this.getReleaseFeConfig('PRBody', ''), {
      branch: this.branch,
      env: this.env,
      tagName,
      changelog
    });
  }

  /**
   * @see https://github.com/release-it/release-it/blob/main/lib/config.js#L29
   * @returns
   * TODO:
   *  If the release it of the project is configured, merge it with the local default one
   *  Directly return a config configuration file path
   */
  getReleaseItConfig() {
    const searchPlaces = ReleaseUtil.getReleaseItSearchPlaces();
    const explorer = cosmiconfigSync('release-it', { searchPlaces });
    const result = explorer.search(resolve());

    // find!
    if (result) {
      return;
    }

    // this json copy with release-it default json
    return join(dirname(fileURLToPath(import.meta.url)), '../.release-it.json');
  }
}

export class Release {
  /**
   * @param {import('../index.d.ts').ReleaseConfig} config
   */
  constructor(config) {
    this.config = new ReleaseBase(config);
    this._releaseItOutput = {
      name: '',
      changelog: '',
      latestVersion: '',
      version: ''
    };
  }

  get dryRun() {
    return this.shell.config.isDryRun || this.log.isDryRun;
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
      GITHUB_TOKEN: this.config.ghToken,
      PAT_TOKEN: this.config.ghToken
    };
  }

  getPRNumber(output) {
    return ReleaseUtil.getPRNumber(output);
  }

  async releaseIt(releaseItOptions) {
    this.log.debug('Run release-it method', releaseItOptions);
    // const { default: releaseIt } = await import('release-it');
    const output = await releaseIt(releaseItOptions);
    this._releaseItOutput = output;
    return output;
  }

  /**
   * 1. no incremnt
   * 2. no changelog
   */
  async publish() {
    // await this.shell.exec(
    //   `npx release-it ${this.config.getPublishPath()} --ci --npm.publish --dry-run --verbose`,
    //   {
    //     dryRun: false,
    //     env: this.releaseItEnv
    //   }
    // );
    return this.releaseIt({
      ci: true,
      npm: {
        publish: true
        // publishPath: this.config.getPublishPath()
      },
      git: {
        requireCleanWorkingDir: false,
        requireUpstream: false,
        changelog: false
      },
      'dry-run': this.dryRun,
      verbose: true,
      increment: this.config.getPkg('version')
    });
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

  async getChangelogAndFeatures(releaseResult) {
    if (!releaseResult) {
      this.log.warn(
        'No release-it output found, changelog might be incomplete'
      );
    }

    return get(releaseResult, 'changelog', 'No changelog');
  }

  async checkTag() {
    // const lastTag = await this.shell.run(
    //   'git tag --sort=-creatordate | head -n 1'
    // );

    // only use release-it output version, or current pkg version to create tag
    const tagName = get(
      this._releaseItOutput,
      'version',
      this.config.getPkg('version')
    );

    this.log.debug('Created Tag is:', tagName);

    return { tagName };
  }

  async createReleaseBranch() {
    const { tagName } = await this.checkTag();
    const releaseBranch = this.config.getReleaseBranch(tagName);

    this.log.debug('Create Release PR branch', releaseBranch);

    await this.shell.exec(`git merge origin/${this.config.branch}`);
    await this.shell.exec(`git checkout -b ${releaseBranch}`);

    await this.shell.exec(`git push origin ${releaseBranch}`);
    // this.log.info(`PR Branch ${releaseBranch} push Successfully!`);

    return { tagName, releaseBranch };
  }

  async createPRLabel() {
    try {
      const label = this.config.feConfig.release.label;
      await this.shell.exec(
        'gh label create "${name}" --description "${description}" --color "${color}" --force',
        {
          context: label
        }
      );
    } catch (error) {
      this.log.error('Create PR label Failed', error);
    }
  }

  /**
   * create Release PR
   * @param {string} tagName
   * @param {string} releaseBranch
   * @returns {Promise<string>}
   */
  async createReleasePR(tagName, releaseBranch, releaseResult) {
    await this.shell.exec(
      `echo "${this.config.ghToken}" | gh auth login --with-token`
    );

    await this.createPRLabel();

    const changelog = await this.getChangelogAndFeatures(
      releaseResult || this._releaseItOutput
    );

    const title = this.config.getReleasePRTitle(tagName);
    const body = this.config.getReleasePRBody({ tagName, changelog });

    // create temp file to store PR content
    const tempFile = join(tmpdir(), `pr-body-${Date.now()}.md`);
    writeFileSync(tempFile, body, 'utf8');

    const command = Shell.format(
      'gh pr create --title "${title}" --body-file "${bodyFile}" --base ${base} --head ${head} --label "${labelName}"',
      {
        title,
        bodyFile: tempFile,
        base: this.config.branch,
        head: releaseBranch,
        labelName: this.config.feConfig.release.label.name
      }
    );

    let output = '';
    try {
      if (this.dryRun) {
        this.log.debug(command);
      }

      output = await this.shell.run(command, {
        dryRunResult: await ReleaseUtil.getDryRrunPRUrl(this.shell, 999999)
      });
    } catch (error) {
      if (error.toString().includes('already exists:')) {
        this.log.warn('already PR');
        output = error.toString();
      } else {
        throw error;
      }
    } finally {
      // clean up temp file
      try {
        unlinkSync(tempFile);
      } catch {
        this.log.warn('Failed to clean up temporary file:', tempFile);
      }
    }

    if (this.shell.config.isDryRun) {
      this.log.debug(output);
    }

    const prNumber = this.getPRNumber(output);

    if (!prNumber) {
      this.log.error('CreateReleasePR Failed, prNumber is empty');
      // process.exit(1);
      return;
    }
    // this.log.log(output);
    // this.log.info('Created PR Successfully');

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

    // this.log.log(`Merging PR #${prNumber} ...`);
    const mergeMethod = this.config.getReleaseFeConfig(
      'autoMergeType',
      'squash'
    );
    if (!this.dryRun) {
      const octokit = await this.config.getOctokit();
      await octokit.pulls.merge({
        owner: userInfo.authorName,
        repo: userInfo.repoName,
        pull_number: prNumber,
        merge_method: mergeMethod
      });
    } else {
      const command = Shell.format(
        'gh pr merge --${mergeMethod} --repo ${owner}/${repo} --pull-number ${prNumber}',
        {
          owner: userInfo.authorName,
          repo: userInfo.repoName,
          mergeMethod,
          prNumber
        }
      );
      this.log.exec(command);
    }

    // this.log.info('Merged successfully');
  }

  async checkedPR(prNumber, releaseBranch) {
    await this.shell.exec(`gh pr view ${prNumber}`);
    // this.shell.exec(`git checkout ${this.mainBranch}`);
    // this.shell.exec(`git branch -d ${releaseBranch}`);
    await this.shell.exec(`git push origin --delete ${releaseBranch}`);

    // this.log.info(`Branch ${releaseBranch} has been deleted`);
  }

  /**
   * carese npm auth
   * tip `npm login`
   */
  async checkNpmAuth() {
    await this.shell.exec(
      `echo "//registry.npmjs.org/:_authToken=${this.config.npmToken}" > .npmrc`,
      {
        dryRun: false
      }
    );

    // TODO: check npm auth
    // const npmAuthPrefix = '//registry.npmjs.org/:_authToken';
    // const result = await this.shell.run('npm config list', {
    //   dryRun: false
    // });
    // if (!result.includes(npmAuthPrefix)) {
    //   if (this.dryRun) {
    //     this.log.exec(`npm config set ${npmAuthPrefix}=(Protected)`);
    //   } else {
    //     await this.shell.exec(
    //       `npm config set ${npmAuthPrefix}=${this.config.npmToken}`
    //     );
    //   }
    // }
  }

  async checkPublishPath() {
    const publishPath = this.config.getPublishPath();
    if (publishPath && existsSync(publishPath)) {
      // switch to publish path
      process.chdir(publishPath);
    }

    this.log.debug('Current path:', process.cwd());
  }
}
