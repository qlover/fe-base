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
  constructor() {
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

    clearEnvVariable('GITHUB_TOKEN');
  }

  getPRNumber(prUrl) {
    const prNumberMatch = prUrl.match(/#(\d+)/);
    return prNumberMatch ? prNumberMatch[1] : '';
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
    const tags = tagResult.toString().trim().split('\n');
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
    runCommand(`git push origin ${releaseBranch}`);

    return { tagName, releaseBranch };
  }

  createReleasePR(tagName, releaseBranch) {
    log('Create Release PR');
    runCommand(`echo "${this.ghToken}" | gh auth login --with-token`);

    const title = ContentTpl.getPRtitle(
      this.mainBranch,
      tagName,
      process.env.NODE_ENV
    );
    const body = ContentTpl.getPRBody(tagName);

    const prResult = runCommand(
      `gh pr create --title ${title} --body ${body} --base ${this.mainBranch} --head ${releaseBranch}`,
      { stdio: null }
    );

    return this.getPRNumber(prResult);
  }

  autoMergePR(prNumber) {
    if (!prNumber) {
      log('Failed to create Pull Request.');
      return;
    }

    log(`Merging PR #${prNumber}`);
    runCommand(`gh pr merge ${prNumber} --merge`);

    log('Merged successfully');
  }
}

function main() {
  loadEnv(rootPath);

  const release = new Release();

  release.publish();

  const { tagName, releaseBranch } = release.createReleaseBranch();

  const prNumber = release.createReleasePR(tagName, releaseBranch);

  release.autoMergePR(prNumber);
}

main();
