import { Release } from '../lib/Release.js';
import { searchEnv } from './search-env.js';

function setupRelease(release) {
  const env = searchEnv({
    logger: release.log
  });

  if (env.get('RELEASE') === 'false') {
    release.log.warn('Skip Release');
    process.exit(0);
  }

  if (!env.get('NPM_TOKEN')) {
    release.log.error('NPM_TOKEN environment variable is not set.');
    process.exit(1);
  }
  if (!env.get('GITHUB_TOKEN')) {
    release.log.error('GITHUB_TOKEN environment variable is not set.');
    process.exit(1);
  }

  release.ghToken = env.get('GITHUB_TOKEN') || '';
  release.npmToken = env.get('NPM_TOKEN');
  release.branch = env.get('PR_BRANCH');
  release.env = env.get('NODE_ENV');
}

/**
 * @returns {Promise<void>}
 */
export async function release(options) {
  const release = new Release(options);

  release.log.log('Publishing to NPM and GitHub...');

  setupRelease(release);

  release.log.info('Release options', release);
  return;

  await release.releaseIt();

  release.log.success('Release successfully');
}
