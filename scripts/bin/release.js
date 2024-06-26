const { runCommand, loadEnv, clearEnvVariable } = require('../utils');
const pkg = require('../../package.json');
const { rootPath } = require('../../config/path.config.cjs');

function log(...args) {
  console.log('========', ...args);
}

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
  constructor(Octokit) {
    if (!process.env.NPM_TOKEN) {
      console.error('NPM_TOKEN environment variable is not set.');
      process.exit(1);
    }
    if (!process.env.GITHUB_TOKEN) {
      console.error('GITHUB_TOKEN environment variable is not set.');
      process.exit(1);
    }

    this.ghToken = process.env.GITHUB_TOKEN;
    this.mainBranch = process.env.PR_BRANCH || 'master';

    this.octokit = new Octokit({ auth: this.ghToken });

    clearEnvVariable('GITHUB_TOKEN');

    runCommand(`echo "${this.ghToken}" | gh auth login --with-token`);
  }

  getPRNumber(output) {
    const prUrlPattern = /https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/(\d+)/;
    const match = output.match(prUrlPattern);
    return (match && match[1]) || '';
  }

  publish() {
    if (process.env.RELEASE === 'false') {
      log('Skip Release');
      return;
    }

    log('Publishing to NPM and GitHub...');

    runCommand(
      `echo "//registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}" > .npmrc`
    );

    runCommand('npx release-it --ci', {
      env: {
        ...process.env,
        NPM_TOKEN: process.env.NPM_TOKEN,
        GITHUB_TOKEN: this.ghToken
      }
    });

    log('Publishing to NPM successfully');
  }

  checkTag() {
    // .release-it git push is false, push tags
    const tagResult = runCommand(`git tag`, { stdio: null });

    let tags = tagResult.toString().trim().split('\n');
    tags = tags.map((item) => item.replace(/v/g, '')).sort();

    log('All Tags:', tags);

    // FIXME: Tagname can be modified through configuration
    const tagName = tags.length ? tags[tags.length - 1] : pkg.version;
    log('Created Tag is:', tagName);

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

    log('Create Release PR branch', releaseBranch);

    runCommand(`git merge origin/${this.mainBranch}`);
    runCommand(`git checkout -b ${releaseBranch}`);
    runCommand(`git push origin ${releaseBranch}`, { catchError: false });

    return { tagName, releaseBranch };
  }

  createReleasePR(tagName, releaseBranch) {
    log('Create Release PR', tagName, releaseBranch);

    const title = ContentTpl.getPRtitle(
      this.mainBranch,
      tagName,
      process.env.NODE_ENV
    );
    const body = ContentTpl.getPRBody(tagName);
    const command = `gh pr create --title "${title}" --body "${body}" --base ${this.mainBranch} --head ${releaseBranch}`;

    const output = runCommand(command, {
      stdio: null,
      catchError: false
    }).toString();

    if (output.includes('already exists:')) {
      log('already PR');
    }

    const prNumber = this.getPRNumber(output);

    if (!prNumber) {
      log('Created PR Failed');
      // process.exit(1);
      return;
    }
    log('Created PR Successfully');

    return prNumber;
  }

  async autoMergePR(prNumber) {
    if (!prNumber) {
      log('Failed to create Pull Request.', prNumber);
      return;
    }

    log(`Merging PR #${prNumber} ...`);

    await this.octokit.pulls.merge({
      owner: 'qlover',
      repo: 'fe-base',
      pull_number: prNumber,
      merge_method: 'merge' // 合并方式，可以是 merge, squash 或 rebase
    });

    log('Merged successfully');
  }

  checkedPR(prNumber, releaseBranch) {
    runCommand(`gh pr view ${prNumber}`);
    // runCommand(`git checkout ${this.mainBranch}`);
    // runCommand(`git branch -d ${releaseBranch}`);
    runCommand(`git push origin --delete ${releaseBranch}`);
  }
}

async function main() {
  const { Octokit } = await import('@octokit/rest');

  loadEnv(rootPath);

  const release = new Release(Octokit);

  release.publish();

  const { tagName, releaseBranch } = release.createReleaseBranch();

  const prNumber = release.createReleasePR(tagName, releaseBranch);

  await release.autoMergePR(prNumber);

  release.checkedPR(prNumber, releaseBranch);
}

main();
