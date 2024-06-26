const { runCommand, loadEnv, clearEnvVariable } = require('../utils');
const pkg = require('../../package.json');
const { rootPath } = require('../../config/path.config.cjs');

function main() {
  loadEnv(rootPath);

  if (process.env.RELEASE === 'false') {
    console.log('Skip Release');
    return;
  }

  if (!process.env.NPM_TOKEN) {
    console.error('NPM_TOKEN environment variable is not set.');
    process.exit(1);
  }
  if (!process.env.GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN environment variable is not set.');
    process.exit(1);
  }

  const ghToken = process.env.GITHUB_TOKEN;
  clearEnvVariable('GITHUB_TOKEN');
  runCommand(
    `echo "//registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}" > .npmrc`
  );

  console.log('Publishing to NPM and GitHub...');
  runCommand('npx release-it --ci', {
    env: {
      ...process.env,
      NPM_TOKEN: process.env.NPM_TOKEN,
      GITHUB_TOKEN: ghToken
    }
  });

  console.log('======== Publishing to NPM finish ========');

  // .release-it git push is false, push tags
  const tagResult = runCommand(`git tag`, { stdio: null });
  const tags = tagResult.toString().trim().split('\n');
  console.log('All Tags:', tags);
  // FIXME: Tagname can be modified through configuration
  const tagName = tags.length ? tags[tags.length - 1] : pkg.version;
  console.log('Created Tag is:', tagName);

  // create a release branch, use new tagName as release branch name
  const mainBranch = process.env.PR_BRANCH || 'master';
  const releaseBranch = `release-v${tagName}`;
  console.log('Create Release PR branch', releaseBranch);
  runCommand(`git merge origin/${mainBranch}`);
  runCommand(`git checkout -b ${releaseBranch}`);
  runCommand(`git push origin ${releaseBranch}`);

  // create PR
  console.log('Create Release PR');
  runCommand(`echo "${ghToken}" | gh auth login --with-token`);
  runCommand(
    `gh pr create --title "[From bot] Release ${mainBranch} v${tagName}" --body "This PR includes version bump to v${tagName}" --base ${mainBranch} --head ${releaseBranch}`
  );
}

main();
