const { loadEnv, getEnvDestroy } = require('../utils');
const { author, repository, version } = require('../../package.json');
const { rootPath } = require('../../config/path.config.cjs');
const { Release } = require('../lib/relesae.js');
const { Logger } = require('../lib/logger.js');

async function main() {
  loadEnv(rootPath);
  const log = new Logger();

  if (!process.env.NPM_TOKEN) {
    log.error('NPM_TOKEN environment variable is not set.');
    process.exit(1);
  }
  if (!process.env.GITHUB_TOKEN) {
    log.error('GITHUB_TOKEN environment variable is not set.');
    process.exit(1);
  }

  const { Octokit } = await import('@octokit/rest');

  const owner = author;
  const repo = repository.url.split('/').pop();
  const octokit = new Octokit({ auth: getEnvDestroy('GITHUB_TOKEN') });
  const release = new Release({
    repo,
    owner,
    octokit,
    pkgVersion: version,
    prBranch: process.env.PR_BRANCH
  });

  release.publish();

  const { tagName, releaseBranch } = release.createReleaseBranch();

  const prNumber = release.createReleasePR(tagName, releaseBranch);

  await release.autoMergePR(prNumber);

  release.checkedPR(prNumber, releaseBranch);
}

main();
