import { loadEnv, getEnvDestroy } from '../utils/env.js';
import { rootPath } from '../../config/path.config.cjs';
import { Release } from '../lib/relesae.js';
import { Logger } from '../lib/logger.js';
import { readJSON } from '../utils/files.js';

const pkg = readJSON(new URL('../../package.json', import.meta.url));
const { author, repository, version } = pkg;
const repo = repository.url.split('/').pop();
const log = new Logger();

async function main() {
  loadEnv(rootPath);

  if (process.env.RELEASE === 'false') {
    log.warn('Skip Release');
    return;
  }

  if (!process.env.NPM_TOKEN) {
    log.error('NPM_TOKEN environment variable is not set.');
    process.exit(1);
  }
  if (!process.env.GITHUB_TOKEN) {
    log.error('GITHUB_TOKEN environment variable is not set.');
    process.exit(1);
  }

  const { Octokit } = await import('@octokit/rest');

  const ghToken = getEnvDestroy('GITHUB_TOKEN') || '';

  const release = new Release({
    repo,
    owner: author,
    ghToken,
    pkgVersion: version,
    prBranch: process.env.PR_BRANCH,
    octokit: new Octokit({ auth: ghToken })
  });

  await release.publish();

  const { tagName, releaseBranch } = await release.createReleaseBranch();

  const prNumber = await release.createReleasePR(tagName, releaseBranch);

  await release.autoMergePR(prNumber);

  await release.checkedPR(prNumber, releaseBranch);

  log.success('Release successfully');
}

main();
